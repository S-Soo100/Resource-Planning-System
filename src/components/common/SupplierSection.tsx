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

  const selectedSupplier = suppliers?.find(s => s.id === selectedSupplierId);

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          거래처 선택 <span className="text-red-500">*</span>
        </label>
        {onAddSupplier && (
          <button
            type="button"
            onClick={onAddSupplier}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-3 h-3" />
            새 거래처 등록
          </button>
        )}
      </div>
      <p className="mb-2 text-xs text-gray-600">
        * 거래처를 선택하면 수령인 정보가 자동으로 입력됩니다.
      </p>
      <select
        name="supplier"
        value={selectedSupplierId || ""}
        onChange={onChange}
        required
        className={`px-3 py-2 w-full rounded-md border ${!selectedSupplierId ? "border-red-300" : "border-gray-300"} shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
      >
        <option value="" disabled>
          거래처를 선택하세요
        </option>
        {Array.isArray(suppliers) && suppliers?.length > 0 ? (
          suppliers.map((supplier: Supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.supplierName}
            </option>
          ))
        ) : (
          <option value="" disabled>
            등록된 거래처가 없습니다
          </option>
        )}
      </select>

      {!selectedSupplierId && (
        <p className="mt-2 text-sm text-red-500">
          거래처를 선택해주세요
        </p>
      )}

      {suppliers?.length === 0 && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-sm text-yellow-800">
            등록된 거래처가 없습니다.
          </p>
          {onAddSupplier && (
            <button
              type="button"
              onClick={onAddSupplier}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + 거래처 등록하기
            </button>
          )}
        </div>
      )}

      {selectedSupplier && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-gray-600 mb-1">📌 선택된 거래처</p>
          <p className="font-medium text-gray-900">{selectedSupplier.supplierName}</p>
          <p className="text-sm text-gray-600">{selectedSupplier.supplierPhoneNumber}</p>
          <p className="text-xs text-amber-600 mt-2">
            💡 배송지를 변경하려면 아래 수령인 정보를 직접 수정하세요
          </p>
        </div>
      )}
    </div>
  );
};

export default SupplierSection;
