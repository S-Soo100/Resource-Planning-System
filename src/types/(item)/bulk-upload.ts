import { CreateTeamItemDto } from "./team-item";

export type RowStatus =
  | "ready"
  | "category_unmatched"
  | "duplicate"
  | "invalid"
  | "skipped"
  | "success"
  | "failed";

export interface BulkUploadRow {
  index: number; // 엑셀 행 번호
  status: RowStatus;
  raw: Record<string, string>; // 엑셀 원본 데이터
  mapped: Partial<CreateTeamItemDto>; // 매핑된 DTO
  generatedItemCode: string; // 자동생성된 품목코드
  categoryMatch: {
    excelValue: string; // 엑셀의 카테고리 문자열
    matchedCategoryId: number | null;
    matchedCategoryName: string | null;
  };
  isDuplicate: boolean; // 기존 품목과 중복 여부
  userAction?: "register" | "skip"; // 중복 시 사용자 선택
  error?: string; // 실패 사유
}

export interface BulkUploadResult {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  details: BulkUploadRow[];
}
