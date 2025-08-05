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
