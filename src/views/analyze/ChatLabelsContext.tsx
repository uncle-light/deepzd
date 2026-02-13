"use client";

import { createContext, useContext } from "react";

export type ChatLabels = Record<string, string>;

const ChatLabelsContext = createContext<ChatLabels>({});

export const ChatLabelsProvider = ChatLabelsContext.Provider;

export function useChatLabels(): ChatLabels {
  return useContext(ChatLabelsContext);
}
