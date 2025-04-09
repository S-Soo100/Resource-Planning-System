import React from "react";
import { useInventory } from "@/hooks/useInventory";
import { itemService, withInventoryUpdate } from "@/services/itemService";
import { UpdateItemRequest, Item } from "@/types/item";

const ItemManager: React.FC = () => {
  const { isLoading, warehouses, items, invalidateInventory } = useInventory();

  /* 
  // 실제 구현 시 사용할 추가 예시 코드
  const handleAddItem = async (newItem: CreateItemRequest) => {
    // 방법 1: withInventoryUpdate 헬퍼 함수 사용
    const response = await withInventoryUpdate(
      () => itemService.addItem(newItem),
      invalidateInventory,
      newItem.warehouseId.toString() // number를 string으로 변환
    );

    if (response.success) {
      console.log("아이템이 성공적으로 추가되었습니다.");
    } else {
      console.error("아이템 추가 실패:", response.message);
    }
  };
  */

  const handleUpdateItem = async (
    id: string,
    itemData: UpdateItemRequest,
    warehouseId: string
  ) => {
    // 방법 2: 직접 호출 후 invalidate
    const response = await itemService.updateItem(id, itemData);

    if (response.success) {
      // 성공 시에만 캐시 무효화
      await invalidateInventory(warehouseId);
      console.log("아이템이 성공적으로 업데이트되었습니다.");
    } else {
      console.error("아이템 업데이트 실패:", response.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    // 방법 1: withInventoryUpdate 헬퍼 함수 사용 (모든 창고 데이터 갱신)
    const response = await withInventoryUpdate(
      () => itemService.deleteItem(id),
      invalidateInventory
      // warehouseId를 전달하지 않으면 모든 창고 캐시가 무효화됨
    );

    if (response.success) {
      console.log("아이템이 성공적으로 삭제되었습니다.");
    } else {
      console.error("아이템 삭제 실패:", response.message);
    }
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
              <button onClick={() => handleDeleteItem(item.id.toString())}>
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
