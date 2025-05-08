import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
} from "../../api/order-api";
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  CreatOrderResponse,
} from "../../types/(order)/order";
import { ApiResponse } from "../../types/common";

// 주문 생성
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CreatOrderResponse>, Error, CreateOrderDto>({
    mutationFn: (data: CreateOrderDto) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// 주문 수정
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

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
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// 주문 상태 변경
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusDto }) =>
      updateOrderStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
};
