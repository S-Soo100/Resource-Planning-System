"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { TeamList } from "@/components/team-select/TeamList";
import { UserInfoDisplay } from "@/components/team-select/UserInfoDisplay";
import { ServerStateDisplay } from "@/components/team-select/ServerStateDisplay";
import { authStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function TeamSelectPage() {
  const router = useRouter();
  const zustandAuth = authStore((state) => state.user);
  const selectedTeam = authStore((state) => state.selectedTeam);
  const { user: serverUser, isLoading: userLoading, error } = useCurrentUser();
  const [mounted, setMounted] = useState(false);
  const [isTeamSelecting, setIsTeamSelecting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("현재 선택된 팀 상태:", selectedTeam);
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedTeam && !isRedirecting) {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/menu");
      }, 2000);
    }
  }, [selectedTeam, router, isRedirecting]);

  const handleTeamSelect = async (teamId: number) => {
    const res = await authService.selectTeam(teamId);
    if (!res) {
      alert("팀 선택에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!mounted) {
    return null;
  }

  if (userLoading || isTeamSelecting || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-gray-900 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">
            {isRedirecting
              ? "선택된 팀이 있습니다. 메뉴로 이동합니다"
              : "로딩 중..."}
          </p>
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
        <h1 className="mb-6 text-2xl font-bold">팀 선택</h1>

        {selectedTeam && (
          <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
            <h2 className="mb-2 text-lg font-semibold text-green-800">
              현재 선택된 팀
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-700">
                  {selectedTeam.teamName}
                </p>
                <p className="text-sm text-green-600">
                  팀 ID: {selectedTeam.id}
                </p>
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
