// src/hooks/useItemMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateItemQuantity } from "@/api/item-api";
import { UpdateItemQuantityRequest } from "@/types/item";

export function useItemMutation() {
  const queryClient = useQueryClient();

  const updateQuantityMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateItemQuantityRequest;
    }) => updateItemQuantity(id, data),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (data, variables) => {
      // 특정 창고의 아이템 쿼리 캐시를 무효화
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["items"] });
        // 또는 특정 창고만 무효화: queryClient.invalidateQueries({ queryKey: ['items', warehouseId] });
      }
    },
  });

  return {
    updateQuantityMutation,
  };
}
