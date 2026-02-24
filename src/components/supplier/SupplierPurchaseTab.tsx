"use client";

import React, { useState } from "react";
import { PurchaseRecord } from "@/types/purchase";
import { TeamItem } from "@/types/(item)/team-item";
import { Package } from "lucide-react";
import { format } from "date-fns";

interface SupplierPurchaseTabProps {
  records: PurchaseRecord[];
  teamItemsMap?: Map<number, TeamItem>;
  isLoading?: boolean;
}

export function SupplierPurchaseTab({
  records,
  teamItemsMap,
  isLoading,
}: SupplierPurchaseTabProps) {
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
          <p className="text-sm text-Text-Low-70">구매 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="w-12 h-12 text-Text-Lowest-60 mb-3" />
        <p className="text-base font-medium text-Text-High-90">구매 내역이 없습니다</p>
        <p className="mt-1 text-sm text-Text-Low-70">해당 기간 내 구매 거래가 없습니다</p>
      </div>
    );
  }

  // 실시간 원가 조회 함수
  const getCostPrice = (record: PurchaseRecord): number | null => {
    if (!teamItemsMap) return null;
    const teamItemId = record.originalRecord.item?.teamItem?.id;
    if (!teamItemId) return null;
    const teamItem = teamItemsMap.get(teamItemId);
    return teamItem?.costPrice ?? null;
  };

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
                입고일자
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                품목코드
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                품목명
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                수량
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                단가 (원가)
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                금액
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap">
                비고
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-Outline-Variant bg-white">
            {records.map((record, index) => {
              const costPrice = getCostPrice(record);
              const totalPrice =
                costPrice !== null ? record.quantity * costPrice : null;

              return (
                <tr key={record.id} className="hover:bg-Back-Low-10 transition-colors">
                  <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                    {format(new Date(record.inboundDate), "yyyy-MM-dd")}
                  </td>
                  <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                    {record.itemCode}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-Text-Highest-100 max-w-[200px] truncate">
                    {record.itemName}
                  </td>
                  <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                    {record.quantity.toLocaleString()}개
                  </td>
                  <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                    {costPrice !== null
                      ? `₩${costPrice.toLocaleString()}`
                      : <span className="text-Text-Lowest-60">미입력</span>}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-Text-Highest-100 whitespace-nowrap">
                    {totalPrice !== null
                      ? `₩${totalPrice.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-5 py-4 text-sm text-Text-Low-70 max-w-[150px] truncate">
                    {record.remarks || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // 모바일 카드
  return (
    <div className="space-y-3">
      {records.map((record, index) => {
        const costPrice = getCostPrice(record);
        const totalPrice = costPrice !== null ? record.quantity * costPrice : null;

        return (
          <div
            key={record.id}
            className="bg-white border border-Outline-Variant rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-3 pb-3 border-b border-Outline-Variant">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-Text-Highest-100 truncate">
                  {record.itemName}
                </p>
                <p className="text-xs text-Text-Low-70 mt-0.5">
                  #{index + 1} • {record.itemCode}
                </p>
              </div>
              <span className="text-sm font-semibold text-Text-Highest-100 shrink-0 ml-2">
                {totalPrice !== null ? `₩${totalPrice.toLocaleString()}` : "-"}
              </span>
            </div>

            {/* 본문 */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-Text-Low-70">입고일자</span>
                <span className="text-Text-High-90">
                  {format(new Date(record.inboundDate), "yyyy-MM-dd")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-Text-Low-70">수량</span>
                <span className="text-Text-High-90">{record.quantity.toLocaleString()}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-Text-Low-70">단가 (원가)</span>
                <span className="text-Text-High-90">
                  {costPrice !== null ? (
                    `₩${costPrice.toLocaleString()}`
                  ) : (
                    <span className="text-Text-Lowest-60">미입력</span>
                  )}
                </span>
              </div>
              {record.remarks && (
                <div className="pt-2 border-t border-Outline-Variant">
                  <p className="text-xs text-Text-Low-70 mb-1">비고</p>
                  <p className="text-sm text-Text-High-90">{record.remarks}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
