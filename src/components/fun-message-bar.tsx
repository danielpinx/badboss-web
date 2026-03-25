// 유머 시스템 메시지 바 컴포넌트
"use client";

import { useState, useEffect } from "react";
import { FUN_MESSAGES, FUN_MESSAGE_INTERVAL } from "@/lib/constants";

/**
 * 페이지 상단에 유머 메시지를 10초마다 랜덤 교체하여 표시한다.
 * 터미널 스타일 ("> " 프리픽스) + fade-in 트랜지션.
 */
export function FunMessageBar() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      // 페이드 아웃
      setFade(false);

      setTimeout(() => {
        // 새 메시지 선택 (이전과 다른 인덱스)
        setMessageIndex((prev) => {
          let next: number;
          do {
            next = Math.floor(Math.random() * FUN_MESSAGES.length);
          } while (next === prev && FUN_MESSAGES.length > 1);
          return next;
        });
        // 페이드 인
        setFade(true);
      }, 300);
    }, FUN_MESSAGE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full py-3 px-4 bg-cyber-surface/50 border border-cyber-border rounded-lg my-4">
      <p
        className={`font-mono text-sm md:text-base text-neon-cyan transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-neon-purple mr-2">&gt;</span>
        <span className="text-neon-cyan/80">[ SYSTEM ]</span>{" "}
        {FUN_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
