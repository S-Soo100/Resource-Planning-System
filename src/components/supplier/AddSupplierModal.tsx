"use client";

import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { supplierApi } from "@/api/supplier-api";
import SearchAddressModal from "../SearchAddressModal";
import { Address } from "react-daum-postcode";
import { authStore } from "@/store/authStore";
import { CustomerType } from "@/types/supplier";
import { getFieldVisibility } from "@/utils/customerFieldUtils";

interface SupplierInitialData {
  supplierName?: string;
  supplierPhone?: string;
  address?: string;
  representativeName?: string;
}

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: SupplierInitialData;
}

const inputCls =
  "w-full px-4 py-2.5 bg-Back-Mid-20 border border-Outline-Variant rounded-xl text-sm text-Text-Highest-100 placeholder:text-Text-Lowest-60 focus:border-Primary-Main focus:ring-2 focus:ring-Primary-Main/20 focus:outline-none transition-all";

const labelCls = "block mb-1.5 text-sm font-medium text-Text-High-90";

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const selectedTeam = authStore((state) => state.selectedTeam);
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierPhone: "",
    supplierEmail: "",
    address: "",
    detailAddress: "",
    representativeName: "",
    registrationNumber: "",
    supplierNote: "",
    customerType: null as CustomerType | null,
    isRecipient: false,
    depositorName: "",
    residentId: "",
    repurchaseCycleMonths: null as number | null,
  });

  const formVisibility = getFieldVisibility(
    formData.customerType,
    formData.isRecipient
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);

  // initialData가 있을 때 폼 데이터 초기화
  React.useEffect(() => {
    if (isOpen && initialData && !hasInitialData) {
      setFormData((prev) => ({
        ...prev,
        supplierName: initialData.supplierName || prev.supplierName,
        supplierPhone: initialData.supplierPhone || prev.supplierPhone,
        address: initialData.address || prev.address,
        representativeName:
          initialData.representativeName || prev.representativeName,
      }));
      setHasInitialData(true);

      if (
        initialData.supplierName ||
        initialData.supplierPhone ||
        initialData.address
      ) {
        toast.success("기존 입력된 정보가 자동으로 채워졌습니다", {
          duration: 3000,
          icon: "✅",
        });
      }
    }

    // 모달이 닫히면 hasInitialData 리셋
    if (!isOpen) {
      setHasInitialData(false);
    }
  }, [isOpen, initialData, hasInitialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (data: Address) => {
    setFormData((prev) => ({ ...prev, address: data.address }));
    setIsAddressOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierName.trim()) {
      toast.error("고객 이름을 입력해주세요.");
      return;
    }

    if (!selectedTeam?.id) {
      toast.error("팀 정보를 찾을 수 없습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress =
        `${formData.address} ${formData.detailAddress}`.trim();

      const requestData = {
        supplierName: formData.supplierName.trim(),
        supplierPhoneNumber: formData.supplierPhone.trim() || undefined,
        email: formData.supplierEmail.trim() || undefined,
        supplierAddress: fullAddress || undefined,
        representativeName: formData.representativeName.trim() || undefined,
        registrationNumber: formData.registrationNumber.trim() || undefined,
        memo: formData.supplierNote.trim() || undefined,
        teamId: selectedTeam.id,
        customerType: formData.customerType,
        isRecipient: formData.isRecipient,
        depositorName: formData.depositorName.trim() || null,
        residentId: formData.residentId.trim() || null,
        repurchaseCycleMonths: formData.repurchaseCycleMonths,
      };

      const response = await supplierApi.createSupplier(requestData);

      if (response.success) {
        toast.success("고객이 추가되었습니다.");
        onSuccess();
        handleClose();
      } else {
        throw new Error(response.error || "고객 추가에 실패했습니다.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "고객 추가에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      supplierName: "",
      supplierPhone: "",
      supplierEmail: "",
      address: "",
      detailAddress: "",
      representativeName: "",
      registrationNumber: "",
      supplierNote: "",
      customerType: null,
      isRecipient: false,
      depositorName: "",
      residentId: "",
      repurchaseCycleMonths: null,
    });
    setIsAddressOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-Outline-Variant">
          <h2 className="text-xl font-medium text-Text-Highest-100">
            고객 추가
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-Text-Low-70 hover:text-Text-High-90 hover:bg-Back-Mid-20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 고객 이름 */}
          <div>
            <label className={labelCls}>
              고객 이름 <span className="text-Error-Main">*</span>
            </label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              className={inputCls}
              placeholder="고객 이름을 입력하세요"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label className={labelCls}>전화번호</label>
            <input
              type="tel"
              name="supplierPhone"
              value={formData.supplierPhone}
              onChange={handleChange}
              className={inputCls}
              placeholder="전화번호를 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className={labelCls}>이메일</label>
            <input
              type="email"
              name="supplierEmail"
              value={formData.supplierEmail}
              onChange={handleChange}
              className={inputCls}
              placeholder="이메일을 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 주소 */}
          <div>
            <label className={labelCls}>주소</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={inputCls}
                placeholder="주소를 입력하세요"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setIsAddressOpen(true)}
                disabled={isSubmitting}
                className="h-10 px-3 bg-Primary-Main text-white rounded-full text-sm font-medium whitespace-nowrap hover:brightness-90 active:brightness-85 disabled:opacity-50 transition-all inline-flex items-center gap-1.5"
              >
                <Search className="w-4 h-4 md:hidden" />
                <span className="hidden md:inline">주소 검색</span>
              </button>
            </div>
            <input
              type="text"
              name="detailAddress"
              value={formData.detailAddress}
              onChange={handleChange}
              className={inputCls}
              placeholder="상세 주소"
              disabled={isSubmitting}
            />
          </div>

          {/* 대표자 이름 */}
          <div>
            <label className={labelCls}>대표자 이름</label>
            <input
              type="text"
              name="representativeName"
              value={formData.representativeName}
              onChange={handleChange}
              className={inputCls}
              placeholder="대표자 이름을 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 사업자 번호 */}
          <div>
            <label className={labelCls}>
              사업자 번호{" "}
              <span className="text-xs font-normal text-Text-Lowest-60">
                (선택)
              </span>
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              className={inputCls}
              placeholder="예: 123-45-67890"
              disabled={isSubmitting}
            />
          </div>

          {/* 비고 */}
          <div>
            <label className={labelCls}>비고</label>
            <textarea
              name="supplierNote"
              value={formData.supplierNote}
              onChange={handleChange}
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="추가 정보를 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 고객 분류 */}
          <div className="pt-3 border-t border-Outline-Variant">
            <p className="text-sm font-medium text-Text-High-90 mb-3">
              고객 분류
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>고객 유형</label>
                <select
                  value={formData.customerType || ""}
                  onChange={(e) => {
                    const newType = (e.target.value ||
                      null) as CustomerType | null;
                    setFormData((prev) => ({
                      ...prev,
                      customerType: newType,
                      ...(newType === "b2b" && {
                        isRecipient: false,
                        residentId: "",
                        depositorName: "",
                        repurchaseCycleMonths: null,
                      }),
                      ...(newType === "b2c" &&
                        !prev.isRecipient && {
                          depositorName: "",
                          repurchaseCycleMonths: null,
                        }),
                    }));
                  }}
                  disabled={isSubmitting}
                  className={inputCls}
                >
                  <option value="">미설정</option>
                  <option value="b2c">B2C (개인)</option>
                  <option value="b2b">B2B (기업)</option>
                </select>
              </div>
              {formVisibility.showIsRecipient && (
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
                          ...(!checked && {
                            depositorName: "",
                            repurchaseCycleMonths: null,
                          }),
                        }));
                      }}
                      disabled={isSubmitting}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-Text-High-90">
                      수급자 여부
                    </span>
                  </label>
                </div>
              )}
            </div>

            {formVisibility.showResidentId && (
              <div className="mt-3">
                <label className={labelCls}>주민등록번호</label>
                <input
                  type="text"
                  value={formData.residentId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9-]/g, "");
                    setFormData((prev) => ({ ...prev, residentId: value }));
                  }}
                  className={inputCls}
                  placeholder="000000-0000000"
                  maxLength={14}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {formVisibility.showDepositorName && (
              <div className="mt-3">
                <label className={labelCls}>입금자명</label>
                <input
                  type="text"
                  value={formData.depositorName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      depositorName: e.target.value,
                    }))
                  }
                  className={inputCls}
                  placeholder="지자체 환급 시 입금자명"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {formVisibility.showRepurchaseCycle && (
              <div className="mt-3">
                <label className={labelCls}>재구매 주기 (개월)</label>
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
                  className={inputCls}
                  placeholder="기본 3개월"
                  min={1}
                  max={120}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-10 bg-transparent text-Text-High-90 border border-Outline-Variant rounded-full text-sm font-medium hover:bg-Back-Mid-20 disabled:opacity-50 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-Primary-Main text-white rounded-full text-sm font-medium hover:brightness-90 active:brightness-85 disabled:bg-Gray-Sub-Disabled-40 disabled:text-Text-Low-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "추가 중..." : "추가"}
            </button>
          </div>
        </form>
      </div>

      {/* 주소 검색 모달 */}
      {isAddressOpen && (
        <SearchAddressModal
          onCompletePost={handleAddressChange}
          onClose={() => setIsAddressOpen(false)}
        />
      )}
    </div>
  );
};

export default AddSupplierModal;
