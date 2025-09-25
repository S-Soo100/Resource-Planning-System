"use client";
import React, { useState } from 'react';
import { WeekInfo, CalendarEvent, DemoEventDetails } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { getDayName, isToday, isWeekend } from '@/utils/calendar/calendarUtils';
import EventItem, { EventDot } from './EventItem';
import { WeekDemoSpanBars, calculateWeekMaxLayers } from './DemoSpanBar';

interface WeekViewProps {
  weekInfo: WeekInfo;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

const WeekView: React.FC<WeekViewProps> = ({
  weekInfo,
  events,
  onEventClick,
  className = '',
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { getEventsForDate, hasEventsOnDate } = useCalendarEvents(events);

  // 시연 이벤트들 추출 (연결 바용)
  const demoEvents = events.filter(event => event.type === 'demo') as (CalendarEvent & { type: 'demo' })[];

  // 여러 날에 걸친 시연만 필터링 (1일짜리는 기존 방식 유지)
  const multiDayDemos = demoEvents.filter(demo => {
    const demoDetails = demo.details as DemoEventDetails;
    return demoDetails.spanInfo && demoDetails.spanInfo.totalDays > 1;
  });

  // 정확한 최대 레이어 개수 계산
  const maxLayers = calculateWeekMaxLayers(multiDayDemos, weekInfo.days);
  const baseHeight = 200; // 기본 높이 (px)
  const layerHeight = 36; // 각 레이어당 추가 높이
  const dynamicHeight = Math.max(baseHeight, baseHeight + (maxLayers * layerHeight));

  // 시연 연결 바들의 총 높이 (발주 일정 위치 조정용)
  const demoBarsTotalHeight = maxLayers > 0 ? maxLayers * layerHeight : 0;

  const handleDateClick = (date: Date) => {
    setSelectedDate(selectedDate?.getTime() === date.getTime() ? null : date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
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
                p-3 text-center font-medium border-r border-gray-200 last:border-r-0
                ${isWeekendDay ? 'text-red-600' : 'text-gray-700'}
                ${isTodayDate ? 'bg-blue-50 text-blue-700' : ''}
              `}
            >
              <div className="text-xs mb-1">{dayName}요일</div>
              <div className={`
                text-lg
                ${isTodayDate ? 'font-bold' : ''}
              `}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* 날짜별 이벤트 그리드 */}
      <div
        className="relative grid grid-cols-7"
        style={{ minHeight: `${dynamicHeight}px` }}
      >
        {/* 시연 연결 바들 */}
        <WeekDemoSpanBars
          demos={multiDayDemos}
          weekDays={weekInfo.days}
          onDemoClick={handleEventClick}
        />

        {weekInfo.days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const hasEvents = hasEventsOnDate(date);
          const isWeekendDay = isWeekend(date);
          const isTodayDate = isToday(date);
          const isSelected = selectedDate?.getTime() === date.getTime();

          return (
            <div
              key={index}
              className={`
                border-r border-gray-200 last:border-r-0 border-b border-gray-200
                p-2 cursor-pointer hover:bg-gray-50 transition-colors
                ${isWeekendDay ? 'bg-gray-25' : ''}
                ${isTodayDate ? 'bg-blue-25' : ''}
                ${isSelected ? 'bg-yellow-50 ring-2 ring-yellow-300' : ''}
              `}
              onClick={() => handleDateClick(date)}
            >
              {/* 이벤트 표시 */}
              <div
                className="space-y-1"
                style={{ marginTop: `${demoBarsTotalHeight}px` }}
              >
                {dayEvents
                  .filter(event => {
                    // 여러 날짜에 걸친 시연은 개별 블럭에서 제외 (연결 바로 표시됨)
                    if (event.type === 'demo') {
                      const demoDetails = event.details as DemoEventDetails;
                      return !demoDetails.spanInfo || demoDetails.spanInfo.totalDays <= 1;
                    }
                    return true;
                  })
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      <EventItem
                        event={event}
                        isCompact
                      />
                    </div>
                  ))}

                {/* 더 많은 이벤트가 있는 경우 */}
                {dayEvents.filter(event => {
                  // 여러 날짜에 걸친 시연 제외한 이벤트 수 계산
                  if (event.type === 'demo') {
                    const demoDetails = event.details as DemoEventDetails;
                    return !demoDetails.spanInfo || demoDetails.spanInfo.totalDays <= 1;
                  }
                  return true;
                }).length > 3 && (
                  <div className="text-xs text-gray-500 p-1 text-center">
                    +{dayEvents.filter(event => {
                      if (event.type === 'demo') {
                        const demoDetails = event.details as DemoEventDetails;
                        return !demoDetails.spanInfo || demoDetails.spanInfo.totalDays <= 1;
                      }
                      return true;
                    }).length - 3}개 더
                  </div>
                )}

                {/* 이벤트가 없는 경우 */}
                {!hasEvents && (
                  <div className="text-xs text-gray-400 p-2 text-center">
                    일정 없음
                  </div>
                )}
              </div>

              {/* 이벤트 도트 인디케이터 */}
              {hasEvents && (
                <div className="flex justify-center gap-1 mt-2">
                  {dayEvents.slice(0, 5).map((event) => (
                    <EventDot
                      key={event.id}
                      event={event}
                      size="sm"
                    />
                  ))}
                  {dayEvents.length > 5 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 5}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 선택된 날짜의 상세 이벤트 */}
      {selectedDate && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-700 mb-3">
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            {getDayName(selectedDate.getDay())}요일 일정
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {getEventsForDate(selectedDate).map((event) => (
              <EventItem
                key={event.id}
                event={event}
                onClick={handleEventClick}
                className="text-sm"
              />
            ))}

            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-gray-500 text-center py-4">
                이 날에는 일정이 없습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekView;