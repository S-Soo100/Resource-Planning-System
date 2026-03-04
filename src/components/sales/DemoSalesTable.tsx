"use client";

import { useRouter } from "next/navigation";
import { SalesRecord, SalesSummary as SalesSummaryType } from "@/types/sales";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface DemoSalesTableProps {
  records: SalesRecord[];
  summary: SalesSummaryType;
  showMarginColumns: boolean;
  isMobile: boolean;
}

/**
 * 시연 상태 한글 매핑
 */
const getDemoStatusLabel = (status: string) => {
  switch (status) {
    case "confirmedByShipper":
      return "출고자확인";
    case "shipmentCompleted":
      return "출고완료";
    case "demoCompleted":
      return "시연종료";
    default:
      return status;
  }
};

/**
 * 시연 상태별 색상
 */
const getDemoStatusColor = (status: string) => {
  switch (status) {
    case "confirmedByShipper":
      return "bg-yellow-100 text-yellow-700";
    case "shipmentCompleted":
      return "bg-blue-100 text-blue-700";
    case "demoCompleted":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const DemoSalesTable = ({
  records,
  summary,
  showMarginColumns,
  isMobile,
}: DemoSalesTableProps) => {
  const router = useRouter();

  const handleTitleClick = (demoId: number) => {
    router.push(`/demoRecord/${demoId}`);
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        조회된 유료 시연 데이터가 없습니다.
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="divide-y divide-gray-100">
        {records.map((record) => (
          <div
            key={record.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            {/* 헤더: 제목 & 상태 */}
            <div className="flex items-start justify-between mb-3">
              <div
                className="flex-1 mr-3 cursor-pointer"
                onClick={() => handleTitleClick(record.demoId || record.id)}
              >
                <h3 className="text-sm font-semibold text-purple-600 hover:text-purple-700 mb-1">
                  {record.title || "시연명 없음"}
                </h3>
                <p className="text-xs text-gray-500">
                  담당자: {record.supplierName || "-"}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getDemoStatusColor(
                  record.status
                )}`}
              >
                {getDemoStatusLabel(record.status)}
              </span>
            </div>

            {/* 금액 */}
            <div className="mb-3 space-y-2">
              <div className="p-2 bg-purple-50 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">시연가격</span>
                  <span className="text-base font-bold text-purple-600">
                    {record.totalPrice !== null ? (
                      `₩${record.totalPrice.toLocaleString()}`
                    ) : (
                      <span className="text-gray-400">미입력</span>
                    )}
                  </span>
                </div>
              </div>

              {showMarginColumns && (
                <>
                  <div className="p-2 bg-orange-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">원가</span>
                      <span className="text-sm font-bold text-orange-600">
                        ₩0
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-50 rounded-md">
                      <div className="text-xs text-gray-600 mb-1">마진액</div>
                      <div className="text-sm font-bold text-green-600">
                        {record.totalPrice !== null
                          ? `₩${record.totalPrice.toLocaleString()}`
                          : "-"}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <div className="text-xs text-gray-600 mb-1">마진율</div>
                      <div className="text-sm font-bold text-green-600">
                        {record.totalPrice !== null && record.totalPrice > 0
                          ? "100.0%"
                          : "-"}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 상세 정보 */}
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-500">시연일자</span>
                <span>{formatDateForDisplay(record.purchaseDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">사내 담당자</span>
                <span className="font-medium">{record.manager || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">품목 수</span>
                <span className="font-medium">
                  {record.itemCount}종 {record.totalQuantity}개
                </span>
              </div>
              {record.memo && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <span className="text-gray-500">비고:</span>
                  <p className="text-gray-600 whitespace-pre-line mt-1">
                    {record.memo}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 합계 카드 */}
        <div className="p-4 bg-purple-50 border-t-2 border-purple-200">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">합계</span>
              <span className="text-sm font-bold text-purple-600">
                ₩{summary.totalSales.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>품목 수</span>
              <span className="font-medium">
                {summary.totalItems}종 {summary.totalQuantity}개
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 데스크톱 테이블
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
              시연일자
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
              시연 담당자
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
              시연명
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
              사내 담당자
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
              품목 수
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 w-32">
              시연가격
            </th>
            {showMarginColumns && (
              <>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 w-32">
                  원가
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 w-32">
                  마진액
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 w-24">
                  마진율
                </th>
              </>
            )}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-24">
              상태
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatDateForDisplay(record.purchaseDate)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {record.supplierName || "-"}
              </td>
              <td
                className="px-4 py-3 text-sm cursor-pointer hover:bg-purple-50 transition-colors"
                onClick={() => handleTitleClick(record.demoId || record.id)}
              >
                <span className="font-medium text-purple-600 hover:text-purple-700">
                  {record.title || "시연명 없음"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-900">
                {record.manager || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-900">
                {record.itemCount}종 {record.totalQuantity}개
              </td>
              <td className="px-4 py-3 text-sm text-right">
                {record.totalPrice !== null ? (
                  <div className="bg-purple-50 px-3 py-1.5 rounded-md inline-block">
                    <span className="font-bold text-purple-600">
                      ₩{record.totalPrice.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">미입력</span>
                )}
              </td>
              {showMarginColumns && (
                <>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="bg-orange-50 px-3 py-1.5 rounded-md inline-block">
                      <span className="font-bold text-orange-600">₩0</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                    {record.totalPrice !== null
                      ? `₩${record.totalPrice.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                    {record.totalPrice !== null && record.totalPrice > 0
                      ? "100.0%"
                      : "-"}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getDemoStatusColor(
                    record.status
                  )}`}
                >
                  {getDemoStatusLabel(record.status)}
                </span>
              </td>
            </tr>
          ))}

          {/* 합계 행 */}
          <tr className="bg-purple-50 border-t-2 border-purple-200">
            <td
              colSpan={4}
              className="px-4 py-3 text-sm font-bold text-right text-gray-900"
            >
              합계
            </td>
            <td className="px-4 py-3 text-sm font-bold text-center text-gray-900">
              {summary.totalItems}종 {summary.totalQuantity}개
            </td>
            <td className="px-4 py-3 text-sm font-bold text-right text-purple-600">
              ₩{summary.totalSales.toLocaleString()}
            </td>
            {showMarginColumns && (
              <>
                <td className="px-4 py-3 text-sm font-bold text-right text-orange-600">
                  ₩0
                </td>
                <td className="px-4 py-3 text-sm font-bold text-right text-green-600">
                  ₩{summary.totalSales.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-right text-green-600">
                  {summary.totalSales > 0 ? "100.0%" : "-"}
                </td>
              </>
            )}
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
