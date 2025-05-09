"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { TeamList } from "@/components/team-select/TeamList";
// import { UserInfoDisplay } from "@/components/team-select/UserInfoDisplay";
// import { ServerStateDisplay } from "@/components/team-select/ServerStateDisplay";
import { authStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { adminTeamService } from "@/services/adminTeamService";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { LogOut } from "lucide-react";

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

  // 로그아웃 함수 추가
  const handleLogout = () => {
    // 로컬 스토리지의 토큰 제거
    localStorage.removeItem("token");
    // 쿠키의 토큰 제거
    Cookies.remove("token");
    // authStore의 상태 초기화
    authStore.getState().logout();
    // 메인 페이지로 리다이렉트
    router.push("/");
  };

  if (!mounted) {
    return null;
  }

  if (userLoading || isTeamSelecting || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="w-16 h-16 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-6 text-gray-700 font-medium text-lg">
            {isRedirecting
              ? "선택된 팀이 있습니다. 메뉴로 이동합니다"
              : "로딩 중..."}
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            {isRedirecting
              ? "잠시만 기다려주세요..."
              : "팀 정보를 불러오는 중입니다"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* 로그아웃 버튼 추가 */}
        <div className="w-full bg-white p-3 shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">팀 선택</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
            >
              <LogOut size={18} />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6">
          {/* 헤더 및 환영 메시지 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">팀 선택</h1>
                <p className="text-gray-600 mt-2">
                  환영합니다, {serverUser?.name || "사용자"}님! 작업할 팀을
                  선택하거나 새 팀을 생성해주세요.
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  팀을 선택하면 해당 팀의 데이터와 기능에 접근할 수 있습니다.
                </span>
              </div>
            </div>
          </div>

          {/* 관리자 액션 버튼 */}
          <div className="flex justify-end mb-6">
            <button
              className={`flex items-center px-4 py-2 ${
                serverUser?.isAdmin
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white rounded-lg transition shadow-md`}
              onClick={() => serverUser?.isAdmin && setIsModalOpen(true)}
              disabled={!serverUser?.isAdmin}
              title={
                !serverUser?.isAdmin ? "관리자만 팀을 생성할 수 있습니다" : ""
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-2"
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
              새 팀 생성
              {!serverUser?.isAdmin && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3h.01"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* 현재 선택된 팀 */}
          {selectedTeam && (
            <div className="p-6 mb-8 border border-green-200 rounded-lg bg-green-50 shadow-sm">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-xl font-bold text-green-800">
                  현재 선택된 팀
                </h2>
              </div>
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-green-100">
                <div>
                  <p className="text-lg font-medium text-green-700">
                    {selectedTeam.teamName}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    팀 ID: {selectedTeam.id}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    {new Date(selectedTeam.createdAt).toLocaleDateString()} 생성
                  </div>
                  <div className="text-sm text-blue-600 mt-2">
                    메뉴로 이동 중...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 팀 선택 영역 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="text-xl font-bold text-gray-800">
                사용 가능한 팀
              </h2>
            </div>

            <div className="border-b border-gray-200 mb-6 pb-2">
              <p className="text-gray-600 text-sm">
                소속된 팀 목록입니다. 작업할 팀을 선택해주세요.
              </p>
            </div>

            {serverUser && (
              <TeamList
                user={serverUser}
                onLoadingChange={setIsTeamSelecting}
                onTeamSelect={handleTeamSelect}
              />
            )}

            {serverUser?.teams?.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-gray-600 mb-2">소속된 팀이 없습니다</p>
                <p className="text-gray-500 text-sm">
                  관리자에게 팀 초대를 요청하거나, 관리자 권한이 있다면 새 팀을
                  생성해보세요.
                </p>
              </div>
            )}
          </div>

          {/* 도움말 영역 */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 mb-8">
            <h3 className="flex items-center text-lg font-semibold text-blue-800 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              팀 선택 도움말
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-700 mb-1">팀이란?</div>
                <p className="text-gray-600 text-sm">
                  팀은 함께 작업하는 사용자 그룹입니다. 팀을 선택하면 해당 팀의
                  데이터와 프로젝트에 접근할 수 있습니다.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-700 mb-1">
                  팀 생성 권한
                </div>
                <p className="text-gray-600 text-sm">
                  관리자 권한이 있는 사용자만 새로운 팀을 생성할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="text-center text-gray-500 text-sm pb-6">
            <p>문의사항은 관리자에게 연락하세요</p>
          </div>
        </div>
      </div>

      {/* 팀 생성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold">새 팀 추가</h2>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              새로운 팀을 생성하고 사용자들과 함께 작업할 수 있습니다.
            </p>

            <div className="mb-4">
              <label
                className="block text-gray-700 mb-2 font-medium"
                htmlFor="teamName"
              >
                팀 이름
              </label>
              <input
                id="teamName"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="새 팀 이름을 입력하세요"
                disabled={isCreatingTeam}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                onClick={() => {
                  setIsModalOpen(false);
                  setNewTeamName("");
                }}
                disabled={isCreatingTeam}
              >
                취소
              </button>
              <button
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium ${
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
    </Suspense>
  );
}
