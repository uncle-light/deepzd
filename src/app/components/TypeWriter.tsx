"use client";

import { useEffect, useState } from "react";

const phrases = [
  "探索 AI，从这里开始",
  "发现最前沿的 AI 工具",
  "让 AI 成为你的超能力",
  "开启智能新时代",
];

export default function TypeWriter() {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(currentPhrase.slice(0, text.length + 1));
          if (text === currentPhrase) {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          setText(currentPhrase.slice(0, text.length - 1));
          if (text === "") {
            setIsDeleting(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  return (
    <span className="cursor-blink">{text}</span>
  );
}
