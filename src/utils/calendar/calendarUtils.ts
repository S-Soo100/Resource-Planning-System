import { WeekInfo } from '@/types/calendar/calendar';

/**
 * 주어진 날짜의 주 정보를 반환합니다
 * @param date 기준 날짜
 * @returns WeekInfo 객체
 */
export function getWeekInfo(date: Date): WeekInfo {
  const year = date.getFullYear();

  // 해당 주의 월요일 구하기
  const dayOfWeek = date.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일까지의 차이
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  // 해당 주의 일요일 구하기
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // 주차 계산 (연도의 첫 번째 월요일 기준)
  const yearStart = new Date(year, 0, 1);
  const firstMonday = new Date(yearStart);
  const firstDayOfWeek = yearStart.getDay();
  const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek;
  firstMonday.setDate(yearStart.getDate() + daysToFirstMonday);

  const weekNumber = Math.ceil(((monday.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);

  // 월~일 7일 배열 생성
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }

  const weekKey = `${year}-${weekNumber.toString().padStart(2, '0')}`;

  return {
    year,
    weekNumber,
    weekKey,
    startDate: monday,
    endDate: sunday,
    days,
  };
}

/**
 * 이전 주의 WeekInfo를 반환합니다
 * @param currentWeekInfo 현재 주 정보
 * @returns 이전 주의 WeekInfo
 */
export function getPreviousWeek(currentWeekInfo: WeekInfo): WeekInfo {
  const previousWeekDate = new Date(currentWeekInfo.startDate);
  previousWeekDate.setDate(previousWeekDate.getDate() - 7);
  return getWeekInfo(previousWeekDate);
}

/**
 * 다음 주의 WeekInfo를 반환합니다
 * @param currentWeekInfo 현재 주 정보
 * @returns 다음 주의 WeekInfo
 */
export function getNextWeek(currentWeekInfo: WeekInfo): WeekInfo {
  const nextWeekDate = new Date(currentWeekInfo.startDate);
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  return getWeekInfo(nextWeekDate);
}

/**
 * 날짜를 YYYY-MM-DD 형식 문자열로 변환합니다
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식 문자열
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 형식 문자열을 Date 객체로 변환합니다
 * @param dateString YYYY-MM-DD 형식 문자열
 * @returns Date 객체
 */
export function parseStringToDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month는 0부터 시작
}

/**
 * 주어진 날짜가 오늘인지 확인합니다
 * @param date 확인할 날짜
 * @returns 오늘이면 true, 아니면 false
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * 주어진 날짜가 주말(토, 일)인지 확인합니다
 * @param date 확인할 날짜
 * @returns 주말이면 true, 아니면 false
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 일요일(0) 또는 토요일(6)
}

/**
 * 월 이름을 반환합니다
 * @param monthIndex 월 인덱스 (0-11)
 * @returns 월 이름
 */
export function getMonthName(monthIndex: number): string {
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  return monthNames[monthIndex];
}

/**
 * 요일 이름을 반환합니다
 * @param dayIndex 요일 인덱스 (0: 일요일, 1: 월요일, ...)
 * @returns 요일 이름
 */
export function getDayName(dayIndex: number): string {
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return dayNames[dayIndex];
}

/**
 * 주 제목을 생성합니다 (예: "25년 9월 16일~22일" 또는 "25년 9월 29일~10월 5일")
 * @param weekInfo 주 정보
 * @returns 주 제목 문자열
 */
export function getWeekTitle(weekInfo: WeekInfo): string {
  const year = weekInfo.year.toString().slice(-2); // 뒤 2자리만
  const startMonth = weekInfo.startDate.getMonth() + 1;
  const endMonth = weekInfo.endDate.getMonth() + 1;
  const startDate = weekInfo.startDate.getDate();
  const endDate = weekInfo.endDate.getDate();

  // 시작일과 종료일이 같은 월인 경우
  if (startMonth === endMonth) {
    return `${year}년 ${startMonth}월 ${startDate}일~${endDate}일`;
  }
  // 월이 넘어가는 경우
  else {
    return `${year}년 ${startMonth}월 ${startDate}일~${endMonth}월 ${endDate}일`;
  }
}

/**
 * 로컬스토리지용 주별 메모 키를 생성합니다
 * @param weekKey 주 키 (YYYY-WW)
 * @returns 로컬스토리지 키
 */
export function getWeeklyMemoStorageKey(weekKey: string): string {
  return `kars-weekly-memo-${weekKey}`;
}

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅합니다
 * @param dateString ISO 날짜 문자열 (예: "2025-10-02T00:00:00.000Z")
 * @param timeString 시간 문자열 (예: "17:00")
 * @param deliveryMethod 배송방법 (예: "직접 배송")
 * @returns 한국어 형식 문자열 (예: "2025년 10월 2일 17시00분 (직접 배송)")
 */
export function formatDateTimeToKorean(dateString: string, timeString?: string, deliveryMethod?: string): string {
  if (!dateString) return '';

  try {
    // ISO 날짜에서 날짜 부분만 추출 (T 이전)
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);

    let result = `${year}년 ${month}월 ${day}일`;

    // 시간이 있는 경우 추가
    if (timeString && timeString.trim()) {
      const [hour, minute] = timeString.split(':').map(Number);
      result += ` ${hour}시${minute.toString().padStart(2, '0')}분`;
    }

    // 배송방법이 있는 경우 괄호로 추가
    if (deliveryMethod && deliveryMethod.trim()) {
      result += ` (${deliveryMethod})`;
    }

    return result;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return dateString;
  }
}

/**
 * 날짜만 한국어 형식으로 포맷팅합니다
 * @param dateString ISO 날짜 문자열 (예: "2025-10-02T00:00:00.000Z")
 * @returns 한국어 형식 문자열 (예: "2025년 10월 2일")
 */
export function formatDateToKorean(dateString: string): string {
  return formatDateTimeToKorean(dateString);
}