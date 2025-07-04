import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDemo, updateDemoStatusById } from "../../api/demo-api";
import { DemoStatus } from "../../types/demo/demo";
import { ApiResponse } from "../../types/common";

// 데모 상태 변경 DTO 타입
export interface UpdateDemoStatusDto {
  status: DemoStatus;
}

// 데모 생성
export const useCreateDemo = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, void>({
    mutationFn: () => createDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demos"] });
    },
  });
};

// 데모 상태 변경
export const useUpdateDemoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDemoStatusDto }) =>
      updateDemoStatusById(id, { status: data.status }),
    onSuccess: async (response, variables) => {
      if (response.success) {
        // 데모 정보 캐시 무효화
        await queryClient.invalidateQueries({ queryKey: ["demos"] });
        await queryClient.invalidateQueries({
          queryKey: ["demo", variables.id],
        });

        // 시연 출고 완료 상태로 변경된 경우 추가 데이터 refetch
        if (variables.data.status === DemoStatus.demoShipmentCompleted) {
          // 1. 재고 정보 최신화
          await queryClient.invalidateQueries({ queryKey: ["inventory"] });
          // 2. 입/출고 정보 최신화
          await queryClient.invalidateQueries({ queryKey: ["shipments"] });
          // 3. 창고 아이템 정보 최신화
          await queryClient.invalidateQueries({ queryKey: ["warehouseItems"] });
        }
      }
    },
  });
};
