export interface Category {
  id: number;
  name: string;
  priority: number;
  teamId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  priority: number;
  teamId: number;
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
