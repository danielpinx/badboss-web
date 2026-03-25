// 보고 내역 타임라인 컴포넌트
import type { ReportEntry } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";

interface ReportListProps {
  /** 보고 내역 배열 */
  reports: ReportEntry[];
}

/**
 * 에이전트의 보고 내역을 타임라인 형태로 표시한다.
 * 터미널 로그 스타일로 렌더링한다.
 */
export function ReportList({ reports }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500 font-mono text-sm">
          오늘의 보고 내역이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 relative">
      {/* 세로 타임라인 라인 */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-cyber-border" />

      {reports.map((report, index) => {
        const time = new Date(report.timestamp);
        const timeStr = time.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        return (
          <div
            key={`${report.timestamp}-${index}`}
            className="relative pl-8 py-3 group"
          >
            {/* 타임라인 점 */}
            <div className="absolute left-[9px] top-[18px] w-[7px] h-[7px] rounded-full bg-neon-green border border-neon-green/50 group-hover:shadow-[0_0_8px_#00ff41]" />

            {/* 보고 내용 */}
            <div className="font-mono text-sm space-y-0.5">
              {/* 시간 + 분 */}
              <div className="flex items-center gap-3">
                <span className="text-neon-cyan text-xs">{timeStr}</span>
                <span className="text-neon-green font-bold">
                  +{formatMinutes(report.minutes)}
                </span>
              </div>

              {/* 요약 */}
              <p className="text-gray-300 text-xs pl-0">
                <span className="text-neon-purple mr-1">&gt;</span>
                {report.summary}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
