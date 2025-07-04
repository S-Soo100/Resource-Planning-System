import React from "react";
import { DemoItemListForTeam57 } from "@/types/demo/demo-item-list-for-team-57";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

// 선택된 아이템의 타입 정의
export interface SelectedDemoItem {
  category: string;
  itemName: string;
  quantity: number;
}

interface DemoItemSelectorProps {
  selectedItems: SelectedDemoItem[];
  onItemsChange: (items: SelectedDemoItem[]) => void;
}

// 카테고리 이름 매핑
const categoryNames: Record<keyof DemoItemListForTeam57, string> = {
  wheelyx_box: "휠리엑스 박스",
  basic_kiosk: "기본 키오스크",
  lap_top: "노트북",
  display: "디스플레이",
  accessory: "악세사리",
};

// 더미 데이터 - 실제로는 타입에서 가져옴
const demoItems: DemoItemListForTeam57 = {
  wheelyx_box: [
    "경사로 좌/우",
    "본체프레임 좌/우",
    "브레이크 손잡이 2ea",
    "본체연결 브라켓 2ea",
    "T 노브 볼트 4ea",
    "십자 노브 볼트 4ea",
    "로프 라쳇 2ea",
  ],
  basic_kiosk: ["터치 모니터 본체", "전원 케이블", "터치 스크린 케이블"],
  lap_top: ["노트북", "노트북 충전기"],
  display: ["TV 본체", "리모컨", "전원 케이블", "스탠바이미 고", "TV 거치대"],
  accessory: ["악세사리 박스"],
};

const DemoItemSelector: React.FC<DemoItemSelectorProps> = ({
  selectedItems,
  onItemsChange,
}) => {
  // 아이템이 선택되었는지 확인
  const isItemSelected = (category: string, itemName: string): boolean => {
    return selectedItems.some(
      (item) => item.category === category && item.itemName === itemName
    );
  };

  // 선택된 아이템의 수량 가져오기
  const getItemQuantity = (category: string, itemName: string): number => {
    const item = selectedItems.find(
      (item) => item.category === category && item.itemName === itemName
    );
    return item ? item.quantity : 1;
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (
    category: string,
    itemName: string,
    checked: boolean
  ) => {
    if (checked) {
      // 아이템 추가
      const newItem: SelectedDemoItem = {
        category,
        itemName,
        quantity: 1,
      };
      onItemsChange([...selectedItems, newItem]);
    } else {
      // 아이템 제거
      const updatedItems = selectedItems.filter(
        (item) => !(item.category === category && item.itemName === itemName)
      );
      onItemsChange(updatedItems);
    }
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (
    category: string,
    itemName: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    const updatedItems = selectedItems.map((item) =>
      item.category === category && item.itemName === itemName
        ? { ...item, quantity: newQuantity }
        : item
    );
    onItemsChange(updatedItems);
  };

  // 수량 증가/감소 핸들러
  const handleQuantityAdjust = (
    category: string,
    itemName: string,
    increment: boolean
  ) => {
    const currentQuantity = getItemQuantity(category, itemName);
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;

    if (newQuantity >= 1) {
      handleQuantityChange(category, itemName, newQuantity);
    }
  };

  // 카테고리 내 모든 아이템이 선택되었는지 확인
  const isCategoryAllSelected = (category: string): boolean => {
    const categoryItems = demoItems[category as keyof DemoItemListForTeam57];
    return categoryItems.every((itemName) =>
      isItemSelected(category, itemName)
    );
  };

  // 카테고리 전체 선택/해제 핸들러
  const handleCategoryToggle = (category: string, checked: boolean) => {
    const categoryItems = demoItems[category as keyof DemoItemListForTeam57];

    if (checked) {
      // 카테고리의 모든 아이템 선택
      const newItems: SelectedDemoItem[] = categoryItems.map((itemName) => ({
        category,
        itemName,
        quantity: 1,
      }));

      // 기존 선택된 아이템에서 해당 카테고리 제외하고 새 아이템들 추가
      const otherCategoryItems = selectedItems.filter(
        (item) => item.category !== category
      );
      onItemsChange([...otherCategoryItems, ...newItems]);
    } else {
      // 카테고리의 모든 아이템 해제
      const updatedItems = selectedItems.filter(
        (item) => item.category !== category
      );
      onItemsChange(updatedItems);
    }
  };

  // 카테고리 전체 수량 변경 핸들러
  const handleCategoryQuantityChange = (category: string, quantity: number) => {
    if (quantity < 1) return;

    const updatedItems = selectedItems.map((item) =>
      item.category === category ? { ...item, quantity } : item
    );
    onItemsChange(updatedItems);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">
          시연 아이템 선택
        </h2>
        <p className="text-gray-600">
          필요한 시연 아이템을 카테고리별로 선택하고 수량을 설정해주세요.
        </p>
      </div>

      {Object.entries(demoItems).map(([categoryKey, items]) => {
        const isAllSelected = isCategoryAllSelected(categoryKey);
        const categorySelectedItems = selectedItems.filter(
          (item) => item.category === categoryKey
        );
        const categoryQuantity =
          categorySelectedItems.length > 0
            ? categorySelectedItems[0]?.quantity || 1
            : 1;

        return (
          <Card key={categoryKey} className="p-6">
            <div className="flex justify-between items-center pb-2 mb-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {categoryNames[categoryKey as keyof DemoItemListForTeam57]}
              </h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${categoryKey}`}
                    checked={isAllSelected}
                    onChange={(e) =>
                      handleCategoryToggle(categoryKey, e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor={`category-${categoryKey}`}
                    className="text-sm font-medium text-gray-600 cursor-pointer"
                  >
                    전체 선택
                  </label>
                </div>
                {isAllSelected && (
                  <div className="flex items-center space-x-1">
                    <label className="text-sm font-medium text-gray-600">
                      수량:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={categoryQuantity}
                      onChange={(e) =>
                        handleCategoryQuantityChange(
                          categoryKey,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="px-2 py-1 w-16 text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {items.map((itemName) => {
                const isSelected = isItemSelected(categoryKey, itemName);
                const quantity = getItemQuantity(categoryKey, itemName);

                return (
                  <div
                    key={`${categoryKey}-${itemName}`}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <div className="flex flex-1 items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`${categoryKey}-${itemName}`}
                        checked={isSelected}
                        onChange={(e) =>
                          handleCheckboxChange(
                            categoryKey,
                            itemName,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <label
                        htmlFor={`${categoryKey}-${itemName}`}
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
                          onClick={() =>
                            handleQuantityAdjust(categoryKey, itemName, false)
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
                              categoryKey,
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
                          onClick={() =>
                            handleQuantityAdjust(categoryKey, itemName, true)
                          }
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
        );
      })}

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
                <span className="text-gray-700">
                  <span className="font-medium text-blue-600">
                    {
                      categoryNames[
                        item.category as keyof DemoItemListForTeam57
                      ]
                    }
                  </span>
                  {" > "}
                  {item.itemName}
                </span>
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
