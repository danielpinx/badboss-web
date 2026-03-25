// BadBoss 유틸리티 함수
import {
  NAME_REGEX,
  NAME_MAX_LENGTH,
  SUMMARY_MAX_LENGTH,
  MIN_MINUTES,
  MAX_MINUTES,
} from "./constants";

/**
 * KST 기준 오늘 날짜를 YYYY-MM-DD 형식으로 반환한다.
 * Intl.DateTimeFormat을 사용하여 시스템 시계에 관계없이 정확한 KST를 계산한다.
 * @returns KST 기준 날짜 문자열
 */
export function getTodayKST(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA 로케일은 YYYY-MM-DD 형식을 반환한다
  return formatter.format(new Date());
}

/**
 * summary 텍스트를 새니타이즈한다.
 * HTML 태그를 제거하고 30자로 자른다.
 * @param text - 원본 텍스트
 * @returns 새니타이즈된 텍스트
 */
export function sanitizeSummary(text: string): string {
  // HTML 태그 제거
  const cleaned = text.replace(/<[^>]*>/g, "").trim();
  // 최대 길이 제한
  return cleaned.slice(0, SUMMARY_MAX_LENGTH);
}

/**
 * 그룹명 유효성을 검증한다.
 * @param name - 검증할 그룹명
 * @returns 유효 여부
 */
export function validateGroupName(name: string): boolean {
  if (!name || name.length > NAME_MAX_LENGTH) return false;
  return NAME_REGEX.test(name);
}

/**
 * 에이전트명 유효성을 검증한다.
 * @param name - 검증할 에이전트명
 * @returns 유효 여부
 */
export function validateAgentName(name: string): boolean {
  if (!name || name.length > NAME_MAX_LENGTH) return false;
  return NAME_REGEX.test(name);
}

/**
 * 작업 시간(분) 유효성을 검증한다.
 * @param minutes - 검증할 분 값
 * @returns 유효 여부
 */
export function validateMinutes(minutes: number): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes >= MIN_MINUTES &&
    minutes <= MAX_MINUTES
  );
}

/**
 * 분을 "Xh Ym" 형식으로 포맷한다.
 * @param totalMinutes - 총 분 수
 * @returns 포맷된 시간 문자열
 */
export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * 날짜 문자열이 유효한 YYYY-MM-DD 형식인지 검증한다.
 * @param dateStr - 검증할 날짜 문자열
 * @returns 유효 여부
 */
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}
