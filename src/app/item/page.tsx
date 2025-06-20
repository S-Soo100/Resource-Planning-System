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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            로그인이 필요합니다
          </h2>
          <p className="mb-6 text-gray-600">
            해당 페이지는 로그인한 사용자만 접근할 수 있습니다.
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

  // 권한에 따라 읽기 전용 모드 결정
  // Admin과 Moderator만 아이템 추가/삭제 가능
  const isReadOnly =
    user.accessLevel === "user" || user.accessLevel === "supplier";

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">품목 관리</h1>
      {isReadOnly && (
        <div className="p-3 mb-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>읽기 전용 모드:</strong> 현재 권한으로는 품목 조회만
            가능합니다.
          </p>
        </div>
      )}
      <CustomItemTable isReadOnly={isReadOnly} />
    </div>
  );
}
