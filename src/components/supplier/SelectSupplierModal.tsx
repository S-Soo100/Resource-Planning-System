"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Building2, Phone } from "lucide-react";
import { Supplier } from "@/types/supplier";

interface SelectSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  onSelect: (supplier: Supplier) => void;
  selectedSupplierId?: number | null;
  focusRingColor?: string;
}

const SelectSupplierModal: React.FC<SelectSupplierModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  onSelect,
  selectedSupplierId,
  focusRingColor = "blue",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedSupplier, setTempSelectedSupplier] = useState<Supplier | null>(null);

  const focusRingClass =
    focusRingColor === "purple"
      ? "focus:ring-purple-500"
      : "focus:ring-blue-500";

  const accentColor =
    focusRingColor === "purple"
      ? "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100"
      : "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100";

  const selectedBorderColor =
    focusRingColor === "purple" ? "border-purple-500" : "border-blue-500";

  // 검색 필터링
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;

    const lowerSearch = searchTerm.toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.supplierName.toLowerCase().includes(lowerSearch) ||
        supplier.supplierPhoneNumber?.toLowerCase().includes(lowerSearch) ||
        supplier.supplierAddress?.toLowerCase().includes(lowerSearch)
    );
  }, [suppliers, searchTerm]);

  if (!isOpen) return null;

  const handleSelect = (supplier: Supplier) => {
    // supplierId만 설정 (수령인 정보는 채우지 않음)
    setTempSelectedSupplier(supplier);
  };

  const handleConfirm = () => {
    // 선택 확정
    if (tempSelectedSupplier) {
      onSelect(tempSelectedSupplier);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">고객 선택</h2>
            <p className="mt-1 text-sm text-gray-600">
              발주할 고객을 선택해주세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-full transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="닫기"
          >
            <X size={24} />
          </button>
        </div>

        {/* 검색 바 */}
        <div className="p-6 border-b bg-gray-50">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="고객명, 전화번호, 주소로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
              autoFocus
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {filteredSuppliers.length}개의 고객이 검색되었습니다
          </p>
        </div>

        {/* 고객 목록 */}
        <div className="overflow-y-auto max-h-[calc(90vh-240px)] p-6">
          {filteredSuppliers.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="text-lg font-medium text-gray-600">
                {searchTerm
                  ? "검색 결과가 없습니다"
                  : "등록된 고객이 없습니다"}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm
                  ? "다른 검색어로 시도해보세요"
                  : "새 고객을 등록해주세요"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredSuppliers.map((supplier) => {
                const isSelected = supplier.id === selectedSupplierId;
                return (
                  <button
                    key={supplier.id}
                    onClick={() => handleSelect(supplier)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? `${selectedBorderColor} bg-${
                            focusRingColor === "purple" ? "purple" : "blue"
                          }-50 shadow-md`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building2
                            className={
                              isSelected ? "text-blue-600" : "text-gray-400"
                            }
                            size={20}
                          />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {supplier.supplierName}
                          </h3>
                          {isSelected && (
                            <span className={`px-2 py-0.5 text-xs font-bold text-white rounded ${accentColor.includes("purple") ? "bg-purple-500" : "bg-blue-500"}`}>
                              선택됨
                            </span>
                          )}
                        </div>

                        {supplier.supplierPhoneNumber && (
                          <div className="flex items-center gap-2 mt-2">
                            <Phone className="text-gray-400" size={14} />
                            <p className="text-sm text-gray-600">
                              {supplier.supplierPhoneNumber}
                            </p>
                          </div>
                        )}

                        {supplier.supplierAddress && (
                          <p className="mt-2 text-sm text-gray-600">
                            📍 {supplier.supplierAddress}
                          </p>
                        )}

                        {supplier.representativeName && (
                          <p className="mt-1 text-xs text-gray-500">
                            대표: {supplier.representativeName}
                          </p>
                        )}
                      </div>

                      <div className="ml-4">
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isSelected
                              ? `${accentColor} border`
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {isSelected ? "선택됨" : "선택"}
                        </button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div>
            {tempSelectedSupplier && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{tempSelectedSupplier.supplierName}</span> 선택됨
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white rounded-md border border-gray-300 transition-colors hover:bg-gray-100"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={!tempSelectedSupplier}
              className={`px-6 py-2 rounded-md transition-colors ${
                tempSelectedSupplier
                  ? `${
                      focusRingColor === "purple"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white`
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectSupplierModal;
