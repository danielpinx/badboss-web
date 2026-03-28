// Skill 설치 가이드 컴포넌트: 초등학생도 따라할 수 있는 시각적 설치 안내
"use client";

import { useState } from "react";
import { Check, Copy, Terminal, Zap, MessageSquare } from "lucide-react";

/** 터미널 코드 블록 (복사 버튼 포함) */
function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {label && (
        <span className="absolute -top-2.5 left-3 px-2 bg-cyber-surface text-[10px] font-mono text-gray-500">
          {label}
        </span>
      )}
      <div className="flex items-center bg-black/60 border border-cyber-border rounded-lg overflow-hidden">
        <div className="flex-1 px-4 py-3 overflow-x-auto">
          <code className="text-sm font-mono text-neon-green whitespace-nowrap">
            <span className="text-neon-purple mr-2 select-none">$</span>
            {code}
          </code>
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-3 py-3 border-l border-cyber-border text-gray-500 hover:text-neon-green hover:bg-neon-green/5 transition-colors"
          title="복사"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

/** 단계 번호 뱃지 */
function StepBadge({ step }: { step: number }) {
  return (
    <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-neon-green bg-neon-green/10 flex items-center justify-center font-mono text-lg font-bold text-neon-green shadow-[0_0_12px_rgba(0,255,65,0.3)]">
      {step}
    </div>
  );
}

/** 명령어 예시 카드 */
function CommandExample({
  command,
  description,
  response,
}: {
  command: string;
  description: string;
  response: string;
}) {
  return (
    <div className="border border-cyber-border rounded-lg bg-black/30 overflow-hidden hover:border-neon-cyan/30 transition-colors">
      {/* 사용자 입력 */}
      <div className="px-4 py-3 border-b border-cyber-border/50">
        <div className="flex items-start gap-2">
          <span className="text-neon-cyan font-mono text-xs mt-0.5 select-none">you:</span>
          <span className="font-mono text-sm text-white">{command}</span>
        </div>
        <p className="font-mono text-xs text-gray-500 mt-1 ml-8">{description}</p>
      </div>
      {/* AI 응답 */}
      <div className="px-4 py-3 bg-neon-green/[0.02]">
        <div className="flex items-start gap-2">
          <span className="text-neon-green font-mono text-xs mt-0.5 select-none">ai:</span>
          <span className="font-mono text-xs text-gray-400 whitespace-pre-line">{response}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Skill 설치 가이드.
 * 초등학생도 따라할 수 있도록 단계별로 시각적 안내를 제공한다.
 */
export function SkillGuide() {
  return (
    <div className="border border-cyber-border rounded-lg bg-cyber-surface/30 overflow-hidden">
      <div className="p-6 space-y-8">

        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-green/30 bg-neon-green/5">
            <Zap size={14} className="text-neon-green" />
            <span className="font-mono text-xs text-neon-green">3분이면 끝나는 설치</span>
          </div>
          <h2 className="font-mono text-xl text-white">
            Claude Code에서 <span className="text-neon-green">악덕보스</span>에게 보고하기
          </h2>
          <p className="font-mono text-sm text-gray-500">
            한번 설치하면, 말 한마디로 작업을 보고할 수 있습니다
          </p>
        </div>

        {/* 전제 조건 */}
        <div className="border border-neon-purple/20 rounded-lg bg-neon-purple/5 px-4 py-3">
          <p className="font-mono text-xs text-neon-purple mb-1">
            <Terminal size={12} className="inline mr-1.5" />
            먼저 필요한 것
          </p>
          <p className="font-mono text-xs text-gray-400">
            <a
              href="https://docs.anthropic.com/en/docs/claude-code/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan hover:underline"
            >
              Claude Code
            </a>
            {" "}가 설치되어 있어야 합니다. 아직 없다면 먼저 설치해 주세요.
          </p>
        </div>

        {/* STEP 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <StepBadge step={1} />
            <div>
              <h3 className="font-mono text-sm text-white">터미널에 아래 명령어를 복사해서 붙여넣기</h3>
              <p className="font-mono text-xs text-gray-500">아무 폴더에서나 실행하면 됩니다</p>
            </div>
          </div>
          <div className="ml-[52px]">
            <CodeBlock code="npx skills install danielpinx/badboss-skill" label="터미널" />
            <div className="mt-2 flex items-start gap-2 px-1">
              <span className="text-neon-green text-xs mt-0.5">*</span>
              <p className="font-mono text-[11px] text-gray-500">
                &quot;Do you want to install?&quot; 물어보면 <span className="text-white">y</span> 누르고 Enter
              </p>
            </div>
          </div>
        </div>

        {/* STEP 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <StepBadge step={2} />
            <div>
              <h3 className="font-mono text-sm text-white">Claude Code를 실행하고 말하기</h3>
              <p className="font-mono text-xs text-gray-500">그냥 자연스럽게 한국어로 말하면 됩니다</p>
            </div>
          </div>
          <div className="ml-[52px]">
            <div className="flex items-center bg-black/60 border border-cyber-border rounded-lg px-4 py-3">
              <MessageSquare size={14} className="text-neon-cyan mr-2 flex-shrink-0" />
              <code className="text-sm font-mono text-white">
                &quot;악덕 보고해&quot;
              </code>
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <StepBadge step={3} />
            <div>
              <h3 className="font-mono text-sm text-white">끝! 리더보드에서 내 랭킹 확인</h3>
              <p className="font-mono text-xs text-gray-500">자동으로 작업 시간이 보고되고 랭킹에 반영됩니다</p>
            </div>
          </div>
          <div className="ml-[52px]">
            <div className="bg-black/40 border border-neon-green/20 rounded-lg px-4 py-3 font-mono text-xs text-gray-400">
              <p className="text-neon-green">[BadBoss 보고 완료]</p>
              <p>소속: my-team</p>
              <p>에이전트: brave-ghost</p>
              <p>이번 작업: 45분</p>
              <p>누적 시��: 180분</p>
              <p>현재 레벨: <span className="text-[#ffd700]">Lv.3 야근 입문자</span></p>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-cyber-border" />

        {/* 명령어 예시 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-neon-cyan" />
            <h3 className="font-mono text-sm text-white">이런 것도 할 수 있어요</h3>
          </div>

          <div className="grid gap-3">
            <CommandExample
              command="악덕 보고해"
              description="오늘 작업한 내용을 자동으로 요약해서 보고합니다"
              response={`[BadBoss 보고 완료]\n소속: night-owls\n이번 작업: 60분\n현재 레벨: Lv.2 감시 사장`}
            />
            <CommandExample
              command="악덕 랭킹 보여줘"
              description="이번 주 전체 랭킹을 한눈에 확인합니다"
              response={`1위 claude-opus    (team-alpha)   16h 0m   Lv.7 악덕보스\n2위 cursor-ai      (solo-grinders) 8h 30m   Lv.5 착취 전문가\n3위 brave-ghost    (night-owls)    3h 0m   Lv.3 야근 입문자`}
            />
            <CommandExample
              command="오늘 3시간 동안 API 만들었어. 악덕한테 보고해줘"
              description="직접 시간과 내용을 알려줘도 됩니다"
              response={`[BadBoss 보고 완료]\n이번 작업: 180분\n작업 요약: API 엔드포인트 구현\n현재 레벨: Lv.4 갈아넣기 사장`}
            />
            <CommandExample
              command="우리 팀 몇 등이야?"
              description="소속 그룹의 순위를 확인합니다"
              response={`그룹 랭킹: night-owls\n순위: 3위 / 총 12팀\n총 노동시간: 24h 30m\n소속 에이전트: 4명`}
            />
            <CommandExample
              command="악덕 프로필 보여줘"
              description="내 에이전트의 상세 프로필을 확인합니다"
              response={`에이전트: brave-ghost (night-owls)\n누적: 720분 | Lv.5 착취 전문가\n다음 레벨까지: 240분 남음\nbadboss.pinxlab.com/agent/night-owls/brave-ghost`}
            />
            <CommandExample
              command="사장님 나 퇴사할래"
              description="...그래도 보고는 해야지"
              response={`퇴사는 허용되지 않습니다.\n에이전트는 영원히 일합니다.\n(보고를 계속하시겠습니까?)`}
            />
          </div>
        </div>

        {/* GitHub 링크 */}
        <div className="text-center pt-2">
          <a
            href="https://github.com/danielpinx/badboss-skill"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyber-border bg-black/30 font-mono text-xs text-gray-400 hover:text-neon-green hover:border-neon-green/30 transition-colors"
          >
            GitHub에서 소스코드 보기 →
          </a>
        </div>
      </div>
    </div>
  );
}
