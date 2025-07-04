"use client";
import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { Item } from "@/types/(item)/item";
import { OrderItemWithDetails } from "@/types/(order)/orderRequestFormData";
import { useCategory } from "@/hooks/useCategory";

interface ItemSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Item) => void;
  currentWarehouseItems: Item[];
  orderItems: (OrderItemWithDetails & { warehouseItemId: number })[];
  title?: string;
  categoryNames?: string[]; // 표시할 카테고리 목록 (없으면 전체 카테고리)
}

export default function ItemSelectionModal({
  isOpen,
  onClose,
  onAddItem,
  currentWarehouseItems,
  orderItems,
  title = "품목 추가",
  categoryNames = [],
}: ItemSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { categories } = useCategory();

  // 창고가 변경되면 선택된 카테고리 초기화
  useEffect(() => {
    setSelectedCategory("");
  }, [currentWarehouseItems]);

  // 사용할 카테고리 목록 (props로 전달된 것이 있으면 사용, 없으면 현재 창고 품목들의 카테고리)
  const displayCategories = useMemo(() => {
    if (categoryNames.length > 0) {
      return categoryNames;
    }

    // 현재 창고 품목들에서 실제 존재하는 카테고리만 추출
    if (!categories || !currentWarehouseItems) return [];

    // 현재 창고 품목들의 카테고리 ID 추출
    const existingCategoryIds = new Set(
      currentWarehouseItems
        .map((item) => item.teamItem?.categoryId)
        .filter((id) => id !== undefined) as number[]
    );

    // 실제 존재하는 카테고리의 이름만 반환
    return categories
      .filter((cat) => existingCategoryIds.has(cat.id))
      .map((cat) => cat.name);
  }, [categoryNames, categories, currentWarehouseItems]);

  // 선택된 카테고리가 현재 표시 가능한 카테고리 목록에 없으면 초기화
  useEffect(() => {
    if (selectedCategory && !displayCategories.includes(selectedCategory)) {
      setSelectedCategory("");
    }
  }, [selectedCategory, displayCategories]);

  // 카테고리 필터링된 창고 품목들
  const filteredWarehouseItems = useMemo(() => {
    if (!categories || categories.length === 0) return currentWarehouseItems;

    // 사용할 카테고리들을 찾기
    const targetCategories = categories.filter((category) =>
      displayCategories.includes(category.name)
    );

    if (targetCategories.length === 0) return currentWarehouseItems;

    // 카테고리 ID들
    const targetCategoryIds = targetCategories.map((cat) => cat.id);

    return currentWarehouseItems.filter(
      (item) =>
        item.teamItem?.categoryId &&
        targetCategoryIds.includes(item.teamItem.categoryId)
    );
  }, [currentWarehouseItems, displayCategories, categories]);

  // 선택된 카테고리의 품목들
  const categoryItems = useMemo(() => {
    try {
      if (!selectedCategory || !categories || !filteredWarehouseItems)
        return [];

      const category = categories.find(
        (cat) => cat.name.trim() === selectedCategory.trim()
      );
      if (!category) {
        return [];
      }

      return filteredWarehouseItems.filter((item) => {
        // 아이템이 유효한지 확인
        if (!item || !item.teamItem) return false;

        // categoryId가 유효한지 확인
        const categoryId = item.teamItem.categoryId;
        if (!categoryId) return false;

        return categoryId === category.id;
      });
    } catch {
      return [];
    }
  }, [selectedCategory, categories, filteredWarehouseItems]);

  // 실제 표시할 품목들
  const displayItems = useMemo(() => {
    return selectedCategory ? categoryItems : [];
  }, [selectedCategory, categoryItems]);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleAddItemFromModal = (item: Item) => {
    // 아이템이 유효한지 확인
    if (!item || !item.teamItem) {
      return;
    }

    // 이미 추가된 아이템인지 확인 (itemCode가 중복되는 경우를 대비하여 warehouseItemId로 체크)
    const isItemExists = orderItems.some(
      (orderItem) => orderItem.warehouseItemId === item.id
    );

    if (isItemExists) {
      return; // 이미 추가된 아이템은 처리하지 않음
    }

    onAddItem(item);
  };

  const handleClose = () => {
    setSelectedCategory("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {/* 카테고리 선택 (카테고리가 있는 경우) */}
          {displayCategories.length > 0 && (
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                카테고리 선택
              </label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {displayCategories.map((categoryName) => (
                  <button
                    key={categoryName}
                    onClick={() => handleCategorySelect(categoryName)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === categoryName
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {categoryName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 품목 목록 */}
          <div>
            <h3 className="mb-3 text-lg font-medium text-gray-800">
              {selectedCategory
                ? `${selectedCategory} 품목 (${displayItems.length}개)`
                : displayCategories.length > 0
                ? "카테고리를 선택해주세요"
                : `전체 품목 (${filteredWarehouseItems.length}개)`}
            </h3>

            {displayItems.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                {displayCategories.length > 0 && !selectedCategory
                  ? "먼저 카테고리를 선택해주세요."
                  : "해당 조건의 품목이 없습니다."}
              </p>
            ) : (
              <div className="grid overflow-y-auto gap-2 max-h-96">
                {displayItems.map((item) => {
                  // itemCode가 중복되는 경우를 대비하여 warehouseItemId로 중복 체크
                  const isAlreadyAdded = orderItems.some(
                    (orderItem) => orderItem.warehouseItemId === item.id
                  );

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isAlreadyAdded
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex gap-2 items-center">
                          <span className="font-medium text-gray-800">
                            {item.teamItem.itemName}
                          </span>
                          {item.itemQuantity < 1 && (
                            <span className="px-2 py-1 text-xs text-red-500 bg-red-100 rounded">
                              재고 없음
                            </span>
                          )}
                          {isAlreadyAdded && (
                            <span className="px-2 py-1 text-xs text-blue-500 bg-blue-100 rounded">
                              추가됨
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          코드: {item.teamItem.itemCode} | 재고:{" "}
                          {item.itemQuantity}개
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddItemFromModal(item)}
                        disabled={isAlreadyAdded}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          isAlreadyAdded
                            ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                            : "text-white bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {isAlreadyAdded ? "추가됨" : "추가"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
