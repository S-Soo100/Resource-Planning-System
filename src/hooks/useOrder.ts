import {
  useAllOrders,
  useUserOrders,
  useSupplierOrders,
  useSingleOrder,
} from "./(useOrder)/useOrderQueries";

import {
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  useUpdateOrderStatus,
} from "./(useOrder)/useOrderMutations";

export const useOrder = () => {
  return {
    // 조회 관련 훅
    useAllOrders,
    useUserOrders,
    useSupplierOrders,
    useSingleOrder,

    // 변경 관련 훅
    useCreateOrder,
    useUpdateOrder,
    useDeleteOrder,
    useUpdateOrderStatus,
  };
};
