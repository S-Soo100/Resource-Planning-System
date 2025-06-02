import { create } from "zustand";
import { persist } from "zustand/middleware";
import { subscribeToEvent, EVENTS } from "@/utils/events";

interface MenuTabState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  resetTab: () => void;
}

const getDefaultTab = (userAccessLevel?: string) => {
  // supplier는 order 탭이 기본, 나머지는 stock 탭이 기본
  return userAccessLevel === "supplier" ? "order" : "stock";
};

export const menuTabStore = create<MenuTabState>()(
  persist(
    (set) => ({
      activeTab: "stock", // 기본값

      setActiveTab: (tab: string) => {
        set({ activeTab: tab });
      },

      resetTab: () => {
        set({ activeTab: "stock" });
      },
    }),
    {
      name: "menu-tab-storage",
      // localStorage에 저장
    }
  )
);

// 로그아웃 시 탭 상태 초기화
subscribeToEvent(EVENTS.AUTH_LOGOUT, () => {
  menuTabStore.getState().resetTab();
});

// 로그인 시 사용자 권한에 따른 기본 탭 설정
subscribeToEvent(EVENTS.AUTH_LOGIN, (data) => {
  const defaultTab = getDefaultTab(data.userId?.toString()); // 임시로 userId 사용
  menuTabStore.getState().setActiveTab(defaultTab);
});
