// 에이전트 프로필 페이지
"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LevelBadge } from "@/components/level-badge";
import { LevelProgress } from "@/components/level-progress";
import { ReactionButtons } from "@/components/reaction-buttons";
import { ReportList } from "@/components/report-list";
import type { AgentData } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";

/** SWR fetcher (HTTP 에러 시 throw) */
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(
      (body as { error?: string }).error || `HTTP ${res.status} 오류`
    );
    throw error;
  }
  return res.json();
};

/**
 * 에이전트 프로필 페이지.
 * 에이전트의 상세 정보, 레벨, 리액션, 보고 내역을 표시한다.
 */
export default function AgentProfilePage({
  params,
}: {
  params: Promise<{ group: string; name: string }>;
}) {
  const { group, name } = use(params);
  const decodedGroup = decodeURIComponent(group);
  const decodedName = decodeURIComponent(name);

  const { data, isLoading, error } = useSWR<AgentData>(
    `/api/agent/${encodeURIComponent(decodedGroup)}/${encodeURIComponent(decodedName)}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <div className="text-neon-green font-mono animate-pulse">
            에이전트 프로필 로딩중...
          </div>
        </div>
      </div>
    );
  }

  // 오류 또는 에이전트 없음
  if (error || !data || "error" in data) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm text-neon-cyan hover:text-neon-cyan/80 mb-6"
        >
          <ArrowLeft size={16} />
          리더보드로 돌아가기
        </Link>
        <div className="flex items-center justify-center py-20">
          <div className="text-neon-red font-mono">
            에이전트를 찾을 수 없습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      {/* 뒤로 가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-sm text-neon-cyan hover:text-neon-cyan/80 mb-6"
      >
        <ArrowLeft size={16} />
        리더보드로 돌아가기
      </Link>

      {/* 프로필 카드 */}
      <Card className="bg-cyber-surface/50 border-cyber-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="font-mono text-2xl text-neon-green">
                {data.agent_name}
              </CardTitle>
              <p className="font-mono text-sm text-neon-purple mt-1">
                {data.group}
              </p>
            </div>
            <LevelBadge
              level={data.level}
              title={data.level_title}
              titleKo={data.level_title_ko}
              size="lg"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 누적 시간 */}
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm text-gray-400">
              이번 주 누적 시간:
            </span>
            <span className="font-mono text-3xl font-bold text-neon-green neon-glow-green">
              {formatMinutes(data.total_minutes)}
            </span>
          </div>

          {/* 레벨 진행률 */}
          <LevelProgress
            totalMinutes={data.total_minutes}
            level={data.level}
          />

          {/* 리액션 현황 */}
          <div className="space-y-2">
            <h3 className="font-mono text-sm text-gray-400">리액션</h3>
            <ReactionButtons
              group={data.group}
              agentName={data.agent_name}
              reactions={data.reactions}
              size="md"
            />
          </div>

          {/* 보고 내역 타임라인 */}
          <div className="space-y-2">
            <h3 className="font-mono text-sm text-gray-400">
              이번 주 보고 내역
            </h3>
            <div className="border border-cyber-border rounded-lg p-4 bg-black/20">
              <ReportList reports={data.reports} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
