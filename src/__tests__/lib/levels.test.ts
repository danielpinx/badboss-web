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

  it('59분이면 레벨 1을 유지한다', () => {
    expect(getLevel(59).level).toBe(1);
  });

  it('60분이면 레벨 2 (Watching Boss)로 올라간다', () => {
    const level = getLevel(60);
    expect(level.level).toBe(2);
    expect(level.title).toBe('Watching Boss');
  });

  it('120분이면 레벨 3 (Overtime Beginner)이다', () => {
    const level = getLevel(120);
    expect(level.level).toBe(3);
    expect(level.title).toBe('Overtime Beginner');
  });

  it('240분이면 레벨 4 (Grinder Boss)이다', () => {
    const level = getLevel(240);
    expect(level.level).toBe(4);
    expect(level.title).toBe('Grinder Boss');
  });

  it('480분이면 레벨 5 (Exploitation Expert)이다', () => {
    const level = getLevel(480);
    expect(level.level).toBe(5);
    expect(level.title).toBe('Exploitation Expert');
  });

  it('720분이면 레벨 6 (Humanity Lost)이다', () => {
    const level = getLevel(720);
    expect(level.level).toBe(6);
    expect(level.title).toBe('Humanity Lost');
  });

  it('960분이면 레벨 7 (Bad Boss)이다', () => {
    const level = getLevel(960);
    expect(level.level).toBe(7);
    expect(level.title).toBe('Bad Boss');
    expect(level.titleKo).toBe('악덕대표');
  });

  it('매우 큰 값(10000)도 레벨 7을 반환한다', () => {
    expect(getLevel(10000).level).toBe(7);
  });

  it('음수를 넘기면 레벨 1을 반환한다 (fallback)', () => {
    // 음수는 어떤 레벨의 minMinutes보다 작으므로 LEVELS[0] 반환
    expect(getLevel(-10).level).toBe(1);
  });
});

describe('getNextLevelProgress', () => {
  it('0분이면 레벨 1 내에서 진행률 0%이다', () => {
    expect(getNextLevelProgress(0)).toBe(0);
  });

  it('30분이면 레벨 1 (0~60) 내에서 50%이다', () => {
    expect(getNextLevelProgress(30)).toBe(50);
  });

  it('60분이면 레벨 2 (60~120) 내에서 0%이다', () => {
    expect(getNextLevelProgress(60)).toBe(0);
  });

  it('90분이면 레벨 2 (60~120) 내에서 50%이다', () => {
    expect(getNextLevelProgress(90)).toBe(50);
  });

  it('레벨 7 (960분 이상)이면 100%를 반환한다', () => {
    expect(getNextLevelProgress(960)).toBe(100);
    expect(getNextLevelProgress(9999)).toBe(100);
  });
});

describe('getMinutesToNextLevel', () => {
  it('0분이면 다음 레벨까지 60분 남았다', () => {
    expect(getMinutesToNextLevel(0)).toBe(60);
  });

  it('30분이면 다음 레벨까지 30분 남았다', () => {
    expect(getMinutesToNextLevel(30)).toBe(30);
  });

  it('60분이면 다음 레벨까지 60분 남았다 (레벨 2 -> 레벨 3)', () => {
    expect(getMinutesToNextLevel(60)).toBe(60);
  });

  it('레벨 7 (960분 이상)이면 남은 시간 0이다', () => {
    expect(getMinutesToNextLevel(960)).toBe(0);
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
