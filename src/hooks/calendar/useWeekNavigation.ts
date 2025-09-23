import { useState, useCallback } from 'react';
import { WeekInfo } from '@/types/calendar/calendar';
import { getWeekInfo, getPreviousWeek, getNextWeek } from '@/utils/calendar/calendarUtils';

/**
 * 주 네비게이션을 관리하는 훅
 */
export function useWeekNavigation(initialDate?: Date) {
  const [currentWeek, setCurrentWeek] = useState<WeekInfo>(() =>
    getWeekInfo(initialDate || new Date())
  );

  // 이전 주로 이동
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeek(prevWeek => getPreviousWeek(prevWeek));
  }, []);

  // 다음 주로 이동
  const goToNextWeek = useCallback(() => {
    setCurrentWeek(prevWeek => getNextWeek(prevWeek));
  }, []);

  // 특정 날짜가 포함된 주로 이동
  const goToWeek = useCallback((date: Date) => {
    setCurrentWeek(getWeekInfo(date));
  }, []);

  // 오늘이 포함된 주로 이동
  const goToToday = useCallback(() => {
    setCurrentWeek(getWeekInfo(new Date()));
  }, []);

  // 현재 주가 오늘이 포함된 주인지 확인
  const isCurrentWeek = useCallback(() => {
    const today = new Date();
    const todayWeek = getWeekInfo(today);
    return currentWeek.weekKey === todayWeek.weekKey;
  }, [currentWeek.weekKey]);

  return {
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToWeek,
    goToToday,
    isCurrentWeek: isCurrentWeek(),
  };
}