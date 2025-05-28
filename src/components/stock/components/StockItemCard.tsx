import React, { useState } from "react";
import { Item } from "@/types/(item)/item";
import { useCategoryStore } from "@/store/categoryStore";
import { useRouter } from "next/navigation";

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
  const { categories } = useCategoryStore();
  const router = useRouter();

  const [openCategories, setOpenCategories] = useState<{
    [key: string]: boolean;
  }>(() => {
    const initial: { [key: string]: boolean } = {};
    categories.forEach((cat) => {
      initial[cat.id] = false;
    });
    initial["none"] = false;
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

  // 카테고리별 총 재고 계산 함수
  const calculateTotalQuantity = (items: Item[]) => {
    return items.reduce((total, item) => total + item.itemQuantity, 0);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500 mb-4">창고가 비었습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-1.5">
      {categories.map(
        (cat) =>
          grouped[cat.id].length > 0 && (
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
                  {grouped[cat.id].length}개 품목 / 총{" "}
                  {calculateTotalQuantity(grouped[cat.id])}개
                </span>
              </div>
              {openCategories[String(cat.id)] && (
                <>
                  {grouped[cat.id].length > 0 ? (
                    grouped[cat.id].map((item, itemIndex) => (
                      <div
                        key={`item-card-${item.id}-${itemIndex}`}
                        className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 mb-2"
                      >
                        {/* 품목명 + 재고수량 */}
                        <div className="flex justify-between items-center mb-1">
                          <div
                            className="text-base font-bold text-blue-700 cursor-pointer hover:underline hover:text-blue-700"
                            onClick={() => router.push(`/item/${item.id}`)}
                          >
                            {item.teamItem.itemName}
                          </div>
                          <div
                            className={`text-xl font-bold ${
                              showEditButton
                                ? "text-blue-600 cursor-pointer hover:underline"
                                : "text-blue-600 cursor-default"
                            }`}
                            onClick={() => {
                              if (showEditButton) onEditQuantity(item);
                            }}
                          >
                            {item.itemQuantity}
                          </div>
                        </div>
                        {/* 품목코드 + 카테고리 */}
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                          <div>코드: {item.teamItem.itemCode}</div>
                          <div>
                            카테고리:{" "}
                            {getCategoryName(
                              item.teamItem.category?.id ??
                                item.teamItem.categoryId
                            )}
                          </div>
                        </div>
                        {/* 메모 */}
                        {item.teamItem.memo && (
                          <div className="text-xs text-gray-600 mb-1">
                            메모: {truncateMemo(item.teamItem.memo)}
                          </div>
                        )}
                        {/* 최종수정일 */}
                        <div className="text-xs text-gray-400 text-right">
                          최종수정:{" "}
                          {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm px-2.5 py-1">
                      해당 카테고리 품목 없음
                    </div>
                  )}
                </>
              )}
            </React.Fragment>
          )
      )}
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
              {grouped["none"].length}개 품목 / 총{" "}
              {calculateTotalQuantity(grouped["none"])}개
            </span>
          </div>
          {openCategories["none"] && (
            <>
              {grouped["none"].map((item, itemIndex) => (
                <div
                  key={`item-card-none-${item.id}-${itemIndex}`}
                  className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 mb-2"
                >
                  {/* 품목명 + 재고수량 */}
                  <div className="flex justify-between items-center mb-1">
                    <div
                      className="text-base font-bold text-blue-700 cursor-pointer hover:underline hover:text-blue-700"
                      onClick={() => router.push(`/item/${item.id}`)}
                    >
                      {item.teamItem.itemName}
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        showEditButton
                          ? "text-blue-600 cursor-pointer hover:underline"
                          : "text-blue-600 cursor-default"
                      }`}
                      onClick={() => {
                        if (showEditButton) onEditQuantity(item);
                      }}
                    >
                      {item.itemQuantity}
                    </div>
                  </div>
                  {/* 품목코드 + 카테고리 */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <div>코드: {item.teamItem.itemCode}</div>
                    <div>카테고리: -</div>
                  </div>
                  {/* 메모 */}
                  {item.teamItem.memo && (
                    <div className="text-xs text-gray-600 mb-1">
                      메모: {truncateMemo(item.teamItem.memo)}
                    </div>
                  )}
                  {/* 최종수정일 */}
                  <div className="text-xs text-gray-400 text-right">
                    최종수정:{" "}
                    {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
