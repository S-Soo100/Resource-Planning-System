import React from "react";
import { DemoItemListForTeam57 } from "@/types/demo/demo-item-list-for-team-57";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

// 선택된 아이템의 타입 정의
export interface SelectedDemoItem {
  itemName: string;
  quantity: number;
}

interface DemoItemSelectorProps {
  selectedItems: SelectedDemoItem[];
  onItemsChange: (items: SelectedDemoItem[]) => void;
}

// DemoItemListForTeam57 타입 파일에 정의된 데이터를 직접 사용
const demoItems: DemoItemListForTeam57 = {
  wheelyx_box: ["휠리엑스"],
  basic_kiosk: ["베이직 터치패널 키오스크"],
  lap_top: ["시연용 노트북"],
  display: [`55" TV`, "스탠바이미 고"],
  accessory: ["악세사리 박스"],
};

const DemoItemSelector: React.FC<DemoItemSelectorProps> = ({
  selectedItems,
  onItemsChange,
}) => {
  // 모든 아이템을 하나의 배열로 평면화
  const allItems = Object.values(demoItems).flat();

  // 아이템이 선택되었는지 확인
  const isItemSelected = (itemName: string): boolean => {
    return selectedItems.some((item) => item.itemName === itemName);
  };

  // 선택된 아이템의 수량 가져오기
  const getItemQuantity = (itemName: string): number => {
    const item = selectedItems.find((item) => item.itemName === itemName);
    return item ? item.quantity : 1;
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (itemName: string, checked: boolean) => {
    if (checked) {
      // 아이템 추가
      const newItem: SelectedDemoItem = {
        itemName,
        quantity: 1,
      };
      onItemsChange([...selectedItems, newItem]);
    } else {
      // 아이템 제거
      const updatedItems = selectedItems.filter(
        (item) => item.itemName !== itemName
      );
      onItemsChange(updatedItems);
    }
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (itemName: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedItems = selectedItems.map((item) =>
      item.itemName === itemName ? { ...item, quantity: newQuantity } : item
    );
    onItemsChange(updatedItems);
  };

  // 수량 증가/감소 핸들러
  const handleQuantityAdjust = (itemName: string, increment: boolean) => {
    const currentQuantity = getItemQuantity(itemName);
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;

    if (newQuantity >= 1) {
      handleQuantityChange(itemName, newQuantity);
    }
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 모든 아이템 선택
      const newItems: SelectedDemoItem[] = allItems.map((itemName) => ({
        itemName,
        quantity: 1,
      }));
      onItemsChange(newItems);
    } else {
      // 모든 아이템 해제
      onItemsChange([]);
    }
  };

  // 전체 선택 여부 확인
  const isAllSelected = allItems.every((itemName) => isItemSelected(itemName));

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

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {allItems.map((itemName) => {
            const isSelected = isItemSelected(itemName);
            const quantity = getItemQuantity(itemName);

            return (
              <div
                key={itemName}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
              >
                <div className="flex flex-1 items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`item-${itemName}`}
                    checked={isSelected}
                    onChange={(e) =>
                      handleCheckboxChange(itemName, e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor={`item-${itemName}`}
                    className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {itemName}
                  </label>
                </div>

                {isSelected && (
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityAdjust(itemName, false)}
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
                          itemName,
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
                      onClick={() => handleQuantityAdjust(itemName, true)}
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
      </Card>

      {selectedItems.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="mb-3 text-lg font-semibold text-blue-800">
            선택된 아이템 ({selectedItems.length}개)
          </h3>
          <div className="space-y-2">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-700">{item.itemName}</span>
                <span className="font-medium text-blue-800">
                  {item.quantity}개
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DemoItemSelector;
