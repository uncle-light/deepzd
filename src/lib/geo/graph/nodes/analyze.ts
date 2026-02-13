/**
 * Analyze node — LangGraph-orchestrated GEO analysis workflow
 * Uses a compiled StateGraph for deterministic routing (url vs text)
 */

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { AnalysisResult } from "../state";
import { extractDomain } from "../../domain/citation-parser";
import { analyzeGeoStrategies } from "../../domain/strategy-analyzer";
import { generateQueries } from "../../infrastructure/query-generator";
import { fetchUrlContent } from "../../infrastructure/url-fetcher";
import {
  getAvailableEngines,
  verifyQuery,
  aggregateCompetitors,
  generateVerificationSuggestions,
} from "../../infrastructure/search-engine-verifier";
import {
  calculateContentStats,
} from "../../application/shared";
import { CONTENT_LIMITS } from "../../../constants";

/**
 * Detect if content is a URL
 */
function isUrl(content: string): boolean {
  const trimmed = content.trim();
  return /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed);
}

const URL_CANDIDATE_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;
const DOMAIN_CANDIDATE_PATTERN =
  /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s]*)?/i;
const SEARCH_PORTAL_HOST_PATTERNS = [
  /(^|\.)baidu\.com$/i,
  /(^|\.)google\.[a-z.]+$/i,
  /(^|\.)bing\.com$/i,
  /(^|\.)so\.com$/i,
  /(^|\.)sogou\.com$/i,
  /(^|\.)yahoo\.[a-z.]+$/i,
  /(^|\.)duckduckgo\.com$/i,
];

function extractUrlCandidate(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (isUrl(trimmed)) return trimUrlToken(trimmed);

  const urlMatch = trimmed.match(URL_CANDIDATE_PATTERN);
  if (urlMatch?.[0]) return trimUrlToken(urlMatch[0]);

  const domainMatch = trimmed.match(DOMAIN_CANDIDATE_PATTERN);
  if (domainMatch?.[0] && !domainMatch[0].includes("@")) {
    return trimUrlToken(domainMatch[0]);
  }

  return undefined;
}

function normalizeUrlCandidate(raw: string): string {
  const candidate = extractUrlCandidate(raw);
  if (!candidate) {
    throw new Error("Invalid URL");
  }
  return /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
}

function trimUrlToken(value: string): string {
  return value.replace(/[)\],.!?;:]+$/, "");
}

function isLikelySearchPortal(hostname: string): boolean {
  return SEARCH_PORTAL_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function isRootLikePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

function likelyBlockedOrNonArticleContent(text: string): boolean {
  const compact = text.toLowerCase();
  return (
    compact.includes("captcha") ||
    compact.includes("verify") ||
    compact.includes("robot") ||
    compact.includes("人机验证") ||
    compact.includes("访问验证") ||
    compact.includes("安全验证") ||
    compact.includes("请完成验证") ||
    compact.includes("百度一下")
  );
}

function formatUrlInsufficientContentMessage(
  locale: string,
  url: string,
  contentLength: number
): string {
  if (locale === "en") {
    return `Unable to extract enough article text from this URL (${contentLength} chars). This page may be homepage/search/captcha/login-only or dynamically rendered. Try a specific public article URL, or paste the full text directly. URL: ${url}`;
  }
  return `无法从该链接提取足够正文（仅 ${contentLength} 字）。该页面可能是首页/搜索页/验证码页/登录页，或依赖动态渲染。请改用可公开访问的具体文章链接，或直接粘贴正文文本。链接：${url}`;
}

function formatUrlNeedArticleMessage(locale: string, url: string): string {
  if (locale === "en") {
    return `This URL appears to be a search/home portal, not a specific article page. Please provide a concrete public article URL, or paste the full text directly. URL: ${url}`;
  }
  return `该链接更像搜索/门户首页，不是具体文章页。请提供可公开访问的具体文章链接，或直接粘贴正文文本。链接：${url}`;
}

function normalizeUrlFetchError(error: unknown, locale: string, url: string): Error {
  const message = error instanceof Error ? error.message : String(error ?? "");

  if (message.startsWith("Failed to fetch URL: 403")) {
    return new Error(
      locale === "en"
        ? `URL fetch blocked by target site (403). Try another public article URL, or paste text directly. URL: ${url}`
        : `目标站点拒绝抓取（403）。请换一个可公开访问的文章链接，或直接粘贴正文文本。链接：${url}`
    );
  }
  if (message.startsWith("Failed to fetch URL: 4")) {
    return new Error(
      locale === "en"
        ? `URL is not publicly accessible (${message.replace("Failed to fetch URL: ", "HTTP ")}). Please verify the link or paste text directly. URL: ${url}`
        : `链接当前不可公开访问（${message.replace("Failed to fetch URL: ", "HTTP ")}）。请检查链接，或直接粘贴正文文本。链接：${url}`
    );
  }
  if (
    message === "URL fetch timed out" ||
    message === "Hostname resolution failed" ||
    message === "Too many redirects"
  ) {
    return new Error(
      locale === "en"
        ? `Unable to fetch URL content (${message}). Please try another link or paste text directly. URL: ${url}`
        : `无法抓取该链接内容（${message}）。请尝试其他链接，或直接粘贴正文文本。链接：${url}`
    );
  }
  if (
    message === "Invalid URL" ||
    message === "Only http/https URLs are allowed" ||
    message.includes("not allowed")
  ) {
    return new Error(
      locale === "en"
        ? `Invalid or restricted URL. Please provide a public http/https URL. URL: ${url}`
        : `链接无效或受限。请提供可公开访问的 http/https 链接。链接：${url}`
    );
  }

  return new Error(
    locale === "en"
      ? `Failed to fetch URL content. Please try another link or paste text directly. URL: ${url}`
      : `抓取链接内容失败。请尝试其他链接，或直接粘贴正文文本。链接：${url}`
  );
}

/**
 * Run URL verification analysis
 */
async function analyzeUrl(
  url: string,
  content: string,
  locale: string
): Promise<AnalysisResult> {
  const userDomain = extractDomain(url);

  // Generate queries
  const { queries, topic } = await generateQueries(content, locale);

  // Get available engines
  const engines = getAvailableEngines();
  if (engines.length === 0) {
    throw new Error(
      locale === "zh"
        ? "没有可用的 AI 搜索引擎，请检查 API 配置"
        : "No AI search engines available"
    );
  }

  // Verify all queries in parallel
  const queryResults = await Promise.all(
    queries.map((q) => verifyQuery(q.query, q.type, userDomain, locale, engines))
  );

  // Aggregate results
  const topCompetitors = aggregateCompetitors(queryResults);
  const totalCited = queryResults.filter((r) => r.citationRate > 0).length;
  const overallCitationRate =
    queries.length > 0 ? totalCited / queries.length : 0;

  // Strategy analysis
  const strategyAnalysis = analyzeGeoStrategies(content, locale);
  const suggestions = generateVerificationSuggestions(
    overallCitationRate,
    topCompetitors,
    strategyAnalysis.topWeaknesses.map((w) => ({
      label: w.label,
      suggestions: w.suggestions,
    })),
    locale
  );

  return {
    mode: "url_verification",
    score: Math.round(overallCitationRate * 100),
    topic,
    contentStats: calculateContentStats(content),
    strategyScores: strategyAnalysis.scores.map((s) => ({
      strategy: s.strategy,
      score: s.score,
      label: s.label,
      description: s.description,
      suggestions: s.suggestions,
    })),
    suggestions,
    userUrl: url,
    userDomain,
    overallCitationRate,
    queryResults,
    topCompetitors,
  };
}

/**
 * Run text quality analysis
 */
async function analyzeText(
  content: string,
  locale: string
): Promise<AnalysisResult> {
  // Generate topic
  const { topic } = await generateQueries(content, locale);

  // Strategy analysis (pure local, no API calls)
  const strategyAnalysis = analyzeGeoStrategies(content, locale);
  const contentStats = calculateContentStats(content);

  const suggestions: string[] = [];
  suggestions.push(
    `**${locale === "zh" ? "内容优化建议" : "Optimization Suggestions"}**`,
    ""
  );
  for (const w of strategyAnalysis.topWeaknesses) {
    if (w.suggestions.length > 0) {
      suggestions.push(`- **${w.label}**：${w.suggestions.join("；")}`);
    }
  }

  return {
    mode: "text_quality",
    score: strategyAnalysis.overallScore,
    topic,
    contentStats,
    strategyScores: strategyAnalysis.scores.map((s) => ({
      strategy: s.strategy,
      score: s.score,
      label: s.label,
      description: s.description,
      suggestions: s.suggestions,
    })),
    suggestions,
  };
}

const AnalysisWorkflowState = Annotation.Root({
  rawInput: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  requestedInputType: Annotation<"url" | "text">({
    reducer: (_, y) => y,
    default: () => "text",
  }),
  resolvedInputType: Annotation<"url" | "text">({
    reducer: (_, y) => y,
    default: () => "text",
  }),
  locale: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "zh",
  }),
  normalizedUrl: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  preparedContent: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  result: Annotation<AnalysisResult | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
});

type AnalysisWorkflowStateType = typeof AnalysisWorkflowState.State;

async function prepareInputNode(
  state: AnalysisWorkflowStateType
): Promise<Partial<AnalysisWorkflowStateType>> {
  const normalizedLocale = state.locale === "en" ? "en" : "zh";
  const raw = state.rawInput.trim();

  if (state.requestedInputType === "url" || isUrl(raw)) {
    const normalizedUrl = normalizeUrlCandidate(raw);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      throw normalizeUrlFetchError(new Error("Invalid URL"), normalizedLocale, normalizedUrl);
    }

    if (
      isLikelySearchPortal(parsedUrl.hostname) &&
      isRootLikePath(parsedUrl.pathname) &&
      !parsedUrl.search
    ) {
      throw new Error(formatUrlNeedArticleMessage(normalizedLocale, parsedUrl.toString()));
    }

    let pageContent = "";
    try {
      pageContent = await fetchUrlContent(normalizedUrl);
    } catch (error) {
      throw normalizeUrlFetchError(error, normalizedLocale, normalizedUrl);
    }

    if (pageContent.length < CONTENT_LIMITS.MIN_LENGTH) {
      // Distinguish URL-mode extraction failures from text-mode short-content validation.
      // This gives users concrete next actions instead of a generic "content too short" error.
      if (likelyBlockedOrNonArticleContent(pageContent)) {
        throw new Error(
          formatUrlInsufficientContentMessage(
            normalizedLocale,
            normalizedUrl,
            pageContent.length
          )
        );
      }
      throw new Error(
        formatUrlInsufficientContentMessage(
          normalizedLocale,
          normalizedUrl,
          pageContent.length
        )
      );
    }

    return {
      locale: normalizedLocale,
      resolvedInputType: "url",
      normalizedUrl,
      preparedContent: pageContent,
    };
  }

  if (raw.length < CONTENT_LIMITS.MIN_LENGTH) {
    throw new Error(
      normalizedLocale === "zh"
        ? `内容过短（最少 ${CONTENT_LIMITS.MIN_LENGTH} 字）`
        : `Content too short (minimum ${CONTENT_LIMITS.MIN_LENGTH} characters)`
    );
  }
  if (raw.length > CONTENT_LIMITS.MAX_LENGTH) {
    throw new Error(
      normalizedLocale === "zh"
        ? `内容过长（最多 ${CONTENT_LIMITS.MAX_LENGTH} 字）`
        : `Content too long (maximum ${CONTENT_LIMITS.MAX_LENGTH} characters)`
    );
  }

  return {
    locale: normalizedLocale,
    resolvedInputType: "text",
    normalizedUrl: "",
    preparedContent: raw,
  };
}

async function analyzeUrlNode(
  state: AnalysisWorkflowStateType
): Promise<Partial<AnalysisWorkflowStateType>> {
  const result = await analyzeUrl(
    state.normalizedUrl,
    state.preparedContent,
    state.locale
  );
  return { result };
}

async function analyzeTextNode(
  state: AnalysisWorkflowStateType
): Promise<Partial<AnalysisWorkflowStateType>> {
  const result = await analyzeText(state.preparedContent, state.locale);
  return { result };
}

const analysisGraph = new StateGraph(AnalysisWorkflowState)
  .addNode("prepare_input", prepareInputNode)
  .addNode("run_url_analysis", analyzeUrlNode)
  .addNode("run_text_analysis", analyzeTextNode)
  .addEdge(START, "prepare_input")
  .addConditionalEdges(
    "prepare_input",
    (state) => state.resolvedInputType === "url" ? "run_url_analysis" : "run_text_analysis",
    ["run_url_analysis", "run_text_analysis"]
  )
  .addEdge("run_url_analysis", END)
  .addEdge("run_text_analysis", END)
  .compile({ name: "geo-analysis-workflow" });

/**
 * Main analyze function — entry point for the analyzeContent tool
 */
export async function runAnalysis(
  content: string,
  inputType: "url" | "text",
  locale: string = "zh"
): Promise<AnalysisResult> {
  const finalState = await analysisGraph.invoke({
    rawInput: content,
    requestedInputType: inputType,
    locale,
  });

  if (!finalState.result) {
    throw new Error(
      locale === "zh"
        ? "分析失败：未生成有效结果"
        : "Analysis failed: no valid result produced"
    );
  }

  return finalState.result;
}
