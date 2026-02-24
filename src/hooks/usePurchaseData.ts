import { useQuery } from '@tanstack/react-query';
import {
  PurchaseRecord,
  PurchaseSummary,
  PurchaseFilterParams,
} from '@/types/purchase';
import { InventoryRecord } from '@/types/(inventoryRecord)/inventory-record';
import { TeamItem } from '@/types/(item)/team-item';
import { inventoryRecordApi } from '@/api/inventory-record-api';
import { teamItemsApi } from '@/api/team-items-api';
import { authStore } from '@/store/authStore';

/**
 * 입고 데이터를 구매 레코드로 변환
 */
const transformToPurchaseRecord = (
  inventory: InventoryRecord
): PurchaseRecord | null => {
  // 입고 수량이 없으면 제외
  if (!inventory.inboundQuantity || inventory.inboundQuantity <= 0) {
    return null;
  }

  // recordPurpose가 'purchase'가 아닌 경우 제외 (null인 기존 데이터는 포함)
  if (inventory.recordPurpose && inventory.recordPurpose !== 'purchase') {
    return null;
  }

  // unitPrice와 totalPrice는 동적으로 계산하도록 getter 제거
  // 구매 페이지에서 직접 teamItem.costPrice 참조
  return {
    id: inventory.id,
    inboundDate: inventory.inboundDate || '',
    itemCode: inventory.item?.teamItem?.itemCode || '',
    itemName: inventory.item?.teamItem?.itemName || '',
    categoryName: inventory.item?.teamItem?.category?.name || '미분류',
    categoryColor: undefined,
    quantity: inventory.inboundQuantity,
    unitPrice: null, // 레거시 호환용, 실제로는 originalRecord.item.teamItem.costPrice 사용
    totalPrice: null, // 레거시 호환용, 실제로는 동적 계산
    supplierName: inventory.supplier?.supplierName || null,
    warehouseName: inventory.inboundLocation || null,
    remarks: inventory.remarks || null,
    originalRecord: inventory,
  };
};

/**
 * 구매 요약 정보 계산 (실시간 원가 적용)
 */
const calculateSummary = (
  records: PurchaseRecord[],
  teamItemsMap: Map<number, TeamItem>
): PurchaseSummary => {
  const uniqueItems = new Set(records.map((r) => r.itemCode));
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);

  // TeamItem에서 실시간 원가를 참조하여 totalAmount 계산
  const totalAmount = records.reduce((sum, r) => {
    const teamItemId = r.originalRecord.item?.teamItem?.id;
    if (!teamItemId) return sum;

    const teamItem = teamItemsMap.get(teamItemId);
    const costPrice = teamItem?.costPrice;

    if (costPrice !== null && costPrice !== undefined) {
      return sum + (r.quantity * costPrice);
    }
    return sum;
  }, 0);

  // TeamItem에서 실시간 원가를 확인하여 미입력 건수 계산
  const missingCostCount = records.filter((r) => {
    const teamItemId = r.originalRecord.item?.teamItem?.id;
    if (!teamItemId) return true;

    const teamItem = teamItemsMap.get(teamItemId);
    const costPrice = teamItem?.costPrice;
    return costPrice === null || costPrice === undefined;
  }).length;

  return {
    totalOrders: records.length,
    totalItems: uniqueItems.size,
    totalQuantity,
    totalAmount,
    missingCostCount,
  };
};

/**
 * 구매 데이터 조회 훅 (실시간 원가 적용)
 */
export const usePurchaseData = (params: PurchaseFilterParams) => {
  const selectedTeam = authStore((state) => state.selectedTeam);

  return useQuery({
    queryKey: [
      'purchase',
      selectedTeam?.id,
      params.startDate,
      params.endDate,
      params.warehouseId,
      params.supplierId,
      params.categoryId,
      params.searchQuery,
      params.showMissingCostOnly,
    ],
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

      // 2. 입고 데이터 조회
      const response = await inventoryRecordApi.getInventoryRecordsByTeamId(
        selectedTeam.id,
        params.startDate,
        params.endDate
      );

      if (!response.success || !response.data) {
        throw new Error('입고 데이터 조회에 실패했습니다.');
      }

      // 3. 구매 레코드로 변환 (입고만 필터링)
      let purchaseRecords = response.data
        .map(transformToPurchaseRecord)
        .filter((record): record is PurchaseRecord => record !== null);

      // 4. 시연품 창고 입고 내역 제외 (시연품은 여러번 들어갔다 나갔다 하므로 구매 금액 뻥튀기 방지)
      purchaseRecords = purchaseRecords.filter((record) => {
        const warehouseName = record.warehouseName || '';
        return !warehouseName.includes('시연');
      });

      // 5. 클라이언트 사이드 날짜 필터링 (서버 필터링이 제대로 동작하지 않을 경우 대비)
      purchaseRecords = purchaseRecords.filter((record) => {
        const inboundDate = record.inboundDate;
        return (
          inboundDate >= params.startDate && inboundDate <= params.endDate
        );
      });

      // TODO: 추후 API에서 warehouseId, supplierId, categoryId 필터링 지원 시 제거
      // 현재는 클라이언트에서 필터링

      // 6. 검색어 필터링
      let filteredRecords = purchaseRecords;
      if (params.searchQuery && params.searchQuery.trim()) {
        const query = params.searchQuery.toLowerCase();
        filteredRecords = purchaseRecords.filter(
          (record) =>
            record.itemCode.toLowerCase().includes(query) ||
            record.itemName.toLowerCase().includes(query) ||
            record.remarks?.toLowerCase().includes(query)
        );
      }

      // 7. 원가 미입력만 보기 필터 (실시간 원가 확인)
      if (params.showMissingCostOnly) {
        filteredRecords = filteredRecords.filter((r) => {
          const teamItemId = r.originalRecord.item?.teamItem?.id;
          if (!teamItemId) return true;

          const teamItem = teamItemsMap.get(teamItemId);
          const costPrice = teamItem?.costPrice;
          return costPrice === null || costPrice === undefined;
        });
      }

      // 8. 요약 정보 계산 (실시간 원가 적용)
      const summary = calculateSummary(filteredRecords, teamItemsMap);

      return {
        records: filteredRecords,
        summary,
        teamItemsMap, // 구매 페이지에서 실시간 원가 표시용
      };
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};
