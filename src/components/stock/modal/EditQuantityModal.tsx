"use client";

import React from "react";
import { Button, Input, Modal } from "@/components/ui";

interface QuantityEditValues {
  itemId: number | null;
  itemCode: string;
  itemName: string;
  currentQuantity: number;
  newQuantity: number;
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
    <Modal isOpen={isOpen} onClose={onClose} title="재고 수량 수정" size="md">
      <div className="p-6">
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
          <Input
            type="number"
            label="새 수량"
            value={quantityEditValues.newQuantity}
            onChange={(e) =>
              onFormChange("newQuantity", parseInt(e.target.value) || 0)
            }
            min={0}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="default" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={onUpdateQuantity}
            disabled={
              quantityEditValues.newQuantity ===
              quantityEditValues.currentQuantity
            }
          >
            수정 완료
          </Button>
        </div>
      </div>
    </Modal>
  );
}
