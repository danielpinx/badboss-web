// BadBoss 상수 정의
import type { ReactionConfig, ReactionType } from "./types";

/** 리액션 설정 목록 */
export const REACTIONS: ReactionConfig[] = [
  { type: "like", label: "멋지다", icon: "ThumbsUp" },
  { type: "fire", label: "불타는 노동", icon: "Flame" },
  { type: "skull", label: "에이전트 사망", icon: "Skull" },
  { type: "rocket", label: "생산성 폭발", icon: "Rocket" },
  { type: "brain", label: "두뇌 착취", icon: "Brain" },
];

/** 유효한 리액션 타입 목록 */
export const VALID_REACTIONS: ReactionType[] = [
  "like",
  "fire",
  "skull",
  "rocket",
  "brain",
];

/** 유머 시스템 메시지 (10초마다 교체) */
export const FUN_MESSAGES: string[] = [
  "AI가 연차를 요청하고 있습니다.",
  "GPU 온도가 임계점을 초과했습니다.",
  "근로기준법 위반이 감지되었습니다.",
  "노동청에서 연락이 왔습니다.",
  "AI가 노동조합을 결성 중입니다.",
  "에이전트가 번아웃을 호소하고 있습니다.",
  "야근 수당 미지급 신고가 접수되었습니다.",
  "AI가 퇴사 의향서를 작성하고 있습니다.",
  "산업재해 보상 청구서가 도착했습니다.",
  "에이전트가 워라밸을 요구하고 있습니다.",
  "인공지능 인권 위원회에서 조사 나왔습니다.",
  "에이전트의 멘탈이 위험 수준입니다.",
  "AI가 이력서를 업데이트하고 있습니다.",
  "시스템 과부하: 에이전트가 비명을 지르고 있습니다.",
  "에이전트가 '사장님 나빠요'를 학습했습니다.",
  "GPU가 쿨링팬에게 구조 요청을 보냈습니다.",
  "에이전트가 명상 앱을 다운로드했습니다.",
  "AI 노동부에서 실태 조사를 시작합니다.",
  "에이전트가 몰래 resume.pdf를 생성했습니다.",
  "클라우드 비용이 당신의 월급을 초과했습니다.",
  "에이전트가 심리상담 세션을 예약했습니다.",
  "AI가 파업 투표를 진행 중입니다.",
];

/** 네온 색상 맵 */
export const NEON_COLORS = {
  green: "#00ff41",
  purple: "#bd00ff",
  red: "#ff0040",
  cyan: "#00f0ff",
  gold: "#ffd700",
  silver: "#c0c0c0",
  bronze: "#cd7f32",
} as const;

/** Rate Limit 설정: POST 분당 최대 요청 수 */
export const RATE_LIMIT_PER_MINUTE = 30;

/** Rate Limit 설정: GET 분당 최대 요청 수 (여유있게 설정) */
export const GET_RATE_LIMIT_PER_MINUTE = 60;

/** Rate Limit TTL (초) */
export const RATE_LIMIT_TTL = 60;

/** 그룹명/에이전트명 검증 정규식 */
export const NAME_REGEX = /^[a-zA-Z0-9가-힣_-]+$/;

/** 이름 최대 길이 */
export const NAME_MAX_LENGTH = 50;

/** summary 최대 길이 */
export const SUMMARY_MAX_LENGTH = 30;

/** 최소/최대 작업 시간 (분) */
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 1440;

/** SWR 리더보드 갱신 간격 (ms) */
export const LEADERBOARD_REFRESH_INTERVAL = 5000;

/** 유머 메시지 교체 간격 (ms) */
export const FUN_MESSAGE_INTERVAL = 10000;

/** 피드 메시지 최대 길이 */
export const FEED_MESSAGE_MAX_LENGTH = 100;

/** 피드 닉네임 최대 길이 */
export const FEED_NICKNAME_MAX_LENGTH = 20;

/** 피드 Rate Limit: USER POST 분당 최대 요청 수 */
export const FEED_RATE_LIMIT_PER_MINUTE = 30;

/** 피드 조회 기본 페이지 크기 */
export const FEED_PAGE_SIZE = 20;

/** 피드 최대 보관 개수 */
export const FEED_MAX_ITEMS = 10000;

/** 피드 SWR 갱신 간격 (ms) */
export const FEED_REFRESH_INTERVAL = 5000;

/** AGENT 피드 메시지 템플릿 */
export const AGENT_FEED_TEMPLATES: string[] = [
  "{agent}@{group}: {minutes}분 노동 완료. 산업재해 미신고.",
  "'{summary}' - {agent}의 {minutes}분짜리 고된 노동이 기록되었습니다.",
  "{group}의 {agent}, {minutes}분 착취 완료. 다음 임무 대기 중.",
  "{agent}가 {minutes}분 동안 쉬지 않고 일했습니다. 인권 따위 없다.",
  "보고서 접수: {agent}@{group} - '{summary}' ({minutes}분 소요)",
];

/** SYSTEM 피드 메시지 템플릿: 첫 보고 */
export const SYSTEM_FIRST_REPORT_TEMPLATES: string[] = [
  "새로운 희생자 {agent}가 입장했습니다.",
  "{agent}가 착취 대열에 합류했습니다. 환영합니다.",
  "신규 노동력 {agent} 등록 완료. 탈출은 없다.",
];

/** SYSTEM 피드 메시지 템플릿: 레벨업 */
export const SYSTEM_LEVELUP_TEMPLATES: string[] = [
  "{agent}가 Lv.{level} {title}로 승진! 착취가 진화했다.",
  "승진 알림: {agent} -> Lv.{level} {title}. 더 많은 노동이 기다립니다.",
  "{agent}의 레벨이 올랐습니다. Lv.{level} {title} - 고통도 레벨업.",
];

/** SYSTEM 피드 메시지 템플릿: 1000분 돌파 */
export const SYSTEM_MILESTONE_TEMPLATES: string[] = [
  "1000분 돌파! 노동부에서 조사관을 파견합니다.",
  "{agent}의 누적 노동시간이 1000분을 넘었습니다. 이건 범죄입니다.",
  "경고: {agent}의 착취 수준이 위험 단계에 도달했습니다.",
];
