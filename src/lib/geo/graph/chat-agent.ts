/**
 * Unified GEO chat agent (LangGraph)
 * - Planner graph: intent detection and argument extraction
 * - Execution graph: analyze / optimize / chat reply in one flow
 */

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";
import type { RunnableConfig } from "@langchain/core/runnables";
import type { UIMessage } from "ai";
import { getToolName, isToolUIPart } from "ai";
import {
  callAIChat,
  callAIChatStream,
  getDefaultProvider,
  type ChatMessage,
} from "@/lib/ai";
import { getLangGraphCheckpointer } from "./checkpointer";
import { runAnalysis } from "./nodes/analyze";
import { runOptimization } from "./nodes/optimize";
import { GEO_SYSTEM_PROMPT } from "./prompts";
import type { AnalysisResult } from "./state";

export type ChatAgentIntent = "analyze" | "optimize" | "chat";

export interface ChatAgentPlan {
  intent: ChatAgentIntent;
  reason: string;
  analyzeInput?: { content: string; inputType: "url" | "text" };
  optimizeInput?: { strategy: string; content: string };
  assistantReply?: string;
}

export type GeoAgentExecution =
  | {
      kind: "analyze";
      reason: string;
      input: { content: string; inputType: "url" | "text" };
      output: AnalysisResult;
    }
  | {
      kind: "optimize";
      reason: string;
      input: { strategy: string; content: string };
      output: {
        strategy: string;
        changes: string[];
        optimizedContent: string;
      };
    }
  | {
      kind: "chat";
      reason: string;
      text: string;
    };

const ANALYZE_KEYWORDS = [
  "分析",
  "诊断",
  "评分",
  "引用率",
  "analyze",
  "analysis",
  "score",
  "audit",
];

const OPTIMIZE_KEYWORDS = [
  "优化",
  "改写",
  "润色",
  "重写",
  "提升",
  "improve",
  "optimize",
  "rewrite",
  "refine",
];

const STRATEGY_KEYWORDS: Array<{ strategy: string; keywords: string[] }> = [
  { strategy: "cite_sources", keywords: ["引用", "来源", "cite", "source", "citation"] },
  { strategy: "statistics", keywords: ["数据", "统计", "数字", "stat", "data"] },
  { strategy: "quotations", keywords: ["观点", "专家", "引述", "quote", "quotation"] },
  { strategy: "fluency", keywords: ["流畅", "可读", "fluency", "readability"] },
  { strategy: "authoritative", keywords: ["权威", "专业", "authoritative", "authority"] },
  { strategy: "technical_terms", keywords: ["结构", "术语", "标题", "列表", "technical", "structure"] },
  { strategy: "credibility", keywords: ["可信", "信任", "credibility"] },
  { strategy: "unique_words", keywords: ["新鲜", "词汇", "多样", "unique words", "vocabulary"] },
  {
    strategy: "easy_to_understand",
    keywords: ["易懂", "易理解", "通俗", "简单", "easy to understand", "understand"],
  },
];

const URL_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;

function clampText(text: string, max = 6000): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
}

function safeSerialize(value: unknown, max = 3000): string {
  try {
    if (typeof value === "string") return clampText(value, max);
    return clampText(JSON.stringify(value), max);
  } catch {
    return "[unserializable]";
  }
}

function normalizeLocale(locale: string): "zh" | "en" {
  return locale === "en" ? "en" : "zh";
}

function normalizeRole(role: string): ChatMessage["role"] {
  if (role === "system" || role === "assistant" || role === "user") {
    return role;
  }
  return "assistant";
}

function isTextPart(part: unknown): part is { type: "text"; text: string } {
  if (!part || typeof part !== "object") return false;
  const candidate = part as { type?: unknown; text?: unknown };
  return candidate.type === "text" && typeof candidate.text === "string";
}

function toPartsArray(message: UIMessage): unknown[] {
  return Array.isArray(message.parts) ? message.parts : [];
}

function extractText(message: UIMessage): string {
  const chunks: string[] = [];
  for (const part of toPartsArray(message)) {
    if (isTextPart(part) && part.text.trim()) {
      chunks.push(part.text);
    }
  }
  return chunks.join("\n").trim();
}

function latestUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      const text = extractText(messages[i]);
      if (text) return text;
    }
  }
  return "";
}

function recentLongUserText(messages: UIMessage[], minLength = 60): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== "user") continue;
    const text = extractText(messages[i]);
    if (text.length >= minLength) return text;
  }
  return "";
}

function findStrategy(text: string): string | undefined {
  const lowered = text.toLowerCase();
  for (const item of STRATEGY_KEYWORDS) {
    if (item.keywords.some((kw) => lowered.includes(kw.toLowerCase()))) {
      return item.strategy;
    }
  }
  return undefined;
}

function extractUrl(text: string): string | undefined {
  const match = text.match(URL_PATTERN);
  return match?.[0];
}

function extractOptimizeContent(text: string): string | undefined {
  const codeBlock = text.match(/```[\w-]*\n([\s\S]*?)```/);
  if (codeBlock?.[1]?.trim()) return codeBlock[1].trim();

  const named = text.match(/(?:内容|文本|原文|content)\s*[：:]\s*([\s\S]+)/i);
  if (named?.[1]?.trim()) return named[1].trim();

  const lineSplit = text.split("\n");
  if (lineSplit.length > 1) {
    const tail = lineSplit.slice(1).join("\n").trim();
    if (tail.length > 20) return tail;
  }

  return undefined;
}

function extractOptimizeInstructionHint(text: string): string {
  const match = text.match(/^([\s\S]*?)(?:内容|文本|原文|content)\s*[：:]/i);
  if (match?.[1]?.trim()) return match[1].trim();

  const lines = text.split("\n");
  if (lines.length > 1) return lines[0].trim();
  return text.trim();
}

function hasAnyKeyword(text: string, words: string[]): boolean {
  const lowered = text.toLowerCase();
  return words.some((word) => lowered.includes(word.toLowerCase()));
}

function missingAnalyzeReply(locale: "zh" | "en"): string {
  return locale === "zh"
    ? "请提供要分析的 URL 或较完整的文本内容（建议 50 字以上），我会给你完整的 GEO 评分和改进建议。"
    : "Please share a URL or a fuller text sample (ideally 50+ chars), and I will provide a full GEO analysis with actionable suggestions.";
}

function missingOptimizeReply(locale: "zh" | "en"): string {
  return locale === "zh"
    ? "请贴出要优化的原文内容，并告诉我你想重点优化的维度（如可读性、引用来源、统计数据）。"
    : "Please provide the original text and tell me which optimization dimension to focus on (e.g. readability, sources, statistics).";
}

function chatFallbackReply(locale: "zh" | "en"): string {
  return locale === "zh"
    ? "我已准备好继续。你可以让我分析 URL、评估文本，或按某个 GEO 维度优化内容。"
    : "I'm ready to continue. Ask me to analyze a URL, evaluate text quality, or optimize content for a GEO dimension.";
}

function chatErrorReply(locale: "zh" | "en"): string {
  return locale === "zh"
    ? "当前对话模型暂时不可用。你可以继续让我执行分析或优化任务。"
    : "The chat model is temporarily unavailable. You can still ask me to run analysis or optimization tasks.";
}

function localeOutputRule(locale: "zh" | "en"): string {
  return locale === "zh"
    ? "语言规则（强制）：无论用户使用什么语言提问，你都必须只用简体中文回答。不要切换到英文。"
    : "Language rule (strict): always answer in English, even if the user writes in another language.";
}

export async function* streamGeoChatReply(
  messages: UIMessage[],
  locale: string
): AsyncGenerator<string> {
  const normalizedLocale = normalizeLocale(locale);
  const provider = getDefaultProvider();

  if (!provider) {
    yield chatFallbackReply(normalizedLocale);
    return;
  }

  const sanitized = sanitizeMessagesForModel(messages);
  if (sanitized.length === 0) {
    yield chatFallbackReply(normalizedLocale);
    return;
  }

  const systemPrompt = `${
    normalizedLocale === "en" ? GEO_SYSTEM_PROMPT.en : GEO_SYSTEM_PROMPT.zh
  }\n\n${localeOutputRule(normalizedLocale)}`;

  try {
    let emitted = false;
    for await (const delta of callAIChatStream(
      [{ role: "system", content: systemPrompt }, ...sanitized],
      {
        provider,
        temperature: 0.35,
        maxTokens: 1200,
      }
    )) {
      if (!delta) continue;
      emitted = true;
      yield delta;
    }

    if (!emitted) {
      yield chatFallbackReply(normalizedLocale);
    }
  } catch (error) {
    console.error("[geo-agent:chat:stream]", error);
    yield chatErrorReply(normalizedLocale);
  }
}

function sanitizeMessagesForModel(messages: UIMessage[]): ChatMessage[] {
  const recent = messages.slice(-30);
  const sanitized: ChatMessage[] = [];

  for (const message of recent) {
    const chunks: string[] = [];

    for (const part of toPartsArray(message)) {
      if (isTextPart(part) && part.text.trim()) {
        chunks.push(clampText(part.text));
        continue;
      }

      // Convert tool parts into compact text context.
      const maybeToolPart = part as Parameters<typeof isToolUIPart>[0];
      if (isToolUIPart(maybeToolPart)) {
        const toolName = getToolName(maybeToolPart);
        const record = maybeToolPart as Record<string, unknown>;
        const state = typeof record.state === "string" ? record.state : "";
        const input = record.input;
        const output = record.output;

        if (state === "output-available" && output !== undefined && output !== null) {
          chunks.push(`[Tool ${toolName} result]\n${safeSerialize(output)}`);
          continue;
        }
        if (state === "output-error") {
          chunks.push(`[Tool ${toolName} error]\n${safeSerialize(output ?? input)}`);
          continue;
        }
        if (state.startsWith("input") && input !== undefined) {
          chunks.push(`[Tool ${toolName} called]\n${safeSerialize(input, 1200)}`);
        }
      }
    }

    const text = chunks.join("\n\n").trim();
    if (!text) continue;

    sanitized.push({
      role: normalizeRole(message.role),
      content: text,
    });
  }

  return sanitized;
}

const ChatAgentState = Annotation.Root({
  messages: Annotation<UIMessage[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  locale: Annotation<"zh" | "en">({
    reducer: (_, y) => y,
    default: () => "zh",
  }),
  latestText: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  recentLongText: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  detectedIntent: Annotation<ChatAgentIntent>({
    reducer: (_, y) => y,
    default: () => "chat",
  }),
  detectedUrl: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  detectedStrategy: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  extractedOptimizeContent: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  rememberedContent: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  rememberedStrategy: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  plan: Annotation<ChatAgentPlan | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
  execution: Annotation<GeoAgentExecution | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
});

type ChatAgentStateType = typeof ChatAgentState.State;

async function gatherContextNode(
  state: ChatAgentStateType
): Promise<Partial<ChatAgentStateType>> {
  const latestText = latestUserText(state.messages);
  const recentLongText = recentLongUserText(state.messages);
  const detectedUrl = extractUrl(latestText) ?? "";
  const detectedStrategy =
    findStrategy(extractOptimizeInstructionHint(latestText)) ??
    findStrategy(latestText) ??
    "";
  const extractedOptimizeContent = extractOptimizeContent(latestText) ?? "";
  const rememberCandidate =
    extractedOptimizeContent ||
    (latestText.length >= 80 && !detectedUrl ? latestText.trim() : "");
  const rememberedContent = rememberCandidate || state.rememberedContent;
  const rememberedStrategy = detectedStrategy || state.rememberedStrategy;

  return {
    locale: normalizeLocale(state.locale),
    latestText,
    recentLongText,
    detectedUrl,
    detectedStrategy,
    extractedOptimizeContent,
    rememberedContent,
    rememberedStrategy,
  };
}

async function detectIntentNode(
  state: ChatAgentStateType
): Promise<Partial<ChatAgentStateType>> {
  const text = state.latestText;
  const hasUrl = !!state.detectedUrl;
  const wantsOptimize = hasAnyKeyword(text, OPTIMIZE_KEYWORDS);
  const wantsAnalyze = hasAnyKeyword(text, ANALYZE_KEYWORDS);

  let detectedIntent: ChatAgentIntent = "chat";
  if (hasUrl) detectedIntent = "analyze";
  else if (wantsOptimize) detectedIntent = "optimize";
  else if (wantsAnalyze) detectedIntent = "analyze";

  return { detectedIntent };
}

async function buildAnalyzePlanNode(
  state: ChatAgentStateType
): Promise<Partial<ChatAgentStateType>> {
  if (state.detectedUrl) {
    return {
      plan: {
        intent: "analyze",
        reason: "url-detected",
        analyzeInput: { content: state.detectedUrl, inputType: "url" },
      },
    };
  }

  const text = state.latestText.trim();
  if (text.length >= 50) {
    return {
      plan: {
        intent: "analyze",
        reason: "long-text-detected",
        analyzeInput: { content: text, inputType: "text" },
      },
    };
  }

  return {
    plan: {
      intent: "chat",
      reason: "analyze-input-missing",
      assistantReply: missingAnalyzeReply(state.locale),
    },
  };
}

async function buildOptimizePlanNode(
  state: ChatAgentStateType
): Promise<Partial<ChatAgentStateType>> {
  const strategy = state.detectedStrategy || state.rememberedStrategy || "fluency";
  const content =
    state.extractedOptimizeContent ||
    (state.latestText.length >= 80 ? state.latestText : state.recentLongText) ||
    state.rememberedContent;

  if (!content || content.trim().length < 20) {
    return {
      plan: {
        intent: "chat",
        reason: "optimize-content-missing",
        assistantReply: missingOptimizeReply(state.locale),
      },
    };
  }

  return {
    plan: {
      intent: "optimize",
      reason: "optimize-request-detected",
      optimizeInput: { strategy, content: content.trim() },
    },
  };
}

async function buildChatPlanNode(
  state: ChatAgentStateType
): Promise<Partial<ChatAgentStateType>> {
  return {
    plan: {
      intent: "chat",
      reason: "general-chat",
      assistantReply: state.plan?.assistantReply,
    },
  };
}

async function dispatchNode(): Promise<Partial<ChatAgentStateType>> {
  return {};
}

async function executeAnalyzeNode(
  state: ChatAgentStateType
): Promise<Partial<ChatAgentStateType>> {
  const plan = state.plan;
  if (!plan?.analyzeInput) {
    return {
      execution: {
        kind: "chat",
        reason: plan?.reason ?? "analyze-input-missing",
        text: missingAnalyzeReply(state.locale),
      },
    };
  }

  const output = await runAnalysis(
    plan.analyzeInput.content,
    plan.analyzeInput.inputType,
    state.locale
  );

  return {
    execution: {
      kind: "analyze",
      reason: plan.reason,
      input: plan.analyzeInput,
      output,
    },
  };
}

async function executeOptimizeNode(
  state: ChatAgentStateType
): Promise<Partial<ChatAgentStateType>> {
  const plan = state.plan;
  if (!plan?.optimizeInput) {
    return {
      execution: {
        kind: "chat",
        reason: plan?.reason ?? "optimize-input-missing",
        text: missingOptimizeReply(state.locale),
      },
    };
  }

  const result = await runOptimization(
    plan.optimizeInput.strategy,
    plan.optimizeInput.content,
    state.locale
  );

  return {
    execution: {
      kind: "optimize",
      reason: plan.reason,
      input: plan.optimizeInput,
      output: {
        strategy: result.strategy,
        changes: result.changes,
        optimizedContent: result.optimizedContent,
      },
    },
  };
}

async function executeChatNode(
  state: ChatAgentStateType
): Promise<Partial<ChatAgentStateType>> {
  const plan = state.plan;

  if (plan?.assistantReply?.trim()) {
    return {
      execution: {
        kind: "chat",
        reason: plan.reason,
        text: plan.assistantReply.trim(),
      },
    };
  }

  const provider = getDefaultProvider();
  if (!provider) {
    return {
      execution: {
        kind: "chat",
        reason: plan?.reason ?? "chat-provider-missing",
        text: chatFallbackReply(state.locale),
      },
    };
  }

  const sanitized = sanitizeMessagesForModel(state.messages);
  if (sanitized.length === 0) {
    return {
      execution: {
        kind: "chat",
        reason: plan?.reason ?? "chat-empty-messages",
        text: chatFallbackReply(state.locale),
      },
    };
  }

  try {
    const systemPrompt = `${
      state.locale === "en" ? GEO_SYSTEM_PROMPT.en : GEO_SYSTEM_PROMPT.zh
    }\n\n${localeOutputRule(state.locale)}`;
    const responses = await callAIChat(
      [{ role: "system", content: systemPrompt }, ...sanitized],
      {
        provider,
        temperature: 0.35,
        maxTokens: 1200,
      }
    );

    const text = responses[0]?.text?.trim();
    return {
      execution: {
        kind: "chat",
        reason: plan?.reason ?? "general-chat",
        text: text || chatFallbackReply(state.locale),
      },
    };
  } catch (error) {
    console.error("[geo-agent:chat]", error);
    return {
      execution: {
        kind: "chat",
        reason: plan?.reason ?? "chat-error",
        text: chatErrorReply(state.locale),
      },
    };
  }
}

function buildPlannerGraph(checkpointer: BaseCheckpointSaver) {
  return new StateGraph(ChatAgentState)
    .addNode("gather_context", gatherContextNode)
    .addNode("detect_intent", detectIntentNode)
    .addNode("build_analyze_plan", buildAnalyzePlanNode)
    .addNode("build_optimize_plan", buildOptimizePlanNode)
    .addNode("build_chat_plan", buildChatPlanNode)
    .addEdge(START, "gather_context")
    .addEdge("gather_context", "detect_intent")
    .addConditionalEdges(
      "detect_intent",
      (state) => {
        if (state.detectedIntent === "analyze") return "build_analyze_plan";
        if (state.detectedIntent === "optimize") return "build_optimize_plan";
        return "build_chat_plan";
      },
      ["build_analyze_plan", "build_optimize_plan", "build_chat_plan"]
    )
    .addEdge("build_analyze_plan", END)
    .addEdge("build_optimize_plan", END)
    .addEdge("build_chat_plan", END)
    .compile({
      name: "geo-chat-agent-planner",
      checkpointer,
    });
}

function buildExecutionGraph(checkpointer: BaseCheckpointSaver) {
  return new StateGraph(ChatAgentState)
    .addNode("gather_context", gatherContextNode)
    .addNode("detect_intent", detectIntentNode)
    .addNode("build_analyze_plan", buildAnalyzePlanNode)
    .addNode("build_optimize_plan", buildOptimizePlanNode)
    .addNode("build_chat_plan", buildChatPlanNode)
    .addNode("dispatch", dispatchNode)
    .addNode("execute_analyze", executeAnalyzeNode)
    .addNode("execute_optimize", executeOptimizeNode)
    .addNode("execute_chat", executeChatNode)
    .addEdge(START, "gather_context")
    .addEdge("gather_context", "detect_intent")
    .addConditionalEdges(
      "detect_intent",
      (state) => {
        if (state.detectedIntent === "analyze") return "build_analyze_plan";
        if (state.detectedIntent === "optimize") return "build_optimize_plan";
        return "build_chat_plan";
      },
      ["build_analyze_plan", "build_optimize_plan", "build_chat_plan"]
    )
    .addEdge("build_analyze_plan", "dispatch")
    .addEdge("build_optimize_plan", "dispatch")
    .addEdge("build_chat_plan", "dispatch")
    .addConditionalEdges(
      "dispatch",
      (state) => {
        if (state.plan?.intent === "analyze" && state.plan.analyzeInput) return "execute_analyze";
        if (state.plan?.intent === "optimize" && state.plan.optimizeInput) return "execute_optimize";
        return "execute_chat";
      },
      ["execute_analyze", "execute_optimize", "execute_chat"]
    )
    .addEdge("execute_analyze", END)
    .addEdge("execute_optimize", END)
    .addEdge("execute_chat", END)
    .compile({
      name: "geo-chat-agent-execution",
      checkpointer,
    });
}

function buildInvokeConfig(threadId?: string, checkpointNs = "geo-chat-agent"): RunnableConfig | undefined {
  if (!threadId) return undefined;
  return {
    configurable: {
      thread_id: threadId,
      checkpoint_ns: checkpointNs,
    },
  };
}

let plannerGraphPromise: Promise<ReturnType<typeof buildPlannerGraph>> | null = null;
let executionGraphPromise: Promise<ReturnType<typeof buildExecutionGraph>> | null = null;

async function getPlannerGraph(): Promise<ReturnType<typeof buildPlannerGraph>> {
  if (!plannerGraphPromise) {
    plannerGraphPromise = (async () => {
      const checkpointer = await getLangGraphCheckpointer();
      return buildPlannerGraph(checkpointer);
    })();
  }
  return plannerGraphPromise;
}

async function getExecutionGraph(): Promise<ReturnType<typeof buildExecutionGraph>> {
  if (!executionGraphPromise) {
    executionGraphPromise = (async () => {
      const checkpointer = await getLangGraphCheckpointer();
      return buildExecutionGraph(checkpointer);
    })();
  }
  return executionGraphPromise;
}

export async function runChatAgentPlan(
  messages: UIMessage[],
  locale: string,
  threadId?: string
): Promise<ChatAgentPlan> {
  const graph = await getPlannerGraph();
  const finalState = await graph.invoke(
    {
      messages,
      locale: normalizeLocale(locale),
    },
    buildInvokeConfig(threadId, "geo-chat-agent-plan")
  );

  return (
    finalState.plan ?? {
      intent: "chat",
      reason: "fallback",
    }
  );
}

export async function runGeoAgent(
  messages: UIMessage[],
  locale: string,
  threadId?: string
): Promise<GeoAgentExecution> {
  const graph = await getExecutionGraph();
  const finalState = await graph.invoke(
    {
      messages,
      locale: normalizeLocale(locale),
    },
    buildInvokeConfig(threadId, "geo-chat-agent")
  );

  if (finalState.execution) {
    return finalState.execution;
  }

  if (finalState.plan?.assistantReply?.trim()) {
    return {
      kind: "chat",
      reason: finalState.plan.reason,
      text: finalState.plan.assistantReply.trim(),
    };
  }

  return {
    kind: "chat",
    reason: "fallback",
    text: chatFallbackReply(normalizeLocale(locale)),
  };
}
