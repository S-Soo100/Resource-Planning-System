"use client";

import IoHistoryList from "@/components/ioHistory/IoHistoryList";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function IoHistoryPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // supplier 권한은 접근 불가
      if (user.accessLevel === "supplier") {
        toast.error("접근 권한이 없습니다.");
        router.push("/menu");
      }
    }
  }, [user, isLoading, router]);

  // 로딩 중이거나 supplier인 경우 아무것도 표시하지 않음
  if (isLoading || user?.accessLevel === "supplier") {
    return null;
  }

  return (
    <div>
      <IoHistoryList />
    </div>
  );
}
