"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { TeamList } from "@/components/team-select/TeamList";

export default function TeamSelectPage() {
  const { user: serverUser, isLoading, error } = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        에러가 발생했습니다: {error.message}
      </div>
    );
  }

  return (
    <Suspense>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">팀 선택</h1>
        <TeamList teams={serverUser?.teams || []} />
        {/* {serverUser && <ServerStateDisplay serverUser={serverUser} />} */}
      </div>
    </Suspense>
  );
}
