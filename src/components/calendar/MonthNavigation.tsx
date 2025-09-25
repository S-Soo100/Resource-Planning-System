"use client";
import React from 'react';
import { MonthInfo } from '@/types/calendar/calendar';
import { getMonthTitle } from '@/utils/calendar/calendarUtils';
import { FaChevronLeft, FaChevronRight, FaCalendarDay } from 'react-icons/fa';

interface MonthNavigationProps {
  monthInfo: MonthInfo;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  isCurrentMonth: boolean;
  className?: string;
}

const MonthNavigation: React.FC<MonthNavigationProps> = ({
  monthInfo,
  onPreviousMonth,
  onNextMonth,
  onToday,
  isCurrentMonth,
  className = '',
}) => {
  const monthTitle = getMonthTitle(monthInfo);

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-md p-3 md:p-4 gap-3 md:gap-0 ${className}`}>
      {/* 모바일: 월 정보를 위쪽에 표시 */}
      <div className="flex flex-col items-center gap-2 md:hidden w-full">
        <h2 className="text-lg font-semibold text-gray-800 text-center">
          {monthTitle}
        </h2>

        <div className="flex items-center justify-center">
          {!isCurrentMonth && (
            <button
              onClick={onToday}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <FaCalendarDay className="text-sm" />
              오늘로
            </button>
          )}

          {isCurrentMonth && (
            <span className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
              이번 달
            </span>
          )}
        </div>
      </div>

      {/* 네비게이션 버튼들 */}
      <div className="flex items-center justify-between w-full md:w-auto">
        {/* 이전 달 버튼 */}
        <button
          onClick={onPreviousMonth}
          className="flex items-center justify-center w-12 h-10 md:w-10 md:h-10 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
          title="이전 달"
        >
          <FaChevronLeft className="text-sm md:text-lg" />
        </button>

        {/* 데스크톱: 가운데 월 정보 */}
        <div className="hidden md:flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {monthTitle}
          </h2>

          {!isCurrentMonth && (
            <button
              onClick={onToday}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <FaCalendarDay className="text-sm" />
              오늘로
            </button>
          )}

          {isCurrentMonth && (
            <span className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
              이번 달
            </span>
          )}
        </div>

        {/* 다음 달 버튼 */}
        <button
          onClick={onNextMonth}
          className="flex items-center justify-center w-12 h-10 md:w-10 md:h-10 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
          title="다음 달"
        >
          <FaChevronRight className="text-sm md:text-lg" />
        </button>
      </div>
    </div>
  );
};

export default MonthNavigation;