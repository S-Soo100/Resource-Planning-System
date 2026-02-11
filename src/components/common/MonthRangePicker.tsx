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
  // YYYY-MM-DD → { year, month } 변환
  const parseDate = (dateString: string): { year: number; month: number } => {
    if (!dateString) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() + 1 };
    }
    const [year, month] = dateString.split('-').map(Number);
    return { year, month };
  };

  const { year: startYear, month: startMonth } = parseDate(startDate);
  const { year: endYear, month: endMonth } = parseDate(endDate);

  // 연도 범위 생성 (현재 연도 기준 ±10년)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // 월 배열
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 연도/월 → YYYY-MM-DD (월의 첫날)
  const toStartDateString = (year: number, month: number): string => {
    const date = new Date(year, month - 1, 1);
    return format(startOfMonth(date), 'yyyy-MM-dd');
  };

  // 연도/월 → YYYY-MM-DD (월의 마지막날)
  const toEndDateString = (year: number, month: number): string => {
    const date = new Date(year, month - 1, 1);
    return format(endOfMonth(date), 'yyyy-MM-dd');
  };

  // 시작 연도 변경
  const handleStartYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = Number(e.target.value);
    onStartDateChange(toStartDateString(year, startMonth));
  };

  // 시작 월 변경
  const handleStartMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = Number(e.target.value);
    onStartDateChange(toStartDateString(startYear, month));
  };

  // 종료 연도 변경
  const handleEndYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = Number(e.target.value);
    onEndDateChange(toEndDateString(year, endMonth));
  };

  // 종료 월 변경
  const handleEndMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = Number(e.target.value);
    onEndDateChange(toEndDateString(endYear, month));
  };

  // 빠른 선택 핸들러
  const handlePresetClick = (
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ) => {
    onStartDateChange(toStartDateString(startYear, startMonth));
    onEndDateChange(toEndDateString(endYear, endMonth));
  };

  // 빠른 선택 프리셋 계산
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  const presets = [
    {
      label: '이번 달',
      onClick: () => handlePresetClick(thisYear, thisMonth, thisYear, thisMonth),
    },
    {
      label: '최근 3개월',
      onClick: () => {
        const start = new Date(thisYear, thisMonth - 3, 1);
        handlePresetClick(
          start.getFullYear(),
          start.getMonth() + 1,
          thisYear,
          thisMonth
        );
      },
    },
    {
      label: '최근 6개월',
      onClick: () => {
        const start = new Date(thisYear, thisMonth - 6, 1);
        handlePresetClick(
          start.getFullYear(),
          start.getMonth() + 1,
          thisYear,
          thisMonth
        );
      },
    },
    {
      label: '올해',
      onClick: () => handlePresetClick(thisYear, 1, thisYear, thisMonth),
    },
    {
      label: '작년',
      onClick: () => handlePresetClick(thisYear - 1, 1, thisYear - 1, 12),
    },
  ];

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* 빠른 선택 버튼 */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={preset.onClick}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* 연도/월 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 시작 월 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작 월
            </label>
            <div className="flex gap-2">
              {/* 연도 선택 */}
              <select
                value={startYear}
                onChange={handleStartYearChange}
                className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>

              {/* 월 선택 */}
              <select
                value={startMonth}
                onChange={handleStartMonthChange}
                className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}월
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 종료 월 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종료 월
            </label>
            <div className="flex gap-2">
              {/* 연도 선택 */}
              <select
                value={endYear}
                onChange={handleEndYearChange}
                className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>

              {/* 월 선택 */}
              <select
                value={endMonth}
                onChange={handleEndMonthChange}
                className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}월
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
