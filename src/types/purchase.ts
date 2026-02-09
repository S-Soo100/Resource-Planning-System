// 구매 관련 타입 정의

import { InventoryRecord } from './(inventoryRecord)/inventory-record';

/**
 * 구매 레코드 (입고 기반)
 */
export interface PurchaseRecord {
  id: number;
  inboundDate: string;
  itemCode: string;
  itemName: string;
  categoryName: string;
  categoryColor?: string;
  quantity: number;
  unitPrice: number | null; // 원가 (costPrice)
  totalPrice: number | null; // quantity × unitPrice
  supplierName: string | null;
  warehouseName: string | null;
  remarks: string | null;
  // 원본 데이터 (상세 모달용)
  originalRecord: InventoryRecord;
}

/**
 * 구매 요약 정보
 */
export interface PurchaseSummary {
  totalOrders: number; // 총 입고 건수
  totalItems: number; // 총 품목 수 (중복 제거)
  totalQuantity: number; // 총 입고 수량
  totalAmount: number; // 총 구매 금액
  missingCostCount: number; // 원가 미입력 건수
}

/**
 * 구매 필터 파라미터
 */
export interface PurchaseFilterParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  warehouseId?: number | null;
  supplierId?: number | null;
  categoryId?: number | null;
  searchQuery?: string;
  showMissingCostOnly?: boolean; // 원가 미입력만 보기
}

/**
 * 정렬 설정
 */
export type PurchaseSortField =
  | 'inboundDate'
  | 'itemName'
  | 'itemCode'
  | 'quantity'
  | 'totalPrice'
  | 'supplierName';

export type SortDirection = 'asc' | 'desc';

export interface PurchaseSortConfig {
  field: PurchaseSortField;
  direction: SortDirection;
}
