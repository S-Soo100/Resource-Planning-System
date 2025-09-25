"use client";
import React, { useState } from 'react';
import { MonthInfo, CalendarEvent, DemoEventDetails } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import {
  getDayName,
  isToday,
  isWeekend,
  isCurrentMonth
} from '@/utils/calendar/calendarUtils';
import EventItem, { EventDot } from './EventItem';
import { MonthDemoSpanBars } from './DemoSpanBar';

interface MonthViewProps {
  monthInfo: MonthInfo;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

const MonthView: React.FC<MonthViewProps> = ({
  monthInfo,
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

  // 최대 레이어 개수 계산 (높이 조정용)
  const calculateMaxLayers = (demos: (CalendarEvent & { type: 'demo' })[]) => {
    if (demos.length === 0) return 0;

    // 간단한 추정: 겹치는 시연 개수의 최대값
    // 실제로는 MonthDemoSpanBars와 같은 로직을 사용해야 하지만
    // 여기서는 추정치로 계산
    return Math.min(demos.length, 4); // 최대 4개 레이어로 제한
  };

  const maxLayers = calculateMaxLayers(multiDayDemos);
  const baseRowHeight = 120; // 기본 높이 (px)
  const layerHeight = 36; // 각 레이어당 추가 높이 (32px 바 + 4px 여백)
  const dynamicRowHeight = Math.max(baseRowHeight, baseRowHeight + (maxLayers * layerHeight));

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

  // 요일 헤더 데이터
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map((day, index) => {
          const isWeekendDay = index >= 5; // 토, 일

          return (
            <div
              key={day}
              className={`
                p-3 text-center font-medium border-r border-gray-200 last:border-r-0
                ${isWeekendDay ? 'text-red-600' : 'text-gray-700'}
              `}
            >
              <div className="text-sm">{day}요일</div>
            </div>
          );
        })}
      </div>

      {/* 날짜별 이벤트 그리드 (6주 x 7일) */}
      <div
        className="relative grid grid-cols-7"
        style={{
          gridTemplateRows: `repeat(6, minmax(${dynamicRowHeight}px, auto))`
        }}
      >
        {/* 시연 연결 바들 */}
        <MonthDemoSpanBars
          demos={multiDayDemos}
          monthWeeks={monthInfo.weeks}
          onDemoClick={handleEventClick}
        />

        {monthInfo.weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const dayEvents = getEventsForDate(date);
            const hasEvents = hasEventsOnDate(date);
            const isWeekendDay = isWeekend(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date, monthInfo);
            const isSelected = selectedDate?.getTime() === date.getTime();

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  border-r border-gray-200 last:border-r-0 border-b border-gray-200
                  p-2 cursor-pointer hover:bg-gray-50 transition-colors
                  ${isWeekendDay ? 'bg-gray-25' : ''}
                  ${isTodayDate ? 'bg-blue-25' : ''}
                  ${!isCurrentMonthDate ? 'bg-gray-100 opacity-50' : ''}
                  ${isSelected ? 'bg-yellow-50 ring-2 ring-yellow-300' : ''}
                  relative
                `}
                onClick={() => handleDateClick(date)}
              >
                {/* 날짜 표시 */}
                <div className={`
                  text-sm font-medium mb-1
                  ${!isCurrentMonthDate ? 'text-gray-400' : isWeekendDay ? 'text-red-600' : 'text-gray-700'}
                  ${isTodayDate ? 'text-blue-600 font-bold' : ''}
                `}>
                  {date.getDate()}
                </div>

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
                    .slice(0, 2)
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
                          className="text-xs"
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
                  }).length > 2 && (
                    <div className="text-xs text-gray-500 p-1 text-center">
                      +{dayEvents.filter(event => {
                        if (event.type === 'demo') {
                          const demoDetails = event.details as DemoEventDetails;
                          return !demoDetails.spanInfo || demoDetails.spanInfo.totalDays <= 1;
                        }
                        return true;
                      }).length - 2}개
                    </div>
                  )}
                </div>

                {/* 이벤트 도트 인디케이터 (화면 하단) */}
                {hasEvents && (
                  <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1">
                    {dayEvents.slice(0, 4).map((event) => (
                      <EventDot
                        key={event.id}
                        event={event}
                        size="xs"
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 선택된 날짜의 상세 이벤트 */}
      {selectedDate && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-700 mb-3">
            {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
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

export default MonthView;