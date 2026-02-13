"use client";

/**
 * ChatAnalyze — conversational GEO analysis interface
 * Replaces the old form-based AnalyzePage with a chat-driven experience
 */

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useMemo } from "react";
import { Send, Square, MessageSquarePlus, Sparkles, Bot } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { ChatLabelsProvider } from "./ChatLabelsContext";

interface ChatAnalyzeProps {
  locale: string;
  labels: {
    placeholder: string;
    send: string;
    stop: string;
    thinking: string;
    analyzing: string;
    newChat: string;
    [key: string]: string;
  };
}

export default function ChatAnalyze({ locale, labels }: ChatAnalyzeProps) {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { locale, threadId },
      }),
    [locale, threadId]
  );

  const {
    messages,
    sendMessage,
    status,
    stop,
    setMessages,
    error,
  } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll only when user is near bottom
  const isNearBottomRef = useRef(true);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 120;
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  useEffect(() => {
    if (scrollRef.current && isNearBottomRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Submit message
  function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }

  function resizeTextarea(target: HTMLTextAreaElement) {
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 180)}px`;
  }

  // Handle Enter to submit (Shift+Enter for newline)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape" && isLoading) {
      e.preventDefault();
      stop();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      if (isComposing || e.nativeEvent.isComposing) {
        return;
      }
      e.preventDefault();
      handleSend();
    }
  }

  // New chat — reset thread ID so persistence creates a fresh row
  function handleNewChat() {
    if (isLoading) {
      stop();
    }
    setMessages([]);
    setInput("");
    setThreadId(crypto.randomUUID());
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    inputRef.current?.focus();
  }

  const hasMessages = messages.length > 0;
  const canSend = input.trim().length > 0;

  return (
    /* Nav h-16(4rem) + main p-4(1rem×2) = 6rem; md: p-6(1.5rem×2) = 7rem */
    <div className="flex flex-col h-[calc(100dvh-6rem)] md:h-[calc(100dvh-7rem)] -mx-4 -mb-4 md:-mx-6 md:-mb-6 bg-[var(--background)]">
      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        {!hasMessages ? (
          <EmptyState
            locale={locale}
            labels={labels}
            onSelect={(text) => {
              setInput(text);
              inputRef.current?.focus();
            }}
          />
        ) : (
          <ChatLabelsProvider value={{ ...labels, locale }}>
          <div className="max-w-3xl mx-auto px-4 pt-8 pb-36 md:px-6 md:pb-40 space-y-6">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
              />
            ))}
            {isLoading &&
              messages[messages.length - 1]?.role === "user" && (
                <div className="mt-6 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gray-400)] animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gray-400)] animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gray-400)] animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
          </div>
          </ChatLabelsProvider>
        )}
      </div>

      {/* Input area — ChatGPT-like floating composer */}
      <div
        className="shrink-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent px-4 pt-1 md:px-6"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {labels.chatError ||
                (locale === "zh"
                  ? "请求失败，请稍后重试"
                  : "Request failed, please try again")}
              {typeof error.message === "string" && error.message.trim()
                ? `: ${error.message}`
                : ""}
            </div>
          )}
          {hasMessages && (
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isLoading}
              className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors disabled:opacity-50"
              title={labels.newChat}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{labels.newChat}</span>
            </button>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] transition-all focus-within:border-[var(--accent)]/55"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                resizeTextarea(e.target);
              }}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={(e) => {
                setIsComposing(false);
                resizeTextarea(e.currentTarget);
              }}
              placeholder={labels.placeholder}
              rows={1}
              className="w-full resize-none overflow-y-auto rounded-3xl bg-transparent px-5 py-3.5 pr-14 text-sm leading-6 text-[var(--foreground)] placeholder:text-[var(--gray-500)] focus:outline-none"
              style={{ maxHeight: "180px", outline: "none", outlineOffset: "0px" }}
            />
            <button
              type={isLoading ? "button" : "submit"}
              onClick={isLoading ? stop : undefined}
              disabled={!isLoading && !canSend}
              aria-label={isLoading ? labels.stop : labels.send}
              className={`absolute right-3 bottom-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed ${
                isLoading || canSend
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "bg-[var(--surface-muted)] text-[var(--gray-500)]"
              }`}
            >
              {isLoading ? (
                <Square className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Empty state with quick action hints */
function EmptyState({
  locale,
  labels,
  onSelect,
}: {
  locale: string;
  labels: Record<string, string>;
  onSelect: (text: string) => void;
}) {
  const examples =
    locale === "zh"
      ? [
          "分析一下 https://example.com 的 GEO 表现",
          "帮我评估这段文本的 AI 友好度",
          "GEO 优化有哪些核心策略？",
          "给我一个提升引用率的内容改写思路",
        ]
      : [
          "Analyze the GEO performance of https://example.com",
          "Evaluate this text for AI-friendliness",
          "What are the core GEO optimization strategies?",
          "How can I rewrite this to improve citation rate?",
        ];

  return (
    <div className="h-full w-full">
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-36 md:px-6 md:pt-24 md:pb-40">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[var(--foreground)] mb-2">
            {labels.emptyTitle || "内容分析与优化"}
          </h2>
          <p className="text-sm md:text-base text-[var(--gray-400)] max-w-2xl mx-auto">
            {labels.emptyDesc ||
              "输入 URL 或文本开始分析与优化，或提问关于 GEO 策略的问题"}
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => onSelect(ex)}
              className="text-left text-sm text-[var(--gray-400)] px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]/60 hover:border-[var(--accent)]/35 hover:bg-[var(--card-bg)] hover:text-[var(--foreground)] transition-all"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
