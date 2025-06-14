import { Category } from "./category";

export interface TeamItem {
  id: number;
  itemCode: string;
  itemName: string;
  teamId: number;
  memo: string;
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
}

export interface UpdateTeamItemDto {
  itemCode: string;
  itemName: string;
  memo?: string;
  teamId: number;
  categoryId: number | null;
}

export interface DeleteTeamItemResponse {
  id: number;
  deleted: boolean;
}
