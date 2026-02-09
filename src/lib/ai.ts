/**
 * AI API unified wrapper (LangChain.js)
 * Supports OpenAI-compatible providers: DeepSeek, Qwen (DashScope), Volcengine Ark, OpenAI
 */

import { ChatOpenAI } from "@langchain/openai";
// Using ChatOpenAI directly instead of BaseChatModel to avoid type instantiation depth issues

export type AIProvider = "deepseek" | "qwen" | "volc" | "glm" | "openai";

// ============================================
// Error Types and Logger
// ============================================

export type AIErrorCode =
  | 'RATE_LIMIT'      // 429 - 限流/余额不足
  | 'AUTH_ERROR'      // 401/403 - 认证失败
  | 'SERVER_ERROR'    // 500+ - 服务器错误
  | 'TIMEOUT'         // 超时
  | 'NETWORK_ERROR'   // 网络错误
  | 'UNKNOWN';        // 未知错误

export interface AIError {
  code: AIErrorCode;
  message: string;
  provider: AIProvider;
  status?: number;
  retryable: boolean;
  raw?: unknown;
}

/** 解析 LangChain/API 错误 */
function parseError(error: unknown, provider: AIProvider): AIError {
  const err = error as { status?: number; code?: string; message?: string; lc_error_code?: string };
  const status = err.status;
  const lcCode = err.lc_error_code;

  // 429 限流/余额不足
  if (status === 429 || lcCode === 'MODEL_RATE_LIMIT') {
    return {
      code: 'RATE_LIMIT',
      message: `[${provider}] 请求限流或余额不足，请检查账户余额`,
      provider,
      status: 429,
      retryable: false, // 余额不足不应重试
      raw: error,
    };
  }

  // 401/403 认证错误
  if (status === 401 || status === 403) {
    return {
      code: 'AUTH_ERROR',
      message: `[${provider}] API Key 无效或权限不足`,
      provider,
      status,
      retryable: false,
      raw: error,
    };
  }

  // 500+ 服务器错误
  if (status && status >= 500) {
    return {
      code: 'SERVER_ERROR',
      message: `[${provider}] 服务器错误 (${status})，请稍后重试`,
      provider,
      status,
      retryable: true,
      raw: error,
    };
  }

  // 超时
  if (err.message?.includes('timeout') || err.code === 'ETIMEDOUT') {
    return {
      code: 'TIMEOUT',
      message: `[${provider}] 请求超时`,
      provider,
      retryable: true,
      raw: error,
    };
  }

  // 网络错误
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return {
      code: 'NETWORK_ERROR',
      message: `[${provider}] 网络连接失败`,
      provider,
      retryable: true,
      raw: error,
    };
  }

  // 未知错误
  return {
    code: 'UNKNOWN',
    message: `[${provider}] ${err.message || '未知错误'}`,
    provider,
    status,
    retryable: false,
    raw: error,
  };
}

/** 日志级别 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 统一日志输出 */
function log(level: LogLevel, tag: string, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [AI:${tag}]`;

  const logData = data ? ` ${JSON.stringify(data)}` : '';

  switch (level) {
    case 'debug':
      console.debug(`${prefix} ${message}${logData}`);
      break;
    case 'info':
      console.log(`${prefix} ${message}${logData}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${message}${logData}`);
      break;
    case 'error':
      console.error(`${prefix} ${message}${logData}`);
      break;
  }
}

export interface AIOptions {
  provider?: AIProvider;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_OPTIONS: Required<AIOptions> = {
  provider: "openai",
  model: "gpt-4o-mini",
  maxTokens: 2048,
  temperature: 0.7,
};

function getProviderConfig(provider: AIProvider): {
  apiKey?: string;
  baseURL?: string;
  defaultModel?: string;
} {
  switch (provider) {
    case "deepseek": {
      let baseURL = process.env.DEEPSEEK_BASE_URL;
      // DeepSeek API requires /v1 suffix
      if (baseURL && !baseURL.endsWith('/v1')) {
        baseURL = baseURL.replace(/\/$/, '') + '/v1';
      }
      return {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL,
        defaultModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      };
    }
    case "qwen":
      return {
        apiKey: process.env.QWEN_API_KEY,
        baseURL: process.env.QWEN_BASE_URL,
        defaultModel: process.env.QWEN_MODEL,
      };
    case "volc":
      return {
        apiKey: process.env.VOLC_API_KEY,
        baseURL: process.env.VOLC_BASE_URL,
        defaultModel: process.env.VOLC_MODEL,
      };
    case "glm":
      return {
        apiKey: process.env.GLM_API_KEY,
        baseURL: process.env.GLM_BASE_URL,
        defaultModel: process.env.GLM_MODEL,
      };
    case "openai":
    default:
      return {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
        defaultModel: process.env.OPENAI_MODEL,
      };
  }
}

interface CreateModelOptions extends Required<AIOptions> {
  useResponsesApi?: boolean;
}

function createModel(opts: CreateModelOptions): ChatOpenAI {
  const { apiKey, baseURL, defaultModel } = getProviderConfig(opts.provider);
  if (!apiKey) {
    const errMsg = `${opts.provider.toUpperCase()}_API_KEY is not set`;
    log('error', 'CONFIG', errMsg);
    throw new Error(errMsg);
  }

  // 当使用非 OpenAI provider 且 model 是全局默认值时，优先使用 provider 的默认模型
  const isDefaultModel = opts.model === DEFAULT_OPTIONS.model;
  const model = (isDefaultModel && defaultModel) ? defaultModel : (opts.model || defaultModel || DEFAULT_OPTIONS.model);

  log('info', 'MODEL', `Creating model`, {
    provider: opts.provider,
    model,
    baseURL,
    useResponsesApi: opts.useResponsesApi
  });

  return new ChatOpenAI({
    apiKey,
    model,
    temperature: opts.temperature,
    maxTokens: opts.maxTokens,
    configuration: baseURL ? { baseURL } : undefined,
    useResponsesApi: opts.useResponsesApi,
  });
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions extends AIOptions {
  n?: number; // Number of completions
  retries?: number; // Max retry attempts
  retryDelay?: number; // Delay between retries (ms)
  tools?: Record<string, unknown>[]; // Tools to bind (web_search, function, etc.)
}

/**
 * Web search annotation from AI response
 */
export interface WebSearchAnnotation {
  type: string;
  url?: string;
  title?: string;
  start_index?: number;
  end_index?: number;
}

/**
 * Chat response with optional annotations
 */
export interface ChatResponse {
  text: string;
  annotations?: WebSearchAnnotation[];
}

/**
 * Call AI API with chat messages (supports multiple completions and tools)
 * Returns ChatResponse[] with text and optional annotations (for web search)
 */
export async function callAIChat(
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<ChatResponse[]> {
  const opts = { ...DEFAULT_OPTIONS, n: 1, retries: 3, retryDelay: 5000, ...options };
  const requestId = Math.random().toString(36).slice(2, 8);

  // 检查是否需要使用 Responses API（当使用 web_search 等内置工具时）
  const hasBuiltInTools = opts.tools?.some(t =>
    t.type === 'web_search' || t.type === 'web_search_preview'
  );

  log('info', 'REQUEST', `[${requestId}] Starting chat request`, {
    provider: opts.provider,
    messageCount: messages.length,
    tools: opts.tools?.map(t => t.type),
    useResponsesApi: hasBuiltInTools,
  });

  // Convert ChatMessage to LangChain format
  const { HumanMessage, SystemMessage, AIMessage } = await import("@langchain/core/messages");
  const langchainMessages = messages.map(m => {
    switch (m.role) {
      case "system": return new SystemMessage(m.content);
      case "assistant": return new AIMessage(m.content);
      default: return new HumanMessage(m.content);
    }
  });

  let model = createModel({ ...opts, useResponsesApi: hasBuiltInTools });

  // Bind tools if provided
  if (opts.tools && opts.tools.length > 0) {
    log('debug', 'TOOLS', `[${requestId}] Binding tools`, { tools: opts.tools.map(t => t.type) });
    model = model.bindTools(opts.tools) as ChatOpenAI;
  }

  const startTime = Date.now();

  for (let attempt = 0; attempt < opts.retries; attempt++) {
    try {
      log('debug', 'INVOKE', `[${requestId}] Attempt ${attempt + 1}/${opts.retries}`);

      const promises = Array.from({ length: opts.n }, () => model.invoke(langchainMessages));
      const responses = await Promise.all(promises);

      const results: ChatResponse[] = responses.map(r => {
        const content = r.content;
        let text = '';
        let annotations: WebSearchAnnotation[] | undefined;

        if (typeof content === 'string') {
          text = content;
        } else if (Array.isArray(content)) {
          // Handle array content (may contain text and annotations)
          for (const item of content) {
            const c = item as { type?: string; text?: string; annotations?: WebSearchAnnotation[] };
            if (c.text) {
              text += c.text;
            }
            if (c.annotations && Array.isArray(c.annotations)) {
              annotations = c.annotations;
            }
          }
        }

        // Also check response-level annotations (火山引擎格式)
        const rawResponse = r as { annotations?: WebSearchAnnotation[] };
        if (rawResponse.annotations && Array.isArray(rawResponse.annotations)) {
          annotations = rawResponse.annotations;
        }

        return { text, annotations };
      });

      const duration = Date.now() - startTime;
      log('info', 'SUCCESS', `[${requestId}] Completed in ${duration}ms`, {
        responseLength: results.reduce((sum, r) => sum + r.text.length, 0),
        hasAnnotations: results.some(r => r.annotations && r.annotations.length > 0),
      });

      return results;
    } catch (error) {
      const aiError = parseError(error, opts.provider);
      const duration = Date.now() - startTime;

      log('error', 'ERROR', `[${requestId}] Attempt ${attempt + 1} failed after ${duration}ms`, {
        code: aiError.code,
        message: aiError.message,
        status: aiError.status,
        retryable: aiError.retryable,
      });

      // 不可重试的错误直接抛出
      if (!aiError.retryable) {
        throw new Error(aiError.message);
      }

      // 最后一次重试失败
      if (attempt >= opts.retries - 1) {
        throw new Error(aiError.message);
      }

      // 等待后重试
      log('warn', 'RETRY', `[${requestId}] Retrying in ${opts.retryDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, opts.retryDelay));
    }
  }

  return [] as ChatResponse[];
}

/**
 * Check availability for providers
 */
export function isAIAvailable(): Record<AIProvider, boolean> {
  return {
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    qwen: !!process.env.QWEN_API_KEY,
    volc: !!process.env.VOLC_API_KEY,
    glm: !!process.env.GLM_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  };
}

/**
 * Get default available provider
 * Priority: VOLC > GLM > DeepSeek > Qwen > OpenAI
 */
export function getDefaultProvider(): AIProvider | null {
  if (process.env.VOLC_API_KEY) return "volc";
  if (process.env.GLM_API_KEY) return "glm";
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";
  if (process.env.QWEN_API_KEY) return "qwen";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

// ============================================
// Web Search Tool Configurations
// ============================================

/**
 * Get web search tool config for different providers
 * 各家 AI 的 web_search 工具配置
 */
export function getWebSearchTool(provider: AIProvider): Record<string, unknown> | null {
  switch (provider) {
    case 'volc':
      // 火山引擎 Volcengine web_search 配置
      return {
        type: 'web_search',
        web_search: {
          enable: true,
          search_result: true,
        }
      };
    case 'glm':
      // 智谱 GLM web_search 配置
      return {
        type: 'web_search',
        web_search: {
          enable: true,
          search_engine: 'search_std',
          search_result: true,
        }
      };
    case 'openai':
      // OpenAI web_search_preview
      return { type: 'web_search_preview' };
    default:
      // DeepSeek, Qwen 等暂不支持内置搜索
      return null;
  }
}

// ============================================
// Native Web Search API (for providers that don't support LangChain bindTools)
// ============================================

/**
 * Call AI with native web search (火山引擎 responses API)
 * 火山引擎的联网搜索使用 /responses 端点，不是 /chat/completions
 */
export async function callAIWithWebSearch(
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<ChatResponse> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { apiKey, baseURL } = getProviderConfig(opts.provider);

  if (!apiKey || !baseURL) {
    throw new Error(`${opts.provider} API not configured`);
  }

  const requestId = Math.random().toString(36).slice(2, 8);

  log('info', 'WEB_SEARCH', `[${requestId}] Starting web search request`, {
    provider: opts.provider,
  });

  // 火山引擎联网搜索使用 responses API
  if (opts.provider === 'volc') {
    return callVolcWebSearch(messages, apiKey, baseURL, requestId);
  }

  // 其他 provider 暂不支持
  throw new Error(`Web search not supported for provider: ${opts.provider}`);
}

/**
 * 火山引擎联网搜索 (使用 responses API)
 */
async function callVolcWebSearch(
  messages: ChatMessage[],
  apiKey: string,
  baseURL: string,
  requestId: string
): Promise<ChatResponse> {
  // 使用支持联网搜索的模型
  const model = process.env.VOLC_WEB_SEARCH_MODEL || 'doubao-seed-1-6-250615';

  // 构建 input 参数（responses API 格式：content 是数组）
  const input = messages.map(m => ({
    role: m.role,
    content: [{ type: 'input_text', text: m.content }]
  }));

  const body = {
    model,
    input,
    tools: [{ type: 'web_search' }],
    // 关闭深度思考功能
    thinking: { type: 'disabled' },
  };

  log('debug', 'WEB_SEARCH', `[${requestId}] Request body`, { model, messageCount: input.length });

  const startTime = Date.now();

  try {
    // 使用 /responses 端点
    const response = await fetch(`${baseURL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;

    log('info', 'WEB_SEARCH', `[${requestId}] Completed in ${duration}ms`);
    log('debug', 'WEB_SEARCH', `[${requestId}] Response keys`, {
      keys: Object.keys(data),
    });

    return parseVolcWebSearchResponse(data, requestId);
  } catch (error) {
    const duration = Date.now() - startTime;
    log('error', 'WEB_SEARCH', `[${requestId}] Failed after ${duration}ms`, {
      error: String(error),
    });
    throw error;
  }
}

/**
 * 解析火山引擎 responses API 的响应
 */
function parseVolcWebSearchResponse(
  data: Record<string, unknown>,
  requestId: string
): ChatResponse {
  let text = '';
  const annotations: WebSearchAnnotation[] = [];

  // 打印完整响应结构用于调试
  log('debug', 'WEB_SEARCH', `[${requestId}] Full response structure`, {
    keys: Object.keys(data),
    outputType: typeof data.output,
    outputIsArray: Array.isArray(data.output),
  });

  // 额外调试:打印每个 output item 的完整结构
  if (Array.isArray(data.output)) {
    log('debug', 'WEB_SEARCH', `[${requestId}] Output items count: ${data.output.length}`);
    data.output.forEach((item: Record<string, unknown>, index: number) => {
      log('debug', 'WEB_SEARCH', `[${requestId}] Output item ${index}`, {
        keys: Object.keys(item),
        hasAnnotations: !!item.annotations,
        annotationsType: typeof item.annotations,
        annotationsLength: Array.isArray(item.annotations) ? item.annotations.length : 'N/A',
      });
    });
  }

  // responses API 返回格式可能是 output 数组
  const output = data.output as Array<{
    type?: string;
    text?: string;
    content?: string | Array<{ type?: string; text?: string }>;
    annotations?: Array<{
      type?: string;
      url?: string;
      title?: string;
      start_index?: number;
      end_index?: number;
    }>;
  }> | undefined;

  if (Array.isArray(output)) {
    for (const item of output) {
      log('debug', 'WEB_SEARCH', `[${requestId}] Output item`, {
        type: item.type,
        hasText: !!item.text,
        contentType: typeof item.content,
        contentIsArray: Array.isArray(item.content),
      });

      // 提取文本 - 处理 content 可能是数组的情况
      if (item.text) {
        text += item.text;
      } else if (item.content) {
        if (typeof item.content === 'string') {
          text += item.content;
        } else if (Array.isArray(item.content)) {
          // content 是数组格式：[{type: 'output_text', text: '...'}]
          for (const c of item.content) {
            if (c.text) {
              text += c.text;
            }
          }
        }
      }

      // 提取 annotations
      if (item.annotations) {
        for (const ann of item.annotations) {
          if (ann.url) {
            annotations.push({
              type: ann.type || 'url_citation',
              url: ann.url,
              title: ann.title,
              start_index: ann.start_index,
              end_index: ann.end_index,
            });
          }
        }
      }
    }
  }

  // 也检查顶层的 text 字段
  if (!text && typeof data.text === 'string') {
    text = data.text;
  }

  // 检查顶层的 content 字段
  if (!text && typeof data.content === 'string') {
    text = data.content;
  }

  log('debug', 'WEB_SEARCH', `[${requestId}] Parsed response`, {
    textLength: text.length,
    annotationCount: annotations.length,
  });

  return {
    text,
    annotations: annotations.length > 0 ? annotations : undefined,
  };
}
