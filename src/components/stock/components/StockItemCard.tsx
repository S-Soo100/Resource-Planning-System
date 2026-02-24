import React, { useState, useEffect } from "react";
import { Item } from "@/types/(item)/item";
import { useCategory } from "@/hooks/useCategory";
import { useRouter } from "next/navigation";
import { authStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatCurrency } from "@/utils/stockAssetCalculator";

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
  const selectedTeam = authStore((state) => state.selectedTeam);
  const { categories } = useCategory(selectedTeam?.id);
  const router = useRouter();
  const { user } = useCurrentUser();

  // 권한 체크: Admin, Moderator만 원가 정보 열람 가능
  const canViewCostPrice = user?.accessLevel === 'admin' || user?.accessLevel === 'moderator';

  const [openCategories, setOpenCategories] = useState<{
    [key: string]: boolean;
  }>({
    none: true, // 카테고리 없는 항목들은 기본적으로 열어둠
  });

  // 카테고리가 로드되면 모든 카테고리를 열린 상태로 설정
  useEffect(() => {
    if (categories.length > 0) {
      const initial: { [key: string]: boolean } = { none: true };
      categories.forEach((cat) => {
        initial[cat.id] = true; // 모든 카테고리를 기본적으로 열어둠
      });
      setOpenCategories(initial);
    }
  }, [categories]);

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
    <div className="grid grid-cols-1 gap-1">
      {categories.map(
        (cat) =>
          grouped[cat.id].length > 0 && (
            <React.Fragment key={cat.id}>
              <div
                className="bg-gray-200 font-semibold px-3 py-1.5 text-sm text-gray-800 mb-1 mt-1.5 cursor-pointer select-none flex items-center justify-between border-b-2 border-gray-400"
                onClick={() => handleToggle(String(cat.id))}
              >
                <span className="flex items-center uppercase tracking-wide">
                  <span className="mr-1">
                    {openCategories[String(cat.id)] ? "▼" : "▶"}
                  </span>
                  {cat.name}
                </span>
                <span className="text-xs text-gray-600 font-normal">
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
                        className="bg-white border border-gray-300 p-2 mb-1.5 hover:bg-gray-50"
                      >
                        {/* 품목명 + 재고수량 */}
                        <div className="flex justify-between items-center mb-1">
                          <div
                            className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-black hover:underline leading-tight"
                            onClick={() => router.push(`/item/${item.id}`)}
                          >
                            {item.teamItem.itemName}
                          </div>
                          <div
                            className={`text-base font-semibold ${
                              showEditButton
                                ? "text-gray-900 cursor-pointer hover:bg-gray-100 border border-gray-300 px-1.5 py-0.5 text-sm"
                                : "text-gray-900 cursor-default"
                            }`}
                            onClick={() => {
                              if (showEditButton) onEditQuantity(item);
                            }}
                          >
                            {item.itemQuantity}
                          </div>
                        </div>
                        {/* 품목코드 + 카테고리 */}
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-1 border-t border-gray-100 pt-1">
                          <div className="font-mono">
                            코드:{" "}
                            <span
                              onClick={() => router.push(`/item/${item.id}`)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                            >
                              {item.teamItem.itemCode}
                            </span>
                          </div>
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
                          <div className="text-xs text-gray-500 mb-1">
                            메모: {truncateMemo(item.teamItem.memo, 20)}
                          </div>
                        )}
                        {/* 원가/자산 가치 (권한 있는 사용자만) */}
                        {canViewCostPrice && (
                          <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-1 mt-1">
                            <div className="text-gray-600">
                              원가:{" "}
                              {item.teamItem?.costPrice ? (
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(item.teamItem.costPrice)}
                                </span>
                              ) : (
                                <span className="text-yellow-600">미입력</span>
                              )}
                            </div>
                            <div className="text-gray-600">
                              재고 가치:{" "}
                              {item.teamItem?.costPrice ? (
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(item.teamItem.costPrice * item.itemQuantity)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </div>
                        )}
                        {/* 최종수정일 */}
                        <div className="text-xs text-gray-400 text-right">
                          수정:{" "}
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
            className="bg-gray-200 font-semibold px-3 py-1.5 text-sm text-gray-800 mb-1 mt-1.5 cursor-pointer select-none flex items-center justify-between border-b-2 border-gray-400"
            onClick={() => handleToggle("none")}
          >
            <span className="flex items-center uppercase tracking-wide">
              <span className="mr-1">{openCategories["none"] ? "▼" : "▶"}</span>
              카테고리 없음
            </span>
            <span className="text-xs text-gray-600 font-normal">
              {grouped["none"].length}개 품목 / 총{" "}
              {calculateTotalQuantity(grouped["none"])}개
            </span>
          </div>
          {openCategories["none"] && (
            <>
              {grouped["none"].map((item, itemIndex) => (
                <div
                  key={`item-card-none-${item.id}-${itemIndex}`}
                  className="bg-white border border-gray-300 p-2 mb-1.5 hover:bg-gray-50"
                >
                  {/* 품목명 + 재고수량 */}
                  <div className="flex justify-between items-center mb-1">
                    <div
                      className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-black hover:underline leading-tight"
                      onClick={() => router.push(`/item/${item.id}`)}
                    >
                      {item.teamItem.itemName}
                    </div>
                    <div
                      className={`text-base font-semibold ${
                        showEditButton
                          ? "text-gray-900 cursor-pointer hover:bg-gray-100 border border-gray-300 px-1.5 py-0.5 text-sm"
                          : "text-gray-900 cursor-default"
                      }`}
                      onClick={() => {
                        if (showEditButton) onEditQuantity(item);
                      }}
                    >
                      {item.itemQuantity}
                    </div>
                  </div>
                  {/* 품목코드 + 카테고리 */}
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-1 border-t border-gray-100 pt-1">
                    <div className="font-mono">
                      코드: {item.teamItem.itemCode}
                    </div>
                    <div>카테고리: -</div>
                  </div>
                  {/* 메모 */}
                  {item.teamItem.memo && (
                    <div className="text-xs text-gray-500 mb-1">
                      메모: {truncateMemo(item.teamItem.memo, 20)}
                    </div>
                  )}
                  {/* 원가/자산 가치 (권한 있는 사용자만) */}
                  {canViewCostPrice && (
                    <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-1 mt-1">
                      <div className="text-gray-600">
                        원가:{" "}
                        {item.teamItem?.costPrice ? (
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.teamItem.costPrice)}
                          </span>
                        ) : (
                          <span className="text-yellow-600">미입력</span>
                        )}
                      </div>
                      <div className="text-gray-600">
                        재고 가치:{" "}
                        {item.teamItem?.costPrice ? (
                          <span className="font-semibold text-green-600">
                            {formatCurrency(item.teamItem.costPrice * item.itemQuantity)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* 최종수정일 */}
                  <div className="text-xs text-gray-400 text-right">
                    수정: {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
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
