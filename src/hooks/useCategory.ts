import { useEffect } from "react";
import { useCategoryStore } from "@/store/categoryStore";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryPriorityDto,
} from "@/types/(item)/category";
import { authStore } from "@/store/authStore";

export const useCategory = (teamId?: number) => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    updateCategoryPriority,
    deleteCategory,
  } = useCategoryStore();

  // 선택된 팀 정보 가져오기
  const selectedTeam = authStore((state) => state.selectedTeam);
  const effectiveTeamId = teamId || selectedTeam?.id;

  // 컴포넌트 마운트 시 카테고리 데이터 로드
  useEffect(() => {
    if (effectiveTeamId) {
      fetchCategories(effectiveTeamId);
    }
  }, [fetchCategories, effectiveTeamId]);

  return {
    // 상태
    categories,
    isLoading,
    error,

    // 액션
    fetchCategories: (id?: number) => fetchCategories(id || effectiveTeamId),
    createCategory: (categoryData: CreateCategoryDto) =>
      createCategory(categoryData),
    updateCategory: (categoryData: UpdateCategoryDto) =>
      updateCategory(categoryData),
    updateCategoryPriority: (categoryData: UpdateCategoryPriorityDto) =>
      updateCategoryPriority(categoryData),
    deleteCategory: (id: number) => deleteCategory(id),

    // 유틸리티 함수
    getCategoryById: (id: number) =>
      categories.find((category) => category.id === id),
    getCategoriesSorted: () =>
      [...categories].sort((a, b) => a.priority - b.priority),
  };
};
