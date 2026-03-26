// 활동 피드 탭 최상위 컨테이너
"use client";

import { useCallback } from "react";
import { FeedComposer } from "@/components/feed-composer";
import { FeedList } from "@/components/feed-list";
import { useFeed } from "@/hooks/use-feed";

/**
 * "노동착취 로그" 탭의 최상위 컴포넌트.
 * FeedComposer(작성)와 FeedList(목록)를 조합한다.
 */
export function ActivityFeed() {
  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refreshFeed,
  } = useFeed();

  const handleNewPost = useCallback(() => {
    refreshFeed();
  }, [refreshFeed]);

  return (
    <div>
      <FeedComposer onSubmit={handleNewPost} />
      <FeedList
        items={items}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
