/**
 * 파일명 인코딩 관련 유틸리티 함수들
 */

/**
 * 깨진 파일명을 정상적으로 표시하기 위한 디코딩 함수
 * @param fileName 깨진 파일명
 * @returns 정상적인 파일명
 */
export const decodeFileName = (fileName: string): string => {
  try {
    // URL 디코딩 시도
    const decoded = decodeURIComponent(fileName);
    return decoded;
  } catch {
    try {
      // Base64 디코딩 시도
      const decoded = atob(fileName);
      return decoded;
    } catch {
      // 모든 디코딩이 실패하면 원본 반환
      return fileName;
    }
  }
};

/**
 * 파일명에서 확장자 추출
 * @param fileName 파일명
 * @returns 확장자 (예: .pdf, .jpg)
 */
export const getFileExtension = (fileName: string): string => {
  const decodedName = decodeFileName(fileName);
  const lastDotIndex = decodedName.lastIndexOf(".");
  return lastDotIndex !== -1 ? decodedName.slice(lastDotIndex) : "";
};

/**
 * 파일명에서 확장자 제외한 이름 추출
 * @param fileName 파일명
 * @returns 확장자 제외한 파일명
 */
export const getFileNameWithoutExtension = (fileName: string): string => {
  const decodedName = decodeFileName(fileName);
  const lastDotIndex = decodedName.lastIndexOf(".");
  return lastDotIndex !== -1 ? decodedName.slice(0, lastDotIndex) : decodedName;
};

/**
 * 파일 크기를 읽기 쉬운 형태로 포맷팅
 * @param bytes 바이트 단위 크기
 * @returns 포맷팅된 파일 크기 (예: 1.5 MB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * 파일 타입에 따른 아이콘 클래스 반환
 * @param fileName 파일명
 * @returns 아이콘 클래스명
 */
export const getFileIconClass = (fileName: string): string => {
  const extension = getFileExtension(fileName).toLowerCase();

  switch (extension) {
    case ".pdf":
      return "text-red-500";
    case ".doc":
    case ".docx":
      return "text-blue-500";
    case ".xls":
    case ".xlsx":
      return "text-green-500";
    case ".ppt":
    case ".pptx":
      return "text-orange-500";
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
    case ".bmp":
      return "text-purple-500";
    case ".txt":
      return "text-gray-500";
    default:
      return "text-gray-400";
  }
};

/**
 * 파일명이 깨져있는지 확인
 * @param fileName 파일명
 * @returns 깨진 파일명 여부
 */
export const isCorruptedFileName = (fileName: string): boolean => {
  // 깨진 파일명 패턴 확인 (예: á³áµá«á£áº 같은 문자들)
  const corruptedPattern = /[áâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/;
  return corruptedPattern.test(fileName);
};

/**
 * 파일명이 읽을 수 없는지 확인 (깨진 문자 + 특수문자만 있는 경우)
 * @param fileName 파일명
 * @returns 읽을 수 없는 파일명 여부
 */
export const isUnreadableFileName = (fileName: string): boolean => {
  // 깨진 문자나 특수문자만 있는지 확인
  const readablePattern = /[a-zA-Z0-9가-힣\s.-]/;
  return !readablePattern.test(fileName);
};

/**
 * 파일명을 안전하게 표시하는 함수
 * @param fileName 원본 파일명
 * @returns 안전하게 표시할 파일명
 */
export const getSafeFileName = (fileName: string): string => {
  // 깨진 파일명인 경우 디코딩 시도
  if (isCorruptedFileName(fileName)) {
    const decoded = decodeFileName(fileName);
    if (decoded !== fileName) {
      return decoded;
    }
  }

  // 디코딩이 실패하면 원본 반환
  return fileName;
};

/**
 * 파일명을 사용자 친화적으로 표시하는 함수 (깨진 파일명 대체)
 * @param fileName 원본 파일명
 * @param fallbackName 대체할 파일명 (기본값: "알 수 없는 파일")
 * @returns 사용자 친화적인 파일명
 */
export const getDisplayFileName = (
  fileName: string,
  fallbackName: string = "알 수 없는 파일"
): string => {
  // 깨진 파일명인 경우 디코딩 시도
  if (isCorruptedFileName(fileName)) {
    const decoded = decodeFileName(fileName);
    if (decoded !== fileName && !isUnreadableFileName(decoded)) {
      return decoded;
    }
  }

  // 읽을 수 없는 파일명인 경우 대체 이름 사용
  if (isUnreadableFileName(fileName)) {
    const extension = getFileExtension(fileName);
    return `${fallbackName}${extension}`;
  }

  // 정상적인 파일명인 경우 원본 반환
  return fileName;
};

/**
 * 파일명을 완전히 대체하는 함수 (깨진 파일명을 숨김)
 * @param fileName 원본 파일명
 * @param index 파일 인덱스 (기본값: 0)
 * @returns 대체된 파일명
 */
export const getReplacedFileName = (
  fileName: string,
  index: number = 0
): string => {
  // 깨진 파일명인 경우 디코딩 시도
  if (isCorruptedFileName(fileName)) {
    const decoded = decodeFileName(fileName);
    if (decoded !== fileName && !isUnreadableFileName(decoded)) {
      return decoded;
    }
  }

  // 읽을 수 없거나 깨진 파일명인 경우 완전히 대체
  if (isUnreadableFileName(fileName) || isCorruptedFileName(fileName)) {
    const extension = getFileExtension(fileName);
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `파일_${timestamp}_${index + 1}${extension}`;
  }

  // 정상적인 파일명인 경우 원본 반환
  return fileName;
};

/**
 * 파일 업로드 시 파일명 정규화
 * @param file File 객체
 * @returns 정규화된 파일명
 */
export const normalizeFileName = (file: File): string => {
  // 파일명에서 특수문자 제거 및 공백 처리
  let normalizedName = file.name
    .replace(/[^\w\s.-]/g, "") // 특수문자 제거 (하이픈, 점, 언더스코어 제외)
    .replace(/\s+/g, "_") // 공백을 언더스코어로 변경
    .replace(/_{2,}/g, "_"); // 연속된 언더스코어를 하나로

  // 파일명이 비어있으면 기본값 설정
  if (!normalizedName) {
    const timestamp = Date.now();
    const extension = getFileExtension(file.name);
    normalizedName = `file_${timestamp}${extension}`;
  }

  return normalizedName;
};
