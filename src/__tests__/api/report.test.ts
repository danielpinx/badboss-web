// Report API 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Redis 모듈 전체를 모킹한다
vi.mock('@/lib/redis', () => ({
  submitReport: vi.fn(),
  checkRateLimit: vi.fn(),
  RedisConnectionError: class RedisConnectionError extends Error {
    constructor(message = 'Redis 연결 실패') {
      super(message);
      this.name = 'RedisConnectionError';
    }
  },
}));

import { POST } from '@/app/api/report/route';
import { submitReport, checkRateLimit } from '@/lib/redis';
import { NextRequest } from 'next/server';

// NextRequest 헬퍼: 테스트용 POST 요청 생성
function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본적으로 Rate Limit을 통과시킨다
    vi.mocked(checkRateLimit).mockResolvedValue(true);
  });

  it('유효한 보고 요청에 200을 반환한다', async () => {
    vi.mocked(submitReport).mockResolvedValue({
      total_minutes: 120,
      level: 3,
      level_title: 'Overtime Beginner',
      level_title_ko: '야근 입문자',
    });

    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      minutes: 60,
      summary: '코드 리뷰 완료',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.agent.group).toBe('team-alpha');
    expect(data.agent.agent_name).toBe('claude-3');
    expect(data.agent.total_minutes).toBe(120);
    expect(data.agent.level).toBe(3);
  });

  it('group이 누락되면 400을 반환한다', async () => {
    const request = createRequest({
      agent_name: 'claude-3',
      minutes: 60,
      summary: '작업',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('group');
  });

  it('agent_name이 누락되면 400을 반환한다', async () => {
    const request = createRequest({
      group: 'team-alpha',
      minutes: 60,
      summary: '작업',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('agent_name');
  });

  it('minutes가 누락되면 400을 반환한다', async () => {
    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      summary: '작업',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('minutes');
  });

  it('summary가 누락되면 400을 반환한다', async () => {
    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      minutes: 60,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('summary');
  });

  it('group에 특수문자가 포함되면 400을 반환한다', async () => {
    const request = createRequest({
      group: 'team@invalid!',
      agent_name: 'claude-3',
      minutes: 60,
      summary: '작업',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('minutes가 0이면 400을 반환한다', async () => {
    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      minutes: 0,
      summary: '작업',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('minutes가 1441이면 400을 반환한다', async () => {
    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      minutes: 1441,
      summary: '작업',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('summary에 HTML 태그가 있으면 자동으로 제거된다', async () => {
    vi.mocked(submitReport).mockResolvedValue({
      total_minutes: 60,
      level: 2,
      level_title: 'Watching Boss',
      level_title_ko: '감시 사장',
    });

    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      minutes: 60,
      summary: '<b>작업</b> 완료',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // submitReport가 새니타이즈된 summary로 호출되었는지 확인
    expect(submitReport).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: '작업 완료',
      })
    );
  });

  it('Rate Limit 초과 시 429를 반환한다', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(false);

    const request = createRequest({
      group: 'team-alpha',
      agent_name: 'claude-3',
      minutes: 60,
      summary: '작업',
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });
});
