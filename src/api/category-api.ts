import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryPriorityDto,
} from "@/types/(item)/category";
import { ApiResponse } from "@/types/common";
import { api } from "./api";
import axios from "axios";

export const categoryApi = {
  getCategories: async (teamId: number): Promise<ApiResponse<Category[]>> => {
    try {
      const response = await api.get<ApiResponse<Category[]>>(
        `/category/team/${teamId}`
      );
      return response.data;
    } catch (error: unknown) {
      // 카테고리가 없는 경우 (404) 빈 배열 반환
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: true,
          data: [],
        };
      }
      throw error;
    }
  },

  createCategory: async (
    category: CreateCategoryDto
  ): Promise<ApiResponse<Category>> => {
    const response = await api.post<ApiResponse<Category>>(
      "/category",
      category
    );
    return response.data;
  },

  updateCategory: async (
    category: UpdateCategoryDto
  ): Promise<ApiResponse<Category>> => {
    const response = await api.patch<ApiResponse<Category>>(
      `/category/${category.id.toString()}`,
      {
        name: category.name,
        // priority: category.priority,
      }
    );
    return response.data;
  },

  updateCategoryPriority: async (
    category: UpdateCategoryPriorityDto
  ): Promise<ApiResponse<Category>> => {
    const response = await api.patch<ApiResponse<Category>>(
      `/category/${category.id.toString()}/priority?teamId=${category.teamId.toString()}`,
      { priority: category.priority }
    );
    return response.data;
  },

  deleteCategory: async (id: number, teamId?: number): Promise<ApiResponse<boolean>> => {
    const url = teamId
      ? `/category/${id.toString()}?teamId=${teamId.toString()}`
      : `/category/${id.toString()}`;
    const response = await api.delete<ApiResponse<boolean>>(url);
    return response.data;
  },
};
