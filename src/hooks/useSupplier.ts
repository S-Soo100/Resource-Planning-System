import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supplierApi } from "@/api/supplier-api";
import {
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "@/types/(order)/supplier";
import toast from "react-hot-toast";

export function useSuppliers() {
  const queryClient = useQueryClient();

  // 모든 공급업체 조회 (이름으로 검색 가능)
  const useGetSuppliers = (name?: string) => {
    const query = useQuery({
      queryKey: ["suppliers", { name }],
      queryFn: async () => {
        const response = await supplierApi.getAllSuppliers(name);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "공급업체 목록 조회에 실패했습니다");
      },
      staleTime: 5 * 60 * 1000, // 5분
    });

    return {
      suppliers: query.data,
      ...query,
    };
  };

  // 개별 공급업체 조회
  const useGetSupplier = (id: string) => {
    const query = useQuery({
      queryKey: ["supplier", id],
      queryFn: async () => {
        const response = await supplierApi.getSupplier(id);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "공급업체 조회에 실패했습니다");
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5분
    });

    return {
      supplier: query.data,
      ...query,
    };
  };

  // 공급업체 생성 뮤테이션
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
          toast.success("공급업체가 생성되었습니다.");
        } else {
          toast.error(response.error || "공급업체 생성에 실패했습니다.");
        }
      },
    });

    return {
      createSupplier: mutation.mutate,
      createSupplierAsync: mutation.mutateAsync,
      ...mutation,
    };
  };

  // 공급업체 정보 수정 뮤테이션
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

          // 개별 공급업체 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["supplier", variables.id],
          });

          toast.success("공급업체 정보가 수정되었습니다.");
        } else {
          toast.error(response.error || "공급업체 정보 수정에 실패했습니다.");
        }
      },
    });

    return {
      updateSupplier: mutation.mutate,
      updateSupplierAsync: mutation.mutateAsync,
      ...mutation,
    };
  };

  // 공급업체 삭제 뮤테이션
  const useDeleteSupplier = () => {
    const mutation = useMutation({
      mutationFn: (id: string) => supplierApi.deleteSupplier(id),
      onSuccess: (response, id) => {
        if (response.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["suppliers"],
          });

          // 개별 공급업체 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["supplier", id],
          });

          toast.success("공급업체가 삭제되었습니다.");
        } else {
          toast.error(response.error || "공급업체 삭제에 실패했습니다.");
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
