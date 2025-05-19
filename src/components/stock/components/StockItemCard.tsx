import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types/(item)/item";
import { useCategoryStore } from "@/store/categoryStore";

interface StockItemCardProps {
  items: Item[];
  onEditQuantity: (item: Item) => void;
  showEditButton?: boolean;
}

export default function StockItemCard({
  items,
  onEditQuantity,
  showEditButton = true,
}: StockItemCardProps) {
  const router = useRouter();
  const { categories } = useCategoryStore();

  const [openCategories, setOpenCategories] = useState<{
    [key: string]: boolean;
  }>(() => {
    const initial: { [key: string]: boolean } = {};
    categories.forEach((cat) => {
      initial[cat.id] = true;
    });
    initial["none"] = true;
    return initial;
  });

  const handleToggle = (catId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // 메모 텍스트를 최대 길이로 제한하는 함수
  const truncateMemo = (memo: string | null, maxLength = 30) => {
    if (!memo) return null;
    return memo.length > maxLength
      ? `${memo.substring(0, maxLength)}...`
      : memo;
  };

  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return "-";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "-";
  };

  // 카테고리별로 아이템 그룹핑 함수
  const groupItemsByCategory = (
    items: Item[],
    categories: { id: number; name: string }[]
  ) => {
    const grouped: { [key: string]: Item[] } = {};
    categories.forEach((cat) => {
      grouped[cat.id] = [];
    });
    grouped["none"] = [];
    items.forEach((item) => {
      const catId = item.teamItem?.category?.id ?? item.teamItem?.categoryId;
      if (catId) {
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push(item);
      } else {
        grouped["none"].push(item);
      }
    });
    return grouped;
  };

  const grouped = groupItemsByCategory(items, categories);

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500 mb-4">창고가 비었습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-1.5">
      {categories.map((cat) => (
        <React.Fragment key={cat.id}>
          <div
            className="bg-gray-100 font-bold px-2.5 py-1.5 rounded-lg text-base text-gray-700 mb-1 mt-1.5 cursor-pointer select-none flex items-center justify-between"
            onClick={() => handleToggle(String(cat.id))}
          >
            <span className="flex items-center">
              <span className="mr-1">
                {openCategories[String(cat.id)] ? "▼" : "▶"}
              </span>
              {cat.name}
            </span>
            <span className="text-sm text-gray-500">
              {grouped[cat.id].length}개 품목
            </span>
          </div>
          {openCategories[String(cat.id)] &&
            (grouped[cat.id].length > 0 ? (
              grouped[cat.id].map((item, itemIndex) => (
                <div
                  key={`item-card-${item.id}-${itemIndex}`}
                  className="bg-white rounded-lg shadow-sm p-2 border border-gray-100"
                >
                  <div className="flex flex-col">
                    <div
                      className="cursor-pointer"
                      onClick={() => router.push(`/item/detail/${item.id}`)}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <div className="flex-1">
                          <div className="text-blue-500 font-medium text-base mb-0.5">
                            {item.teamItem.itemName}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {item.teamItem.itemCode}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-500 text-sm mb-0.5">
                            재고수량
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            {item.itemQuantity}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-sm mt-1.5">
                        <div className="text-gray-500">
                          카테고리:{" "}
                          {getCategoryName(
                            item.teamItem.category?.id ??
                              item.teamItem.categoryId
                          )}
                        </div>
                        <div className="text-gray-500 text-right">
                          최종수정:{" "}
                          {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>

                      {item.teamItem.memo && (
                        <div className="mt-1 p-1 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500">
                            메모: {truncateMemo(item.teamItem.memo)}
                          </div>
                        </div>
                      )}
                    </div>

                    {showEditButton && (
                      <div className="mt-1.5 flex justify-end">
                        <button
                          className="px-2.5 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-150 shadow-sm"
                          onClick={() => onEditQuantity(item)}
                        >
                          수량 수정
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm px-2.5 py-1">
                해당 카테고리 품목 없음
              </div>
            ))}
        </React.Fragment>
      ))}
      {/* 카테고리 없는 아이템 */}
      {grouped["none"].length > 0 && (
        <>
          <div
            className="bg-gray-100 font-bold px-2.5 py-1.5 rounded-lg text-base text-gray-700 mb-1 mt-1.5 cursor-pointer select-none flex items-center justify-between"
            onClick={() => handleToggle("none")}
          >
            <span className="flex items-center">
              <span className="mr-1">{openCategories["none"] ? "▼" : "▶"}</span>
              카테고리 없음
            </span>
            <span className="text-sm text-gray-500">
              {grouped["none"].length}개 품목
            </span>
          </div>
          {openCategories["none"] &&
            grouped["none"].map((item, itemIndex) => (
              <div
                key={`item-card-none-${item.id}-${itemIndex}`}
                className="bg-white rounded-lg shadow-sm p-2 border border-gray-100"
              >
                <div className="flex flex-col">
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/item/detail/${item.id}`)}
                  >
                    <div className="flex justify-between items-start mb-0.5">
                      <div className="flex-1">
                        <div className="text-blue-500 font-medium text-base mb-0.5">
                          {item.teamItem.itemName}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {item.teamItem.itemCode}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500 text-sm mb-0.5">
                          재고수량
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {item.itemQuantity}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-sm mt-1.5">
                      <div className="text-gray-500">카테고리: -</div>
                      <div className="text-gray-500 text-right">
                        최종수정:{" "}
                        {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                      </div>
                    </div>

                    {item.teamItem.memo && (
                      <div className="mt-1 p-1 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">
                          메모: {truncateMemo(item.teamItem.memo)}
                        </div>
                      </div>
                    )}
                  </div>

                  {showEditButton && (
                    <div className="mt-1.5 flex justify-end">
                      <button
                        className="px-2.5 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-150 shadow-sm"
                        onClick={() => onEditQuantity(item)}
                      >
                        수량 수정
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
