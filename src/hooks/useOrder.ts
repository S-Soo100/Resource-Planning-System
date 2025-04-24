import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllOrders,
  getOrdersByUserId,
  getOrdersBySupplierId,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
} from "../api/order-api";
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../types/(order)/order";

export const useOrder = () => {
  const queryClient = useQueryClient();

  // 모든 주문 조회
  const useAllOrders = () => {
    return useQuery({
      queryKey: ["orders"],
      queryFn: () => getAllOrders(),
    });
  };

  // 사용자별 주문 조회
  const useUserOrders = (userId: string) => {
    return useQuery({
      queryKey: ["orders", "user", userId],
      queryFn: () => getOrdersByUserId(userId),
      enabled: !!userId,
    });
  };

  // 공급업체별 주문 조회
  const useSupplierOrders = (supplierId: string) => {
    return useQuery({
      queryKey: ["orders", "supplier", supplierId],
      queryFn: () => getOrdersBySupplierId(supplierId),
      enabled: !!supplierId,
    });
  };

  // 단일 주문 조회
  const useSingleOrder = (orderId: string) => {
    return useQuery({
      queryKey: ["order", orderId],
      queryFn: () => getOrder(orderId),
      enabled: !!orderId,
    });
  };

  // 주문 생성
  const useCreateOrder = () => {
    return useMutation({
      mutationFn: (data: CreateOrderDto) => createOrder(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
    });
  };

  // 주문 수정
  const useUpdateOrder = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
        updateOrder(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      },
    });
  };

  // 주문 삭제
  const useDeleteOrder = () => {
    return useMutation({
      mutationFn: (id: string) => deleteOrder(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
    });
  };

  // 주문 상태 변경
  const useUpdateOrderStatus = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusDto }) =>
        updateOrderStatus(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      },
    });
  };

  return {
    useAllOrders,
    useUserOrders,
    useSupplierOrders,
    useSingleOrder,
    useCreateOrder,
    useUpdateOrder,
    useDeleteOrder,
    useUpdateOrderStatus,
  };
};
