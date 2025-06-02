import { create } from "zustand";
import { subscribeToEvent, EVENTS } from "@/utils/events";
import { Category } from "@/types/(item)/category";

interface CategoryState {
  // 상태
  categories: Record<number, Category[]>; // teamId -> categories 매핑
  isLoading: boolean;
  error: string | null;

  // 액션
  setCategories: (teamId: number, categories: Category[]) => void;
  addCategory: (teamId: number, category: Category) => void;
  updateCategory: (
    teamId: number,
    categoryId: number,
    category: Category
  ) => void;
  removeCategory: (teamId: number, categoryId: number) => void;
  resetCategories: (teamId?: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // 셀렉터
  getCategoriesForTeam: (teamId: number) => Category[];
}

export const useCategoryStore = create<CategoryState>()((set, get) => {
  // 이벤트 구독 설정
  subscribeToEvent(EVENTS.DATA_RESET_ALL, () => {
    set({ categories: {}, isLoading: false, error: null });
  });

  subscribeToEvent(EVENTS.DATA_RESET_TEAM_DEPENDENT, () => {
    set({ categories: {}, isLoading: false, error: null });
  });

  subscribeToEvent(EVENTS.CATEGORY_RESET, () => {
    set({ categories: {}, isLoading: false, error: null });
  });

  return {
    // 초기 상태
    categories: {},
    isLoading: false,
    error: null,

    // 액션
    setCategories: (teamId, categories) => {
      set((state) => ({
        categories: {
          ...state.categories,
          [teamId]: categories,
        },
      }));
    },

    addCategory: (teamId, category) => {
      set((state) => ({
        categories: {
          ...state.categories,
          [teamId]: [...(state.categories[teamId] || []), category],
        },
      }));
    },

    updateCategory: (teamId, categoryId, updatedCategory) => {
      set((state) => ({
        categories: {
          ...state.categories,
          [teamId]: (state.categories[teamId] || []).map((cat) =>
            cat.id === categoryId ? updatedCategory : cat
          ),
        },
      }));
    },

    removeCategory: (teamId, categoryId) => {
      set((state) => ({
        categories: {
          ...state.categories,
          [teamId]: (state.categories[teamId] || []).filter(
            (cat) => cat.id !== categoryId
          ),
        },
      }));
    },

    resetCategories: (teamId) => {
      if (teamId) {
        set((state) => {
          const newCategories = { ...state.categories };
          delete newCategories[teamId];
          return { categories: newCategories };
        });
      } else {
        set({ categories: {} });
      }
    },

    setLoading: (loading) => {
      set({ isLoading: loading });
    },

    setError: (error) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    // 셀렉터
    getCategoriesForTeam: (teamId) => {
      return get().categories[teamId] || [];
    },
  };
});

/**
 * 카테고리 상태를 위한 경량 훅들
 */
export const useCategoryState = () => {
  const isLoading = useCategoryStore((state) => state.isLoading);
  const error = useCategoryStore((state) => state.error);

  return { isLoading, error };
};

export const useCategoriesForTeam = (teamId: number) => {
  const getCategoriesForTeam = useCategoryStore(
    (state) => state.getCategoriesForTeam
  );

  return getCategoriesForTeam(teamId);
};
