import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCurrentTeam } from "./useCurrentTeam";
import { userApi } from "@/api/user-api";
import { getOrdersByUserId } from "@/api/order-api";
import { IUser } from "@/types/(auth)/user";
import { Order } from "@/types/(order)/order";

/**
 * 팀 고객 목록 조회 훅
 * teamData.teamUserMap에서 사용자 ID 목록을 가져온 후
 * 각 사용자의 상세 정보를 병렬로 fetch
 */
export const useTeamCustomers = () => {
  const { team, isLoading: isTeamLoading } = useCurrentTeam();

  const userIds = useMemo(
    () =>
      team?.teamUserMap
        ?.filter((m) => m.accessLevel !== "supplier")
        .map((m) => m.userId) ?? [],
    [team?.teamUserMap]
  );

  const {
    data: customers = [],
    isLoading: isCustomersLoading,
    error,
  } = useQuery<IUser[]>({
    queryKey: ["teamCustomers", team?.id, userIds],
    queryFn: async () => {
      const results = await Promise.all(
        userIds.map(async (userId) => {
          const response = await userApi.getUser(userId.toString());
          if (response.success && response.data) {
            return response.data;
          }
          return null;
        })
      );
      return results.filter((u): u is IUser => u !== null);
    },
    enabled: !!team?.id && userIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    customers,
    isLoading: isTeamLoading || isCustomersLoading,
    error,
  };
};

/**
 * 고객별 발주 이력 조회 훅
 */
export const useCustomerOrders = (userId: number | undefined) => {
  return useQuery<Order[]>({
    queryKey: ["customerOrders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await getOrdersByUserId(userId.toString());
      if (response.success && response.data) {
        return response.data as Order[];
      }
      return [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};
