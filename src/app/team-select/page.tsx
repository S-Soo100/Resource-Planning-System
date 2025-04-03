"use client";
import React from "react";
import { authStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { UserInfoDisplay } from "@/components/team-select/UserInfoDisplay";
import { TeamList } from "@/components/team-select/TeamList";
// import { ServerStateDisplay } from "@/components/team-select/ServerStateDisplay";
import { UserInfoDisplay } from "@/components/team-select/UserInfoDisplay";

export default function TeamSelectPage() {
  const { user: authUser } = authStore();
  const { user: serverUser, isLoading, error } = useCurrentUser();

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

  if (!authUser) {
    return <div className="p-4">로그인이 필요합니다.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">팀 선택</h1>
      <UserInfoDisplay user={authUser} />
      <TeamList teams={serverUser?.teams || []} />
      {/* {serverUser && <ServerStateDisplay serverUser={serverUser} />} */}
    </div>
  );
}
