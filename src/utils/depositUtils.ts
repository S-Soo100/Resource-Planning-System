/**
 * 입금/환급 상태 관련 공통 유틸리티
 */

interface DepositRecord {
  depositStatus?: string | null;
  depositAmount?: number | null;
  isRefundApplied?: boolean;
  isRefundReceived?: boolean;
  isRefundNotApplicable?: boolean;
  isTaxInvoiceIssued?: boolean;
}

/**
 * 입금완료 여부 판단
 * depositStatus가 설정되어 있고 depositAmount > 0이면 입금완료
 */
export const isDepositCompleted = (record: DepositRecord): boolean => {
  return !!record.depositStatus && (record.depositAmount ?? 0) > 0;
};

/**
 * 입금 상태 표시 텍스트
 */
export const getDepositStatusText = (
  depositStatus?: string | null,
  depositAmount?: number | null
): string => {
  if (!depositStatus) return "미입금";
  if (!depositAmount || depositAmount <= 0) return "미입금";
  return depositStatus; // 자부담금, 전액, 선금, 중도금, 잔금
};

/**
 * 입금 상태 색상 클래스
 * 녹색=완료(전액/잔금), 노란색=진행중(선금/중도금/자부담금), 회색=미입금
 */
export const getDepositStatusColor = (
  depositStatus?: string | null,
  depositAmount?: number | null
): string => {
  if (!depositStatus || !depositAmount || depositAmount <= 0) {
    return "bg-gray-100 text-gray-600";
  }
  if (depositStatus === "전액" || depositStatus === "잔금") {
    return "bg-green-100 text-green-700";
  }
  // 자부담금, 선금, 중도금
  return "bg-yellow-100 text-yellow-700";
};

/**
 * 환급 상태 텍스트
 */
export const getRefundStatusText = (record: DepositRecord): string => {
  if (record.isRefundNotApplicable) return "해당없음";
  if (record.isRefundReceived) return "입금완료";
  if (record.isRefundApplied) return "신청완료";
  return "미신청";
};

/**
 * 환급 상태 색상 클래스
 */
export const getRefundStatusColor = (record: DepositRecord): string => {
  if (record.isRefundNotApplicable) return "bg-gray-100 text-gray-500";
  if (record.isRefundReceived) return "bg-green-100 text-green-700";
  if (record.isRefundApplied) return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

/**
 * 입금상태 드롭다운 옵션 (인라인 수정용)
 */
export const DEPOSIT_STATUS_OPTIONS = [
  "자부담금",
  "전액",
  "선금",
  "중도금",
  "잔금",
] as const;

/**
 * 입금 상태 필터 드롭다운 옵션
 */
export const DEPOSIT_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "none", label: "미입금" },
  { value: "deposited", label: "입금완료 (전체)" },
  { value: "자부담금", label: "자부담금" },
  { value: "전액", label: "전액" },
  { value: "선금", label: "선금" },
  { value: "중도금", label: "중도금" },
  { value: "잔금", label: "잔금" },
];
