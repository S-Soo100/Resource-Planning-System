"use client";

import IoHistoryList from "@/components/ioHistory/IoHistoryList";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function IoHistoryPage() {
  const { isLoading, isAuthorized } = useRequireAuth({
    allowedLevels: ["admin", "moderator", "user"],
  });

  // 로딩 중이거나 supplier인 경우 아무것도 표시하지 않음
  if (isLoading || !isAuthorized) {
    return null;
  }

  return (
    <div>
      <IoHistoryList />
    </div>
  );
}
