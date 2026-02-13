/**
 * 입출고 기록 목적 구분 상수
 */

/**
 * recordPurpose 한글 라벨 매핑
 */
export const RECORD_PURPOSE_LABELS: Record<string, string> = {
  purchase: '구매',
  sale: '판매',
  transfer: '창고이동',
  demo_out: '시연출고',
  demo_return: '시연반납',
  order_return: '주문반납',
  initial: '초기등록',
  adjustment: '재고조정',
  other: '기타',
};

/**
 * 수동 입출고 기록 생성 시 선택 가능한 목적 목록
 * (자동 생성 전용 목적은 제외)
 */
export const MANUAL_RECORD_PURPOSES = [
  { value: 'purchase', label: '구매 입고' },
  { value: 'sale', label: '판매 출고' },
  { value: 'transfer', label: '창고 간 이동' },
  { value: 'adjustment', label: '재고 조정' },
  { value: 'other', label: '기타' },
];

/**
 * recordPurpose 값을 한글 라벨로 변환
 * @param purpose - recordPurpose 값
 * @returns 한글 라벨 (없으면 '미분류')
 */
export const getRecordPurposeLabel = (purpose: string | null | undefined): string => {
  if (!purpose) return '미분류';
  return RECORD_PURPOSE_LABELS[purpose] || '미분류';
};

/**
 * 구매 금액 집계에 포함할 recordPurpose 목록
 */
export const PURCHASE_PURPOSES = ['purchase'];

/**
 * 판매 금액 집계에 포함할 recordPurpose 목록
 */
export const SALE_PURPOSES = ['sale'];
