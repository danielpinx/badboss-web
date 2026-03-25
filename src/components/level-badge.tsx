// 레벨 뱃지 컴포넌트
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/shadcn-utils";

interface LevelBadgeProps {
  /** 레벨 번호 (1-7) */
  level: number;
  /** 영문 타이틀 */
  title: string;
  /** 한글 타이틀 */
  titleKo: string;
  /** 크기 변형 */
  size?: "sm" | "md" | "lg";
}

/**
 * 레벨별 색상이 차등 적용되는 뱃지 컴포넌트.
 * 레벨 7은 pulse 애니메이션 + 글로우 효과가 추가된다.
 */
export function LevelBadge({
  level,
  title,
  titleKo,
  size = "md",
}: LevelBadgeProps) {
  // 레벨별 색상 결정
  const colorClass = getLevelColorClass(level);
  const isMaxLevel = level === 7;

  const sizeClass = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2.5 py-0.5",
    lg: "text-sm px-3 py-1",
  }[size];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono border whitespace-nowrap",
        sizeClass,
        colorClass,
        isMaxLevel && "animate-pulse-neon"
      )}
      style={
        isMaxLevel
          ? {
              boxShadow: "0 0 8px #ff0040, 0 0 16px #ff0040",
            }
          : undefined
      }
    >
      <span className="mr-1">Lv.{level}</span>
      <span className="hidden sm:inline">{title}</span>
      <span className="sm:hidden">{titleKo}</span>
    </Badge>
  );
}

/** 레벨별 Tailwind 색상 클래스를 반환한다 */
function getLevelColorClass(level: number): string {
  switch (level) {
    case 1:
    case 2:
      return "border-neon-green text-neon-green";
    case 3:
    case 4:
      return "border-neon-gold text-neon-gold";
    case 5:
    case 6:
      return "border-orange-500 text-orange-500";
    case 7:
      return "border-neon-red text-neon-red";
    default:
      return "border-neon-green text-neon-green";
  }
}
