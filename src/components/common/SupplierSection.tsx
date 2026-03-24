import React from "react";
import { Supplier } from "@/types/supplier";
import { Plus, Edit2, Building2 } from "lucide-react";

interface SupplierSectionProps {
  suppliers: Supplier[];
  selectedSupplierId?: number | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  focusRingColor?: string;
  onAddSupplier?: () => void;
  onOpenSelectModal?: () => void; // 모달 열기 함수 추가
}

const SupplierSection: React.FC<SupplierSectionProps> = ({
  suppliers,
  selectedSupplierId,
  onChange,
  focusRingColor = "blue",
  onAddSupplier,
  onOpenSelectModal,
}) => {
  const bgColorClass =
    focusRingColor === "purple" ? "bg-purple-50" : "bg-blue-50";

  const borderColorClass =
    focusRingColor === "purple" ? "border-purple-200" : "border-blue-200";

  const buttonColorClass =
    focusRingColor === "purple"
      ? "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const selectedSupplier = supplierList.find(
    (s) => s.id === selectedSupplierId
  );

  return (
    <div
      className={`p-5 ${bgColorClass} border-2 ${borderColorClass} rounded-lg shadow-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <label className="block text-base font-semibold text-gray-800">
            판매대상 선택
          </label>
          <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded">
            필수
          </span>
        </div>
        {onAddSupplier && (
          <button
            type="button"
            onClick={onAddSupplier}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white rounded-full hover:bg-blue-50 transition-colors border border-blue-200"
          >
            <Plus className="w-3 h-3" />새 판매대상 등록
          </button>
        )}
      </div>

      <p className="mb-3 text-sm text-gray-700 font-medium">
        ⚠️ 판매를 진행하려면 먼저 판매대상을 선택해야 합니다
      </p>

      {selectedSupplier ? (
        // 판매대상이 선택된 경우 - 선택된 판매대상 정보 표시
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-lg border-2 border-green-500 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="text-green-600" size={20} />
                  <p className="text-xs text-green-600 font-semibold">
                    ✅ 선택된 판매대상
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {selectedSupplier.supplierName}
                </p>
                {selectedSupplier.supplierPhoneNumber && (
                  <p className="text-sm text-gray-600">
                    📞 {selectedSupplier.supplierPhoneNumber}
                  </p>
                )}
                {selectedSupplier.supplierAddress && (
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {selectedSupplier.supplierAddress}
                  </p>
                )}
                {selectedSupplier.representativeName && (
                  <p className="text-xs text-gray-500 mt-1">
                    대표: {selectedSupplier.representativeName}
                  </p>
                )}
              </div>

              {onOpenSelectModal && (
                <button
                  type="button"
                  onClick={onOpenSelectModal}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColorClass}`}
                >
                  <Edit2 size={14} />
                  변경
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-amber-600 px-2">
            💡 배송지를 변경하려면 아래 수령인 정보를 직접 수정하세요
          </p>
        </div>
      ) : (
        // 판매대상이 선택되지 않은 경우 - 선택 버튼
        <div className="space-y-3">
          {onOpenSelectModal ? (
            // 모달 방식
            <button
              type="button"
              onClick={onOpenSelectModal}
              className={`w-full px-4 py-4 text-base font-semibold text-white rounded-full transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-md animate-pulse ${buttonColorClass}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Building2 size={20} />
                <span>판매대상 선택하기</span>
              </div>
            </button>
          ) : (
            // 기존 드롭다운 방식 (하위 호환)
            <select
              name="supplier"
              value={selectedSupplierId || ""}
              onChange={onChange}
              required
              className={`px-3 py-3 w-full text-base rounded-md border-2 border-orange-400 animate-pulse shadow-sm focus:outline-none focus:ring-2 focus:ring-${focusRingColor}-500 focus:border-transparent transition-all`}
            >
              <option value="" disabled>
                👉 판매대상을 선택하세요
              </option>
              {supplierList.length > 0 ? (
                supplierList.map((supplier: Supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplierName}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  등록된 판매대상이 없습니다
                </option>
              )}
            </select>
          )}

          <p className="text-sm text-orange-600 font-medium px-2">
            ⚠️ 판매대상을 선택해주세요
          </p>

          {supplierList.length === 0 && (
            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">
                등록된 판매대상이 없습니다.
              </p>
              {onAddSupplier && (
                <button
                  type="button"
                  onClick={onAddSupplier}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  + 판매대상 등록하기
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierSection;
