import { useQuery } from "@tanstack/react-query";
import {
  getOrdersByTeamId,
  getOrdersByUserId,
  getOrdersBySupplierId,
  getOrder,
} from "../../api/order-api";

// 30분 캐싱 설정 (밀리초 단위)
const CACHE_TIME = 30 * 60 * 1000;

// 모든 주문 조회
export const useAllOrders = (teamId: number) => {
  return useQuery({
    queryKey: ["orders", "team", teamId],
    queryFn: () => getOrdersByTeamId(teamId),
    enabled: !!teamId,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
    refetchOnReconnect: false,
  });
};

// 사용자별 주문 조회
export const useUserOrders = (userId: string) => {
  return useQuery({
    queryKey: ["orders", "user", userId],
    queryFn: () => getOrdersByUserId(userId),
    enabled: !!userId,
    staleTime: CACHE_TIME, // 30분 동안 데이터를 신선한 상태로 유지
    gcTime: CACHE_TIME, // 30분 동안 캐시 유지 (v4에서는 cacheTime 대신 gcTime 사용)
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
    refetchOnReconnect: false,
  });
};

// 납품처별 주문 조회
export const useSupplierOrders = (supplierId: string) => {
  return useQuery({
    queryKey: ["orders", "supplier", supplierId],
    queryFn: () => getOrdersBySupplierId(supplierId),
    enabled: !!supplierId,
    staleTime: CACHE_TIME, // 30분 동안 데이터를 신선한 상태로 유지
    gcTime: CACHE_TIME, // 30분 동안 캐시 유지 (v4에서는 cacheTime 대신 gcTime 사용)
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
    refetchOnReconnect: false,
  });
};

// 단일 주문 조회
export const useSingleOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
    staleTime: CACHE_TIME, // 30분 동안 데이터를 신선한 상태로 유지
    gcTime: CACHE_TIME, // 30분 동안 캐시 유지 (v4에서는 cacheTime 대신 gcTime 사용)
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
    refetchOnReconnect: false,
  });
};
