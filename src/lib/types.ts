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
