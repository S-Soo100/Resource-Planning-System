// ============================================================================
// 기본 날짜 유틸리티 (기존 함수들)
// ============================================================================

/**
 * 로컬 시간대를 사용하여 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * UTC 변환으로 인한 시차 문제를 방지
 */
export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
};

/**
 * Date 객체를 로컬 시간대 기준 YYYY-MM-DD 형식으로 변환
 * UTC 변환으로 인한 시차 문제를 방지
 */
export const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dateStr = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${dateStr}`;
};

/**
 * 날짜 문자열을 Date 객체로 변환 (로컬 시간대 기준)
 */
export const parseDateString = (dateString: string): Date => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// ============================================================================
// 통합 날짜 처리 유틸리티 (새로운 함수들)
// ============================================================================

/**
 * DB/API에서 받은 날짜 문자열을 안전하게 파싱하는 함수
 * 다양한 형식을 지원하며 에러 방지 로직 포함
 */
export const safeParseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return null;
  }

  // 이미 Date 객체인 경우는 현재 함수 시그니처에서는 발생하지 않음 (string만 받음)
  // 실제 구현에서는 불필요하지만 향후 확장성을 위해 주석으로 보존

  try {
    // ISO 문자열 형식 처리 (예: "2024-01-15T00:00:00+09:00")
    if (dateString.includes('T') || dateString.includes('Z')) {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    }

    // YYYY-MM-DD 형식 처리
    const normalizedDate = dateString.replace(/[/.]/g, '-');
    const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;

    if (dateRegex.test(normalizedDate)) {
      const date = new Date(normalizedDate + 'T00:00:00');
      return isNaN(date.getTime()) ? null : date;
    }

    // 기타 형식 시도
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;

  } catch (error) {
    console.warn(`날짜 파싱 실패: ${dateString}`, error);
    return null;
  }
};

/**
 * 날짜를 표시용 형식으로 변환 (YY.MM.DD) - 로컬 시간대 기준
 * DB에서 받은 날짜 데이터를 사용자 로컬 시간대로 변환하여 표시
 */
export const formatDateForDisplay = (dateString: string | null | undefined): string => {
  const date = safeParseDate(dateString);
  if (!date) return '-';

  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

/**
 * 날짜를 표시용 형식으로 변환 (YY.MM.DD) - UTC 기준 날짜만 추출
 * DB에서 받은 UTC 시간에서 실제 생성 날짜만 표시 (시간대 변환 없이)
 */
export const formatDateForDisplayUTC = (dateString: string | null | undefined): string => {
  const date = safeParseDate(dateString);
  if (!date) return '-';

  // UTC 기준으로 날짜 부분만 추출
  const year = date.getUTCFullYear().toString().slice(-2);
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

/**
 * 날짜를 풀 포맷으로 변환 (YYYY.MM.DD) - 로컬 시간대 기준
 */
export const formatDateForDisplayFull = (dateString: string | null | undefined): string => {
  const date = safeParseDate(dateString);
  if (!date) return '-';

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

/**
 * 날짜를 풀 포맷으로 변환 (YYYY.MM.DD) - UTC 기준 날짜만 추출
 */
export const formatDateForDisplayFullUTC = (dateString: string | null | undefined): string => {
  const date = safeParseDate(dateString);
  if (!date) return '-';

  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

/**
 * 날짜를 서버 전송용 ISO 문자열로 변환
 * KST 시간대 기준으로 처리
 */
export const formatDateForServer = (dateString: string | null | undefined): string | undefined => {
  if (!dateString || dateString.trim() === '') return undefined;

  // 다양한 날짜 형식을 YYYY-MM-DD로 정규화
  const normalizedDate = dateString.replace(/[/.]/g, '-');

  // YYYY-MM-DD 형식 검증
  const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
  if (!dateRegex.test(normalizedDate)) {
    console.warn(`유효하지 않은 날짜 형식: ${dateString}`);
    return undefined;
  }

  // Date 객체로 유효성 검증
  const testDate = new Date(normalizedDate + 'T00:00:00');
  if (isNaN(testDate.getTime())) {
    console.warn(`유효하지 않은 날짜: ${dateString}`);
    return undefined;
  }

  return normalizedDate;
};

/**
 * 기존 데이터와의 호환성을 위한 날짜 정규화
 * DB에서 로드한 날짜를 표시용으로 변환
 */
export const normalizeDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString || dateString.trim() === '') return '';

  // ISO 문자열인 경우 (예: "2024-01-15T00:00:00+09:00")
  if (dateString.includes('T')) {
    const datePart = dateString.split('T')[0];
    const testDate = new Date(datePart);
    if (isNaN(testDate.getTime())) {
      console.warn(`유효하지 않은 ISO 날짜: ${dateString}`);
      return '';
    }
    return datePart;
  }

  // 다른 형식의 날짜를 YYYY-MM-DD로 정규화
  const normalizedDate = dateString.replace(/[/.]/g, '-');
  const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;

  if (!dateRegex.test(normalizedDate)) {
    console.warn(`날짜 형식이 올바르지 않습니다: ${dateString}`);
    return '';
  }

  // Date 객체로 유효성 검증
  const testDate = new Date(normalizedDate);
  if (isNaN(testDate.getTime())) {
    console.warn(`유효하지 않은 날짜: ${dateString}`);
    return '';
  }

  return normalizedDate;
};

// ============================================================================
// 시간 처리 유틸리티 (기존 함수들 개선)
// ============================================================================

/**
 * UTC+9 시간대로 시간을 변환하는 함수
 * 입력된 시간이 UTC+9인지 확인하고, 필요시 변환
 */
export const convertToUTC9 = (timeString: string): string => {
  if (!timeString || timeString.trim() === "") return timeString;

  // 시간 형식 검증 (HH:MM 또는 H:MM)
  const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(timeString)) {
    // 형식이 맞지 않아도 변환 시도 (예: "9:30" -> "09:30")
    const parts = timeString.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);

      if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        timeString = formattedTime;
      } else {
        return timeString; // 변환 불가능한 경우 원본 반환
      }
    } else {
      return timeString; // 변환 불가능한 경우 원본 반환
    }
  }

  // 현재 시간대와 UTC+9의 차이 계산
  const now = new Date();
  const utcOffset = now.getTimezoneOffset(); // 현재 시간대 오프셋 (분)
  const koreaOffset = -9 * 60; // UTC+9 오프셋 (분)
  const offsetDiff = utcOffset - koreaOffset; // 분 단위 차이

  // 시간을 분으로 변환
  const [hours, minutes] = timeString.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;

  // UTC+9로 변환
  totalMinutes += offsetDiff;

  // 24시간 범위로 정규화
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  // HH:MM 형식으로 변환
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

/**
 * UTC+9 시간을 현재 시간대로 변환하는 함수
 */
export const convertFromUTC9 = (timeString: string): string => {
  if (!timeString) return timeString;

  // 시간 형식 검증 (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(timeString)) {
    return timeString;
  }

  // 현재 시간대와 UTC+9의 차이 계산
  const now = new Date();
  const utcOffset = now.getTimezoneOffset(); // 현재 시간대 오프셋 (분)
  const koreaOffset = -9 * 60; // UTC+9 오프셋 (분)
  const offsetDiff = utcOffset - koreaOffset; // 분 단위 차이

  // 시간을 분으로 변환
  const [hours, minutes] = timeString.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;

  // 현재 시간대로 변환
  totalMinutes -= offsetDiff;

  // 24시간 범위로 정규화
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  // HH:MM 형식으로 변환
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

/**
 * 기존 데이터와의 호환성을 위한 시간 정규화
 * DB에서 로드한 시간을 표시용으로 변환
 */
export const normalizeTimeForDisplay = (timeString: string | null | undefined): string => {
  if (!timeString || timeString.trim() === '') return '';

  // 이미 UTC+9 형식인지 확인 (예: "09:30+09:00" 또는 "09:30Z")
  if (timeString.includes('+09:00') || timeString.includes('Z')) {
    const timePart = timeString.split(/[+Z]/)[0];
    return timePart;
  }

  // 일반 HH:MM 형식이면 그대로 반환
  const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  if (timeRegex.test(timeString)) {
    return timeString;
  }

  // 변환 불가능한 경우 원본 반환
  console.warn(`시간 형식을 인식할 수 없습니다: ${timeString}`);
  return timeString;
};

/**
 * 댓글이나 생성 시간을 상대적으로 표시하는 함수
 */
export const formatRelativeTime = (dateString: string | null | undefined): string => {
  const date = safeParseDate(dateString);
  if (!date) return '-';

  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`;

  // 일주일 이상은 절대 날짜로 표시
  return formatDateForDisplay(dateString);
};

// ============================================================================
// 날짜 검증 유틸리티
// ============================================================================

/**
 * 날짜 문자열이 유효한지 검증
 */
export const isValidDateString = (dateString: string | null | undefined): boolean => {
  return safeParseDate(dateString) !== null;
};

/**
 * 두 날짜를 비교 (date1이 date2보다 이후면 true)
 */
export const isDateAfter = (date1: string | null | undefined, date2: string | null | undefined): boolean => {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);

  if (!d1 || !d2) return false;
  return d1.getTime() > d2.getTime();
};

/**
 * 날짜가 오늘인지 확인
 */
export const isToday = (dateString: string | null | undefined): boolean => {
  const date = safeParseDate(dateString);
  if (!date) return false;

  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// ============================================================================
// 백워드 호환성을 위한 레거시 함수들
// ============================================================================

/**
 * @deprecated formatDateForDisplay 사용을 권장
 * 기존 코드와의 호환성을 위해 유지
 */
export const formatDate = formatDateForDisplay;

/**
 * @deprecated formatDateForServer 사용을 권장
 * 기존 코드와의 호환성을 위해 유지
 */
export const toKSTDateString = formatDateForServer;
