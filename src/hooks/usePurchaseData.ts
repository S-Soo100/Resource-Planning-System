import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  PurchaseRecord,
  PurchaseSummary,
  PurchaseFilterParams,
} from '@/types/purchase';
import { InventoryRecord } from '@/types/(inventoryRecord)/inventory-record';

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
  return useQuery({
    queryKey: ['purchase', params],
    queryFn: async () => {
      // API 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', params.startDate);
      queryParams.append('endDate', params.endDate);

      if (params.warehouseId) {
        queryParams.append('warehouseId', params.warehouseId.toString());
      }
      if (params.supplierId) {
        queryParams.append('supplierId', params.supplierId.toString());
      }
      if (params.categoryId) {
        queryParams.append('categoryId', params.categoryId.toString());
      }

      // 입고 데이터 조회
      const response = await axios.get<InventoryRecord[]>(
        `/api/inventory?${queryParams.toString()}`
      );

      // 구매 레코드로 변환 (입고만 필터링)
      const purchaseRecords = response.data
        .map(transformToPurchaseRecord)
        .filter((record): record is PurchaseRecord => record !== null);

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
