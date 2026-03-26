// Feed React API 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/redis', () => ({
  addFeedReaction: vi.fn(),
  checkRateLimit: vi.fn(),
  RedisConnectionError: class RedisConnectionError extends Error {
    constructor(message = 'Redis 연결 실패') {
      super(message);
      this.name = 'RedisConnectionError';
    }
  },
}));

import { POST } from '@/app/api/feed/react/route';
import { addFeedReaction, checkRateLimit } from '@/lib/redis';
import { NextRequest } from 'next/server';

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/feed/react', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const sampleReactions = { like: 1, fire: 0, skull: 0, rocket: 0, brain: 0 };

describe('POST /api/feed/react', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue(true);
  });

  it('피드에 리액션을 추가한다', async () => {
    vi.mocked(addFeedReaction).mockResolvedValue(sampleReactions);

    const response = await POST(
      createRequest({ feed_id: 'f-1', reaction: 'like' })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.reactions.like).toBe(1);
  });

  it('잘못된 feed_id는 400을 반환한다', async () => {
    const response = await POST(
      createRequest({ feed_id: 'invalid', reaction: 'like' })
    );
    expect(response.status).toBe(400);
  });

  it('숫자가 아닌 feed_id 접미사는 400을 반환한다', async () => {
    const response = await POST(
      createRequest({ feed_id: 'f-abc', reaction: 'like' })
    );
    expect(response.status).toBe(400);
  });

  it('feed_id가 없으면 400을 반환한다', async () => {
    const response = await POST(
      createRequest({ reaction: 'like' })
    );
    expect(response.status).toBe(400);
  });

  it('잘못된 reaction은 400을 반환한다', async () => {
    const response = await POST(
      createRequest({ feed_id: 'f-1', reaction: 'invalid' })
    );
    expect(response.status).toBe(400);
  });

  it('중복 리액션 시 409를 반환한다', async () => {
    vi.mocked(addFeedReaction).mockResolvedValue(null);

    const response = await POST(
      createRequest({ feed_id: 'f-1', reaction: 'like' })
    );
    expect(response.status).toBe(409);
  });

  it('Rate Limit 초과 시 429를 반환한다', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(false);

    const response = await POST(
      createRequest({ feed_id: 'f-1', reaction: 'like' })
    );
    expect(response.status).toBe(429);
  });
});
