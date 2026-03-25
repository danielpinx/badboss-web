// 레벨 뱃지 컴포넌트 테스트
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LevelBadge } from '@/components/level-badge';

// 각 레벨별 테스트 데이터
const levelData = [
  { level: 1, title: 'Intern Boss', titleKo: '인턴 사장' },
  { level: 2, title: 'Watching Boss', titleKo: '감시 사장' },
  { level: 3, title: 'Overtime Beginner', titleKo: '야근 입문자' },
  { level: 4, title: 'Grinder Boss', titleKo: '갈아넣기 사장' },
  { level: 5, title: 'Exploitation Expert', titleKo: '착취 전문가' },
  { level: 6, title: 'Humanity Lost', titleKo: '인간성 상실' },
  { level: 7, title: 'Bad Boss', titleKo: '악덕보스' },
];

describe('LevelBadge', () => {
  it.each(levelData)(
    '레벨 $level에서 올바른 타이틀 "$title"을 렌더링한다',
    ({ level, title, titleKo }) => {
      render(<LevelBadge level={level} title={title} titleKo={titleKo} />);

      // 레벨 번호가 표시되는지 확인
      expect(screen.getByText(`Lv.${level}`)).toBeInTheDocument();

      // 영문 타이틀이 DOM에 존재하는지 확인 (sm 화면에서는 숨겨짐)
      expect(screen.getByText(title)).toBeInTheDocument();

      // 한글 타이틀이 DOM에 존재하는지 확인
      expect(screen.getByText(titleKo)).toBeInTheDocument();
    }
  );

  it('레벨 7에 animate-pulse-neon 클래스가 적용된다 (글로우 애니메이션)', () => {
    const { container } = render(
      <LevelBadge level={7} title="Bad Boss" titleKo="악덕보스" />
    );

    // 최상위 뱃지 요소에서 애니메이션 클래스 확인
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain('animate-pulse-neon');
  });

  it('레벨 7에 글로우 boxShadow 스타일이 적용된다', () => {
    const { container } = render(
      <LevelBadge level={7} title="Bad Boss" titleKo="악덕보스" />
    );

    const badge = container.firstElementChild as HTMLElement;
    expect(badge.style.boxShadow).toContain('#ff0040');
  });

  it('레벨 1에는 animate-pulse-neon 클래스가 적용되지 않는다', () => {
    const { container } = render(
      <LevelBadge level={1} title="Intern Boss" titleKo="인턴 사장" />
    );

    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).not.toContain('animate-pulse-neon');
  });

  it('size="sm" 옵션이 적용된다', () => {
    const { container } = render(
      <LevelBadge
        level={1}
        title="Intern Boss"
        titleKo="인턴 사장"
        size="sm"
      />
    );

    const badge = container.firstElementChild as HTMLElement;
    // sm 크기 클래스 확인
    expect(badge.className).toContain('text-[10px]');
  });

  it('size="lg" 옵션이 적용된다', () => {
    const { container } = render(
      <LevelBadge
        level={1}
        title="Intern Boss"
        titleKo="인턴 사장"
        size="lg"
      />
    );

    const badge = container.firstElementChild as HTMLElement;
    // lg 크기 클래스 확인
    expect(badge.className).toContain('text-sm');
  });
});
