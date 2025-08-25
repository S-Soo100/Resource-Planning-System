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
import { OrderStatus } from "../../types/(order)/order";

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
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderStatusDto }) => {
      const response = await updateOrderStatus(id, data);
      
      // 서버 응답이 실패인 경우 에러를 던져서 클라이언트에서 처리할 수 있도록 함
      if (!response.success) {
        throw new Error(response.message || "상태 변경에 실패했습니다.");
      }
      
      return response;
    },
    onSuccess: async (response, variables) => {
      if (response.success) {
        // 주문 정보 캐시 무효화
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        await queryClient.invalidateQueries({
          queryKey: ["order", variables.id],
        });

        // 출고 완료 상태로 변경된 경우 추가 데이터 refetch
        if (variables.data.status === OrderStatus.shipmentCompleted) {
          // 1. 재고 정보 최신화
          await queryClient.invalidateQueries({ queryKey: ["inventory"] });
          // 2. 입/출고 정보 최신화
          await queryClient.invalidateQueries({ queryKey: ["shipments"] });
          // 3. 창고 아이템 정보 최신화
          await queryClient.invalidateQueries({ queryKey: ["warehouseItems"] });
        }
      }
    },
    onError: (error) => {
      // 에러가 발생해도 여기서는 처리하지 않고, 컴포넌트에서 처리하도록 함
      console.error("상태 변경 에러:", error);
    },
  });
};
