import { create } from "zustand";
import { persist } from "zustand/middleware";
import { subscribeToEvent, EVENTS } from "@/utils/events";

interface MenuTabState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  resetTab: () => void;
  setTabForUser: (userAccessLevel: string) => void;
}

const getDefaultTab = (userAccessLevel?: string) => {
  // supplier는 order 탭이 기본, 나머지는 stock 탭이 기본
  return userAccessLevel === "supplier" ? "order" : "stock";
};

const isValidTabForUser = (tab: string, userAccessLevel: string) => {
  if (userAccessLevel === "supplier") {
    return tab === "order";
  }
  return ["stock", "order", "admin"].includes(tab);
};

export const menuTabStore = create<MenuTabState>()(
  persist(
    (set, get) => ({
      activeTab: "stock", // 기본값

      setActiveTab: (tab: string) => {
        set({ activeTab: tab });
      },

      resetTab: () => {
        set({ activeTab: "stock" });
      },

      setTabForUser: (userAccessLevel: string) => {
        const currentTab = get().activeTab;

        // 현재 탭이 사용자 권한에 맞지 않으면 기본 탭으로 변경
        if (!isValidTabForUser(currentTab, userAccessLevel)) {
          const defaultTab = getDefaultTab(userAccessLevel);
          set({ activeTab: defaultTab });
        }
        // 현재 탭이 유효하면 유지
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

// 팀 변경 시에는 탭 상태 유지 (사용자 권한은 동일하므로)
