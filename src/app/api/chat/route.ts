/**
 * Chat API route — conversational GEO analysis
 * POST /api/chat
 *
 * Runtime behavior:
 * - LangGraph planner decides intent (analyze/optimize/chat)
 * - LangGraph execution graph handles final action
 * - Tool-call events stream to frontend for long-task progress UX
 */

import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import {
  runChatAgentPlan,
  runGeoAgent,
  streamGeoChatReply,
  type GeoAgentExecution,
} from "@/lib/geo/graph";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { checkQuota, incrementUsage } from "@/lib/quota";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

function getThreadTitle(messages: UIMessage[]): string {
  const firstMsg = messages[0];
  const parts = Array.isArray(firstMsg?.parts) ? firstMsg.parts : [];
  const text = parts
    .filter((part): part is { type: "text"; text: string } => {
      return !!part && part.type === "text" && typeof part.text === "string";
    })
    .map((part) => part.text)
    .join("")
    .slice(0, 100);

  return text || "New Chat";
}

function hasUserText(messages: UIMessage[]): boolean {
  for (const message of messages) {
    if (message.role !== "user") continue;
    const parts = Array.isArray(message.parts) ? message.parts : [];
    for (const part of parts) {
      if (part.type === "text" && typeof part.text === "string" && part.text.trim()) {
        return true;
      }
    }
  }
  return false;
}

async function persistThreadMessages(
  userId: string | undefined,
  threadId: string,
  originalMessages: UIMessage[],
  allMessages: UIMessage[]
): Promise<void> {
  if (!userId) return;

  try {
    const supabase = await createClient();
    await supabase.from("chat_threads").upsert(
      {
        id: threadId,
        user_id: userId,
        title: getThreadTitle(originalMessages),
        messages: JSON.stringify(allMessages),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  } catch (err) {
    console.error("[chat:persist]", err);
  }
}

function createToolCallId(): string {
  return `call_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

function createTextId(): string {
  return `text_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

function toErrorText(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function localizedFailure(locale: "zh" | "en", detail?: string): string {
  const base =
    locale === "zh"
      ? "分析失败，请稍后重试"
      : "Analysis failed, please try again";
  if (!detail) return base;
  return `${base}: ${detail}`;
}

/** Fire-and-forget: persist analysis result to analyses table */
async function persistAnalysis(
  userId: string,
  execution: Extract<GeoAgentExecution, { kind: "analyze" }>
): Promise<void> {
  try {
    const supabase = await createClient();
    const { input, output } = execution;

    if (input.inputType === "url") {
      await supabase.from("analyses").insert({
        user_id: userId,
        content_type: "url",
        url: input.content,
        score: Math.round((output.overallCitationRate ?? 0) * 100),
        results: output,
      });
    } else {
      await supabase.from("analyses").insert({
        user_id: userId,
        content_type: "text",
        content: input.content.slice(0, 500),
        score: output.score,
        results: output,
      });
    }
  } catch (err) {
    console.error("[chat:persistAnalysis]", err);
  }
}

// ============================================
// Route handler
// ============================================

export async function POST(request: NextRequest) {
  // Auth check (non-blocking)
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id;
  } catch {
    // Not logged in — continue
  }

  // Rate limiting (prefer user scope, fallback to IP)
  const ip = getClientIp(request);
  const rateKey = userId ? `chat:user:${userId}` : `chat:ip:${ip}`;
  const rateCheck = checkRateLimit(rateKey, RATE_LIMITS.chat);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rateCheck.retryAfterSeconds),
      },
    });
  }

  // Quota check
  if (userId) {
    try {
      const quota = await checkQuota(userId);
      if (!quota.allowed) {
        return new Response(
          JSON.stringify({
            error: "Quota exceeded",
            remaining: 0,
            limit: quota.limit,
            plan: quota.plan,
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      incrementUsage(userId).catch((err) =>
        console.error("[chat:incrementUsage]", err)
      );
    } catch {
      // Quota check failed — allow
    }
  }

  // Parse request
  let payload: { messages?: UIMessage[]; locale?: string; threadId?: string };
  try {
    payload = (await request.json()) as {
      messages?: UIMessage[];
      locale?: string;
      threadId?: string;
    };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(payload.messages)) {
    return new Response(JSON.stringify({ error: "messages must be an array" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = payload.messages;
  const locale: "zh" | "en" = payload.locale === "en" ? "en" : "zh";
  const threadId = payload.threadId || crypto.randomUUID();

  if (!hasUserText(messages)) {
    return new Response(JSON.stringify({ error: "No valid message content" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = createUIMessageStream<UIMessage>({
    originalMessages: messages,
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "start-step" });

      try {
        // Plan first so long-running branches can surface progress immediately.
        const plan = await runChatAgentPlan(messages, locale, threadId);
        console.log("[chat:plan]", {
          intent: plan.intent,
          reason: plan.reason,
          hasAnalyzeInput: !!plan.analyzeInput,
          hasOptimizeInput: !!plan.optimizeInput,
          hasAssistantReply: !!plan.assistantReply,
        });

        if (plan.intent === "analyze" && plan.analyzeInput) {
          const toolCallId = createToolCallId();
          writer.write({
            type: "tool-input-available",
            toolCallId,
            toolName: "analyzeContent",
            input: plan.analyzeInput,
          });

          let execution: Awaited<ReturnType<typeof runGeoAgent>>;
          try {
            execution = await runGeoAgent(messages, locale, threadId);
          } catch (error) {
            writer.write({
              type: "tool-output-error",
              toolCallId,
              errorText: toErrorText(error),
            });
            writer.write({ type: "finish-step" });
            writer.write({ type: "finish", finishReason: "error" });
            return;
          }
          if (execution.kind === "analyze") {
            writer.write({
              type: "tool-output-available",
              toolCallId,
              output: execution.output,
            });
            if (userId) persistAnalysis(userId, execution);
            writer.write({ type: "finish-step" });
            writer.write({ type: "finish", finishReason: "tool-calls" });
            return;
          }

          if (execution.kind === "chat") {
            const textId = createTextId();
            writer.write({ type: "text-start", id: textId });
            writer.write({ type: "text-delta", id: textId, delta: execution.text });
            writer.write({ type: "text-end", id: textId });
            writer.write({ type: "finish-step" });
            writer.write({ type: "finish", finishReason: "stop" });
            return;
          }
        }

        if (plan.intent === "optimize" && plan.optimizeInput) {
          const toolCallId = createToolCallId();
          writer.write({
            type: "tool-input-available",
            toolCallId,
            toolName: "optimizeContent",
            input: plan.optimizeInput,
          });

          let execution: Awaited<ReturnType<typeof runGeoAgent>>;
          try {
            execution = await runGeoAgent(messages, locale, threadId);
          } catch (error) {
            writer.write({
              type: "tool-output-error",
              toolCallId,
              errorText: toErrorText(error),
            });
            writer.write({ type: "finish-step" });
            writer.write({ type: "finish", finishReason: "error" });
            return;
          }
          if (execution.kind === "optimize") {
            writer.write({
              type: "tool-output-available",
              toolCallId,
              output: {
                strategy: execution.output.strategy,
                changes: execution.output.changes,
                optimizedContent: execution.output.optimizedContent.slice(0, 3000),
              },
            });
            writer.write({ type: "finish-step" });
            writer.write({ type: "finish", finishReason: "tool-calls" });
            return;
          }

          if (execution.kind === "chat") {
            const textId = createTextId();
            writer.write({ type: "text-start", id: textId });
            writer.write({ type: "text-delta", id: textId, delta: execution.text });
            writer.write({ type: "text-end", id: textId });
            writer.write({ type: "finish-step" });
            writer.write({ type: "finish", finishReason: "stop" });
            return;
          }
        }

        // Fast-path for planner clarification reply.
        if (plan.intent === "chat" && plan.assistantReply) {
          const textId = createTextId();
          writer.write({ type: "text-start", id: textId });
          writer.write({ type: "text-delta", id: textId, delta: plan.assistantReply });
          writer.write({ type: "text-end", id: textId });
          writer.write({ type: "finish-step" });
          writer.write({ type: "finish", finishReason: "stop" });
          return;
        }

        // General chat path — token streaming text output.
        const textId = createTextId();
        let emitted = false;

        writer.write({ type: "text-start", id: textId });
        for await (const delta of streamGeoChatReply(messages, locale)) {
          if (!delta) continue;
          emitted = true;
          writer.write({ type: "text-delta", id: textId, delta });
        }
        if (!emitted) {
          writer.write({
            type: "text-delta",
            id: textId,
            delta: localizedFailure(locale),
          });
        }
        writer.write({ type: "text-end", id: textId });
        writer.write({ type: "finish-step" });
        writer.write({ type: "finish", finishReason: "stop" });
      } catch (error) {
        console.error("[chat:agent]", error);
        const textId = createTextId();
        writer.write({ type: "text-start", id: textId });
        writer.write({
          type: "text-delta",
          id: textId,
          delta: localizedFailure(locale, toErrorText(error)),
        });
        writer.write({ type: "text-end", id: textId });
        writer.write({ type: "finish-step" });
        writer.write({ type: "finish", finishReason: "error" });
      }
    },
    onFinish: async ({ messages: finalMessages }) => {
      await persistThreadMessages(userId, threadId, messages, finalMessages);
    },
  });

  return createUIMessageStreamResponse({ stream });
}
