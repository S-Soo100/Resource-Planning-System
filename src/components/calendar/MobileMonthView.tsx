"use client";
import React, { useState, useMemo } from 'react';
import { MonthInfo, CalendarEvent, DemoEventDetails } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import {
  isToday,
  isWeekend,
  isCurrentMonth,
  formatDateToString
} from '@/utils/calendar/calendarUtils';
import { EventDot } from './EventItem';
import { calculateDemoLayers, shouldShowTitle } from '@/utils/calendar/demoBarUtils';

interface MobileMonthViewProps {
  monthInfo: MonthInfo;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

const MobileMonthView: React.FC<MobileMonthViewProps> = ({
  monthInfo,
  events,
  onEventClick,
  className = '',
}) => {
  const { getEventsForDate, hasEventsOnDate } = useCalendarEvents(events);

  // 날짜 → 인덱스 맵 생성
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

  // 각 주별로 최대 레이어 개수 계산
  const weekMaxLayers = useMemo(() => {
    const layersPerWeek = new Array(6).fill(0);

    demoEvents.forEach(demo => {
      const layerIndex = demoLayerMap.get((demo.details as DemoEventDetails).id) || 0;
      const dateStr = demo.date.split('T')[0];

      monthInfo.weeks.forEach((week, weekIndex) => {
        week.forEach(date => {
          if (formatDateToString(date) === dateStr) {
            layersPerWeek[weekIndex] = Math.max(layersPerWeek[weekIndex], layerIndex + 1);
          }
        });
      });
    });

    return layersPerWeek;
  }, [demoEvents, demoLayerMap, monthInfo.weeks]);

  const layerHeight = 20; // 모바일용 높이
  const baseRowHeight = 50; // 모바일용 기본 높이

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // 요일 헤더
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`
              p-1 text-center text-[10px] font-medium
              ${index >= 5 ? 'text-red-600' : 'text-gray-700'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div>
        {monthInfo.weeks.map((week, weekIndex) => {
          const weekLayerCount = weekMaxLayers[weekIndex];
          const weekRowHeight = baseRowHeight + (weekLayerCount * layerHeight);

          return (
            <div
              key={weekIndex}
              className="grid grid-cols-7 border-b border-gray-200 last:border-b-0"
              style={{ minHeight: `${weekRowHeight}px` }}
            >
              {week.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date);
                const hasEvents = hasEventsOnDate(date);
                const isWeekendDay = isWeekend(date);
                const isTodayDate = isToday(date);
                const isCurrentMonthDate = isCurrentMonth(date, monthInfo);

                // 시연과 발주 분리
                const dayDemoEvents = dayEvents.filter(e => e.type === 'demo') as (CalendarEvent & { type: 'demo' })[];
                const dayOrderEvents = dayEvents.filter(e => e.type === 'order');

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      relative border-r border-gray-200 last:border-r-0
                      p-0.5 text-[10px] cursor-pointer hover:bg-gray-50 transition-colors
                      ${isWeekendDay ? 'bg-gray-25' : ''}
                      ${isTodayDate ? 'bg-yellow-50' : ''}
                      ${!isCurrentMonthDate ? 'bg-gray-50 opacity-60' : ''}
                    `}
                    onClick={() => onEventClick && dayEvents[0] && onEventClick(dayEvents[0])}
                  >
                    {/* 날짜 */}
                    <div className={`
                      font-medium text-center
                      ${!isCurrentMonthDate ? 'text-gray-400' : isWeekendDay ? 'text-red-600' : 'text-gray-700'}
                      ${isTodayDate ? 'text-blue-600 font-bold' : ''}
                    `}>
                      {date.getDate()}
                    </div>

                    {/* 시연 막대 (물품) */}
                    {dayDemoEvents.map(demo => {
                      const demoId = (demo.details as DemoEventDetails).id;
                      const layerIndex = demoLayerMap.get(demoId) || 0;
                      const spanInfo = (demo.details as DemoEventDetails).spanInfo;

                      return (
                        <div
                          key={`demo-${demo.id}`}
                          className={`
                            absolute left-0 right-0 h-4
                            bg-purple-100 border-purple-400
                            ${spanInfo?.isStart ? 'rounded-l-sm border-l border-t border-b' : ''}
                            ${spanInfo?.isEnd ? 'rounded-r-sm border-r border-t border-b' : ''}
                            ${spanInfo?.isMiddle ? 'border-t border-b' : ''}
                            ${spanInfo?.totalDays === 1 ? 'rounded-sm border' : ''}
                          `}
                          style={{
                            top: `${16 + layerIndex * 20}px`,
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
                              absolute left-0.5 right-0.5 h-2.5
                              bg-purple-400/50
                              ${eventSpanInfo.isStart ? 'rounded-l-sm' : ''}
                              ${eventSpanInfo.isEnd ? 'rounded-r-sm' : ''}
                              ${eventSpanInfo.totalDays === 1 ? 'rounded-sm' : ''}
                            `}
                            style={{
                              top: `${16 + layerIndex * 20 + 2}px`,
                              zIndex: 6
                            }}
                          />
                        );
                      }
                      return null;
                    })}

                    {/* 시연 제목 (시작일에만) */}
                    {dayDemoEvents.map(demo => {
                      const demoDetails = demo.details as DemoEventDetails;
                      const spanInfo = demoDetails.spanInfo;
                      const layerIndex = demoLayerMap.get(demoDetails.id) || 0;

                      if (shouldShowTitle(spanInfo, dayIndex)) {
                        return (
                          <div
                            key={`title-${demo.id}`}
                            className="absolute left-0.5 right-0.5 pointer-events-none"
                            style={{
                              top: `${16 + layerIndex * 20}px`,
                              zIndex: 10
                            }}
                          >
                            <div className="text-[8px] text-purple-700 font-medium truncate px-0.5">
                              {demo.title}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {/* 발주 이벤트 */}
                    <div style={{ marginTop: `${weekLayerCount * layerHeight + 4}px` }}>
                      {dayOrderEvents.slice(0, 1).map(event => (
                        <div
                          key={event.id}
                          className="text-[8px] text-blue-600 truncate px-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayOrderEvents.length > 1 && (
                        <div className="text-[7px] text-gray-500 text-center">
                          +{dayOrderEvents.length - 1}
                        </div>
                      )}
                    </div>

                    {/* 이벤트 도트 */}
                    {hasEvents && (
                      <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5">
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
          );
        })}
      </div>
    </div>
  );
};

export default MobileMonthView;