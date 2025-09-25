import { useAllOrders } from '../(useOrder)/useOrderQueries';
import { useDemosByTeam } from '../(useDemo)/useDemoQueries';
import { useCurrentTeam } from '../useCurrentTeam';
import { CalendarEvent, MonthInfo } from '@/types/calendar/calendar';
import { formatDateToString } from '@/utils/calendar/calendarUtils';
import {
  calculateDemoSpanInfo,
  getDemoSpanDates,
  isDemoMultipleDays
} from '@/utils/calendar/demoUtils';

/**
 * 월간 캘린더에 표시할 데이터를 조회하는 훅
 */
export function useMonthData(monthInfo: MonthInfo) {
  const { team } = useCurrentTeam();
  const teamId = team?.id;

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

  // 시연 데이터를 캘린더 이벤트로 변환 (기간 처리 포함)
  const demoEvents: CalendarEvent[] = [];

  if (Array.isArray(demosResponse?.data)) {
    demosResponse.data
      .filter((demo) => demo.demoStartDate) // 날짜가 있는 것만 필터링
      .forEach((demo) => {
        const isMultipleDays = isDemoMultipleDays(demo.demoStartDate, demo.demoEndDate);

        if (isMultipleDays) {
          // 여러 날짜에 걸치는 시연인 경우, 각 날짜에 대해 이벤트 생성
          const spanDates = getDemoSpanDates(demo.demoStartDate, demo.demoEndDate);

          spanDates.forEach((dateStr) => {
            const spanInfo = calculateDemoSpanInfo(
              dateStr,
              demo.demoStartDate,
              demo.demoEndDate
            );

            if (spanInfo) {
              demoEvents.push({
                id: demo.id,
                title: demo.demoTitle || `시연 #${demo.id}`,
                date: dateStr,
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
                  demoStartTime: demo.demoStartTime || '물품 상차 시간 정보 없음',
                  demoEndDate: demo.demoEndDate || '종료일 정보 없음',
                  demoEndTime: demo.demoEndTime || '물품 하차 시간 정보 없음',
                  demoStartDeliveryMethod: demo.demoStartDeliveryMethod || '',
                  demoEndDeliveryMethod: demo.demoEndDeliveryMethod || '',
                  demoStatus: demo.demoStatus || 'unknown',
                  warehouseName: demo.warehouse?.warehouseName || '창고 정보 없음',
                  spanInfo, // 시연 기간 정보 추가
                },
              });
            }
          });
        } else {
          // 하루짜리 시연인 경우, 기존과 동일
          demoEvents.push({
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
              demoStartTime: demo.demoStartTime || '물품 상차 시간 정보 없음',
              demoEndDate: demo.demoEndDate || '종료일 정보 없음',
              demoEndTime: demo.demoEndTime || '물품 하차 시간 정보 없음',
              demoStartDeliveryMethod: demo.demoStartDeliveryMethod || '',
              demoEndDeliveryMethod: demo.demoEndDeliveryMethod || '',
              demoStatus: demo.demoStatus || 'unknown',
              warehouseName: demo.warehouse?.warehouseName || '창고 정보 없음',
            },
          });
        }
      });
  }

  // 모든 이벤트 합치기
  const allEvents = [...orderEvents, ...demoEvents];

  // 현재 월에 해당하는 이벤트만 필터링 (캘린더 표시 범위 기준)
  const monthStartStr = formatDateToString(monthInfo.calendarStartDate);
  const monthEndStr = formatDateToString(monthInfo.calendarEndDate);

  const monthEvents = allEvents.filter((event) => {
    // 날짜 정규화 (ISO 형식인 경우 날짜 부분만 추출)
    const eventDateStr = event.date.split('T')[0];
    return eventDateStr >= monthStartStr && eventDateStr <= monthEndStr;
  });

  // 날짜별로 정렬
  monthEvents.sort((a, b) => a.date.localeCompare(b.date));

  const isLoading = isOrdersLoading || isDemosLoading;
  const error = ordersError || demosError;

  return {
    data: {
      monthInfo,
      events: monthEvents,
    },
    isLoading,
    error,
    // 원본 데이터도 필요한 경우를 위해 제공
    orders: Array.isArray(ordersResponse?.data) ? ordersResponse.data : [],
    demos: Array.isArray(demosResponse?.data) ? demosResponse.data : [],
  };
}

/**
 * 특정 날짜의 이벤트만 조회하는 훅 (월간 뷰용)
 */
export function useDayEventsForMonth(date: Date, monthInfo: MonthInfo) {
  const { data } = useMonthData(monthInfo);
  const dateStr = formatDateToString(date);

  const dayEvents = data?.events.filter((event) => {
    // 날짜 정규화 (ISO 형식인 경우 날짜 부분만 추출)
    const eventDateStr = event.date.split('T')[0];
    return eventDateStr === dateStr;
  }) || [];

  return {
    events: dayEvents,
    count: dayEvents.length,
    hasEvents: dayEvents.length > 0,
  };
}