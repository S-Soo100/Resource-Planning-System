// 마진 분석 관련 타입 정의

/**
 * 마진 분석 레코드 (품목별)
 */
export interface MarginAnalysisRecord {
  itemCode: string;
  itemName: string;
  categoryName: string;
  categoryColor?: string;
  transactionCount: number; // 거래 건수 (발주 건수)
  salesQuantity: number; // 판매 수량
  salesAmount: number | null; // 판매가 합계
  costAmount: number | null; // 원가 합계
  marginAmount: number | null; // 마진액 (판매가 - 원가)
  marginRate: number | null; // 마진율 (%) = (판매가 - 원가) / 판매가 × 100
  hasSalesPrice: boolean; // 판매가 입력 여부
  hasCostPrice: boolean; // 원가 입력 여부
  isNegativeMargin: boolean; // 역마진 여부 (마진율 < 0)
  // 원가 미입력 시 팀 물품 관리로 이동하기 위한 정보
  teamItemId?: number;
}

/**
 * 마진 분석 요약 정보
 */
export interface MarginSummary {
  totalItems: number; // 총 품목 수
  averageMarginRate: number; // 평균 마진율 (%)
  totalMarginAmount: number; // 총 마진액
  negativeMarginCount: number; // 역마진 건수
  missingCostCount: number; // 원가 미입력 건수
  missingSalesCount: number; // 판매가 미입력 건수
}

/**
 * 마진 분석 필터 파라مي터
 */
export interface MarginFilterParams {
  yearMonth: string; // YYYY-MM
  searchQuery?: string;
  showNegativeMarginOnly?: boolean; // 역마진만 보기
  showMissingDataOnly?: boolean; // 원가/판매가 미입력만 보기
}

/**
 * 정렬 설정
 */
export type MarginSortField =
  | 'itemCode'
  | 'itemName'
  | 'salesQuantity'
  | 'salesAmount'
  | 'costAmount'
  | 'marginAmount'
  | 'marginRate';

export type SortDirection = 'asc' | 'desc';

export interface MarginSortConfig {
  field: MarginSortField;
  direction: SortDirection;
}
