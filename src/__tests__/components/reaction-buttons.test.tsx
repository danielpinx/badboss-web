// 리액션 버튼 컴포넌트 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactionButtons } from '@/components/reaction-buttons';
import type { ReactionCounts } from '@/lib/types';

// SWR Config Provider와 useReaction 훅을 모킹한다
const mockSendReaction = vi.fn();

vi.mock('@/hooks/use-reactions', () => ({
  useReaction: () => ({
    sendReaction: mockSendReaction,
  }),
}));

// SWR의 useSWRConfig도 모킹 (useReaction 내부에서 사용)
vi.mock('swr', () => ({
  useSWRConfig: () => ({
    mutate: vi.fn(),
  }),
}));

/** 기본 리액션 카운트 */
const defaultReactions: ReactionCounts = {
  like: 5,
  fire: 3,
  skull: 1,
  rocket: 2,
  brain: 0,
};

describe('ReactionButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // sendReaction이 기본적으로 optimistic update 값을 반환하도록 설정
    mockSendReaction.mockImplementation(
      async (
        _group: string,
        _name: string,
        _type: string,
        current: ReactionCounts
      ) => current
    );
  });

  it('5개의 리액션 버튼을 렌더링한다', () => {
    render(
      <ReactionButtons
        group="team-alpha"
        agentName="claude-3"
        reactions={defaultReactions}
      />
    );

    // title 속성으로 5개 버튼 확인
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('각 리액션의 카운트를 표시한다', () => {
    render(
      <ReactionButtons
        group="team-alpha"
        agentName="claude-3"
        reactions={defaultReactions}
      />
    );

    // 카운트 텍스트 확인
    expect(screen.getByText('5')).toBeInTheDocument(); // like
    expect(screen.getByText('3')).toBeInTheDocument(); // fire
    expect(screen.getByText('1')).toBeInTheDocument(); // skull
    expect(screen.getByText('2')).toBeInTheDocument(); // rocket
    expect(screen.getByText('0')).toBeInTheDocument(); // brain
  });

  it('버튼 클릭 시 optimistic update로 카운트가 즉시 증가한다', async () => {
    // sendReaction이 증가된 값을 반환
    mockSendReaction.mockResolvedValue({
      ...defaultReactions,
      like: 6,
    });

    render(
      <ReactionButtons
        group="team-alpha"
        agentName="claude-3"
        reactions={defaultReactions}
      />
    );

    // like 버튼 (첫 번째 버튼) 클릭
    const likeButton = screen.getByTitle('like');
    fireEvent.click(likeButton);

    // optimistic update로 카운트가 즉시 6으로 증가
    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    // sendReaction이 호출되었는지 확인
    expect(mockSendReaction).toHaveBeenCalledWith(
      'team-alpha',
      'claude-3',
      'like',
      defaultReactions
    );
  });

  it('모든 리액션 타입의 버튼이 존재한다', () => {
    render(
      <ReactionButtons
        group="team-alpha"
        agentName="claude-3"
        reactions={defaultReactions}
      />
    );

    const reactionTypes = ['like', 'fire', 'skull', 'rocket', 'brain'];
    for (const type of reactionTypes) {
      expect(screen.getByTitle(type)).toBeInTheDocument();
    }
  });

  it('카운트가 모두 0이어도 정상 렌더링된다', () => {
    const zeroReactions: ReactionCounts = {
      like: 0,
      fire: 0,
      skull: 0,
      rocket: 0,
      brain: 0,
    };

    render(
      <ReactionButtons
        group="team-alpha"
        agentName="claude-3"
        reactions={zeroReactions}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);

    // 모든 카운트가 0인지 확인
    const zeroTexts = screen.getAllByText('0');
    expect(zeroTexts).toHaveLength(5);
  });
});
