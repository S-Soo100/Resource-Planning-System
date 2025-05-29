"use client";

import React, { useState } from "react";
import {
  User,
  ChevronLeft,
  X,
  LogOut,
  RefreshCcw,
  UserCircle,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const AppBarComponent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useCurrentUser();
  const selectedTeam = authStore((state) => state.selectedTeam);

  // 권한 레벨 한글화 함수 추가
  const getAccessLevelKorean = (level: string): string => {
    const levelMap: Record<string, string> = {
      admin: "관리자",
      user: "일반 사용자",
      supplier: "외부업체",
      moderator: "1차승인권자",
    };
    return levelMap[level] || level;
  };

  const logout = () => {
    // 로컬 스토리지의 토큰 제거
    localStorage.removeItem("token");
    // 쿠키의 토큰 제거
    Cookies.remove("token");
    // authStore의 상태 초기화
    authStore.getState().logout();
    // 로그인 페이지로 리다이렉트
    router.push("/signin");
    // 메뉴 닫기
    setIsMenuOpen(false);
  };

  const handleTeamReset = () => {
    // 선택된 팀 초기화
    authStore.getState().resetTeam();
    // team-select 페이지로 이동
    router.push("/team-select");
    // 메뉴 닫기
    setIsMenuOpen(false);
  };

  const renderLeftContent = () => {
    if (pathname === "/signin" || pathname === "/team-select") {
      return null;
    }

    // 뒤로가기 버튼이 필요한 경우
    if (pathname !== "/" && pathname !== "/menu") {
      return (
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-500 focus:outline-none"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">뒤로</span>
        </button>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="bg-gray-100 rounded-full p-1.5 shadow-sm">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">
              {user?.name || "사용자"}
            </span>
            {user?.accessLevel && (
              <span className="text-xs text-gray-500">
                {getAccessLevelKorean(user.accessLevel)}
              </span>
            )}
          </div>
        </div>
        {selectedTeam && (
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">팀:</span>
            <span className="text-xs font-medium text-gray-800">
              {selectedTeam.teamName}
            </span>
            <button
              onClick={handleTeamReset}
              className="ml-1 rounded-full p-0.5 bg-gray-100 hover:bg-gray-200 focus:outline-none"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderRightContent = () => {
    if (pathname === "/signin" || pathname === "/team-select") {
      return null;
    }

    if (pathname === "/" || pathname === "/menu") {
      return (
        <div className="relative z-50">
          <button
            className="flex items-center justify-center bg-gray-100 rounded-full p-1.5 shadow-sm focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <User className="w-5 h-5 text-blue-500" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 z-50 w-48 mt-2 overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
              <ul className="py-1">
                <li
                  className="flex items-center text-sm text-gray-800 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    router.push("/account");
                    setIsMenuOpen(false);
                  }}
                >
                  <UserCircle className="w-4 h-4 mr-2 text-blue-500" />내 계정
                </li>
                <li
                  className="flex items-center text-sm text-gray-800 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  onClick={handleTeamReset}
                >
                  <RefreshCcw className="w-4 h-4 mr-2 text-blue-500" />팀 변경
                </li>
                <li
                  className="flex items-center text-sm text-red-500 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2 text-red-500" />
                  로그아웃
                </li>
              </ul>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="relative z-50">
          <button
            className="flex items-center justify-center bg-gray-100 rounded-full p-1.5 shadow-sm focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <User className="w-5 h-5 text-blue-500" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 z-50 w-48 mt-2 overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
              <ul className="py-1">
                <li
                  className="flex items-center text-sm text-gray-800 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    router.push("/account");
                    setIsMenuOpen(false);
                  }}
                >
                  <UserCircle className="w-4 h-4 mr-2 text-blue-500" />내 계정
                </li>
                <li
                  className="flex items-center text-sm text-gray-800 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  onClick={handleTeamReset}
                >
                  <RefreshCcw className="w-4 h-4 mr-2 text-blue-500" />팀 변경
                </li>
                <li
                  className="flex items-center text-sm text-red-500 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2 text-red-500" />
                  로그아웃
                </li>
              </ul>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 text-gray-800 bg-white border-b border-gray-100 shadow-sm">
      {renderLeftContent()}
      {renderRightContent()}
    </div>
  );
};

export default AppBarComponent;
