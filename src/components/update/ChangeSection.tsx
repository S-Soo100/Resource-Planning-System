import React from "react";
import { Plus, Edit, Bug, Shield, TrendingUp, Tag } from "lucide-react";
import { ChangeType, ChangeItem } from "@/types/update";

interface ChangeSectionProps {
  type: ChangeType;
  items: ChangeItem[];
}

/**
 * 변경사항 타입별 아이콘 반환
 */
const getIconForType = (type: ChangeType) => {
  switch (type) {
    case "추가됨":
      return <Plus className="w-4 h-4 text-green-600" />;
    case "변경됨":
      return <Edit className="w-4 h-4 text-blue-600" />;
    case "수정됨":
      return <Bug className="w-4 h-4 text-red-600" />;
    case "보안":
      return <Shield className="w-4 h-4 text-purple-600" />;
    case "개선됨":
      return <TrendingUp className="w-4 h-4 text-orange-600" />;
    case "제거됨":
      return <Tag className="w-4 h-4 text-gray-600" />;
  }
};

/**
 * 변경사항 타입별 색상 스타일 반환
 */
const getColorStyles = (type: ChangeType) => {
  switch (type) {
    case "추가됨":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        textTitle: "text-green-900",
        textDesc: "text-green-800",
      };
    case "변경됨":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        textTitle: "text-blue-900",
        textDesc: "text-blue-800",
      };
    case "수정됨":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        textTitle: "text-red-900",
        textDesc: "text-red-800",
      };
    case "보안":
      return {
        bg: "bg-purple-50",
        border: "border-purple-200",
        textTitle: "text-purple-900",
        textDesc: "text-purple-800",
      };
    case "개선됨":
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        textTitle: "text-orange-900",
        textDesc: "text-orange-800",
      };
    case "제거됨":
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        textTitle: "text-gray-900",
        textDesc: "text-gray-800",
      };
  }
};

/**
 * 개별 변경사항 섹션 컴포넌트
 */
export default function ChangeSection({ type, items }: ChangeSectionProps) {
  const colorStyles = getColorStyles(type);

  return (
    <div>
      <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
        {getIconForType(type)}
        <span className="ml-2">{type}</span>
      </h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${colorStyles.bg} ${colorStyles.border}`}
          >
            <h4 className={`mb-2 font-medium ${colorStyles.textTitle}`}>
              <strong>{item.title}</strong>
            </h4>
            {item.description.length > 0 && (
              <ul className={`space-y-1 text-sm ${colorStyles.textDesc}`}>
                {item.description.map((desc, descIndex) => (
                  <li key={descIndex}>• {desc}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
