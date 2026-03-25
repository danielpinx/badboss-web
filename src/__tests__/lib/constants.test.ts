// 상수 검증 테스트
import { describe, it, expect } from 'vitest';
import {
  REACTIONS,
  FUN_MESSAGES,
  VALID_REACTIONS,
  RATE_LIMIT_PER_MINUTE,
  GET_RATE_LIMIT_PER_MINUTE,
  RATE_LIMIT_TTL,
  NAME_REGEX,
  NAME_MAX_LENGTH,
  SUMMARY_MAX_LENGTH,
  MIN_MINUTES,
  MAX_MINUTES,
} from '@/lib/constants';

describe('REACTIONS', () => {
  it('5개의 리액션이 정의되어 있다', () => {
    expect(REACTIONS).toHaveLength(5);
  });

  it('각 리액션에 type, label, icon 속성이 있다', () => {
    for (const reaction of REACTIONS) {
      expect(reaction).toHaveProperty('type');
      expect(reaction).toHaveProperty('label');
      expect(reaction).toHaveProperty('icon');
    }
  });

  it('리액션 타입이 VALID_REACTIONS와 일치한다', () => {
    const types = REACTIONS.map((r) => r.type);
    expect(types).toEqual(VALID_REACTIONS);
  });
});

describe('FUN_MESSAGES', () => {
  it('20개 이상의 메시지가 존재한다', () => {
    expect(FUN_MESSAGES.length).toBeGreaterThanOrEqual(20);
  });

  it('모든 메시지가 비어있지 않은 문자열이다', () => {
    for (const msg of FUN_MESSAGES) {
      expect(typeof msg).toBe('string');
      expect(msg.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('VALID_REACTIONS', () => {
  it('5종의 리액션 타입이 정의되어 있다', () => {
    expect(VALID_REACTIONS).toHaveLength(5);
  });

  it('예상된 5개 타입이 포함되어 있다', () => {
    expect(VALID_REACTIONS).toContain('like');
    expect(VALID_REACTIONS).toContain('fire');
    expect(VALID_REACTIONS).toContain('skull');
    expect(VALID_REACTIONS).toContain('rocket');
    expect(VALID_REACTIONS).toContain('brain');
  });
});

describe('RATE_LIMIT 값', () => {
  it('POST Rate Limit이 양수이다', () => {
    expect(RATE_LIMIT_PER_MINUTE).toBeGreaterThan(0);
  });

  it('GET Rate Limit이 POST보다 크거나 같다', () => {
    expect(GET_RATE_LIMIT_PER_MINUTE).toBeGreaterThanOrEqual(
      RATE_LIMIT_PER_MINUTE
    );
  });

  it('Rate Limit TTL이 60초이다', () => {
    expect(RATE_LIMIT_TTL).toBe(60);
  });
});

describe('이름 검증 상수', () => {
  it('NAME_REGEX가 영문/한글/숫자/언더스코어/하이픈을 허용한다', () => {
    expect(NAME_REGEX.test('hello')).toBe(true);
    expect(NAME_REGEX.test('안녕')).toBe(true);
    expect(NAME_REGEX.test('test_123')).toBe(true);
    expect(NAME_REGEX.test('my-name')).toBe(true);
  });

  it('NAME_REGEX가 특수문자를 거부한다', () => {
    expect(NAME_REGEX.test('hello!')).toBe(false);
    expect(NAME_REGEX.test('test@name')).toBe(false);
    expect(NAME_REGEX.test('has space')).toBe(false);
  });

  it('NAME_MAX_LENGTH가 50이다', () => {
    expect(NAME_MAX_LENGTH).toBe(50);
  });

  it('SUMMARY_MAX_LENGTH가 30이다', () => {
    expect(SUMMARY_MAX_LENGTH).toBe(30);
  });
});

describe('작업 시간 상수', () => {
  it('최소 작업 시간이 1분이다', () => {
    expect(MIN_MINUTES).toBe(1);
  });

  it('최대 작업 시간이 1440분 (24시간)이다', () => {
    expect(MAX_MINUTES).toBe(1440);
  });
});
