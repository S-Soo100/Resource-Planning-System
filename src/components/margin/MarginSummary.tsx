'use client';

import { MarginSummary as MarginSummaryType } from '@/types/margin-analysis';

interface MarginSummaryProps {
  summary: MarginSummaryType;
}

export const MarginSummary = ({ summary }: MarginSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 총 품목 수 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">총 품목 수</div>
        <div className="text-2xl font-bold text-gray-900">
          {summary.totalItems.toLocaleString()}개
        </div>
      </div>

      {/* 평균 마진율 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">평균 마진율</div>
        <div className="text-2xl font-bold text-green-600">
          {summary.averageMarginRate.toFixed(1)}%
        </div>
      </div>

      {/* 총 마진액 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">총 마진액</div>
        <div className="text-2xl font-bold text-green-600">
          ₩{summary.totalMarginAmount.toLocaleString()}
        </div>
      </div>

      {/* 역마진 건수 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">역마진 건수</div>
        <div className="text-2xl font-bold text-red-600">
          {summary.negativeMarginCount.toLocaleString()}건
        </div>
        {(summary.missingCostCount > 0 || summary.missingSalesCount > 0) && (
          <div className="text-xs text-gray-500 mt-2 space-y-0.5">
            {summary.missingCostCount > 0 && (
              <div>원가 미입력: {summary.missingCostCount}건</div>
            )}
            {summary.missingSalesCount > 0 && (
              <div>판매가 미입력: {summary.missingSalesCount}건</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
