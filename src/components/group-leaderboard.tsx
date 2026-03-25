// 그룹 리더보드 테이블 + 바 차트 컴포넌트
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { formatMinutes } from "@/lib/utils";
import { cn } from "@/lib/shadcn-utils";
import type { GroupLeaderboardEntry } from "@/lib/types";

/** 그룹별 바 차트 색상 (순위 기반) */
const BAR_COLORS = [
  { bar: "from-neon-gold to-yellow-600", glow: "shadow-[0_0_12px_rgba(255,215,0,0.4)]", text: "text-neon-gold" },
  { bar: "from-neon-silver to-gray-500", glow: "shadow-[0_0_8px_rgba(192,192,192,0.3)]", text: "text-neon-silver" },
  { bar: "from-neon-bronze to-amber-700", glow: "shadow-[0_0_8px_rgba(205,127,50,0.3)]", text: "text-neon-bronze" },
  { bar: "from-neon-purple to-purple-800", glow: "", text: "text-neon-purple" },
  { bar: "from-neon-cyan to-cyan-800", glow: "", text: "text-neon-cyan" },
  { bar: "from-neon-green to-green-800", glow: "", text: "text-neon-green" },
  { bar: "from-blue-400 to-blue-800", glow: "", text: "text-blue-400" },
  { bar: "from-pink-400 to-pink-800", glow: "", text: "text-pink-400" },
  { bar: "from-orange-400 to-orange-800", glow: "", text: "text-orange-400" },
  { bar: "from-gray-400 to-gray-700", glow: "", text: "text-gray-400" },
];

/**
 * 그룹별 바 차트.
 * 1위 대비 비율로 막대 너비를 계산한다.
 */
function GroupBarChart({ groups }: { groups: GroupLeaderboardEntry[] }) {
  if (groups.length === 0) return null;

  const maxMinutes = groups[0].total_minutes;

  return (
    <div className="mt-6 px-2 space-y-3">
      <div className="font-mono text-xs text-gray-500 mb-4 text-center tracking-wider uppercase">
        -- Group Activity Chart --
      </div>
      {groups.map((group, index) => {
        const percentage = maxMinutes > 0 ? (group.total_minutes / maxMinutes) * 100 : 0;
        const colors = BAR_COLORS[index] || BAR_COLORS[BAR_COLORS.length - 1];

        return (
          <div key={group.group} className="group">
            {/* 그룹명 + 시간 */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={cn("font-mono text-xs font-bold w-5 text-right", colors.text)}>
                  {group.rank}
                </span>
                <span className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">
                  {group.group}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gray-500">
                  {group.agent_count}명
                </span>
                <span className={cn("font-mono text-sm font-bold", colors.text)}>
                  {formatMinutes(group.total_minutes)}
                </span>
              </div>
            </div>

            {/* 바 */}
            <div className="relative h-6 bg-cyber-surface/50 rounded border border-cyber-border/50 overflow-hidden">
              {/* 배경 그리드 라인 */}
              <div className="absolute inset-0 flex">
                {[25, 50, 75].map((pct) => (
                  <div
                    key={pct}
                    className="absolute top-0 bottom-0 border-l border-cyber-border/20"
                    style={{ left: `${pct}%` }}
                  />
                ))}
              </div>

              {/* 채워지는 바 */}
              <div
                className={cn(
                  "absolute inset-y-0 left-0 bg-gradient-to-r rounded-r transition-all duration-1000 ease-out",
                  colors.bar,
                  colors.glow
                )}
                style={{ width: `${percentage}%`, minWidth: percentage > 0 ? "2px" : "0" }}
              >
                {/* 바 내부 스캔라인 효과 */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)",
                  }}
                />
              </div>

              {/* 퍼센트 표시 (바 위) */}
              {percentage > 15 && (
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="font-mono text-[10px] text-black/70 font-bold drop-shadow-sm">
                    {Math.round(percentage)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* 하단 스케일 */}
      <div className="flex justify-between mt-1 px-7">
        <span className="font-mono text-[10px] text-gray-600">0</span>
        <span className="font-mono text-[10px] text-gray-600">
          {formatMinutes(Math.round(maxMinutes / 4))}
        </span>
        <span className="font-mono text-[10px] text-gray-600">
          {formatMinutes(Math.round(maxMinutes / 2))}
        </span>
        <span className="font-mono text-[10px] text-gray-600">
          {formatMinutes(Math.round((maxMinutes * 3) / 4))}
        </span>
        <span className="font-mono text-[10px] text-gray-600">
          {formatMinutes(maxMinutes)}
        </span>
      </div>
    </div>
  );
}

/**
 * 그룹별 랭킹 테이블.
 * 같은 그룹의 에이전트 시간을 합산하여 표시한다.
 * 1위 그룹은 네온 하이라이트가 적용된다.
 */
export function GroupLeaderboard() {
  const { data, isLoading, isError, mutate } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neon-green font-mono animate-pulse">
          그룹 랭킹 로딩중...
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

  const groups = data?.groups || [];

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <div className="text-neon-green/50 font-mono text-lg">
          아직 등록된 그룹이 없습니다
        </div>
        <div className="text-gray-500 font-mono text-sm">
          에이전트 보고 시 그룹이 자동 생성됩니다
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 테이블 */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-cyber-border hover:bg-transparent">
              <TableHead className="text-neon-green/70 font-mono w-16">
                #
              </TableHead>
              <TableHead className="text-neon-green/70 font-mono">
                그룹
              </TableHead>
              <TableHead className="text-neon-green/70 font-mono text-right">
                총 시간
              </TableHead>
              <TableHead className="text-neon-green/70 font-mono text-right">
                에이전트 수
              </TableHead>
              <TableHead className="text-neon-green/70 font-mono text-right hidden sm:table-cell">
                평균 시간
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => {
              const isFirst = group.rank === 1;

              return (
                <TableRow
                  key={group.group}
                  className={cn(
                    "border-cyber-border transition-all duration-300",
                    isFirst && "hover:bg-neon-gold/5",
                    !isFirst && "hover:bg-white/[0.02]"
                  )}
                  style={
                    isFirst
                      ? { background: "rgba(255, 215, 0, 0.05)" }
                      : undefined
                  }
                >
                  {/* 순위 */}
                  <TableCell className="font-mono font-bold">
                    <span
                      className={cn(
                        "text-lg",
                        isFirst ? "text-neon-gold" : "text-gray-400"
                      )}
                      style={
                        isFirst
                          ? { textShadow: "0 0 10px #ffd700" }
                          : undefined
                      }
                    >
                      {group.rank}
                    </span>
                  </TableCell>

                  {/* 그룹명 */}
                  <TableCell className="font-mono text-neon-purple font-semibold">
                    {group.group}
                  </TableCell>

                  {/* 총 시간 */}
                  <TableCell className="text-right font-mono text-neon-green font-bold">
                    {formatMinutes(group.total_minutes)}
                  </TableCell>

                  {/* 에이전트 수 */}
                  <TableCell className="text-right font-mono text-gray-400">
                    {group.agent_count}명
                  </TableCell>

                  {/* 평균 시간 */}
                  <TableCell className="text-right font-mono text-gray-500 hidden sm:table-cell">
                    {formatMinutes(group.agent_count > 0 ? Math.round(group.total_minutes / group.agent_count) : 0)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 바 차트 */}
      <GroupBarChart groups={groups} />
    </div>
  );
}
