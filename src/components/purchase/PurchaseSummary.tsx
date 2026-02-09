'use client';

import { PurchaseSummary as PurchaseSummaryType } from '@/types/purchase';

interface PurchaseSummaryProps {
  summary: PurchaseSummaryType;
}

export const PurchaseSummary = ({ summary }: PurchaseSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 총 입고 건수 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">총 입고 건수</div>
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

      {/* 총 입고 수량 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">총 입고 수량</div>
        <div className="text-2xl font-bold text-gray-900">
          {summary.totalQuantity.toLocaleString()}개
        </div>
      </div>

      {/* 총 구매 금액 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">총 구매 금액</div>
        <div className="text-2xl font-bold text-blue-600">
          ₩{summary.totalAmount.toLocaleString()}
        </div>
        {summary.missingCostCount > 0 && (
          <div className="text-xs text-red-500 mt-1">
            원가 미입력: {summary.missingCostCount}건
          </div>
        )}
      </div>
    </div>
  );
};
