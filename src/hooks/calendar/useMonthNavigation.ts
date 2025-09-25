import { useState, useCallback } from 'react';
import { MonthInfo } from '@/types/calendar/calendar';
import { getMonthInfo, getPreviousMonth, getNextMonth } from '@/utils/calendar/calendarUtils';

/**
 * 월 네비게이션을 관리하는 훅
 */
export function useMonthNavigation(initialDate?: Date) {
  const [currentMonth, setCurrentMonth] = useState<MonthInfo>(() =>
    getMonthInfo(initialDate || new Date())
  );

  // 이전 달로 이동
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prevMonth => getPreviousMonth(prevMonth));
  }, []);

  // 다음 달로 이동
  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => getNextMonth(prevMonth));
  }, []);

  // 특정 날짜가 포함된 달로 이동
  const goToMonth = useCallback((date: Date) => {
    setCurrentMonth(getMonthInfo(date));
  }, []);

  // 오늘이 포함된 달로 이동
  const goToToday = useCallback(() => {
    setCurrentMonth(getMonthInfo(new Date()));
  }, []);

  // 현재 달이 오늘이 포함된 달인지 확인
  const isCurrentMonth = useCallback(() => {
    const today = new Date();
    const todayMonth = getMonthInfo(today);
    return currentMonth.monthKey === todayMonth.monthKey;
  }, [currentMonth.monthKey]);

  return {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToMonth,
    goToToday,
    isCurrentMonth: isCurrentMonth(),
  };
}