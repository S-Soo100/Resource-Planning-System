import { useQuery } from "@tanstack/react-query";
import { useCurrentTeam } from "./useCurrentTeam";
import { supplierApi } from "@/api/supplier-api";
import { getOrdersBySupplierId } from "@/api/order-api";
import { Supplier } from "@/types/supplier";
import { Order } from "@/types/(order)/order";

/**
 * 팀 고객(Supplier) 목록 조회 훅 (v3.1 - E-006)
 * 기존 N+1 쿼리(teamUserMap → 개별 User fetch) 제거,
 * supplierApi.getAllSuppliersByTeamId() 단일 호출로 변경
 */
export const useTeamCustomers = () => {
  const { team, isLoading: isTeamLoading } = useCurrentTeam();

  const {
    data: customers = [],
    isLoading: isCustomersLoading,
    error,
  } = useQuery<Supplier[]>({
    queryKey: ["teamCustomers", team?.id],
    queryFn: async () => {
      if (!team?.id) return [];
      const response = await supplierApi.getAllSuppliersByTeamId(team.id);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    enabled: !!team?.id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    customers,
    isLoading: isTeamLoading || isCustomersLoading,
    error,
  };
};

/**
 * 고객(Supplier)별 발주 이력 조회 훅 (v3.1 - E-006)
 * supplierId 기반으로 변경
 */
export const useCustomerOrders = (supplierId: number | undefined) => {
  return useQuery<Order[]>({
    queryKey: ["customerOrders", supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      const response = await getOrdersBySupplierId(supplierId.toString());
      if (response.success && response.data) {
        return response.data as Order[];
      }
      return [];
    },
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000,
  });
};
