"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { TeamList } from "@/components/team-select/TeamList";
import { authStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { adminTeamService } from "@/services/adminTeamService";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { LogOut, X } from "lucide-react";

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
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth 데이터 확인 로직 추가
  useEffect(() => {
    if (!mounted) return;

    const authCheckTimer = setTimeout(() => {
      const token = localStorage.getItem("token");
      const cookieToken = Cookies.get("token");

      if (!zustandAuth?.id && !token && !cookieToken) {
        console.log("인증 데이터가 없습니다. signin 페이지로 이동합니다.");
        router.replace("/signin");
        return;
      }

      if (!zustandAuth?.id && (token || cookieToken)) {
        setTimeout(() => {
          const currentAuth = authStore.getState().user;
          if (!currentAuth?.id) {
            handleLogout();
          } else {
            setAuthCheckCompleted(true);
          }
        }, 500);
      } else {
        setAuthCheckCompleted(true);
      }
    }, 1000);

    return () => clearTimeout(authCheckTimer);
  }, [mounted, zustandAuth, router]);

  useEffect(() => {
    if (selectedTeam && !isRedirecting && authCheckCompleted) {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/menu");
      }, 2000);
    }
  }, [selectedTeam, router, isRedirecting, authCheckCompleted]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    Cookies.remove("token");
    authStore.getState().logout();
    router.push("/signin");
  };

  if (!mounted || !authCheckCompleted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="p-8 text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50">
          <div className="mx-auto w-16 h-16 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">
            인증 상태 확인 중...
          </p>
          <p className="mt-2 text-sm text-gray-500">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (userLoading || isTeamSelecting || isRedirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="p-8 text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50">
          <div className="mx-auto w-16 h-16 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">
            {isRedirecting
              ? "선택된 팀이 있습니다. 메뉴로 이동합니다"
              : "로딩 중..."}
          </p>
          <p className="mt-2 text-sm text-gray-500">
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="p-8 w-full max-w-md bg-red-50 rounded-2xl border-2 border-red-500 shadow-2xl">
          <h2 className="mb-2 text-2xl font-bold text-red-700">서버 에러</h2>
          <p className="mb-4 text-red-600">
            서버에서 사용자 데이터를 가져오는 중 오류가 발생했습니다.
          </p>
          <div className="p-3 text-sm text-red-800 bg-red-100 rounded-xl">
            <p className="font-mono">{error.message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 text-white bg-red-600 rounded-xl transition-colors hover:bg-red-700 active:scale-95"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* 배경 애니메이션 요소들 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="sticky top-0 z-10 p-4 w-full backdrop-blur-md bg-white/70 shadow-sm border-b border-white/20">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              팀 선택
            </h1>
            <button
              onClick={handleLogout}
              className="flex gap-2 items-center px-4 py-2 text-red-600 bg-red-50 rounded-xl transition-all hover:bg-red-100 hover:shadow-md active:scale-95"
            >
              <LogOut size={18} />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        <div className="relative p-6 max-w-7xl mx-auto">
          {/* 헤더 및 환영 메시지 */}
          <div className="p-8 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50"
            style={{
              animation: 'fadeInDown 0.6s ease-out'
            }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  환영합니다! 👋
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed">
                  안녕하세요, <span className="font-semibold text-blue-600">{serverUser?.name || "사용자"}</span>님!<br />
                  작업할 팀을 선택하거나 새 팀을 생성해주세요.
                </p>
              </div>
              <div className="hidden md:block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">
                  팀을 선택하면 해당 팀의 데이터와 기능에 접근할 수 있습니다.
                </span>
              </div>
            </div>
          </div>

          {/* 관리자 액션 버튼 */}
          <div className="flex justify-end mb-8"
            style={{
              animation: 'fadeInRight 0.6s ease-out 0.2s both'
            }}
          >
            <button
              className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                serverUser?.isAdmin
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-2xl hover:scale-105 active:scale-95"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
              onClick={() => serverUser?.isAdmin && setIsModalOpen(true)}
              disabled={!serverUser?.isAdmin}
              title={
                !serverUser?.isAdmin ? "관리자만 팀을 생성할 수 있습니다" : ""
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
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
            </button>
          </div>

          {/* 현재 선택된 팀 */}
          {selectedTeam && (
            <div className="p-6 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-lg"
              style={{
                animation: 'fadeInUp 0.6s ease-out'
              }}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-500 rounded-lg mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-white"
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
                </div>
                <h2 className="text-xl font-bold text-green-800">
                  현재 선택된 팀
                </h2>
              </div>
              <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
                <div>
                  <p className="text-lg font-semibold text-green-700">
                    {selectedTeam.teamName}
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    팀 ID: {selectedTeam.id}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-full">
                    {new Date(selectedTeam.createdAt).toLocaleDateString()} 생성
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    메뉴로 이동 중...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 팀 선택 영역 */}
          <div className="p-8 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50"
            style={{
              animation: 'fadeInUp 0.6s ease-out 0.3s both'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
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
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                사용 가능한 팀
              </h2>
            </div>

            <div className="pb-4 mb-6 border-b border-gray-200">
              <p className="text-gray-600">
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
              <div className="py-12 text-center rounded-2xl border-2 border-gray-300 border-dashed bg-gray-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto mb-4 w-16 h-16 text-gray-400"
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
                <p className="mb-2 text-lg font-semibold text-gray-700">소속된 팀이 없습니다</p>
                <p className="text-sm text-gray-500">
                  관리자에게 팀 초대를 요청하거나, 관리자 권한이 있다면 새 팀을 생성해보세요.
                </p>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="pb-6 text-center text-gray-500"
            style={{
              animation: 'fadeInUp 0.6s ease-out 0.5s both'
            }}
          >
            <p className="text-sm">문의사항은 관리자에게 연락하세요</p>
          </div>
        </div>
      </div>

      {/* 팀 생성 모달 */}
      {isModalOpen && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50 backdrop-blur-sm p-4"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div className="p-8 w-full max-w-md bg-white rounded-2xl shadow-2xl"
            style={{
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-white"
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
                <h2 className="text-2xl font-bold text-gray-900">새 팀 추가</h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewTeamName("");
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                disabled={isCreatingTeam}
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-6 text-gray-600">
              새로운 팀을 생성하고 사용자들과 함께 작업할 수 있습니다.
            </p>

            <div className="mb-6">
              <label
                className="block mb-2 font-semibold text-gray-700"
                htmlFor="teamName"
              >
                팀 이름
              </label>
              <input
                id="teamName"
                type="text"
                className="px-4 py-3 w-full rounded-xl border-2 border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="새 팀 이름을 입력하세요"
                disabled={isCreatingTeam}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isCreatingTeam) {
                    handleCreateTeam();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-3 font-semibold text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setIsModalOpen(false);
                  setNewTeamName("");
                }}
                disabled={isCreatingTeam}
              >
                취소
              </button>
              <button
                className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl ${
                  isCreatingTeam ? "opacity-50 cursor-not-allowed" : "active:scale-95"
                }`}
                onClick={handleCreateTeam}
                disabled={isCreatingTeam}
              >
                {isCreatingTeam ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-white animate-spin"
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

      {/* 애니메이션 keyframes */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </Suspense>
  );
}
