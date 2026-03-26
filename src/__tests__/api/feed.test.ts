// Feed API 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/redis', () => ({
  createUserFeedItem: vi.fn(),
  getFeed: vi.fn(),
  checkRateLimit: vi.fn(),
  RedisConnectionError: class RedisConnectionError extends Error {
    constructor(message = 'Redis 연결 실패') {
      super(message);
      this.name = 'RedisConnectionError';
    }
  },
}));

import { GET, POST } from '@/app/api/feed/route';
import { createUserFeedItem, getFeed, checkRateLimit } from '@/lib/redis';
import { NextRequest } from 'next/server';

function createGetRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost:3000/api/feed');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url, { method: 'GET' });
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/feed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const emptyFeed = { items: [], next_cursor: null, has_more: false };

const sampleFeedItem = {
  id: 'f-1',
  user_id: 'test-uuid',
  nickname: '테스트',
  level: 0,
  level_title_ko: '',
  message: '테스트 메시지',
  type: 'user' as const,
  reactions: { like: 0, fire: 0, skull: 0, rocket: 0, brain: 0 },
  created_at: new Date().toISOString(),
};

describe('GET /api/feed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue(true);
  });

  it('피드 목록을 반환한다', async () => {
    vi.mocked(getFeed).mockResolvedValue(emptyFeed);

    const response = await GET(createGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toEqual([]);
    expect(data.has_more).toBe(false);
  });

  it('cursor 파라미터를 전달한다', async () => {
    vi.mocked(getFeed).mockResolvedValue(emptyFeed);

    await GET(createGetRequest({ cursor: '1711367400000' }));
    expect(getFeed).toHaveBeenCalledWith(1711367400000, 20);
  });

  it('잘못된 cursor는 400을 반환한다', async () => {
    const response = await GET(createGetRequest({ cursor: 'invalid' }));
    expect(response.status).toBe(400);
  });

  it('Rate Limit 초과 시 429를 반환한다', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(false);

    const response = await GET(createGetRequest());
    expect(response.status).toBe(429);
  });
});

describe('POST /api/feed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue(true);
    vi.mocked(createUserFeedItem).mockResolvedValue(sampleFeedItem);
  });

  it('새 피드를 생성한다', async () => {
    const response = await POST(
      createPostRequest({ nickname: '테스트', message: '테스트 메시지' })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.item.id).toBe('f-1');
  });

  it('닉네임이 없으면 400을 반환한다', async () => {
    const response = await POST(
      createPostRequest({ message: '테스트' })
    );
    expect(response.status).toBe(400);
  });

  it('메시지가 없으면 400을 반환한다', async () => {
    const response = await POST(
      createPostRequest({ nickname: '테스트' })
    );
    expect(response.status).toBe(400);
  });

  it('닉네임이 20자를 초과하면 400을 반환한다', async () => {
    const response = await POST(
      createPostRequest({ nickname: 'a'.repeat(21), message: '테스트' })
    );
    expect(response.status).toBe(400);
  });

  it('빈 메시지는 400을 반환한다', async () => {
    const response = await POST(
      createPostRequest({ nickname: '테스트', message: '   ' })
    );
    expect(response.status).toBe(400);
  });

  it('Rate Limit 초과 시 429를 반환한다', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(false);

    const response = await POST(
      createPostRequest({ nickname: '테스트', message: '테스트' })
    );
    expect(response.status).toBe(429);
  });

  it('잘못된 JSON은 400을 반환한다', async () => {
    const request = new NextRequest('http://localhost:3000/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
