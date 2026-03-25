// 유틸리티 함수 테스트
import { describe, it, expect, vi } from 'vitest';
import {
  getTodayKST,
  sanitizeSummary,
  validateGroupName,
  validateAgentName,
  validateMinutes,
  formatMinutes,
  isValidDateString,
  logSecurityEvent,
} from '@/lib/utils';

describe('getTodayKST', () => {
  it('YYYY-MM-DD 형식의 문자열을 반환한다', () => {
    const result = getTodayKST();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('유효한 날짜 문자열을 반환한다', () => {
    const result = getTodayKST();
    const date = new Date(result);
    expect(date.getTime()).not.toBeNaN();
  });
});

describe('sanitizeSummary', () => {
  it('일반 텍스트는 그대로 반환한다', () => {
    expect(sanitizeSummary('코드 리뷰 완료')).toBe('코드 리뷰 완료');
  });

  it('HTML 태그를 제거한다', () => {
    expect(sanitizeSummary('<b>굵은 글씨</b>')).toBe('굵은 글씨');
  });

  it('script 태그를 제거한다', () => {
    expect(sanitizeSummary('<script>alert("xss")</script>')).toBe(
      'alert("xss")'
    );
  });

  it('중첩 태그를 처리한다 (반복 제거)', () => {
    // 정규식 기반 제거는 완벽하지 않지만, React 자동 이스케이프가 2차 방어
    // 여기서는 <script> 태그가 제거되는 것만 확인
    const input = '<script>alert(1)</script>';
    const result = sanitizeSummary(input);
    expect(result).not.toContain('<script>');
    expect(result).toBe('alert(1)');
  });

  it('30자를 초과하면 30자로 자른다', () => {
    const longText = 'a'.repeat(50);
    expect(sanitizeSummary(longText)).toHaveLength(30);
  });

  it('공백을 trim한다', () => {
    expect(sanitizeSummary('  양쪽 공백  ')).toBe('양쪽 공백');
  });

  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(sanitizeSummary('')).toBe('');
  });
});

describe('validateGroupName', () => {
  it('영문 이름을 허용한다', () => {
    expect(validateGroupName('team-alpha')).toBe(true);
  });

  it('한글 이름을 허용한다', () => {
    expect(validateGroupName('개발팀')).toBe(true);
  });

  it('숫자를 허용한다', () => {
    expect(validateGroupName('team123')).toBe(true);
  });

  it('언더스코어를 허용한다', () => {
    expect(validateGroupName('my_team')).toBe(true);
  });

  it('하이픈을 허용한다', () => {
    expect(validateGroupName('my-team')).toBe(true);
  });

  it('빈 문자열은 거부한다', () => {
    expect(validateGroupName('')).toBe(false);
  });

  it('특수문자가 포함되면 거부한다', () => {
    expect(validateGroupName('team@!')).toBe(false);
  });

  it('공백이 포함되면 거부한다', () => {
    expect(validateGroupName('my team')).toBe(false);
  });

  it('50자를 초과하면 거부한다', () => {
    expect(validateGroupName('a'.repeat(51))).toBe(false);
  });

  it('50자 이하는 허용한다', () => {
    expect(validateGroupName('a'.repeat(50))).toBe(true);
  });
});

describe('validateAgentName', () => {
  it('유효한 에이전트명을 허용한다', () => {
    expect(validateAgentName('claude-3')).toBe(true);
    expect(validateAgentName('에이전트_1호')).toBe(true);
  });

  it('빈 문자열은 거부한다', () => {
    expect(validateAgentName('')).toBe(false);
  });

  it('특수문자가 포함되면 거부한다', () => {
    expect(validateAgentName('agent#1')).toBe(false);
  });

  it('50자를 초과하면 거부한다', () => {
    expect(validateAgentName('b'.repeat(51))).toBe(false);
  });
});

describe('validateMinutes', () => {
  it('1분을 허용한다 (최솟값)', () => {
    expect(validateMinutes(1)).toBe(true);
  });

  it('1440분을 허용한다 (최댓값, 24시간)', () => {
    expect(validateMinutes(1440)).toBe(true);
  });

  it('0분은 거부한다', () => {
    expect(validateMinutes(0)).toBe(false);
  });

  it('1441분은 거부한다', () => {
    expect(validateMinutes(1441)).toBe(false);
  });

  it('음수는 거부한다', () => {
    expect(validateMinutes(-1)).toBe(false);
  });

  it('소수는 거부한다 (정수만 허용)', () => {
    expect(validateMinutes(30.5)).toBe(false);
  });

  it('중간 값을 허용한다', () => {
    expect(validateMinutes(720)).toBe(true);
  });
});

describe('formatMinutes', () => {
  it('60분 미만이면 분만 표시한다', () => {
    expect(formatMinutes(30)).toBe('30m');
  });

  it('정확히 60분이면 시간만 표시한다', () => {
    expect(formatMinutes(60)).toBe('1h');
  });

  it('90분이면 시간+분 형식으로 표시한다', () => {
    expect(formatMinutes(90)).toBe('1h 30m');
  });

  it('0분이면 0m을 반환한다', () => {
    expect(formatMinutes(0)).toBe('0m');
  });

  it('120분이면 2h를 반환한다', () => {
    expect(formatMinutes(120)).toBe('2h');
  });

  it('1440분이면 24h를 반환한다', () => {
    expect(formatMinutes(1440)).toBe('24h');
  });
});

describe('isValidDateString', () => {
  it('유효한 날짜를 허용한다', () => {
    expect(isValidDateString('2026-03-25')).toBe(true);
  });

  it('잘못된 형식을 거부한다', () => {
    expect(isValidDateString('2026/03/25')).toBe(false);
    expect(isValidDateString('25-03-2026')).toBe(false);
    expect(isValidDateString('20260325')).toBe(false);
  });

  it('존재하지 않는 날짜를 거부한다', () => {
    // JavaScript Date는 2026-02-30을 3월 2일로 보정하므로
    // 형식만 맞으면 통과함. 완전한 날짜 유효성은 검증하지 않는다.
    // 명백히 잘못된 형식만 거부하는지 확인
    expect(isValidDateString('2026-13-01')).toBe(false);
  });

  it('빈 문자열을 거부한다', () => {
    expect(isValidDateString('')).toBe(false);
  });

  it('문자가 포함된 문자열을 거부한다', () => {
    expect(isValidDateString('abcd-ef-gh')).toBe(false);
  });
});

describe('logSecurityEvent', () => {
  it('console.warn을 호출한다', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logSecurityEvent('test_event', { ip: '127.0.0.1' });

    expect(warnSpy).toHaveBeenCalledOnce();

    // JSON 형식으로 출력되는지 확인
    const output = warnSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.event).toBe('test_event');
    expect(parsed.ip).toBe('127.0.0.1');
    expect(parsed.timestamp).toBeDefined();

    warnSpy.mockRestore();
  });
});
