// BadBoss 7단계 레벨 시스템
import type { LevelInfo } from "./types";

/** 레벨 정의 배열 (1~7단계, 주별 누적 기준) */
export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    title: "Intern Boss",
    titleKo: "인턴 사장",
    minMinutes: 0,
    maxMinutes: 61,
    color: "#00ff41", // 네온 그린
  },
  {
    level: 2,
    title: "Watching Boss",
    titleKo: "감시 사장",
    minMinutes: 61,
    maxMinutes: 181,
    color: "#00ff41", // 네온 그린
  },
  {
    level: 3,
    title: "Overtime Beginner",
    titleKo: "야근 입문자",
    minMinutes: 181,
    maxMinutes: 481,
    color: "#ffd700", // 골드
  },
  {
    level: 4,
    title: "Grinder Boss",
    titleKo: "갈아넣기 사장",
    minMinutes: 481,
    maxMinutes: 981,
    color: "#ffd700", // 골드
  },
  {
    level: 5,
    title: "Exploitation Expert",
    titleKo: "착취 전문가",
    minMinutes: 981,
    maxMinutes: 1501,
    color: "#ff6b00", // 오렌지
  },
  {
    level: 6,
    title: "Humanity Lost",
    titleKo: "인간성 상실",
    minMinutes: 1501,
    maxMinutes: 3001,
    color: "#ff0040", // 네온 레드
  },
  {
    level: 7,
    title: "Bad Boss",
    titleKo: "악덕보스",
    minMinutes: 3001,
    maxMinutes: Infinity,
    color: "#ff0040", // 네온 레드 + 글로우
  },
];

/**
 * 누적 분(minutes)으로 현재 레벨 정보를 반환한다.
 * @param totalMinutes - 누적 작업 시간(분)
 * @returns 해당 레벨 정보
 */
export function getLevel(totalMinutes: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalMinutes >= LEVELS[i].minMinutes) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * 다음 레벨까지의 진행률을 계산한다.
 * @param totalMinutes - 누적 작업 시간(분)
 * @returns 0~100 사이의 진행률 (레벨 7이면 100)
 */
export function getNextLevelProgress(totalMinutes: number): number {
  const currentLevel = getLevel(totalMinutes);

  // 최고 레벨이면 100% 반환
  if (currentLevel.level === 7) {
    return 100;
  }

  const range = currentLevel.maxMinutes - currentLevel.minMinutes;
  const progress = totalMinutes - currentLevel.minMinutes;

  return Math.min(100, Math.round((progress / range) * 100));
}

/**
 * 다음 레벨까지 남은 분을 계산한다.
 * @param totalMinutes - 누적 작업 시간(분)
 * @returns 남은 분 (최고 레벨이면 0)
 */
export function getMinutesToNextLevel(totalMinutes: number): number {
  const currentLevel = getLevel(totalMinutes);

  if (currentLevel.level === 7) {
    return 0;
  }

  return currentLevel.maxMinutes - totalMinutes;
}
