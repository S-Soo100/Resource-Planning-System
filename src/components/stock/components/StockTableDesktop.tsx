import React from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types/(item)/item";
import { Package } from "lucide-react";

interface StockTableDesktopProps {
  items: Item[];
  onEditQuantity: (item: Item) => void;
  showEditButton?: boolean;
}

// 카테고리별 색상 매핑
const getCategoryColor = (categoryName: string): string => {
  const colorMap: { [key: string]: string } = {
    "전동휠체어": "bg-purple-500",
    "수동휠체어": "bg-blue-500",
    "액세서리": "bg-green-500",
    "부품": "bg-orange-500",
    "기타": "bg-gray-500",
  };

  return colorMap[categoryName] || "bg-indigo-500";
};

// 카테고리 태그 색상
const getCategoryTagColor = (categoryName: string): string => {
  const colorMap: { [key: string]: string } = {
    "전동휠체어": "bg-purple-100 text-purple-700",
    "수동휠체어": "bg-blue-100 text-blue-700",
    "액세서리": "bg-green-100 text-green-700",
    "부품": "bg-orange-100 text-orange-700",
    "기타": "bg-gray-100 text-gray-700",
  };

  return colorMap[categoryName] || "bg-indigo-100 text-indigo-700";
};

export default function StockTableDesktop({
  items,
  onEditQuantity,
  showEditButton = true,
}: StockTableDesktopProps) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-12 text-center">
          <p className="text-gray-400">창고가 비었습니다.</p>
        </td>
      </tr>
    );
  }

  return (
    <>
      {/* 테이블 헤더 */}
      <tr className="border-b border-gray-200 bg-gray-50">
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          카테고리
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          품목명
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          품목코드
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          재고수량
        </th>
      </tr>

      {/* 테이블 본문 */}
      {items.map((item, index) => {
        const categoryName = item.teamItem?.category?.name || "기타";
        const colorClass = getCategoryColor(categoryName);
        const tagColorClass = getCategoryTagColor(categoryName);

        return (
          <tr
            key={`item-${item.id}-${index}`}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => router.push(`/item/${item.id}`)}
          >
            {/* 색상 아이콘 */}
            <td className="px-6 py-4">
              <div className="flex items-center justify-center">
                {item.teamItem?.imageUrl ? (
                  <img
                    src={item.teamItem.imageUrl}
                    alt={item.teamItem.itemName}
                    className="w-8 h-8 rounded-md object-cover border border-gray-200"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-md ${colorClass} flex items-center justify-center`}>
                    <Package className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </td>

            {/* 카테고리 태그 */}
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColorClass}`}>
                {categoryName}
              </span>
            </td>

            {/* 품목명 */}
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">
                {item.teamItem.itemName}
              </div>
              {item.teamItem.memo && (
                <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                  {item.teamItem.memo}
                </div>
              )}
            </td>

            {/* 품목코드 */}
            <td className="px-6 py-4">
              <div className="text-sm text-blue-600 font-mono">
                {item.teamItem.itemCode}
              </div>
            </td>

            {/* 재고수량 */}
            <td className="px-6 py-4 text-right">
              {showEditButton ? (
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditQuantity(item);
                  }}
                >
                  {item.itemQuantity}
                </button>
              ) : (
                <span className="text-sm font-semibold text-gray-900">
                  {item.itemQuantity}
                </span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}
