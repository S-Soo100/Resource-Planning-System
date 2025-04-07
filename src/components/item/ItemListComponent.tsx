"use client";

import ItemTableComponent from "@/components/item/(itemTable)/ItemTabelComponent";
import { useAllInventories } from "@/hooks/useAllInventories";
// import { useUpdateItem } from "@/hooks/useUpdateItem";
import { useState } from "react";

export default function ItemListComponent() {
  const { items, isLoading, isError } = useAllInventories();
  // const updateItemMutation = useUpdateItem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustments, setAdjustments] = useState<{ [key: number]: number }>({});

  const handleOpenModal = () => {
    setAdjustments({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAdjustmentChange = (itemId: number, value: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleUpdateInventory = () => {
    const updates = Object.entries(adjustments)
      .filter(([, adj]) => adj !== 0)
      .map(([itemId, adj]) => {
        const item = items?.find((i) => i.id === Number(itemId));
        if (item) {
          return {
            id: item.id,
            itemQuantity: item.itemQuantity + adj,
          };
        }
      })
      .filter(Boolean);

    if (updates.length === 0) {
      alert("변경된 값이 없습니다.");
      return;
    }

    // TODO: 재고 업데이트 로직 구현
    alert("재고 업데이트 기능이 준비 중입니다.");
    handleCloseModal();
  };

  if (isLoading) return <div>Loading Data...</div>;
  if (isError) return <div>Error loading inventory data.</div>;

  return (
    <>
      <ItemTableComponent />

      {/* Floating Action Button */}
      <button
        onClick={handleOpenModal}
        className="fixed px-6 py-4 font-bold text-white transition-all bg-blue-500 rounded-full shadow-lg bottom-8 right-8 hover:bg-blue-700"
      >
        Update Inventory
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg w-96">
            <h2 className="mb-4 text-lg font-semibold">Update Inventory</h2>

            <ul className="space-y-3">
              {items?.map((item) => (
                <li
                  key={`inventory-item-${item.id}`}
                  className="flex items-center justify-between pb-2 border-b"
                >
                  <span>
                    {item.itemName} ({item.itemQuantity}개)
                  </span>
                  <input
                    type="number"
                    className="w-16 p-1 text-center border"
                    placeholder="0"
                    value={adjustments[item.id] || ""}
                    onChange={(e) =>
                      handleAdjustmentChange(item.id, Number(e.target.value))
                    }
                  />
                </li>
              ))}
            </ul>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-3 py-2 text-white bg-gray-500 rounded"
              >
                취소
              </button>
              <button
                onClick={handleUpdateInventory}
                className="px-3 py-2 text-white bg-green-500 rounded"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
