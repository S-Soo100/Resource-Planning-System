import { Category } from "./category";

export interface TeamItem {
  id: number;
  itemCode: string;
  itemName: string;
  teamId: number;
  memo: string;
  category: Category;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateTeamItemDto {
  itemCode: string;
  itemName: string;
  memo?: string;
  teamId: number;
  categoryId: number;
}

export interface DeleteTeamItemResponse {
  id: number;
  deleted: boolean;
}
