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
