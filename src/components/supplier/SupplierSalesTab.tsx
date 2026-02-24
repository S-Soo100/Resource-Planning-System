"use client";

import React, { useState, useMemo } from "react";
import { SalesRecord } from "@/types/sales";
import { FileText, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";

interface SupplierSalesTabProps {
  records: SalesRecord[];
  isLoading?: boolean;
}

// 상태 한글 변환
const statusKorMap: Record<string, string> = {
  requested: "요청",
  approved: "승인완료",
  rejected: "반려",
  confirmedByShipper: "출고자확인",
  shipmentCompleted: "출고완료",
  rejectedByShipper: "출고자반려",
};

export function SupplierSalesTab({ records, isLoading }: SupplierSalesTabProps) {
  const { user } = useCurrentUser();
  const canViewMargin = user?.accessLevel === "admin" || user?.accessLevel === "moderator";

  // 필터링은 useSupplierDetail에서 이미 처리됨 (요청/반려/출고자반려 제외)
  const filteredRecords = records;

  // 데스크톱/모바일 감지
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 760);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-Primary-Main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-Text-Low-70">판매 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (filteredRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-12 h-12 text-Text-Lowest-60 mb-3" />
        <p className="text-base font-medium text-Text-High-90">판매 내역이 없습니다</p>
        <p className="mt-1 text-sm text-Text-Low-70">해당 기간 내 판매 거래가 없습니다</p>
      </div>
    );
  }

  // 데스크톱 테이블
  if (!isMobile) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-Back-Low-10 border-b border-Outline-Variant">
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                No
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                발주일자
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                제목
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                품목 수
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                총 수량
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                판매 금액
              </th>
              {canViewMargin && (
                <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                  마진율
                </th>
              )}
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-Outline-Variant bg-white">
            {filteredRecords.map((record, index) => (
              <tr key={record.id} className="hover:bg-Back-Low-10 transition-colors">
                <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                  {format(new Date(record.purchaseDate), "yyyy-MM-dd")}
                </td>
                <td className="px-5 py-4 text-sm font-medium max-w-[200px]">
                  <Link
                    href={`/orderRecord/${record.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline truncate block transition-colors"
                  >
                    {record.title}
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                  {record.itemCount}개
                </td>
                <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                  {record.totalQuantity}개
                </td>
                <td className="px-5 py-4 text-sm font-medium text-Text-Highest-100 whitespace-nowrap">
                  {record.totalPrice !== null
                    ? `₩${record.totalPrice.toLocaleString()}`
                    : "-"}
                </td>
                {canViewMargin && (
                  <td className="px-5 py-4 text-sm whitespace-nowrap">
                    {record.marginRate !== null && record.marginRate !== undefined ? (
                      <span
                        className={`font-medium ${
                          record.isNegativeMargin
                            ? "text-red-600"
                            : "text-purple-600"
                        }`}
                      >
                        {record.marginRate.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-Text-Low-70">-</span>
                    )}
                  </td>
                )}
                <td className="px-5 py-4 text-sm whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      record.status === "shipmentCompleted"
                        ? "bg-green-100 text-green-700"
                        : record.status === "approved"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusKorMap[record.status] || record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 모바일 카드
  return (
    <div className="space-y-3">
      {filteredRecords.map((record, index) => (
        <Link
          key={record.id}
          href={`/orderRecord/${record.id}`}
          className="block bg-white border border-Outline-Variant rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all active:scale-[0.99]"
        >
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-3 pb-3 border-b border-Outline-Variant">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-600 truncate">
                {record.title}
              </p>
              <p className="text-xs text-Text-Low-70 mt-0.5">
                #{index + 1} • {format(new Date(record.purchaseDate), "yyyy-MM-dd")}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${
                record.status === "shipmentCompleted"
                  ? "bg-green-100 text-green-700"
                  : record.status === "approved"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {statusKorMap[record.status] || record.status}
            </span>
          </div>

          {/* 본문 */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-Text-Low-70">품목 수</span>
              <span className="text-Text-High-90">{record.itemCount}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-Text-Low-70">총 수량</span>
              <span className="text-Text-High-90">{record.totalQuantity}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-Text-Low-70">판매 금액</span>
              <span className="text-Text-Highest-100 font-semibold">
                {record.totalPrice !== null
                  ? `₩${record.totalPrice.toLocaleString()}`
                  : "-"}
              </span>
            </div>
            {canViewMargin && record.marginRate !== null && record.marginRate !== undefined && (
              <div className="flex justify-between">
                <span className="text-Text-Low-70">마진율</span>
                <span
                  className={`font-semibold ${
                    record.isNegativeMargin ? "text-red-600" : "text-purple-600"
                  }`}
                >
                  {record.marginRate.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
