"use client";

import React from "react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { BulkUploadResult } from "@/types/(item)/bulk-upload";

interface ProgressStepProps {
  /** 등록 진행 중 상태 */
  isRegistering: boolean;
  /** 현재 진행 건수 */
  current: number;
  /** 전체 등록 대상 건수 */
  total: number;
  /** 등록 결과 (완료 후) */
  result: BulkUploadResult | null;
  /** 등록 중단 핸들러 */
  onAbort: () => void;
  /** 품목 관리 페이지로 이동 */
  onGoToTeamItems: () => void;
}

const ProgressStep: React.FC<ProgressStepProps> = ({
  isRegistering,
  current,
  total,
  result,
  onAbort,
  onGoToTeamItems,
}) => {
  const progressPercent = total > 0 ? Math.round((current / total) * 100) : 0;

  // 등록 진행 중
  if (isRegistering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-full max-w-md">
          {/* 프로그레스 텍스트 */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {current}/{total} 등록 중...
            </span>
            <span className="text-sm font-bold text-blue-600">
              {progressPercent}%
            </span>
          </div>

          {/* 프로그레스바 */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Button variant="outline" onClick={onAbort}>
          등록 중단
        </Button>
      </div>
    );
  }

  // 완료 결과
  if (!result) return null;

  const hasFailures = result.failed > 0;
  const failedRows = result.details.filter((r) => r.status === "failed");

  return (
    <div className="flex flex-col items-center gap-6 min-h-[400px] py-8">
      {/* 결과 카드 */}
      <div className="w-full max-w-md p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-center text-gray-800 mb-4">
          등록 완료
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <ResultCard
            label="성공"
            count={result.success}
            icon={<CheckCircle className="w-6 h-6 text-green-500" />}
            bgColor="bg-green-50"
          />
          <ResultCard
            label="실패"
            count={result.failed}
            icon={<XCircle className="w-6 h-6 text-red-500" />}
            bgColor="bg-red-50"
          />
          <ResultCard
            label="스킵"
            count={result.skipped}
            icon={
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xs text-white font-bold">-</span>
              </div>
            }
            bgColor="bg-gray-50"
          />
        </div>
      </div>

      {/* 실패 건 사유 테이블 */}
      {hasFailures && (
        <div className="w-full max-w-2xl bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-red-200">
            <h4 className="text-sm font-semibold text-red-700">
              실패 건 상세 ({result.failed}건)
            </h4>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left font-semibold text-gray-600 w-16">
                  행
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">
                  품목명
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">
                  사유
                </th>
              </tr>
            </thead>
            <tbody>
              {failedRows.map((row) => (
                <tr
                  key={row.index}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-3 py-2 text-gray-500">{row.index}</td>
                  <td className="px-3 py-2 text-gray-700">
                    {row.mapped.itemName || "-"}
                  </td>
                  <td className="px-3 py-2 text-red-600">
                    {row.error || "알 수 없는 오류"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 이동 버튼 */}
      <Button
        variant="primary"
        onClick={onGoToTeamItems}
        icon={<ArrowLeft className="w-4 h-4" />}
        iconPosition="left"
      >
        품목 관리로 돌아가기
      </Button>
    </div>
  );
};

const ResultCard: React.FC<{
  label: string;
  count: number;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ label, count, icon, bgColor }) => (
  <div className={`flex flex-col items-center p-4 rounded-xl ${bgColor}`}>
    {icon}
    <span className="mt-2 text-2xl font-bold text-gray-800">{count}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

export default ProgressStep;
