// 판매 관련 타입 정의

import { Order, OrderItem } from './(order)/order';

/**
 * 판매 레코드 (발주 기반)
 */
export interface SalesRecord {
  id: number;
  purchaseDate: string;
  title: string;
  supplierName: string;
  receiver: string;
  itemCount: number; // 품목 종류 수
  totalQuantity: number; // 총 수량
  totalPrice: number | null; // 총 판매 금액
  status: string;
  manager: string;
  memo: string | null;
  // 원본 데이터 (확장 행용)
  orderItems: OrderItem[];
  originalOrder: Order;
  // 마진 분석용 필드 (Admin/Moderator 전용)
  costAmount?: number | null; // 원가 합계
  marginAmount?: number | null; // 마진액 (판매가 - 원가)
  marginRate?: number | null; // 마진율 (%) = (판매가 - 원가) / 판매가 × 100
  hasCostPrice?: boolean; // 원가 입력 여부
  isNegativeMargin?: boolean; // 역마진 여부 (마진율 < 0)
}

/**
 * 판매 요약 정보
 */
export interface SalesSummary {
  totalOrders: number; // 총 발주 건수
  totalItems: number; // 총 품목 수
  totalQuantity: number; // 총 판매 수량
  totalSales: number; // 총 판매 금액
  missingPriceCount: number; // 판매가 미입력 건수
  // 마진 분석용 요약 (Admin/Moderator 전용)
  totalCost?: number; // 총 원가
  totalMargin?: number; // 총 마진액
  averageMarginRate?: number; // 평균 마진율 (%)
  negativeMarginCount?: number; // 역마진 건수
  missingCostCount?: number; // 원가 미입력 건수
}

/**
 * 판매 필터 파라미터
 */
export interface SalesFilterParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  supplierId?: number | null;
  status?: string | null;
  orderType?: 'all' | 'package' | 'individual'; // 패키지/개별
  searchQuery?: string;
  showMissingPriceOnly?: boolean; // 판매가 미입력만 보기
}

/**
 * 정렬 설정
 */
export type SalesSortField =
  | 'purchaseDate'
  | 'title'
  | 'supplierName'
  | 'totalPrice'
  | 'status';

export type SortDirection = 'asc' | 'desc';

export interface SalesSortConfig {
  field: SalesSortField;
  direction: SortDirection;
}

/**
 * 판매 금액 계산 결과
 */
export interface SalesPriceCalculation {
  totalPrice: number | null;
  hasPrice: boolean; // 가격 정보 존재 여부
  source: 'order' | 'items' | 'none'; // 가격 출처
}
