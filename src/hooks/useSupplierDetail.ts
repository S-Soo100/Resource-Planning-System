import { useSuppliers } from './useSupplier';
import { useSalesData } from './useSalesData';
import { usePurchaseData } from './usePurchaseData';
import { SupplierDetailSummary } from '@/types/supplier';
import { format, subMonths } from 'date-fns';
import { useMemo } from 'react';

/**
 * 고객 상세 페이지 데이터 조회 훅 (v2.5)
 *
 * @param supplierId - 고객 ID
 * @param startDate - 조회 시작일 (기본값: 최근 3개월)
 * @param endDate - 조회 종료일 (기본값: 오늘)
 */
export function useSupplierDetail(
  supplierId: string,
  startDate?: string,
  endDate?: string
) {
  const { useGetSupplier } = useSuppliers();

  // 기본 날짜 범위: 최근 3개월
  const defaultStartDate = useMemo(
    () => format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    []
  );
  const defaultEndDate = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const finalStartDate = startDate || defaultStartDate;
  const finalEndDate = endDate || defaultEndDate;

  // 1. 고객 기본 정보 조회
  const supplierQuery = useGetSupplier(supplierId);

  // 2. 판매 데이터 조회 (발주 데이터 기반)
  const salesQuery = useSalesData({
    startDate: finalStartDate,
    endDate: finalEndDate,
    supplierId: Number(supplierId),
    status: undefined,
    orderType: 'all',
    searchQuery: undefined,
    showMissingPriceOnly: false,
  });

  // 3. 구매 데이터 조회 (입고 데이터 기반)
  const purchaseQuery = usePurchaseData({
    startDate: finalStartDate,
    endDate: finalEndDate,
    warehouseId: undefined,
    supplierId: Number(supplierId),
    categoryId: undefined,
    searchQuery: undefined,
    showMissingCostOnly: false,
  });

  // 4. 매출 레코드 필터링 (요청/반려/출고자반려 제외)
  const filteredSalesRecords = useMemo(() => {
    if (!salesQuery.data?.records) return [];

    return salesQuery.data.records.filter(
      (record) =>
        record.status !== 'requested' &&
        record.status !== 'rejected' &&
        record.status !== 'rejectedByShipper'
    );
  }, [salesQuery.data]);

  // 5. 요약 통계 재계산 (필터링된 데이터 기준)
  const summary: SupplierDetailSummary | null = useMemo(() => {
    if (!salesQuery.data || !purchaseQuery.data) {
      return null;
    }

    // 필터링된 매출 레코드로 요약 계산
    const totalSalesAmount = filteredSalesRecords.reduce(
      (sum, r) => (r.totalPrice !== null ? sum + r.totalPrice : sum),
      0
    );

    const totalMargin = filteredSalesRecords.reduce(
      (sum, r) => (r.marginAmount !== null ? sum + (r.marginAmount || 0) : sum),
      0
    );

    const recordsWithMargin = filteredSalesRecords.filter((r) => r.marginRate !== null);
    const averageMarginRate =
      recordsWithMargin.length > 0
        ? recordsWithMargin.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
          recordsWithMargin.length
        : 0;

    const purchaseSummary = purchaseQuery.data.summary;

    return {
      // 매출 관련 (필터링된 데이터)
      totalSalesOrders: filteredSalesRecords.length,
      totalSalesAmount,
      totalMargin,
      averageMarginRate,

      // 매입 관련
      totalPurchaseOrders: purchaseSummary.totalOrders,
      totalPurchaseAmount: purchaseSummary.totalAmount,
    };
  }, [filteredSalesRecords, purchaseQuery.data]);

  return {
    // 고객 기본 정보
    supplier: supplierQuery.supplier,
    isSupplierLoading: supplierQuery.isLoading,
    isSupplierError: supplierQuery.isError,

    // 매출 데이터 (필터링된 레코드)
    salesRecords: filteredSalesRecords,
    salesSummary: salesQuery.data?.summary,
    isSalesLoading: salesQuery.isLoading,
    isSalesError: salesQuery.isError,

    // 매입 데이터
    purchaseRecords: purchaseQuery.data?.records || [],
    purchaseSummary: purchaseQuery.data?.summary,
    teamItemsMap: purchaseQuery.data?.teamItemsMap,
    isPurchaseLoading: purchaseQuery.isLoading,
    isPurchaseError: purchaseQuery.isError,

    // 통합 요약
    summary,

    // 날짜 범위
    dateRange: {
      startDate: finalStartDate,
      endDate: finalEndDate,
    },

    // 전체 로딩 상태
    isLoading:
      supplierQuery.isLoading || salesQuery.isLoading || purchaseQuery.isLoading,

    // 전체 에러 상태
    isError:
      supplierQuery.isError || salesQuery.isError || purchaseQuery.isError,
  };
}
