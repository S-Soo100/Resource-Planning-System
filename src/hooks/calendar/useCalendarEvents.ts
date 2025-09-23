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
      const normalizedDate = event.date.split('T')[0]; // "2025-09-23T00:00:00.000Z" → "2025-09-23"

      console.log(`날짜 정규화: ${event.date} → ${normalizedDate}`);

      if (!grouped[normalizedDate]) {
        grouped[normalizedDate] = [];
      }
      grouped[normalizedDate].push(event);
    });

    console.log('정규화된 eventsByDate:', grouped);

    // 각 날짜의 이벤트를 시간순으로 정렬 (발주는 시간이 없으므로 타입별로 정렬)
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        // 타입별 우선순위: 발주 > 시연
        if (a.type !== b.type) {
          return a.type === 'order' ? -1 : 1;
        }
        // 같은 타입이면 ID순으로 정렬
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