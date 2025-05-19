"use client";
import MainMenuComponent from "@/components/menu/MainMenuComponent";
import { authStore } from "@/store/authStore";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCategoryStore } from "@/store/categoryStore";

export default function MenuPage() {
  const router = useRouter();
  const auth = authStore();
  const [isLoading, setIsLoading] = useState(true);
  const { isLoading: isTeamLoading } = useCurrentTeam();

  // 카테고리 스토어 접근
  const { fetchCategories, isInitialized } = useCategoryStore();

  useEffect(() => {
    let isMounted = true;

    const checkTeamAndRedirect = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!isMounted) return;

      if (!isTeamLoading) {
        if (!auth.selectedTeam) {
          auth.resetTeam();
          router.push("/team-select");
          return;
        }

        setIsLoading(false);
      }
    };

    checkTeamAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [auth.selectedTeam, router, isTeamLoading, auth]);

  // 팀 정보가 로드된 후 카테고리 데이터를 별도로 로드
  useEffect(() => {
    if (!isLoading && !isTeamLoading && auth.selectedTeam && !isInitialized) {
      // 콘솔에 로그 추가
      console.log("카테고리 데이터 로드 시작:", {
        teamId: auth.selectedTeam.id,
        isInitialized,
      });

      fetchCategories(auth.selectedTeam.id);
    }
  }, [
    isLoading,
    isTeamLoading,
    auth.selectedTeam,
    isInitialized,
    fetchCategories,
  ]);

  if (isLoading || isTeamLoading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md">
            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-t-transparent border-purple-400 border-solid rounded-full animate-spin animation-delay-150 rotate-45"></div>
              <div className="absolute inset-4 border-4 border-t-transparent border-teal-300 border-solid rounded-full animate-spin animation-delay-300 rotate-90"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              로딩 중...
            </h2>
            <p className="text-gray-600">KARS 시스템에 연결 중입니다</p>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 w-full px-4 py-3 bg-white shadow-inner">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-500">
                KARS 재고관리 시스템 v1.0.0
              </p>
              <p className="text-xs text-gray-400 mt-1">
                © 2025 Kangsters. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!auth.selectedTeam) {
    return null;
  }

  return (
    <>
      <div className=" pb-6 ">
        <MainMenuComponent />
      </div>

      {/* Footer */}
      <div className="w-full px-4 py-3 bg-white shadow-inner mb-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500">KARS 재고관리 시스템 v1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">
              © 2025 Kangsters. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
