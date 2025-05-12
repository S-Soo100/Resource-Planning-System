import React from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types/item";

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

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500 mb-4">창고가 비었습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item, itemIndex) => (
        <div
          key={`item-card-${item.id}-${itemIndex}`}
          className="bg-white rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center">
            <div
              className="flex-1 cursor-pointer"
              onClick={() => router.push(`/item/detail/${item.id}`)}
            >
              <div className="text-blue-500 font-medium text-lg">
                {item.itemName}
              </div>
              <div className="text-gray-500 text-sm">{item.itemCode}</div>
              <div className="text-xs text-gray-400 mt-1">
                최종수정: {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
              </div>
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
    </div>
  );
}
