import { Category } from "./category";

export interface TeamItem {
  id: number;
  itemCode: string;
  itemName: string;
  teamId: number;
  memo: string;
  imageUrl?: string | null; // 품목 이미지 URL (Google Cloud Storage)
  costPrice?: number | null; // 품목 원가 (견적/참고 원가)
  category: Category;
  categoryId?: number;
  // 팀품목 확장 필드 (v4.0)
  isNotifiedPrice: boolean; // 고시가격 여부 (기본 false)
  notifiedPrice?: number | null; // 고시가격 (건보 공시 금액)
  consumerPrice?: number | null; // 소비자가격 (VAT 포함 금액)
  brand?: string | null; // 브랜드
  isHealthInsuranceRegistered: boolean; // 건강보험 등록 여부 (기본 false)
  isService: boolean; // 서비스 품목 여부 (기본 false)
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateTeamItemDto {
  itemCode: string;
  itemName: string;
  memo?: string;
  teamId: number;
  categoryId: number | null;
  costPrice?: number; // 품목 원가 (선택)
  // 팀품목 확장 필드 (v4.0)
  isNotifiedPrice?: boolean;
  notifiedPrice?: number;
  consumerPrice?: number;
  brand?: string;
  isHealthInsuranceRegistered?: boolean;
  isService?: boolean;
}

export interface UpdateTeamItemDto {
  itemCode: string;
  itemName: string;
  memo?: string;
  teamId: number;
  categoryId: number | null;
  costPrice?: number; // 품목 원가 (선택)
  // 팀품목 확장 필드 (v4.0)
  isNotifiedPrice?: boolean;
  notifiedPrice?: number;
  consumerPrice?: number;
  brand?: string;
  isHealthInsuranceRegistered?: boolean;
  isService?: boolean;
}

export interface DeleteTeamItemResponse {
  id: number;
  deleted: boolean;
}
