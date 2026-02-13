/**
 * SSE streaming API for content analysis
 * POST /api/analyze-content/stream
 *
 * Unified with LangGraph runAnalysis pipeline.
 */

import { NextRequest } from "next/server";
import { runAnalysis } from "@/lib/geo/graph";
import type { SSEEvent } from "@/lib/geo/domain/sse-types";
import { CONTENT_LIMITS } from "@/lib/constants";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { checkQuota, incrementUsage } from "@/lib/quota";
import { getDefaultProvider } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface StreamRequestPayload {
  content?: string;
  locale?: string;
  inputType?: "text" | "url";
}

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function resolveModel(provider: string | null): string {
  switch (provider) {
    case "volc":
      return process.env.VOLC_MODEL || "unknown";
    case "glm":
      return process.env.GLM_MODEL || "unknown";
    case "deepseek":
      return process.env.DEEPSEEK_MODEL || "unknown";
    case "qwen":
      return process.env.QWEN_MODEL || "unknown";
    case "openai":
      return process.env.OPENAI_MODEL || "unknown";
    default:
      return "unknown";
  }
}

/** Fire-and-forget: save analysis result for logged-in user */
async function persistAnalysis(userId: string, event: SSEEvent, rawContent: string) {
  try {
    const supabase = await createClient();

    if (event.type === "verification_complete") {
      const d = event.data;
      await supabase.from("analyses").insert({
        user_id: userId,
        content_type: "url",
        url: d.userUrl,
        score: Math.round(d.overallCitationRate * 100),
        results: d,
      });
    } else if (event.type === "quality_complete") {
      const d = event.data;
      await supabase.from("analyses").insert({
        user_id: userId,
        content_type: "text",
        content: rawContent.slice(0, 500),
        score: d.overallQuality,
        results: d,
      });
    }
  } catch (err) {
    console.error("[persistAnalysis] failed:", err);
  }
}

function createInitEvent(rawContent: string, inputType: "text" | "url"): SSEEvent {
  return {
    type: "init",
    timestamp: new Date().toISOString(),
    data: {
      mode: inputType === "url" ? "url_verification" : "text_quality",
      contentStats: {
        charCount: rawContent.length,
        wordCount: rawContent.trim() ? rawContent.trim().split(/\s+/).length : 0,
        sentenceCount: rawContent.split(/[.!?。！？]/).filter((x) => x.trim()).length,
        paragraphCount: rawContent.split(/\n+/).filter((x) => x.trim()).length,
      },
      estimatedSteps: inputType === "url" ? 5 : 4,
      userUrl: inputType === "url" ? rawContent : undefined,
    },
  };
}

function buildSseResponse(
  payload: StreamRequestPayload,
  signal?: AbortSignal,
  userId?: string
): Response {
  const encoder = new TextEncoder();
  const locale = payload.locale === "en" ? "en" : "zh";
  const inputType = payload.inputType === "url" ? "url" : "text";
  const rawContent = (payload.content || "").trim();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const sendEvent = (event: SSEEvent) => {
        if (signal?.aborted || closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      const heartbeat = setInterval(() => {
        if (!closed && !signal?.aborted) {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        }
      }, 15_000);

      const startedAt = Date.now();

      try {
        sendEvent(createInitEvent(rawContent, inputType));

        const result = await runAnalysis(rawContent, inputType, locale);

        const provider = getDefaultProvider();
        const metadata = {
          provider: provider || "unknown",
          model: resolveModel(provider),
          totalDuration: Date.now() - startedAt,
          apiCalls: result.mode === "url_verification" ? (result.queryResults?.length || 0) : 1,
          timestamp: new Date().toISOString(),
        };

        const completeEvent: SSEEvent =
          result.mode === "url_verification"
            ? {
                type: "verification_complete",
                timestamp: metadata.timestamp,
                data: {
                  userUrl: result.userUrl || rawContent,
                  userDomain: result.userDomain || "",
                  overallCitationRate: result.overallCitationRate || 0,
                  queryResults: result.queryResults || [],
                  topic: result.topic,
                  contentStats: result.contentStats,
                  topCompetitors: result.topCompetitors || [],
                  strategyScores: result.strategyScores,
                  suggestions: result.suggestions,
                  metadata,
                },
              }
            : {
                type: "quality_complete",
                timestamp: metadata.timestamp,
                data: {
                  overallQuality: result.score,
                  contentStats: result.contentStats,
                  strategyScores: result.strategyScores,
                  suggestions: result.suggestions,
                  topic: result.topic,
                  metadata,
                },
              };

        sendEvent(completeEvent);

        if (userId) {
          persistAnalysis(userId, completeEvent, rawContent);
        }
      } catch (error) {
        sendEvent({
          type: "error",
          timestamp: new Date().toISOString(),
          data: {
            message: error instanceof Error ? error.message : "Analysis failed",
            code: "STREAM_ERROR",
          },
        });
      } finally {
        clearInterval(heartbeat);
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as StreamRequestPayload;

    const inputType = payload.inputType || "text";
    if (inputType !== "text" && inputType !== "url") {
      return jsonError("inputType must be text or url");
    }

    const rawContent = (payload.content || "").trim();
    if (!rawContent) {
      return jsonError("content is required");
    }

    if (inputType === "text") {
      if (rawContent.length < CONTENT_LIMITS.MIN_LENGTH) {
        return jsonError(`Content too short (minimum ${CONTENT_LIMITS.MIN_LENGTH} characters)`);
      }
      if (rawContent.length > CONTENT_LIMITS.MAX_LENGTH) {
        return jsonError(`Content too long (maximum ${CONTENT_LIMITS.MAX_LENGTH} characters)`);
      }
    }

    // Try to get logged-in user (non-blocking, don't fail if not authenticated)
    let userId: string | undefined;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    } catch {
      // Not logged in or cookie error — continue without persistence
    }

    // Rate limiting (prefer user scope, fallback to IP)
    const ip = getClientIp(request);
    const rateKey = userId ? `analyze:user:${userId}` : `analyze:ip:${ip}`;
    const rateCheck = checkRateLimit(rateKey, RATE_LIMITS.analyze);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateCheck.retryAfterSeconds),
        },
      });
    }

    // Quota check for logged-in users
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
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        // Increment usage before starting analysis
        incrementUsage(userId).catch((err) => console.error("[incrementUsage]", err));
      } catch {
        // Quota check failed — allow analysis to proceed
      }
    }

    return buildSseResponse(payload, request.signal, userId);
  } catch {
    return jsonError("Invalid JSON body");
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(`analyze:ip:${ip}`, RATE_LIMITS.analyze);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rateCheck.retryAfterSeconds),
      },
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const payload: StreamRequestPayload = {
    content: searchParams.get("content") || "",
    locale: searchParams.get("locale") || "zh",
    inputType: (searchParams.get("inputType") as "text" | "url" | null) || "text",
  };

  const inputType = payload.inputType || "text";
  if (inputType !== "text" && inputType !== "url") {
    return jsonError("inputType must be text or url");
  }

  const rawContent = (payload.content || "").trim();
  if (!rawContent) {
    return jsonError("content is required");
  }

  if (inputType === "text") {
    if (rawContent.length < CONTENT_LIMITS.MIN_LENGTH) {
      return jsonError(`Content too short (minimum ${CONTENT_LIMITS.MIN_LENGTH} characters)`);
    }
    if (rawContent.length > CONTENT_LIMITS.MAX_LENGTH) {
      return jsonError(`Content too long (maximum ${CONTENT_LIMITS.MAX_LENGTH} characters)`);
    }
  }

  return buildSseResponse(payload, request.signal);
}
