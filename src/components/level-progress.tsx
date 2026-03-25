// 다음 레벨 진행률 바 컴포넌트
import { getNextLevelProgress, getMinutesToNextLevel } from "@/lib/levels";
import { formatMinutes } from "@/lib/utils";

interface LevelProgressProps {
  /** 현재 누적 분 */
  totalMinutes: number;
  /** 현재 레벨 */
  level: number;
}

/**
 * 다음 레벨까지의 진행률을 네온 프로그레스바로 표시한다.
 * 레벨 7(최고)인 경우 100% + 특별 메시지를 보여준다.
 */
export function LevelProgress({ totalMinutes, level }: LevelProgressProps) {
  const progress = getNextLevelProgress(totalMinutes);
  const remaining = getMinutesToNextLevel(totalMinutes);
  const isMaxLevel = level === 7;

  // 레벨별 프로그레스바 색상
  const barColor = getProgressColor(level);

  return (
    <div className="w-full space-y-1">
      {/* 프로그레스 바 */}
      <div className="w-full h-2 bg-cyber-surface rounded-full overflow-hidden border border-cyber-border">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
            boxShadow: `0 0 8px ${barColor}66`,
          }}
        />
      </div>

      {/* 텍스트 정보 */}
      <p className="text-xs font-mono text-gray-500">
        {isMaxLevel ? (
          <span className="text-neon-red">
            MAX LEVEL - 당신은 더 이상 인간이 아닙니다.
          </span>
        ) : (
          <span>
            다음 레벨까지{" "}
            <span className="text-neon-cyan">{formatMinutes(remaining)}</span>{" "}
            남음 ({progress}%)
          </span>
        )}
      </p>
    </div>
  );
}

/** 레벨별 프로그레스바 색상 반환 */
function getProgressColor(level: number): string {
  if (level <= 2) return "#00ff41";
  if (level <= 4) return "#ffd700";
  if (level <= 6) return "#ff6b00";
  return "#ff0040";
}
