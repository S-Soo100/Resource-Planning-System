import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authStore } from "./authStore";

interface MenuState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  resetActiveTab: () => void;
}

export const menuStore = create<MenuState>()(
  persist(
    (set) => ({
      // 기본값은 'stock'으로 설정
      activeTab: "stock",

      // 활성 탭 설정 액션
      setActiveTab: (tab: string) => set({ activeTab: tab }),

      // 활성 탭 초기화 액션
      resetActiveTab: () => set({ activeTab: "stock" }),
    }),
    {
      name: "menu-storage", // 로컬 스토리지에 저장될 키 이름
    }
  )
);

// 커스텀 훅으로 menuStore 사용
export const useMenuStore = () => {
  const store = menuStore();

  return {
    activeTab: store.activeTab,
    setActiveTab: store.setActiveTab,
    resetActiveTab: store.resetActiveTab,
  };
};

// authStore의 기존 logout 함수를 확장하여 메뉴도 초기화하도록 함
const originalLogout = authStore.getState().logout;
authStore.getState().logout = () => {
  // 원래 로그아웃 함수 실행
  originalLogout();
  // 메뉴 초기화
  menuStore.getState().resetActiveTab();
};
