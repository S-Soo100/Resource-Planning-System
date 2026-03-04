"use client";

import React from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface MonthRangePickerProps {
  startDate: string; // YYYY-MM-DD 형식
  endDate: string; // YYYY-MM-DD 형식
  onStartDateChange: (date: string) => void; // YYYY-MM-DD 형식
  onEndDateChange: (date: string) => void; // YYYY-MM-DD 형식
  onRangeChange?: (startDate: string, endDate: string) => void; // 원자적 날짜 범위 변경
  className?: string;
}

export function MonthRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
  className = "",
}: MonthRangePickerProps) {
  // YYYY-MM-DD → { year, month } 변환
  const parseDate = (dateString: string): { year: number; month: number } => {
    if (!dateString) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() + 1 };
    }
    const [year, month] = dateString.split("-").map(Number);
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
    return format(startOfMonth(date), "yyyy-MM-dd");
  };

  // 연도/월 → YYYY-MM-DD (월의 마지막날)
  const toEndDateString = (year: number, month: number): string => {
    const date = new Date(year, month - 1, 1);
    return format(endOfMonth(date), "yyyy-MM-dd");
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

  // 빠른 선택 프리셋 계산
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  const presets = [
    {
      label: "이번 달",
      startYear: thisYear,
      startMonth: thisMonth,
      endYear: thisYear,
      endMonth: thisMonth,
    },
    {
      label: "최근 3개월",
      startYear: new Date(thisYear, thisMonth - 3, 1).getFullYear(),
      startMonth: new Date(thisYear, thisMonth - 3, 1).getMonth() + 1,
      endYear: thisYear,
      endMonth: thisMonth,
    },
    {
      label: "최근 6개월",
      startYear: new Date(thisYear, thisMonth - 6, 1).getFullYear(),
      startMonth: new Date(thisYear, thisMonth - 6, 1).getMonth() + 1,
      endYear: thisYear,
      endMonth: thisMonth,
    },
    {
      label: "올해",
      startYear: thisYear,
      startMonth: 1,
      endYear: thisYear,
      endMonth: thisMonth,
    },
    {
      label: "작년",
      startYear: thisYear - 1,
      startMonth: 1,
      endYear: thisYear - 1,
      endMonth: 12,
    },
  ];

  // preset 활성 상태 확인
  const isPresetActive = (preset: (typeof presets)[number]): boolean => {
    const presetStart = toStartDateString(preset.startYear, preset.startMonth);
    const presetEnd = toEndDateString(preset.endYear, preset.endMonth);
    return startDate === presetStart && endDate === presetEnd;
  };

  // 빠른 선택 핸들러 (onRangeChange 우선 사용으로 stale closure 방지)
  const handlePresetClick = (preset: (typeof presets)[number]) => {
    const newStart = toStartDateString(preset.startYear, preset.startMonth);
    const newEnd = toEndDateString(preset.endYear, preset.endMonth);

    if (onRangeChange) {
      onRangeChange(newStart, newEnd);
    } else {
      onStartDateChange(newStart);
      onEndDateChange(newEnd);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* 빠른 선택 버튼 */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => {
            const active = isPresetActive(preset);
            return (
              <button
                key={index}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors ${
                  active
                    ? "bg-blue-600 text-white border border-blue-600"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-500"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
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
