// 그룹 리더보드 테이블 컴포넌트
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
    <div className="w-full overflow-x-auto">
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
  );
}
