"use client";

import ItemTableComponent from "@/components/item/(itemTable)/ItemTabelComponent";
import { useItems } from "@/hooks/useItems";
import { useUpdateItem } from "@/hooks/useUpdateItem";
import { useState } from "react";

export default function ItemListComponent() {
  const { data: items, isLoading, isError } = useItems();
  const updateItemMutation = useUpdateItem();
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, adj]) => adj !== 0) // 증감값이 0이 아닌 경우만 업데이트
      .map(([itemId, adj]) => {
        const item = items?.find((i) => i.itemId === Number(itemId));
        if (item) {
          return {
            itemId: item.itemId,
            itemQuantity: item.itemQuantity + adj,
          };
        }
      })
      .filter(Boolean); // `undefined` 제거

    if (updates.length === 0) {
      alert("변경된 값이 없습니다.");
      return;
    }

    // 여러 개의 업데이트 요청을 병렬 실행
    Promise.all(
      updates.map((update) => updateItemMutation.mutateAsync(update!))
    )
      .then(() => {
        alert("재고 업데이트 완료!");
        handleCloseModal();
      })
      .catch(() => {
        alert("업데이트 중 오류가 발생했습니다.");
      });
  };

  if (isLoading) return <div>Loading Data...</div>;
  if (isError) return <div>Error loading inventory data.</div>;

  return (
    <>
      <ItemTableComponent />

      {/* Floating Action Button */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition-all"
      >
        Update Inventory
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Update Inventory</h2>

            <ul className="space-y-3">
              {items?.map((item) => (
                <li
                  key={item.itemId}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span>
                    {item.itemName} ({item.itemQuantity}개)
                  </span>
                  <input
                    type="number"
                    className="w-16 border p-1 text-center"
                    placeholder="0"
                    value={adjustments[item.itemId] || ""}
                    onChange={(e) =>
                      handleAdjustmentChange(
                        item.itemId,
                        Number(e.target.value)
                      )
                    }
                  />
                </li>
              ))}
            </ul>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCloseModal}
                className="bg-gray-500 text-white px-3 py-2 rounded"
              >
                취소
              </button>
              <button
                onClick={handleUpdateInventory}
                className="bg-green-500 text-white px-3 py-2 rounded"
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
