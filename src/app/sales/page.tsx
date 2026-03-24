"use client";

import React, { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  AlertCircle,
  FileText,
  Info,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSalesData } from "@/hooks/useSalesData";
import { useDemoSalesData } from "@/hooks/useDemoSalesData";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermission } from "@/hooks/usePermission";
import { SalesSummary } from "@/components/sales/SalesSummary";
import { DemoSalesTable } from "@/components/sales/DemoSalesTable";
import {
  exportSalesToExcel,
  exportDemoSalesToExcel,
} from "@/utils/exportSalesToExcel";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { TransactionStatementModal } from "@/components/sales/TransactionStatementModal";
import { LoadingCentered } from "@/components/ui/Loading";
import { MonthRangePicker } from "@/components/common/MonthRangePicker";
import { useSalesFilterStore } from "@/store/filterStore";
import {
  SalesFilterParams,
  SalesSortField,
  SortDirection,
  SalesRecord,
  SalesSummary as SalesSummaryType,
} from "@/types/sales";
import { DepositStatus } from "@/types/(order)/order";
import {
  getDepositStatusText,
  getDepositStatusColor,
  DEPOSIT_FILTER_OPTIONS,
  DEPOSIT_STATUS_OPTIONS,
} from "@/utils/depositUtils";
import { useUpdateOrderDetails } from "@/hooks/(useOrder)/useOrderMutations";
import { useQueryClient } from "@tanstack/react-query";

type SalesTab = "order" | "demo";

// 미디어 쿼리 훅
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

export default function SalesPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { canViewMargin, isSupplier, isModerator, isAdmin } = usePermission();
  const queryClient = useQueryClient();

  // 미디어 쿼리
  const isMobile = useMediaQuery("(max-width: 759px)");

  // 권한별 마진 컬럼 표시 여부 (Admin, Moderator만)
  const showMarginColumns = canViewMargin;
  const canEditDeposit = isModerator || isAdmin;

  // 입금상태 인라인 수정
  const { mutateAsync: updateDetailsMutate } = useUpdateOrderDetails();
  const [updatingDepositId, setUpdatingDepositId] = useState<number | null>(
    null
  );

  const handleDepositStatusChange = async (
    recordId: number,
    orderId: number,
    value: string
  ) => {
    setUpdatingDepositId(recordId);
    try {
      const depositStatus = (value || undefined) as DepositStatus | undefined;
      await updateDetailsMutate({
        id: String(orderId),
        data: { depositStatus },
      });
      await queryClient.invalidateQueries({ queryKey: ["sales"] });
    } catch (error) {
      console.error("입금상태 변경 실패:", error);
    } finally {
      setUpdatingDepositId(null);
    }
  };

  // 필터 상태 (Zustand store - 날짜는 localStorage에 보존)
  const {
    startDate,
    endDate,
    searchQuery,
    showMissingPriceOnly,
    depositFilter,
    setStartDate,
    setEndDate,
    setDateRange,
    setSearchQuery,
    setShowMissingPriceOnly,
    setDepositFilter,
  } = useSalesFilterStore();

  // 검색 debounce (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filters: SalesFilterParams = {
    startDate,
    endDate,
    supplierId: null,
    status: null,
    orderType: "all",
    searchQuery: debouncedSearchQuery,
    showMissingPriceOnly,
    depositFilter,
  };

  // 정렬 상태
  const [sortField, setSortField] = useState<SalesSortField>("purchaseDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // 탭 상태
  const [activeTab, setActiveTab] = useState<SalesTab>("order");

  // 안내 카드 접기/펼치기
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // 거래명세서 모달 상태
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(
    null
  );

  // 데이터 조회
  const { data, isLoading, error } = useSalesData(filters);
  const {
    data: demoData,
    isLoading: isDemoLoading,
    error: demoError,
  } = useDemoSalesData(filters);

  // 정렬된 레코드
  const sortedRecords = useMemo(() => {
    if (!data?.records) return [];

    // 요청, 반려, 출고자반려 상태 제외
    const filtered = data.records.filter(
      (record) =>
        record.status !== "requested" &&
        record.status !== "rejected" &&
        record.status !== "rejectedByShipper"
    );

    const sorted = [...filtered].sort((a, b) => {
      const aValue: any = a[sortField];
      const bValue: any = b[sortField];

      // null 값 처리
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // 문자열 비교
      if (typeof aValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // 숫자 비교
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [data?.records, sortField, sortDirection]);

  // 필터링된 레코드 기반 요약 데이터 재계산
  const actualSummary = useMemo(() => {
    if (!sortedRecords || sortedRecords.length === 0) {
      return {
        totalOrders: 0,
        totalItems: 0,
        totalQuantity: 0,
        totalSales: 0,
        missingPriceCount: 0,
        totalCost: 0,
        totalMargin: 0,
        averageMarginRate: 0,
        negativeMarginCount: 0,
        missingCostCount: 0,
      };
    }

    const totalItems = sortedRecords.reduce((sum, r) => sum + r.itemCount, 0);
    const totalQuantity = sortedRecords.reduce(
      (sum, r) => sum + r.totalQuantity,
      0
    );
    const totalSales = sortedRecords.reduce(
      (sum, r) => (r.totalPrice !== null ? sum + r.totalPrice : sum),
      0
    );
    const missingPriceCount = sortedRecords.filter(
      (r) => r.totalPrice === null
    ).length;

    // 마진 분석 요약
    const totalCost = sortedRecords.reduce(
      (sum, r) =>
        r.costAmount !== null && r.costAmount !== undefined
          ? sum + r.costAmount
          : sum,
      0
    );

    const totalMargin = sortedRecords.reduce(
      (sum, r) =>
        r.marginAmount !== null && r.marginAmount !== undefined
          ? sum + r.marginAmount
          : sum,
      0
    );

    const recordsWithMargin = sortedRecords.filter(
      (r) => r.marginRate !== null && r.marginRate !== undefined
    );
    const averageMarginRate =
      recordsWithMargin.length > 0
        ? recordsWithMargin.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
          recordsWithMargin.length
        : 0;

    const negativeMarginCount = sortedRecords.filter(
      (r) => r.isNegativeMargin
    ).length;
    const missingCostCount = sortedRecords.filter(
      (r) => !r.hasCostPrice
    ).length;

    return {
      totalOrders: sortedRecords.length,
      totalItems,
      totalQuantity,
      totalSales,
      missingPriceCount,
      totalCost,
      totalMargin,
      averageMarginRate,
      negativeMarginCount,
      missingCostCount,
    };
  }, [sortedRecords]);

  // 시연 레코드 (날짜 정렬)
  const sortedDemoRecords = useMemo(() => {
    if (!demoData?.records) return [];
    return [...demoData.records].sort((a, b) =>
      b.purchaseDate.localeCompare(a.purchaseDate)
    );
  }, [demoData?.records]);

  // 시연 요약
  const demoSummary = useMemo(() => {
    if (!demoData?.summary) {
      return {
        totalOrders: 0,
        totalItems: 0,
        totalQuantity: 0,
        totalSales: 0,
        missingPriceCount: 0,
        totalCost: 0,
        totalMargin: 0,
        averageMarginRate: 0,
        negativeMarginCount: 0,
        missingCostCount: 0,
      };
    }
    return demoData.summary;
  }, [demoData?.summary]);

  // 합산 요약 (판매 + 시연)
  const combinedSummary = useMemo((): SalesSummaryType => {
    const orderCount = actualSummary.totalOrders;
    const demoCount = sortedDemoRecords.length;
    const demoSalesAmount = demoSummary.totalSales;

    // 모든 레코드(판매+시연) 합산해서 마진율 계산
    const allRecords = [...sortedRecords, ...sortedDemoRecords];
    const recordsWithMargin = allRecords.filter(
      (r) => r.marginRate !== null && r.marginRate !== undefined
    );
    const combinedAvgMarginRate =
      recordsWithMargin.length > 0
        ? recordsWithMargin.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
          recordsWithMargin.length
        : 0;

    // 미수금 계산 (E-001)
    const unpaidRecords = allRecords.filter(
      (r) => !r.depositStatus || !r.depositAmount || r.depositAmount <= 0
    );
    const unpaidCount = unpaidRecords.length;
    const unpaidAmount = unpaidRecords.reduce(
      (sum, r) => sum + (r.totalPrice || 0),
      0
    );
    const paidAmount = allRecords.reduce(
      (sum, r) => sum + (r.depositAmount || 0),
      0
    );

    return {
      totalOrders: orderCount + demoCount,
      totalItems: actualSummary.totalItems + demoSummary.totalItems,
      totalQuantity: actualSummary.totalQuantity + demoSummary.totalQuantity,
      totalSales: actualSummary.totalSales + demoSalesAmount,
      missingPriceCount:
        actualSummary.missingPriceCount + demoSummary.missingPriceCount,
      totalCost: (actualSummary.totalCost || 0) + (demoSummary.totalCost || 0),
      totalMargin:
        (actualSummary.totalMargin || 0) + (demoSummary.totalMargin || 0),
      averageMarginRate: combinedAvgMarginRate,
      negativeMarginCount: actualSummary.negativeMarginCount || 0,
      missingCostCount: actualSummary.missingCostCount || 0,
      unpaidCount,
      unpaidAmount,
      paidAmount,
      orderCount,
      demoCount,
      demoSalesAmount,
    };
  }, [actualSummary, demoSummary, sortedRecords, sortedDemoRecords]);

  // 권한 체크: 로그인 및 사용자 로딩 상태
  if (isUserLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingCentered size="lg" />
        </div>
      </div>
    );
  }

  // 권한 체크: Supplier는 접근 불가
  if (!user || isSupplier) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              접근 권한이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              판매 내역 페이지는 팀 멤버만 접근할 수 있습니다.
            </p>
            <button
              onClick={() => router.push("/menu")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 정렬 토글
  const handleSort = (field: SalesSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: SalesSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  // 판매 제목 자동 생성
  const generateSalesTitle = (record: SalesRecord) => {
    const { orderItems, originalOrder } = record;

    // 패키지 판매인 경우
    if (originalOrder.packageId && originalOrder.package) {
      const packageName = originalOrder.package.packageName;
      const totalQuantity = orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return `${packageName} ${totalQuantity}개 판매`;
    }

    // 품목이 없는 경우
    if (!orderItems || orderItems.length === 0) {
      return "품목 정보 없음";
    }

    // 개별 품목 판매인 경우 (1개 품목)
    if (orderItems.length === 1) {
      const itemName = orderItems[0].item.teamItem.itemName;
      const quantity = orderItems[0].quantity;
      return `${itemName} ${quantity}개 판매`;
    }

    // 여러 품목인 경우 (2개 이상)
    const firstItemName = orderItems[0].item.teamItem.itemName;
    const totalQuantity = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    return `${firstItemName} 등 ${orderItems.length}개 품목 판매`;
  };

  // 메모 텍스트 처리 (최대 2줄, 이후 ... 처리)
  const truncateMemo = (memo: string | null) => {
    if (!memo) return "-";
    const lines = memo.split("\n");
    if (lines.length <= 2) return memo;
    return lines.slice(0, 2).join("\n") + "...";
  };

  // 엑셀 다운로드 (탭 기반 + 권한별 컬럼 차별화)
  const handleExportExcel = () => {
    if (activeTab === "demo") {
      if (!sortedDemoRecords.length) return;
      exportDemoSalesToExcel(sortedDemoRecords, undefined, showMarginColumns);
    } else {
      if (!data?.records) return;
      exportSalesToExcel(data.records, undefined, showMarginColumns);
    }
  };

  // 상태 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료":
        return "bg-green-100 text-green-700";
      case "진행중":
        return "bg-blue-100 text-blue-700";
      case "취소":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // 거래명세서 열기
  const handleOpenStatement = (record: SalesRecord) => {
    setSelectedRecord(record);
    setIsStatementModalOpen(true);
  };

  // 제목 클릭 시 판매 상세 페이지로 이동
  const handleTitleClick = (orderId: number) => {
    router.push(`/salesRecord/${orderId}`);
  };

  if (error || demoError) {
    return (
      <ErrorState
        title="데이터 조회 실패"
        message="판매 내역을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (isLoading || isDemoLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        <LoadingSkeleton type="summary" />
        <LoadingSkeleton type={isMobile ? "card" : "table"} count={5} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pb-10">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          💰 판매 내역 {showMarginColumns && "& 마진 분석"}
        </h1>
        <p className="text-gray-500 mt-2">
          승인된 판매와 유료 시연을 기반으로 판매 현황
          {showMarginColumns && " 및 마진율"}을 분석합니다
        </p>
      </div>

      {/* 상태 안내 카드 (접기/펼치기) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg mb-6 overflow-hidden">
        <button
          onClick={() => setIsInfoOpen(!isInfoOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
            <span className="text-sm font-semibold text-blue-800">
              어떤 데이터가 판매 내역에 포함되나요?
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-blue-600 transition-transform duration-200 ${
              isInfoOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isInfoOpen && (
          <div className="px-4 pb-4 text-sm text-blue-800">
            <div className="space-y-1 ml-7">
              <div>
                <span className="font-medium">포함되는 판매:</span>{" "}
                <span className="text-blue-700">
                  승인된 판매, 출고 확인된 판매, 출고 완료된 판매
                </span>
              </div>
              <div>
                <span className="font-medium">포함되는 시연:</span>{" "}
                <span className="text-purple-700">
                  유료 시연 중 출고자확인, 출고완료, 시연종료 상태
                </span>
              </div>
              <div>
                <span className="font-medium">제외:</span>{" "}
                <span className="text-blue-600">
                  승인 대기 중, 반려된 판매 / 무료 시연
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        {/* 월 범위 선택 */}
        <MonthRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onRangeChange={setDateRange}
          className="mb-4"
        />

        {/* 검색 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            검색
          </label>
          <input
            type="text"
            placeholder="제목, 판매처, 수령인, 담당자"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* 입금 상태 필터 */}
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            입금 상태
          </label>
          <select
            value={depositFilter}
            onChange={(e) => setDepositFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {DEPOSIT_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showMissingPriceOnly}
              onChange={(e) => setShowMissingPriceOnly(e.target.checked)}
              className="mr-2"
            />
            판매가 미입력만 보기
          </label>

          <button
            onClick={handleExportExcel}
            disabled={
              activeTab === "order"
                ? !data?.records.length
                : !sortedDemoRecords.length
            }
            className={`flex items-center px-4 py-2 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed ${
              activeTab === "demo"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 요약 카드 (판매+시연 합산) */}
      {combinedSummary && <SalesSummary summary={combinedSummary} />}

      {/* 판매가 미입력 경고 */}
      {combinedSummary && combinedSummary.missingPriceCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>
              판매가 미입력 판매: {combinedSummary.missingPriceCount}건
            </strong>
            <br />
            정확한 판매 금액 분석을 위해 판매가 정보를 입력해주세요.
          </div>
        </div>
      )}

      {/* 탭 UI */}
      <div className="flex border-b border-gray-200 mb-0">
        <button
          onClick={() => setActiveTab("order")}
          className={`relative px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "order"
              ? "text-blue-600 bg-white"
              : "text-gray-500 hover:text-gray-700 bg-gray-50"
          }`}
        >
          판매 ({actualSummary.totalOrders}건)
          {activeTab === "order" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("demo")}
          className={`relative px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "demo"
              ? "text-purple-600 bg-white"
              : "text-gray-500 hover:text-gray-700 bg-gray-50"
          }`}
        >
          유료 시연 ({sortedDemoRecords.length}건)
          {activeTab === "demo" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
          )}
        </button>
      </div>

      {/* 테이블/카드 */}
      <div
        className={`bg-white rounded-lg border border-gray-200 border-t-0 overflow-hidden ${
          activeTab === "order" ? "rounded-tl-none" : ""
        }`}
      >
        {activeTab === "demo" ? (
          <DemoSalesTable
            records={sortedDemoRecords}
            summary={demoSummary}
            showMarginColumns={showMarginColumns}
            isMobile={isMobile}
          />
        ) : isMobile ? (
          /* 모바일 카드형 리스트 */
          <div className="divide-y divide-gray-100">
            {sortedRecords.map((record, index) => (
              <div
                key={record.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* 헤더: 제목 & 상태 */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex-1 mr-3 cursor-pointer"
                    onClick={() => handleTitleClick(record.id)}
                  >
                    <h3 className="text-sm font-semibold text-blue-600 hover:text-blue-700 mb-1">
                      {generateSalesTitle(record)}
                    </h3>
                    {record.title && (
                      <p className="text-xs text-gray-500 mb-1">
                        {record.title}
                      </p>
                    )}
                    <p className="text-xs">
                      {record.supplierName ? (
                        <Link
                          href="/supplier"
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {record.supplierName}
                        </Link>
                      ) : (
                        <span className="text-gray-500">{record.receiver}</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </div>

                {/* 금액 강조 */}
                <div className="mb-3 space-y-2">
                  <div className="p-2 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">판매가</span>
                      <span className="text-base font-bold text-blue-600">
                        {record.totalPrice !== null ? (
                          `₩${record.totalPrice.toLocaleString()}`
                        ) : (
                          <span className="text-gray-400">미입력</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {showMarginColumns && (
                    <>
                      <div className="p-2 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">원가</span>
                          <span className="text-sm font-bold text-gray-700">
                            {record.hasCostPrice &&
                            record.costAmount !== null &&
                            record.costAmount !== undefined
                              ? `₩${record.costAmount.toLocaleString()}`
                              : "미입력"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-gray-50 rounded-md">
                          <div className="text-xs text-gray-600 mb-1">
                            마진액
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              record.marginAmount !== null &&
                              record.marginAmount !== undefined
                                ? record.marginAmount >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                                : "text-gray-400"
                            }`}
                          >
                            {record.marginAmount !== null &&
                            record.marginAmount !== undefined
                              ? `₩${record.marginAmount.toLocaleString()}`
                              : "-"}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <div className="text-xs text-gray-600 mb-1">
                            마진율
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              record.marginRate !== null &&
                              record.marginRate !== undefined
                                ? record.marginRate >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                                : "text-gray-400"
                            }`}
                          >
                            {record.marginRate !== null &&
                            record.marginRate !== undefined
                              ? `${record.marginRate.toFixed(1)}%`
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 상세 정보 */}
                <div className="space-y-1 text-xs text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">판매일자</span>
                    <span>{formatDateForDisplay(record.purchaseDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">담당자</span>
                    <span className="font-medium">{record.manager || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">품목 수</span>
                    <span className="font-medium">
                      {record.itemCount}종 {record.totalQuantity}개
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">입금상태</span>
                    {canEditDeposit ? (
                      <select
                        value={record.depositStatus || ""}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleDepositStatusChange(
                            record.id,
                            record.originalOrder.id,
                            e.target.value
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={updatingDepositId === record.id}
                        className={`text-xs font-medium rounded px-2 py-0.5 border cursor-pointer ${
                          updatingDepositId === record.id
                            ? "opacity-50 cursor-wait"
                            : getDepositStatusColor(
                                record.depositStatus,
                                record.depositAmount
                              )
                        }`}
                      >
                        <option value="">미입금</option>
                        {DEPOSIT_STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getDepositStatusColor(record.depositStatus, record.depositAmount)}`}
                      >
                        {getDepositStatusText(
                          record.depositStatus,
                          record.depositAmount
                        )}
                      </span>
                    )}
                  </div>
                  {record.depositAmount && record.depositAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">입금액</span>
                      <span className="text-green-600 font-medium text-sm">
                        ₩{record.depositAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {record.memo && (
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <span className="text-gray-500">비고:</span>
                      <p className="text-gray-600 whitespace-pre-line mt-1">
                        {truncateMemo(record.memo)}
                      </p>
                    </div>
                  )}
                </div>

                {/* 거래명세서 버튼 */}
                <button
                  onClick={() => handleOpenStatement(record)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">거래명세서</span>
                </button>
              </div>
            ))}

            {/* 합계 카드 */}
            {actualSummary && sortedRecords.length > 0 && (
              <div className="p-4 bg-blue-50 border-t-2 border-blue-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">
                      합계
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      ₩{actualSummary.totalSales.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>품목 수</span>
                    <span className="font-medium">
                      {actualSummary.totalItems}종 {actualSummary.totalQuantity}
                      개
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 데이터 없음 */}
            {sortedRecords.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                조회된 데이터가 없습니다.
              </div>
            )}
          </div>
        ) : (
          /* 데스크톱 테이블형 리스트 */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-28"
                    onClick={() => handleSort("purchaseDate")}
                  >
                    <div className="flex items-center">
                      판매일자
                      {renderSortIcon("purchaseDate")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-24"
                    onClick={() => handleSort("supplierName")}
                  >
                    <div className="flex items-center">
                      판매처
                      {renderSortIcon("supplierName")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center">
                      제목
                      {renderSortIcon("title")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-32"
                    onClick={() => handleSort("totalPrice")}
                  >
                    <div className="flex items-center justify-end">
                      {showMarginColumns ? "판매가/마진" : "판매가"}
                      {renderSortIcon("totalPrice")}
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 w-20">
                    명세서
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    {/* 메인 행: 핵심 정보 */}
                    <tr
                      className={`${
                        showMarginColumns && record.isNegativeMargin
                          ? "bg-red-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 pt-3 pb-2.5 text-sm text-gray-900 align-top">
                        {formatDateForDisplay(record.purchaseDate)}
                      </td>
                      <td className="px-4 pt-3 pb-2.5 text-sm align-top max-w-[6rem]">
                        {record.supplierName &&
                        record.originalOrder.supplierId ? (
                          <Link
                            href={`/supplier/${record.originalOrder.supplierId}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors block truncate"
                            title={record.supplierName}
                          >
                            {record.supplierName}
                          </Link>
                        ) : (
                          <span
                            className="text-gray-900 block truncate"
                            title={record.supplierName || record.receiver}
                          >
                            {record.supplierName || record.receiver}
                          </span>
                        )}
                      </td>
                      <td className="px-4 pt-3 pb-2.5 text-sm text-gray-900 align-top">
                        <div
                          className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                          onClick={() => handleTitleClick(record.id)}
                        >
                          {generateSalesTitle(record)}
                        </div>
                        {record.title && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {record.title}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mt-1">
                          <span>
                            담당자:{" "}
                            <span className="text-gray-700">
                              {record.manager || "-"}
                            </span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>
                            품목:{" "}
                            <span className="text-gray-700">
                              {record.itemCount}종 {record.totalQuantity}개
                            </span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="inline-flex items-center gap-1">
                            입금:
                            {canEditDeposit ? (
                              <select
                                value={record.depositStatus || ""}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleDepositStatusChange(
                                    record.id,
                                    record.originalOrder.id,
                                    e.target.value
                                  );
                                }}
                                onClick={(e) => e.stopPropagation()}
                                disabled={updatingDepositId === record.id}
                                className={`text-xs font-medium rounded px-1.5 py-0.5 border cursor-pointer transition-colors ${
                                  updatingDepositId === record.id
                                    ? "opacity-50 cursor-wait"
                                    : getDepositStatusColor(
                                        record.depositStatus,
                                        record.depositAmount
                                      )
                                }`}
                              >
                                <option value="">미입금</option>
                                {DEPOSIT_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${getDepositStatusColor(record.depositStatus, record.depositAmount)}`}
                              >
                                {getDepositStatusText(
                                  record.depositStatus,
                                  record.depositAmount
                                )}
                              </span>
                            )}
                            {record.depositAmount &&
                              record.depositAmount > 0 && (
                                <span className="text-green-600 font-medium">
                                  ₩{record.depositAmount.toLocaleString()}
                                </span>
                              )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 pt-3 pb-2.5 text-sm text-right tabular-nums align-top">
                        <div>
                          {record.totalPrice !== null ? (
                            <span className="font-semibold text-gray-900">
                              ₩{record.totalPrice.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">미입력</span>
                          )}
                        </div>
                        {showMarginColumns && (
                          <div className="mt-0.5 text-xs space-y-0.5 whitespace-nowrap">
                            <div className="text-gray-500">
                              원가:{" "}
                              <span className="text-gray-700">
                                {record.hasCostPrice &&
                                record.costAmount !== null &&
                                record.costAmount !== undefined
                                  ? `₩${record.costAmount.toLocaleString()}`
                                  : "미입력"}
                              </span>
                            </div>
                            <div>
                              마진:{" "}
                              <span
                                className={`font-medium ${
                                  record.marginAmount !== null &&
                                  record.marginAmount !== undefined
                                    ? record.marginAmount >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {record.marginAmount !== null &&
                                record.marginAmount !== undefined
                                  ? `₩${record.marginAmount.toLocaleString()}`
                                  : "-"}
                              </span>
                              {record.marginRate !== null &&
                                record.marginRate !== undefined && (
                                  <span
                                    className={`ml-0.5 font-medium ${
                                      record.marginRate >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    ({record.marginRate.toFixed(1)}%)
                                  </span>
                                )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 pt-3 pb-2.5 text-center align-top">
                        <button
                          onClick={() => handleOpenStatement(record)}
                          className="inline-flex items-center justify-center p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="거래명세서 보기"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}

                {/* 합계 행 */}
                {actualSummary && (
                  <>
                    <tr className="bg-blue-50 border-t-2 border-blue-200">
                      <td
                        colSpan={3}
                        className="px-4 py-2.5 text-sm font-bold text-right text-gray-900"
                      >
                        합계 ({actualSummary.totalItems}종{" "}
                        {actualSummary.totalQuantity}개)
                      </td>
                      <td className="px-4 py-2.5 text-sm text-right tabular-nums align-top">
                        <div className="font-bold text-gray-900">
                          ₩{actualSummary.totalSales.toLocaleString()}
                        </div>
                        {showMarginColumns && (
                          <div className="mt-0.5 text-xs space-y-0.5">
                            <div className="text-gray-600">
                              원가: ₩
                              {(actualSummary?.totalCost || 0).toLocaleString()}
                            </div>
                            <div className="text-green-600 font-medium">
                              마진: ₩
                              {(
                                actualSummary?.totalMargin || 0
                              ).toLocaleString()}{" "}
                              (
                              {(actualSummary?.averageMarginRate || 0).toFixed(
                                1
                              )}
                              %)
                            </div>
                          </div>
                        )}
                      </td>
                      <td></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 데이터 없음 (데스크톱용) */}
        {!isMobile && sortedRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            조회된 데이터가 없습니다.
          </div>
        )}
      </div>

      {/* 역마진 경고 안내 (Admin/Moderator만) */}
      {showMarginColumns &&
        combinedSummary &&
        combinedSummary.negativeMarginCount &&
        combinedSummary.negativeMarginCount > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong className="block mb-1">
                ⚠️ 역마진 판매: {combinedSummary.negativeMarginCount}건
              </strong>
              <p>
                판매가가 원가보다 낮은 판매가 발견되었습니다. 가격 정책을
                검토해주세요.
              </p>
            </div>
          </div>
        )}

      {/* 거래명세서 모달 */}
      {selectedRecord && (
        <TransactionStatementModal
          isOpen={isStatementModalOpen}
          onClose={() => setIsStatementModalOpen(false)}
          record={selectedRecord}
        />
      )}
    </div>
  );
}
