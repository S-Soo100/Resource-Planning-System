// 캘린더 이벤트 타입
export interface CalendarEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD 형식
  type: 'order' | 'demo';
  status: string;
  details: OrderEventDetails | DemoEventDetails;
}

// 발주 이벤트 세부 정보
export interface OrderEventDetails {
  id: number;
  title: string;
  requester: string;
  receiver: string;
  receiverPhone: string;
  receiverAddress: string;
  installationDate: string; // 배송/설치 날짜
  status: string;
  supplierName: string;
  packageName: string;
  warehouseName: string;
}


// 이벤트 상세 정보 유니온 타입
export type EventDetails = OrderEventDetails | DemoEventDetails;

// 주별 메모 타입
export interface WeeklyMemo {
  weekKey: string; // 'YYYY-WW' 형식 (예: '2024-01')
  content: string;
  updatedAt: string;
}

// 주 정보 타입
export interface WeekInfo {
  year: number;
  weekNumber: number;
  weekKey: string; // 'YYYY-WW' 형식
  startDate: Date;
  endDate: Date;
  days: Date[]; // 월~일 7일
}

// 캘린더 데이터 타입
export interface CalendarData {
  weekInfo: WeekInfo;
  events: CalendarEvent[];
  memo: WeeklyMemo | null;
}

// 이벤트 타입별 색상 설정
export const EVENT_COLORS = {
  order: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-500',
    dot: 'bg-blue-500',
  },
  demo: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-500',
    dot: 'bg-purple-500',
  },
} as const;

// 월 정보 타입
export interface MonthInfo {
  year: number;
  month: number; // 1-12
  monthKey: string; // 'YYYY-MM' 형식
  startDate: Date; // 월의 첫날
  endDate: Date; // 월의 마지막날
  calendarStartDate: Date; // 캘린더 표시 시작일 (이전 월 일부 포함)
  calendarEndDate: Date; // 캘린더 표시 종료일 (다음 월 일부 포함)
  weeks: Date[][]; // 주별로 구성된 날짜 배열 (6주 x 7일)
}

// 뷰 모드 타입
export type ViewMode = 'week' | 'month';

// 시연 기간 정보 타입
export interface DemoSpanInfo {
  totalDays: number; // 총 기간 (일수)
  dayIndex: number; // 현재 날짜가 시연의 몇 번째 날인지 (0부터 시작)
  isStart: boolean; // 시연 시작일 여부
  isEnd: boolean; // 시연 종료일 여부
  isMiddle: boolean; // 시연 진행중 여부
}

// 시연 이벤트 세부 정보 확장
export interface DemoEventDetails {
  id: number;
  demoTitle: string;
  requester: string;
  demoManager: string;
  demoManagerPhone: string;
  demoAddress: string;
  demoStartDate: string; // 시연 시작일 (물품 상차)
  demoStartTime: string;
  demoEndDate: string; // 시연 종료일 (물품 하차)
  demoEndTime: string;
  demoStartDeliveryMethod: string; // 상차 방법
  demoEndDeliveryMethod: string; // 하차 방법
  eventStartDate?: string | null; // 실제 이벤트 시작일 (선택)
  eventStartTime?: string | null; // 실제 이벤트 시작 시간 (선택)
  eventEndDate?: string | null; // 실제 이벤트 종료일 (선택)
  eventEndTime?: string | null; // 실제 이벤트 종료 시간 (선택)
  demoStatus: string;
  warehouseName: string;
  spanInfo?: DemoSpanInfo; // 시연 기간 정보 (동적으로 계산됨)
}

// 이벤트 상태별 표시 텍스트
export const EVENT_STATUS_TEXT = {
  // 발주 상태
  requested: '요청',
  approved: '승인',
  rejected: '반려',
  confirmedByShipper: '출고자 확인',
  shipmentCompleted: '출고 완료',
  rejectedByShipper: '출고자 반려',
  deliveryCompleted: '배송 완료',

  // 시연 상태
  demoCompleted: '시연 완료',
} as const;