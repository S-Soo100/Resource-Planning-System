"use client";
import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DatePickerProps {
  label?: string;
  date?: string;
  onDateChange?: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  date,
  onDateChange,
  minDate,
  maxDate,
  placeholder = "날짜를 선택하세요",
  error,
  helperText,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    date ? new Date(date) : null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 날짜 변경 핸들러
  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
    const dateString = day.toISOString().split("T")[0];
    onDateChange?.(dateString);
    setIsOpen(false);
  };

  // 이전/다음 월
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // 달력 데이터 생성
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  };

  // 빠른 선택 옵션
  const quickOptions = [
    { label: "오늘", value: "today" },
    { label: "내일", value: "tomorrow" },
    { label: "다음주 월요일", value: "next-monday" },
    { label: "다음주 금요일", value: "next-friday" },
  ];

  const handleQuickSelect = (option: string) => {
    const today = new Date();
    let selectedDay: Date;

    switch (option) {
      case "today":
        selectedDay = today;
        break;
      case "tomorrow":
        selectedDay = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "next-monday":
        const daysUntilMonday = (8 - today.getDay()) % 7;
        selectedDay = new Date(
          today.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000
        );
        break;
      case "next-friday":
        const daysUntilFriday = (5 - today.getDay() + 7) % 7;
        selectedDay = new Date(
          today.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000
        );
        break;
      default:
        return;
    }

    setSelectedDate(selectedDay);
    setCurrentMonth(
      new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1)
    );
    const dateString = selectedDay.toISOString().split("T")[0];
    onDateChange?.(dateString);
    setIsOpen(false);
  };

  const calendarDays = getCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("ko-KR")
    : "";

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex items-center justify-between flex-1 px-3 py-2 text-left bg-white border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500",
              isOpen && "ring-2 ring-blue-500 border-blue-500"
            )}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span
                className={displayValue ? "text-gray-900" : "text-gray-500"}
              >
                {displayValue || placeholder}
              </span>
            </div>
          </button>
          {displayValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDate(null);
                onDateChange?.("");
              }}
              className="px-3 py-2 text-gray-400 hover:text-gray-600 bg-white border border-l-0 border-gray-300 rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-4">
              {/* 빠른 선택 */}
              <div className="mb-4">
                <div className="mb-2 text-sm font-medium text-gray-700">
                  빠른 선택
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleQuickSelect(option.value)}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 달력 */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {currentMonth.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={goToNextMonth}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                    <div
                      key={day}
                      className="p-2 text-xs font-medium text-center text-gray-500"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth =
                      day.getMonth() === currentMonth.getMonth();
                    const isToday = day.getTime() === today.getTime();
                    const isSelected =
                      selectedDate &&
                      day.toDateString() === selectedDate.toDateString();
                    const isDisabled =
                      (minDate && day < new Date(minDate)) ||
                      (maxDate && day > new Date(maxDate)) ||
                      day < today;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !isDisabled && handleDateSelect(day)}
                        disabled={isDisabled}
                        className={cn(
                          "p-2 text-xs rounded-md transition-colors",
                          isCurrentMonth
                            ? "text-gray-900 hover:bg-blue-50"
                            : "text-gray-400",
                          isToday && "bg-blue-100 text-blue-700 font-medium",
                          isSelected &&
                            "bg-blue-500 text-white hover:bg-blue-600",
                          isDisabled && "text-gray-300 cursor-not-allowed"
                        )}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 확인 버튼 */}
              <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export { DatePicker };
