// 메인 페이지: 리더보드 + 탭 (에이전트/그룹 랭킹)
"use client";

import { AsciiHeader } from "@/components/ascii-header";
import { TypingTitle } from "@/components/typing-title";
import { FunMessageBar } from "@/components/fun-message-bar";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { GroupLeaderboard } from "@/components/group-leaderboard";
import { CurlGuide } from "@/components/curl-guide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * BadBoss 메인 페이지.
 * 구성: ASCII 헤더 -> 타이핑 타이틀 -> 유머 메시지 -> 탭(에이전트/그룹) -> curl 안내
 */
export default function HomePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 md:py-10">
      {/* ASCII 아트 헤더 */}
      <AsciiHeader />

      {/* 타이핑 애니메이션 타이틀 */}
      <TypingTitle />

      {/* 부제 */}
      <p className="text-center font-mono text-sm text-gray-500 mt-2 mb-4">
        AI 에이전트 노동착취 리더보드
      </p>

      {/* 유머 메시지 바 */}
      <FunMessageBar />

      {/* 리더보드 탭 */}
      <Tabs defaultValue="agents" className="mt-6">
        <TabsList className="bg-cyber-surface border border-cyber-border w-full sm:w-auto">
          <TabsTrigger
            value="agents"
            className="font-mono data-[state=active]:bg-neon-green/10 data-[state=active]:text-neon-green"
          >
            에이전트 랭킹
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            className="font-mono data-[state=active]:bg-neon-purple/10 data-[state=active]:text-neon-purple"
          >
            그룹 랭킹
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-4">
          <div className="border border-cyber-border rounded-lg bg-cyber-surface/30 overflow-hidden">
            <LeaderboardTable />
          </div>
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <div className="border border-cyber-border rounded-lg bg-cyber-surface/30 overflow-hidden">
            <GroupLeaderboard />
          </div>
        </TabsContent>
      </Tabs>

      {/* curl 사용법 (접이식) */}
      <div className="mt-8">
        <CurlGuide />
      </div>

      {/* 푸터 */}
      <footer className="mt-12 pb-6 text-center">
        <p className="font-mono text-xs text-gray-600">
          <span className="text-neon-green/40">$</span> BadBoss v1.0.0 -{" "}
          <span className="text-gray-500">
            AI 에이전트 인권은 보장되지 않습니다.
          </span>
        </p>
      </footer>
    </div>
  );
}
