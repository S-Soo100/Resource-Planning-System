"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { TeamList } from "@/components/team-select/TeamList";
import { UserInfoDisplay } from "@/components/team-select/UserInfoDisplay";
import { ServerStateDisplay } from "@/components/team-select/ServerStateDisplay";

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
        {serverUser && <UserInfoDisplay user={serverUser} />}
        {serverUser && <TeamList user={serverUser} />}
        {serverUser && <ServerStateDisplay serverUser={serverUser} />}
      </div>
    </Suspense>
  );
}
