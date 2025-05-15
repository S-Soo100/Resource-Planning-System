import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types/(item)/item";
import { useCategoryStore } from "@/store/categoryStore";

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

  return (
    <>
      {categories.map((cat) => (
        <React.Fragment key={cat.id}>
          <tr
            onClick={() => handleToggle(String(cat.id))}
            className="cursor-pointer select-none"
          >
            <td
              colSpan={showEditButton ? 7 : 6}
              className="bg-gray-100 font-bold px-6 py-3 text-left text-base text-gray-700"
            >
              <span>{openCategories[String(cat.id)] ? "▼" : "▶"} </span>
              {cat.name}
            </td>
          </tr>
          {openCategories[String(cat.id)] &&
            (grouped[cat.id].length > 0 ? (
              grouped[cat.id].map((item, itemIndex) => (
                <tr
                  key={`item-${item.id}-${itemIndex}`}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                      onClick={() => router.push(`/item/detail/${item.id}`)}
                    >
                      {getCategoryName(
                        item.teamItem.category?.id ?? item.teamItem.categoryId
                      )}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                      onClick={() => router.push(`/item/detail/${item.id}`)}
                    >
                      {item.teamItem.itemCode}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                      onClick={() => router.push(`/item/detail/${item.id}`)}
                    >
                      {item.teamItem.itemName}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {item.itemQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                    {truncateMemo(item.teamItem.memo)}
                  </td>
                  {showEditButton && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex justify-center">
                        <button
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-150 shadow-sm"
                          onClick={() => onEditQuantity(item)}
                        >
                          수정
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showEditButton ? 7 : 6}
                  className="px-6 py-4 text-gray-400 text-sm"
                >
                  해당 카테고리 품목 없음
                </td>
              </tr>
            ))}
        </React.Fragment>
      ))}
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
              <span>{openCategories["none"] ? "▼" : "▶"} </span>카테고리 없음
            </td>
          </tr>
          {openCategories["none"] &&
            grouped["none"].map((item, itemIndex) => (
              <tr
                key={`item-none-${item.id}-${itemIndex}`}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                    onClick={() => router.push(`/item/detail/${item.id}`)}
                  >
                    -
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                    onClick={() => router.push(`/item/detail/${item.id}`)}
                  >
                    {item.teamItem.itemCode}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                    onClick={() => router.push(`/item/detail/${item.id}`)}
                  >
                    {item.teamItem.itemName}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {item.itemQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                  {truncateMemo(item.teamItem.memo)}
                </td>
                {showEditButton && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex justify-center">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-150 shadow-sm"
                        onClick={() => onEditQuantity(item)}
                      >
                        수정
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
        </>
      )}
    </>
  );
}
