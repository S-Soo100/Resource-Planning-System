import React, { useState, useMemo } from "react";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { OrderStatus } from "@/types/(order)/order";
import { ArrowUpDown, ArrowUp, ArrowDown, Package, Sparkles } from "lucide-react";
import { formatDateForDisplayUTC } from "@/utils/dateUtils";

// 새로운 기록인지 확인하는 함수
const isNewRecord = (createdAt: string, status: string): boolean => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

  // 72시간 이내이고, 완료 상태가 아닌 경우
  const isWithin72Hours = hoursDiff <= 72;
  const isNotCompleted = !["shipmentCompleted", "rejected", "rejectedByShipper"].includes(status);

  return isWithin72Hours && isNotCompleted;
};

interface OrderRecordTableProps {
  records: IOrderRecord[];
  getStatusText: (status: string) => string;
  getStatusColorClass: (status: string) => string;
  hasPermissionToChangeStatus: () => boolean;
  handleStatusChange: (id: number, status: OrderStatus) => void;
  isUpdatingStatus: number | null;
  userAccessLevel: string;
  auth: any;
  onDetailClick: (record: IOrderRecord) => void;
}

type SortField = "createdAt" | "outboundDate" | "title" | "status";
type SortOrder = "asc" | "desc" | null;

export default function OrderRecordTable({
  records,
  getStatusText,
  getStatusColorClass,
  hasPermissionToChangeStatus,
  handleStatusChange,
  isUpdatingStatus,
  userAccessLevel,
  auth,
  onDetailClick,
}: OrderRecordTableProps) {
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder(null);
        setSortField("createdAt");
      } else {
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    if (sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />;
    }
    if (sortOrder === "desc") {
      return <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />;
    }
    return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
  };

  // 정렬된 레코드 목록
  const sortedRecords = useMemo(() => {
    if (!sortField || !sortOrder) return records;

    const sorted = [...records].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "outboundDate":
          aValue = new Date(a.outboundDate || a.createdAt).getTime();
          bValue = new Date(b.outboundDate || b.createdAt).getTime();
          break;
        case "title":
          aValue = a.title || "";
          bValue = b.title || "";
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  }, [records, sortField, sortOrder]);

  if (records.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl shadow-sm">
        <Package className="mx-auto w-12 h-12 text-gray-300" />
        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          발주 기록이 없습니다
        </h3>
        <p className="mt-1 text-base text-gray-500">
          아직 발주 요청이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              유형
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center">
                제목
                {renderSortIcon("title")}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none w-32"
              onClick={() => handleSort("createdAt")}
            >
              <div className="flex items-center">
                생성일
                {renderSortIcon("createdAt")}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none w-32"
              onClick={() => handleSort("outboundDate")}
            >
              <div className="flex items-center">
                출고예정일
                {renderSortIcon("outboundDate")}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none w-28"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                상태
                {renderSortIcon("status")}
              </div>
            </th>
            {hasPermissionToChangeStatus() && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                상태 변경
              </th>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedRecords.map((record, index) => (
            <tr
              key={record.id}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onDetailClick(record)}
            >
              {/* 번호 */}
              <td className="px-6 py-4 text-sm text-gray-500">
                {index + 1}
              </td>

              {/* 유형 */}
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                    record.packageId && record.packageId > 0
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {record.packageId && record.packageId > 0
                    ? "패키지"
                    : "개별"}
                </span>
              </td>

              {/* 제목 */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900">
                    {record.title ||
                      `${
                        record.warehouse?.warehouseName ||
                        "알 수 없는 창고"
                      }에서 ${
                        record.orderItems &&
                        record.orderItems.length > 0
                          ? record.orderItems.length > 1
                            ? `${
                                record.orderItems[0]?.item?.teamItem
                                  ?.itemName || "품목"
                              } 등 ${record.orderItems.length}개 품목`
                            : `${
                                record.orderItems[0]?.item?.teamItem
                                  ?.itemName || "품목"
                              }`
                          : "품목"
                      } 출고`}
                  </div>
                  {isNewRecord(record.createdAt, record.status) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse flex-shrink-0">
                      <Sparkles className="w-3 h-3" />
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {record.requester}
                </div>
              </td>

              {/* 생성일 */}
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDateForDisplayUTC(record.createdAt)}
              </td>

              {/* 출고예정일 */}
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDateForDisplayUTC(record.outboundDate)}
              </td>

              {/* 상태 */}
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusColorClass(
                    record.status
                  )}`}
                >
                  {getStatusText(record.status)}
                </span>
              </td>

              {/* 상태 변경 드롭다운 */}
              {hasPermissionToChangeStatus() && (
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={record.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(record.id, e.target.value as OrderStatus);
                      }}
                      disabled={isUpdatingStatus === record.id}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 disabled:opacity-50 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {userAccessLevel === "moderator" ? (
                        <>
                          <option value={OrderStatus.requested}>요청</option>
                          <option value={OrderStatus.approved} disabled={record.userId === auth?.id}>
                            승인{record.userId === auth?.id ? " (본인)" : ""}
                          </option>
                          <option value={OrderStatus.rejected} disabled={record.userId === auth?.id}>
                            반려{record.userId === auth?.id ? " (본인)" : ""}
                          </option>
                        </>
                      ) : userAccessLevel === "admin" ? (
                        <>
                          <option value={OrderStatus.requested}>요청</option>
                          <option value={OrderStatus.approved}>승인</option>
                          <option value={OrderStatus.rejected}>반려</option>
                          <option value={OrderStatus.confirmedByShipper}>출고팀 확인</option>
                          <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
                          <option value={OrderStatus.rejectedByShipper}>출고 보류</option>
                        </>
                      ) : null}
                    </select>
                    {isUpdatingStatus === record.id && (
                      <div className="w-4 h-4 rounded-full border-2 animate-spin border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"></div>
                    )}
                  </div>
                </td>
              )}

              {/* 상세보기 버튼 */}
              <td className="px-6 py-4 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetailClick(record);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
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
