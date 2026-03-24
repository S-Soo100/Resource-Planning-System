"use client";

import React from "react";
import { Supplier } from "@/types/supplier";
import { Building2, User, Phone, FileText, MapPin, Mail } from "lucide-react";
import {
  getCustomerTypeBadge,
  getRecipientBadge,
} from "@/utils/customerFieldUtils";

interface SupplierDetailHeaderProps {
  supplier: Supplier;
}

export function SupplierDetailHeader({ supplier }: SupplierDetailHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-6">
      {/* 헤더 (고객명 + 수정 버튼) */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-Outline-Variant">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-medium text-Text-Highest-100">
                {supplier.supplierName}
              </h1>
              {(() => {
                const typeBadge = getCustomerTypeBadge(supplier.customerType);
                const recipientBadge = getRecipientBadge(supplier.isRecipient);
                return (
                  <>
                    {typeBadge && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeBadge.color}`}
                      >
                        {typeBadge.text}
                      </span>
                    )}
                    {recipientBadge && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${recipientBadge.color}`}
                      >
                        {recipientBadge.text}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
            <p className="text-sm text-Text-Low-70 mt-0.5">
              판매대상 상세 정보
            </p>
          </div>
        </div>

        {/* 정보 수정은 고객 정보 탭에서 인라인 편집 */}
      </div>

      {/* 고객 정보 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 대표자명 */}
        {supplier.representativeName && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-Back-Mid-20 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-Text-High-90" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-Text-Low-70 mb-0.5">대표자명</p>
              <p className="text-sm font-medium text-Text-Highest-100 break-words">
                {supplier.representativeName}
              </p>
            </div>
          </div>
        )}

        {/* 전화번호 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-Back-Mid-20 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-Text-High-90" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-Text-Low-70 mb-0.5">전화번호</p>
            <p className="text-sm font-medium text-Text-Highest-100 break-words">
              {supplier.supplierPhoneNumber || "-"}
            </p>
          </div>
        </div>

        {/* 이메일 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-Back-Mid-20 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-Text-High-90" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-Text-Low-70 mb-0.5">이메일</p>
            <p className="text-sm font-medium text-Text-Highest-100 break-words">
              {supplier.email || "-"}
            </p>
          </div>
        </div>

        {/* 사업자등록번호 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-Back-Mid-20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-Text-High-90" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-Text-Low-70 mb-0.5">사업자등록번호</p>
            <p className="text-sm font-medium text-Text-Highest-100 break-words">
              {supplier.registrationNumber || "-"}
            </p>
          </div>
        </div>

        {/* 주소 */}
        {supplier.supplierAddress && (
          <div className="flex items-start gap-3 md:col-span-2">
            <div className="w-10 h-10 rounded-lg bg-Back-Mid-20 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-Text-High-90" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-Text-Low-70 mb-0.5">주소</p>
              <p className="text-sm font-medium text-Text-Highest-100 break-words">
                {supplier.supplierAddress}
              </p>
            </div>
          </div>
        )}

        {/* 메모 */}
        {supplier.memo && (
          <div className="flex items-start gap-3 md:col-span-2">
            <div className="w-10 h-10 rounded-lg bg-Back-Mid-20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-Text-High-90" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-Text-Low-70 mb-0.5">메모</p>
              <p className="text-sm text-Text-High-90 break-words whitespace-pre-wrap">
                {supplier.memo}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
