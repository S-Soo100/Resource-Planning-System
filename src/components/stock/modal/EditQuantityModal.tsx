/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

interface QuantityEditValues {
  itemId: number | null;
  itemCode: string;
  itemName: string;
  currentQuantity: number;
  newQuantity: number;
  reason: string;
  warehouseId: number;
}

interface EditQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  quantityEditValues: QuantityEditValues;
  onFormChange: (field: string, value: string | number) => void;
  onUpdateQuantity: () => void;
}

export default function EditQuantityModal({
  isOpen,
  onClose,
  quantityEditValues,
  onFormChange,
  onUpdateQuantity,
}: EditQuantityModalProps) {
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
                  재고 수량 수정
                </h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    품목 정보
                  </label>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-medium">{quantityEditValues.itemName}</p>
                    <p className="text-gray-600 text-sm">
                      {quantityEditValues.itemCode}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    현재 수량
                  </label>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-medium">
                      {quantityEditValues.currentQuantity}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    새 수량
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quantityEditValues.newQuantity}
                    onChange={(e) =>
                      onFormChange("newQuantity", parseInt(e.target.value) || 0)
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    수정 사유
                  </label>
                  <textarea
                    placeholder="수량 수정 사유를 입력해주세요"
                    value={quantityEditValues.reason}
                    onChange={(e) => onFormChange("reason", e.target.value)}
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
              onClick={onUpdateQuantity}
              disabled={
                quantityEditValues.newQuantity ===
                  quantityEditValues.currentQuantity ||
                !quantityEditValues.reason
              }
              className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              수정 완료
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
