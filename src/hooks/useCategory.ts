import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/api/category-api";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryPriorityDto,
} from "@/types/(item)/category";
import { useCategoryStore } from "@/store/categoryStore";
import { useSelectedTeam } from "@/store/authStore";
import { useCallback } from "react";

/**
 * React Query 기반 카테고리 훅
 * 서버 상태는 React Query로, 클라이언트 상태는 Zustand로 관리
 */
export const useCategory = (teamId?: number) => {
  const queryClient = useQueryClient();
  const { selectedTeam } = useSelectedTeam();
  const effectiveTeamId = teamId || selectedTeam?.id;

  const {
    setCategories,
    addCategory,
    updateCategory: updateCategoryInStore,
    removeCategory,
    setError,
    clearError,
  } = useCategoryStore();

  // 카테고리 조회
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categories", effectiveTeamId],
    queryFn: async () => {
      if (!effectiveTeamId) {
        return [];
      }

      const response = await categoryApi.getCategories(effectiveTeamId);
      if (!response.success) {
        throw new Error(response.error || "카테고리를 불러오는데 실패했습니다");
      }

      // Zustand store에도 업데이트
      setCategories(effectiveTeamId, response.data || []);

      return response.data || [];
    },
    enabled: !!effectiveTeamId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 카테고리 생성
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: CreateCategoryDto) => {
      const response = await categoryApi.createCategory(categoryData);
      if (!response.success) {
        throw new Error(response.error || "카테고리 생성에 실패했습니다");
      }
      return response.data!;
    },
    onSuccess: (newCategory) => {
      if (effectiveTeamId) {
        // 캐시 업데이트
        queryClient.setQueryData(
          ["categories", effectiveTeamId],
          (old: Category[] = []) => [...old, newCategory]
        );

        // Zustand store 업데이트
        addCategory(effectiveTeamId, newCategory);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // 카테고리 수정
  const updateCategoryMutation = useMutation({
    mutationFn: async (categoryData: UpdateCategoryDto) => {
      const response = await categoryApi.updateCategory(categoryData);
      if (!response.success) {
        throw new Error(response.error || "카테고리 수정에 실패했습니다");
      }
      return response.data!;
    },
    onSuccess: (updatedCategory) => {
      if (effectiveTeamId) {
        // 캐시 업데이트
        queryClient.setQueryData(
          ["categories", effectiveTeamId],
          (old: Category[] = []) =>
            old.map((cat) =>
              cat.id === updatedCategory.id ? updatedCategory : cat
            )
        );

        // Zustand store 업데이트
        updateCategoryInStore(
          effectiveTeamId,
          updatedCategory.id,
          updatedCategory
        );
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // 카테고리 우선순위 수정
  const updateCategoryPriorityMutation = useMutation({
    mutationFn: async (categoryData: UpdateCategoryPriorityDto) => {
      const response = await categoryApi.updateCategoryPriority(categoryData);
      if (!response.success) {
        throw new Error(
          response.error || "카테고리 우선순위 수정에 실패했습니다"
        );
      }
      return response.data!;
    },
    onSuccess: (updatedCategory) => {
      if (effectiveTeamId) {
        // 캐시 업데이트
        queryClient.setQueryData(
          ["categories", effectiveTeamId],
          (old: Category[] = []) =>
            old.map((cat) =>
              cat.id === updatedCategory.id ? updatedCategory : cat
            )
        );

        // Zustand store 업데이트
        updateCategoryInStore(
          effectiveTeamId,
          updatedCategory.id,
          updatedCategory
        );
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // 카테고리 삭제
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await categoryApi.deleteCategory(categoryId, effectiveTeamId);
      if (!response.success) {
        throw new Error(response.error || "카테고리 삭제에 실패했습니다");
      }
      return categoryId;
    },
    onSuccess: (deletedCategoryId) => {
      if (effectiveTeamId) {
        // 캐시 업데이트
        queryClient.setQueryData(
          ["categories", effectiveTeamId],
          (old: Category[] = []) =>
            old.filter((cat) => cat.id !== deletedCategoryId)
        );

        // Zustand store 업데이트
        removeCategory(effectiveTeamId, deletedCategoryId);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // 우선순위 순으로 정렬된 카테고리 반환 - 메모이제이션 적용
  const getCategoriesSorted = useCallback(() => {
    return [...categories].sort((a, b) => a.priority - b.priority);
  }, [categories]);

  return {
    // 데이터
    categories,
    isLoading:
      isLoading ||
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      deleteCategoryMutation.isPending,
    error: error?.message || null,

    // 액션
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    updateCategoryPriority: updateCategoryPriorityMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    refetch,
    clearError,

    // 유틸리티
    getCategoriesSorted,

    // 뮤테이션 상태
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
};
