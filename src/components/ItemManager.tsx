/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useInventory } from "@/hooks/useInventory";
import { useItems } from "@/hooks/useItems";
import { UpdateItemRequest, Item } from "@/types/item";

const ItemManager: React.FC = () => {
  const { isLoading, warehouses, items } = useInventory();
  const { useUpdateItem, useDeleteItem } = useItems();

  // 아이템 업데이트 뮤테이션
  const updateItemMutation = useUpdateItem();

  // 아이템 삭제 뮤테이션
  const deleteItemMutation = useDeleteItem();

  /*
  // 아이템 추가 예시 코드 (React Query 사용)
  // 다음과 같이 useAddItem 훅을 사용할 수 있습니다:
  
  import { CreateItemRequest } from "@/types/item";
  
  const { useAddItem } = useItems();
  const addItemMutation = useAddItem();
  
  const handleAddItem = (newItem: CreateItemRequest) => {
    addItemMutation.mutate(newItem, {
      onSuccess: () => {
        console.log("아이템이 성공적으로 추가되었습니다.");
      },
      onError: (error) => {
        console.error("아이템 추가 실패:", error);
      }
    });
  };
  */

  const handleUpdateItem = (
    id: string,
    itemData: UpdateItemRequest,
    warehouseId: string
  ) => {
    // React Query 뮤테이션 사용
    updateItemMutation.mutate({
      id,
      data: {
        ...itemData,
        warehouseId, // 캐시 무효화를 위해 warehouseId 전달
      },
    });
  };

  const handleDeleteItem = (id: string, warehouseId: string) => {
    // React Query 뮤테이션 사용
    deleteItemMutation.mutate({
      id,
      itemWarehouseId: warehouseId,
    });
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h1>아이템 관리</h1>

      <div>
        <h2>창고 목록 ({warehouses.length})</h2>
        <ul>
          {warehouses.map((warehouse) => (
            <li key={warehouse.id}>
              {warehouse.name} - 아이템 수: {warehouse.items.length}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>전체 아이템 ({items.length})</h2>
        <ul>
          {items.map((item: Item) => (
            <li key={item.id}>
              {item.itemName} - {item.itemQuantity}개
              <button
                onClick={() => {
                  const itemId = item.id.toString();
                  const whId = item.warehouseId.toString();
                  handleUpdateItem(
                    itemId,
                    { minimumQuantity: item.itemQuantity + 1 },
                    whId
                  );
                }}
              >
                +1
              </button>
              <button
                onClick={() =>
                  handleDeleteItem(
                    item.id.toString(),
                    item.warehouseId.toString()
                  )
                }
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ItemManager;
