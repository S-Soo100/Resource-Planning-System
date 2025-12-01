"use client";

import React, { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { DemoResponse, DemoStatus } from "@/types/demo/demo";
import { formatDateForDisplayUTC } from "@/utils/dateUtils";
import { formatDateTimeToKorean } from "@/utils/calendar/calendarUtils";

type SortField = "createdAt" | "demoStartDate" | "demoTitle" | "demoStatus";
type SortOrder = "asc" | "desc" | null;

// 새로운 기록인지 확인하는 함수
const isNewRecord = (createdAt: string, status: string): boolean => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

  // 72시간 이내이고, 완료 상태가 아닌 경우
  const isWithin72Hours = hoursDiff <= 72;
  const isNotCompleted = !["demoCompleted", "demoCompletedAndReturned", "rejected", "rejectedByShipper"].includes(status);

  return isWithin72Hours && isNotCompleted;
};

interface DemoRecordTableProps {
  records: DemoResponse[];
  getStatusText: (status: string) => string;
  getStatusColorClass: (status: string) => string;
  canChangeStatus: () => boolean;
  handleStatusChange: (demoId: number, newStatus: DemoStatus) => Promise<void>;
  updatingStatusId: number | null;
  userAccessLevel: string;
  onDetailClick: (record: DemoResponse) => void;
}

export default function DemoRecordTable({
  records,
  getStatusText,
  getStatusColorClass,
  canChangeStatus,
  handleStatusChange,
  updatingStatusId,
  userAccessLevel,
  onDetailClick,
}: DemoRecordTableProps) {
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 같은 필드 클릭: null -> asc -> desc -> null
      if (sortOrder === null) {
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortOrder(null);
        setSortField("createdAt"); // 정렬 해제 시 기본값으로
      }
    } else {
      // 다른 필드 클릭: 해당 필드로 오름차순 정렬
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field || sortOrder === null) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />
    );
  };

  // 정렬된 레코드
  const sortedRecords = useMemo(() => {
    if (!sortField || sortOrder === null) {
      // 기본 정렬: 생성일 내림차순
      return [...records].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    }

    const sorted = [...records].sort((a, b) => {
      let compareResult = 0;

      switch (sortField) {
        case "createdAt": {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          compareResult = dateA.getTime() - dateB.getTime();
          break;
        }
        case "demoStartDate": {
          const dateA = a.demoStartDate ? new Date(a.demoStartDate) : new Date(0);
          const dateB = b.demoStartDate ? new Date(b.demoStartDate) : new Date(0);
          compareResult = dateA.getTime() - dateB.getTime();
          break;
        }
        case "demoTitle":
          compareResult = (a.demoTitle || "").localeCompare(b.demoTitle || "");
          break;
        case "demoStatus":
          compareResult = (a.demoStatus || "").localeCompare(b.demoStatus || "");
          break;
        default:
          compareResult = 0;
      }

      return sortOrder === "asc" ? compareResult : -compareResult;
    });

    return sorted;
  }, [records, sortField, sortOrder]);

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              유형
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                onClick={() => handleSort("demoTitle")}
                className="flex items-center hover:text-gray-700 select-none"
              >
                제목
                {renderSortIcon("demoTitle")}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                onClick={() => handleSort("createdAt")}
                className="flex items-center hover:text-gray-700 select-none"
              >
                생성일
                {renderSortIcon("createdAt")}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                onClick={() => handleSort("demoStartDate")}
                className="flex items-center hover:text-gray-700 select-none"
              >
                시작일
                {renderSortIcon("demoStartDate")}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                onClick={() => handleSort("demoStatus")}
                className="flex items-center hover:text-gray-700 select-none"
              >
                상태
                {renderSortIcon("demoStatus")}
              </button>
            </th>
            {canChangeStatus() && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                상태 변경
              </th>
            )}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedRecords.map((record, index) => (
            <tr
              key={record.id}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onDetailClick(record)}
            >
              <td className="px-4 py-3 text-sm text-gray-500">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">
                  {record.demoNationType || "국내"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {record.demoTitle || "제목 없음"}
                  </div>
                  {isNewRecord(record.createdAt, record.demoStatus) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {record.requester}
                  {record.demoPaymentType === "유료" && record.demoPrice && (
                    <span className="text-green-600 font-medium ml-1">
                      ({record.demoPrice.toLocaleString()}원)
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDateForDisplayUTC(record.createdAt)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {record.demoStartDate
                  ? formatDateTimeToKorean(record.demoStartDate, record.demoStartTime)
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColorClass(
                    record.demoStatus
                  )}`}
                >
                  {getStatusText(record.demoStatus)}
                </span>
              </td>
              {canChangeStatus() && (
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <select
                      value={record.demoStatus}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(
                          record.id,
                          e.target.value as DemoStatus
                        );
                      }}
                      disabled={
                        updatingStatusId === record.id ||
                        (userAccessLevel === "moderator" &&
                         record.demoStatus !== "requested" &&
                         record.demoStatus !== "approved" &&
                         record.demoStatus !== "rejected")
                      }
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 disabled:opacity-50 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {userAccessLevel === "moderator" ? (
                        <>
                          <option value="requested">요청</option>
                          <option value="approved">승인</option>
                          <option value="rejected">반려</option>
                        </>
                      ) : userAccessLevel === "admin" ? (
                        <>
                          <option value="requested">요청</option>
                          <option value="approved">승인</option>
                          <option value="rejected">반려</option>
                          <option value="confirmedByShipper">출고팀 확인</option>
                          <option value="shipmentCompleted">출고 완료</option>
                          <option value="rejectedByShipper">출고팀 반려</option>
                          <option value="demoCompleted">시연 완료</option>
                        </>
                      ) : null}
                    </select>
                    {updatingStatusId === record.id && (
                      <div className="w-4 h-4 rounded-full border-2 animate-spin border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"></div>
                    )}
                  </div>
                </td>
              )}
              <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetailClick(record);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 transition-colors"
                >
                  상세보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
