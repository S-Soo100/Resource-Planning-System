"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Calendar from "@/components/calendar/Calendar";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

export default function CalendarPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();

  // 권한 체크 및 리다이렉트 처리
  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push("/signin");
      } else if (user.accessLevel === "supplier") {
        router.push("/menu");
      }
    }
  }, [user, userLoading, router]);


  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 사용자가 없거나 권한이 없는 경우 로딩 표시 (리다이렉트는 useEffect에서 처리)
  if (!userLoading && (!user || user.accessLevel === "supplier")) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          <p className="mt-4 text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-4 md:p-6 mx-auto max-w-7xl min-h-screen">
      {/* 헤더 - 반응형 */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <button
              onClick={() => router.push("/menu")}
              className="flex gap-2 items-center px-3 py-2 md:px-4 md:py-2 md:mr-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg transition-colors duration-200 hover:bg-gray-200 w-fit"
            >
              <FaArrowLeft className="text-sm md:text-lg" />
              메뉴로 돌아가기
            </button>
            <h1 className="flex items-center text-2xl md:text-3xl font-bold text-gray-900">
              <FaCalendarAlt className="mr-2 md:mr-3 text-green-600" />
              캘린더
            </h1>
          </div>
        </div>
        <p className="mt-2 text-sm md:text-lg text-gray-600">
          발주와 시연 일정을 주별로 관리하고 메모를 작성할 수 있습니다.(메모 기능 개발중 by noah)
        </p>
      </div>

      {/* 캘린더 컴포넌트 */}
      <Calendar />
    </div>
  );
}