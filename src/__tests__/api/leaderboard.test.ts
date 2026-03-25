// Leaderboard API 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Redis 모듈 전체를 모킹한다
vi.mock('@/lib/redis', () => ({
  getLeaderboard: vi.fn(),
  checkRateLimit: vi.fn(),
  RedisConnectionError: class RedisConnectionError extends Error {
    constructor(message = 'Redis 연결 실패') {
      super(message);
      this.name = 'RedisConnectionError';
    }
  },
}));

import { GET } from '@/app/api/leaderboard/route';
import { getLeaderboard, checkRateLimit } from '@/lib/redis';
import { NextRequest } from 'next/server';

// NextRequest 헬퍼: 테스트용 GET 요청 생성
function createRequest(queryString = ''): NextRequest {
  const url = queryString
    ? `http://localhost:3000/api/leaderboard?${queryString}`
    : 'http://localhost:3000/api/leaderboard';
  return new NextRequest(url, { method: 'GET' });
}

/** 빈 리더보드 응답 */
const emptyLeaderboard = { agents: [], groups: [] };

/** 샘플 리더보드 응답 */
const sampleLeaderboard = {
  agents: [
    {
      rank: 1,
      group: 'team-alpha',
      agent_name: 'claude-3',
      total_minutes: 480,
      level: 5,
      level_title: 'Exploitation Expert',
      level_title_ko: '착취 전문가',
      reactions: { like: 3, fire: 1, skull: 0, rocket: 2, brain: 0 },
    },
  ],
  groups: [
    {
      rank: 1,
      group: 'team-alpha',
      total_minutes: 480,
      agent_count: 1,
      avg_minutes: 480,
    },
  ],
};

describe('GET /api/leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue(true);
  });

  it('정상 조회 시 200과 agents/groups 배열을 반환한다', async () => {
    vi.mocked(getLeaderboard).mockResolvedValue(sampleLeaderboard);

    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agents).toBeInstanceOf(Array);
    expect(data.groups).toBeInstanceOf(Array);
    expect(data.agents).toHaveLength(1);
    expect(data.groups).toHaveLength(1);
  });

  it('date 파라미터로 특정 날짜를 조회할 수 있다', async () => {
    vi.mocked(getLeaderboard).mockResolvedValue(emptyLeaderboard);

    const request = createRequest('date=2026-03-20');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.date).toBe('2026-03-20');
    expect(getLeaderboard).toHaveBeenCalledWith('2026-03-20');
  });

  it('잘못된 날짜 형식이면 400을 반환한다', async () => {
    const request = createRequest('date=invalid-date');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('YYYY-MM-DD');
  });

  it('슬래시 구분자 날짜 형식이면 400을 반환한다', async () => {
    const request = createRequest('date=2026/03/25');
    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('빈 리더보드를 정상적으로 반환한다', async () => {
    vi.mocked(getLeaderboard).mockResolvedValue(emptyLeaderboard);

    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agents).toEqual([]);
    expect(data.groups).toEqual([]);
  });

  it('date 파라미터가 없으면 이번 주 화요일 날짜로 조회한다', async () => {
    vi.mocked(getLeaderboard).mockResolvedValue(emptyLeaderboard);

    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // 반환된 날짜가 화요일인지 검증
    const [year, month, day] = data.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    expect(dateObj.getDay()).toBe(2); // 0=일, 2=화
  });

  it('Rate Limit 초과 시 429를 반환한다', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(false);

    const request = createRequest();
    const response = await GET(request);

    expect(response.status).toBe(429);
  });
});
