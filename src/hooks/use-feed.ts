// 피드 데이터 SWR 훅 + 무한 스크롤
"use client";

import useSWR from "swr";
import { useState, useCallback, useRef } from "react";
import type { FeedItem, FeedResponse } from "@/lib/types";
import { FEED_REFRESH_INTERVAL } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * 피드 데이터를 관리하는 훅.
 * 첫 페이지는 SWR로 5초 자동 갱신, 이후 페이지는 수동 로드.
 */
export function useFeed() {
  const [pages, setPages] = useState<FeedItem[][]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  // 첫 페이지: SWR 자동 갱신
  const { data, error, isLoading, mutate } = useSWR<FeedResponse>(
    "/api/feed",
    fetcher,
    {
      refreshInterval: FEED_REFRESH_INTERVAL,
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 2000,
      onSuccess: (data) => {
        // 첫 페이지 데이터가 갱신되면 추가 페이지 초기화
        if (pages.length === 0) {
          setNextCursor(data.next_cursor);
          setHasMore(data.has_more);
        }
      },
    }
  );

  // 첫 페이지 아이템 + 추가 로드된 페이지 아이템 합산 (ID 기반 중복 제거)
  const firstPageItems = data?.items || [];
  const seenIds = new Set<string>();
  const allItems: FeedItem[] = [];
  for (const item of [...firstPageItems, ...pages.flat()]) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      allItems.push(item);
    }
  }

  /** 다음 페이지를 로드한다. */
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoadingMore(true);

    try {
      // 현재 커서 결정: 추가 페이지가 있으면 그 커서, 없으면 첫 페이지 커서
      const cursor = nextCursor ?? data?.next_cursor;
      if (!cursor) {
        setHasMore(false);
        return;
      }

      const res = await fetch(`/api/feed?cursor=${cursor}`);
      if (!res.ok) {
        if (res.status === 429) {
          setHasMore(false);
        }
        return;
      }

      const result: FeedResponse = await res.json();
      setPages((prev) => [...prev, result.items]);
      setNextCursor(result.next_cursor);
      setHasMore(result.has_more);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [nextCursor, hasMore, data?.next_cursor]);

  /** 피드 캐시를 갱신한다 (새 글 작성 후 호출). */
  const refreshFeed = useCallback(() => {
    setPages([]);
    setNextCursor(null);
    setHasMore(true);
    mutate();
  }, [mutate]);

  return {
    items: allItems,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refreshFeed,
  };
}
