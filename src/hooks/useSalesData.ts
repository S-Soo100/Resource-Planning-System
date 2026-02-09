import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  SalesRecord,
  SalesSummary,
  SalesFilterParams,
  SalesPriceCalculation,
} from '@/types/sales';
import { Order } from '@/types/(order)/order';

/**
 * 발주의 총 판매 금액 계산
 */
export const calculateOrderTotal = (order: Order): SalesPriceCalculation => {
  // 1순위: order.totalPrice
  if (order.totalPrice !== null && order.totalPrice !== undefined) {
    return {
      totalPrice: order.totalPrice,
      hasPrice: true,
      source: 'order',
    };
  }

  // 2순위: orderItems 합계
  if (order.orderItems && order.orderItems.length > 0) {
    let itemsTotal = 0;
    let hasAnyPrice = false;

    for (const item of order.orderItems) {
      if (item.sellingPrice !== null && item.sellingPrice !== undefined) {
        itemsTotal += item.sellingPrice * item.quantity;
        hasAnyPrice = true;
      }
    }

    if (hasAnyPrice) {
      return {
        totalPrice: itemsTotal,
        hasPrice: true,
        source: 'items',
      };
    }
  }

  // 가격 정보 없음
  return {
    totalPrice: null,
    hasPrice: false,
    source: 'none',
  };
};

/**
 * 발주 데이터를 판매 레코드로 변환
 */
const transformToSalesRecord = (order: Order): SalesRecord => {
  const priceCalc = calculateOrderTotal(order);
  const totalQuantity = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return {
    id: order.id,
    purchaseDate: order.purchaseDate || '',
    title: order.title || '',
    supplierName: order.supplier?.supplierName || '',
    receiver: order.receiver || '',
    itemCount: order.orderItems?.length || 0,
    totalQuantity,
    totalPrice: priceCalc.totalPrice,
    status: order.status || '',
    manager: order.manager || '',
    memo: order.memo || null,
    orderItems: order.orderItems || [],
    originalOrder: order,
  };
};

/**
 * 판매 요약 정보 계산
 */
const calculateSummary = (records: SalesRecord[]): SalesSummary => {
  const totalItems = records.reduce((sum, r) => sum + r.itemCount, 0);
  const totalQuantity = records.reduce((sum, r) => sum + r.totalQuantity, 0);
  const totalSales = records.reduce(
    (sum, r) => (r.totalPrice !== null ? sum + r.totalPrice : sum),
    0
  );
  const missingPriceCount = records.filter((r) => r.totalPrice === null).length;

  return {
    totalOrders: records.length,
    totalItems,
    totalQuantity,
    totalSales,
    missingPriceCount,
  };
};

/**
 * 판매 데이터 조회 훅
 */
export const useSalesData = (params: SalesFilterParams) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: async () => {
      // API 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', params.startDate);
      queryParams.append('endDate', params.endDate);

      if (params.supplierId) {
        queryParams.append('supplierId', params.supplierId.toString());
      }
      if (params.status) {
        queryParams.append('status', params.status);
      }

      // 발주 데이터 조회
      const response = await axios.get<Order[]>(
        `/api/order?${queryParams.toString()}`
      );

      // 판매 레코드로 변환
      let salesRecords = response.data.map(transformToSalesRecord);

      // 패키지/개별 필터링
      if (params.orderType && params.orderType !== 'all') {
        if (params.orderType === 'package') {
          salesRecords = salesRecords.filter(
            (r) => r.originalOrder.packageId !== null
          );
        } else if (params.orderType === 'individual') {
          salesRecords = salesRecords.filter(
            (r) => r.originalOrder.packageId === null
          );
        }
      }

      // 검색어 필터링
      if (params.searchQuery && params.searchQuery.trim()) {
        const query = params.searchQuery.toLowerCase();
        salesRecords = salesRecords.filter(
          (record) =>
            record.title.toLowerCase().includes(query) ||
            record.supplierName.toLowerCase().includes(query) ||
            record.receiver.toLowerCase().includes(query) ||
            record.manager.toLowerCase().includes(query)
        );
      }

      // 판매가 미입력만 보기 필터
      if (params.showMissingPriceOnly) {
        salesRecords = salesRecords.filter((r) => r.totalPrice === null);
      }

      // 요약 정보 계산
      const summary = calculateSummary(salesRecords);

      return {
        records: salesRecords,
        summary,
      };
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};
