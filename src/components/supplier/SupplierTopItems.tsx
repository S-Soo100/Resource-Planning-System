"use client";

import React, { useMemo } from "react";
import { SalesRecord } from "@/types/sales";
import { PurchaseRecord } from "@/types/purchase";
import { Package } from "lucide-react";

interface SupplierTopItemsProps {
  salesRecords: SalesRecord[];
  purchaseRecords: PurchaseRecord[];
}

interface ItemStats {
  itemCode: string;
  itemName: string;
  salesCount: number;
  purchaseCount: number;
  totalCount: number;
}

export function SupplierTopItems({
  salesRecords,
  purchaseRecords,
}: SupplierTopItemsProps) {
  // 품목별 거래 횟수 집계
  const topItems = useMemo(() => {
    const itemMap = new Map<string, ItemStats>();

    // 판매 데이터 집계
    salesRecords.forEach((record) => {
      record.orderItems.forEach((orderItem) => {
        const itemCode = orderItem.item.teamItem.itemCode;
        const itemName = orderItem.item.teamItem.itemName;

        if (!itemMap.has(itemCode)) {
          itemMap.set(itemCode, {
            itemCode,
            itemName,
            salesCount: 0,
            purchaseCount: 0,
            totalCount: 0,
          });
        }

        const stats = itemMap.get(itemCode)!;
        stats.salesCount += orderItem.quantity;
        stats.totalCount += orderItem.quantity;
      });
    });

    // 구매 데이터 집계
    purchaseRecords.forEach((record) => {
      const itemCode = record.itemCode;
      const itemName = record.itemName;

      if (!itemMap.has(itemCode)) {
        itemMap.set(itemCode, {
          itemCode,
          itemName,
          salesCount: 0,
          purchaseCount: 0,
          totalCount: 0,
        });
      }

      const stats = itemMap.get(itemCode)!;
      stats.purchaseCount += record.quantity;
      stats.totalCount += record.quantity;
    });

    // 거래량 순으로 정렬하여 TOP 10 추출
    return Array.from(itemMap.values())
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 10);
  }, [salesRecords, purchaseRecords]);

  if (topItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-Text-High-90" />
          <h3 className="text-base font-medium text-Text-Highest-100">
            품목별 거래 분석 TOP 10
          </h3>
        </div>
        <div className="flex items-center justify-center py-12 text-center">
          <p className="text-sm text-Text-Low-70">조회 기간 내 거래 품목이 없습니다</p>
        </div>
      </div>
    );
  }

  // 최대 거래량 (프로그레스 바 스케일링용)
  const maxCount = topItems[0]?.totalCount || 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-Text-High-90" />
        <h3 className="text-base font-medium text-Text-Highest-100">
          품목별 거래 분석 TOP 10
        </h3>
      </div>

      {/* 품목 리스트 */}
      <div className="space-y-4">
        {topItems.map((item, index) => {
          const percentage = (item.totalCount / maxCount) * 100;

          return (
            <div key={item.itemCode} className="space-y-2">
              {/* 순위 + 품목 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-100 text-gray-700"
                        : index === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-Back-Mid-20 text-Text-High-90"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-Text-Highest-100 truncate">
                      {item.itemName}
                    </p>
                    <p className="text-xs text-Text-Low-70">{item.itemCode}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold text-Text-Highest-100">
                    {item.totalCount}개
                  </p>
                  <p className="text-xs text-Text-Low-70">
                    판매 {item.salesCount} · 구매 {item.purchaseCount}
                  </p>
                </div>
              </div>

              {/* 프로그레스 바 */}
              <div className="h-2 bg-Back-Mid-20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
