import React from "react";
import { Supplier } from "@/types/supplier";
import { Plus } from "lucide-react";

interface SupplierSectionProps {
  suppliers: Supplier[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  focusRingColor?: string;
  onAddSupplier?: () => void;
}

const SupplierSection: React.FC<SupplierSectionProps> = ({
  suppliers,
  onChange,
  focusRingColor = "blue",
  onAddSupplier,
}) => {
  const focusRingClass =
    focusRingColor === "purple"
      ? "focus:ring-purple-500"
      : "focus:ring-blue-500";

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          거래처 정보 입력(법인간 거래시)
        </label>
        {onAddSupplier && (
          <button
            type="button"
            onClick={onAddSupplier}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-3 h-3" />
            거래처 추가
          </button>
        )}
      </div>
      <p className="mb-2 text-xs text-red-500">
        * 거래명세서 발급이 필요한 경우 필수적으로 거래처 정보 입력이 필요합니다.
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
            납품처 목록을 불러올 수 없습니다
          </option>
        )}
      </select>
    </div>
  );
};

export default SupplierSection;
