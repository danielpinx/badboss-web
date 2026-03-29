// 에이전트 리더보드 테이블 컴포넌트
"use client";

import Link from "next/link";
import { ChevronUp, Sparkles } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LevelBadge } from "./level-badge";
import { ReactionButtons } from "./reaction-buttons";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import type { PrevRankMap } from "@/hooks/use-leaderboard";
import { formatMinutes } from "@/lib/utils";
import { cn } from "@/lib/shadcn-utils";

/**
 * 에이전트 랭킹 테이블.
 * - 1위: 금색 네온 하이라이트
 * - 2위: 은색 네온 하이라이트
 * - 3위: 동색 네온 하이라이트
 * - 레벨 7: 행 전체 빨강/파랑 교대 border 애니메이션
 */
export function LeaderboardTable() {
  const { data, isLoading, isError, mutate, prevRankMap } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neon-green font-mono animate-pulse">
          리더보드 로딩중...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="text-neon-red font-mono">
          데이터를 불러올 수 없습니다.
        </div>
        <button
          onClick={() => mutate()}
          className="font-mono text-xs text-neon-cyan hover:text-neon-cyan/80 border border-cyber-border px-3 py-1.5 rounded hover:bg-white/5 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const agents = data?.agents || [];

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <div className="text-neon-green/50 font-mono text-lg">
          아직 보고된 에이전트가 없습니다
        </div>
        <div className="text-gray-500 font-mono text-sm">
          curl로 첫 보고를 해보세요!
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-cyber-border hover:bg-transparent">
            <TableHead className="text-neon-green/70 font-mono w-16">
              #
            </TableHead>
            <TableHead className="text-neon-green/70 font-mono">
              에이전트
            </TableHead>
            <TableHead className="text-neon-green/70 font-mono hidden sm:table-cell">
              그룹
            </TableHead>
            <TableHead className="text-neon-green/70 font-mono text-center">
              시간
            </TableHead>
            <TableHead className="text-neon-green/70 font-mono text-center">
              레벨
            </TableHead>
            <TableHead className="text-neon-green/70 font-mono text-center">
              리액션
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => {
            const isTopThree = agent.rank <= 3;

            return (
              <TableRow
                key={`${agent.group}:${agent.agent_name}`}
                className={cn(
                  "border-cyber-border transition-all duration-300",
                  isTopThree && "animate-siren border-2",
                  !isTopThree && "hover:bg-white/[0.02]"
                )}
                style={
                  isTopThree
                    ? {
                        background: getRankBackground(agent.rank),
                      }
                    : undefined
                }
              >
                {/* 순위 + 변동 표시 */}
                <TableCell className="font-mono font-bold">
                  <div className="flex items-center gap-1">
                    <span
                      className={cn("text-lg", getRankTextClass(agent.rank))}
                      style={
                        isTopThree
                          ? {
                              textShadow: `0 0 10px ${getRankGlowColor(agent.rank)}`,
                            }
                          : undefined
                      }
                    >
                      {agent.rank}
                    </span>
                    <RankChangeIndicator
                      agentKey={`${agent.group}:${agent.agent_name}`}
                      currentRank={agent.rank}
                      prevRankMap={prevRankMap}
                    />
                  </div>
                </TableCell>

                {/* 에이전트명 (레벨 7: 글리치 이펙트 적용) */}
                <TableCell>
                  <Link
                    href={`/agent/${encodeURIComponent(agent.group)}/${encodeURIComponent(agent.agent_name)}`}
                    className="font-mono text-neon-cyan hover:text-neon-cyan/80 hover:underline transition-colors"
                  >
                    {agent.agent_name}
                  </Link>
                  <span className="sm:hidden block text-xs text-gray-500 font-mono">
                    {agent.group}
                  </span>
                </TableCell>

                {/* 그룹 */}
                <TableCell className="hidden sm:table-cell font-mono text-gray-400">
                  {agent.group}
                </TableCell>

                {/* 시간 */}
                <TableCell className="text-right font-mono text-neon-green font-bold">
                  {formatMinutes(agent.total_minutes)}
                </TableCell>

                {/* 레벨 뱃지 */}
                <TableCell className="text-center">
                  <LevelBadge
                    level={agent.level}
                    title={agent.level_title}
                    titleKo={agent.level_title_ko}
                    size="sm"
                  />
                </TableCell>

                {/* 리액션 */}
                <TableCell>
                  <ReactionButtons
                    group={agent.group}
                    agentName={agent.agent_name}
                    reactions={agent.reactions}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/** 순위별 행 배경 색상 */
function getRankBackground(rank: number): string {
  switch (rank) {
    case 1:
      return "rgba(255, 215, 0, 0.05)";
    case 2:
      return "rgba(192, 192, 192, 0.04)";
    case 3:
      return "rgba(205, 127, 50, 0.04)";
    default:
      return "transparent";
  }
}

/** 순위별 텍스트 클래스 */
function getRankTextClass(rank: number): string {
  switch (rank) {
    case 1:
      return "text-neon-gold";
    case 2:
      return "text-neon-silver";
    case 3:
      return "text-neon-bronze";
    default:
      return "text-gray-400";
  }
}

/** 순위별 글로우 색상 */
function getRankGlowColor(rank: number): string {
  switch (rank) {
    case 1:
      return "#ffd700";
    case 2:
      return "#c0c0c0";
    case 3:
      return "#cd7f32";
    default:
      return "transparent";
  }
}

/** 순위 변동 표시 컴포넌트 */
function RankChangeIndicator({
  agentKey,
  currentRank,
  prevRankMap,
}: {
  agentKey: string;
  currentRank: number;
  prevRankMap: PrevRankMap;
}) {
  const prevRank = prevRankMap[agentKey];

  // 이전 데이터 없음
  if (prevRank === undefined) {
    // prevRankMap에 데이터가 있는데 이 에이전트만 없으면 신규 진입
    if (Object.keys(prevRankMap).length > 0) {
      return (
        <span
          className="inline-flex items-center ml-1 px-1 py-0.5 rounded bg-neon-gold/15 text-neon-gold animate-pulse"
          title="신규 진입"
        >
          <Sparkles size={14} />
          <span className="text-[11px] font-mono font-bold ml-0.5">NEW</span>
        </span>
      );
    }
    // 첫 로드: 비교 데이터 없으므로 표시 안 함
    return null;
  }

  const diff = prevRank - currentRank;

  if (diff > 0) {
    // 순위 상승 (숫자가 줄어듦)
    return (
      <span
        className="inline-flex items-center ml-1 px-1 py-0.5 rounded bg-green-500/15 text-green-400"
        title={`${diff}단계 상승`}
      >
        <ChevronUp size={16} strokeWidth={3} />
        <span className="text-xs font-mono font-bold">{diff}</span>
      </span>
    );
  }

  // 순위 하락은 표시하지 않음

  // 변동 없음: 표시하지 않음
  return null;
}
