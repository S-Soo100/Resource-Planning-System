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
    // URL 디코딩 시도 (백엔드 요청에 맞춰 간단하게)
    const urlDecoded = decodeURIComponent(fileName);
    if (urlDecoded !== fileName) {
      return urlDecoded;
    }
    return fileName;
  } catch {
    return fileName;
  }
};

/**
 * 파일명에서 확장자 추출
 * @param fileName 파일명
 * @returns 확장자 (예: .pdf, .jpg)
 */
export const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";
};

/**
 * 파일명에서 확장자 제외한 이름 추출
 * @param fileName 파일명
 * @returns 확장자 제외한 파일명
 */
export const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
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
 * 파일명이 깨져있는지 확인 (백엔드 요청에 맞춰 간단한 버전)
 * @param fileName 파일명
 * @returns 깨진 파일명 여부
 */
export const isCorruptedFileName = (fileName: string): boolean => {
  // 빈 파일명 처리
  if (!fileName || fileName.trim() === "") {
    return false;
  }

  // URL 인코딩된 파일명인지 확인 (백엔드 요청에 맞춰 간단하게)
  const urlEncodedPattern = /%[0-9A-Fa-f]{2}/;
  return urlEncodedPattern.test(fileName);
};

/**
 * 파일명이 읽을 수 없는지 확인 (백엔드 요청에 맞춰 간단한 버전)
 * @param fileName 파일명
 * @returns 읽을 수 없는 파일명 여부
 */
export const isUnreadableFileName = (fileName: string): boolean => {
  // 빈 파일명 처리
  if (!fileName || fileName.trim() === "") {
    return true;
  }

  // URL 인코딩된 파일명인지 확인 (백엔드 요청에 맞춰 간단하게)
  const urlEncodedPattern = /%[0-9A-Fa-f]{2}/;
  return urlEncodedPattern.test(fileName);
};

/**
 * 안전한 파일명 표시 (백엔드 요청에 맞춰 수정)
 * @param fileName 원본 파일명
 * @returns 안전하게 표시할 파일명
 */
export const getSafeFileName = (fileName: string): string => {
  if (isCorruptedFileName(fileName)) {
    const decoded = decodeFileName(fileName);
    if (decoded !== fileName) {
      return decoded;
    }
  }
  return fileName;
};

/**
 * 파일명을 사용자 친화적으로 표시하는 함수 (백엔드 요청에 맞춰 수정)
 * @param fileName 원본 파일명
 * @param fallbackName 대체할 파일명 (기본값: "unknown_file_name")
 * @returns 사용자 친화적인 파일명
 */
export const getDisplayFileName = (
  fileName: string,
  fallbackName: string = "unknown_file_name"
): string => {
  console.log("[파일 표시] 원본 파일명:", fileName);

  // 빈 파일명 처리
  if (!fileName || fileName.trim() === "") {
    console.log("[파일 표시] 빈 파일명 처리:", fallbackName);
    return fallbackName;
  }

  // 백엔드 요청에 맞춰 간단한 디코딩 시도
  if (isCorruptedFileName(fileName)) {
    console.log("[파일 표시] 깨진 파일명 감지:", fileName);
    const decoded = decodeFileName(fileName);
    console.log("[파일 표시] 디코딩 결과:", {
      original: fileName,
      decoded: decoded,
      isChanged: decoded !== fileName,
    });
    if (decoded !== fileName) {
      console.log("[파일 표시] 디코딩 성공:", decoded);
      return decoded;
    }
  }

  // 정상적인 파일명인 경우 원본 반환
  console.log("[파일 표시] 정상 파일명 유지:", fileName);
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
    return `unknown_file_${timestamp}_${index + 1}${extension}`;
  }

  // 정상적인 파일명인 경우 원본 반환
  return fileName;
};

/**
 * 파일 업로드 시 파일명 정규화 (백엔드 요청에 맞춰 수정)
 * @param file File 객체
 * @returns 정규화된 파일명
 */
export const normalizeFileName = (file: File): string => {
  // 한글 파일명이 깨진 경우 복원 시도
  let fileName = file.name;
  if (isCorruptedFileName(fileName)) {
    const restored = decodeFileName(fileName);
    if (restored !== fileName) {
      fileName = restored;
    }
  }

  // 백엔드 요청에 맞춰 위험한 특수문자만 제거
  let normalizedName = fileName
    .replace(/[<>:"/\\|?*]/g, "") // 위험한 특수문자만 제거
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

/**
 * 파일명 디코딩 테스트 함수 (백엔드 요청에 맞춰 수정)
 * @param fileName 테스트할 파일명
 * @returns 디코딩 결과 정보
 */
export const testFileNameDecoding = (
  fileName: string
): {
  original: string;
  decoded: string;
  safe: string;
  display: string;
  isCorrupted: boolean;
} => {
  console.log("[테스트] 파일명 디코딩 테스트 시작:", fileName);

  const result = {
    original: fileName,
    decoded: decodeFileName(fileName),
    safe: getSafeFileName(fileName),
    display: getDisplayFileName(fileName),
    isCorrupted: isCorruptedFileName(fileName),
  };

  console.log("[테스트] 파일명 디코딩 테스트 결과:", result);

  return result;
};
