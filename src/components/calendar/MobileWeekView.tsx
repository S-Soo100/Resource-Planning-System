"use client";
import React, { useMemo } from 'react';
import { WeekInfo, CalendarEvent, DemoEventDetails } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import {
  getDayName,
  isToday,
  isWeekend,
  formatDateToString
} from '@/utils/calendar/calendarUtils';
import { calculateDemoLayers, shouldShowTitle } from '@/utils/calendar/demoBarUtils';

interface MobileWeekViewProps {
  weekInfo: WeekInfo;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

const MobileWeekView: React.FC<MobileWeekViewProps> = ({
  weekInfo,
  events,
  onEventClick,
  className = '',
}) => {
  const { getEventsForDate, hasEventsOnDate } = useCalendarEvents(events);

  // 날짜 → 인덱스 맵 생성
  const dateMap = useMemo(() => {
    const map = new Map<string, number>();
    weekInfo.days.forEach((date, index) => {
      map.set(formatDateToString(date), index);
    });
    return map;
  }, [weekInfo.days]);

  // 시연 이벤트들 추출
  const demoEvents = useMemo(
    () => events.filter(event => event.type === 'demo') as (CalendarEvent & { type: 'demo' })[],
    [events]
  );

  // 레이어 계산
  const demoLayerMap = useMemo(
    () => calculateDemoLayers(demoEvents, dateMap),
    [demoEvents, dateMap]
  );

  // 최대 레이어 개수 계산
  const maxLayers = demoLayerMap.size > 0 ? Math.max(...demoLayerMap.values()) + 1 : 0;
  const layerHeight = 24; // 모바일용 높이
  const baseRowHeight = 80; // 주간 뷰는 더 높게
  const totalHeight = baseRowHeight + (maxLayers * layerHeight);

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekInfo.days.map((date, index) => {
          const dayName = getDayName(date.getDay());
          const isWeekendDay = isWeekend(date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={index}
              className={`
                p-1 text-center border-r border-gray-200 last:border-r-0
                ${isTodayDate ? 'bg-yellow-50' : ''}
              `}
            >
              <div className={`
                text-[10px] font-medium
                ${isWeekendDay ? 'text-red-600' : 'text-gray-700'}
              `}>
                {dayName}
              </div>
              <div className={`
                text-sm font-bold
                ${isTodayDate ? 'text-blue-600' : isWeekendDay ? 'text-red-600' : 'text-gray-700'}
              `}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* 일정 그리드 */}
      <div
        className="grid grid-cols-7 border-b border-gray-200"
        style={{ minHeight: `${totalHeight}px` }}
      >
        {weekInfo.days.map((date, dayIndex) => {
          const dayEvents = getEventsForDate(date);
          const hasEvents = hasEventsOnDate(date);
          const isWeekendDay = isWeekend(date);
          const isTodayDate = isToday(date);

          // 시연과 발주 분리
          const dayDemoEvents = dayEvents.filter(e => e.type === 'demo') as (CalendarEvent & { type: 'demo' })[];
          const dayOrderEvents = dayEvents.filter(e => e.type === 'order');

          return (
            <div
              key={dayIndex}
              className={`
                relative border-r border-gray-200 last:border-r-0
                p-1 text-[10px] cursor-pointer hover:bg-gray-50 transition-colors
                ${isWeekendDay ? 'bg-gray-25' : ''}
                ${isTodayDate ? 'bg-yellow-50' : ''}
              `}
              onClick={() => onEventClick && dayEvents[0] && onEventClick(dayEvents[0])}
            >
              {/* 시연 막대 (물품) */}
              {dayDemoEvents.map(demo => {
                const demoId = (demo.details as DemoEventDetails).id;
                const layerIndex = demoLayerMap.get(demoId) || 0;
                const spanInfo = (demo.details as DemoEventDetails).spanInfo;

                return (
                  <div
                    key={`demo-${demo.id}`}
                    className={`
                      absolute left-0 right-0 h-5
                      bg-purple-100 border-purple-400
                      ${spanInfo?.isStart ? 'rounded-l-sm border-l border-t border-b' : ''}
                      ${spanInfo?.isEnd ? 'rounded-r-sm border-r border-t border-b' : ''}
                      ${spanInfo?.isMiddle ? 'border-t border-b' : ''}
                      ${spanInfo?.totalDays === 1 ? 'rounded-sm border' : ''}
                    `}
                    style={{
                      top: `${4 + layerIndex * 24}px`,
                      zIndex: 5
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(demo);
                    }}
                  />
                );
              })}

              {/* 행사 막대 */}
              {dayDemoEvents.map(demo => {
                const demoId = (demo.details as DemoEventDetails).id;
                const layerIndex = demoLayerMap.get(demoId) || 0;
                const eventSpanInfo = (demo.details as DemoEventDetails).eventSpanInfo;

                if (eventSpanInfo && (eventSpanInfo.isStart || eventSpanInfo.isMiddle || eventSpanInfo.isEnd)) {
                  return (
                    <div
                      key={`event-${demo.id}`}
                      className={`
                        absolute left-0.5 right-0.5 h-3
                        bg-purple-400/50
                        ${eventSpanInfo.isStart ? 'rounded-l-sm' : ''}
                        ${eventSpanInfo.isEnd ? 'rounded-r-sm' : ''}
                        ${eventSpanInfo.totalDays === 1 ? 'rounded-sm' : ''}
                      `}
                      style={{
                        top: `${4 + layerIndex * 24 + 3}px`,
                        zIndex: 6
                      }}
                    />
                  );
                }
                return null;
              })}

              {/* 시연 제목 (시작일 또는 월요일에만) */}
              {dayDemoEvents.map(demo => {
                const demoDetails = demo.details as DemoEventDetails;
                const spanInfo = demoDetails.spanInfo;
                const layerIndex = demoLayerMap.get(demoDetails.id) || 0;

                if (shouldShowTitle(spanInfo, dayIndex)) {
                  return (
                    <div
                      key={`title-${demo.id}`}
                      className="absolute left-1 right-1 pointer-events-none"
                      style={{
                        top: `${4 + layerIndex * 24}px`,
                        zIndex: 10
                      }}
                    >
                      <div className="text-[9px] text-purple-700 font-medium truncate">
                        {demo.title}
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* 발주 이벤트 */}
              <div style={{ marginTop: `${maxLayers * layerHeight + 8}px` }}>
                {dayOrderEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className="text-[9px] text-blue-600 truncate mb-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayOrderEvents.length > 2 && (
                  <div className="text-[8px] text-gray-500 text-center">
                    +{dayOrderEvents.length - 2}
                  </div>
                )}
              </div>

              {/* 이벤트 도트 */}
              {hasEvents && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`w-1 h-1 rounded-full ${
                        event.type === 'order' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileWeekView;