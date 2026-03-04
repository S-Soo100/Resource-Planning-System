import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { subscribeToEvent, EVENTS } from "@/utils/events";

// 기본 날짜: 이번 달
const getDefaultStartDate = () =>
  format(startOfMonth(new Date()), "yyyy-MM-dd");
const getDefaultEndDate = () => format(endOfMonth(new Date()), "yyyy-MM-dd");

// ─── 판매 필터 Store ───

interface SalesFilterState {
  startDate: string;
  endDate: string;
  searchQuery: string;
  showMissingPriceOnly: boolean;
  depositFilter: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setSearchQuery: (query: string) => void;
  setShowMissingPriceOnly: (value: boolean) => void;
  setDepositFilter: (value: string) => void;
  reset: () => void;
}

export const useSalesFilterStore = create<SalesFilterState>()(
  persist(
    (set) => ({
      startDate: getDefaultStartDate(),
      endDate: getDefaultEndDate(),
      searchQuery: "",
      showMissingPriceOnly: false,
      depositFilter: "all",

      setStartDate: (date) => set({ startDate: date }),
      setEndDate: (date) => set({ endDate: date }),
      setDateRange: (startDate, endDate) => set({ startDate, endDate }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setShowMissingPriceOnly: (value) => set({ showMissingPriceOnly: value }),
      setDepositFilter: (value) => set({ depositFilter: value }),

      reset: () =>
        set({
          startDate: getDefaultStartDate(),
          endDate: getDefaultEndDate(),
          searchQuery: "",
          showMissingPriceOnly: false,
          depositFilter: "all",
        }),
    }),
    {
      name: "sales-filter-storage",
      // 날짜만 localStorage에 보존, 검색어/체크박스는 비보존
      partialize: (state) => ({
        startDate: state.startDate,
        endDate: state.endDate,
      }),
    }
  )
);

// ─── 구매 필터 Store ───

interface PurchaseFilterState {
  startDate: string;
  endDate: string;
  searchQuery: string;
  showMissingCostOnly: boolean;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setSearchQuery: (query: string) => void;
  setShowMissingCostOnly: (value: boolean) => void;
  reset: () => void;
}

export const usePurchaseFilterStore = create<PurchaseFilterState>()(
  persist(
    (set) => ({
      startDate: getDefaultStartDate(),
      endDate: getDefaultEndDate(),
      searchQuery: "",
      showMissingCostOnly: false,

      setStartDate: (date) => set({ startDate: date }),
      setEndDate: (date) => set({ endDate: date }),
      setDateRange: (startDate, endDate) => set({ startDate, endDate }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setShowMissingCostOnly: (value) => set({ showMissingCostOnly: value }),

      reset: () =>
        set({
          startDate: getDefaultStartDate(),
          endDate: getDefaultEndDate(),
          searchQuery: "",
          showMissingCostOnly: false,
        }),
    }),
    {
      name: "purchase-filter-storage",
      partialize: (state) => ({
        startDate: state.startDate,
        endDate: state.endDate,
      }),
    }
  )
);

// ─── 로그아웃 시 필터 초기화 ───

subscribeToEvent(EVENTS.AUTH_LOGOUT, () => {
  useSalesFilterStore.getState().reset();
  usePurchaseFilterStore.getState().reset();
});
