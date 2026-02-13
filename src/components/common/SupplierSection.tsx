import React from "react";
import { Supplier } from "@/types/supplier";
import { Plus } from "lucide-react";

interface SupplierSectionProps {
  suppliers: Supplier[];
  selectedSupplierId?: number | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  focusRingColor?: string;
  onAddSupplier?: () => void;
}

const SupplierSection: React.FC<SupplierSectionProps> = ({
  suppliers,
  selectedSupplierId,
  onChange,
  focusRingColor = "blue",
  onAddSupplier,
}) => {
  const focusRingClass =
    focusRingColor === "purple"
      ? "focus:ring-purple-500"
      : "focus:ring-blue-500";

  const bgColorClass =
    focusRingColor === "purple" ? "bg-purple-50" : "bg-blue-50";

  const borderColorClass =
    focusRingColor === "purple"
      ? "border-purple-200"
      : "border-blue-200";

  const selectedSupplier = suppliers?.find((s) => s.id === selectedSupplierId);

  return (
    <div
      className={`p-5 ${bgColorClass} border-2 ${borderColorClass} rounded-lg shadow-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <label className="block text-base font-semibold text-gray-800">
            고객 선택
          </label>
          <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded">
            필수
          </span>
        </div>
        {onAddSupplier && (
          <button
            type="button"
            onClick={onAddSupplier}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white rounded-md hover:bg-blue-50 transition-colors border border-blue-200"
          >
            <Plus className="w-3 h-3" />
            새 고객 등록
          </button>
        )}
      </div>
      <p className="mb-3 text-sm text-gray-700 font-medium">
        ⚠️ 발주를 진행하려면 먼저 고객을 선택해야 합니다
      </p>
      <select
        name="supplier"
        value={selectedSupplierId || ""}
        onChange={onChange}
        required
        className={`px-3 py-3 w-full text-base rounded-md border-2 ${
          !selectedSupplierId ? "border-orange-400 animate-pulse" : "border-gray-300"
        } shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
      >
        <option value="" disabled>
          👉 고객을 선택하세요
        </option>
        {Array.isArray(suppliers) && suppliers?.length > 0 ? (
          suppliers.map((supplier: Supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.supplierName}
            </option>
          ))
        ) : (
          <option value="" disabled>
            등록된 고객이 없습니다
          </option>
        )}
      </select>

      {!selectedSupplierId && (
        <p className="mt-3 text-sm text-orange-600 font-medium">
          ⚠️ 고객을 선택해주세요
        </p>
      )}

      {suppliers?.length === 0 && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-sm text-yellow-800">등록된 고객이 없습니다.</p>
          {onAddSupplier && (
            <button
              type="button"
              onClick={onAddSupplier}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + 고객 등록하기
            </button>
          )}
        </div>
      )}

      {selectedSupplier && (
        <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
          <p className="text-xs text-gray-600 mb-1">✅ 선택된 고객</p>
          <p className="font-medium text-gray-900">
            {selectedSupplier.supplierName}
          </p>
          <p className="text-sm text-gray-600">
            {selectedSupplier.supplierPhoneNumber}
          </p>
          <p className="text-xs text-amber-600 mt-2">
            💡 배송지를 변경하려면 아래 수령인 정보를 직접 수정하세요
          </p>
        </div>
      )}
    </div>
  );
};

export default SupplierSection;
