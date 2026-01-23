/**
 * 업데이트 변경사항 타입
 * Keep a Changelog 형식의 카테고리
 */
export type ChangeType =
  | "추가됨"
  | "변경됨"
  | "수정됨"
  | "보안"
  | "개선됨"
  | "제거됨";

/**
 * 개별 변경사항 아이템
 */
export interface ChangeItem {
  /** 변경사항 제목 */
  title: string;
  /** 상세 설명 (여러 줄 가능) */
  description: string[];
}

/**
 * 버전별 업데이트 정보
 */
export interface VersionUpdate {
  /** 버전 번호 (예: "1.16.1") */
  version: string;
  /** 릴리즈 날짜 (YYYY-MM-DD) */
  date: string;
  /** 최신 버전 여부 */
  isLatest?: boolean;
  /** 변경사항 (타입별로 그룹화) */
  changes: Partial<Record<ChangeType, ChangeItem[]>>;
}
