"use client";

/**
 * ChatMessage — renders a single message with mixed content parts
 *
 * AI SDK v6 tool part types:
 * - Static: `tool-${NAME}` (e.g. `tool-analyzeContent`) — name encoded in type
 * - Dynamic: `dynamic-tool` — name in `toolName` property
 *
 * Use `isToolUIPart()` + `getToolName()` helpers to handle both.
 */

import { memo } from "react";
import type { UIMessage } from "ai";
import { isToolUIPart, getToolName } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot } from "lucide-react";
import ToolPart from "./ToolPart";
import { useChatLabels } from "./ChatLabelsContext";
import { extractToolProps } from "./chat-utils";

function ChatMessageInner({ message }: { message: UIMessage }) {
  const labels = useChatLabels();
  const locale = labels.locale || "zh";
  const isUser = message.role === "user";

  return (
    <div className={`w-full ${isUser ? "flex justify-end" : ""}`}>
      {isUser ? (
        <div className="max-w-[85%] rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--foreground)]">
          {message.parts.map((part, i) => {
            if (part.type === "text" && part.text.trim()) {
              return (
                <p key={i} className="whitespace-pre-wrap">
                  {part.text}
                </p>
              );
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (isToolUIPart(part as any)) {
              const partAny = part as Record<string, unknown>;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const name = getToolName(part as any);
              const { state, input, output } = extractToolProps(partAny);
              return (
                <div key={i} className="mt-3">
                  <ToolPart
                    toolName={name}
                    state={state}
                    input={input}
                    output={output}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <div className="w-full flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[var(--surface-muted)] text-[var(--foreground)] flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            {(() => {
              const rendered = message.parts.map((part, i) => {
                if (part.type === "text" && part.text.trim()) {
                  return (
                    <div
                      key={i}
                      className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-1 prose-strong:text-[var(--foreground)] text-[var(--foreground)]"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {part.text}
                      </ReactMarkdown>
                    </div>
                  );
                }

                const partAny = part as Record<string, unknown>;
                if (partAny.type === "error") {
                  const text =
                    (typeof partAny.errorText === "string" && partAny.errorText) ||
                    (locale === "zh"
                      ? "分析请求失败，请稍后重试"
                      : "Analysis request failed, please try again");
                  return (
                    <div
                      key={i}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                    >
                      {text}
                    </div>
                  );
                }

                // Tool parts — handles both `tool-${NAME}` and `dynamic-tool`
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (isToolUIPart(part as any)) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const name = getToolName(part as any);
                  const { state, input, output } = extractToolProps(partAny);
                  return (
                    <div key={i} className="w-full pt-1">
                      <ToolPart
                        toolName={name}
                        state={state}
                        input={input}
                        output={output}
                      />
                    </div>
                  );
                }

                // Skip step-start, source-url, and other non-renderable parts
                return null;
              });

              // If no part produced visible content, show typing indicator
              const hasVisible = rendered.some((el) => el !== null);
              if (!hasVisible) {
                return (
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gray-400)] animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gray-400)] animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gray-400)] animate-bounce [animation-delay:300ms]" />
                  </div>
                );
              }
              return rendered;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

const ChatMessage = memo(ChatMessageInner);
export default ChatMessage;
