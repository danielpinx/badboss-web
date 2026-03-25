// 리액션 Optimistic Update 훅
"use client";

import { useCallback, useRef } from "react";
import { useSWRConfig } from "swr";
import type { ReactionType, ReactionCounts } from "@/lib/types";

/**
 * 리액션 기능을 제공하는 훅.
 * Optimistic Update 패턴으로 클릭 즉시 카운트가 반영되고,
 * API 호출 실패 시 롤백된다.
 *
 * pending 상태를 useRef로 관리하여 useCallback의 불필요한 재생성을 방지한다.
 */
export function useReaction() {
  const { mutate } = useSWRConfig();
  const pendingRef = useRef<Set<string>>(new Set());

  /**
   * 리액션을 전송한다.
   * @param group - 대상 에이전트의 그룹명
   * @param agentName - 대상 에이전트명
   * @param reaction - 리액션 종류
   * @param currentReactions - 현재 리액션 카운트 (Optimistic Update용)
   * @returns 업데이트된 리액션 카운트
   */
  const sendReaction = useCallback(
    async (
      group: string,
      agentName: string,
      reaction: ReactionType,
      currentReactions: ReactionCounts
    ): Promise<ReactionCounts> => {
      const key = `${group}:${agentName}:${reaction}`;

      // 동일 리액션이 이미 처리 중이면 중복 방지
      if (pendingRef.current.has(key)) return currentReactions;

      pendingRef.current.add(key);

      try {
        const response = await fetch("/api/react", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group, agent_name: agentName, reaction }),
        });

        if (!response.ok) {
          // 실패 시 원래 값 반환 (롤백)
          return currentReactions;
        }

        const data = await response.json();

        // 리더보드 캐시 갱신
        mutate("/api/leaderboard");

        return data.reactions as ReactionCounts;
      } catch {
        // 네트워크 오류 시 롤백
        return currentReactions;
      } finally {
        pendingRef.current.delete(key);
      }
    },
    [mutate]
  );

  return {
    /** 리액션 전송 함수 */
    sendReaction,
  };
}
