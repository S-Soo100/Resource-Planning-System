import React from "react";
import { Supplier } from "@/types/supplier";

interface SupplierSectionProps {
  suppliers: Supplier[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  focusRingColor?: string;
}

const SupplierSection: React.FC<SupplierSectionProps> = ({
  suppliers,
  onChange,
  focusRingColor = "blue",
}) => {
  const focusRingClass =
    focusRingColor === "purple"
      ? "focus:ring-purple-500"
      : "focus:ring-blue-500";

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        거래처 선택
      </label>
      <p className="mb-2 text-xs text-red-500">
        * 미리 등록한 업체 정보가 있는 경우에만 선택
      </p>
      <select
        name="supplier"
        onChange={onChange}
        className={`px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
      >
        <option value="0">거래처 선택</option>
        {Array.isArray(suppliers) && suppliers?.length > 0 ? (
          suppliers.map((supplier: Supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.supplierName}
            </option>
          ))
        ) : (
          <option value="" disabled>
            거래처 목록을 불러올 수 없습니다
          </option>
        )}
      </select>
    </div>
  );
};

export default SupplierSection;
