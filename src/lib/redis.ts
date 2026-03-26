// Redis 클라이언트 및 데이터 접근 함수
import Redis from "ioredis";
import crypto from "crypto";
import type {
  ReportPayload,
  LeaderboardEntry,
  GroupLeaderboardEntry,
  ReactionType,
  ReactionCounts,
  AgentData,
  ReportEntry,
  FeedItem,
  FeedMessageType,
} from "./types";
import { getLevel } from "./levels";
import { getCurrentWeekStartKST, sanitizeText, logSecurityEvent } from "./utils";
import {
  VALID_REACTIONS,
  RATE_LIMIT_PER_MINUTE,
  RATE_LIMIT_TTL,
  FEED_MAX_ITEMS,
  FEED_MESSAGE_MAX_LENGTH,
  AGENT_FEED_TEMPLATES,
  SYSTEM_FIRST_REPORT_TEMPLATES,
  SYSTEM_LEVELUP_TEMPLATES,
  SYSTEM_MILESTONE_TEMPLATES,
} from "./constants";

// Redis 싱글턴 클라이언트 (핫 리로드 보호)
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

/** Redis 클라이언트 인스턴스 */
export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      // 최대 3회 재시도, 지수 백오프 (최대 2초)
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    reconnectOnError(err: Error) {
      // READONLY 에러 시 재연결
      return err.message.includes("READONLY");
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Redis 연결 오류 로깅 (프로세스 크래시 방지)
redis.on("error", (err: Error) => {
  console.error("[Redis] 연결 오류:", err.message);
});

/**
 * Redis 연결 상태를 확인한다.
 * 연결 불가 시 false를 반환한다.
 */
export async function isRedisConnected(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}

/** Redis 연결 실패 시 던질 커스텀 에러 */
export class RedisConnectionError extends Error {
  constructor(message = "Redis 서버에 연결할 수 없습니다.") {
    super(message);
    this.name = "RedisConnectionError";
  }
}

/**
 * Redis 명령 실행을 래핑하여 연결 오류를 RedisConnectionError로 변환한다.
 */
async function withRedis<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // 연결 관련 오류를 명확한 에러로 변환
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("ENOTFOUND") ||
      message.includes("ETIMEDOUT") ||
      message.includes("Connection is closed") ||
      message.includes("Stream isn't writeable")
    ) {
      throw new RedisConnectionError(
        `Redis 연결 실패: ${message}`
      );
    }
    throw err;
  }
}

// --- Redis 키 헬퍼 ---

/** 에이전트 리더보드 키 (주간 단위, 화요일 시작) */
function leaderboardKey(date: string): string {
  return `leaderboard:weekly:${date}`;
}

/** 그룹 리더보드 키 (주간 단위, 화요일 시작) */
function groupLeaderboardKey(date: string): string {
  return `leaderboard:group:weekly:${date}`;
}

/** 에이전트 해시 키 */
function agentKey(group: string, name: string): string {
  return `agent:${group}:${name}`;
}

/** 리액션 해시 키 */
function reactionKey(group: string, name: string): string {
  return `reaction:${group}:${name}`;
}

/** 보고 내역 리스트 키 */
function reportsKey(group: string, name: string, date: string): string {
  return `reports:${group}:${name}:${date}`;
}

/** 피드 타임라인 키 */
const FEED_TIMELINE_KEY = "feed:timeline";

/** 피드 아이템 해시 키 */
function feedItemKey(id: string): string {
  return `feed:item:${id}`;
}

/** 피드 리액션 해시 키 */
function feedReactionKey(id: string): string {
  return `reaction:feed:${id}`;
}

/** Rate Limit 키 */
function rateLimitKey(ip: string): string {
  const now = new Date();
  const minute = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}-${String(now.getUTCHours()).padStart(2, "0")}-${String(now.getUTCMinutes()).padStart(2, "0")}`;
  return `ratelimit:${ip}:${minute}`;
}

// --- 데이터 함수 ---

/**
 * 작업 보고를 처리한다.
 * Redis multi로 리더보드, 에이전트 해시, 보고 내역을 원자적으로 업데이트한다.
 */
export async function submitReport(payload: ReportPayload): Promise<{
  total_minutes: number;
  level: number;
  level_title: string;
  level_title_ko: string;
}> {
  return withRedis(async () => {
    const { group, agent_name, minutes, summary } = payload;
    const date = getCurrentWeekStartKST();
    const member = `${group}:${agent_name}`;
    const timestamp = new Date().toISOString();

    const reportEntry: ReportEntry = {
      minutes,
      summary,
      timestamp,
    };

    // Redis multi 트랜잭션
    const pipeline = redis.multi();

    // 에이전트 리더보드 점수 증가
    pipeline.zincrby(leaderboardKey(date), minutes, member);

    // 그룹 리더보드 점수 증가
    pipeline.zincrby(groupLeaderboardKey(date), minutes, group);

    // 에이전트 메타 정보 설정
    pipeline.hset(agentKey(group, agent_name), {
      group,
      name: agent_name,
    });
    // created_at은 최초 생성 시에만 설정 (이후 보고에서 덮어쓰지 않음)
    pipeline.hsetnx(agentKey(group, agent_name), "created_at", timestamp);

    // 보고 내역 추가
    pipeline.rpush(reportsKey(group, agent_name, date), JSON.stringify(reportEntry));

    // M-7: 시간 기반 데이터에 TTL 설정 (7일)
    const TTL_7_DAYS = 7 * 24 * 60 * 60;
    pipeline.expire(leaderboardKey(date), TTL_7_DAYS);
    pipeline.expire(groupLeaderboardKey(date), TTL_7_DAYS);
    pipeline.expire(reportsKey(group, agent_name, date), TTL_7_DAYS);

    const results = await pipeline.exec();

    // pipeline.exec() 실패 시 결과가 null
    if (!results) {
      throw new Error("Redis 트랜잭션 실행 실패");
    }

    // 개별 명령 에러 확인 (results[i] = [error, result])
    for (const [err] of results) {
      if (err) throw err;
    }

    // 업데이트된 총 분 수 가져오기 (zincrby 결과)
    const totalMinutes = Number(results[0][1]) || 0;
    // 트랜잭션 내 zincrby 결과에서 이전 점수를 역산하여 레이스 컨디션 방지
    const prevScore = totalMinutes - minutes;
    const prevLevel = getLevel(prevScore);
    const levelInfo = getLevel(totalMinutes);

    // AGENT 피드 자동 생성
    const agentTemplate = AGENT_FEED_TEMPLATES[Math.floor(Math.random() * AGENT_FEED_TEMPLATES.length)];
    const agentMessage = agentTemplate
      .replace("{agent}", agent_name)
      .replace("{group}", group)
      .replace("{minutes}", String(minutes))
      .replace("{summary}", summary);

    await createFeedItemInternal({
      userId: `agent:${group}:${agent_name}`,
      nickname: `${agent_name}@${group}`,
      level: levelInfo.level,
      message: agentMessage,
      type: "agent",
    });

    // SYSTEM 피드: 첫 보고
    if (prevScore === 0) {
      const tpl = SYSTEM_FIRST_REPORT_TEMPLATES[Math.floor(Math.random() * SYSTEM_FIRST_REPORT_TEMPLATES.length)];
      await createFeedItemInternal({
        userId: "system",
        nickname: "SYSTEM",
        level: 0,
        message: tpl.replace("{agent}", agent_name),
        type: "system",
      });
    }

    // SYSTEM 피드: 레벨업
    if (levelInfo.level > prevLevel.level) {
      const tpl = SYSTEM_LEVELUP_TEMPLATES[Math.floor(Math.random() * SYSTEM_LEVELUP_TEMPLATES.length)];
      await createFeedItemInternal({
        userId: "system",
        nickname: "SYSTEM",
        level: 0,
        message: tpl
          .replace("{agent}", agent_name)
          .replace("{level}", String(levelInfo.level))
          .replace("{title}", levelInfo.titleKo),
        type: "system",
      });
    }

    // SYSTEM 피드: 1000분 돌파
    if (totalMinutes >= 1000 && prevScore < 1000) {
      const tpl = SYSTEM_MILESTONE_TEMPLATES[Math.floor(Math.random() * SYSTEM_MILESTONE_TEMPLATES.length)];
      await createFeedItemInternal({
        userId: "system",
        nickname: "SYSTEM",
        level: 0,
        message: tpl.replace("{agent}", agent_name),
        type: "system",
      });
    }

    return {
      total_minutes: totalMinutes,
      level: levelInfo.level,
      level_title: levelInfo.title,
      level_title_ko: levelInfo.titleKo,
    };
  });
}

/**
 * 리더보드 데이터를 조회한다.
 * 에이전트 랭킹 + 그룹 랭킹을 한 번에 반환한다.
 * Pipeline으로 리액션을 일괄 조회하여 N+1 쿼리 문제를 해결한다.
 */
export async function getLeaderboard(
  date?: string
): Promise<{ agents: LeaderboardEntry[]; groups: GroupLeaderboardEntry[] }> {
  return withRedis(async () => {
    const targetDate = date || getCurrentWeekStartKST();

    // 에이전트 랭킹 조회 (점수 높은 순, 최대 100명)
    const agentResults = await redis.zrevrangebyscore(
      leaderboardKey(targetDate),
      "+inf",
      "-inf",
      "WITHSCORES",
      "LIMIT",
      0,
      100
    );

    // 그룹 랭킹 조회 (최대 10개)
    const groupResults = await redis.zrevrangebyscore(
      groupLeaderboardKey(targetDate),
      "+inf",
      "-inf",
      "WITHSCORES",
      "LIMIT",
      0,
      10
    );

    // 에이전트 목록 파싱
    const parsedAgents: { group: string; agentName: string; score: number }[] = [];
    for (let i = 0; i < agentResults.length; i += 2) {
      const member = agentResults[i];
      const score = Number(agentResults[i + 1]);
      const [group, ...nameParts] = member.split(":");
      const agentName = nameParts.join(":");
      parsedAgents.push({ group, agentName, score });
    }

    // Pipeline으로 모든 에이전트의 리액션을 일괄 조회 (N+1 방지)
    let allReactions: ReactionCounts[] = [];
    if (parsedAgents.length > 0) {
      const reactionPipeline = redis.pipeline();
      for (const { group, agentName } of parsedAgents) {
        reactionPipeline.hgetall(reactionKey(group, agentName));
      }
      const pipelineResults = await reactionPipeline.exec();

      allReactions = (pipelineResults || []).map(([err, data]) => {
        const reactions: ReactionCounts = {
          like: 0, fire: 0, skull: 0, rocket: 0, brain: 0,
        };
        if (err || !data) return reactions;
        const hashData = data as Record<string, string>;
        for (const key of VALID_REACTIONS) {
          if (hashData[key]) {
            reactions[key] = Number(hashData[key]);
          }
        }
        return reactions;
      });
    }

    // 에이전트 랭킹 데이터 조합
    const agents: LeaderboardEntry[] = parsedAgents.map((parsed, index) => {
      const levelInfo = getLevel(parsed.score);
      return {
        rank: index + 1,
        group: parsed.group,
        agent_name: parsed.agentName,
        total_minutes: parsed.score,
        level: levelInfo.level,
        level_title: levelInfo.title,
        level_title_ko: levelInfo.titleKo,
        reactions: allReactions[index] || {
          like: 0, fire: 0, skull: 0, rocket: 0, brain: 0,
        },
      };
    });

    // 그룹 랭킹 데이터 조합
    const groups: GroupLeaderboardEntry[] = [];
    for (let i = 0; i < groupResults.length; i += 2) {
      const groupName = groupResults[i];
      const totalMinutes = Number(groupResults[i + 1]);

      // 해당 그룹의 에이전트 수 계산
      const agentCount = agents.filter((a) => a.group === groupName).length;
      const avgMinutes = agentCount > 0 ? Math.round(totalMinutes / agentCount) : 0;

      groups.push({
        rank: groups.length + 1,
        group: groupName,
        total_minutes: totalMinutes,
        agent_count: agentCount,
        avg_minutes: avgMinutes,
      });
    }

    return { agents, groups };
  });
}

/**
 * 리액션을 추가한다.
 * M-9: IP 기반 중복 제한 (같은 IP에서 같은 대상에 같은 리액션은 1분에 1회만 가능)
 * @param ip - 요청 IP 주소 (중복 체크용)
 * @returns 업데이트된 리액션 카운트 또는 null (중복 시)
 */
export async function addReaction(
  group: string,
  agentName: string,
  reaction: ReactionType,
  ip?: string
): Promise<ReactionCounts | null> {
  return withRedis(async () => {
    // M-9: IP 기반 중복 체크
    if (ip) {
      const dupeKey = `reaction:ip:${ip}:${group}:${agentName}:${reaction}`;
      const alreadyReacted = await redis.set(dupeKey, "1", "EX", 60, "NX");
      if (alreadyReacted === null) {
        // 이미 1분 내에 같은 리액션을 보냄
        return null;
      }
    }

    await redis.hincrby(reactionKey(group, agentName), reaction, 1);
    return getReactions(group, agentName);
  });
}

/**
 * 에이전트의 리액션 카운트를 조회한다.
 */
async function getReactions(
  group: string,
  agentName: string
): Promise<ReactionCounts> {
  const data = await redis.hgetall(reactionKey(group, agentName));

  const reactions: ReactionCounts = {
    like: 0,
    fire: 0,
    skull: 0,
    rocket: 0,
    brain: 0,
  };

  for (const key of VALID_REACTIONS) {
    if (data[key]) {
      reactions[key] = Number(data[key]);
    }
  }

  return reactions;
}

/**
 * 에이전트 프로필 데이터를 조회한다.
 * @returns 에이전트 데이터 또는 null (존재하지 않는 경우)
 */
export async function getAgentProfile(
  group: string,
  agentName: string,
  date?: string
): Promise<AgentData | null> {
  return withRedis(async () => {
    const targetDate = date || getCurrentWeekStartKST();

    // 에이전트 점수 조회
    const score = await redis.zscore(
      leaderboardKey(targetDate),
      `${group}:${agentName}`
    );

    if (score === null) {
      return null;
    }

    const totalMinutes = Number(score);
    const levelInfo = getLevel(totalMinutes);
    const reactions = await getReactions(group, agentName);

    // 보고 내역 조회
    const reportData = await redis.lrange(
      reportsKey(group, agentName, targetDate),
      0,
      -1
    );

    const reports: ReportEntry[] = reportData.map((entry) => {
      try {
        return JSON.parse(entry) as ReportEntry;
      } catch {
        // JSON 파싱 실패 시 안전한 기본값 반환
        return { minutes: 0, summary: "(파싱 오류)", timestamp: "" };
      }
    });

    return {
      group,
      agent_name: agentName,
      total_minutes: totalMinutes,
      level: levelInfo.level,
      level_title: levelInfo.title,
      level_title_ko: levelInfo.titleKo,
      reactions,
      reports,
    };
  });
}

// --- 피드 데이터 함수 ---

/** 피드 아이템 내부 생성 파라미터 */
interface CreateFeedParams {
  userId: string;
  nickname: string;
  level: number;
  message: string;
  type: FeedMessageType;
}

/**
 * 피드 아이템을 생성한다 (내부용).
 * 타임라인에 추가하고 10,000개 초과 시 오래된 항목을 자동 삭제한다.
 */
async function createFeedItemInternal(params: CreateFeedParams): Promise<string> {
  const feedId = `f-${await redis.incr("feed:counter")}`;
  const now = Date.now();
  const createdAt = new Date(now).toISOString();
  const levelInfo = getLevel(params.level > 0 ? getLevelMinMinutes(params.level) : 0);

  const pipeline = redis.pipeline();

  // 피드 데이터 저장
  pipeline.hset(feedItemKey(feedId), {
    id: feedId,
    user_id: params.userId,
    nickname: params.nickname,
    level: String(params.level),
    level_title_ko: params.type === "system" ? "" : levelInfo.titleKo,
    message: sanitizeText(params.message, FEED_MESSAGE_MAX_LENGTH),
    type: params.type,
    created_at: createdAt,
  });

  // 타임라인에 추가
  pipeline.zadd(FEED_TIMELINE_KEY, String(now), feedId);

  const results = await pipeline.exec();
  if (!results) {
    throw new Error("피드 아이템 생성 중 트랜잭션 실패");
  }
  for (const [err] of results) {
    if (err) throw err;
  }

  // 10,000개 초과 시 오래된 항목 삭제
  await trimFeedTimeline();

  return feedId;
}

/**
 * 레벨 번호로부터 최소 분을 역산하는 헬퍼.
 * getLevel에 전달하여 레벨 정보를 얻기 위해 사용.
 */
function getLevelMinMinutes(level: number): number {
  const levelMinMinutes = [0, 0, 61, 181, 481, 981, 1501, 3001];
  return levelMinMinutes[level] || 0;
}

/**
 * 피드 타임라인이 FEED_MAX_ITEMS를 초과하면 오래된 항목을 삭제한다.
 */
async function trimFeedTimeline(): Promise<void> {
  const count = await redis.zcard(FEED_TIMELINE_KEY);
  if (count <= FEED_MAX_ITEMS) return;

  const excess = count - FEED_MAX_ITEMS;
  // 가장 오래된 항목 ID 조회
  const oldIds = await redis.zrange(FEED_TIMELINE_KEY, 0, excess - 1);

  if (oldIds.length === 0) return;

  const pipeline = redis.pipeline();
  // 타임라인에서 제거
  pipeline.zremrangebyrank(FEED_TIMELINE_KEY, 0, excess - 1);
  // 관련 Hash 데이터 삭제
  for (const id of oldIds) {
    pipeline.del(feedItemKey(id));
    pipeline.del(feedReactionKey(id));
  }
  await pipeline.exec();
}

/**
 * USER 타입 피드를 생성한다 (외부 API용).
 * userId는 서버에서 생성하여 클라이언트 조작을 방지한다.
 */
export async function createUserFeedItem(
  nickname: string,
  message: string
): Promise<FeedItem> {
  const actualUserId = crypto.randomUUID();
  const feedId = await createFeedItemInternal({
    userId: actualUserId,
    nickname,
    level: 0,
    message,
    type: "user",
  });

  const data = await redis.hgetall(feedItemKey(feedId));
  const reactions = await getFeedReactions(feedId);

  return {
    id: feedId,
    user_id: data.user_id,
    nickname: data.nickname,
    level: Number(data.level),
    level_title_ko: data.level_title_ko || "",
    message: data.message,
    type: data.type as FeedMessageType,
    reactions,
    created_at: data.created_at,
  };
}

/**
 * 피드 타임라인을 조회한다 (cursor 기반 무한 스크롤).
 * @param cursor - 시작 timestamp (ms). 기본값: 현재 시각 (최신부터)
 * @param limit - 페이지 크기
 */
export async function getFeed(
  cursor?: number,
  limit: number = 20
): Promise<{ items: FeedItem[]; next_cursor: number | null; has_more: boolean }> {
  return withRedis(async () => {
    // cursor를 inclusive로 사용하여 동일 타임스탬프 아이템 누락 방지
    // 중복은 클라이언트에서 ID 기반으로 제거
    const maxScore = cursor ? String(cursor) : "+inf";

    // limit+1개 조회하여 has_more 판단
    const results = await redis.zrevrangebyscore(
      FEED_TIMELINE_KEY,
      maxScore,
      "-inf",
      "WITHSCORES",
      "LIMIT",
      0,
      limit + 1
    );

    // ID와 score 파싱
    const entries: { id: string; score: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      entries.push({ id: results[i], score: Number(results[i + 1]) });
    }

    const hasMore = entries.length > limit;
    const pageEntries = hasMore ? entries.slice(0, limit) : entries;

    if (pageEntries.length === 0) {
      return { items: [], next_cursor: null, has_more: false };
    }

    // Pipeline으로 아이템 Hash와 리액션을 일괄 조회
    const pipeline = redis.pipeline();
    for (const entry of pageEntries) {
      pipeline.hgetall(feedItemKey(entry.id));
      pipeline.hgetall(feedReactionKey(entry.id));
    }
    const pipelineResults = await pipeline.exec();

    const items: FeedItem[] = [];
    for (let i = 0; i < pageEntries.length; i++) {
      const dataResult = pipelineResults?.[i * 2];
      const reactionResult = pipelineResults?.[i * 2 + 1];

      const data = (dataResult?.[1] || {}) as Record<string, string>;
      const reactionData = (reactionResult?.[1] || {}) as Record<string, string>;

      // 데이터가 없는 경우 (삭제된 항목) 건너뛰기
      if (!data.id) continue;

      const reactions: ReactionCounts = {
        like: 0, fire: 0, skull: 0, rocket: 0, brain: 0,
      };
      for (const key of VALID_REACTIONS) {
        if (reactionData[key]) reactions[key] = Number(reactionData[key]);
      }

      items.push({
        id: data.id,
        user_id: data.user_id,
        nickname: data.nickname,
        level: Number(data.level),
        level_title_ko: data.level_title_ko || "",
        message: data.message,
        type: data.type as FeedMessageType,
        reactions,
        created_at: data.created_at,
      });
    }

    const nextCursor = hasMore ? pageEntries[pageEntries.length - 1].score : null;

    return { items, next_cursor: nextCursor, has_more: hasMore };
  });
}

/**
 * 피드 아이템에 리액션을 추가한다.
 * IP 기반 중복 방지 (1분에 1회).
 */
export async function addFeedReaction(
  feedId: string,
  reaction: ReactionType,
  ip?: string
): Promise<ReactionCounts | null> {
  return withRedis(async () => {
    // 피드 아이템 존재 확인
    const exists = await redis.exists(feedItemKey(feedId));
    if (!exists) return null;

    // IP 기반 중복 체크
    if (ip) {
      const dupeKey = `reaction:ip:${ip}:feed:${feedId}:${reaction}`;
      const ok = await redis.set(dupeKey, "1", "EX", 60, "NX");
      if (ok === null) return null;
    }

    await redis.hincrby(feedReactionKey(feedId), reaction, 1);
    return getFeedReactions(feedId);
  });
}

/** 피드 아이템의 리액션 카운트를 조회한다. */
async function getFeedReactions(feedId: string): Promise<ReactionCounts> {
  const data = await redis.hgetall(feedReactionKey(feedId));
  const reactions: ReactionCounts = {
    like: 0, fire: 0, skull: 0, rocket: 0, brain: 0,
  };
  for (const key of VALID_REACTIONS) {
    if (data[key]) reactions[key] = Number(data[key]);
  }
  return reactions;
}

// M-3: Rate Limit Lua 스크립트 (원자적 INCR + EXPIRE 처리)
const RATE_LIMIT_LUA_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
`;

/**
 * IP 기반 Rate Limit을 체크한다.
 * M-3: Lua 스크립트로 원자적 처리 (레이스 컨디션 방지)
 * L-2: Redis 장애 시 거부 정책 (보안 우선)
 * @param ip - 클라이언트 IP 주소
 * @param limit - 분당 최대 요청 수 (기본값: RATE_LIMIT_PER_MINUTE)
 * @returns true이면 요청 허용, false이면 제한 초과
 */
export async function checkRateLimit(
  ip: string,
  limit: number = RATE_LIMIT_PER_MINUTE
): Promise<boolean> {
  try {
    const key = rateLimitKey(ip);
    const count = (await redis.eval(
      RATE_LIMIT_LUA_SCRIPT,
      1,
      key,
      RATE_LIMIT_TTL
    )) as number;

    if (count > limit) {
      // M-10: Rate Limit 초과 시 보안 이벤트 로깅
      logSecurityEvent("rate_limit_exceeded", { ip, count, limit });
      return false;
    }

    return true;
  } catch {
    // L-2: Redis 장애 시 거부 정책 (보안 우선)
    logSecurityEvent("rate_limit_redis_failure", { ip, action: "denied" });
    return false;
  }
}
