// SWR 기반 리더보드 데이터 훅
"use client";

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

/**
 * 리더보드 데이터를 실시간으로 가져오는 훅.
 * 5초마다 자동 갱신된다.
 * @param date - 조회할 날짜 (선택, 기본값은 오늘)
 */
export function useLeaderboard(date?: string) {
  const url = date ? `/api/leaderboard?date=${date}` : "/api/leaderboard";

  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    url,
    fetcher,
    {
      refreshInterval: LEADERBOARD_REFRESH_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      // 에러 발생 시 지수 백오프로 재시도 (최대 3회)
      errorRetryCount: 3,
      errorRetryInterval: 3000,
      // 에러 시에도 이전 데이터 유지 (UX 개선)
      keepPreviousData: true,
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
  };
}
