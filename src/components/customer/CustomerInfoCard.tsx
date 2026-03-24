"use client";

import React, { useState } from "react";
import {
  Supplier,
  CustomerType,
  UpdateSupplierRequest,
} from "@/types/supplier";
import {
  User,
  Mail,
  Tag,
  Heart,
  Wallet,
  CreditCard,
  RefreshCw,
  Calendar,
  Phone,
  Building2,
  Check,
  Loader2,
} from "lucide-react";
import { getFieldVisibility } from "@/utils/customerFieldUtils";
import { supplierApi } from "@/api/supplier-api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface CustomerInfoCardProps {
  supplier: Supplier;
  canEdit: boolean;
  onEdit?: () => void;
}

export default function CustomerInfoCard({
  supplier,
  canEdit,
}: CustomerInfoCardProps) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);

  const visibility = getFieldVisibility(
    supplier.customerType,
    supplier.isRecipient
  );

  const maskedResidentId = supplier.residentId
    ? supplier.residentId.replace(/^(\d{6}-?)\d{7}$/, "$1*******")
    : null;

  // 단일 필드 업데이트 함수
  const updateField = async (
    data: UpdateSupplierRequest,
    fieldName: string
  ) => {
    setSaving(fieldName);
    try {
      const response = await supplierApi.updateSupplier(
        String(supplier.id),
        data
      );

      if (response.success) {
        toast.success("저장되었습니다");
        queryClient.invalidateQueries({
          queryKey: ["supplier", String(supplier.id)],
        });
        queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        queryClient.invalidateQueries({ queryKey: ["teamCustomers"] });
      } else {
        toast.error(response.error || "수정에 실패했습니다");
      }
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다");
    } finally {
      setSaving(null);
    }
  };

  // 판매대상 유형 변경 시 관련 필드 초기화
  const handleCustomerTypeChange = (newType: CustomerType | null) => {
    const data: UpdateSupplierRequest = { customerType: newType };
    if (newType === "b2b") {
      data.isRecipient = false;
      data.residentId = null;
      data.depositorName = null;
      data.repurchaseCycleMonths = null;
    }
    updateField(data, "customerType");
  };

  // 수급자 해제 시 수급자 전용 필드 초기화
  const handleRecipientChange = (checked: boolean) => {
    const data: UpdateSupplierRequest = { isRecipient: checked };
    if (!checked) {
      data.depositorName = null;
      data.repurchaseCycleMonths = null;
    }
    updateField(data, "isRecipient");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-Text-Highest-100">
          판매대상 기본 정보
        </h2>
        {saving && (
          <div className="flex items-center gap-1.5 text-xs text-Primary-Main">
            <Loader2 className="w-3 h-3 animate-spin" />
            저장 중...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 판매대상명 */}
        <InlineTextItem
          icon={<User className="w-4 h-4" />}
          label="판매대상명"
          value={supplier.supplierName || "-"}
          rawValue={supplier.supplierName || ""}
          canEdit={canEdit}
          placeholder="판매대상명"
          isSaving={saving === "supplierName"}
          onSave={(val) => updateField({ supplierName: val }, "supplierName")}
        />
        {/* 이메일 */}
        <InlineTextItem
          icon={<Mail className="w-4 h-4" />}
          label="이메일"
          value={supplier.email || "-"}
          rawValue={supplier.email || ""}
          canEdit={canEdit}
          placeholder="이메일"
          isSaving={saving === "email"}
          onSave={(val) => updateField({ email: val || undefined }, "email")}
        />
        {/* 연락처 */}
        <InlineTextItem
          icon={<Phone className="w-4 h-4" />}
          label="연락처"
          value={supplier.supplierPhoneNumber || "-"}
          rawValue={supplier.supplierPhoneNumber || ""}
          canEdit={canEdit}
          placeholder="전화번호"
          isSaving={saving === "supplierPhoneNumber"}
          onSave={(val) =>
            updateField(
              { supplierPhoneNumber: val || undefined },
              "supplierPhoneNumber"
            )
          }
        />

        {/* 판매대상 유형 (드롭다운) */}
        <div className="flex items-start gap-3 p-3 bg-Back-Low-10 rounded-xl">
          <div className="mt-0.5 text-Text-Low-70">
            <Tag className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-Text-Low-70 mb-1">판매대상 유형</p>
            {canEdit ? (
              <select
                value={supplier.customerType || ""}
                onChange={(e) => {
                  const val = (e.target.value || null) as CustomerType | null;
                  handleCustomerTypeChange(val);
                }}
                disabled={saving === "customerType"}
                className="w-full px-2 py-1 text-sm font-medium bg-white border border-Outline-Variant rounded-lg focus:border-Primary-Main focus:ring-1 focus:ring-Primary-Main/20 focus:outline-none transition-all disabled:opacity-50"
              >
                <option value="">미설정</option>
                <option value="b2c">B2C (개인)</option>
                <option value="b2b">B2B (기업)</option>
              </select>
            ) : (
              <BadgeOrText
                value={
                  supplier.customerType === "b2c"
                    ? "B2C (개인)"
                    : supplier.customerType === "b2b"
                      ? "B2B (기업)"
                      : "미설정"
                }
                badge={
                  supplier.customerType
                    ? {
                        text: supplier.customerType.toUpperCase(),
                        color:
                          supplier.customerType === "b2c"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-emerald-100 text-emerald-700",
                      }
                    : undefined
                }
              />
            )}
          </div>
        </div>

        {/* 사업자번호 */}
        {visibility.showRegistrationNumber && (
          <InlineTextItem
            icon={<Building2 className="w-4 h-4" />}
            label="사업자번호"
            value={supplier.registrationNumber || "-"}
            rawValue={supplier.registrationNumber || ""}
            canEdit={canEdit}
            placeholder="123-45-67890"
            isSaving={saving === "registrationNumber"}
            onSave={(val) =>
              updateField(
                { registrationNumber: val || undefined },
                "registrationNumber"
              )
            }
          />
        )}

        {/* 대표자명 */}
        {visibility.showRepresentativeName && (
          <InlineTextItem
            icon={<User className="w-4 h-4" />}
            label="대표자명"
            value={supplier.representativeName || "-"}
            rawValue={supplier.representativeName || ""}
            canEdit={canEdit}
            placeholder="대표자명"
            isSaving={saving === "representativeName"}
            onSave={(val) =>
              updateField(
                { representativeName: val || undefined },
                "representativeName"
              )
            }
          />
        )}

        {/* 주민등록번호 (인라인 편집) */}
        {visibility.showResidentId && (
          <InlineTextItem
            icon={<CreditCard className="w-4 h-4" />}
            label="주민등록번호"
            value={maskedResidentId || "-"}
            rawValue={supplier.residentId || ""}
            canEdit={canEdit}
            placeholder="000000-0000000"
            maxLength={14}
            isSaving={saving === "residentId"}
            formatInput={(v) => v.replace(/[^0-9-]/g, "")}
            onSave={(val) =>
              updateField({ residentId: val || null }, "residentId")
            }
          />
        )}

        {/* 수급자 여부 (체크박스) */}
        {visibility.showIsRecipient && (
          <div className="flex items-start gap-3 p-3 bg-Back-Low-10 rounded-xl">
            <div className="mt-0.5 text-Text-Low-70">
              <Heart className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-Text-Low-70 mb-1">수급자 여부</p>
              {canEdit ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supplier.isRecipient ?? false}
                    onChange={(e) => handleRecipientChange(e.target.checked)}
                    disabled={saving === "isRecipient"}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-Text-Highest-100">
                    {supplier.isRecipient ? "수급자" : "해당 없음"}
                  </span>
                </label>
              ) : (
                <BadgeOrText
                  value={supplier.isRecipient ? "수급자" : "해당 없음"}
                  badge={
                    supplier.isRecipient
                      ? { text: "수급자", color: "bg-green-100 text-green-700" }
                      : undefined
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* 입금자명 (인라인 편집) */}
        {visibility.showDepositorName && (
          <InlineTextItem
            icon={<Wallet className="w-4 h-4" />}
            label="입금자명"
            value={supplier.depositorName || "-"}
            rawValue={supplier.depositorName || ""}
            canEdit={canEdit}
            placeholder="지자체 환급 입금자명"
            isSaving={saving === "depositorName"}
            onSave={(val) =>
              updateField({ depositorName: val || null }, "depositorName")
            }
          />
        )}

        {/* 재구매 주기 (인라인 편집) */}
        {visibility.showRepurchaseCycle && (
          <InlineNumberItem
            icon={<RefreshCw className="w-4 h-4" />}
            label="재구매 주기"
            value={
              supplier.repurchaseCycleMonths
                ? `${supplier.repurchaseCycleMonths}개월`
                : "기본 3개월"
            }
            rawValue={supplier.repurchaseCycleMonths}
            canEdit={canEdit}
            placeholder="개월 수"
            suffix="개월"
            min={1}
            max={120}
            isSaving={saving === "repurchaseCycleMonths"}
            onSave={(val) =>
              updateField(
                { repurchaseCycleMonths: val },
                "repurchaseCycleMonths"
              )
            }
          />
        )}

        {/* 재구매 예정일 (읽기 전용 - 자동 갱신) */}
        {visibility.showRepurchaseDueDate && (
          <ReadOnlyItem
            icon={<Calendar className="w-4 h-4" />}
            label="재구매 예정일"
            value={
              supplier.repurchaseDueDate
                ? new Date(supplier.repurchaseDueDate).toLocaleDateString(
                    "ko-KR"
                  )
                : "미설정"
            }
            hint="출고 완료 시 자동 갱신"
          />
        )}
      </div>
    </div>
  );
}

// === 하위 컴포넌트들 ===

function ReadOnlyItem({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-Back-Low-10 rounded-xl">
      <div className="mt-0.5 text-Text-Low-70">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-Text-Low-70 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-Text-Highest-100 truncate">
          {value}
        </p>
        {hint && (
          <p className="text-[10px] text-Text-Lowest-60 mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  );
}

function BadgeOrText({
  value,
  badge,
}: {
  value: string;
  badge?: { text: string; color: string };
}) {
  if (badge) {
    return (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  }
  return (
    <p className="text-sm font-medium text-Text-Highest-100 truncate">
      {value}
    </p>
  );
}

function InlineTextItem({
  icon,
  label,
  value,
  rawValue,
  canEdit,
  placeholder,
  maxLength,
  isSaving,
  formatInput,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  rawValue: string;
  canEdit: boolean;
  placeholder?: string;
  maxLength?: number;
  isSaving: boolean;
  formatInput?: (v: string) => string;
  onSave: (val: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(rawValue);

  const handleStartEdit = () => {
    setEditValue(rawValue);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== rawValue) {
      onSave(editValue);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-Back-Low-10 rounded-xl">
      <div className="mt-0.5 text-Text-Low-70">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-Text-Low-70 mb-0.5">{label}</p>
        {canEdit && isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => {
                const v = formatInput
                  ? formatInput(e.target.value)
                  : e.target.value;
                setEditValue(v);
              }}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              autoFocus
              disabled={isSaving}
              maxLength={maxLength}
              placeholder={placeholder}
              className="w-full px-2 py-0.5 text-sm border border-Primary-Main rounded-lg focus:outline-none focus:ring-1 focus:ring-Primary-Main/20 disabled:opacity-50"
            />
          </div>
        ) : canEdit ? (
          <button
            onClick={handleStartEdit}
            disabled={isSaving}
            className={`w-full text-left text-sm font-medium cursor-pointer disabled:opacity-50 truncate rounded-lg transition-all ${
              !rawValue
                ? "px-2 py-1.5 border border-dashed border-gray-300 text-Text-Low-70 hover:border-Primary-Main hover:text-Primary-Main hover:bg-Primary-Main/5"
                : "text-Primary-Main hover:underline"
            }`}
          >
            {!rawValue
              ? placeholder
                ? `${placeholder} 입력`
                : "클릭하여 입력"
              : value}
          </button>
        ) : (
          <p className="text-sm font-medium text-Text-Highest-100 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function InlineNumberItem({
  icon,
  label,
  value,
  rawValue,
  canEdit,
  placeholder,
  suffix,
  min,
  max,
  isSaving,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  rawValue: number | null | undefined;
  canEdit: boolean;
  placeholder?: string;
  suffix?: string;
  min?: number;
  max?: number;
  isSaving: boolean;
  onSave: (val: number | null) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(rawValue?.toString() ?? "");

  const handleStartEdit = () => {
    setEditValue(rawValue?.toString() ?? "");
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    const numVal = editValue ? parseInt(editValue) : null;
    if (numVal !== (rawValue ?? null)) {
      onSave(numVal);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-Back-Low-10 rounded-xl">
      <div className="mt-0.5 text-Text-Low-70">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-Text-Low-70 mb-0.5">{label}</p>
        {canEdit && isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              autoFocus
              disabled={isSaving}
              placeholder={placeholder}
              min={min}
              max={max}
              className="w-full px-2 py-0.5 text-sm border border-Primary-Main rounded-lg focus:outline-none focus:ring-1 focus:ring-Primary-Main/20 disabled:opacity-50"
            />
            {suffix && (
              <span className="text-xs text-Text-Low-70 shrink-0">
                {suffix}
              </span>
            )}
          </div>
        ) : canEdit ? (
          <button
            onClick={handleStartEdit}
            disabled={isSaving}
            className={`w-full text-left text-sm font-medium cursor-pointer disabled:opacity-50 truncate rounded-lg transition-all ${
              rawValue == null
                ? "px-2 py-1.5 border border-dashed border-gray-300 text-Text-Low-70 hover:border-Primary-Main hover:text-Primary-Main hover:bg-Primary-Main/5"
                : "text-Primary-Main hover:underline"
            }`}
          >
            {rawValue == null
              ? placeholder
                ? `${placeholder} 입력`
                : "클릭하여 입력"
              : value}
          </button>
        ) : (
          <p className="text-sm font-medium text-Text-Highest-100 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
