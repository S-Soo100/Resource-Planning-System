// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { Iitem } from "@/types/item";
// import { updateItem, UpdateItemPayload } from "@/api/(item)/updateItems";

// // 재고 수정 훅
// export const useUpdateItem = () => {
//   console.log("useUpdateItem");
//   const queryClient = useQueryClient();

//   return useMutation<Iitem, Error, UpdateItemPayload>({
//     mutationFn: updateItem,
//     onSuccess: (updatedItem) => {
//       // 기존 캐시 데이터를 업데이트
//       queryClient.setQueryData<Iitem[]>(["items"], (oldItems) => {
//         return oldItems?.map((item) =>
//           item.itemId === updatedItem.itemId ? updatedItem : item
//         );
//       });
//     },
//     onError: (error) => {
//       console.log("재고 수정 실패:", error.message);
//     },
//   });
// };
