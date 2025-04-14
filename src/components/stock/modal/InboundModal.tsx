/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

interface InboundValues {
  itemId?: number | null;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  date: string;
  location?: string;
  remarks?: string;
  warehouseId: number;
}

interface InboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  inboundValues: InboundValues;
  onFormChange: (field: string, value: string | number | null) => void;
  onSubmitInbound: () => void;
  warehouseItems: any[];
  selectedItem: any | null;
}

export default function InboundModal({
  isOpen,
  onClose,
  inboundValues,
  onFormChange,
  onSubmitInbound,
  warehouseItems,
  selectedItem,
}: InboundModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  입고 등록
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    품목 선택
                  </label>
                  <select
                    value={inboundValues.itemId || ""}
                    onChange={(e) => {
                      const selectedItemId = e.target.value
                        ? parseInt(e.target.value)
                        : null;
                      onFormChange("itemId", selectedItemId);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  >
                    <option value="">품목을 선택하세요</option>
                    {warehouseItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.itemName} ({item.itemCode})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItem && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      선택된 품목 정보
                    </label>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="font-medium">{selectedItem.itemName}</p>
                      <p className="text-gray-600 text-sm">
                        {selectedItem.itemCode}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        현재 재고: {selectedItem.itemQuantity}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    입고 수량
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={inboundValues.quantity}
                    onChange={(e) =>
                      onFormChange("quantity", parseInt(e.target.value) || 0)
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    입고 날짜
                  </label>
                  <input
                    type="date"
                    value={inboundValues.date}
                    onChange={(e) => onFormChange("date", e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    입고 위치
                  </label>
                  <input
                    type="text"
                    value={inboundValues.location || ""}
                    onChange={(e) => onFormChange("location", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    비고
                  </label>
                  <textarea
                    placeholder="추가 정보를 입력하세요"
                    value={inboundValues.remarks || ""}
                    onChange={(e) => onFormChange("remarks", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onSubmitInbound}
              disabled={
                !inboundValues.itemId ||
                inboundValues.quantity <= 0 ||
                !inboundValues.date
              }
              className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              입고 완료
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
