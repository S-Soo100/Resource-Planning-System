import { useQuery } from '@tanstack/react-query';
import {
  PurchaseRecord,
  PurchaseSummary,
  PurchaseFilterParams,
} from '@/types/purchase';
import { InventoryRecord } from '@/types/(inventoryRecord)/inventory-record';
import { inventoryRecordApi } from '@/api/inventory-record-api';
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

  const unitPrice = inventory.item?.teamItem?.costPrice ?? null;
  const totalPrice =
    unitPrice !== null ? inventory.inboundQuantity * unitPrice : null;

  return {
    id: inventory.id,
    inboundDate: inventory.inboundDate || '',
    itemCode: inventory.item?.teamItem?.itemCode || '',
    itemName: inventory.item?.teamItem?.itemName || '',
    categoryName: inventory.item?.teamItem?.category?.name || '미분류',
    categoryColor: undefined,
    quantity: inventory.inboundQuantity,
    unitPrice,
    totalPrice,
    supplierName: inventory.supplier?.supplierName || null,
    warehouseName: inventory.inboundLocation || null,
    remarks: inventory.remarks || null,
    originalRecord: inventory,
  };
};

/**
 * 구매 요약 정보 계산
 */
const calculateSummary = (records: PurchaseRecord[]): PurchaseSummary => {
  const uniqueItems = new Set(records.map((r) => r.itemCode));
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
  const totalAmount = records.reduce(
    (sum, r) => (r.totalPrice !== null ? sum + r.totalPrice : sum),
    0
  );
  const missingCostCount = records.filter((r) => r.unitPrice === null).length;

  return {
    totalOrders: records.length,
    totalItems: uniqueItems.size,
    totalQuantity,
    totalAmount,
    missingCostCount,
  };
};

/**
 * 구매 데이터 조회 훅
 */
export const usePurchaseData = (params: PurchaseFilterParams) => {
  const selectedTeam = authStore((state) => state.selectedTeam);

  return useQuery({
    queryKey: ['purchase', params, selectedTeam?.id],
    queryFn: async () => {
      if (!selectedTeam?.id) {
        throw new Error('팀이 선택되지 않았습니다.');
      }

      // 입고 데이터 조회
      const response = await inventoryRecordApi.getInventoryRecordsByTeamId(
        selectedTeam.id,
        params.startDate,
        params.endDate
      );

      if (!response.success || !response.data) {
        throw new Error('입고 데이터 조회에 실패했습니다.');
      }

      // 구매 레코드로 변환 (입고만 필터링)
      const purchaseRecords = response.data
        .map(transformToPurchaseRecord)
        .filter((record): record is PurchaseRecord => record !== null);

      // TODO: 추후 API에서 warehouseId, supplierId, categoryId 필터링 지원 시 제거
      // 현재는 클라이언트에서 필터링

      // 검색어 필터링
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

      // 원가 미입력만 보기 필터
      if (params.showMissingCostOnly) {
        filteredRecords = filteredRecords.filter((r) => r.unitPrice === null);
      }

      // 요약 정보 계산
      const summary = calculateSummary(filteredRecords);

      return {
        records: filteredRecords,
        summary,
      };
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};
