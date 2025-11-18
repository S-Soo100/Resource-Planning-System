import { DemoSpanInfo, EventSpanInfo } from '@/types/calendar/calendar';
import { formatDateToString, parseStringToDate } from './calendarUtils';

/**
 * 시연의 총 기간(일수)을 계산합니다
 * @param startDateString 시연 시작일 (YYYY-MM-DD 또는 ISO 형식)
 * @param endDateString 시연 종료일 (YYYY-MM-DD 또는 ISO 형식)
 * @returns 총 기간 (일수) - 시작일과 종료일을 포함한 일수
 */
export function calculateDemoTotalDays(startDateString: string, endDateString: string): number {
  if (!startDateString || !endDateString) return 1;

  try {
    // ISO 형식인 경우 날짜 부분만 추출
    const startDateStr = startDateString.split('T')[0];
    const endDateStr = endDateString.split('T')[0];

    const startDate = parseStringToDate(startDateStr);
    const endDate = parseStringToDate(endDateStr);

    // 시작일과 종료일의 차이를 계산 (밀리초 단위)
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // 시작일과 종료일을 포함한 일수 (최소 1일)
    const totalDays = Math.max(diffDays + 1, 1);

    return totalDays;
  } catch (error) {
    console.error('시연 기간 계산 오류:', error);
    return 1;
  }
}

/**
 * 특정 날짜가 시연 기간의 몇 번째 날인지 계산합니다
 * @param currentDateString 현재 날짜 (YYYY-MM-DD 형식)
 * @param startDateString 시연 시작일
 * @param endDateString 시연 종료일
 * @returns 날짜 인덱스 (0부터 시작, 범위를 벗어나면 -1)
 */
export function calculateDemoDateIndex(
  currentDateString: string,
  startDateString: string,
  endDateString: string
): number {
  if (!currentDateString || !startDateString || !endDateString) return -1;

  try {
    // ISO 형식인 경우 날짜 부분만 추출
    const currentDateStr = currentDateString.split('T')[0];
    const startDateStr = startDateString.split('T')[0];
    const endDateStr = endDateString.split('T')[0];

    const currentDate = parseStringToDate(currentDateStr);
    const startDate = parseStringToDate(startDateStr);
    const endDate = parseStringToDate(endDateStr);

    // 현재 날짜가 시연 기간에 포함되는지 확인
    if (currentDate < startDate || currentDate > endDate) {
      return -1;
    }

    // 시작일로부터 몇 번째 날인지 계산
    const diffTime = currentDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error('시연 날짜 인덱스 계산 오류:', error);
    return -1;
  }
}

/**
 * 시연 기간 정보를 계산합니다
 * @param currentDateString 현재 날짜 (YYYY-MM-DD 형식)
 * @param startDateString 시연 시작일
 * @param endDateString 시연 종료일
 * @returns DemoSpanInfo 객체
 */
export function calculateDemoSpanInfo(
  currentDateString: string,
  startDateString: string,
  endDateString: string
): DemoSpanInfo | null {
  const totalDays = calculateDemoTotalDays(startDateString, endDateString);
  const dayIndex = calculateDemoDateIndex(currentDateString, startDateString, endDateString);

  // 현재 날짜가 시연 기간에 포함되지 않으면 null 반환
  if (dayIndex === -1) {
    return null;
  }

  const isStart = dayIndex === 0;
  const isEnd = dayIndex === totalDays - 1;
  const isMiddle = !isStart && !isEnd;

  return {
    totalDays,
    dayIndex,
    isStart,
    isEnd,
    isMiddle,
  };
}

/**
 * 시연 기간 표시 텍스트를 생성합니다
 * @param spanInfo 시연 기간 정보
 * @param demoTitle 시연 제목
 * @returns 표시할 텍스트
 */
export function getDemoSpanDisplayText(spanInfo: DemoSpanInfo, demoTitle: string): string {
  if (spanInfo.totalDays === 1) {
    // 1일짜리 시연인 경우 기존과 동일
    return demoTitle;
  }

  if (spanInfo.isStart) {
    return `📅 시연 시작 (${spanInfo.totalDays}일간)`;
  }

  if (spanInfo.isEnd) {
    return `✅ 시연 완료`;
  }

  if (spanInfo.isMiddle) {
    return `🔄 시연 진행중 (${spanInfo.dayIndex + 1}/${spanInfo.totalDays}일차)`;
  }

  return demoTitle;
}

/**
 * 시연 기간에 포함되는 모든 날짜를 배열로 반환합니다
 * @param startDateString 시연 시작일
 * @param endDateString 시연 종료일
 * @returns 날짜 문자열 배열 (YYYY-MM-DD 형식)
 */
export function getDemoSpanDates(startDateString: string, endDateString: string): string[] {
  if (!startDateString || !endDateString) return [];

  try {
    // ISO 형식인 경우 날짜 부분만 추출
    const startDateStr = startDateString.split('T')[0];
    const endDateStr = endDateString.split('T')[0];

    const startDate = parseStringToDate(startDateStr);
    const endDate = parseStringToDate(endDateStr);
    const dates: string[] = [];

    // 시작일부터 종료일까지 반복
    const currentDate = new Date(startDate);
    while (currentDate.getTime() <= endDate.getTime()) {
      const dateStr = formatDateToString(currentDate);
      dates.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  } catch (error) {
    console.error('시연 기간 날짜 배열 생성 오류:', error);
    return [];
  }
}

/**
 * 시연 이벤트가 여러 날짜에 걸치는지 확인합니다
 * @param startDateString 시연 시작일
 * @param endDateString 시연 종료일
 * @returns 여러 날짜에 걸치면 true, 아니면 false
 */
export function isDemoMultipleDays(startDateString: string, endDateString: string): boolean {
  const totalDays = calculateDemoTotalDays(startDateString, endDateString);
  return totalDays > 1;
}

/**
 * 행사가 여러 날에 걸치는지 확인합니다
 * @param startDateString 행사 시작일
 * @param endDateString 행사 종료일
 * @returns 여러 날에 걸치면 true, 하루 이내면 false
 */
export function isEventMultipleDays(
  startDateString?: string | null,
  endDateString?: string | null
): boolean {
  if (!startDateString || !endDateString) return false;
  const totalDays = calculateDemoTotalDays(startDateString, endDateString);
  return totalDays > 1;
}

/**
 * 특정 날짜에 대한 행사 기간 정보를 계산합니다
 * @param currentDateString 현재 날짜
 * @param eventStartDate 행사 시작일
 * @param eventEndDate 행사 종료일
 * @param demoStartDate 시연 시작일 (물품 상차)
 * @param demoEndDate 시연 종료일 (물품 하차)
 * @returns 행사 기간 정보 또는 null
 */
export function calculateEventSpanInfo(
  currentDateString: string,
  eventStartDate?: string | null,
  eventEndDate?: string | null,
  demoStartDate?: string,
  demoEndDate?: string
): EventSpanInfo | null {
  // 행사 날짜가 없으면 null 반환
  if (!eventStartDate) return null;

  const currentDate = parseStringToDate(currentDateString.split('T')[0]);
  const eventStart = parseStringToDate(eventStartDate.split('T')[0]);
  const eventEnd = eventEndDate ? parseStringToDate(eventEndDate.split('T')[0]) : eventStart;

  // 행사 기간 계산
  const totalDays = calculateDemoTotalDays(eventStartDate, eventEndDate || eventStartDate);
  const dayIndex = calculateDemoDateIndex(currentDateString, eventStartDate, eventEndDate || eventStartDate);

  // 현재 날짜가 행사 기간 내에 있는지 확인
  const isWithinEvent = currentDate >= eventStart && currentDate <= eventEnd;

  // 시연 기간과의 관계 확인
  let isBeforeEvent = false;
  let isAfterEvent = false;

  if (demoStartDate && demoEndDate) {
    const demoStart = parseStringToDate(demoStartDate.split('T')[0]);
    const demoEnd = parseStringToDate(demoEndDate.split('T')[0]);

    // 현재 날짜가 시연 기간 내에 있으면서 행사 전/후인지 확인
    if (currentDate >= demoStart && currentDate < eventStart) {
      isBeforeEvent = true;
    } else if (currentDate > eventEnd && currentDate <= demoEnd) {
      isAfterEvent = true;
    }
  }

  // 행사 기간 내에 있거나 준비/철수 기간인 경우에만 정보 반환
  if (!isWithinEvent && !isBeforeEvent && !isAfterEvent) {
    return null;
  }

  return {
    totalDays,
    dayIndex: isWithinEvent ? dayIndex : -1,
    isStart: currentDate.getTime() === eventStart.getTime(),
    isEnd: currentDate.getTime() === eventEnd.getTime(),
    isMiddle: isWithinEvent && currentDate > eventStart && currentDate < eventEnd,
    isBeforeEvent,
    isAfterEvent
  };
}

/**
 * 행사가 진행되는 모든 날짜를 가져옵니다
 * @param eventStartDate 행사 시작일
 * @param eventEndDate 행사 종료일
 * @returns 행사 날짜 배열 (YYYY-MM-DD 형식)
 */
export function getEventSpanDates(
  eventStartDate?: string | null,
  eventEndDate?: string | null
): string[] {
  if (!eventStartDate) return [];

  const startDate = parseStringToDate(eventStartDate.split('T')[0]);
  const endDate = eventEndDate ? parseStringToDate(eventEndDate.split('T')[0]) : startDate;

  const dates: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(formatDateToString(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}