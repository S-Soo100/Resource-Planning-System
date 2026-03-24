"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupplierDetail } from "@/hooks/useSupplierDetail";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermission } from "@/hooks/usePermission";
import { SupplierDetailHeader } from "@/components/supplier/SupplierDetailHeader";
import { SupplierDetailSummaryComponent } from "@/components/supplier/SupplierDetailSummary";
import { SupplierSalesTab } from "@/components/supplier/SupplierSalesTab";
import { SupplierPurchaseTab } from "@/components/supplier/SupplierPurchaseTab";
import CustomerInfoCard from "@/components/customer/CustomerInfoCard";
// CustomerInfoEditModal 제거 — CustomerInfoCard에서 인라인 편집 지원
import CustomerDocumentSection from "@/components/orderRecord/CustomerDocumentSection";
import CustomerOrderHistory from "@/components/customer/CustomerOrderHistory";
import { LoadingCentered } from "@/components/ui/Loading";
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Download,
  UserCircle,
  FolderOpen,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui";
import { format, subMonths, subYears } from "date-fns";
import { exportSupplierDetailToExcel } from "@/utils/exportSupplierDetailToExcel";

type DatePreset = "1month" | "3months" | "6months" | "1year" | "all";
type TabType = "sales" | "purchase" | "info" | "documents" | "orders";

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { canViewMargin, isAdminOrModerator } = usePermission();

  // 날짜 범위 상태
  const [datePreset, setDatePreset] = useState<DatePreset>("3months");
  // isEditModalOpen 제거 — 인라인 편집으로 전환

  // 날짜 프리셋 계산
  const getDateRange = (): { startDate: string; endDate: string } => {
    const today = new Date();
    const endDate = format(today, "yyyy-MM-dd");

    if (datePreset === "all") {
      return { startDate: "2020-01-01", endDate };
    }

    if (datePreset === "1month") {
      return { startDate: format(subMonths(today, 1), "yyyy-MM-dd"), endDate };
    }

    if (datePreset === "3months") {
      return { startDate: format(subMonths(today, 3), "yyyy-MM-dd"), endDate };
    }

    if (datePreset === "6months") {
      return { startDate: format(subMonths(today, 6), "yyyy-MM-dd"), endDate };
    }

    if (datePreset === "1year") {
      return { startDate: format(subYears(today, 1), "yyyy-MM-dd"), endDate };
    }

    return { startDate: format(subMonths(today, 3), "yyyy-MM-dd"), endDate };
  };

  const { startDate, endDate } = getDateRange();

  const {
    supplier,
    summary,
    salesRecords,
    purchaseRecords,
    teamItemsMap,
    isLoading,
    isSupplierError,
    isSalesLoading,
    isPurchaseLoading,
  } = useSupplierDetail(supplierId, startDate, endDate);

  const [activeTab, setActiveTab] = useState<TabType>("info");

  // 권한 체크
  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center">
          <LoadingCentered />
          <p className="mt-4 text-sm text-Text-Low-70">
            데이터를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-medium text-Text-Highest-100 mb-3">
            로그인이 필요합니다
          </h2>
          <p className="text-sm text-Text-Low-70 mb-6">
            판매대상 상세 페이지는 로그인 후 이용 가능합니다.
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/login")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (isSupplierError || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium text-Text-Highest-100 mb-3">
            판매대상 정보를 찾을 수 없습니다
          </h2>
          <p className="text-sm text-Text-Low-70 mb-6">
            존재하지 않거나 삭제된 판매대상입니다.
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/supplier")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            판매대상 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 엑셀 다운로드 핸들러
  const handleExportExcel = () => {
    if (!supplier) return;

    const canViewMarginForExport = canViewMargin;

    exportSupplierDetailToExcel(
      supplier,
      salesRecords,
      purchaseRecords,
      teamItemsMap,
      { startDate, endDate },
      canViewMarginForExport
    );
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    {
      key: "info",
      label: "판매대상 정보",
      icon: <UserCircle className="w-4 h-4" />,
    },
    {
      key: "documents",
      label: "판매대상 서류",
      icon: <FolderOpen className="w-4 h-4" />,
    },
    {
      key: "sales",
      label: "매출 내역",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      key: "purchase",
      label: "매입 내역",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      key: "orders",
      label: "판매 이력",
      icon: <ClipboardList className="w-4 h-4" />,
    },
  ];

  const getTabColor = (tab: TabType) => {
    switch (tab) {
      case "sales":
        return "text-blue-600";
      case "purchase":
        return "text-orange-600";
      case "info":
        return "text-purple-600";
      case "documents":
        return "text-green-600";
      case "orders":
        return "text-indigo-600";
      default:
        return "text-blue-600";
    }
  };

  const getTabIndicatorColor = (tab: TabType) => {
    switch (tab) {
      case "sales":
        return "bg-blue-600";
      case "purchase":
        return "bg-orange-600";
      case "info":
        return "bg-purple-600";
      case "documents":
        return "bg-green-600";
      case "orders":
        return "bg-indigo-600";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <div className="min-h-screen bg-Back-Low-10 p-4 md:p-6">
      {/* 뒤로가기 버튼 & 다운로드 */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-Text-High-90 hover:text-Text-Highest-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </button>

        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 h-10 px-5 bg-green-600 text-white rounded-full text-sm font-medium hover:brightness-90 active:brightness-85 transition-all"
        >
          <Download className="w-4 h-4" />
          엑셀 다운로드
        </button>
      </div>

      {/* 판매대상 기본 정보 */}
      <div className="mb-6">
        <SupplierDetailHeader supplier={supplier} />
      </div>

      {/* 조회 기간 (항상 표시, 1줄 컴팩트) */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 bg-white rounded-xl border border-Outline-Variant px-4 py-2 mb-3 text-sm">
        <div className="flex items-center gap-1.5 text-Text-Low-70 shrink-0">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">조회 기간</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: "1month", label: "1개월" },
              { key: "3months", label: "3개월" },
              { key: "6months", label: "6개월" },
              { key: "1year", label: "1년" },
              { key: "all", label: "전체" },
            ] as { key: DatePreset; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDatePreset(key)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                datePreset === key
                  ? "bg-blue-600 text-white"
                  : "bg-Back-Mid-20 text-Text-High-90 hover:bg-Back-Mid-30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-Text-Low-70">
          {startDate} ~ {endDate}
        </span>
      </div>

      {/* 요약 통계 (항상 표시, 1줄 컴팩트) */}
      <div className="mb-4">
        <SupplierDetailSummaryComponent
          summary={summary}
          isLoading={isLoading}
        />
      </div>

      {/* 탭 UI */}
      <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-Outline-Variant bg-Back-Low-10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 md:px-6 py-4 text-sm font-medium transition-all relative ${
                activeTab === tab.key
                  ? `${getTabColor(tab.key)} bg-white`
                  : "text-Text-High-90 hover:text-Text-Highest-100 hover:bg-Back-Mid-20"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </div>
              {activeTab === tab.key && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${getTabIndicatorColor(tab.key)}`}
                ></div>
              )}
            </button>
          ))}
        </div>

        {/* 탭 본문 */}
        <div className="p-6">
          {activeTab === "sales" && (
            <SupplierSalesTab
              records={salesRecords}
              isLoading={isSalesLoading}
            />
          )}
          {activeTab === "purchase" && (
            <SupplierPurchaseTab
              records={purchaseRecords}
              teamItemsMap={teamItemsMap}
              isLoading={isPurchaseLoading}
            />
          )}
          {activeTab === "info" && (
            <CustomerInfoCard
              supplier={supplier}
              canEdit={isAdminOrModerator}
            />
          )}
          {activeTab === "documents" && (
            <CustomerDocumentSection supplierId={supplier.id} />
          )}
          {activeTab === "orders" && (
            <CustomerOrderHistory supplierId={supplier.id} />
          )}
        </div>
      </div>

      {/* 판매대상 정보는 CustomerInfoCard 내 인라인 편집으로 처리 */}
    </div>
  );
}
