"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { TeamList } from "@/components/team-select/TeamList";
import { UserInfoDisplay } from "@/components/team-select/UserInfoDisplay";
import { ServerStateDisplay } from "@/components/team-select/ServerStateDisplay";
import { authStore } from "@/store/authStore";
import { authService } from "@/services/authService";

export default function TeamSelectPage() {
  const zustandAuth = authStore((state) => state.user);
  const selectedTeam = authStore((state) => state.selectedTeam);
  const { user: serverUser, isLoading: userLoading, error } = useCurrentUser();
  const [mounted, setMounted] = useState(false);
  const [isTeamSelecting, setIsTeamSelecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("현재 선택된 팀 상태:", selectedTeam);
  }, [selectedTeam]);

  const handleTeamSelect = async (teamId: number) => {
    const res = await authService.selectTeam(teamId);
    if (!res) {
      alert("팀 선택에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!mounted) {
    return null;
  }

  if (userLoading || isTeamSelecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
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

        {selectedTeam && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              현재 선택된 팀
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 font-medium">
                  {selectedTeam.name}
                </p>
                <p className="text-sm text-green-600">
                  팀 ID: {selectedTeam.id}
                </p>
                {selectedTeam.description && (
                  <p className="text-sm text-green-600 mt-1">
                    {selectedTeam.description}
                  </p>
                )}
              </div>
              <div className="text-sm text-green-600">
                {new Date(selectedTeam.createdAt).toLocaleDateString()} 생성
              </div>
            </div>
          </div>
        )}

        {serverUser && (
          <TeamList
            user={serverUser}
            onLoadingChange={setIsTeamSelecting}
            onTeamSelect={handleTeamSelect}
          />
        )}
        {zustandAuth && <UserInfoDisplay user={zustandAuth} />}
        {serverUser && <ServerStateDisplay serverUser={serverUser} />}
      </div>
    </Suspense>
  );
}
