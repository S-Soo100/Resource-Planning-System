/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Modal, Select } from "antd";
import React from "react";
import { TeamWarehouse } from "@/types/warehouse";

// Select 컴포넌트의 value 타입을 위한 인터페이스 정의
interface SelectOption {
  value: any;
  label: string;
}

interface StockFormValues {
  itemId: number | null;
  itemCode: string;
  itemName: string;
  quantity: number;
  warehouseId: number;
  note: string;
}

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  warehouses: TeamWarehouse[];
  stockFormValues: StockFormValues;
  onFormChange: (field: string, value: string | number | null) => void;
  onStockOut: () => void;
}

export default function StockOutModal({
  isOpen,
  onClose,
  items,
  warehouses,
  stockFormValues,
  onFormChange,
  onStockOut,
}: StockOutModalProps) {
  return (
    <Modal
      title="출고 등록"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className="rounded-2xl"
    >
      <div className="mt-4">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            품목 선택
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="품목을 선택해주세요"
            labelInValue
            value={
              stockFormValues.itemId
                ? {
                    value: stockFormValues.itemId,
                    label: `${stockFormValues.itemName} (${stockFormValues.itemCode})`,
                  }
                : undefined
            }
            onChange={(selected: SelectOption) => {
              const value = selected.value;
              const selectedItem = items.find((item) => item.id === value);
              onFormChange("itemId", value);
              if (selectedItem) {
                onFormChange("itemCode", selectedItem.itemCode);
                onFormChange("itemName", selectedItem.itemName);
              }
            }}
            showSearch
            optionFilterProp="children"
            className="rounded-xl"
          >
            {items.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.itemName} ({item.itemCode}) - 재고: {item.itemQuantity}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            출고 수량
          </label>
          <input
            type="number"
            min={1}
            value={stockFormValues.quantity}
            onChange={(e) =>
              onFormChange("quantity", parseInt(e.target.value) || 0)
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            창고 선택
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="창고를 선택해주세요"
            labelInValue
            value={
              stockFormValues.warehouseId
                ? {
                    value: stockFormValues.warehouseId,
                    label:
                      warehouses.find(
                        (w) => w.id === stockFormValues.warehouseId
                      )?.warehouseName || "",
                  }
                : undefined
            }
            onChange={(selected: SelectOption) => {
              onFormChange("warehouseId", selected.value);
            }}
            className="rounded-xl"
          >
            {warehouses.map((warehouse) => (
              <Select.Option key={warehouse.id} value={warehouse.id}>
                {warehouse.warehouseName}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            비고
          </label>
          <textarea
            placeholder="출고 관련 메모"
            value={stockFormValues.note}
            onChange={(e) => onFormChange("note", e.target.value)}
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
            onClick={onStockOut}
            disabled={
              !stockFormValues.itemId ||
              stockFormValues.quantity <= 0 ||
              !stockFormValues.warehouseId
            }
            danger
            className="rounded-xl"
          >
            출고 처리
          </Button>
        </div>
      </div>
    </Modal>
  );
}
