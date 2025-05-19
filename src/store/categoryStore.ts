import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryPriorityDto,
} from "@/types/(item)/category";
import { categoryApi } from "@/api/category-api";
import { authStore } from "@/store/authStore";

interface CategoryState {
  // 상태
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // 마지막으로 데이터를 가져온 시간
  isInitialized: boolean; // 초기 로딩 여부

  // 액션
  fetchCategories: (teamId?: number) => Promise<void>;
  createCategory: (category: CreateCategoryDto) => Promise<Category | null>;
  updateCategory: (category: UpdateCategoryDto) => Promise<Category | null>;
  updateCategoryPriority: (
    category: UpdateCategoryPriorityDto
  ) => Promise<Category | null>;
  deleteCategory: (id: number) => Promise<boolean>;
  resetCategories: () => void; // 카테고리 상태 초기화

  // 내부 액션
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      categories: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      isInitialized: false,

      // 액션
      fetchCategories: async (teamId?: number) => {
        const state = get();

        // 이미 로딩 중이면 중복 요청 방지
        if (state.isLoading) {
          console.log("이미 카테고리 로딩 중, 중복 요청 방지");
          return;
        }

        // 캐시 유효성 검사 (5분)
        const CACHE_DURATION = 5 * 60 * 1000; // 5분
        const now = Date.now();
        if (
          state.lastFetched &&
          now - state.lastFetched < CACHE_DURATION &&
          state.categories.length > 0
        ) {
          console.log("캐시된 카테고리 데이터 사용");
          return;
        }

        set({ isLoading: true, error: null });
        try {
          // teamId가 제공되지 않은 경우 authStore에서 선택된 팀 ID 사용
          const selectedTeam = authStore.getState().selectedTeam;
          const effectiveTeamId = teamId || selectedTeam?.id;

          if (!effectiveTeamId) {
            set({ error: "팀 ID가 제공되지 않았습니다.", isLoading: false });
            console.error("카테고리 로드 실패: 팀 ID가 제공되지 않음");
            return;
          }

          console.log(`카테고리 데이터 요청 시작 - 팀 ID: ${effectiveTeamId}`);
          const response = await categoryApi.getCategories(effectiveTeamId);

          if (response.success && response.data) {
            console.log(
              `카테고리 데이터 로드 성공 - 항목 수: ${response.data.length}`
            );
            set({
              categories: response.data,
              lastFetched: now,
              isInitialized: true,
            });
          } else {
            const errorMsg =
              response.error || "카테고리를 불러오는데 실패했습니다.";
            console.error(`카테고리 로드 실패: ${errorMsg}`);
            set({ error: errorMsg });
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "알 수 없는 오류";
          console.error(`카테고리 로드 중 예외 발생: ${errorMsg}`, error);
          set({ error: "카테고리를 불러오는 중 오류가 발생했습니다." });
        } finally {
          set({ isLoading: false });
        }
      },

      createCategory: async (category: CreateCategoryDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await categoryApi.createCategory(category);
          if (response.success && response.data) {
            set((state) => ({
              categories: [...state.categories, response.data!],
            }));
            return response.data;
          } else {
            set({ error: response.error || "카테고리 생성에 실패했습니다." });
            return null;
          }
        } catch (error) {
          set({ error: "카테고리 생성 중 오류가 발생했습니다." });
          console.error("카테고리 생성 오류:", error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCategory: async (category: UpdateCategoryDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await categoryApi.updateCategory(category);
          if (response.success && response.data) {
            set((state) => ({
              categories: state.categories.map((cat) =>
                cat.id === response.data!.id ? response.data! : cat
              ),
            }));
            return response.data;
          } else {
            set({ error: response.error || "카테고리 수정에 실패했습니다." });
            return null;
          }
        } catch (error) {
          set({ error: "카테고리 수정 중 오류가 발생했습니다." });
          console.error("카테고리 수정 오류:", error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCategoryPriority: async (category: UpdateCategoryPriorityDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await categoryApi.updateCategoryPriority(category);
          if (response.success && response.data) {
            set((state) => ({
              categories: state.categories.map((cat) =>
                cat.id === response.data!.id ? response.data! : cat
              ),
            }));
            return response.data;
          } else {
            set({
              error: response.error || "카테고리 우선순위 수정에 실패했습니다.",
            });
            return null;
          }
        } catch (error) {
          set({ error: "카테고리 우선순위 수정 중 오류가 발생했습니다." });
          console.error("카테고리 우선순위 수정 오류:", error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCategory: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await categoryApi.deleteCategory(id);
          if (response.success && response.data) {
            set((state) => ({
              categories: state.categories.filter((cat) => cat.id !== id),
            }));
            return true;
          } else {
            set({ error: response.error || "카테고리 삭제에 실패했습니다." });
            return false;
          }
        } catch (error) {
          set({ error: "카테고리 삭제 중 오류가 발생했습니다." });
          console.error("카테고리 삭제 오류:", error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // 카테고리 상태 초기화
      resetCategories: () => {
        set({
          categories: [],
          isLoading: false,
          error: null,
          lastFetched: null,
          isInitialized: false,
        });
      },

      // 내부 액션
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: "category-storage",
      partialize: (state) => ({
        categories: state.categories,
        lastFetched: state.lastFetched,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
