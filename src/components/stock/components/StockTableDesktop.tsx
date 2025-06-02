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
                className="cursor-pointer select-none"
              >
                <td
                  colSpan={showEditButton ? 7 : 6}
                  className="bg-gray-100 font-bold px-6 py-3 text-left text-base text-gray-700"
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {openCategories[String(cat.id)] ? "▼" : "▶"} {cat.name}
                    </span>
                    <span className="text-sm text-gray-500">
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
                      <div className="bg-white rounded-xl shadow border border-gray-200 px-6 py-3 flex flex-row items-center w-full mb-1">
                        <div className="w-1/3 text-left text-sm font-medium text-gray-500">
                          품목명
                        </div>
                        <div className="w-1/3 text-left text-sm font-medium text-gray-500">
                          품목코드
                        </div>
                        <div className="w-1/3 text-right text-sm font-medium text-gray-500">
                          재고수량
                        </div>
                      </div>
                    </td>
                  </tr>
                  {grouped[cat.id].length > 0 ? (
                    grouped[cat.id].map((item, itemIndex) => (
                      <tr key={`item-${item.id}-${itemIndex}`}>
                        <td colSpan={3} className="align-top py-2">
                          <div className="bg-white rounded-xl shadow border border-gray-200 px-6 py-4 flex flex-col gap-0.5 hover:shadow-md transition-shadow duration-200">
                            <div className="flex flex-row items-center w-full">
                              <div className="w-1/3">
                                <a
                                  className="text-blue-500 hover:text-blue-700 hover:underline font-medium transition-colors duration-150 cursor-pointer"
                                  onClick={() =>
                                    router.push(`/item/${item.id}`)
                                  }
                                >
                                  {item.teamItem.itemName}
                                </a>
                              </div>
                              <div className="w-1/3 text-left text-sm text-gray-600">
                                {item.teamItem.itemCode}
                              </div>
                              <div className="w-1/3 text-right">
                                {showEditButton ? (
                                  <button
                                    className="text-blue-600 font-bold text-lg px-2 py-1 rounded hover:bg-blue-50 border border-transparent hover:border-blue-300 transition-colors duration-150"
                                    onClick={() => onEditQuantity(item)}
                                  >
                                    {item.itemQuantity}
                                  </button>
                                ) : (
                                  <span className="text-blue-600 font-bold text-lg">
                                    {item.itemQuantity}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-row items-center w-full bg-gray-50/50 rounded-b-xl mt-2">
                              <div className="w-1/2 text-sm text-gray-500">
                                최종수정일:{" "}
                                {new Date(item.updatedAt).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </div>
                              <div className="w-1/2 text-sm text-gray-500 text-right">
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
                        className="px-6 py-4 text-gray-400 text-sm"
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
            className="cursor-pointer select-none"
          >
            <td
              colSpan={showEditButton ? 7 : 6}
              className="bg-gray-100 font-bold px-6 py-3 text-left text-base text-gray-700"
            >
              <div className="flex justify-between items-center">
                <span>{openCategories["none"] ? "▼" : "▶"} 카테고리 없음</span>
                <span className="text-sm text-gray-500">
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
                  <div className="bg-white rounded-xl shadow border border-gray-200 px-6 py-3 flex flex-row items-center w-full mb-1">
                    <div className="w-1/3 text-left text-sm font-medium text-gray-500">
                      품목명
                    </div>
                    <div className="w-1/3 text-left text-sm font-medium text-gray-500">
                      품목코드
                    </div>
                    <div className="w-1/3 text-right text-sm font-medium text-gray-500">
                      재고수량
                    </div>
                  </div>
                </td>
              </tr>
              {grouped["none"].map((item, itemIndex) => (
                <tr key={`item-none-${item.id}-${itemIndex}`}>
                  <td colSpan={3} className="align-top py-2">
                    <div className="bg-white rounded-xl shadow border border-gray-200 px-6 py-4 flex flex-col gap-0.5 hover:shadow-md transition-shadow duration-200">
                      <div className="flex flex-row items-center w-full">
                        <div className="w-1/3">
                          <a
                            className="text-blue-500 hover:text-blue-700 hover:underline font-medium transition-colors duration-150 cursor-pointer"
                            onClick={() => router.push(`/item/${item.id}`)}
                          >
                            {item.teamItem.itemName}
                          </a>
                        </div>
                        <div className="w-1/3 text-left text-sm text-gray-600">
                          {item.teamItem.itemCode}
                        </div>
                        <div className="w-1/3 text-right">
                          {showEditButton ? (
                            <button
                              className="text-blue-600 font-bold text-lg px-2 py-1 rounded hover:bg-blue-50 border border-transparent hover:border-blue-300 transition-colors duration-150"
                              onClick={() => onEditQuantity(item)}
                            >
                              {item.itemQuantity}
                            </button>
                          ) : (
                            <span className="text-blue-600 font-bold text-lg">
                              {item.itemQuantity}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row items-center w-full bg-gray-50/50 rounded-b-xl mt-2">
                        <div className="w-1/2 text-sm text-gray-500">
                          최종수정일:{" "}
                          {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                        </div>
                        <div className="w-1/2 text-sm text-gray-500 text-right">
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
