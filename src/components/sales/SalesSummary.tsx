'use client';

import { SalesSummary as SalesSummaryType } from '@/types/sales';

interface SalesSummaryProps {
  summary: SalesSummaryType;
}

export const SalesSummary = ({ summary }: SalesSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 총 발주 건수 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">총 발주 건수</div>
        <div className="text-2xl font-bold text-gray-900">
          {summary.totalOrders.toLocaleString()}건
        </div>
      </div>

      {/* 총 품목 수 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">총 품목 수</div>
        <div className="text-2xl font-bold text-gray-900">
          {summary.totalItems.toLocaleString()}개
        </div>
      </div>

      {/* 총 판매 수량 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">총 판매 수량</div>
        <div className="text-2xl font-bold text-gray-900">
          {summary.totalQuantity.toLocaleString()}개
        </div>
      </div>

      {/* 총 판매 금액 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">총 판매 금액</div>
        <div className="text-2xl font-bold text-blue-600">
          ₩{summary.totalSales.toLocaleString()}
        </div>
        {summary.missingPriceCount > 0 && (
          <div className="text-xs text-red-500 mt-1">
            판매가 미입력: {summary.missingPriceCount}건
          </div>
        )}
      </div>
    </div>
  );
};
