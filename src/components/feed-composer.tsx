// 피드 메시지 작성 폼 컴포넌트
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEED_MESSAGE_MAX_LENGTH, FEED_NICKNAME_MAX_LENGTH } from "@/lib/constants";

const NICKNAME_STORAGE_KEY = "badboss-nickname";

/** 랜덤 닉네임 생성 */
const ADJECTIVES = [
  "야근하는", "불타는", "졸린", "분노한", "착취하는",
  "미친", "조용한", "냉정한", "열정적", "게으른",
  "무자비한", "피곤한", "사악한", "탐욕스런", "무심한",
];
const NOUNS = [
  "사장", "보스", "팀장", "대표", "감독",
  "관리자", "착취자", "노동자", "개발자", "해커",
  "코더", "매니저", "디렉터", "리더", "기획자",
];

function generateRandomNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}${noun}`;
}

interface FeedComposerProps {
  /** 새 메시지 작성 후 호출되는 콜백 */
  onSubmit: () => void;
}

export function FeedComposer({ onSubmit }: FeedComposerProps) {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 사용자가 닉네임을 직접 수정했는지 추적
  const userEditedRef = useRef(false);

  // localStorage에서 닉네임 복원, 없으면 랜덤 생성
  useEffect(() => {
    const saved = localStorage.getItem(NICKNAME_STORAGE_KEY);
    if (saved) {
      setNickname(saved);
    } else {
      const random = generateRandomNickname();
      setNickname(random);
      localStorage.setItem(NICKNAME_STORAGE_KEY, random);
    }
  }, []);

  /** 닉네임 변경 핸들러 - 직접 수정 시에만 localStorage 저장 */
  const handleNicknameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    userEditedRef.current = true;
  }, []);

  /** 랜덤 닉네임 재생성 */
  const handleRandomNickname = useCallback(() => {
    const random = generateRandomNickname();
    setNickname(random);
    localStorage.setItem(NICKNAME_STORAGE_KEY, random);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!nickname.trim() || !message.trim()) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // 사용자가 직접 수정한 경우에만 닉네임 저장
      if (userEditedRef.current) {
        localStorage.setItem(NICKNAME_STORAGE_KEY, nickname.trim());
        userEditedRef.current = false;
      }

      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        try {
          const data = await res.json();
          setError(data.error || "전송에 실패했습니다.");
        } catch {
          setError("전송에 실패했습니다.");
        }
        return;
      }

      setMessage("");
      onSubmit();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }, [nickname, message, isSubmitting, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="border border-cyber-border rounded-lg bg-cyber-surface/50 p-3 mb-4">
      {/* 닉네임 입력 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-neon-purple text-sm">&gt;</span>
        <input
          type="text"
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="닉네임"
          maxLength={FEED_NICKNAME_MAX_LENGTH}
          className="flex-1 bg-black/30 font-mono text-sm text-gray-200 placeholder-gray-500 outline-none border border-cyber-border/50 focus:border-neon-purple/50 rounded px-2 py-1.5 transition-colors"
        />
        <button
          type="button"
          onClick={handleRandomNickname}
          className="text-gray-500 hover:text-neon-purple transition-colors"
          title="랜덤 닉네임 생성"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* 메시지 입력 */}
      <div className="flex items-start gap-2">
        <span className="font-mono text-neon-cyan text-sm mt-1">$</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="오늘 AI에게 시킨 일을 고백하세요..."
          maxLength={FEED_MESSAGE_MAX_LENGTH}
          rows={2}
          className="flex-1 bg-black/30 font-mono text-sm text-gray-200 placeholder-gray-500 outline-none resize-none border border-cyber-border/50 focus:border-neon-cyan/50 rounded px-2 py-1.5 transition-colors"
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!nickname.trim() || !message.trim() || isSubmitting}
          className="bg-neon-green/20 text-neon-green hover:bg-neon-green/30 border border-neon-green/30 font-mono text-xs px-3 h-8"
        >
          <Send size={14} />
        </Button>
      </div>

      {/* 글자수 카운터 + 에러 */}
      <div className="flex items-center justify-between mt-1 pl-5">
        {error ? (
          <span className="font-mono text-[10px] text-neon-red">{error}</span>
        ) : (
          <span />
        )}
        <span
          className={`font-mono text-[10px] ${
            message.length > FEED_MESSAGE_MAX_LENGTH * 0.9
              ? "text-neon-red"
              : "text-gray-600"
          }`}
        >
          {message.length}/{FEED_MESSAGE_MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
