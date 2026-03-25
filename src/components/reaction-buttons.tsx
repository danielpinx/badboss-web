// 리액션 버튼 컴포넌트 (Optimistic Update + 파티클 애니메이션)
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ThumbsUp, Flame, Skull, Rocket, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReaction } from "@/hooks/use-reactions";
import type { ReactionType, ReactionCounts } from "@/lib/types";
import { cn } from "@/lib/shadcn-utils";

/** 리액션 아이콘 맵 */
const REACTION_ICONS = {
  like: ThumbsUp,
  fire: Flame,
  skull: Skull,
  rocket: Rocket,
  brain: Brain,
} as const;

/** 리액션 색상 맵 */
const REACTION_COLORS: Record<ReactionType, string> = {
  like: "text-neon-cyan hover:text-neon-cyan",
  fire: "text-orange-500 hover:text-orange-400",
  skull: "text-gray-400 hover:text-gray-300",
  rocket: "text-neon-purple hover:text-neon-purple",
  brain: "text-pink-500 hover:text-pink-400",
};

/** 리액션 타입 배열 (컴포넌트 외부에서 한 번만 생성) */
const REACTION_TYPES: ReactionType[] = [
  "like",
  "fire",
  "skull",
  "rocket",
  "brain",
];

interface ReactionButtonsProps {
  /** 대상 에이전트의 그룹명 */
  group: string;
  /** 대상 에이전트명 */
  agentName: string;
  /** 현재 리액션 카운트 */
  reactions: ReactionCounts;
  /** 크기 */
  size?: "sm" | "md";
}

/**
 * 5개 리액션 버튼을 렌더링한다.
 * 클릭 시 Optimistic Update로 카운트가 즉시 반영되고,
 * 파티클 CSS 애니메이션이 재생된다.
 *
 * useRef로 최신 reactions를 참조하여 stale closure 문제를 방지한다.
 */
export function ReactionButtons({
  group,
  agentName,
  reactions: initialReactions,
  size = "sm",
}: ReactionButtonsProps) {
  const [reactions, setReactions] = useState<ReactionCounts>(initialReactions);
  const [particles, setParticles] = useState<
    { id: number; type: ReactionType }[]
  >([]);
  const { sendReaction } = useReaction();

  // 최신 reactions를 ref로 유지 (stale closure 방지)
  const reactionsRef = useRef(reactions);
  reactionsRef.current = reactions;

  // 서버 데이터 변경 시 동기화
  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);

  /** 리액션 클릭 핸들러 */
  const handleClick = useCallback(
    async (type: ReactionType) => {
      const current = reactionsRef.current;

      // Optimistic Update: 즉시 카운트 증가
      const optimistic: ReactionCounts = {
        ...current,
        [type]: current[type] + 1,
      };
      setReactions(optimistic);

      // 파티클 애니메이션 트리거
      const particleId = Date.now();
      setParticles((prev) => [...prev, { id: particleId, type }]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 800);

      // API 호출 (실패 시 sendReaction 내부에서 롤백)
      const result = await sendReaction(group, agentName, type, current);
      setReactions(result);
    },
    [group, agentName, sendReaction]
  );

  return (
    <div className="flex items-center gap-1 relative">
      {REACTION_TYPES.map((type) => {
        const Icon = REACTION_ICONS[type];
        const count = reactions[type];
        const iconSize = size === "sm" ? 14 : 18;

        return (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className={cn(
              "relative px-1.5 py-1 h-auto gap-1",
              REACTION_COLORS[type],
              "hover:bg-white/5 transition-all duration-200"
            )}
            onClick={() => handleClick(type)}
            title={type}
          >
            <Icon size={iconSize} />
            <span className="text-[10px] font-mono tabular-nums">
              {count}
            </span>
          </Button>
        );
      })}

      {/* 파티클 애니메이션 레이어 */}
      {particles.map((particle) => {
        const Icon = REACTION_ICONS[particle.type];
        return (
          <span
            key={particle.id}
            className="absolute animate-particle-up pointer-events-none"
            style={{ left: "50%", bottom: "100%" }}
          >
            <Icon size={16} className={REACTION_COLORS[particle.type]} />
          </span>
        );
      })}
    </div>
  );
}
