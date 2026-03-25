// React (리액션) API 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Redis 모듈 전체를 모킹한다
vi.mock('@/lib/redis', () => ({
  addReaction: vi.fn(),
  checkRateLimit: vi.fn(),
  RedisConnectionError: class RedisConnectionError extends Error {
    constructor(message = 'Redis 연결 실패') {
      super(message);
      this.name = 'RedisConnectionError';
    }
  },
}));

import { POST } from '@/app/api/react/route';
import { addReaction, checkRateLimit } from '@/lib/redis';
import { NextRequest } from 'next/server';

// NextRequest 헬퍼: 테스트용 POST 요청 생성
function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/react', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** 기본 리액션 카운트 */
const defaultReactions = {
  like: 1,
  fire: 0,
  skull: 0,
  rocket: 0,
  brain: 0,
};

describe('POST /api/react', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue(true);
  });

  it('유효한 리액션 요청에 200을 반환한다', async () => {
    vi.mocked(addReaction).mockResolvedValue(defaultReactions);

    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      reaction: 'like',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.reactions).toEqual(defaultReactions);
  });

  it('잘못된 리액션 타입이면 400을 반환한다', async () => {
    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      reaction: 'invalid_reaction',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('reaction');
  });

  it('group이 누락되면 400을 반환한다', async () => {
    const request = createRequest({
      agent_name: 'claude-3',
      reaction: 'like',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('agent_name이 누락되면 400을 반환한다', async () => {
    const request = createRequest({
      group: 'team-alpha',
      reaction: 'like',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('reaction이 누락되면 400을 반환한다', async () => {
    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('중복 리액션이면 429를 반환한다 (addReaction이 null 반환)', async () => {
    vi.mocked(addReaction).mockResolvedValue(null);

    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      reaction: 'fire',
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it('Rate Limit 초과 시 429를 반환한다', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(false);

    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      reaction: 'like',
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it('모든 유효한 리액션 타입이 허용된다', async () => {
    vi.mocked(addReaction).mockResolvedValue(defaultReactions);

    const validTypes = ['like', 'fire', 'skull', 'rocket', 'brain'];

    for (const type of validTypes) {
      const request = createRequest({
        group: 'team-alpha',
        agent_name: 'claude-3',
        reaction: type,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });
});
