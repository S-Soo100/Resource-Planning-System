import { useMemo } from 'react';
import { CalendarEvent, EVENT_COLORS, EVENT_STATUS_TEXT, OrderEventDetails, DemoEventDetails } from '@/types/calendar/calendar';
import { formatDateToString } from '@/utils/calendar/calendarUtils';

/**
 * 캘린더 이벤트를 처리하는 훅
 */
export function useCalendarEvents(events: CalendarEvent[]) {
  // 날짜별로 이벤트 그룹화
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};

    events.forEach((event) => {
      // ISO 날짜를 YYYY-MM-DD 형식으로 정규화
      // UTC 시간대를 로컬 시간대로 변환하여 정확한 날짜 추출
      const eventDate = new Date(event.date);
      const normalizedDate = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

      if (!grouped[normalizedDate]) {
        grouped[normalizedDate] = [];
      }
      grouped[normalizedDate].push(event);
    });

    // 각 날짜의 이벤트를 정렬
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        // 1. 타입별 우선순위: 시연 > 발주 (시연 연결 바가 위에 오도록)
        if (a.type !== b.type) {
          return a.type === 'demo' ? -1 : 1;
        }

        // 2. 시연인 경우 spanInfo 기준 정렬
        if (a.type === 'demo' && b.type === 'demo') {
          const aDetails = a.details as DemoEventDetails;
          const bDetails = b.details as DemoEventDetails;

          // spanInfo가 있는 경우 (여러 날 시연)
          if (aDetails.spanInfo && bDetails.spanInfo) {
            // 시작일 우선 > 진행중 > 종료일
            const aOrder = aDetails.spanInfo.isStart ? 0 : aDetails.spanInfo.isMiddle ? 1 : 2;
            const bOrder = bDetails.spanInfo.isStart ? 0 : bDetails.spanInfo.isMiddle ? 1 : 2;

            if (aOrder !== bOrder) return aOrder - bOrder;
          }
        }

        // 3. 같은 타입/상태면 ID순으로 정렬
        return a.id - b.id;
      });
    });

    return grouped;
  }, [events]);

  // 이벤트 타입별 통계
  const eventStats = useMemo(() => {
    const stats = {
      total: events.length,
      orders: events.filter((e) => e.type === 'order').length,
      demos: events.filter((e) => e.type === 'demo').length,
    };

    return stats;
  }, [events]);

  // 특정 날짜의 이벤트 조회
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = formatDateToString(date);
    const events = eventsByDate[dateStr] || [];

    console.log(`날짜 ${dateStr} 이벤트 검색 결과:`, events);

    return events;
  };

  // 특정 날짜에 이벤트가 있는지 확인
  const hasEventsOnDate = (date: Date): boolean => {
    const dateStr = formatDateToString(date);
    return !!(eventsByDate[dateStr] && eventsByDate[dateStr].length > 0);
  };

  // 이벤트 색상 정보 가져오기
  const getEventColor = (eventType: CalendarEvent['type']) => {
    return EVENT_COLORS[eventType];
  };

  // 이벤트 상태 텍스트 가져오기
  const getEventStatusText = (status: string) => {
    return EVENT_STATUS_TEXT[status as keyof typeof EVENT_STATUS_TEXT] || status;
  };

  // 이벤트 요약 텍스트 생성
  const getEventSummary = (event: CalendarEvent): string => {
    const statusText = getEventStatusText(event.status);

    if (event.type === 'order') {
      const details = event.details as OrderEventDetails;
      return `${event.title} (${statusText}) - ${details.receiver}`;
    } else {
      const details = event.details as DemoEventDetails;
      return `${event.title} (${statusText}) - ${details.demoManager}`;
    }
  };

  // 날짜별 이벤트 카운트 가져오기
  const getEventCountForDate = (date: Date): number => {
    const dateStr = formatDateToString(date);
    return eventsByDate[dateStr]?.length || 0;
  };

  // 주간 최대 이벤트 수 (UI 레이아웃 계산용)
  const maxEventsPerDay = useMemo(() => {
    return Math.max(...Object.values(eventsByDate).map((events) => events.length), 0);
  }, [eventsByDate]);

  return {
    eventsByDate,
    eventStats,
    maxEventsPerDay,
    getEventsForDate,
    hasEventsOnDate,
    getEventColor,
    getEventStatusText,
    getEventSummary,
    getEventCountForDate,
  };
}

/**
 * 이벤트 필터링을 위한 훅
 */
export function useEventFilters() {
  // 이벤트 타입별 필터
  const filterByType = (events: CalendarEvent[], types: CalendarEvent['type'][]) => {
    return events.filter((event) => types.includes(event.type));
  };

  // 이벤트 상태별 필터
  const filterByStatus = (events: CalendarEvent[], statuses: string[]) => {
    return events.filter((event) => statuses.includes(event.status));
  };

  // 텍스트 검색 필터
  const filterByText = (events: CalendarEvent[], searchText: string) => {
    if (!searchText.trim()) return events;

    const lowerSearchText = searchText.toLowerCase();
    return events.filter((event) => {
      return (
        event.title.toLowerCase().includes(lowerSearchText) ||
        event.status.toLowerCase().includes(lowerSearchText) ||
        (event.type === 'order' &&
          (event.details as OrderEventDetails).receiver?.toLowerCase().includes(lowerSearchText)) ||
        (event.type === 'demo' &&
          (event.details as DemoEventDetails).demoManager?.toLowerCase().includes(lowerSearchText))
      );
    });
  };

  return {
    filterByType,
    filterByStatus,
    filterByText,
  };
}