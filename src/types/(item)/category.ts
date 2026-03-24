export interface Category {
  id: number;
  name: string;
  priority: number;
  teamId: number;
  createdAt: string;
  updatedAt: string;
  // 계층형 카테고리 (v4.0)
  parentId?: number | null; // 부모 카테고리 ID
  children?: Category[]; // 자식 카테고리 목록
}

export interface CreateCategoryDto {
  name: string;
  priority: number;
  teamId: number;
  parentId?: number; // 부모 카테고리 ID (v4.0)
}

export interface UpdateCategoryDto {
  id: number;
  name: string;
  priority: number;
  teamId: number;
}

export interface UpdateCategoryPriorityDto {
  id: number;
  priority: number;
  teamId: number;
}
