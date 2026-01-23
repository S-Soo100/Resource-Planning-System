"use client";

import React, { useState } from "react";
import { VersionUpdate } from "@/types/update";
import UpdateCard from "./UpdateCard";

interface UpdateListProps {
  updates: VersionUpdate[];
  /** 초기 표시 개수 (기본값: 10) */
  initialDisplayCount?: number;
}

/**
 * 업데이트 리스트 컴포넌트 (페이지네이션 포함)
 */
export default function UpdateList({
  updates,
  initialDisplayCount = 10,
}: UpdateListProps) {
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);

  const displayedUpdates = updates.slice(0, displayCount);
  const hasMore = displayCount < updates.length;
  const remainingCount = updates.length - displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 10, updates.length));
  };

  return (
    <div className="space-y-8">
      {/* 업데이트 카드 리스트 */}
      {displayedUpdates.map((update) => (
        <UpdateCard key={update.version} update={update} />
      ))}

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg transition-colors hover:bg-blue-50 hover:border-blue-300"
          >
            이전 업데이트 {remainingCount}개 더 보기
          </button>
        </div>
      )}

      {/* 모든 업데이트 표시됨 */}
      {!hasMore && updates.length > initialDisplayCount && (
        <div className="flex justify-center pt-4">
          <p className="text-sm text-gray-500">
            모든 업데이트를 표시했습니다 (총 {updates.length}개)
          </p>
        </div>
      )}
    </div>
  );
}
