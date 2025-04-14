/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Modal, Select } from "antd";
import { Warehouse } from "@/types/warehouse";
import { StockTableFormValues } from "../stockTable";
import { Item } from "@/types/item";

// Select 컴포넌트의 value 타입을 위한 인터페이스 정의
interface SelectOption {
  value: any;
  label: string;
}

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  warehouses: Warehouse[];
  formValue: StockTableFormValues;
  onFormChange: (field: string, value: string | number | null) => void;
  onStockIn: () => void;
}

export default function StockInModal({
  isOpen,
  onClose,
  items,
  warehouses,
  formValue: formValue,
  onFormChange,
  onStockIn,
}: StockInModalProps) {
  const validateAndSubmit = () => {
    // 유효성 검사
    if (!formValue.itemId) {
      alert("품목을 선택해주세요.");
      return;
    }

    if (!formValue.warehouseId) {
      alert("창고를 선택해주세요.");
      return;
    }

    if (!formValue.inboundQuantity || formValue.inboundQuantity <= 0) {
      alert("입고 수량은 1개 이상이어야 합니다.");
      return;
    }

    // 모든 유효성 검사 통과 시 onStockIn 호출
    onStockIn();
  };

  return (
    <Modal
      title="입고 등록"
      open={isOpen}
      onCancel={() => {
        onClose();
      }}
      footer={null}
      className="rounded-2xl"
    >
      <div className="mt-4">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            입고되는 창고 선택
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="창고를 선택해주세요"
            labelInValue
            value={
              formValue.warehouseId
                ? {
                    value: formValue.warehouseId,
                    label:
                      warehouses.find(
                        (w) => Number(w.id) === formValue.warehouseId
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
            품목 선택
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="품목을 선택해주세요"
            // labelInValue
            value={
              formValue.itemId
                ? {
                    value: formValue.itemId,
                    label: `${formValue.name} (${formValue.itemId})`,
                  }
                : undefined
            }
            onChange={(selected: SelectOption) => {
              console.log("selected", selected);
              const selectedItem = items.find((item) => item.id === selected);
              console.log("품목 선택:", selectedItem);
              if (selectedItem) {
                onFormChange("itemId", selectedItem.id);
                onFormChange("name", selectedItem.itemName);
                onFormChange("itemId", selectedItem.id);
                onFormChange("name", selectedItem.itemName);
                onFormChange("itemId", selectedItem.id);
                onFormChange("name", selectedItem.itemName);
                onFormChange("itemId", selectedItem.id);
                onFormChange("name", selectedItem.itemName);
                console.log("selectedItem", selectedItem);
                console.log("selectedItem id", selectedItem.id);
                console.log("selectedItem name", selectedItem.itemName);
                console.log("formValue item", formValue.itemId, formValue.name);
              }
            }}
            showSearch
            optionFilterProp="children"
            className="rounded-xl"
          >
            {items.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.itemName} ({item.itemCode})
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            입고 수량
          </label>
          <input
            type="number"
            min={1}
            value={formValue.inboundQuantity || 0}
            onChange={(e) =>
              onFormChange("inboundQuantity", parseInt(e.target.value) || 0)
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            개당 단가
          </label>
          <input
            type="number"
            min={1}
            value={formValue.price ?? 0}
            onChange={(e) =>
              onFormChange("price", parseInt(e.target.value) || 0)
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            설명
          </label>
          <textarea
            placeholder="품목 설명"
            value={formValue.description ?? ""}
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
            placeholder="입고 관련 메모"
            value={formValue.remarks ?? ""}
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
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            className="rounded-xl"
          >
            입고 처리
          </Button>
        </div>
      </div>
    </Modal>
  );
}
