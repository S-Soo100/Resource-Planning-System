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
    <div className="grid grid-cols-1 gap-4">
      {categories.map((cat) => (
        <React.Fragment key={cat.id}>
          <div
            className="bg-gray-100 font-bold px-4 py-2 rounded text-base text-gray-700 mb-2 mt-4 cursor-pointer select-none"
            onClick={() => handleToggle(String(cat.id))}
          >
            <span>{openCategories[String(cat.id)] ? "▼" : "▶"} </span>
            {cat.name}
          </div>
          {openCategories[String(cat.id)] &&
            (grouped[cat.id].length > 0 ? (
              grouped[cat.id].map((item, itemIndex) => (
                <div
                  key={`item-card-${item.id}-${itemIndex}`}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-center">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => router.push(`/item/detail/${item.id}`)}
                    >
                      <div className="text-gray-500 text-sm mb-1">
                        카테고리:{" "}
                        {getCategoryName(
                          item.teamItem.category?.id ?? item.teamItem.categoryId
                        )}
                      </div>
                      <div className="text-blue-500 font-medium text-lg">
                        {item.teamItem.itemName}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {item.teamItem.itemCode}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        최종수정:{" "}
                        {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                      </div>
                      {item.teamItem.memo && (
                        <div className="text-xs text-gray-500">
                          메모: {truncateMemo(item.teamItem.memo)}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-gray-500 text-sm mb-1">재고수량</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {item.itemQuantity}
                      </div>
                      {showEditButton && (
                        <button
                          className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors duration-150"
                          onClick={() => onEditQuantity(item)}
                        >
                          수정
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm px-4 py-2">
                해당 카테고리 품목 없음
              </div>
            ))}
        </React.Fragment>
      ))}
      {/* 카테고리 없는 아이템 */}
      {grouped["none"].length > 0 && (
        <>
          <div
            className="bg-gray-100 font-bold px-4 py-2 rounded text-base text-gray-700 mb-2 mt-4 cursor-pointer select-none"
            onClick={() => handleToggle("none")}
          >
            <span>{openCategories["none"] ? "▼" : "▶"} </span>카테고리 없음
          </div>
          {openCategories["none"] &&
            grouped["none"].map((item, itemIndex) => (
              <div
                key={`item-card-none-${item.id}-${itemIndex}`}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => router.push(`/item/detail/${item.id}`)}
                  >
                    <div className="text-gray-500 text-sm mb-1">
                      카테고리: -
                    </div>
                    <div className="text-blue-500 font-medium text-lg">
                      {item.teamItem.itemName}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {item.teamItem.itemCode}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      최종수정:{" "}
                      {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                    </div>
                    {item.teamItem.memo && (
                      <div className="text-xs text-gray-500">
                        메모: {truncateMemo(item.teamItem.memo)}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-gray-500 text-sm mb-1">재고수량</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {item.itemQuantity}
                    </div>
                    {showEditButton && (
                      <button
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors duration-150"
                        onClick={() => onEditQuantity(item)}
                      >
                        수정
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
