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
import EventItem from './EventItem';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const { getEventsForDate, hasEventsOnDate } = useCalendarEvents(events);

  // 시연 이벤트들 추출 및 그룹화
  const demoEvents = events.filter(event => event.type === 'demo') as (CalendarEvent & { type: 'demo' })[];

  // 여러 날에 걸친 시연들 그룹화
  const multiDayDemoGroups = new Map<number, (CalendarEvent & { type: 'demo' })[]>();

  demoEvents.forEach(demo => {
    const demoDetails = demo.details as DemoEventDetails;
    if (demoDetails.spanInfo && demoDetails.spanInfo.totalDays > 1) {
      if (!multiDayDemoGroups.has(demoDetails.id)) {
        multiDayDemoGroups.set(demoDetails.id, []);
      }
      multiDayDemoGroups.get(demoDetails.id)!.push(demo);
    }
  });

  const toggleDateExpansion = (dateStr: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedDates(newExpanded);
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // 모든 날짜를 1차원 배열로 평평하게 만듦
  const allDates = monthInfo.weeks.flat();

  // 현재 월에 속하는 날짜만 필터링하고 이벤트가 있는 날짜를 우선 표시
  const currentMonthDates = allDates.filter(date => isCurrentMonth(date, monthInfo));
  const otherMonthDates = allDates.filter(date => !isCurrentMonth(date, monthInfo) && hasEventsOnDate(date));

  const displayDates = [...currentMonthDates, ...otherMonthDates];

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* 연결된 시연 섹션 */}
      {multiDayDemoGroups.size > 0 && (
        <div className="bg-purple-50 border-b border-purple-200 p-4">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
            🔗 연결된 시연 일정
          </h3>
          <div className="space-y-3">
            {Array.from(multiDayDemoGroups.entries()).map(([demoId, demoGroup]) => {
              const firstDemo = demoGroup[0];
              const demoDetails = firstDemo.details as DemoEventDetails;
              const spanInfo = demoDetails.spanInfo;

              // 날짜 범위 계산
              const dates = demoGroup.map(d => d.date.split('T')[0]).sort();
              const startDateStr = dates[0];
              const endDateStr = dates[dates.length - 1];

              return (
                <div
                  key={demoId}
                  className="bg-white rounded-lg border-2 border-purple-300 p-3 cursor-pointer hover:bg-purple-50 transition-colors"
                  onClick={() => onEventClick && onEventClick(firstDemo)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                      <span className="text-lg">🎭</span>
                      {firstDemo.title}
                    </h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {spanInfo?.totalDays || 1}일간
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div>📦 물품: {startDateStr} ~ {endDateStr}</div>
                    {demoDetails.eventStartDate && (
                      <div>🎪 행사: {demoDetails.eventStartDate.split('T')[0]} ~ {demoDetails.eventEndDate?.split('T')[0] || demoDetails.eventStartDate.split('T')[0]}</div>
                    )}
                    <div>📍 {demoDetails.demoAddress}</div>
                    <div>👤 {demoDetails.demoManager}</div>
                  </div>

                  {/* 진행 바 */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-purple-600">진행 상황</span>
                    </div>
                    <div className="relative">
                      {/* 물품 이동 기간 바 */}
                      <div className="flex gap-1">
                        {Array.from({ length: spanInfo?.totalDays || 1 }, (_, index) => (
                          <div
                            key={index}
                            className={`flex-1 h-3 rounded ${
                              index === 0 || index === (spanInfo?.totalDays || 1) - 1
                                ? 'bg-purple-300'
                                : 'bg-purple-200'
                            }`}
                          />
                        ))}
                      </div>
                      {/* 행사 기간 오버레이 */}
                      {demoDetails.eventStartDate && demoDetails.eventSpanInfo && (
                        <div
                          className="absolute top-0 h-3 bg-purple-500/60 rounded"
                          style={{
                            left: `${(demoDetails.eventSpanInfo.dayIndex / (spanInfo?.totalDays || 1)) * 100}%`,
                            width: `${((demoDetails.eventSpanInfo.totalDays || 1) / (spanInfo?.totalDays || 1)) * 100}%`
                          }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-500">물품 상차</span>
                      {demoDetails.eventStartDate && (
                        <span className="text-[10px] text-purple-600 font-medium">행사</span>
                      )}
                      <span className="text-[10px] text-gray-500">물품 하차</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 개별 날짜 섹션 */}
      <div className="divide-y divide-gray-200">
        {displayDates.map((date, index) => {
          const dayEvents = getEventsForDate(date).filter(event => {
            // 여러 날짜에 걸친 시연은 개별 날짜에서 제외 (상단에 별도 표시됨)
            if (event.type === 'demo') {
              const demoDetails = event.details as DemoEventDetails;
              return !demoDetails.spanInfo || demoDetails.spanInfo.totalDays <= 1;
            }
            return true;
          });
          const hasEvents = dayEvents.length > 0;
          const isWeekendDay = isWeekend(date);
          const isTodayDate = isToday(date);
          const isCurrentMonthDate = isCurrentMonth(date, monthInfo);
          const dateStr = date.toISOString().split('T')[0];
          const isExpanded = expandedDates.has(dateStr);

          return (
            <div
              key={`${date.getTime()}-${index}`}
              className={`
                p-4 border-l-4 transition-colors
                ${isTodayDate ? 'border-l-yellow-500 bg-yellow-50' : hasEvents ? 'border-l-green-400' : 'border-l-gray-200'}
                ${!isCurrentMonthDate ? 'opacity-60 bg-gray-50' : ''}
              `}
            >
              {/* 날짜 헤더 */}
              <div
                className={`flex items-center justify-between cursor-pointer ${hasEvents ? 'mb-3' : ''}`}
                onClick={() => hasEvents && toggleDateExpansion(dateStr)}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    flex flex-col items-center
                    ${!isCurrentMonthDate ? 'text-gray-400' : isTodayDate ? 'text-blue-600' : isWeekendDay ? 'text-red-600' : 'text-gray-700'}
                  `}>
                    <div className="text-xs font-medium">
                      {getDayName(date.getDay())}
                    </div>
                    <div className={`
                      text-xl font-bold
                      ${isTodayDate ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center' : ''}
                    `}>
                      {date.getDate()}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className={`
                      text-sm font-medium
                      ${!isCurrentMonthDate ? 'text-gray-400' : 'text-gray-700'}
                    `}>
                      {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
                    </div>
                    <div className={`
                      text-xs
                      ${!isCurrentMonthDate ? 'text-gray-400' : 'text-gray-500'}
                    `}>
                      {getDayName(date.getDay())}요일
                      {!isCurrentMonthDate && ' (다른 달)'}
                    </div>
                  </div>
                </div>

                {/* 이벤트 상태 표시 */}
                <div className="flex items-center gap-2">
                  {hasEvents && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {dayEvents.length}개
                      </span>
                      <div className="flex gap-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`
                              w-2 h-2 rounded-full
                              ${event.type === 'order' ? 'bg-blue-500' : 'bg-purple-500'}
                            `}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                        )}
                      </div>
                      {isExpanded ? (
                        <FaChevronUp className="text-gray-400 text-sm" />
                      ) : (
                        <FaChevronDown className="text-gray-400 text-sm" />
                      )}
                    </div>
                  )}

                  {!hasEvents && (
                    <span className="text-xs text-gray-400">일정 없음</span>
                  )}
                </div>
              </div>

              {/* 이벤트 미리보기 (축소된 상태) */}
              {hasEvents && !isExpanded && (
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="text-xs">
                      <EventItem
                        event={event}
                        isCompact
                        onClick={handleEventClick}
                      />
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 pl-2">
                      +{dayEvents.length - 2}개 더 있음
                    </div>
                  )}
                </div>
              )}

              {/* 이벤트 상세 (확장된 상태) */}
              {hasEvents && isExpanded && (
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      onClick={handleEventClick}
                      className="text-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* 이벤트가 없는 날이 많을 경우 안내 */}
        {displayDates.every(date => !hasEventsOnDate(date)) && (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">이번 달에는 일정이 없습니다</p>
            <p className="text-sm">발주나 시연 일정이 등록되면 여기에 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMonthView;