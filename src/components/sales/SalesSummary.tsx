'use client';

import { SalesSummary as SalesSummaryType } from '@/types/sales';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface SalesSummaryProps {
  summary: SalesSummaryType;
}

export const SalesSummary = ({ summary }: SalesSummaryProps) => {
  const { user } = useCurrentUser();

  // 권한별 마진 카드 표시 여부
  const showMarginCards =
    user?.accessLevel === 'admin' || user?.accessLevel === 'moderator';

  // 마진 정보가 있는지 확인
  const hasMarginData =
    summary.totalCost !== undefined && summary.totalMargin !== undefined;

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

      {/* 마진 분석 카드 (Admin/Moderator만) */}
      {showMarginCards && hasMarginData && (
        <>
          {/* 총 원가 */}
          <div className="bg-white rounded-lg border border-orange-200 p-4">
            <div className="text-sm text-gray-500 mb-1">총 원가</div>
            <div className="text-2xl font-bold text-orange-600">
              ₩{(summary.totalCost || 0).toLocaleString()}
            </div>
            {summary.missingCostCount !== undefined &&
              summary.missingCostCount > 0 && (
                <div className="text-xs text-red-500 mt-1">
                  원가 미입력: {summary.missingCostCount}건
                </div>
              )}
          </div>

          {/* 총 마진액 */}
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <div className="text-sm text-gray-500 mb-1">총 마진액</div>
            <div
              className={`text-2xl font-bold ${
                (summary.totalMargin || 0) >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              ₩{(summary.totalMargin || 0).toLocaleString()}
            </div>
          </div>

          {/* 평균 마진율 */}
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <div className="text-sm text-gray-500 mb-1">평균 마진율</div>
            <div
              className={`text-2xl font-bold ${
                (summary.averageMarginRate || 0) >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {(summary.averageMarginRate || 0).toFixed(1)}%
            </div>
            {summary.negativeMarginCount !== undefined &&
              summary.negativeMarginCount > 0 && (
                <div className="text-xs text-red-500 mt-1">
                  역마진: {summary.negativeMarginCount}건
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
};
