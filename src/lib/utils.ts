// BadBoss 유틸리티 함수
import {
  NAME_REGEX,
  NAME_MAX_LENGTH,
  SUMMARY_MAX_LENGTH,
  FEED_NICKNAME_MAX_LENGTH,
  FEED_MESSAGE_MAX_LENGTH,
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
 * KST 기준 현재 주의 시작일(화요일)을 YYYY-MM-DD 형식으로 반환한다.
 * 매주 화요일 00:00 KST에 리더보드가 초기화된다.
 * 화요일~월요일을 한 주기로 본다.
 * @returns KST 기준 이번 주 화요일 날짜 문자열
 */
export function getCurrentWeekStartKST(): string {
  // KST 기준 현재 날짜 파싱
  const todayStr = getTodayKST();
  const [year, month, day] = todayStr.split("-").map(Number);
  const today = new Date(year, month - 1, day);

  // getDay(): 0=일, 1=월, 2=화, ..., 6=토
  const dayOfWeek = today.getDay();

  // 화요일(2)로부터의 오프셋 계산
  // 화=0, 수=1, 목=2, 금=3, 토=4, 일=5, 월=6
  const daysSinceTuesday = (dayOfWeek - 2 + 7) % 7;
  const tuesday = new Date(year, month - 1, day - daysSinceTuesday);

  const y = tuesday.getFullYear();
  const m = String(tuesday.getMonth() + 1).padStart(2, "0");
  const d = String(tuesday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * summary 텍스트를 새니타이즈한다.
 * HTML 태그를 반복적으로 제거하고(중첩 태그 처리) 30자로 자른다.
 * @param text - 원본 텍스트
 * @returns 새니타이즈된 텍스트
 */
/**
 * 텍스트를 새니타이즈한다.
 * HTML 태그를 반복적으로 제거하고(중첩 태그 처리) 지정된 길이로 자른다.
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이
 * @returns 새니타이즈된 텍스트
 */
export function sanitizeText(text: string, maxLength: number): string {
  // L-1: 반복 제거로 중첩 태그 처리 (예: <scr<script>ipt>)
  let cleaned = text;
  let prev = "";
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned.replace(/<[^>]*>/g, "");
  }
  return cleaned.trim().slice(0, maxLength);
}

export function sanitizeSummary(text: string): string {
  return sanitizeText(text, SUMMARY_MAX_LENGTH);
}

/**
 * 보안 이벤트를 구조화된 JSON으로 로깅한다.
 * Rate Limit 초과, 입력 검증 실패 등 보안 관련 이벤트에 사용한다.
 * @param event - 이벤트 이름 (예: "rate_limit_exceeded", "input_validation_failed")
 * @param details - 추가 세부 정보
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>
) {
  console.warn(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...details,
    })
  );
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

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}h ${mm}m`;
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

/**
 * 피드 닉네임 유효성을 검증한다.
 * @param name - 검증할 닉네임
 * @returns 유효 여부
 */
export function validateNickname(name: string): boolean {
  if (!name || name.length > FEED_NICKNAME_MAX_LENGTH) return false;
  return NAME_REGEX.test(name);
}

/**
 * 피드 메시지 유효성을 검증한다.
 * @param message - 검증할 메시지
 * @returns 유효 여부
 */
export function validateFeedMessage(message: string): boolean {
  if (!message || message.trim().length === 0) return false;
  return message.length <= FEED_MESSAGE_MAX_LENGTH;
}
