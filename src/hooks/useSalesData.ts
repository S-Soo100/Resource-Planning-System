import { useQuery } from '@tanstack/react-query';
import {
  SalesRecord,
  SalesSummary,
  SalesFilterParams,
  SalesPriceCalculation,
} from '@/types/sales';
import { Order } from '@/types/(order)/order';
import { TeamItem } from '@/types/(item)/team-item';
import { getOrdersByTeamId } from '@/api/order-api';
import { teamItemsApi } from '@/api/team-items-api';
import { authStore } from '@/store/authStore';

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
 * 발주 데이터를 판매 레코드로 변환 (마진 정보 포함)
 */
const transformToSalesRecord = (
  order: Order,
  teamItemsMap: Map<number, TeamItem>
): SalesRecord => {
  const priceCalc = calculateOrderTotal(order);
  const totalQuantity = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // 원가 계산
  let costAmount: number | null = null;
  let hasCostPrice = false;

  if (order.orderItems && order.orderItems.length > 0) {
    let totalCost = 0;
    let hasAnyCost = false;

    for (const item of order.orderItems) {
      const teamItem = item.item?.teamItem;
      if (teamItem && teamItemsMap.has(teamItem.id)) {
        const teamItemData = teamItemsMap.get(teamItem.id);
        const costPrice = teamItemData?.costPrice;

        if (costPrice !== null && costPrice !== undefined) {
          totalCost += costPrice * item.quantity;
          hasAnyCost = true;
        }
      }
    }

    if (hasAnyCost) {
      costAmount = totalCost;
      hasCostPrice = true;
    }
  }

  // 마진 계산
  let marginAmount: number | null = null;
  let marginRate: number | null = null;
  let isNegativeMargin = false;

  if (priceCalc.totalPrice !== null && costAmount !== null) {
    marginAmount = priceCalc.totalPrice - costAmount;
    if (priceCalc.totalPrice !== 0) {
      marginRate = (marginAmount / priceCalc.totalPrice) * 100;
      isNegativeMargin = marginRate < 0;
    }
  }

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
    // 마진 분석 필드
    costAmount,
    marginAmount,
    marginRate,
    hasCostPrice,
    isNegativeMargin,
  };
};

/**
 * 판매 요약 정보 계산 (마진 정보 포함)
 */
const calculateSummary = (records: SalesRecord[]): SalesSummary => {
  const totalItems = records.reduce((sum, r) => sum + r.itemCount, 0);
  const totalQuantity = records.reduce((sum, r) => sum + r.totalQuantity, 0);
  const totalSales = records.reduce(
    (sum, r) => (r.totalPrice !== null ? sum + r.totalPrice : sum),
    0
  );
  const missingPriceCount = records.filter((r) => r.totalPrice === null).length;

  // 마진 분석 요약
  const totalCost = records.reduce(
    (sum, r) => (r.costAmount !== null ? sum + (r.costAmount || 0) : sum),
    0
  );

  const totalMargin = records.reduce(
    (sum, r) => (r.marginAmount !== null ? sum + (r.marginAmount || 0) : sum),
    0
  );

  const recordsWithMargin = records.filter((r) => r.marginRate !== null);
  const averageMarginRate =
    recordsWithMargin.length > 0
      ? recordsWithMargin.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
        recordsWithMargin.length
      : 0;

  const negativeMarginCount = records.filter((r) => r.isNegativeMargin).length;
  const missingCostCount = records.filter((r) => !r.hasCostPrice).length;

  return {
    totalOrders: records.length,
    totalItems,
    totalQuantity,
    totalSales,
    missingPriceCount,
    // 마진 분석
    totalCost,
    totalMargin,
    averageMarginRate,
    negativeMarginCount,
    missingCostCount,
  };
};

/**
 * 판매 데이터 조회 훅 (마진 정보 포함)
 */
export const useSalesData = (params: SalesFilterParams) => {
  const selectedTeam = authStore((state) => state.selectedTeam);

  return useQuery({
    queryKey: [
      'sales',
      selectedTeam?.id,
      params.startDate,
      params.endDate,
      params.supplierId,
      params.status,
      params.orderType,
      params.searchQuery,
      params.showMissingPriceOnly,
    ],
    queryFn: async () => {
      if (!selectedTeam?.id) {
        throw new Error('팀이 선택되지 않았습니다.');
      }

      // 1. TeamItem 데이터 조회 (원가 정보)
      const teamItemsResponse = await teamItemsApi.getTeamItemsByTeam(
        selectedTeam.id
      );
      if (!teamItemsResponse.success || !teamItemsResponse.data) {
        throw new Error('TeamItem 데이터 조회에 실패했습니다.');
      }

      // TeamItem Map 생성 (teamItemId -> TeamItem)
      const teamItemsMap = new Map<number, TeamItem>();
      for (const teamItem of teamItemsResponse.data) {
        teamItemsMap.set(teamItem.id, teamItem);
      }

      // 2. 발주 데이터 조회
      const response = await getOrdersByTeamId(selectedTeam.id);
      if (!response.success || !response.data) {
        throw new Error('발주 데이터 조회에 실패했습니다.');
      }

      const orders = response.data as Order[];

      // 3. 판매 레코드로 변환 (마진 정보 포함)
      let salesRecords = orders.map((order) =>
        transformToSalesRecord(order, teamItemsMap)
      );

      // 날짜 필터링 (client-side)
      salesRecords = salesRecords.filter((record: SalesRecord) => {
        const purchaseDate = record.purchaseDate;
        return (
          purchaseDate >= params.startDate && purchaseDate <= params.endDate
        );
      });

      // 공급처 필터링
      if (params.supplierId) {
        salesRecords = salesRecords.filter(
          (r: SalesRecord) => r.originalOrder.supplierId === params.supplierId
        );
      }

      // 상태 필터링
      if (params.status) {
        salesRecords = salesRecords.filter(
          (r: SalesRecord) => r.status === params.status
        );
      }

      // 패키지/개별 필터링
      if (params.orderType && params.orderType !== 'all') {
        if (params.orderType === 'package') {
          salesRecords = salesRecords.filter(
            (r: SalesRecord) => r.originalOrder.packageId !== null
          );
        } else if (params.orderType === 'individual') {
          salesRecords = salesRecords.filter(
            (r: SalesRecord) => r.originalOrder.packageId === null
          );
        }
      }

      // 검색어 필터링
      if (params.searchQuery && params.searchQuery.trim()) {
        const query = params.searchQuery.toLowerCase();
        salesRecords = salesRecords.filter(
          (record: SalesRecord) =>
            record.title.toLowerCase().includes(query) ||
            record.supplierName.toLowerCase().includes(query) ||
            record.receiver.toLowerCase().includes(query) ||
            record.manager.toLowerCase().includes(query)
        );
      }

      // 판매가 미입력만 보기 필터
      if (params.showMissingPriceOnly) {
        salesRecords = salesRecords.filter(
          (r: SalesRecord) => r.totalPrice === null
        );
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
