"use client";
import React from 'react';
import { WeekInfo } from '@/types/calendar/calendar';
import { getWeekTitle } from '@/utils/calendar/calendarUtils';
import { FaChevronLeft, FaChevronRight, FaCalendarDay } from 'react-icons/fa';

interface CalendarNavigationProps {
  weekInfo: WeekInfo;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  isCurrentWeek: boolean;
  className?: string;
}

const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  weekInfo,
  onPreviousWeek,
  onNextWeek,
  onToday,
  isCurrentWeek,
  className = '',
}) => {
  const weekTitle = getWeekTitle(weekInfo);

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-md p-3 md:p-4 gap-3 md:gap-0 ${className}`}>
      {/* 모바일: 주 정보를 위쪽에 표시 */}
      <div className="flex flex-col items-center gap-2 md:hidden w-full">
        <h2 className="text-lg font-semibold text-gray-800 text-center">
          {weekTitle}
        </h2>

        <div className="flex items-center justify-center">
          {!isCurrentWeek && (
            <button
              onClick={onToday}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <FaCalendarDay className="text-sm" />
              오늘로
            </button>
          )}

          {isCurrentWeek && (
            <span className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
              이번 주
            </span>
          )}
        </div>
      </div>

      {/* 네비게이션 버튼들 */}
      <div className="flex items-center justify-between w-full md:w-auto">
        {/* 이전 주 버튼 */}
        <button
          onClick={onPreviousWeek}
          className="flex items-center justify-center w-12 h-10 md:w-10 md:h-10 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
          title="이전 주"
        >
          <FaChevronLeft className="text-sm md:text-lg" />
        </button>

        {/* 데스크톱: 가운데 주 정보 */}
        <div className="hidden md:flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {weekTitle}
          </h2>

          {!isCurrentWeek && (
            <button
              onClick={onToday}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <FaCalendarDay className="text-sm" />
              오늘로
            </button>
          )}

          {isCurrentWeek && (
            <span className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
              이번 주
            </span>
          )}
        </div>

        {/* 다음 주 버튼 */}
        <button
          onClick={onNextWeek}
          className="flex items-center justify-center w-12 h-10 md:w-10 md:h-10 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
          title="다음 주"
        >
          <FaChevronRight className="text-sm md:text-lg" />
        </button>
      </div>
    </div>
  );
};

export default CalendarNavigation;