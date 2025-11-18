"use client";
import React, { useState, useMemo } from 'react';
import { MonthInfo, CalendarEvent, DemoEventDetails } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import {
  getDayName,
  isToday,
  isWeekend,
  isCurrentMonth,
  formatDateToString,
  formatShortDate,
  formatEventSchedule
} from '@/utils/calendar/calendarUtils';
import EventItem, { EventDot } from './EventItem';
import DemoDayBarInline from './DemoDayBarInline';
import DemoTitleOverlay from './DemoTitleOverlay';
import { calculateDemoLayers, shouldShowTitle } from '@/utils/calendar/demoBarUtils';

interface MonthViewProps {
  monthInfo: MonthInfo;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

/**
 * 시연 ID별 텍스트 색상 팔레트
 */
const TEXT_COLORS = [
  '#7c3aed', // purple-600
  '#6d28d9', // violet-700
  '#a21caf', // fuchsia-700
  '#5b21b6', // violet-800
  '#86198f', // fuchsia-800
  '#4c1d95', // violet-900
  '#701a75', // fuchsia-900
  '#581c87', // purple-900
];

/**
 * 시연 ID에 따라 색상 선택
 */
function getTextColorByDemoId(demoId: number): string {
  const index = demoId % TEXT_COLORS.length;
  return TEXT_COLORS[index];
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

  // 각 주(행)별로 최대 레이어 개수 계산
  const weekMaxLayers = useMemo(() => {
    const layersPerWeek = new Array(6).fill(0);

    demoEvents.forEach(demo => {
      const layerIndex = demoLayerMap.get((demo.details as DemoEventDetails).id) || 0;
      const dateStr = demo.date.split('T')[0];

      // 해당 날짜가 속한 주 찾기
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

  const layerHeight = 52; // h-12 막대 + 여백
  const baseRowHeight = 120;

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
      <div className="relative">
        {monthInfo.weeks.map((week, weekIndex) => {
          const weekLayerCount = weekMaxLayers[weekIndex];
          const weekRowHeight = baseRowHeight + (weekLayerCount * layerHeight);

          return (
            <div
              key={weekIndex}
              className="grid grid-cols-7 border-b border-gray-200 last:border-b-0"
              style={{
                minHeight: `${weekRowHeight}px`,
                position: 'relative'
              }}
            >
              {week.map((date, dayIndex) => {
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
                    relative border-r border-gray-200 last:border-r-0
                    p-2 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col overflow-visible
                    h-full
                    ${isWeekendDay ? 'bg-gray-25' : ''}
                    ${isTodayDate ? 'bg-yellow-50' : ''}
                    ${!isCurrentMonthDate ? 'bg-gray-100 opacity-50' : ''}
                    ${isSelected ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}
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
                  style={{ marginTop: `${weekLayerCount * layerHeight}px` }}
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
            })}
            </div>
          );
        })}

        {/* 시연 제목 오버레이 레이어 */}
        {demoEvents.map(demo => {
          const demoId = (demo.details as DemoEventDetails).id;
          const layerIndex = demoLayerMap.get(demoId) || 0;
          const spanInfo = (demo.details as DemoEventDetails).spanInfo;

          // 날짜 찾기 (주 인덱스와 열 인덱스)
          const dateStr = demo.date.split('T')[0];
          let columnIndex = -1;
          let rowIndex = -1;
          monthInfo.weeks.forEach((week, wIdx) => {
            week.forEach((date, dIdx) => {
              if (formatDateToString(date) === dateStr) {
                columnIndex = dIdx;
                rowIndex = wIdx;
              }
            });
          });

          // 시작일 또는 월요일에만 제목 표시
          if (shouldShowTitle(spanInfo, columnIndex) && columnIndex !== -1 && rowIndex !== -1) {
            // 이전 주들의 높이 합계 계산
            let topOffset = 0;
            for (let i = 0; i < rowIndex; i++) {
              topOffset += baseRowHeight + (weekMaxLayers[i] * layerHeight);
            }

            return (
              <div
                key={`title-${demoId}-${dateStr}`}
                className="absolute pointer-events-none flex flex-col justify-center"
                style={{
                  left: `${(columnIndex * 100) / 7}%`,
                  top: `${topOffset + 40 + (layerIndex * layerHeight)}px`,
                  width: `${((spanInfo?.totalDays || 1) * 100) / 7}%`,
                  height: '48px',
                  zIndex: 20,
                  paddingLeft: '0.5rem',
                  paddingRight: '0.5rem',
                  overflow: 'hidden'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(demo);
                }}
              >
                <div
                  className="font-medium text-sm leading-tight pointer-events-auto cursor-pointer"
                  style={{
                    whiteSpace: 'nowrap',
                    color: getTextColorByDemoId(demoId),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {demo.title}
                </div>
                <div
                  className="text-[10px] opacity-75 leading-tight mt-0.5"
                  style={{
                    whiteSpace: 'nowrap',
                    color: getTextColorByDemoId(demoId),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  물품: {formatShortDate((demo.details as DemoEventDetails).demoStartDate)}~{formatShortDate((demo.details as DemoEventDetails).demoEndDate)}
                  {(demo.details as DemoEventDetails).eventStartDate && ` · 행사: ${formatEventSchedule(
                    (demo.details as DemoEventDetails).eventStartDate,
                    (demo.details as DemoEventDetails).eventEndDate,
                    (demo.details as DemoEventDetails).eventStartTime,
                    (demo.details as DemoEventDetails).eventEndTime
                  )}`}
                </div>
              </div>
            );
          }
          return null;
        })}
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