"use client";

import React, { useMemo } from "react";
import { SalesRecord } from "@/types/sales";
import { PurchaseRecord } from "@/types/purchase";
import { TeamItem } from "@/types/(item)/team-item";
import { format, startOfMonth, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";

interface SupplierTrendChartProps {
  salesRecords: SalesRecord[];
  purchaseRecords: PurchaseRecord[];
  teamItemsMap?: Map<number, TeamItem>;
}

interface MonthlyData {
  month: string; // YYYY-MM
  salesAmount: number;
  purchaseAmount: number;
}

export function SupplierTrendChart({
  salesRecords,
  purchaseRecords,
  teamItemsMap,
}: SupplierTrendChartProps) {
  // 월별 데이터 집계
  const monthlyData = useMemo(() => {
    const dataMap = new Map<string, MonthlyData>();

    // 판매 데이터 집계
    salesRecords.forEach((record) => {
      if (!record.purchaseDate) return;
      const month = format(startOfMonth(parseISO(record.purchaseDate)), "yyyy-MM");

      if (!dataMap.has(month)) {
        dataMap.set(month, { month, salesAmount: 0, purchaseAmount: 0 });
      }

      const data = dataMap.get(month)!;
      data.salesAmount += record.totalPrice || 0;
    });

    // 구매 데이터 집계
    purchaseRecords.forEach((record) => {
      if (!record.inboundDate) return;
      const month = format(startOfMonth(parseISO(record.inboundDate)), "yyyy-MM");

      if (!dataMap.has(month)) {
        dataMap.set(month, { month, salesAmount: 0, purchaseAmount: 0 });
      }

      const data = dataMap.get(month)!;

      // 실시간 원가 계산
      const teamItemId = record.originalRecord.item?.teamItem?.id;
      if (teamItemId && teamItemsMap) {
        const teamItem = teamItemsMap.get(teamItemId);
        const costPrice = teamItem?.costPrice;
        if (costPrice !== null && costPrice !== undefined) {
          data.purchaseAmount += record.quantity * costPrice;
        }
      }
    });

    // 월 정렬 (오래된 순)
    return Array.from(dataMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [salesRecords, purchaseRecords, teamItemsMap]);

  // 최대값 계산 (차트 스케일링용)
  const maxAmount = useMemo(() => {
    return Math.max(
      ...monthlyData.map((d) => Math.max(d.salesAmount, d.purchaseAmount)),
      0
    );
  }, [monthlyData]);

  if (monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-Text-High-90" />
          <h3 className="text-base font-medium text-Text-Highest-100">월별 거래 트렌드</h3>
        </div>
        <div className="flex items-center justify-center py-12 text-center">
          <p className="text-sm text-Text-Low-70">조회 기간 내 거래 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-Text-High-90" />
        <h3 className="text-base font-medium text-Text-Highest-100">월별 거래 트렌드</h3>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-sm text-Text-High-90">판매 금액</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <span className="text-sm text-Text-High-90">구매 금액</span>
        </div>
      </div>

      {/* 차트 (간단한 바 차트) */}
      <div className="space-y-4">
        {monthlyData.map((data) => {
          const salesHeight = maxAmount > 0 ? (data.salesAmount / maxAmount) * 100 : 0;
          const purchaseHeight = maxAmount > 0 ? (data.purchaseAmount / maxAmount) * 100 : 0;

          return (
            <div key={data.month} className="space-y-2">
              {/* 월 */}
              <div className="text-xs text-Text-Low-70 font-medium">
                {data.month}
              </div>

              {/* 바 차트 */}
              <div className="grid grid-cols-2 gap-2">
                {/* 판매 바 */}
                <div>
                  <div className="h-12 bg-Back-Mid-20 rounded-lg overflow-hidden relative">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-blue-600 transition-all duration-300 rounded-t-lg"
                      style={{ height: `${salesHeight}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-1 text-center">
                    ₩{data.salesAmount.toLocaleString()}
                  </div>
                </div>

                {/* 구매 바 */}
                <div>
                  <div className="h-12 bg-Back-Mid-20 rounded-lg overflow-hidden relative">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-green-600 transition-all duration-300 rounded-t-lg"
                      style={{ height: `${purchaseHeight}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-green-600 font-medium mt-1 text-center">
                    ₩{data.purchaseAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
