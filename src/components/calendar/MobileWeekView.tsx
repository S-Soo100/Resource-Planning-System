"use client";
import React, { useState } from 'react';
import { WeekInfo, CalendarEvent, DemoEventDetails } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { getDayName, isToday, isWeekend } from '@/utils/calendar/calendarUtils';
import EventItem from './EventItem';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const { getEventsForDate } = useCalendarEvents(events);

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
                    <div>📅 {startDateStr} ~ {endDateStr}</div>
                    <div>📍 {demoDetails.demoAddress}</div>
                    <div>👤 {demoDetails.demoManager}</div>
                  </div>

                  {/* 진행 바 */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-purple-600">진행 상황</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: spanInfo?.totalDays || 1 }, (_, index) => (
                        <div
                          key={index}
                          className={`flex-1 h-2 rounded ${
                            index === 0 || index === (spanInfo?.totalDays || 1) - 1
                              ? 'bg-purple-600'
                              : 'bg-purple-400'
                          }`}
                        />
                      ))}
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
        {weekInfo.days.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;
          const isWeekendDay = isWeekend(date);
          const isTodayDate = isToday(date);
          const isExpanded = expandedDates.has(dateStr);

          return (
            <div
              key={index}
              className={`
                ${isWeekendDay ? 'bg-gray-25' : ''}
                ${isTodayDate ? 'bg-blue-25' : ''}
              `}
            >
              {/* 날짜 헤더 */}
              <div
                className={`
                  flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors
                  ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
                `}
                onClick={() => hasEvents && toggleDateExpansion(dateStr)}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    text-center
                    ${isTodayDate ? 'text-blue-600 font-bold' : isWeekendDay ? 'text-red-600' : 'text-gray-700'}
                  `}>
                    <div className="text-xs mb-1">{getDayName(date.getDay())}요일</div>
                    <div className={`
                      text-2xl
                      ${isTodayDate ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center' : ''}
                    `}>
                      {date.getDate()}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-sm text-gray-600">
                      {date.getMonth() + 1}월 {date.getDate()}일
                    </div>
                    {hasEvents ? (
                      <div className="text-sm text-blue-600 font-medium">
                        일정 {dayEvents.length}개
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">
                        일정 없음
                      </div>
                    )}
                  </div>
                </div>

                {/* 이벤트 요약 미리보기 */}
                <div className="flex items-center gap-2">
                  {/* 이벤트 도트들 */}
                  {hasEvents && (
                    <div className="flex gap-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            w-3 h-3 rounded-full
                            ${event.type === 'order' ? 'bg-blue-500' : 'bg-purple-500'}
                          `}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 ml-1">
                          +{dayEvents.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 확장/축소 버튼 */}
                  {hasEvents && (
                    <div className="text-gray-400">
                      {isExpanded ? (
                        <FaChevronUp className="text-sm" />
                      ) : (
                        <FaChevronDown className="text-sm" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 확장된 이벤트 리스트 */}
              {hasEvents && isExpanded && (
                <div className="px-4 pb-4 bg-gray-50">
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <EventItem
                          event={event}
                          isCompact={false}
                          className="text-sm"
                          isMobile={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 축소된 상태에서의 이벤트 미리보기 */}
              {hasEvents && !isExpanded && dayEvents.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="text-xs text-gray-600 truncate">
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <span key={event.id}>
                        {idx > 0 && ', '}
                        <span className={`
                          ${event.type === 'order' ? 'text-blue-600' : 'text-purple-600'}
                        `}>
                          [{event.type === 'order' ? '발주' : '시연'}] {event.title}
                        </span>
                      </span>
                    ))}
                    {dayEvents.length > 2 && ` 외 ${dayEvents.length - 2}개`}
                  </div>
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