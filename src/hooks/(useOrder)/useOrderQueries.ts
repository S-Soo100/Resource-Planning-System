import { useQuery } from "@tanstack/react-query";
import {
  getAllOrders,
  getOrdersByUserId,
  getOrdersBySupplierId,
  getOrder,
} from "../../api/order-api";

// 모든 주문 조회
export const useAllOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => getAllOrders(),
  });
};

// 사용자별 주문 조회
export const useUserOrders = (userId: string) => {
  return useQuery({
    queryKey: ["orders", "user", userId],
    queryFn: () => getOrdersByUserId(userId),
    enabled: !!userId,
  });
};

// 공급업체별 주문 조회
export const useSupplierOrders = (supplierId: string) => {
  return useQuery({
    queryKey: ["orders", "supplier", supplierId],
    queryFn: () => getOrdersBySupplierId(supplierId),
    enabled: !!supplierId,
  });
};

// 단일 주문 조회
export const useSingleOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });
};
