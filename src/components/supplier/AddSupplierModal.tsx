"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { supplierApi } from "@/api/supplier-api";

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierPhone: "",
    supplierEmail: "",
    supplierAddress: "",
    registrationNumber: "",
    supplierNote: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierName.trim()) {
      toast.error("납품처 이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await supplierApi.createSupplier({
        supplierName: formData.supplierName.trim(),
        supplierPhoneNumber: formData.supplierPhone.trim() || undefined,
        email: formData.supplierEmail.trim() || undefined,
        supplierAddress: formData.supplierAddress.trim() || undefined,
        registrationNumber: formData.registrationNumber.trim() || undefined,
        memo: formData.supplierNote.trim() || undefined,
      });

      if (response.success) {
        toast.success("납품처가 추가되었습니다.");
        onSuccess();
        handleClose();
      } else {
        throw new Error(response.error || "납품처 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("납품처 추가 오류:", error);
      toast.error(
        error instanceof Error ? error.message : "납품처 추가에 실패했습니다."
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
      supplierAddress: "",
      registrationNumber: "",
      supplierNote: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            납품처 추가
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 납품처 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              납품처 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="납품처 이름을 입력하세요"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전화번호
            </label>
            <input
              type="tel"
              name="supplierPhone"
              value={formData.supplierPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="전화번호를 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              name="supplierEmail"
              value={formData.supplierEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이메일을 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주소
            </label>
            <input
              type="text"
              name="supplierAddress"
              value={formData.supplierAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="주소를 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 사업자 번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사업자 번호
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="사업자 번호를 입력하세요 (예: 123-45-67890)"
              disabled={isSubmitting}
            />
          </div>

          {/* 비고 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비고
            </label>
            <textarea
              name="supplierNote"
              value={formData.supplierNote}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="추가 정보를 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "추가 중..." : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;
