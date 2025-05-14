import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryPriorityDto,
} from "@/types/(item)/category";
import { ApiResponse } from "@/types/common";
import { api } from "./api";

export const categoryApi = {
  getCategories: async (teamId: number): Promise<ApiResponse<Category[]>> => {
    const response = await api.get<ApiResponse<Category[]>>(
      `/categories/team/${teamId}`
    );
    return response.data;
  },

  createCategory: async (
    category: CreateCategoryDto
  ): Promise<ApiResponse<Category>> => {
    const response = await api.post<ApiResponse<Category>>(
      "/categories",
      category
    );
    return response.data;
  },

  updateCategory: async (
    category: UpdateCategoryDto
  ): Promise<ApiResponse<Category>> => {
    const response = await api.put<ApiResponse<Category>>(
      `/categories/${category.id}`,
      category
    );
    return response.data;
  },

  updateCategoryPriority: async (
    category: UpdateCategoryPriorityDto
  ): Promise<ApiResponse<Category>> => {
    const response = await api.put<ApiResponse<Category>>(
      `/categories/${category.id}/priority`,
      category
    );
    return response.data;
  },

  deleteCategory: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await api.delete<ApiResponse<boolean>>(
      `/categories/${id}`
    );
    return response.data;
  },
};
