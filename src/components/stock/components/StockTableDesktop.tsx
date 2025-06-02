import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types/(item)/item";
import { useCategory } from "@/hooks/useCategory";
import { authStore } from "@/store/authStore";

interface StockTableDesktopProps {
  items: Item[];
  onEditQuantity: (item: Item) => void;
  showEditButton?: boolean;
}

export default function StockTableDesktop({
  items,
  onEditQuantity,
  showEditButton = true,
}: StockTableDesktopProps) {
  const router = useRouter();
  const selectedTeam = authStore((state) => state.selectedTeam);
  const { categories } = useCategory(selectedTeam?.id);
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

  if (items.length === 0) {
    return (
      <tr>
        <td colSpan={showEditButton ? 7 : 6} className="px-6 py-8 text-center">
          <div className="py-6">
            <p className="text-lg text-gray-500 mb-4">창고가 비었습니다.</p>
          </div>
        </td>
      </tr>
    );
  }

  // 메모 텍스트를 최대 길이로 제한하는 함수
  const truncateMemo = (memo: string | null, maxLength = 30) => {
    if (!memo) return "-";
    return memo.length > maxLength
      ? `${memo.substring(0, maxLength)}...`
      : memo;
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

  return (
    <>
      {categories.map(
        (cat) =>
          grouped[cat.id].length > 0 && (
            <React.Fragment key={cat.id}>
              <tr
                onClick={() => handleToggle(String(cat.id))}
                className="cursor-pointer select-none border-b-2 border-gray-400"
              >
                <td
                  colSpan={showEditButton ? 7 : 6}
                  className="bg-gray-200 font-semibold px-4 py-3 text-left text-sm text-gray-800"
                >
                  <div className="flex justify-between items-center">
                    <span className="uppercase tracking-wide">
                      {openCategories[String(cat.id)] ? "▼" : "▶"} {cat.name}
                    </span>
                    <span className="text-xs text-gray-600 font-normal">
                      {grouped[cat.id].length}개 품목 / 총{" "}
                      {calculateTotalQuantity(grouped[cat.id])}개
                    </span>
                  </div>
                </td>
              </tr>
              {openCategories[String(cat.id)] && (
                <>
                  <tr>
                    <td colSpan={3} className="align-top pb-0">
                      <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex flex-row items-center w-full">
                        <div className="w-1/3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          품목명
                        </div>
                        <div className="w-1/3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          품목코드
                        </div>
                        <div className="w-1/3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          재고수량
                        </div>
                      </div>
                    </td>
                  </tr>
                  {grouped[cat.id].length > 0 ? (
                    grouped[cat.id].map((item, itemIndex) => (
                      <tr
                        key={`item-${item.id}-${itemIndex}`}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td colSpan={3} className="align-top py-0">
                          <div className="bg-white px-4 py-3 flex flex-col">
                            <div className="flex flex-row items-center w-full">
                              <div className="w-1/3">
                                <a
                                  className="text-gray-900 hover:text-black hover:underline font-medium cursor-pointer"
                                  onClick={() =>
                                    router.push(`/item/${item.id}`)
                                  }
                                >
                                  {item.teamItem.itemName}
                                </a>
                              </div>
                              <div className="w-1/3 text-left text-sm text-gray-600 font-mono">
                                {item.teamItem.itemCode}
                              </div>
                              <div className="w-1/3 text-right">
                                {showEditButton ? (
                                  <button
                                    className="text-gray-900 font-semibold text-base px-2 py-1 hover:bg-gray-100 border border-gray-300 hover:border-gray-400"
                                    onClick={() => onEditQuantity(item)}
                                  >
                                    {item.itemQuantity}
                                  </button>
                                ) : (
                                  <span className="text-gray-900 font-semibold text-base">
                                    {item.itemQuantity}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-row items-center w-full mt-2 pt-2 border-t border-gray-100">
                              <div className="w-1/2 text-xs text-gray-500">
                                최종수정:{" "}
                                {new Date(item.updatedAt).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </div>
                              <div className="w-1/2 text-xs text-gray-500 text-right">
                                메모: {truncateMemo(item.teamItem.memo)}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-gray-400 text-sm border-b border-gray-200"
                      >
                        해당 카테고리 품목 없음
                      </td>
                    </tr>
                  )}
                </>
              )}
            </React.Fragment>
          )
      )}
      {/* 카테고리 없는 아이템 */}
      {grouped["none"].length > 0 && (
        <>
          <tr
            onClick={() => handleToggle("none")}
            className="cursor-pointer select-none border-b-2 border-gray-400"
          >
            <td
              colSpan={showEditButton ? 7 : 6}
              className="bg-gray-200 font-semibold px-4 py-3 text-left text-sm text-gray-800"
            >
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-wide">
                  {openCategories["none"] ? "▼" : "▶"} 카테고리 없음
                </span>
                <span className="text-xs text-gray-600 font-normal">
                  {grouped["none"].length}개 품목 / 총{" "}
                  {calculateTotalQuantity(grouped["none"])}개
                </span>
              </div>
            </td>
          </tr>
          {openCategories["none"] && (
            <>
              <tr>
                <td colSpan={3} className="align-top pb-0">
                  <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex flex-row items-center w-full">
                    <div className="w-1/3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      품목명
                    </div>
                    <div className="w-1/3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      품목코드
                    </div>
                    <div className="w-1/3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      재고수량
                    </div>
                  </div>
                </td>
              </tr>
              {grouped["none"].map((item, itemIndex) => (
                <tr
                  key={`item-none-${item.id}-${itemIndex}`}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td colSpan={3} className="align-top py-0">
                    <div className="bg-white px-4 py-3 flex flex-col">
                      <div className="flex flex-row items-center w-full">
                        <div className="w-1/3">
                          <a
                            className="text-gray-900 hover:text-black hover:underline font-medium cursor-pointer"
                            onClick={() => router.push(`/item/${item.id}`)}
                          >
                            {item.teamItem.itemName}
                          </a>
                        </div>
                        <div className="w-1/3 text-left text-sm text-gray-600 font-mono">
                          {item.teamItem.itemCode}
                        </div>
                        <div className="w-1/3 text-right">
                          {showEditButton ? (
                            <button
                              className="text-gray-900 font-semibold text-base px-2 py-1 hover:bg-gray-100 border border-gray-300 hover:border-gray-400"
                              onClick={() => onEditQuantity(item)}
                            >
                              {item.itemQuantity}
                            </button>
                          ) : (
                            <span className="text-gray-900 font-semibold text-base">
                              {item.itemQuantity}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row items-center w-full mt-2 pt-2 border-t border-gray-100">
                        <div className="w-1/2 text-xs text-gray-500">
                          최종수정:{" "}
                          {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                        </div>
                        <div className="w-1/2 text-xs text-gray-500 text-right">
                          메모: {truncateMemo(item.teamItem.memo)}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}
