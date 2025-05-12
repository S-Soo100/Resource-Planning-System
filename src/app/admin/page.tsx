"use client";
import React, { Suspense, useEffect, useState } from "react";
import { authStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { FaUsers, FaWarehouse, FaBuilding } from "react-icons/fa";
import TeamMembersManagement from "@/components/admin/TeamMembersManagement";
import WarehouseManagement from "@/components/admin/WarehouseManagement";
import TeamManagement from "@/components/admin/TeamManagement";
import AdminMenuCard from "@/components/admin/AdminMenuCard";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { TeamWarehouse } from "@/types/warehouse";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const zustandAuth = authStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("team-members");
  const [localWarehouses, setLocalWarehouses] = useState<TeamWarehouse[]>([]);
  const { team } = useCurrentTeam();

  useEffect(() => {
    if (team) {
      setLocalWarehouses(team.warehouses);
      console.log("team.warehouses:", JSON.stringify(team.warehouses, null, 2));
    }
  }, [team]);

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

  // 탭에 따른 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case "team-members":
        return <TeamMembersManagement isReadOnly={isReadOnly} />;
      case "warehouse":
        return (
          <WarehouseManagement
            warehouses={
              localWarehouses
                ? localWarehouses.map((warehouse) => ({
                    id: warehouse.id.toString(),
                    warehouseName: warehouse.warehouseName,
                    warehouseAddress: warehouse.warehouseAddress,
                  }))
                : []
            }
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold mb-2">관리자 대시보드</h1>
            <p className="text-gray-600">
              환영합니다, {user.accessLevel === "admin" ? "관리자" : "중재자"}{" "}
              {zustandAuth?.name} 님
            </p>
            {isReadOnly && (
              <div className="mt-2 p-2 bg-yellow-50 text-yellow-700 rounded-md text-sm">
                중재자 권한으로는 조회만 가능하며, 수정은 불가능합니다.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminMenuCard
              title="팀 멤버 관리"
              icon={<FaUsers />}
              id="team-members"
              description="팀원 초대 및 권한 관리"
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <AdminMenuCard
              title="창고 및 품목 관리"
              icon={<FaWarehouse />}
              id="warehouse"
              description="창고 정보 및 품목 관리"
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <AdminMenuCard
              title="팀 관리"
              icon={<FaBuilding />}
              id="team"
              description="팀 생성 및 설정 관리"
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="mt-6">{renderTabContent()}</div>
        </div>
      </div>
    </Suspense>
  );
}
