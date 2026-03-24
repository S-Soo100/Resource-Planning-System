"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Building2, Phone, Plus } from "lucide-react";
import { Supplier } from "@/types/supplier";
import {
  getCustomerTypeBadge,
  getRecipientBadge,
} from "@/utils/customerFieldUtils";
import { SupplierContext, getSupplierLabel } from "@/constants/labelContext";

interface SelectSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  onSelect: (supplier: Supplier) => void;
  selectedSupplierId?: number | null;
  focusRingColor?: string;
  onAddSupplier?: () => void; // 판매대상 추가 버튼 핸들러
  context?: SupplierContext; // 화면 맥락에 따른 라벨 변경
}

const SelectSupplierModal: React.FC<SelectSupplierModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  onSelect,
  selectedSupplierId,
  focusRingColor = "blue",
  onAddSupplier,
  context,
}) => {
  const label = getSupplierLabel(context);
  const [searchTerm, setSearchTerm] = useState("");

  const focusRingClass =
    focusRingColor === "purple"
      ? "focus:ring-purple-500"
      : "focus:ring-blue-500";

  const accentColor =
    focusRingColor === "purple"
      ? "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100"
      : "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100";

  const [typeFilter, setTypeFilter] = useState<
    "all" | "b2c" | "b2b" | "recipient" | "none"
  >("all");

  const selectedBorderColor =
    focusRingColor === "purple" ? "border-purple-500" : "border-blue-500";

  // 검색 + 유형 필터링
  const filteredSuppliers = useMemo(() => {
    let result = suppliers;

    // 검색
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (supplier) =>
          supplier.supplierName.toLowerCase().includes(lowerSearch) ||
          supplier.supplierPhoneNumber?.toLowerCase().includes(lowerSearch) ||
          supplier.supplierAddress?.toLowerCase().includes(lowerSearch)
      );
    }

    // 유형 필터
    if (typeFilter !== "all") {
      result = result.filter((s) => {
        if (typeFilter === "b2c") return s.customerType === "b2c";
        if (typeFilter === "b2b") return s.customerType === "b2b";
        if (typeFilter === "recipient") return s.isRecipient;
        if (typeFilter === "none") return !s.customerType;
        return true;
      });
    }

    return result;
  }, [suppliers, searchTerm, typeFilter]);

  if (!isOpen) return null;

  const handleSelect = (supplier: Supplier) => {
    // 클릭 시 바로 선택하고 모달 닫기
    onSelect(supplier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{label} 선택</h2>
            <p className="mt-1 text-sm text-gray-600">
              {label}을(를) 선택해주세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 ml-4 text-gray-500 rounded-full transition-colors hover:bg-gray-200 hover:text-gray-700"
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
              placeholder={`${label}명, 전화번호, 주소로 검색...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <p className="text-xs text-gray-500">
              {filteredSuppliers.length}개의 {label}
            </p>
            <div className="flex gap-1 ml-auto">
              {(["all", "b2c", "b2b", "recipient", "none"] as const).map(
                (key) => {
                  const labels = {
                    all: "전체",
                    b2c: "B2C",
                    b2b: "B2B",
                    recipient: "수급자",
                    none: "미분류",
                  };
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTypeFilter(key)}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-all ${
                        typeFilter === key
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {labels[key]}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* {label} 목록 */}
        <div className="overflow-y-auto max-h-[calc(90vh-240px)] p-6">
          {/* 새 {label} 등록 버튼 */}
          {onAddSupplier && (
            <button
              onClick={onAddSupplier}
              className={`w-full p-6 mb-4 rounded-full border-2 border-dashed transition-all hover:shadow-lg ${
                focusRingColor === "purple"
                  ? "border-purple-300 bg-purple-50 hover:bg-purple-100 hover:border-purple-400"
                  : "border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Plus
                  size={28}
                  className={
                    focusRingColor === "purple"
                      ? "text-purple-600"
                      : "text-blue-600"
                  }
                />
                <span
                  className={`text-lg font-bold ${
                    focusRingColor === "purple"
                      ? "text-purple-700"
                      : "text-blue-700"
                  }`}
                >
                  새 {label} 등록
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                등록된 {label} 목록에 없다면 새로 추가하세요
              </p>
            </button>
          )}

          {filteredSuppliers.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="text-lg font-medium text-gray-600">
                {searchTerm
                  ? "검색 결과가 없습니다"
                  : `등록된 ${label}이(가) 없습니다`}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm
                  ? "다른 검색어로 시도해보세요"
                  : `새 ${label}을(를) 등록해주세요`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredSuppliers.map((supplier) => {
                const isSelected = supplier.id === selectedSupplierId;
                return (
                  <div
                    key={supplier.id}
                    onClick={() => handleSelect(supplier)}
                    className={`w-full p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? `${selectedBorderColor} bg-${
                            focusRingColor === "purple" ? "purple" : "blue"
                          }-50 shadow-md`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Building2
                            className={
                              isSelected ? "text-blue-600" : "text-gray-400"
                            }
                            size={20}
                          />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {supplier.supplierName}
                          </h3>
                          {(() => {
                            const typeBadge = getCustomerTypeBadge(
                              supplier.customerType
                            );
                            const recipientBadge = getRecipientBadge(
                              supplier.isRecipient
                            );
                            return (
                              <>
                                {typeBadge && (
                                  <span
                                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${typeBadge.color}`}
                                  >
                                    {typeBadge.text}
                                  </span>
                                )}
                                {recipientBadge && (
                                  <span
                                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${recipientBadge.color}`}
                                  >
                                    {recipientBadge.text}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                          {isSelected && (
                            <span
                              className={`px-2 py-0.5 text-xs font-bold text-white rounded ${accentColor.includes("purple") ? "bg-purple-500" : "bg-blue-500"}`}
                            >
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            {`💡 ${label}을(를) 클릭하면 바로 선택됩니다`}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white rounded-full border border-gray-300 transition-colors hover:bg-gray-100"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectSupplierModal;
