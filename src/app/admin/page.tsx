"use client";
import React, { Suspense, useState } from "react";
import { authStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { FaUsers, FaWarehouse, FaBuilding } from "react-icons/fa";
import TeamMembersManagement from "@/components/admin/TeamMembersManagement";
import WarehouseManagement from "@/components/admin/WarehouseManagement";
import TeamManagement from "@/components/admin/TeamManagement";
import AdminMenuCard from "@/components/admin/AdminMenuCard";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";

export default function AdminPage() {
  const router = useRouter();
  const zustandAuth = authStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("team-members");
  const { team } = useCurrentTeam();

  // 탭에 따른 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case "team-members":
        return <TeamMembersManagement />;
      case "warehouse":
        return (
          <WarehouseManagement
            warehouses={
              team?.Warehouses
                ? team.Warehouses.map((warehouse) => ({
                    id: warehouse.id.toString(),
                    name: warehouse.warehouseName,
                    location: warehouse.warehouseAddress,
                    capacity: 0, // 기본값 제공
                  }))
                : []
            }
          />
        );
      case "team":
        return <TeamManagement />;
      default:
        return null;
    }
  };

  return (
    <Suspense>
      <div className="flex flex-col min-h-full p-6">
        {!zustandAuth?.isAdmin ? (
          <div className="mx-auto flex justify-center py-11">
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <p className="text-red-700 text-lg font-medium">
                관리자 권한을 확인해주세요.
              </p>
              <p className="text-red-600 mt-2">
                이 페이지는 관리자만 접근할 수 있습니다.
              </p>
              <button
                onClick={() => router.push("/menu")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                메뉴로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h1 className="text-2xl font-bold mb-2">관리자 대시보드</h1>
              <p className="text-gray-600">
                환영합니다, 관리자 {zustandAuth?.name} 님
              </p>
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
                title="창고 관리"
                icon={<FaWarehouse />}
                id="warehouse"
                description="창고 정보 및 위치 관리"
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
        )}
      </div>
    </Suspense>
  );
}
