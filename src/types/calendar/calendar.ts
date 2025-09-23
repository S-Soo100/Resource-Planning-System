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

// 시연 이벤트 세부 정보
export interface DemoEventDetails {
  id: number;
  demoTitle: string;
  requester: string;
  demoManager: string;
  demoManagerPhone: string;
  demoAddress: string;
  demoStartDate: string; // 시연 시작일
  demoStartTime: string;
  demoEndDate: string;
  demoEndTime: string;
  demoStatus: string;
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