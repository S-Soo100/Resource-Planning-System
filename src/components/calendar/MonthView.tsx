"use client";
import React, { useState, useMemo } from 'react';
import { MonthInfo, CalendarEvent, DemoEventDetails } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import {
  getDayName,
  isToday,
  isWeekend,
  isCurrentMonth,
  formatDateToString
} from '@/utils/calendar/calendarUtils';
import EventItem, { EventDot } from './EventItem';
import DemoDayBarInline from './DemoDayBarInline';
import { calculateDemoLayers, shouldShowTitle } from '@/utils/calendar/demoBarUtils';

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

  // 날짜 → 인덱스 맵 생성 (42일: 6주 x 7일)
  const dateMap = useMemo(() => {
    const map = new Map<string, number>();
    monthInfo.weeks.flat().forEach((date, index) => {
      map.set(formatDateToString(date), index);
    });
    return map;
  }, [monthInfo.weeks]);

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

  // 최대 레이어 개수
  const maxLayers = demoLayerMap.size > 0 ? Math.max(...demoLayerMap.values()) + 1 : 0;
  const layerHeight = 52; // h-12 막대 + 여백
  const demoBarsTotalHeight = maxLayers * layerHeight;
  const baseRowHeight = 120;
  const dynamicRowHeight = Math.max(baseRowHeight, baseRowHeight + demoBarsTotalHeight);

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
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
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
        className="grid grid-cols-7 overflow-visible"
        style={{
          gridTemplateRows: `repeat(6, minmax(${dynamicRowHeight}px, auto))`
        }}
      >
        {monthInfo.weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const dayEvents = getEventsForDate(date);
            const hasEvents = hasEventsOnDate(date);
            const isWeekendDay = isWeekend(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date, monthInfo);
            const isSelected = selectedDate?.getTime() === date.getTime();

            // 해당 날짜의 시연 이벤트와 발주 이벤트 분리
            const dayDemoEvents = dayEvents.filter(e => e.type === 'demo') as (CalendarEvent & { type: 'demo' })[];
            const dayOrderEvents = dayEvents.filter(e => e.type === 'order');

            // 날짜의 전역 인덱스 계산 (0~41)
            const globalIndex = weekIndex * 7 + dayIndex;

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  relative border-r border-gray-200 last:border-r-0 border-b border-gray-200
                  p-2 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col
                  ${isWeekendDay ? 'bg-gray-25' : ''}
                  ${isTodayDate ? 'bg-blue-25' : ''}
                  ${!isCurrentMonthDate ? 'bg-gray-100 opacity-50' : ''}
                  ${isSelected ? 'bg-yellow-50 ring-2 ring-yellow-300' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                {/* 날짜 표시 */}
                <div className={`
                  text-sm font-medium mb-1 relative z-20 bg-inherit px-1
                  ${!isCurrentMonthDate ? 'text-gray-400' : isWeekendDay ? 'text-red-600' : 'text-gray-700'}
                  ${isTodayDate ? 'text-blue-600 font-bold' : ''}
                `}>
                  {date.getDate()}
                </div>

                {/* 시연 막대들 */}
                {dayDemoEvents.map(demo => {
                  const demoId = (demo.details as DemoEventDetails).id;
                  const layerIndex = demoLayerMap.get(demoId) || 0;
                  const spanInfo = (demo.details as DemoEventDetails).spanInfo;

                  return (
                    <DemoDayBarInline
                      key={demo.id}
                      demo={demo}
                      columnIndex={dayIndex}
                      layerIndex={layerIndex}
                      showTitle={shouldShowTitle(spanInfo, dayIndex)}
                      onDemoClick={handleEventClick}
                    />
                  );
                })}

                {/* 발주 이벤트 표시 */}
                <div
                  className="space-y-1 flex-1"
                  style={{ marginTop: `${demoBarsTotalHeight}px` }}
                >
                  {dayOrderEvents.slice(0, 2).map((event) => (
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
                  {dayOrderEvents.length > 2 && (
                    <div className="text-xs text-gray-500 p-1 text-center">
                      +{dayOrderEvents.length - 2}개
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