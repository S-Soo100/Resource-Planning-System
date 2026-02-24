"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupplierDetail } from "@/hooks/useSupplierDetail";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { SupplierDetailHeader } from "@/components/supplier/SupplierDetailHeader";
import { SupplierDetailSummaryComponent } from "@/components/supplier/SupplierDetailSummary";
import { SupplierSalesTab } from "@/components/supplier/SupplierSalesTab";
import { SupplierPurchaseTab } from "@/components/supplier/SupplierPurchaseTab";
import { LoadingCentered } from "@/components/ui/Loading";
import { ArrowLeft, TrendingUp, ShoppingBag, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui";
import { format, subMonths, subYears } from "date-fns";
import { exportSupplierDetailToExcel } from "@/utils/exportSupplierDetailToExcel";

type DatePreset = "1month" | "3months" | "6months" | "1year" | "all";

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const { user, isLoading: isUserLoading } = useCurrentUser();

  // 날짜 범위 상태
  const [datePreset, setDatePreset] = useState<DatePreset>("3months");

  // 날짜 프리셋 계산
  const getDateRange = (): { startDate: string; endDate: string } => {
    const today = new Date();
    const endDate = format(today, "yyyy-MM-dd");

    if (datePreset === "all") {
      return { startDate: "2020-01-01", endDate }; // 전체 조회 (충분히 과거)
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

  const [activeTab, setActiveTab] = useState<"sales" | "purchase">("sales");

  // 워딩: 판매→매출, 구매→매입

  // 권한 체크
  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center">
          <LoadingCentered />
          <p className="mt-4 text-sm text-Text-Low-70">데이터를 불러오는 중...</p>
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
            고객 상세 페이지는 로그인 후 이용 가능합니다.
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
            고객 정보를 찾을 수 없습니다
          </h2>
          <p className="text-sm text-Text-Low-70 mb-6">
            존재하지 않거나 삭제된 고객입니다.
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/supplier")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            고객 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 엑셀 다운로드 핸들러
  const handleExportExcel = () => {
    if (!supplier) return;

    const canViewMargin = user?.accessLevel === "admin" || user?.accessLevel === "moderator";

    exportSupplierDetailToExcel(
      supplier,
      salesRecords,
      purchaseRecords,
      teamItemsMap,
      { startDate, endDate },
      canViewMargin
    );
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

      {/* 고객 기본 정보 */}
      <div className="mb-6">
        <SupplierDetailHeader
          supplier={supplier}
          onEdit={() => router.push(`/supplier?edit=${supplierId}`)}
        />
      </div>

      {/* 날짜 범위 선택기 (위치 이동: 요약 카드 위로) */}
      <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-Text-High-90" />
          <span className="text-sm font-medium text-Text-High-90">조회 기간</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDatePreset("1month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              datePreset === "1month"
                ? "bg-blue-600 text-white"
                : "bg-Back-Mid-20 text-Text-High-90 hover:bg-Back-Mid-30"
            }`}
          >
            최근 1개월
          </button>
          <button
            onClick={() => setDatePreset("3months")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              datePreset === "3months"
                ? "bg-blue-600 text-white"
                : "bg-Back-Mid-20 text-Text-High-90 hover:bg-Back-Mid-30"
            }`}
          >
            최근 3개월
          </button>
          <button
            onClick={() => setDatePreset("6months")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              datePreset === "6months"
                ? "bg-blue-600 text-white"
                : "bg-Back-Mid-20 text-Text-High-90 hover:bg-Back-Mid-30"
            }`}
          >
            최근 6개월
          </button>
          <button
            onClick={() => setDatePreset("1year")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              datePreset === "1year"
                ? "bg-blue-600 text-white"
                : "bg-Back-Mid-20 text-Text-High-90 hover:bg-Back-Mid-30"
            }`}
          >
            최근 1년
          </button>
          <button
            onClick={() => setDatePreset("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              datePreset === "all"
                ? "bg-blue-600 text-white"
                : "bg-Back-Mid-20 text-Text-High-90 hover:bg-Back-Mid-30"
            }`}
          >
            전체
          </button>
        </div>
        <div className="mt-3 text-xs text-Text-Low-70">
          현재 조회 중: {startDate} ~ {endDate}
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="mb-6">
        <SupplierDetailSummaryComponent summary={summary} isLoading={isLoading} />
      </div>

      {/* 탭 UI (매출/매입 내역) */}
      <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-Outline-Variant bg-Back-Low-10">
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === "sales"
                ? "text-blue-600 bg-white"
                : "text-Text-High-90 hover:text-Text-Highest-100 hover:bg-Back-Mid-20"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              매출 내역
            </div>
            {activeTab === "sales" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("purchase")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === "purchase"
                ? "text-orange-600 bg-white"
                : "text-Text-High-90 hover:text-Text-Highest-100 hover:bg-Back-Mid-20"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              매입 내역
            </div>
            {activeTab === "purchase" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
            )}
          </button>
        </div>

        {/* 탭 본문 */}
        <div className="p-6">
          {activeTab === "sales" ? (
            <SupplierSalesTab records={salesRecords} isLoading={isSalesLoading} />
          ) : (
            <SupplierPurchaseTab
              records={purchaseRecords}
              teamItemsMap={teamItemsMap}
              isLoading={isPurchaseLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
