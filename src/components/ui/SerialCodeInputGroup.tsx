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
 * 시리얼코드 3종 입력 그룹 (v4.0)
 *
 * 제품 시리얼, 건보 시리얼, 예비 — 3개 input을 가로 배치.
 * 서비스 품목(isService)일 경우 호출부에서 렌더하지 않는다.
 */
const SerialCodeInputGroup: React.FC<SerialCodeInputGroupProps> = ({
  serialCode1 = "",
  serialCode2 = "",
  serialCode3 = "",
  onChange,
  disabled = false,
}) => {
  const values: Record<SerialCodeField, string> = {
    serialCode1,
    serialCode2,
    serialCode3,
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-Text-High-90">
        시리얼코드
      </label>
      <div className="grid grid-cols-3 gap-2">
        {SERIAL_FIELDS.map((field) => (
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
