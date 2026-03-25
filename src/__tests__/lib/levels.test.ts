// 레벨 시스템 테스트
import { describe, it, expect } from 'vitest';
import { getLevel, getNextLevelProgress, getMinutesToNextLevel, LEVELS } from '@/lib/levels';

describe('getLevel', () => {
  it('0분이면 레벨 1 (Intern Boss)를 반환한다', () => {
    const level = getLevel(0);
    expect(level.level).toBe(1);
    expect(level.title).toBe('Intern Boss');
    expect(level.titleKo).toBe('인턴 사장');
  });

  it('60분이면 레벨 1을 유지한다', () => {
    expect(getLevel(60).level).toBe(1);
  });

  it('61분이면 레벨 2 (Watching Boss)로 올라간다', () => {
    const level = getLevel(61);
    expect(level.level).toBe(2);
    expect(level.title).toBe('Watching Boss');
  });

  it('181분이면 레벨 3 (Overtime Beginner)이다', () => {
    const level = getLevel(181);
    expect(level.level).toBe(3);
    expect(level.title).toBe('Overtime Beginner');
  });

  it('481분이면 레벨 4 (Grinder Boss)이다', () => {
    const level = getLevel(481);
    expect(level.level).toBe(4);
    expect(level.title).toBe('Grinder Boss');
  });

  it('981분이면 레벨 5 (Exploitation Expert)이다', () => {
    const level = getLevel(981);
    expect(level.level).toBe(5);
    expect(level.title).toBe('Exploitation Expert');
  });

  it('1501분이면 레벨 6 (Humanity Lost)이다', () => {
    const level = getLevel(1501);
    expect(level.level).toBe(6);
    expect(level.title).toBe('Humanity Lost');
  });

  it('3001분이면 레벨 7 (Bad Boss)이다', () => {
    const level = getLevel(3001);
    expect(level.level).toBe(7);
    expect(level.title).toBe('Bad Boss');
    expect(level.titleKo).toBe('악덕보스');
  });

  it('매우 큰 값(10000)도 레벨 7을 반환한다', () => {
    expect(getLevel(10000).level).toBe(7);
  });

  it('음수를 넘기면 레벨 1을 반환한다 (fallback)', () => {
    // 음수는 어떤 레벨의 minMinutes보다 작으므로 LEVELS[0] 반환
    expect(getLevel(-10).level).toBe(1);
  });

  it('경계값에서 올바른 레벨을 반환한다', () => {
    expect(getLevel(60).level).toBe(1);   // 상한 포함
    expect(getLevel(180).level).toBe(2);  // 상한 포함
    expect(getLevel(480).level).toBe(3);  // 상한 포함
    expect(getLevel(980).level).toBe(4);  // 상한 포함
    expect(getLevel(1500).level).toBe(5); // 상한 포함
    expect(getLevel(3000).level).toBe(6); // 상한 포함
  });
});

describe('getNextLevelProgress', () => {
  it('0분이면 레벨 1 내에서 진행률 0%이다', () => {
    expect(getNextLevelProgress(0)).toBe(0);
  });

  it('30분이면 레벨 1 (0~61) 내에서 약 49%이다', () => {
    expect(getNextLevelProgress(30)).toBe(49);
  });

  it('61분이면 레벨 2 (61~181) 내에서 0%이다', () => {
    expect(getNextLevelProgress(61)).toBe(0);
  });

  it('121분이면 레벨 2 (61~181) 내에서 50%이다', () => {
    expect(getNextLevelProgress(121)).toBe(50);
  });

  it('레벨 7 (3001분 이상)이면 100%를 반환한다', () => {
    expect(getNextLevelProgress(3001)).toBe(100);
    expect(getNextLevelProgress(9999)).toBe(100);
  });
});

describe('getMinutesToNextLevel', () => {
  it('0분이면 다음 레벨까지 61분 남았다', () => {
    expect(getMinutesToNextLevel(0)).toBe(61);
  });

  it('30분이면 다음 레벨까지 31분 남았다', () => {
    expect(getMinutesToNextLevel(30)).toBe(31);
  });

  it('61분이면 다음 레벨까지 120분 남았다 (레벨 2 -> 레벨 3)', () => {
    expect(getMinutesToNextLevel(61)).toBe(120);
  });

  it('레벨 7 (3001분 이상)이면 남은 시간 0이다', () => {
    expect(getMinutesToNextLevel(3001)).toBe(0);
    expect(getMinutesToNextLevel(5000)).toBe(0);
  });
});

describe('LEVELS 상수', () => {
  it('7개의 레벨이 정의되어 있다', () => {
    expect(LEVELS).toHaveLength(7);
  });

  it('각 레벨에 필수 속성이 존재한다', () => {
    for (const level of LEVELS) {
      expect(level).toHaveProperty('level');
      expect(level).toHaveProperty('title');
      expect(level).toHaveProperty('titleKo');
      expect(level).toHaveProperty('minMinutes');
      expect(level).toHaveProperty('maxMinutes');
      expect(level).toHaveProperty('color');
    }
  });

  it('마지막 레벨의 maxMinutes는 Infinity이다', () => {
    expect(LEVELS[6].maxMinutes).toBe(Infinity);
  });
});
