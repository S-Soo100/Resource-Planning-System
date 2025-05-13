import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supplierApi } from "@/api/supplier-api";
import { CreateSupplierRequest, UpdateSupplierRequest } from "@/types/supplier";
import toast from "react-hot-toast";
import { authStore } from "@/store/authStore";

export function useSuppliers() {
  const queryClient = useQueryClient();
  const selectedTeam = authStore((state) => state.selectedTeam);
  const selectedTeamId = selectedTeam?.id;

  // 모든 거래처 조회 (이름으로 검색 가능)
  const useGetSuppliers = (name?: string) => {
    const query = useQuery({
      queryKey: ["suppliers", { name, teamId: selectedTeamId }],
      queryFn: async () => {
        if (!selectedTeamId) {
          return [];
        }
        const response = await supplierApi.getAllSuppliersByTeamId(
          selectedTeamId,
          name
        );
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "거래처 목록 조회에 실패했습니다");
      },
      enabled: !!selectedTeamId,
      staleTime: 5 * 60 * 1000, // 5분
    });

    return {
      suppliers: query.data,
      ...query,
    };
  };

  // 개별 거래처 조회
  const useGetSupplier = (id: string) => {
    const query = useQuery({
      queryKey: ["supplier", id],
      queryFn: async () => {
        const response = await supplierApi.getSupplier(id);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "거래처 조회에 실패했습니다");
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5분
    });

    return {
      supplier: query.data,
      ...query,
    };
  };

  // 거래처 생성 뮤테이션
  const useCreateSupplier = () => {
    const mutation = useMutation({
      mutationFn: (data: CreateSupplierRequest) =>
        supplierApi.createSupplier(data),
      onSuccess: (response) => {
        if (response.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["suppliers"],
          });
          toast.success("거래처가 생성되었습니다.");
        } else {
          toast.error(response.error || "거래처 생성에 실패했습니다.");
        }
      },
    });

    return {
      createSupplier: mutation.mutate,
      createSupplierAsync: mutation.mutateAsync,
      ...mutation,
    };
  };

  // 거래처 정보 수정 뮤테이션
  const useUpdateSupplier = () => {
    const mutation = useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateSupplierRequest }) =>
        supplierApi.updateSupplier(id, data),
      onSuccess: (response, variables) => {
        if (response.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["suppliers"],
          });

          // 개별 거래처 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["supplier", variables.id],
          });

          toast.success("거래처 정보가 수정되었습니다.");
        } else {
          toast.error(response.error || "거래처 정보 수정에 실패했습니다.");
        }
      },
    });

    return {
      updateSupplier: mutation.mutate,
      updateSupplierAsync: mutation.mutateAsync,
      ...mutation,
    };
  };

  // 거래처 삭제 뮤테이션
  const useDeleteSupplier = () => {
    const mutation = useMutation({
      mutationFn: (id: string) => supplierApi.deleteSupplier(id),
      onSuccess: (response, id) => {
        if (response.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["suppliers"],
          });

          // 개별 거래처 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["supplier", id],
          });

          toast.success("거래처가 삭제되었습니다.");
        } else {
          toast.error(response.error || "거래처 삭제에 실패했습니다.");
        }
      },
    });

    return {
      deleteSupplier: mutation.mutate,
      deleteSupplierAsync: mutation.mutateAsync,
      ...mutation,
    };
  };

  return {
    useGetSuppliers,
    useGetSupplier,
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier,
  };
}
