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

  // 4. 요약 통계 계산
  const summary: SupplierDetailSummary | null = useMemo(() => {
    if (!salesQuery.data || !purchaseQuery.data) {
      return null;
    }

    const salesSummary = salesQuery.data.summary;
    const purchaseSummary = purchaseQuery.data.summary;

    return {
      // 판매 관련
      totalSalesOrders: salesSummary.totalOrders,
      totalSalesAmount: salesSummary.totalSales,
      totalMargin: salesSummary.totalMargin,
      averageMarginRate: salesSummary.averageMarginRate,

      // 구매 관련
      totalPurchaseOrders: purchaseSummary.totalOrders,
      totalPurchaseAmount: purchaseSummary.totalAmount,
    };
  }, [salesQuery.data, purchaseQuery.data]);

  return {
    // 고객 기본 정보
    supplier: supplierQuery.supplier,
    isSupplierLoading: supplierQuery.isLoading,
    isSupplierError: supplierQuery.isError,

    // 판매 데이터
    salesRecords: salesQuery.data?.records || [],
    salesSummary: salesQuery.data?.summary,
    isSalesLoading: salesQuery.isLoading,
    isSalesError: salesQuery.isError,

    // 구매 데이터
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
