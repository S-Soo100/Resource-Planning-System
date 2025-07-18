import React from "react";
import { OrderRequestFormData } from "@/types/(order)/orderRequestFormData";
import { Warehouse } from "@/types/warehouse";

interface BasicInfoSectionProps {
  formData: OrderRequestFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onWarehouseChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  warehousesList?: Warehouse[];
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onChange,
  onWarehouseChange,
  warehousesList = [],
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          수령자
        </label>
        <input
          type="text"
          name="receiver"
          value={formData.receiver}
          onChange={onChange}
          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          수령자 연락처
        </label>
        <input
          type="tel"
          name="receiverPhone"
          value={formData.receiverPhone}
          onChange={onChange}
          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          창고 선택
        </label>
        <select
          name="warehouseId"
          value={formData.warehouseId || ""}
          onChange={onWarehouseChange}
          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">창고를 선택하세요</option>
          {warehousesList.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.warehouseName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BasicInfoSection;
