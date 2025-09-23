import { useAllOrders } from '../(useOrder)/useOrderQueries';
import { useDemosByTeam } from '../(useDemo)/useDemoQueries';
import { useCurrentTeam } from '../useCurrentTeam';
import { CalendarData, CalendarEvent } from '@/types/calendar/calendar';
import { WeekInfo } from '@/types/calendar/calendar';
import { formatDateToString } from '@/utils/calendar/calendarUtils';
import { useWeeklyMemo } from './useWeeklyMemo';

/**
 * 캘린더에 표시할 데이터를 조회하는 훅
 */
export function useCalendarData(weekInfo: WeekInfo) {
  const { team } = useCurrentTeam();
  const teamId = team?.id;

  console.log('Current team:', team);
  console.log('Team ID for queries:', teamId);

  // 발주 데이터 조회 - teamId가 있을 때만
  const {
    data: ordersResponse,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useAllOrders(teamId || 0);

  // 시연 데이터 조회 - teamId가 있을 때만
  const {
    data: demosResponse,
    isLoading: isDemosLoading,
    error: demosError,
  } = useDemosByTeam(teamId || 0);

  // 주별 메모 조회
  const { memo, isLoading: isMemoLoading } = useWeeklyMemo(weekInfo.weekKey);

  // 디버깅을 위한 로그 추가
  console.log('Orders Response:', ordersResponse);
  console.log('Demos Response:', demosResponse);
  console.log('Team ID:', teamId);

  // 발주 데이터를 캘린더 이벤트로 변환
  const orderEvents: CalendarEvent[] = Array.isArray(ordersResponse?.data)
    ? ordersResponse.data
        .filter((order) => order.installationDate) // 날짜가 있는 것만 필터링
        .map((order) => ({
          id: order.id,
          title: order.title || `발주 #${order.id}`,
          date: order.installationDate, // 배송/설치 날짜 기준
          type: 'order' as const,
          status: order.status || 'unknown',
        details: {
          id: order.id,
          title: order.title || `발주 #${order.id}`,
          requester: order.requester || '신청자 정보 없음',
          receiver: order.receiver || '수신자 정보 없음',
          receiverPhone: order.receiverPhone || '연락처 정보 없음',
          receiverAddress: order.receiverAddress || '배송지 정보 없음',
          installationDate: order.installationDate || '설치일 정보 없음',
          status: order.status || 'unknown',
          supplierName: order.supplier?.supplierName || '업체 정보 없음',
          packageName: order.package?.packageName || '패키지 정보 없음',
          warehouseName: order.warehouse?.warehouseName || '창고 정보 없음',
        },
      }))
    : [];

  // 시연 데이터를 캘린더 이벤트로 변환
  const demoEvents: CalendarEvent[] = Array.isArray(demosResponse?.data)
    ? demosResponse.data
        .filter((demo) => demo.demoStartDate) // 날짜가 있는 것만 필터링
        .map((demo) => ({
          id: demo.id,
          title: demo.demoTitle || `시연 #${demo.id}`,
          date: demo.demoStartDate, // 시연 시작일 기준
          type: 'demo' as const,
          status: demo.demoStatus || 'unknown',
        details: {
          id: demo.id,
          demoTitle: demo.demoTitle || `시연 #${demo.id}`,
          requester: demo.requester || '신청자 정보 없음',
          demoManager: demo.demoManager || '담당자 정보 없음',
          demoManagerPhone: demo.demoManagerPhone || '연락처 정보 없음',
          demoAddress: demo.demoAddress || '시연 장소 정보 없음',
          demoStartDate: demo.demoStartDate || '시작일 정보 없음',
          demoStartTime: demo.demoStartTime || '시작시간 정보 없음',
          demoEndDate: demo.demoEndDate || '종료일 정보 없음',
          demoEndTime: demo.demoEndTime || '종료시간 정보 없음',
          demoStatus: demo.demoStatus || 'unknown',
          warehouseName: demo.warehouse?.warehouseName || '창고 정보 없음',
        },
      }))
    : [];

  // 모든 이벤트 합치기
  const allEvents = [...orderEvents, ...demoEvents];

  console.log('Order Events:', orderEvents);
  console.log('Demo Events:', demoEvents);
  console.log('All Events:', allEvents);

  // 현재 주에 해당하는 이벤트만 필터링
  const weekStartStr = formatDateToString(weekInfo.startDate);
  const weekEndStr = formatDateToString(weekInfo.endDate);

  console.log('Week range:', weekStartStr, 'to', weekEndStr);

  const weekEvents = allEvents.filter((event) => {
    return event.date >= weekStartStr && event.date <= weekEndStr;
  });

  console.log('Week Events:', weekEvents);

  // 날짜별로 정렬
  weekEvents.sort((a, b) => a.date.localeCompare(b.date));

  const isLoading = isOrdersLoading || isDemosLoading || isMemoLoading;
  const error = ordersError || demosError;

  const calendarData: CalendarData = {
    weekInfo,
    events: weekEvents,
    memo,
  };

  return {
    data: calendarData,
    isLoading,
    error,
    // 원본 데이터도 필요한 경우를 위해 제공
    orders: Array.isArray(ordersResponse?.data) ? ordersResponse.data : [],
    demos: Array.isArray(demosResponse?.data) ? demosResponse.data : [],
  };
}

/**
 * 특정 날짜의 이벤트만 조회하는 훅
 */
export function useDayEvents(date: Date, weekInfo: WeekInfo) {
  const { data } = useCalendarData(weekInfo);
  const dateStr = formatDateToString(date);

  const dayEvents = data?.events.filter((event) => event.date === dateStr) || [];

  return {
    events: dayEvents,
    count: dayEvents.length,
    hasEvents: dayEvents.length > 0,
  };
}