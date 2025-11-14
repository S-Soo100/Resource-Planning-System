"use client";
import React, { useState, useMemo } from 'react';
import { WeekInfo, CalendarEvent, DemoEventDetails } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { getDayName, isToday, isWeekend, formatDateToString } from '@/utils/calendar/calendarUtils';
import EventItem, { EventDot } from './EventItem';
import DemoDayBarInline from './DemoDayBarInline';
import DemoTitleOverlay from './DemoTitleOverlay';
import { calculateDemoLayers, shouldShowTitle } from '@/utils/calendar/demoBarUtils';

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

  // 최대 레이어 개수
  const maxLayers = demoLayerMap.size > 0 ? Math.max(...demoLayerMap.values()) + 1 : 0;
  const layerHeight = 52; // h-12 막대 + 여백
  const demoBarsTotalHeight = maxLayers * layerHeight;
  const baseHeight = 200;
  const dynamicHeight = Math.max(baseHeight, baseHeight + demoBarsTotalHeight);

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
        className="grid grid-cols-7 overflow-visible relative"
        style={{ minHeight: `${dynamicHeight}px` }}
      >
        {weekInfo.days.map((date, columnIndex) => {
          const dayEvents = getEventsForDate(date);
          const hasEvents = hasEventsOnDate(date);
          const isWeekendDay = isWeekend(date);
          const isTodayDate = isToday(date);
          const isSelected = selectedDate?.getTime() === date.getTime();

          // 해당 날짜의 시연 이벤트와 발주 이벤트 분리
          const dayDemoEvents = dayEvents.filter(e => e.type === 'demo') as (CalendarEvent & { type: 'demo' })[];
          const dayOrderEvents = dayEvents.filter(e => e.type === 'order');

          return (
            <div
              key={columnIndex}
              className={`
                relative border-r border-gray-200 last:border-r-0 border-b border-gray-200
                p-2 cursor-pointer hover:bg-gray-50 transition-colors overflow-visible
                ${isWeekendDay ? 'bg-gray-25' : ''}
                ${isTodayDate ? 'bg-blue-25' : ''}
                ${isSelected ? 'bg-yellow-50 ring-2 ring-yellow-300' : ''}
              `}
              onClick={() => handleDateClick(date)}
            >
              {/* 시연 막대들 */}
              {dayDemoEvents.map(demo => {
                const demoId = (demo.details as DemoEventDetails).id;
                const layerIndex = demoLayerMap.get(demoId) || 0;
                const spanInfo = (demo.details as DemoEventDetails).spanInfo;

                return (
                  <DemoDayBarInline
                    key={demo.id}
                    demo={demo}
                    columnIndex={columnIndex}
                    layerIndex={layerIndex}
                    showTitle={shouldShowTitle(spanInfo, columnIndex)}
                    onDemoClick={handleEventClick}
                  />
                );
              })}

              {/* 발주 이벤트 표시 */}
              <div
                className="space-y-1"
                style={{ marginTop: `${demoBarsTotalHeight + 40}px` }}
              >
                {dayOrderEvents.slice(0, 3).map((event) => (
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
                {dayOrderEvents.length > 3 && (
                  <div className="text-xs text-gray-500 p-1 text-center">
                    +{dayOrderEvents.length - 3}개 더
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

        {/* 시연 제목 오버레이 레이어 */}
        {demoEvents.map(demo => {
          const demoId = (demo.details as DemoEventDetails).id;
          const layerIndex = demoLayerMap.get(demoId) || 0;
          const spanInfo = (demo.details as DemoEventDetails).spanInfo;
          const dateStr = demo.date.split('T')[0];
          const columnIndex = weekInfo.days.findIndex(d => formatDateToString(d) === dateStr);

          // 시작일 또는 월요일에만 제목 표시
          if (shouldShowTitle(spanInfo, columnIndex) && columnIndex !== -1) {
            return (
              <DemoTitleOverlay
                key={`title-${demoId}-${dateStr}`}
                demo={demo}
                columnIndex={columnIndex}
                layerIndex={layerIndex}
                onDemoClick={handleEventClick}
              />
            );
          }
          return null;
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