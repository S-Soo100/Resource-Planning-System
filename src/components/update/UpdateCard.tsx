import React from "react";
import { Calendar } from "lucide-react";
import { VersionUpdate, ChangeType } from "@/types/update";
import ChangeSection from "./ChangeSection";

interface UpdateCardProps {
  update: VersionUpdate;
}

/**
 * 개별 버전 업데이트 카드 컴포넌트
 */
export default function UpdateCard({ update }: UpdateCardProps) {
  // 변경사항 타입 순서 정의 (Keep a Changelog 표준 순서)
  const changeTypeOrder: ChangeType[] = [
    "보안",
    "수정됨",
    "추가됨",
    "변경됨",
    "개선됨",
    "제거됨",
  ];

  // 존재하는 변경사항만 필터링하여 순서대로 정렬
  const orderedChanges = changeTypeOrder.filter(
    (type) => update.changes[type] && update.changes[type]!.length > 0
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              v{update.version}
            </h2>
            {update.isLatest && (
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                최신
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-1 w-4 h-4" />
            {update.date}
          </div>
        </div>
      </div>

      {/* 변경사항 */}
      <div className="p-6">
        <div className="space-y-6">
          {orderedChanges.map((type) => (
            <ChangeSection
              key={type}
              type={type}
              items={update.changes[type]!}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
