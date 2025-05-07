import React from "react";
import { useRouter } from "next/navigation";

interface StockTableMobileProps {
  items: any[];
  onEditQuantity: (item: any) => void;
}

export default function StockTableMobile({
  items,
  onEditQuantity,
}: StockTableMobileProps) {
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
          className="bg-white rounded-xl shadow-sm p-4 space-y-3"
        >
          <div className="flex justify-between items-start">
            <div>
              <div
                className="text-blue-500 font-medium text-lg mb-1 cursor-pointer"
                onClick={() => router.push(`/item/detail/${item.id}`)}
              >
                {item.itemName}
              </div>
              <div className="text-gray-500 text-sm">{item.itemCode}</div>
            </div>
            <button
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-150 shadow-sm"
              onClick={() => onEditQuantity(item)}
            >
              수정
            </button>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div>
              <div className="text-gray-500 text-sm">재고수량</div>
              <div className="font-medium">{item.itemQuantity}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-sm">최종수정일</div>
              <div className="text-sm">
                {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
