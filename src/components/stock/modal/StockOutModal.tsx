/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Modal, Select } from "antd";
import React from "react";
import { Warehouse } from "@/types/warehouse";
import { StockTableFormValues } from "../stockTable";

// Select 컴포넌트의 value 타입을 위한 인터페이스 정의
interface SelectOption {
  value: any;
  label: string;
}

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  warehouses: Warehouse[];
  stockFormValues: StockTableFormValues;
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
  const validateAndSubmit = () => {
    // 유효성 검사
    if (!stockFormValues.itemId) {
      alert("품목을 선택해주세요.");
      return;
    }

    if (!stockFormValues.warehouseId) {
      alert("창고를 선택해주세요.");
      return;
    }

    if (
      !stockFormValues.outboundQuantity ||
      stockFormValues.outboundQuantity <= 0
    ) {
      alert("출고 수량은 1개 이상이어야 합니다.");
      return;
    }

    // 선택한 상품의 현재 재고 확인
    const selectedItem = items.find(
      (item) => item.id === stockFormValues.itemId
    );
    if (
      selectedItem &&
      selectedItem.itemQuantity < stockFormValues.outboundQuantity
    ) {
      alert(
        `출고 수량(${stockFormValues.outboundQuantity})이 현재 재고(${selectedItem.itemQuantity})보다 많습니다.`
      );
      return;
    }

    // 모든 유효성 검사 통과 시 onStockOut 호출
    onStockOut();
  };

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
                    label: `${stockFormValues.name} (${stockFormValues.itemId})`,
                  }
                : undefined
            }
            onChange={(selected: SelectOption) => {
              const value = selected.value;
              const selectedItem = items.find((item) => item.id === value);
              console.log("품목 선택:", selected);
              console.log("선택된 품목 데이터:", selectedItem);
              onFormChange("itemId", value);
              if (selectedItem) {
                onFormChange("name", selectedItem.itemName);
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
            value={stockFormValues.outboundQuantity ?? 0}
            onChange={(e) =>
              onFormChange("outboundQuantity", parseInt(e.target.value) || 0)
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
                        (w) => Number(w.id) === stockFormValues.warehouseId
                      )?.warehouseName || "",
                  }
                : undefined
            }
            onChange={(selected: SelectOption) => {
              console.log("창고 선택:", selected);
              onFormChange("warehouseId", selected.value);
            }}
            className="rounded-xl"
          >
            {warehouses.map((warehouse) => (
              <Select.Option key={warehouse.id} value={Number(warehouse.id)}>
                {warehouse.warehouseName}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            설명
          </label>
          <textarea
            placeholder="품목 설명"
            value={stockFormValues.description ?? ""}
            onChange={(e) => onFormChange("description", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            비고
          </label>
          <textarea
            placeholder="출고 관련 메모"
            value={stockFormValues.remarks ?? ""}
            onChange={(e) => onFormChange("remarks", e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} className="rounded-xl">
            취소
          </Button>
          <Button
            type="primary"
            onClick={validateAndSubmit}
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
