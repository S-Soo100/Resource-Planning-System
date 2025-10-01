import { DemoSpanInfo } from '@/types/calendar/calendar';
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