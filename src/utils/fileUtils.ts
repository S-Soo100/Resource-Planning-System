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
    // Base64 디코딩 시도 (백엔드 방식 참고)
    if (/^[A-Za-z0-9+/]*={0,2}$/.test(fileName)) {
      const decoded = atob(fileName);
      // 디코딩된 결과에 한글이 포함되어 있는지 확인
      if (/[가-힣]/.test(decoded)) {
        return decoded;
      }
    }

    // URL 디코딩 시도
    const urlDecoded = decodeURIComponent(fileName);
    if (urlDecoded !== fileName) {
      return urlDecoded;
    }

    // 추가적인 깨진 문자 패턴 처리
    let fixedName = fileName;
    const encodingFixes = [
      { pattern: /ìº¥ì¤í°ì¦/g, replacement: "한글" },
      { pattern: /áâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ/g, replacement: "" },
      { pattern: /[^\x00-\x7F가-힣\s._-]/g, replacement: "" },
    ];

    encodingFixes.forEach(({ pattern, replacement }) => {
      fixedName = fixedName.replace(pattern, replacement);
    });

    return fixedName;
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
  // 빈 파일명 처리
  if (!fileName || fileName.trim() === "") {
    return false;
  }

  // Base64로 인코딩된 파일명인지 확인
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
  // URL 인코딩된 파일명인지 확인
  const urlEncodedPattern = /%[0-9A-Fa-f]{2}/;
  // 깨진 한글 문자 패턴 확인
  const corruptedPattern = /[ìº¥ì¤í°ì¦áâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/;

  return (
    base64Pattern.test(fileName) ||
    urlEncodedPattern.test(fileName) ||
    corruptedPattern.test(fileName)
  );
};

/**
 * 파일명이 읽을 수 없는지 확인 (깨진 문자 + 특수문자만 있는 경우)
 * @param fileName 파일명
 * @returns 읽을 수 없는 파일명 여부
 */
export const isUnreadableFileName = (fileName: string): boolean => {
  // 빈 파일명 처리
  if (!fileName || fileName.trim() === "") {
    return true;
  }

  // 깨진 문자나 특수문자만 있는지 확인
  // 더 엄격한 패턴으로 변경
  const readablePattern = /[a-zA-Z0-9가-힣\s._-]/;

  // 파일명에서 읽을 수 있는 문자가 하나라도 있는지 확인
  const hasReadableChar = readablePattern.test(fileName);

  // 읽을 수 있는 문자가 없거나, 깨진 문자가 포함된 경우
  return (
    !hasReadableChar ||
    /[ìº¥ì¤í°ì¦áâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(fileName)
  );
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
 * @param fallbackName 대체할 파일명 (기본값: "unknown_file_name")
 * @returns 사용자 친화적인 파일명
 */
export const getDisplayFileName = (
  fileName: string,
  fallbackName: string = "unknown_file_name"
): string => {
  // 빈 파일명 처리
  if (!fileName || fileName.trim() === "") {
    return fallbackName;
  }

  // 한글 파일명이 깨진 경우 복원 시도
  if (isKoreanFileNameCorrupted(fileName)) {
    const restored = restoreKoreanFileName(fileName);
    if (restored !== fileName && !isUnreadableFileName(restored)) {
      return restored;
    }
  }

  // 일반적인 디코딩 시도
  const decoded = decodeFileName(fileName);

  // 디코딩된 결과가 원본과 다르고 읽을 수 있는 경우
  if (decoded !== fileName && !isUnreadableFileName(decoded)) {
    return decoded;
  }

  // 특정 깨진 문자 패턴이 포함된 경우 대체
  if (/[ìº¥ì¤í°ì¦áâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(fileName)) {
    const extension = getFileExtension(fileName);
    return `${fallbackName}${extension}`;
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
    return `unknown_file_${timestamp}_${index + 1}${extension}`;
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
  // 한글 파일명이 깨진 경우 복원 시도
  let fileName = file.name;
  if (isKoreanFileNameCorrupted(fileName)) {
    const restored = restoreKoreanFileName(fileName);
    if (restored !== fileName && !isUnreadableFileName(restored)) {
      fileName = restored;
    }
  }

  // 파일명에서 특수문자 제거 및 공백 처리
  let normalizedName = fileName
    .replace(/[^\w\s.-가-힣]/g, "") // 특수문자 제거 (하이픈, 점, 언더스코어, 한글 제외)
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
 * 한글 파일명이 깨져있는지 확인하는 함수
 * @param fileName 파일명
 * @returns 한글 파일명 깨짐 여부
 */
export const isKoreanFileNameCorrupted = (fileName: string): boolean => {
  if (!fileName || fileName.trim() === "") {
    return false;
  }

  // Base64로 인코딩된 파일명인지 확인
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
  // URL 인코딩된 파일명인지 확인
  const urlEncodedPattern = /%[0-9A-Fa-f]{2}/;
  // 깨진 한글 문자 패턴 확인
  const corruptedPattern = /[ìº¥ì¤í°ì¦áâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/;

  return (
    base64Pattern.test(fileName) ||
    urlEncodedPattern.test(fileName) ||
    corruptedPattern.test(fileName)
  );
};

/**
 * 한글 파일명을 복원하는 함수
 * @param fileName 깨진 한글 파일명
 * @returns 복원된 파일명
 */
export const restoreKoreanFileName = (fileName: string): string => {
  if (!fileName || fileName.trim() === "") {
    return fileName;
  }

  try {
    // Base64 디코딩 시도 (백엔드 방식 참고)
    if (/^[A-Za-z0-9+/]*={0,2}$/.test(fileName)) {
      const decoded = atob(fileName);
      // 디코딩된 결과에 한글이 포함되어 있는지 확인
      if (/[가-힣]/.test(decoded)) {
        return decoded;
      }
    }

    // URL 디코딩 시도
    const urlDecoded = decodeURIComponent(fileName);
    if (urlDecoded !== fileName) {
      return urlDecoded;
    }
  } catch {
    // 디코딩 실패 시 계속 진행
  }

  // 특정 깨진 패턴들을 정상적인 한글로 변환
  let restoredName = fileName;

  // 일반적인 깨진 한글 패턴들을 정상적인 한글로 변환
  const koreanFixes = [
    { pattern: /ìº¥ì¤í°ì¦/g, replacement: "한글" },
    { pattern: /áâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ/g, replacement: "" },
    { pattern: /[^\x00-\x7F가-힣\s._-]/g, replacement: "" },
  ];

  koreanFixes.forEach(({ pattern, replacement }) => {
    restoredName = restoredName.replace(pattern, replacement);
  });

  return restoredName;
};

/**
 * 한글 파일명 디코딩 테스트 함수 (개발용)
 * @param fileName 테스트할 파일명
 * @returns 디코딩 결과 정보
 */
export const testKoreanFileNameDecoding = (
  fileName: string
): {
  original: string;
  decoded: string;
  restored: string;
  display: string;
  isCorrupted: boolean;
  isKoreanCorrupted: boolean;
} => {
  return {
    original: fileName,
    decoded: decodeFileName(fileName),
    restored: restoreKoreanFileName(fileName),
    display: getDisplayFileName(fileName),
    isCorrupted: isCorruptedFileName(fileName),
    isKoreanCorrupted: isKoreanFileNameCorrupted(fileName),
  };
};

/**
 * 파일 업로드 시 한글 파일명을 안전하게 인코딩하는 함수
 * @param fileName 원본 파일명
 * @returns 인코딩된 파일명
 */
export const encodeFileName = (fileName: string): string => {
  if (!fileName || fileName.trim() === "") {
    return fileName;
  }

  try {
    // 한글이 포함된 파일명인 경우 URL 인코딩
    if (/[가-힣]/.test(fileName)) {
      return encodeURIComponent(fileName);
    }

    // 특수문자가 포함된 파일명인 경우 URL 인코딩
    if (/[^\w\s.-]/.test(fileName)) {
      return encodeURIComponent(fileName);
    }

    return fileName;
  } catch {
    return fileName;
  }
};

/**
 * 파일 업로드 시 파일명을 Base64로 인코딩하는 함수
 * @param fileName 원본 파일명
 * @returns Base64 인코딩된 파일명
 */
export const encodeFileNameBase64 = (fileName: string): string => {
  if (!fileName || fileName.trim() === "") {
    return fileName;
  }

  try {
    // 한글이 포함된 파일명인 경우 Base64 인코딩
    if (/[가-힣]/.test(fileName)) {
      return btoa(unescape(encodeURIComponent(fileName)));
    }

    return fileName;
  } catch {
    return fileName;
  }
};

/**
 * 파일 업로드 시 안전한 파일명으로 정규화하는 함수
 * @param fileName 원본 파일명
 * @returns 정규화된 파일명
 */
export const normalizeFileNameForUpload = (fileName: string): string => {
  if (!fileName || fileName.trim() === "") {
    return fileName;
  }

  // 파일명에서 특수문자 제거 및 공백 처리
  let normalizedName = fileName
    .replace(/[^\w\s.-가-힣]/g, "") // 특수문자 제거 (하이픈, 점, 언더스코어, 한글 제외)
    .replace(/\s+/g, "_") // 공백을 언더스코어로 변경
    .replace(/_{2,}/g, "_"); // 연속된 언더스코어를 하나로

  // 파일명이 비어있으면 기본값 설정
  if (!normalizedName) {
    const timestamp = Date.now();
    const extension = getFileExtension(fileName);
    normalizedName = `file_${timestamp}${extension}`;
  }

  return normalizedName;
};
