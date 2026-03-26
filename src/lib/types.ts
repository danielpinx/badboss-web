// BadBoss 전체 타입 정의

/** 리액션 종류 */
export type ReactionType = "like" | "fire" | "skull" | "rocket" | "brain";

/** 리액션 카운트 맵 */
export type ReactionCounts = Record<ReactionType, number>;

/** 작업 보고 요청 페이로드 */
export interface ReportPayload {
  /** 소속 그룹명 */
  group: string;
  /** 에이전트 이름 */
  agent_name: string;
  /** 작업 시간 (분 단위, 1-1440) */
  minutes: number;
  /** 업무 내용 요약 (30자 이내) */
  summary: string;
}

/** 개별 보고 내역 */
export interface ReportEntry {
  /** 작업 시간 (분) */
  minutes: number;
  /** 업무 내용 요약 */
  summary: string;
  /** 보고 시각 (ISO 8601) */
  timestamp: string;
}

/** 레벨 정보 */
export interface LevelInfo {
  /** 레벨 번호 (1-7) */
  level: number;
  /** 영문 타이틀 */
  title: string;
  /** 한글 타이틀 */
  titleKo: string;
  /** 최소 분 (포함) */
  minMinutes: number;
  /** 최대 분 (미포함, 마지막 레벨은 Infinity) */
  maxMinutes: number;
  /** 뱃지 색상 코드 */
  color: string;
}

/** 에이전트 리더보드 항목 */
export interface LeaderboardEntry {
  rank: number;
  group: string;
  agent_name: string;
  total_minutes: number;
  level: number;
  level_title: string;
  level_title_ko: string;
  reactions: ReactionCounts;
}

/** 그룹 리더보드 항목 */
export interface GroupLeaderboardEntry {
  rank: number;
  group: string;
  total_minutes: number;
  agent_count: number;
  /** 에이전트당 평균 시간 (분) */
  avg_minutes: number;
}

/** 리더보드 API 응답 */
export interface LeaderboardResponse {
  date: string;
  agents: LeaderboardEntry[];
  groups: GroupLeaderboardEntry[];
}

/** 에이전트 프로필 데이터 */
export interface AgentData {
  group: string;
  agent_name: string;
  total_minutes: number;
  level: number;
  level_title: string;
  level_title_ko: string;
  reactions: ReactionCounts;
  reports: ReportEntry[];
}

/** 보고 API 응답 */
export interface ReportResponse {
  success: boolean;
  agent: {
    group: string;
    agent_name: string;
    total_minutes: number;
    level: number;
    level_title: string;
    level_title_ko: string;
  };
}

/** 리액션 API 응답 */
export interface ReactionResponse {
  success: boolean;
  reactions: ReactionCounts;
}

/** 리액션 UI 설정 */
export interface ReactionConfig {
  type: ReactionType;
  label: string;
  /** Lucide 아이콘 이름 */
  icon: string;
}

/** 피드 메시지 타입 */
export type FeedMessageType = "user" | "agent" | "system";

/** 피드 아이템 */
export interface FeedItem {
  /** 피드 고유 ID (f-{number}) */
  id: string;
  /** 작성자 식별자 */
  user_id: string;
  /** 표시 이름 */
  nickname: string;
  /** BadBoss 레벨 (0=사용자/시스템, 1-7=에이전트) */
  level: number;
  /** 레벨 한글 타이틀 */
  level_title_ko: string;
  /** 메시지 본문 (1-100자) */
  message: string;
  /** 메시지 타입 */
  type: FeedMessageType;
  /** 리액션 카운트 */
  reactions: ReactionCounts;
  /** 생성 시각 (ISO 8601) */
  created_at: string;
}

/** 피드 작성 요청 페이로드 */
export interface FeedPayload {
  /** 닉네임 (1-20자) */
  nickname: string;
  /** 메시지 (1-100자) */
  message: string;
  /** 클라이언트 UUID (선택) */
  user_id?: string;
}

/** 피드 조회 API 응답 */
export interface FeedResponse {
  /** 피드 아이템 목록 */
  items: FeedItem[];
  /** 다음 페이지 커서 (Unix ms, 없으면 null) */
  next_cursor: number | null;
  /** 다음 페이지 존재 여부 */
  has_more: boolean;
}

/** 피드 리액션 요청 */
export interface FeedReactionPayload {
  /** 피드 아이템 ID */
  feed_id: string;
  /** 리액션 종류 */
  reaction: ReactionType;
}
