import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { Item } from "@/types/(item)/item";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";
import { TeamItem } from "@/types/(item)/team-item";

// 선택된 아이템의 타입 정의
export interface SelectedDemoItem {
  itemName: string;
  quantity: number;
  teamItem: TeamItem;
  itemId: number;
  memo: string;
}

interface DemoItemSelectorProps {
  selectedItems: SelectedDemoItem[];
  onItemsChange: (items: SelectedDemoItem[]) => void;
  warehouseId: number; // 현재 선택된 창고 ID
}

const DemoItemSelector: React.FC<DemoItemSelectorProps> = ({
  selectedItems,
  onItemsChange,
  warehouseId,
}) => {
  // 현재 창고의 아이템 조회
  const { useGetItemsByWarehouse } = useItemStockManagement(
    warehouseId.toString()
  );
  const { data: warehouseItemsResponse, isLoading } = useGetItemsByWarehouse();

  // 창고 아이템 목록
  const warehouseItems: Item[] = warehouseItemsResponse?.data || [];

  // 아이템이 선택되었는지 확인
  const isItemSelected = (teamItemName: string): boolean => {
    return selectedItems.some(
      (item) => item.teamItem.itemName === teamItemName
    );
  };

  // 선택된 아이템의 수량 가져오기
  const getItemQuantity = (teamItemName: string): number => {
    const item = selectedItems.find(
      (item) => item.teamItem.itemName === teamItemName
    );
    return item ? item.quantity : 1;
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (teamItemName: string, checked: boolean) => {
    if (checked) {
      const warehouseItem = warehouseItems.find(
        (item) => item.teamItem.itemName === teamItemName
      );
      if (!warehouseItem) return;
      const newItem: SelectedDemoItem = {
        itemName: warehouseItem.itemName,
        quantity: 1,
        teamItem: warehouseItem.teamItem,
        itemId: warehouseItem.id,
        memo: warehouseItem.teamItem.memo,
      };
      onItemsChange([...selectedItems, newItem]);
    } else {
      const updatedItems = selectedItems.filter(
        (item) => item.teamItem.itemName !== teamItemName
      );
      onItemsChange(updatedItems);
    }
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (teamItemName: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = selectedItems.map((item) =>
      item.teamItem.itemName === teamItemName
        ? { ...item, quantity: newQuantity }
        : item
    );
    onItemsChange(updatedItems);
  };

  // 수량 증가/감소 핸들러
  const handleQuantityAdjust = (teamItemName: string, increment: boolean) => {
    const currentQuantity = getItemQuantity(teamItemName);
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;
    if (newQuantity >= 1) {
      handleQuantityChange(teamItemName, newQuantity);
    }
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newItems: SelectedDemoItem[] = warehouseItems.map((item) => ({
        itemName: item.itemName,
        quantity: 1,
        teamItem: item.teamItem,
        itemId: item.id,
        memo: item.teamItem.memo,
      }));
      onItemsChange(newItems);
    } else {
      onItemsChange([]);
    }
  };

  // 전체 선택 여부 확인
  const isAllSelected = warehouseItems.every((item) =>
    isItemSelected(item.teamItem.itemName)
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">
          시연 아이템 선택
        </h2>
        <p className="text-gray-600">
          필요한 시연 아이템을 선택하고 수량을 설정해주세요.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center pb-2 mb-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            시연 아이템 목록
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="select-all"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium text-gray-600 cursor-pointer"
            >
              전체 선택
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="text-gray-500">창고 아이템을 불러오는 중...</div>
          </div>
        ) : warehouseItems.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-gray-500">
              이 창고에 등록된 아이템이 없습니다.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {warehouseItems.map((item) => {
              const teamItemName = item.teamItem.itemName;
              const isSelected = isItemSelected(teamItemName);
              const quantity = getItemQuantity(teamItemName);
              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <div className="flex flex-1 items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`item-${teamItemName}`}
                      checked={isSelected}
                      onChange={(e) =>
                        handleCheckboxChange(teamItemName, e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <label
                      htmlFor={`item-${teamItemName}`}
                      className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {teamItemName}
                    </label>
                  </div>

                  {isSelected && (
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityAdjust(teamItemName, false)
                        }
                        className="p-0 w-8 h-8"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            teamItemName,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 text-center"
                        min="1"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityAdjust(teamItemName, true)}
                        className="p-0 w-8 h-8"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 선택된 아이템 요약 */}
      {selectedItems.length > 0 && (
        <div className="p-4 mt-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="mb-2 font-semibold text-blue-900">
            선택된 아이템 ({selectedItems.length}개)
          </div>
          {selectedItems.map((item) => (
            <div
              key={item.teamItem.itemName}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-700">{item.teamItem.itemName}</span>
              <span className="font-medium text-blue-800">
                {item.quantity}개
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DemoItemSelector;
