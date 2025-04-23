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
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 bg-red-50 border-2 border-red-500 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-700 mb-2">서버 에러</h2>
          <p className="text-red-600 mb-4">
            서버에서 사용자 데이터를 가져오는 중 오류가 발생했습니다.
          </p>
          <div className="bg-red-100 p-3 rounded text-red-800 text-sm">
            <p className="font-mono">{error.message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <div className="p-4 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">팀 선택</h1>
          {serverUser?.isAdmin && (
            <button
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
              aria-label="팀 추가"
              onClick={() => alert("팀 추가 기능 구현 예정")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
        </div>

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
