"use client";
import React, { Suspense, useEffect, useState } from "react";
import { authStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { FaUsers, FaWarehouse, FaBuilding } from "react-icons/fa";
import WarehouseManagement from "@/components/admin/WarehouseManagement";
import TeamManagement from "@/components/admin/TeamManagement";
import { MenuCard, Button } from "@/components/ui";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { ArrowLeft } from "lucide-react";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import TeamMembers from "@/components/admin/TeamMembers";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { isLoading: isTeamLoading } = useCurrentTeam();
  const { warehouses, isLoading: isWarehousesLoading } = useWarehouseItems();
  const zustandAuth = authStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("team-members");

  useEffect(() => {
    if (warehouses && warehouses.length > 0) {
      console.log("창고 목록:", warehouses);
    }
  }, [warehouses]);

  if (isUserLoading || isTeamLoading || isWarehousesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
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
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            권한이 필요합니다
          </h2>
          <p className="mb-6 text-gray-600">
            해당 페이지는 관리자 또는 1차 승인권자만 접근할 수 있습니다.
          </p>
          <Button
            variant="default"
            onClick={() => router.back()}
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

  // 탭에 따른 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case "team-members":
        return <TeamMembers isReadOnly={isReadOnly} />;
      case "warehouse":
        return (
          <WarehouseManagement
            warehouses={warehouses}
            isReadOnly={isReadOnly}
          />
        );
      case "team":
        return <TeamManagement isReadOnly={isReadOnly} />;
      default:
        return null;
    }
  };

  return (
    <Suspense>
      <div className="flex flex-col min-h-full p-6">
        <div className="space-y-6">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h1 className="mb-2 text-2xl font-bold">관리자 대시보드</h1>
            <p className="text-gray-600">
              환영합니다,{" "}
              {user.accessLevel === "admin" ? "관리자" : "1차 승인권자"}{" "}
              {zustandAuth?.name} 님
            </p>
            {isReadOnly && (
              <div className="p-2 mt-2 text-sm text-yellow-700 rounded-md bg-yellow-50">
                1차 승인권자 권한으로는 조회만 가능하며, 수정은 불가능합니다.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MenuCard
              title="팀 멤버 관리"
              icon={<FaUsers />}
              id="team-members"
              description="팀원 초대 및 권한 관리"
              isActive={activeTab === "team-members"}
              onClick={setActiveTab}
            />
            <MenuCard
              title="창고 관리"
              icon={<FaWarehouse />}
              id="warehouse"
              description="창고 정보 및 위치 관리"
              isActive={activeTab === "warehouse"}
              onClick={setActiveTab}
            />
            <MenuCard
              title="팀 관리"
              icon={<FaBuilding />}
              id="team"
              description="팀 설정 관리"
              isActive={activeTab === "team"}
              onClick={setActiveTab}
            />
          </div>

          <div className="mt-6">
            {activeTab === "warehouse" && isWarehousesLoading ? (
              <div className="flex items-center justify-center p-10">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-600">
                    창고 정보를 불러오는 중...
                  </p>
                </div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
