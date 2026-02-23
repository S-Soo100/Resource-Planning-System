/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import { AttachedFile } from "@/types/common";
import SearchAddressModal from "./SearchAddressModal";
import SelectSupplierModal from "../../supplier/SelectSupplierModal";
import { Category } from "@/types/(item)/category";
import { getDisplayFileName } from "@/utils/fileUtils";
import { MANUAL_RECORD_PURPOSES } from "@/constants/recordPurpose";
import { Supplier } from "@/types/supplier";
import toast from "react-hot-toast";

interface OutboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  outboundValues: {
    itemId: number | null;
    itemCode: string;
    itemName: string;
    currentQuantity: number;
    quantity: number;
    date: string;
    outboundPlace: string;
    outboundAddress: string;
    outboundAddressDetail: string;
    remarks: string;
    recordPurpose?: string;
    warehouseId: number;
    attachedFiles: AttachedFile[];
    supplierId?: number;
  };
  onFormChange: (field: string, value: any) => void;
  onSubmitOutbound: () => void;
  warehouseItems: any[];
  selectedItem: any;
  onFileUpload: (files: FileList | null) => void;
  onFileDelete: (index: number) => void;
  suppliers: Supplier[];
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  onSupplierSelect?: (supplier: Supplier) => void;
}

export default function OutboundModal({
  isOpen,
  onClose,
  outboundValues,
  onFormChange,
  onSubmitOutbound,
  warehouseItems,
  selectedItem,
  onFileUpload,
  onFileDelete,
  suppliers,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onSupplierSelect,
}: OutboundModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSelectSupplierModalOpen, setIsSelectSupplierModalOpen] = useState(false);

  if (!isOpen) return null;

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return (
        <svg
          className="w-6 h-6 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (fileType.includes("image")) {
      return (
        <svg
          className="w-6 h-6 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-6 h-6 text-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const openAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  const handleAddressSelect = (address: string) => {
    onFormChange("outboundAddress", address);
  };

  // 전체 주소 생성 - 기본 주소 + 상세 주소
  const getFullAddress = () => {
    const baseAddress = outboundValues.outboundAddress || "";
    const detailAddress = outboundValues.outboundAddressDetail || "";

    // 상세 주소가 있을 경우 기본 주소에 추가
    if (detailAddress) {
      return `${baseAddress} ${detailAddress}`;
    }
    return baseAddress;
  };

  // 고객 선택 핸들러
  const handleSupplierSelect = (supplier: Supplier) => {
    if (onSupplierSelect) {
      onSupplierSelect(supplier);
    }
    setIsSelectSupplierModalOpen(false);
  };

  // 폼 제출 시 주소 합치기 처리 및 고객 필수 검증
  const handleSubmit = () => {
    // 고객 필수 검증
    if (!outboundValues.supplierId) {
      toast.error("고객을 선택해주세요");
      return;
    }

    // 전체 주소를 outboundAddress에 임시 저장 (서버로 전송용)
    const fullAddress = getFullAddress();
    if (fullAddress) {
      // 전체 주소를 parent component로 전달 (임시 저장하지 않고)
      onSubmitOutbound();
    } else {
      onSubmitOutbound();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    출고 등록
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        카테고리
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={selectedCategoryId || ""}
                        onChange={(e) =>
                          onCategoryChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      >
                        <option value="">카테고리 선택</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        품목
                      </label>
                      <select
                        value={outboundValues.itemId || ""}
                        onChange={(e) =>
                          onFormChange(
                            "itemId",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm mt-2"
                      >
                        <option value="">품목을 선택하세요</option>
                        {warehouseItems
                          .filter(
                            (item) =>
                              !selectedCategoryId ||
                              String(item.teamItem?.categoryId) ===
                                String(selectedCategoryId)
                          )
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.teamItem?.itemName || item.itemName} (재고:{" "}
                              {item.itemQuantity})
                            </option>
                          ))}
                      </select>
                    </div>

                    {selectedItem && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          선택된 품목 정보
                        </label>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="font-medium">
                            {selectedItem.teamItem?.itemName}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {selectedItem.teamItem?.itemCode}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            현재 재고: {selectedItem.itemQuantity}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        출고 수량
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={selectedItem?.itemQuantity || 0}
                        value={outboundValues.quantity}
                        onChange={(e) =>
                          onFormChange(
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        출고 날짜
                      </label>
                      <input
                        type="date"
                        value={outboundValues.date}
                        onChange={(e) => onFormChange("date", e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        목적 구분
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onFormChange("recordPurpose", "sale")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            outboundValues.recordPurpose === "sale"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          판매 출고
                        </button>
                        <button
                          type="button"
                          onClick={() => onFormChange("recordPurpose", "transfer")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            outboundValues.recordPurpose === "transfer"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          창고 간 이동
                        </button>
                        <button
                          type="button"
                          onClick={() => onFormChange("recordPurpose", "adjustment")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            outboundValues.recordPurpose === "adjustment"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          재고 조정
                        </button>
                        <button
                          type="button"
                          onClick={() => onFormChange("recordPurpose", "other")}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            outboundValues.recordPurpose === "other"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          기타
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        고객 선택 <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSelectSupplierModalOpen(true)}
                        className="w-full px-4 py-2 text-left border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      >
                        {outboundValues.supplierId ? (
                          <span className="text-gray-900">
                            {suppliers.find((s) => s.id === outboundValues.supplierId)?.supplierName || "고객 선택"}
                          </span>
                        ) : (
                          <span className="text-gray-400">고객을 선택하세요</span>
                        )}
                      </button>
                    </div>

                    {/* 고객 선택 후 표시되는 섹션 */}
                    {outboundValues.supplierId ? (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            출고처
                          </label>
                          <input
                            type="text"
                            value={outboundValues.outboundPlace || ""}
                            onChange={(e) =>
                              onFormChange("outboundPlace", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                            placeholder="출고처를 입력하세요"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            출고 주소
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={outboundValues.outboundAddress || ""}
                              onChange={(e) =>
                                onFormChange("outboundAddress", e.target.value)
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                              placeholder="주소를 검색하세요"
                              readOnly
                            />
                            <button
                              type="button"
                              onClick={openAddressModal}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            기타주소 (상세주소)
                          </label>
                          <input
                            type="text"
                            value={outboundValues.outboundAddressDetail || ""}
                            onChange={(e) =>
                              onFormChange("outboundAddressDetail", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                            placeholder="상세주소를 입력하세요 (동/호수 등)"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-medium text-gray-600 mb-2">
                            👆 먼저 고객을 선택해주세요
                          </p>
                          <p className="text-sm text-gray-500">
                            고객을 선택하면 출고처 정보 입력 폼이 표시됩니다
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        비고
                      </label>
                      <textarea
                        placeholder="추가 정보를 입력하세요"
                        value={outboundValues.remarks || ""}
                        onChange={(e) =>
                          onFormChange("remarks", e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        증빙 서류
                      </label>

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={(e) => onFileUpload(e.target.files)}
                      />

                      <div className="flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={triggerFileUpload}
                          className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            ></path>
                          </svg>
                          파일 첨부하기
                        </button>

                        {outboundValues.attachedFiles.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-2">
                              첨부된 파일 ({outboundValues.attachedFiles.length}
                              개)
                            </p>
                            <ul className="space-y-2">
                              {outboundValues.attachedFiles.map(
                                (file, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center">
                                      {getFileIcon(file.type)}
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                          {getDisplayFileName(file.name)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatFileSize(file.size)}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => onFileDelete(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        ></path>
                                      </svg>
                                    </button>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  !outboundValues.itemId ||
                  outboundValues.quantity <= 0 ||
                  !outboundValues.date ||
                  (selectedItem &&
                    outboundValues.quantity > selectedItem.itemQuantity)
                }
                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                출고 완료
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
      <SearchAddressModal
        isOpen={isAddressModalOpen}
        onClose={closeAddressModal}
        onAddressSelect={handleAddressSelect}
      />
      <SelectSupplierModal
        isOpen={isSelectSupplierModalOpen}
        onClose={() => setIsSelectSupplierModalOpen(false)}
        onSelect={handleSupplierSelect}
        suppliers={suppliers}
      />
    </>
  );
}
