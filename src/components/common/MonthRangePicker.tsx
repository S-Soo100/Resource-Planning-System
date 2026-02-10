'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface MonthRangePickerProps {
  startDate: string; // YYYY-MM-DD 형식
  endDate: string; // YYYY-MM-DD 형식
  onStartDateChange: (date: string) => void; // YYYY-MM-DD 형식
  onEndDateChange: (date: string) => void; // YYYY-MM-DD 형식
  className?: string;
}

export function MonthRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = '',
}: MonthRangePickerProps) {
  // YYYY-MM-DD → YYYY-MM 변환
  const toMonthFormat = (dateString: string): string => {
    if (!dateString) return '';
    return dateString.substring(0, 7); // "2026-02-10" → "2026-02"
  };

  // YYYY-MM → 해당 월의 첫날 (YYYY-MM-DD)
  const monthToStartDate = (monthString: string): string => {
    if (!monthString) return '';
    const date = new Date(monthString + '-01');
    return format(startOfMonth(date), 'yyyy-MM-dd');
  };

  // YYYY-MM → 해당 월의 마지막날 (YYYY-MM-DD)
  const monthToEndDate = (monthString: string): string => {
    if (!monthString) return '';
    const date = new Date(monthString + '-01');
    return format(endOfMonth(date), 'yyyy-MM-dd');
  };

  const handleStartMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const monthValue = e.target.value; // "2026-02"
    if (!monthValue) return;
    const newStartDate = monthToStartDate(monthValue);
    onStartDateChange(newStartDate);
  };

  const handleEndMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const monthValue = e.target.value; // "2026-02"
    if (!monthValue) return;
    const newEndDate = monthToEndDate(monthValue);
    onEndDateChange(newEndDate);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* 시작 월 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          시작 월
        </label>
        <input
          type="month"
          value={toMonthFormat(startDate)}
          onChange={handleStartMonthChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 종료 월 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          종료 월
        </label>
        <input
          type="month"
          value={toMonthFormat(endDate)}
          onChange={handleEndMonthChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
