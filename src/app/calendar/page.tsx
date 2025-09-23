"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

export default function CalendarPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();

  // 권한 체크 - admin이 아닌 경우 접근 거부
  if (!userLoading && user && user.accessLevel !== "admin") {
    router.push("/menu");
    return null;
  }

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

  if (!user) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="container p-6 mx-auto max-w-6xl min-h-screen">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/menu")}
              className="flex gap-2 items-center px-4 py-2 mr-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg transition-colors duration-200 hover:bg-gray-200"
            >
              <FaArrowLeft className="text-lg" />
              메뉴로 돌아가기
            </button>
            <h1 className="flex items-center text-3xl font-bold text-gray-900">
              <FaCalendarAlt className="mr-3 text-green-600" />
              캘린더
            </h1>
          </div>
        </div>
        <p className="mt-2 text-lg text-gray-600">
          관리자 전용 캘린더 페이지입니다.
        </p>
      </div>

      {/* 캘린더 컨텐츠 영역 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-20">
          <FaCalendarAlt className="mx-auto text-6xl text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            캘린더 기능
          </h2>
          <p className="text-gray-500">
            캘린더 기능이 여기에 구현될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}