// 피드 목록 + 무한 스크롤 컴포넌트
"use client";

import { useEffect, useRef, useCallback } from "react";
import { FeedItem } from "@/components/feed-item";
import type { FeedItem as FeedItemType } from "@/lib/types";

interface FeedListProps {
  items: FeedItemType[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function FeedList({
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: FeedListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver로 하단 감지 -> 다음 페이지 로드
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
        onLoadMore();
      }
    },
    [hasMore, isLoadingMore, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "200px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border border-cyber-border/30 rounded-lg bg-cyber-surface/30 p-3 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded bg-gray-700" />
              <div className="w-24 h-4 rounded bg-gray-700" />
            </div>
            <div className="w-full h-4 rounded bg-gray-700/50 ml-6" />
          </div>
        ))}
      </div>
    );
  }

  // 빈 상태
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-sm text-gray-500">
          아직 기록된 로그가 없습니다.
        </p>
        <p className="font-mono text-xs text-gray-600 mt-1">
          첫 번째 노동착취를 고백해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}

      {/* 무한 스크롤 센티넬 */}
      <div ref={sentinelRef} className="h-1" />

      {/* 추가 로딩 표시 */}
      {isLoadingMore && (
        <div className="text-center py-4">
          <span className="font-mono text-xs text-gray-500 animate-pulse">
            로그 불러오는 중...
          </span>
        </div>
      )}

      {/* 더 이상 없음 표시 */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-4">
          <span className="font-mono text-[10px] text-gray-600">
            -- 여기까지가 기록의 끝입니다 --
          </span>
        </div>
      )}
    </div>
  );
}
