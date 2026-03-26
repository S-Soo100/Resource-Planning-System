"use client";
import React from "react";
import { cn } from "@/utils/cn";

type SerialCodeField = "serialCode1" | "serialCode2" | "serialCode3";

export interface SerialCodeInputGroupProps {
  serialCode1?: string;
  serialCode2?: string;
  serialCode3?: string;
  onChange: (field: SerialCodeField, value: string) => void;
  disabled?: boolean;
  /** 건강보험 등록 품목 여부 — true일 때만 건보 시리얼(serialCode2) 표시 */
  isHealthInsuranceRegistered?: boolean;
}

const SERIAL_FIELDS: {
  key: SerialCodeField;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "serialCode1",
    label: "제품 시리얼",
    placeholder: "제품 시리얼코드",
  },
  {
    key: "serialCode2",
    label: "건보 시리얼",
    placeholder: "건보 시리얼코드",
  },
  {
    key: "serialCode3",
    label: "예비",
    placeholder: "예비 시리얼코드",
  },
];

const inputClassName =
  "block w-full rounded-md border border-Outline-Variant bg-white px-3 py-1.5 text-sm text-Text-Highest-100 placeholder:text-Text-Lowest-60 focus:border-Primary-Main focus:outline-none focus:ring-2 focus:ring-Primary-Main/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-Back-Mid-20";

/**
 * 시리얼코드 입력 그룹 (v4.0 → v4.1)
 *
 * - 제품 시리얼: 항상 표시
 * - 건보 시리얼: isHealthInsuranceRegistered === true 일 때만 표시
 * - 예비 시리얼: 숨김 (I8 — 나중에 필요할 수 있어 코드는 유지)
 * - 서비스 품목(isService)일 경우 호출부에서 렌더하지 않는다.
 */
const SerialCodeInputGroup: React.FC<SerialCodeInputGroupProps> = ({
  serialCode1 = "",
  serialCode2 = "",
  serialCode3 = "",
  onChange,
  disabled = false,
  isHealthInsuranceRegistered = false,
}) => {
  const values: Record<SerialCodeField, string> = {
    serialCode1,
    serialCode2,
    serialCode3,
  };

  // I7: 건보 시리얼은 건강보험 등록 품목에만 표시
  // I8: 예비 시리얼(serialCode3)은 숨김 처리
  const visibleFields = SERIAL_FIELDS.filter((field) => {
    if (field.key === "serialCode2") return isHealthInsuranceRegistered;
    if (field.key === "serialCode3") return false; // I8: 예비 시리얼 숨김
    return true;
  });

  // 표시할 필드 수에 따라 그리드 열 조정
  const gridCols =
    visibleFields.length === 1
      ? "grid-cols-1"
      : visibleFields.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-Text-High-90">
        시리얼코드
      </label>
      <div className={`grid ${gridCols} gap-2`}>
        {visibleFields.map((field) => (
          <div key={field.key} className="space-y-1">
            <span className="text-xs text-Text-Lowest-60">{field.label}</span>
            <input
              type="text"
              value={values[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              className={cn(inputClassName)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export { SerialCodeInputGroup };
