import { Category } from "./category";

export interface TeamItem {
  id: number;
  itemCode: string;
  itemName: string;
  teamId: number;
  memo: string;
  imageUrl?: string | null; // 품목 이미지 URL (Google Cloud Storage)
  costPrice?: number | null; // 품목 원가
  category: Category;
  categoryId?: number;
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
}

export interface UpdateTeamItemDto {
  itemCode: string;
  itemName: string;
  memo?: string;
  teamId: number;
  categoryId: number | null;
  costPrice?: number; // 품목 원가 (선택)
}

export interface DeleteTeamItemResponse {
  id: number;
  deleted: boolean;
}
