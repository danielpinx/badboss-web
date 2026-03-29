// SWR 기반 리더보드 데이터 훅
"use client";

import { useRef } from "react";
import useSWR from "swr";
import type { LeaderboardResponse } from "@/lib/types";
import { LEADERBOARD_REFRESH_INTERVAL } from "@/lib/constants";

/** SWR용 범용 fetcher (HTTP 에러 시 throw) */
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(
      (body as { error?: string }).error || `HTTP ${res.status} 오류`
    );
    throw error;
  }
  return res.json();
};

/** 에이전트별 이전 순위 맵 (group:agent_name -> rank) */
export type PrevRankMap = Record<string, number>;

/** 리더보드 응답에서 순위 맵 생성 */
function buildRankMap(agents: LeaderboardResponse["agents"]): PrevRankMap {
  const map: PrevRankMap = {};
  for (const agent of agents) {
    map[`${agent.group}:${agent.agent_name}`] = agent.rank;
  }
  return map;
}

/**
 * 리더보드 데이터를 실시간으로 가져오는 훅.
 * 5초마다 자동 갱신되며, 이전 순위를 추적하여 변동을 감지한다.
 * @param date - 조회할 주간 시작일 (선택, 기본값은 이번 주 화요일)
 */
export function useLeaderboard(date?: string) {
  const url = date ? `/api/leaderboard?date=${date}` : "/api/leaderboard";
  // prevRankMap: 한 단계 이전 순위, currentRankMap: 현재 순위
  const prevRankMapRef = useRef<PrevRankMap>({});
  const currentRankMapRef = useRef<PrevRankMap>({});

  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    url,
    fetcher,
    {
      refreshInterval: LEADERBOARD_REFRESH_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      errorRetryCount: 3,
      errorRetryInterval: 3000,
      keepPreviousData: true,
      onSuccess: (newData) => {
        if (newData?.agents) {
          const newMap = buildRankMap(newData.agents);
          // 현재 맵이 비어있지 않으면 이전으로 밀기
          if (Object.keys(currentRankMapRef.current).length > 0) {
            prevRankMapRef.current = currentRankMapRef.current;
          }
          currentRankMapRef.current = newMap;
        }
      },
    }
  );

  return {
    /** 리더보드 데이터 */
    data,
    /** 오류 여부 */
    isError: !!error,
    /** 로딩 중 여부 */
    isLoading,
    /** 수동 갱신 함수 */
    mutate,
    /** 이전 순위 맵 (순위 변동 비교용) */
    prevRankMap: prevRankMapRef.current,
  };
}
