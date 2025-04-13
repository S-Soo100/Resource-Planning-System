/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Modal } from "antd";
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
  return (
    <Modal
      title="재고 수량 수정"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className="rounded-2xl"
    >
      <div className="mt-4">
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
            <p className="font-medium">{quantityEditValues.currentQuantity}</p>
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

        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} className="rounded-xl">
            취소
          </Button>
          <Button
            type="primary"
            onClick={onUpdateQuantity}
            disabled={
              quantityEditValues.newQuantity ===
                quantityEditValues.currentQuantity || !quantityEditValues.reason
            }
            className="rounded-xl"
          >
            수정 완료
          </Button>
        </div>
      </div>
    </Modal>
  );
}
