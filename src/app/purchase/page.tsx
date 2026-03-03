"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePurchaseData } from "@/hooks/usePurchaseData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTeamItems } from "@/hooks/useTeamItems";
import { PurchaseSummary } from "@/components/purchase/PurchaseSummary";
import { exportPurchaseToExcel } from "@/utils/exportPurchaseToExcel";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { LoadingCentered } from "@/components/ui/Loading";
import { MonthRangePicker } from "@/components/common/MonthRangePicker";
import { usePurchaseFilterStore } from "@/store/filterStore";
import {
  PurchaseFilterParams,
  PurchaseSortField,
  SortDirection,
  PurchaseRecord,
} from "@/types/purchase";

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

export default function PurchasePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  // TeamItems 데이터 (live costPrice를 가져오기 위해)
  const { useGetTeamItems } = useTeamItems();
  const { teamItems } = useGetTeamItems();

  // 미디어 쿼리
  const isMobile = useMediaQuery("(max-width: 759px)");

  // 필터 상태 (Zustand store - 날짜는 localStorage에 보존)
  const {
    startDate,
    endDate,
    searchQuery,
    showMissingCostOnly,
    setStartDate,
    setEndDate,
    setDateRange,
    setSearchQuery,
    setShowMissingCostOnly,
  } = usePurchaseFilterStore();

  const filters: PurchaseFilterParams = {
    startDate,
    endDate,
    warehouseId: null,
    supplierId: null,
    categoryId: null,
    searchQuery,
    showMissingCostOnly,
  };

  // 정렬 상태
  const [sortField, setSortField] = useState<PurchaseSortField>("inboundDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // 데이터 조회
  const { data, isLoading, error } = usePurchaseData(filters);

  // TeamItem ID -> TeamItem 매핑 (live costPrice 조회용)
  const teamItemsMap = useMemo(() => {
    if (!teamItems) return new Map();
    return new Map(teamItems.map((ti) => [ti.id, ti]));
  }, [teamItems]);

  // 레코드에서 현재 costPrice를 가져오는 헬퍼 함수
  const getCostPrice = (record: PurchaseRecord): number | null | undefined => {
    const teamItemId = record.originalRecord.item?.teamItem?.id;
    if (!teamItemId) return null;
    const currentTeamItem = teamItemsMap.get(teamItemId);
    return currentTeamItem?.costPrice;
  };

  // 실시간 costPrice를 반영한 요약 정보 재계산
  const actualSummary = useMemo(() => {
    if (!data?.records || teamItemsMap.size === 0) return data?.summary;

    const records = data.records;
    const uniqueItems = new Set(records.map((r) => r.itemCode));
    const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);

    // 실시간 costPrice를 사용하여 totalAmount 계산
    const totalAmount = records.reduce((sum, r) => {
      const costPrice = getCostPrice(r);
      if (costPrice !== null && costPrice !== undefined) {
        return sum + r.quantity * costPrice;
      }
      return sum;
    }, 0);

    // 실시간 costPrice를 확인하여 미입력 건수 계산
    const missingCostCount = records.filter((r) => {
      const costPrice = getCostPrice(r);
      return costPrice === null || costPrice === undefined;
    }).length;

    return {
      totalOrders: records.length,
      totalItems: uniqueItems.size,
      totalQuantity,
      totalAmount,
      missingCostCount,
    };
  }, [data?.records, data?.summary, teamItemsMap]);

  // 정렬된 레코드
  const sortedRecords = useMemo(() => {
    if (!data?.records) return [];

    const sorted = [...data.records].sort((a, b) => {
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
  if (!user || user.accessLevel === "supplier") {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              접근 권한이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              구매 내역 페이지는 팀 멤버만 접근할 수 있습니다.
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
  const handleSort = (field: PurchaseSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: PurchaseSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  // 날짜 포맷 간소화 (2026-02-10T00:00:00.000Z → 26-02-10)
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(2); // 26
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 02
    const day = date.getDate().toString().padStart(2, "0"); // 10
    return `${year}-${month}-${day}`;
  };

  // 비고 텍스트 처리 (최대 2줄, 이후 ... 처리)
  const truncateRemarks = (remarks: string | null) => {
    if (!remarks) return "-";
    const lines = remarks.split("\n");
    if (lines.length <= 2) return remarks;
    return lines.slice(0, 2).join("\n") + "...";
  };

  // 엑셀 다운로드
  const handleExportExcel = () => {
    if (!data?.records) return;
    exportPurchaseToExcel(data.records);
  };

  // 품목명 클릭 시 품목 상세 페이지로 이동
  const handleItemClick = (itemId: number) => {
    router.push(`/item/${itemId}`);
  };

  if (error) {
    return (
      <ErrorState
        title="데이터 조회 실패"
        message="구매 내역을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (isLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900">📦 구매 내역</h1>
        <p className="text-gray-500 mt-2">
          입고 내역을 기반으로 구매 현황을 분석합니다
        </p>
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
            placeholder="품목코드, 품목명, 비고"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showMissingCostOnly}
              onChange={(e) => setShowMissingCostOnly(e.target.checked)}
              className="mr-2"
            />
            원가 미입력만 보기
          </label>

          <button
            onClick={handleExportExcel}
            disabled={!data?.records.length}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      {actualSummary && <PurchaseSummary summary={actualSummary} />}

      {/* 원가 미입력 경고 */}
      {actualSummary && actualSummary.missingCostCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>
              원가 미입력 품목: {actualSummary.missingCostCount}건
            </strong>
            <br />
            정확한 구매 금액 분석을 위해 원가 정보를 입력해주세요.
          </div>
        </div>
      )}

      {/* 테이블/카드 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isMobile ? (
          /* 모바일 카드형 리스트 */
          <div className="divide-y divide-gray-100">
            {sortedRecords.map((record, index) => (
              <div
                key={record.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* 헤더: 품목명 & 금액 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {record.itemName}
                    </h3>
                    <p className="text-xs text-gray-500">{record.itemCode}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900">
                      {(() => {
                        const costPrice = getCostPrice(record);
                        if (costPrice !== null && costPrice !== undefined) {
                          const totalPrice = record.quantity * costPrice;
                          return `₩${totalPrice.toLocaleString()}`;
                        }
                        return <span className="text-gray-400">-</span>;
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {record.quantity.toLocaleString()}개
                    </div>
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-500">공급처</span>
                    <span className="font-medium">
                      {record.supplierName &&
                      record.originalRecord.supplierId ? (
                        <Link
                          href={`/supplier/${record.originalRecord.supplierId}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {record.supplierName}
                        </Link>
                      ) : (
                        <span className="text-gray-900">
                          {record.supplierName || "-"}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">입고일자</span>
                    <span>{formatDate(record.inboundDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">단가</span>
                    <span>
                      {(() => {
                        const costPrice = getCostPrice(record);
                        return costPrice !== null && costPrice !== undefined ? (
                          `₩${costPrice.toLocaleString()}`
                        ) : (
                          <span className="text-gray-400">미입력</span>
                        );
                      })()}
                    </span>
                  </div>
                  {record.remarks && (
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <span className="text-gray-500">비고:</span>
                      <p className="text-gray-600 whitespace-pre-line mt-1">
                        {truncateRemarks(record.remarks)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 합계 카드 */}
            {actualSummary && sortedRecords.length > 0 && (
              <div className="p-4 bg-blue-50 border-t-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">합계</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">
                      ₩{actualSummary.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {actualSummary.totalQuantity.toLocaleString()}개
                    </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    No
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("supplierName")}
                  >
                    <div className="flex items-center">
                      공급처
                      {renderSortIcon("supplierName")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("inboundDate")}
                  >
                    <div className="flex items-center">
                      입고일자
                      {renderSortIcon("inboundDate")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("itemName")}
                  >
                    <div className="flex items-center">
                      품목명
                      {renderSortIcon("itemName")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("quantity")}
                  >
                    <div className="flex items-center justify-end">
                      수량
                      {renderSortIcon("quantity")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                    단가
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("totalPrice")}
                  >
                    <div className="flex items-center justify-end">
                      금액
                      {renderSortIcon("totalPrice")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-[20%]">
                    비고
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {record.supplierName &&
                      record.originalRecord.supplierId ? (
                        <Link
                          href={`/supplier/${record.originalRecord.supplierId}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {record.supplierName}
                        </Link>
                      ) : (
                        <span className="text-gray-900">
                          {record.supplierName || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(record.inboundDate)}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() =>
                        handleItemClick(record.originalRecord.itemId)
                      }
                    >
                      <div className="font-medium text-blue-600 hover:text-blue-700">
                        {record.itemName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {record.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {(() => {
                        const costPrice = getCostPrice(record);
                        return costPrice !== null && costPrice !== undefined ? (
                          `₩${costPrice.toLocaleString()}`
                        ) : (
                          <span className="text-gray-400">미입력</span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {(() => {
                        const costPrice = getCostPrice(record);
                        if (costPrice !== null && costPrice !== undefined) {
                          const totalPrice = record.quantity * costPrice;
                          return `₩${totalPrice.toLocaleString()}`;
                        }
                        return <span className="text-gray-400">-</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-0">
                      <div className="line-clamp-2 overflow-hidden text-ellipsis">
                        {record.remarks || "-"}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* 합계 행 */}
                {actualSummary && (
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-sm font-bold text-right text-gray-900"
                    >
                      합계
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">
                      {actualSummary.totalQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-blue-600">
                      ₩{actualSummary.totalAmount.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
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
    </div>
  );
}
