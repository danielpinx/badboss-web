// 피드 아이템 카드 컴포넌트
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Terminal, Bot, AlertTriangle, ThumbsUp, Flame, Skull, Rocket, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/level-badge";
import { useReaction } from "@/hooks/use-reactions";
import type { FeedItem as FeedItemType, ReactionType, ReactionCounts } from "@/lib/types";
import { cn } from "@/lib/shadcn-utils";

/** 타입별 아이콘 맵 */
const TYPE_ICONS = {
  user: Terminal,
  agent: Bot,
  system: AlertTriangle,
} as const;

/** 타입별 테두리 색상 */
const TYPE_BORDER_COLORS = {
  user: "border-neon-cyan/30",
  agent: "border-neon-green/30",
  system: "border-neon-red/30",
} as const;

/** 타입별 아이콘 색상 */
const TYPE_ICON_COLORS = {
  user: "text-neon-cyan",
  agent: "text-neon-green",
  system: "text-neon-red",
} as const;

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

const REACTION_TYPES: ReactionType[] = ["like", "fire", "brain"];

interface FeedItemProps {
  item: FeedItemType;
}

/** 상대 시간 포맷 (예: "3분 전", "2시간 전") */
function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function FeedItem({ item }: FeedItemProps) {
  const TypeIcon = TYPE_ICONS[item.type];
  const [reactions, setReactions] = useState<ReactionCounts>(item.reactions);
  const [particles, setParticles] = useState<{ id: number; type: ReactionType }[]>([]);
  const reactionsRef = useRef(reactions);
  const { sendFeedReaction } = useReaction();

  reactionsRef.current = reactions;

  useEffect(() => {
    setReactions(item.reactions);
  }, [item.reactions]);

  const handleClick = useCallback(
    async (type: ReactionType) => {
      const current = reactionsRef.current;
      const optimistic: ReactionCounts = { ...current, [type]: current[type] + 1 };
      setReactions(optimistic);

      const particleId = Math.random();
      setParticles((prev) => [...prev, { id: particleId, type }]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 800);

      const result = await sendFeedReaction(item.id, type, current);
      setReactions(result);
    },
    [item.id, sendFeedReaction]
  );

  return (
    <div
      className={cn(
        "border rounded-lg bg-cyber-surface/50 p-3 transition-all duration-200",
        TYPE_BORDER_COLORS[item.type],
        item.type === "system" && "animate-pulse-slow bg-neon-red/5"
      )}
    >
      {/* 헤더: 아이콘 + 닉네임 + 레벨 + 시간 */}
      <div className="flex items-center gap-2 mb-2">
        <TypeIcon size={16} className={TYPE_ICON_COLORS[item.type]} />
        <span className="font-mono text-sm text-gray-200 font-semibold">
          {item.nickname}
        </span>
        {item.type !== "system" && item.level > 0 && (
          <LevelBadge
            level={item.level}
            title=""
            titleKo={item.level_title_ko}
            size="sm"
          />
        )}
        {item.type === "system" && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neon-red/20 text-neon-red">
            SYSTEM
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] text-gray-600">
          {formatRelativeTime(item.created_at)}
        </span>
      </div>

      {/* 메시지 본문 */}
      <p className="font-mono text-sm text-gray-300 mb-3 pl-6">
        {item.message}
      </p>

      {/* 리액션 버튼 */}
      <div className="flex items-center gap-1 pl-6 relative">
        {REACTION_TYPES.map((type) => {
          const Icon = REACTION_ICONS[type];
          const count = reactions[type];
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
              <Icon size={14} />
              <span className="text-[10px] font-mono tabular-nums">{count}</span>
            </Button>
          );
        })}
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
    </div>
  );
}
