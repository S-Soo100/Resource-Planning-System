"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { TeamList } from "@/components/team-select/TeamList";
import { UserInfoDisplay } from "@/components/team-select/UserInfoDisplay";
import { ServerStateDisplay } from "@/components/team-select/ServerStateDisplay";
import { authStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { adminTeamService } from "@/services/adminTeamService";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function TeamSelectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const zustandAuth = authStore((state) => state.user);
  const selectedTeam = authStore((state) => state.selectedTeam);
  const { user: serverUser, isLoading: userLoading, error } = useCurrentUser();
  const [mounted, setMounted] = useState(false);
  const [isTeamSelecting, setIsTeamSelecting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

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

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      alert("팀 이름을 입력해주세요");
      return;
    }

    try {
      setIsCreatingTeam(true);
      const result = await adminTeamService.createNewTeam({
        teamName: newTeamName.trim(),
      });

      if (result) {
        alert("팀이 성공적으로 생성되었습니다");
        setNewTeamName("");
        setIsModalOpen(false);
        // useCurrentUser 훅을 다시 실행하기 위해 쿼리 무효화
        if (zustandAuth?.id) {
          await queryClient.invalidateQueries({
            queryKey: ["user", zustandAuth.id],
          });
        }
      } else {
        alert("팀 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("팀 생성 오류:", error);
      alert(`팀 생성 중 오류가 발생했습니다: ${error}`);
    } finally {
      setIsCreatingTeam(false);
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
              onClick={() => setIsModalOpen(true)}
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

        {/* 팀 생성 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <h2 className="text-xl font-bold mb-4">새 팀 추가</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="teamName">
                  팀 이름
                </label>
                <input
                  id="teamName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="새 팀 이름을 입력하세요"
                  disabled={isCreatingTeam}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewTeamName("");
                  }}
                  disabled={isCreatingTeam}
                >
                  취소
                </button>
                <button
                  className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition ${
                    isCreatingTeam ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleCreateTeam}
                  disabled={isCreatingTeam}
                >
                  {isCreatingTeam ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    "생성하기"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
