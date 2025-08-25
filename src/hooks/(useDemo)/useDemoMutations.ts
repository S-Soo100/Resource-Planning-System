import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDemo,
  updateDemoStatusById,
  updateDemoById,
  deleteDemoById,
} from "../../api/demo-api";
import {
  DemoStatus,
  CreateDemoRequest,
  PatchDemoRequest,
} from "../../types/demo/demo";
import { ApiResponse } from "../../types/common";

// 데모 상태 변경 DTO 타입
export interface UpdateDemoStatusDto {
  status: DemoStatus;
}

// 데모 생성
export const useCreateDemo = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, CreateDemoRequest>({
    mutationFn: (demoData: CreateDemoRequest) => createDemo(demoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demos"] });
    },
  });
};

// 데모 상태 변경
export const useUpdateDemoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateDemoStatusDto;
    }) => {
      const response = await updateDemoStatusById(id, { status: data.status });

      // 서버 응답이 실패인 경우 에러를 던져서 클라이언트에서 처리할 수 있도록 함
      if (!response.success) {
        throw new Error(response.message || "상태 변경에 실패했습니다.");
      }

      return response;
    },
    onSuccess: async (response, variables) => {
      if (response.success) {
        // 데모 정보 캐시 무효화
        await queryClient.invalidateQueries({ queryKey: ["demos"] });
        await queryClient.invalidateQueries({
          queryKey: ["demo", variables.id],
        });

        // 시연 출고 완료 상태로 변경된 경우 추가 데이터 refetch
        if (variables.data.status === DemoStatus.shipmentCompleted) {
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

// 시연 기록 수정
export const useUpdateDemo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchDemoRequest }) =>
      updateDemoById(id, data),
    onSuccess: async (response, variables) => {
      if (response.success) {
        // 데모 정보 캐시 무효화
        await queryClient.invalidateQueries({ queryKey: ["demos"] });
        await queryClient.invalidateQueries({
          queryKey: ["demo", variables.id],
        });
      }
    },
  });
};

// 시연 삭제
export const useDeleteDemo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDemoById(id),
    onSuccess: async (response, variables) => {
      if (response.success) {
        // 데모 정보 캐시 무효화
        await queryClient.invalidateQueries({ queryKey: ["demos"] });
        await queryClient.invalidateQueries({
          queryKey: ["demo", variables],
        });
      }
    },
  });
};
