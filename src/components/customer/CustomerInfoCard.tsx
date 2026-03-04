"use client";

import React from "react";
import { IUser } from "@/types/(auth)/user";
import {
  User,
  Mail,
  Tag,
  Heart,
  Wallet,
  CreditCard,
  RefreshCw,
  Calendar,
  Pencil,
} from "lucide-react";

interface CustomerInfoCardProps {
  user: IUser;
  onEdit?: () => void;
  canEdit: boolean;
}

export default function CustomerInfoCard({
  user,
  onEdit,
  canEdit,
}: CustomerInfoCardProps) {
  const maskedResidentId = user.residentId
    ? user.residentId.replace(/^(\d{6}-?)\d{7}$/, "$1*******")
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-Text-Highest-100">
          고객 기본 정보
        </h2>
        {canEdit && onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-Primary-Container text-Primary-Main rounded-lg text-sm font-medium hover:bg-Primary-Container/70 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            수정
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoItem
          icon={<User className="w-4 h-4" />}
          label="이름"
          value={user.name}
        />
        <InfoItem
          icon={<Mail className="w-4 h-4" />}
          label="이메일"
          value={user.email}
        />
        <InfoItem
          icon={<Tag className="w-4 h-4" />}
          label="고객 유형"
          value={
            user.customerType === "b2c"
              ? "B2C (개인)"
              : user.customerType === "b2b"
                ? "B2B (기업)"
                : "미설정"
          }
          badge={
            user.customerType
              ? {
                  text: user.customerType.toUpperCase(),
                  color:
                    user.customerType === "b2c"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-emerald-100 text-emerald-700",
                }
              : undefined
          }
        />
        <InfoItem
          icon={<Heart className="w-4 h-4" />}
          label="수급자 여부"
          value={user.isRecipient ? "수급자" : "해당 없음"}
          badge={
            user.isRecipient
              ? { text: "수급자", color: "bg-green-100 text-green-700" }
              : undefined
          }
        />
        <InfoItem
          icon={<Wallet className="w-4 h-4" />}
          label="입금자명"
          value={user.depositorName || "-"}
        />
        <InfoItem
          icon={<CreditCard className="w-4 h-4" />}
          label="주민등록번호"
          value={maskedResidentId || "-"}
        />
        <InfoItem
          icon={<RefreshCw className="w-4 h-4" />}
          label="재구매 주기"
          value={
            user.repurchaseCycleMonths
              ? `${user.repurchaseCycleMonths}개월`
              : "기본 3개월"
          }
        />
        <InfoItem
          icon={<Calendar className="w-4 h-4" />}
          label="재구매 예정일"
          value={
            user.repurchaseDueDate
              ? new Date(user.repurchaseDueDate).toLocaleDateString("ko-KR")
              : "미설정"
          }
        />
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: { text: string; color: string };
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-Back-Low-10 rounded-xl">
      <div className="mt-0.5 text-Text-Low-70">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-Text-Low-70 mb-0.5">{label}</p>
        {badge ? (
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}
          >
            {badge.text}
          </span>
        ) : (
          <p className="text-sm font-medium text-Text-Highest-100 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
