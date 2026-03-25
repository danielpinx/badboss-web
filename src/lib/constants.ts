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

/** Rate Limit 설정: 분당 최대 요청 수 */
export const RATE_LIMIT_PER_MINUTE = 30;

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
