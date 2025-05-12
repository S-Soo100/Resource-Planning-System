import React from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types/item";

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

  if (items.length === 0) {
    return (
      <tr>
        <td colSpan={showEditButton ? 6 : 5} className="px-6 py-8 text-center">
          <div className="py-6">
            <p className="text-lg text-gray-500 mb-4">창고가 비었습니다.</p>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {items.map((item, itemIndex) => (
        <tr
          key={`item-${item.id}-${itemIndex}`}
          className="hover:bg-gray-50 transition-colors duration-150"
        >
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
            {item.id}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <a
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
              onClick={() => router.push(`/item/detail/${item.id}`)}
            >
              {item.itemCode}
            </a>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <a
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
              onClick={() => router.push(`/item/detail/${item.id}`)}
            >
              {item.itemName}
            </a>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
            {item.itemQuantity}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
            {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
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
  );
}
