"use client";
import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomItemTable from "@/components/item/CustomItemTable";

export default function ItemsPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (
    !user ||
    (user.accessLevel !== "admin" && user.accessLevel !== "moderator")
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            권한이 필요합니다
          </h2>
          <p className="text-gray-600 mb-6">
            해당 페이지는 관리자 또는 중재자만 접근할 수 있습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  // moderator인 경우 읽기 전용 모드 설정
  const isReadOnly = user.accessLevel === "moderator";

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">품목 관리</h1>
        {isReadOnly && (
          <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md text-sm">
            중재자 권한으로는 조회만 가능합니다
          </div>
        )}
      </div>
      <CustomItemTable isReadOnly={isReadOnly} />
    </div>
  );
}
