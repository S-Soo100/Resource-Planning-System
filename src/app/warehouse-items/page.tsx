"use client";
import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomItemTable from "@/components/item/CustomItemTable";
import { Button } from "@/components/ui";
import { navigateByAuthStatus } from "@/utils/navigation";

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
            해당 페이지는 관리자 또는 1차 승인권자만 접근할 수 있습니다.
          </p>
          <Button
            variant="default"
            onClick={() => navigateByAuthStatus(router)}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            뒤로가기
          </Button>
        </div>
      </div>
    );
  }

  // moderator인 경우 읽기 전용 모드 설정
  const isReadOnly = user.accessLevel === "moderator";

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">품목 관리</h1>
          <p className="text-sm text-gray-500">창고 ID: {user.restrictedWhs}</p>
        </div>
        {isReadOnly && (
          <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md text-sm">
            1차 승인권자 권한으로는 조회만 가능합니다
          </div>
        )}
      </div>
      <CustomItemTable isReadOnly={isReadOnly} />
    </div>
  );
}
