/**
 * 변경 이력 조회 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/api';
import type {
  ChangeHistoryResponse,
  ChangeHistoryParams,
} from '@/types/change-history';

/**
 * Order 변경 이력 조회
 * @param orderId Order ID
 * @param params 조회 파라미터 (page, limit, action)
 * @param enabled 쿼리 활성화 여부 (기본: true)
 */
export const useOrderChangeHistory = (
  orderId: number,
  params: ChangeHistoryParams = {},
  enabled: boolean = true
) => {
  return useQuery<ChangeHistoryResponse>({
    queryKey: ['orderChangeHistory', orderId, params],
    queryFn: async () => {
      const { data } = await api.get(`/change-history/order/${orderId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.action && { action: params.action }),
        },
      });
      return data;
    },
    enabled: !!orderId && enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * Demo 변경 이력 조회
 * @param demoId Demo ID
 * @param params 조회 파라미터 (page, limit, action)
 * @param enabled 쿼리 활성화 여부 (기본: true)
 */
export const useDemoChangeHistory = (
  demoId: number,
  params: ChangeHistoryParams = {},
  enabled: boolean = true
) => {
  return useQuery<ChangeHistoryResponse>({
    queryKey: ['demoChangeHistory', demoId, params],
    queryFn: async () => {
      const { data } = await api.get(`/change-history/demo/${demoId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.action && { action: params.action }),
        },
      });
      return data;
    },
    enabled: !!demoId && enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * Item 재고 변동 이력 조회
 * @param itemId Item ID
 * @param params 조회 파라미터 (page, limit)
 * @param enabled 쿼리 활성화 여부 (기본: true)
 */
export const useItemQuantityHistory = (
  itemId: number,
  params: Omit<ChangeHistoryParams, 'action'> = {},
  enabled: boolean = true
) => {
  return useQuery<ChangeHistoryResponse>({
    queryKey: ['itemQuantityHistory', itemId, params],
    queryFn: async () => {
      const { data } = await api.get(`/change-history/item/${itemId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
        },
      });
      return data;
    },
    enabled: !!itemId && enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};
