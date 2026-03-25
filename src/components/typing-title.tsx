// 타이핑 애니메이션 타이틀 컴포넌트
"use client";

import { useState, useEffect } from "react";

/** 타이핑 애니메이션에 표시할 전체 텍스트 */
const FULL_TEXT = "BADBOSS // 악덕대표";

/**
 * "BADBOSS // 악덕대표" 텍스트를 타이핑 효과로 표시한다.
 * 타이핑 완료 후 글로우 효과로 전환된다.
 */
export function TypingTitle() {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < FULL_TEXT.length) {
        setDisplayText(FULL_TEXT.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <h1
      className={`text-center font-mono text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider ${
        isComplete ? "text-neon-green animate-glow" : "text-neon-green"
      }`}
    >
      <span>{displayText}</span>
      <span
        className={`inline-block w-[3px] h-[1em] ml-1 align-middle ${
          isComplete ? "opacity-0" : "animate-pulse"
        } bg-neon-green`}
      />
    </h1>
  );
}
