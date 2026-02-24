import { useQuery } from '@tanstack/react-query';
import {
  MarginAnalysisRecord,
  MarginSummary,
  MarginFilterParams,
} from '@/types/margin-analysis';
import { Order } from '@/types/(order)/order';
import { TeamItem } from '@/types/(item)/team-item';
import { getOrdersByTeamId } from '@/api/order-api';
import { teamItemsApi } from '@/api/team-items-api';
import { authStore } from '@/store/authStore';

/**
 * 품목별 판매 데이터 집계 타입
 */
interface ItemSalesData {
  itemCode: string;
  itemName: string;
  categoryName: string;
  categoryColor?: string;
  transactionCount: number; // 거래 건수 (발주 건수)
  salesQuantity: number; // 판매 수량
  salesAmount: number; // 판매가 합계
  teamItemId: number; // TeamItem ID (실시간 원가 조회용)
  hasSalesPrice: boolean; // 판매가 입력 여부
}

/**
 * 발주 데이터에서 품목별 판매 데이터 추출 및 집계
 */
const aggregateItemSalesData = (orders: Order[]): Map<string, ItemSalesData> => {
  const itemMap = new Map<string, ItemSalesData>();
  // 품목별 발주 ID 추적 (거래 건수 계산용)
  const itemOrderIds = new Map<string, Set<number>>();

  // 요청/반려 상태 제외
  const excludedStatuses = ['requested', 'rejected', 'rejectedByShipper'];
  const validOrders = orders.filter(
    (order) => !excludedStatuses.includes(order.status)
  );

  for (const order of validOrders) {
    if (!order.orderItems || order.orderItems.length === 0) continue;

    for (const orderItem of order.orderItems) {
      const teamItem = orderItem.item?.teamItem;
      if (!teamItem) continue;

      const itemCode = teamItem.itemCode;
      const existingData = itemMap.get(itemCode);

      // 거래 건수 추적
      if (!itemOrderIds.has(itemCode)) {
        itemOrderIds.set(itemCode, new Set());
      }
      itemOrderIds.get(itemCode)!.add(order.id);

      // 판매가 계산 (sellingPrice가 있는 경우에만)
      const hasPrice = orderItem.sellingPrice !== null && orderItem.sellingPrice !== undefined;
      const itemSalesAmount = hasPrice && orderItem.sellingPrice !== null && orderItem.sellingPrice !== undefined ? orderItem.sellingPrice * orderItem.quantity : 0;

      if (existingData) {
        // 기존 품목에 수량과 금액 누적
        existingData.salesQuantity += orderItem.quantity;
        existingData.transactionCount = itemOrderIds.get(itemCode)!.size;
        if (hasPrice) {
          existingData.salesAmount += itemSalesAmount;
          existingData.hasSalesPrice = true;
        }
      } else {
        // 새 품목 추가
        itemMap.set(itemCode, {
          itemCode,
          itemName: teamItem.itemName,
          categoryName: '미분류', // TODO: 카테고리 정보가 teamItem에 없음 - 추후 개선
          categoryColor: undefined,
          transactionCount: 1,
          salesQuantity: orderItem.quantity,
          salesAmount: hasPrice ? itemSalesAmount : 0,
          teamItemId: teamItem.id,
          hasSalesPrice: hasPrice,
        });
      }
    }
  }

  return itemMap;
};

/**
 * 품목별 판매 데이터를 마진 분석 레코드로 변환 (실시간 원가 적용)
 * @param itemData 품목별 판매 데이터
 * @param teamItemsMap TeamItem Map (teamItemId -> TeamItem)
 */
const transformToMarginRecord = (
  itemData: ItemSalesData,
  teamItemsMap: Map<number, TeamItem>
): MarginAnalysisRecord => {
  // TeamItem에서 실시간 원가 조회
  const teamItem = teamItemsMap.get(itemData.teamItemId);
  const costPrice = teamItem?.costPrice ?? null;

  // 원가 입력 여부 체크: null, undefined는 미입력으로 간주 (0원은 유효한 원가)
  const hasCost = costPrice !== null && costPrice !== undefined;

  // 원가 합계 계산 (원가가 있을 때만)
  let costAmount: number | null = null;
  if (hasCost && costPrice !== null) {
    costAmount = costPrice * itemData.salesQuantity;
  }

  // 마진 계산: (판매가 - 원가) / 판매가 × 100
  let marginAmount: number | null = null;
  let marginRate: number | null = null;
  let isNegativeMargin = false;

  if (itemData.hasSalesPrice && hasCost && costAmount !== null) {
    marginAmount = itemData.salesAmount - costAmount;
    if (itemData.salesAmount !== 0) {
      marginRate = (marginAmount / itemData.salesAmount) * 100;
      isNegativeMargin = marginRate < 0;
    }
  }

  return {
    itemCode: itemData.itemCode,
    itemName: itemData.itemName,
    categoryName: itemData.categoryName,
    categoryColor: itemData.categoryColor,
    transactionCount: itemData.transactionCount,
    salesQuantity: itemData.salesQuantity,
    salesAmount: itemData.hasSalesPrice ? itemData.salesAmount : null,
    costAmount,
    marginAmount,
    marginRate,
    hasSalesPrice: itemData.hasSalesPrice,
    hasCostPrice: hasCost,
    isNegativeMargin,
    teamItemId: itemData.teamItemId,
  };
};

/**
 * 마진 분석 요약 정보 계산
 */
const calculateMarginSummary = (
  records: MarginAnalysisRecord[]
): MarginSummary => {
  const totalItems = records.length;

  // 평균 마진율 계산 (마진율이 있는 품목만)
  const recordsWithMarginRate = records.filter(
    (r) => r.marginRate !== null
  );
  const averageMarginRate =
    recordsWithMarginRate.length > 0
      ? recordsWithMarginRate.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
        recordsWithMarginRate.length
      : 0;

  // 총 마진액 계산
  const totalMarginAmount = records.reduce(
    (sum, r) => (r.marginAmount !== null ? sum + r.marginAmount : sum),
    0
  );

  // 역마진 건수
  const negativeMarginCount = records.filter((r) => r.isNegativeMargin).length;

  // 원가 미입력 건수
  const missingCostCount = records.filter((r) => !r.hasCostPrice).length;

  // 판매가 미입력 건수
  const missingSalesCount = records.filter((r) => !r.hasSalesPrice).length;

  return {
    totalItems,
    averageMarginRate,
    totalMarginAmount,
    negativeMarginCount,
    missingCostCount,
    missingSalesCount,
  };
};

/**
 * 마진 분석 데이터 조회 훅 (실시간 원가 적용)
 */
export const useMarginData = (params: MarginFilterParams) => {
  const selectedTeam = authStore((state) => state.selectedTeam);

  return useQuery({
    queryKey: ['margin-analysis', params, selectedTeam?.id],
    queryFn: async () => {
      if (!selectedTeam?.id) {
        throw new Error('팀이 선택되지 않았습니다.');
      }

      // 1. TeamItem 데이터 조회 (실시간 원가)
      const teamItemsResponse = await teamItemsApi.getTeamItemsByTeam(selectedTeam.id);
      if (!teamItemsResponse.success || !teamItemsResponse.data) {
        throw new Error('TeamItem 데이터 조회에 실패했습니다.');
      }

      // TeamItem Map 생성 (teamItemId -> TeamItem)
      const teamItemsMap = new Map<number, TeamItem>();
      for (const teamItem of teamItemsResponse.data) {
        teamItemsMap.set(teamItem.id, teamItem);
      }

      // 2. 발주 데이터 조회
      const ordersResponse = await getOrdersByTeamId(selectedTeam.id);
      if (!ordersResponse.success || !ordersResponse.data) {
        throw new Error('발주 데이터 조회에 실패했습니다.');
      }

      const orders = ordersResponse.data as Order[];

      // 3. 월별 필터링 (YYYY-MM)
      const filteredOrders = orders.filter((order) => {
        if (!order.purchaseDate) return false;
        const orderYearMonth = order.purchaseDate.substring(0, 7); // YYYY-MM
        return orderYearMonth === params.yearMonth;
      });

      // 4. 품목별 판매 데이터 집계
      const itemSalesMap = aggregateItemSalesData(filteredOrders);

      // 5. 마진 분석 레코드로 변환 (실시간 원가 적용)
      let marginRecords = Array.from(itemSalesMap.values()).map((itemData) =>
        transformToMarginRecord(itemData, teamItemsMap)
      );

      // 6. 검색어 필터링
      if (params.searchQuery && params.searchQuery.trim()) {
        const query = params.searchQuery.toLowerCase();
        marginRecords = marginRecords.filter(
          (record) =>
            record.itemCode.toLowerCase().includes(query) ||
            record.itemName.toLowerCase().includes(query)
        );
      }

      // 7. 역마진만 보기 필터
      if (params.showNegativeMarginOnly) {
        marginRecords = marginRecords.filter((r) => r.isNegativeMargin);
      }

      // 8. 원가/판매가 미입력만 보기 필터
      if (params.showMissingDataOnly) {
        marginRecords = marginRecords.filter(
          (r) => !r.hasCostPrice || !r.hasSalesPrice
        );
      }

      // 9. 요약 정보 계산
      const summary = calculateMarginSummary(marginRecords);

      return {
        records: marginRecords,
        summary,
      };
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};
