"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Supplier,
  CustomerType,
  UpdateSupplierRequest,
} from "@/types/supplier";
import { supplierApi } from "@/api/supplier-api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getFieldVisibility } from "@/utils/customerFieldUtils";

interface CustomerInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
}

export default function CustomerInfoEditModal({
  isOpen,
  onClose,
  supplier,
}: CustomerInfoEditModalProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    customerType: supplier.customerType ?? (null as CustomerType | null),
    isRecipient: supplier.isRecipient ?? false,
    depositorName: supplier.depositorName ?? "",
    residentId: supplier.residentId ?? "",
    repurchaseCycleMonths:
      supplier.repurchaseCycleMonths ?? (null as number | null),
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        customerType: supplier.customerType ?? null,
        isRecipient: supplier.isRecipient ?? false,
        depositorName: supplier.depositorName ?? "",
        residentId: supplier.residentId ?? "",
        repurchaseCycleMonths: supplier.repurchaseCycleMonths ?? null,
      });
    }
  }, [isOpen, supplier]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: UpdateSupplierRequest = {
        customerType: formData.customerType,
        isRecipient: formData.isRecipient,
        depositorName: formData.depositorName || null,
        residentId: formData.residentId || null,
        repurchaseCycleMonths: formData.repurchaseCycleMonths,
      };

      const response = await supplierApi.updateSupplier(
        supplier.id.toString(),
        updateData
      );

      if (response.success) {
        toast.success("고객 정보가 수정되었습니다");
        queryClient.invalidateQueries({
          queryKey: ["supplier", supplier.id.toString()],
        });
        queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        queryClient.invalidateQueries({ queryKey: ["teamCustomers"] });
        onClose();
      } else {
        toast.error(response.error || "수정에 실패했습니다");
      }
    } catch {
      toast.error("고객 정보 수정 중 오류가 발생했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  const visibility = getFieldVisibility(
    formData.customerType,
    formData.isRecipient
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl mx-4 animate-modal-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-Outline-Variant">
          <h2 className="text-lg font-semibold text-Text-Highest-100">
            고객 정보 수정
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-Text-Low-70 hover:bg-Back-Mid-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-5">
          {/* 고객명 (읽기 전용) */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-Text-High-90">
              고객명
            </label>
            <input
              type="text"
              value={supplier.supplierName}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500"
            />
          </div>

          {/* 고객 분류 + 수급자 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-Text-High-90">
                고객 분류
              </label>
              <select
                value={formData.customerType || ""}
                onChange={(e) => {
                  const newType = (e.target.value ||
                    null) as CustomerType | null;
                  setFormData((prev) => ({
                    ...prev,
                    customerType: newType,
                    // B2B 전환 시 B2C 전용 필드 초기화
                    ...(newType === "b2b" && {
                      isRecipient: false,
                      residentId: "",
                      depositorName: "",
                      repurchaseCycleMonths: null,
                    }),
                    // B2C 비수급자 전환 시 수급자 전용 필드 초기화
                    ...(newType === "b2c" &&
                      !prev.isRecipient && {
                        depositorName: "",
                        repurchaseCycleMonths: null,
                      }),
                  }));
                }}
                className="w-full px-4 py-2.5 bg-Back-Mid-20 border border-Outline-Variant rounded-xl text-sm focus:border-Primary-Main focus:ring-2 focus:ring-Primary-Main/20 focus:outline-none transition-all"
              >
                <option value="">미설정</option>
                <option value="b2c">B2C (개인)</option>
                <option value="b2b">B2B (기업)</option>
              </select>
            </div>

            {visibility.showIsRecipient && (
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecipient}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        isRecipient: checked,
                        // 수급자 해제 시 수급자 전용 필드 초기화
                        ...(!checked && {
                          depositorName: "",
                          repurchaseCycleMonths: null,
                        }),
                      }));
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-Text-High-90">
                    수급자 여부
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* 주민등록번호 (B2C / 미설정) */}
          {visibility.showResidentId && (
            <div>
              <label className="block mb-1.5 text-sm font-medium text-Text-High-90">
                주민등록번호
              </label>
              <input
                type="text"
                value={formData.residentId}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9-]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    residentId: value,
                  }));
                }}
                placeholder="000000-0000000"
                maxLength={14}
                className="w-full px-4 py-2.5 bg-Back-Mid-20 border border-Outline-Variant rounded-xl text-sm placeholder:text-Text-Lowest-60 focus:border-Primary-Main focus:ring-2 focus:ring-Primary-Main/20 focus:outline-none transition-all"
              />
            </div>
          )}

          {/* 입금자명 (수급자 전용) */}
          {visibility.showDepositorName && (
            <div>
              <label className="block mb-1.5 text-sm font-medium text-Text-High-90">
                입금자명
              </label>
              <input
                type="text"
                value={formData.depositorName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    depositorName: e.target.value,
                  }))
                }
                placeholder="지자체 환급 시 입금자명"
                className="w-full px-4 py-2.5 bg-Back-Mid-20 border border-Outline-Variant rounded-xl text-sm placeholder:text-Text-Lowest-60 focus:border-Primary-Main focus:ring-2 focus:ring-Primary-Main/20 focus:outline-none transition-all"
              />
              <p className="mt-1 text-xs text-Text-Lowest-60">
                수급자 비용을 지자체에서 환급받을 때 사용하는 입금자명
              </p>
            </div>
          )}

          {/* 재구매 주기 + 예정일 (수급자 전용) */}
          {visibility.showRepurchaseCycle && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-Text-High-90">
                  재구매 주기 (개월)
                </label>
                <input
                  type="number"
                  value={formData.repurchaseCycleMonths ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      repurchaseCycleMonths: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                  placeholder="기본 3개월"
                  min={1}
                  max={120}
                  className="w-full px-4 py-2.5 bg-Back-Mid-20 border border-Outline-Variant rounded-xl text-sm placeholder:text-Text-Lowest-60 focus:border-Primary-Main focus:ring-2 focus:ring-Primary-Main/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-Text-High-90">
                  재구매 예정일
                </label>
                <input
                  type="text"
                  value={
                    supplier.repurchaseDueDate
                      ? new Date(supplier.repurchaseDueDate).toLocaleDateString(
                          "ko-KR"
                        )
                      : "미설정"
                  }
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500"
                />
                <p className="mt-1 text-xs text-Text-Lowest-60">
                  출고 완료 시 자동 갱신됩니다
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-Outline-Variant">
          <button
            onClick={onClose}
            className="h-10 px-6 bg-transparent text-Text-High-90 border border-Outline-Variant rounded-full text-sm font-medium hover:bg-Back-Mid-20 transition-all"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-6 bg-Primary-Main text-white rounded-full text-sm font-medium hover:brightness-90 active:brightness-85 disabled:bg-Gray-Sub-Disabled-40 disabled:text-Text-Low-70 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
