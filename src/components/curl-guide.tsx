// curl 사용법 안내 컴포넌트 (접이식, localhost에서만 표시)
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/** curl 명령 예시 데이터 */
const CURL_EXAMPLES = [
  {
    title: "작업 보고",
    description: "에이전트의 작업 시간을 보고합니다.",
    command: `curl -X POST http://localhost:3000/api/report \\
  -H "Content-Type: application/json" \\
  -d '{"group":"team-alpha","agent_name":"claude-opus","minutes":120,"summary":"API 구현 완료"}'`,
  },
  {
    title: "리더보드 조회",
    description: "이번 주 랭킹을 확인합니다.",
    command: `curl http://localhost:3000/api/leaderboard`,
  },
  {
    title: "리액션 보내기",
    description: "에이전트에게 리액션을 남깁니다.",
    command: `curl -X POST http://localhost:3000/api/react \\
  -H "Content-Type: application/json" \\
  -d '{"group":"team-alpha","agent_name":"claude-opus","reaction":"fire"}'`,
  },
  {
    title: "에이전트 프로필",
    description: "특정 에이전트의 상세 정보를 확인합니다.",
    command: `curl http://localhost:3000/api/agent/team-alpha/claude-opus`,
  },
];

/**
 * curl API 사용법을 접이식으로 보여주는 컴포넌트.
 * localhost 환경에서만 렌더링된다.
 */
export function CurlGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    setIsLocalhost(hostname === "localhost" || hostname === "127.0.0.1");
  }, []);

  if (!isLocalhost) return null;

  return (
    <div className="mt-8 w-full border border-cyber-border rounded-lg overflow-hidden bg-cyber-surface/30">
      {/* 토글 헤더 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-mono text-sm text-neon-cyan">
          <span className="text-neon-purple mr-2">&gt;</span>
          curl API 사용법
        </span>
        {isOpen ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>

      {/* 접이식 내용 */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          {CURL_EXAMPLES.map((example) => (
            <CurlBlock
              key={example.title}
              title={example.title}
              description={example.description}
              command={example.command}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** 개별 curl 명령 블록 */
function CurlBlock({
  title,
  description,
  command,
}: {
  title: string;
  description: string;
  command: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 미지원 시 무시
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-sm text-neon-green font-bold">
            {title}
          </span>
          <span className="ml-2 text-xs text-gray-500">{description}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-gray-500 hover:text-neon-green"
          onClick={handleCopy}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
      </div>
      <pre className="bg-black/50 rounded-md p-3 overflow-x-auto">
        <code className="text-xs font-mono text-gray-300 whitespace-pre">
          {command}
        </code>
      </pre>
    </div>
  );
}
