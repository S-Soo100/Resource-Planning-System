"use client";
import React, { Suspense, useState, useEffect } from "react";
import { authStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { FaUsers, FaWarehouse, FaBuilding } from "react-icons/fa";
import WarehouseManagement from "@/components/admin/WarehouseManagement";
import TeamManagement from "@/components/admin/TeamManagement";
import { Button } from "@/components/ui";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { ArrowLeft } from "lucide-react";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import TeamMembers from "@/components/admin/TeamMembers";
import { navigateByAuthStatus } from "@/utils/navigation";
import { LoadingCentered } from "@/components/ui/Loading";

// AdminContent 컴포넌트 (useSearchParams 사용)
function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { isLoading: isTeamLoading } = useCurrentTeam();
  const { warehouses, isLoading: isWarehousesLoading } = useWarehouseItems();
  const zustandAuth = authStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("team-members");

  // URL 쿼리 파라미터에서 tab 읽기
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["team-members", "warehouse", "team"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // useEffect(() => {
  //   if (warehouses && warehouses.length > 0) {
  //     console.log("창고 목록:", warehouses);
  //   }
  // }, [warehouses]);

  if (isUserLoading || isTeamLoading || isWarehousesLoading) {
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
    <div className="flex flex-col p-6 min-h-full bg-Back-Low-10">
      <div className="mx-auto max-w-7xl w-full space-y-6">
        <div className="p-6 bg-white rounded-2xl shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-Text-Highest-100">관리자 대시보드</h1>
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

        <div className="flex p-1.5 bg-Back-Mid-20 rounded-2xl shadow-inner">
          {[
            { id: "team-members", title: "팀 멤버 관리", icon: <FaUsers /> },
            { id: "warehouse", title: "창고 관리", icon: <FaWarehouse /> },
            { id: "team", title: "팀 관리", icon: <FaBuilding /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-Primary-Main shadow-md"
                  : "text-Text-Low-70 hover:bg-white/50 hover:text-Text-High-90"
              }`}
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "warehouse" && isWarehousesLoading ? (
            <div className="flex justify-center items-center p-10">
              <div className="text-center">
                <LoadingCentered size="lg" />
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
  );
}

// 메인 AdminPage 컴포넌트 (Suspense로 감싸기)
export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <LoadingCentered size="lg" />
          <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
