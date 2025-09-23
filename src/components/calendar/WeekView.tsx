"use client";
import React, { useState } from 'react';
import { WeekInfo, CalendarEvent } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { getDayName, isToday, isWeekend } from '@/utils/calendar/calendarUtils';
import EventItem, { EventDot } from './EventItem';

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
      <div className="grid grid-cols-7 min-h-[200px]">
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
                min-h-[200px]
              `}
              onClick={() => handleDateClick(date)}
            >
              {/* 이벤트 표시 */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
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
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 p-1 text-center">
                    +{dayEvents.length - 3}개 더
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