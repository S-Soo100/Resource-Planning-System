"use client";
import React, { Suspense } from "react";
import { authStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import TeamManagement from "@/components/admin/TeamManagement";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { navigateByAuthStatus } from "@/utils/navigation";
import { LoadingCentered } from "@/components/ui/Loading";
import { Button } from "@/components/ui";

// TeamInfoContent 컴포넌트
function TeamInfoContent() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { isLoading: isTeamLoading } = useCurrentTeam();
  const zustandAuth = authStore((state) => state.user);

  if (isUserLoading || isTeamLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <LoadingCentered size="lg" />
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
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            권한이 필요합니다
          </h2>
          <p className="mb-6 text-gray-600">
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
    <div className="flex flex-col p-6 min-h-full bg-Back-Low-10">
      <div className="mx-auto max-w-7xl w-full space-y-6">
        <div className="p-6 bg-white rounded-2xl shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-Text-Highest-100">팀 정보 관리</h1>
          <p className="text-Text-Low-70">
            환영합니다,{" "}
            {user.accessLevel === "admin" ? "관리자" : "1차 승인권자"}{" "}
            {zustandAuth?.name} 님
          </p>
          {isReadOnly && (
            <div className="p-3 mt-3 text-sm text-Primary-Main bg-Primary-Container rounded-xl">
              1차 승인권자 권한으로는 조회만 가능하며, 수정은 불가능합니다.
            </div>
          )}
        </div>

        <div className="mt-6">
          <TeamManagement isReadOnly={isReadOnly} />
        </div>
      </div>
    </div>
  );
}

// 메인 TeamInfoPage 컴포넌트 (Suspense로 감싸기)
export default function TeamInfoPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <LoadingCentered size="lg" />
          <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <TeamInfoContent />
    </Suspense>
  );
}
