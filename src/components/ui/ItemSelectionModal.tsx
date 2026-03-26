"use client";
import { useState, useMemo, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { Item } from "@/types/(item)/item";
import { Category } from "@/types/(item)/category";
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

/**
 * 카테고리 ID와 그 자식 카테고리 ID들을 모두 수집
 */
const collectCategoryIds = (
  categoryId: number,
  categories: Category[]
): number[] => {
  const ids = [categoryId];
  const children = categories.filter((cat) => cat.parentId === categoryId);
  for (const child of children) {
    ids.push(...collectCategoryIds(child.id, categories));
  }
  return ids;
};

/**
 * 트리 구조의 카테고리 목록 생성 (부모 → 자식 순서, 들여쓰기 레벨 포함)
 */
interface CategoryNode {
  category: Category;
  level: number; // 0: 루트/부모, 1: 자식, 2: 손자...
}

/**
 * 카테고리 서브트리에 filterIds에 해당하는 노드가 있는지 재귀 확인
 */
const hasRelevantDescendant = (
  catId: number,
  categories: Category[],
  filterIds: Set<number>
): boolean => {
  const children = categories.filter((c) => c.parentId === catId);
  return children.some(
    (child) =>
      filterIds.has(child.id) ||
      hasRelevantDescendant(child.id, categories, filterIds)
  );
};

const buildCategoryTree = (
  categories: Category[],
  filterIds?: Set<number>
): CategoryNode[] => {
  const result: CategoryNode[] = [];

  // 루트 카테고리 (parentId가 없는 것)
  const rootCategories = categories
    .filter((cat) => !cat.parentId)
    .sort((a, b) => a.priority - b.priority);

  const addWithChildren = (cat: Category, level: number) => {
    const childCategories = categories
      .filter((c) => c.parentId === cat.id)
      .sort((a, b) => a.priority - b.priority);

    // filterIds가 있으면 본인 또는 자손(재귀) 중 관련 노드가 있는 경우만 표시
    const hasRelevantItems = filterIds
      ? filterIds.has(cat.id) ||
        hasRelevantDescendant(cat.id, categories, filterIds)
      : true;

    if (!hasRelevantItems) return;

    result.push({ category: cat, level });
    for (const child of childCategories) {
      addWithChildren(child, level + 1);
    }
  };

  for (const root of rootCategories) {
    addWithChildren(root, 0);
  }

  return result;
};

export default function ItemSelectionModal({
  isOpen,
  onClose,
  onAddItem,
  currentWarehouseItems,
  orderItems,
  title = "품목 추가",
  categoryNames = [],
}: ItemSelectionModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const { categories } = useCategory();

  // 창고가 변경되면 선택된 카테고리 초기화
  useEffect(() => {
    setSelectedCategoryId(null);
  }, [currentWarehouseItems]);

  // 현재 창고 품목들의 카테고리 ID 집합
  const existingCategoryIds = useMemo(() => {
    if (!currentWarehouseItems) return new Set<number>();
    return new Set(
      currentWarehouseItems
        .map((item) => item.teamItem?.categoryId)
        .filter((id) => id !== undefined) as number[]
    );
  }, [currentWarehouseItems]);

  // 트리 구조 카테고리 목록
  const categoryTree = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    if (categoryNames.length > 0) {
      // props로 전달된 카테고리 이름으로 필터링
      const nameFilterIds = new Set(
        categories
          .filter((cat) => categoryNames.includes(cat.name))
          .map((cat) => cat.id)
      );
      return buildCategoryTree(categories, nameFilterIds);
    }

    // 현재 창고 품목이 속한 카테고리 + 조상 카테고리 전체 포함
    const relevantIds = new Set<number>();
    for (const catId of existingCategoryIds) {
      relevantIds.add(catId);
      // 조상 카테고리를 루트까지 전부 추가
      let current = categories.find((c) => c.id === catId);
      while (current?.parentId) {
        relevantIds.add(current.parentId);
        current = categories.find((c) => c.id === current!.parentId);
      }
    }

    return buildCategoryTree(categories, relevantIds);
  }, [categoryNames, categories, existingCategoryIds]);

  // 선택된 카테고리가 트리에 없으면 초기화
  useEffect(() => {
    if (
      selectedCategoryId !== null &&
      !categoryTree.some((node) => node.category.id === selectedCategoryId)
    ) {
      setSelectedCategoryId(null);
    }
  }, [selectedCategoryId, categoryTree]);

  // 카테고리 필터링된 창고 품목들
  const filteredWarehouseItems = useMemo(() => {
    if (!categories || categories.length === 0) return currentWarehouseItems;

    const targetCategoryIds = new Set(
      categoryTree.map((node) => node.category.id)
    );
    if (targetCategoryIds.size === 0) return currentWarehouseItems;

    return currentWarehouseItems.filter(
      (item) =>
        item.teamItem?.categoryId &&
        targetCategoryIds.has(item.teamItem.categoryId)
    );
  }, [currentWarehouseItems, categoryTree, categories]);

  // 선택된 카테고리의 품목들 (부모 선택 시 자식 카테고리 품목도 포함)
  const categoryItems = useMemo(() => {
    try {
      if (selectedCategoryId === null || !categories || !filteredWarehouseItems)
        return [];

      // 선택된 카테고리 + 자식 카테고리의 모든 ID 수집
      const targetIds = collectCategoryIds(selectedCategoryId, categories);
      const targetIdSet = new Set(targetIds);

      return filteredWarehouseItems.filter((item) => {
        if (!item || !item.teamItem) return false;
        const categoryId = item.teamItem.categoryId;
        if (!categoryId) return false;
        return targetIdSet.has(categoryId);
      });
    } catch {
      return [];
    }
  }, [selectedCategoryId, categories, filteredWarehouseItems]);

  // 실제 표시할 품목들
  const displayItems = useMemo(() => {
    return selectedCategoryId !== null ? categoryItems : [];
  }, [selectedCategoryId, categoryItems]);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

  const handleAddItemFromModal = (item: Item) => {
    if (!item || !item.teamItem) return;
    onAddItem(item);
  };

  const handleClose = () => {
    setSelectedCategoryId(null);
    onClose();
  };

  // 선택된 카테고리 이름
  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === null) return "";
    const node = categoryTree.find((n) => n.category.id === selectedCategoryId);
    return node?.category.name || "";
  }, [selectedCategoryId, categoryTree]);

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="flex overflow-hidden flex-col bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh]">
        {/* 헤더 - 고정 */}
        <div className="flex shrink-0 justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* 본문 - 스크롤 가능 */}
        <div className="overflow-y-auto flex-1 p-6 min-h-0">
          {/* 카테고리 선택 (카테고리가 있는 경우) */}
          {categoryTree.length > 0 && (
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                카테고리 선택
              </label>
              <div className="flex flex-col gap-1">
                {categoryTree.map((node) => {
                  const isSelected = selectedCategoryId === node.category.id;
                  const isChild = node.level > 0;

                  return (
                    <button
                      key={node.category.id}
                      onClick={() => handleCategorySelect(node.category.id)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      style={{
                        paddingLeft: `${16 + node.level * 20}px`,
                      }}
                    >
                      {isChild && (
                        <ChevronRight
                          size={14}
                          className={`shrink-0 ${isSelected ? "text-white" : "text-gray-400"}`}
                        />
                      )}
                      <span>{node.category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 품목 목록 */}
          <div>
            <h3 className="mb-3 text-lg font-medium text-gray-800">
              {selectedCategoryName
                ? `${selectedCategoryName} 품목 (${displayItems.length}개)`
                : categoryTree.length > 0
                  ? "카테고리를 선택해주세요"
                  : `전체 품목 (${filteredWarehouseItems.length}개)`}
            </h3>

            {displayItems.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                {categoryTree.length > 0 && selectedCategoryId === null
                  ? "먼저 카테고리를 선택해주세요."
                  : selectedCategoryId !== null
                    ? "해당 카테고리에 품목이 없습니다."
                    : "해당 조건의 품목이 없습니다."}
              </p>
            ) : (
              <div className="grid gap-2">
                {displayItems.map((item) => {
                  const isService = item.teamItem?.isService === true;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex gap-2 items-center">
                          <span className="font-medium text-gray-800">
                            {item.teamItem.itemName}
                          </span>
                          {isService && (
                            <span className="px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded">
                              서비스
                            </span>
                          )}
                          {!isService && item.itemQuantity < 1 && (
                            <span className="px-2 py-1 text-xs text-red-500 bg-red-100 rounded">
                              재고 없음
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          코드: {item.teamItem.itemCode} | 재고:{" "}
                          {isService ? "-" : `${item.itemQuantity}개`}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddItemFromModal(item)}
                        className="px-3 py-1 text-sm rounded-md transition-colors text-white bg-blue-500 hover:bg-blue-600"
                      >
                        추가
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
