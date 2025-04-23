"use client";

import React, { useState } from "react";
import { User, ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authStore } from "@/store/authStore";

const AppBarComponent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = authStore((state) => state.user);
  const selectedTeam = authStore((state) => state.selectedTeam);

  const logout = () => {
    // 로컬 스토리지의 토큰 제거
    localStorage.removeItem("token");
    // 쿠키의 토큰 제거
    Cookies.remove("token");
    // authStore의 상태 초기화
    authStore.getState().logout();
    // 로그인 페이지로 리다이렉트
    router.push("/signin");
  };

  const renderLeftContent = () => {
    if (pathname === "/" || pathname === "/menu") {
      return (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 rounded-full p-1.5 shadow-sm">
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-gray-800">
              {user?.name || "사용자"}
            </span>
          </div>
          {selectedTeam && (
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-xs text-gray-500">팀:</span>
              <span className="text-xs font-medium text-gray-800">
                {selectedTeam.teamName}
              </span>
            </div>
          )}
        </div>
      );
    } else if (pathname !== "/signin") {
      return (
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-500 focus:outline-none"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">뒤로</span>
        </button>
      );
    }
    return null;
  };

  const renderRightContent = () => {
    if (pathname === "/" || pathname === "/menu") {
      return (
        <button
          onClick={logout}
          className="text-blue-500 text-sm font-medium focus:outline-none"
        >
          로그아웃
        </button>
      );
    } else if (pathname !== "/signin") {
      return (
        <div className="relative z-50">
          <button
            className="flex items-center justify-center bg-gray-100 rounded-full p-1.5 shadow-sm focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <User className="h-5 w-5 text-blue-500" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-xl z-50 overflow-hidden border border-gray-100">
              <ul className="py-1">
                <li className="text-sm text-gray-800 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                  메뉴 1
                </li>
                <li className="text-sm text-gray-800 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                  메뉴 2
                </li>
                <li className="text-sm text-gray-800 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                  메뉴 3
                </li>
                <li
                  className="text-sm text-red-500 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  onClick={logout}
                >
                  로그아웃
                </li>
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between bg-white text-gray-800 px-4 py-3 shadow-sm border-b border-gray-100 sticky top-0 z-50">
      {renderLeftContent()}
      {renderRightContent()}
    </div>
  );
};

export default AppBarComponent;
