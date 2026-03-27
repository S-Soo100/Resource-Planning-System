"use client";

import React, { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  SkipForward,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { CategoryTreeSelect } from "@/components/ui/CategoryTreeSelect";
import { BulkUploadRow, RowStatus } from "@/types/(item)/bulk-upload";
import { categoryApi } from "@/api/category-api";

interface PreviewStepProps {
  rows: BulkUploadRow[];
  teamId: number;
  onRowUpdate: (index: number, updates: Partial<BulkUploadRow>) => void;
  onRowDelete: (index: number) => void;
  onBack: () => void;
  onStartRegistration: () => void;
}

const STATUS_CONFIG: Record<
  RowStatus,
  { icon: React.ReactNode; label: string; color: string }
> = {
  ready: {
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    label: "준비",
    color: "text-green-600",
  },
  category_unmatched: {
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    label: "카테고리 미매칭",
    color: "text-amber-600",
  },
  duplicate: {
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    label: "중복",
    color: "text-amber-600",
  },
  invalid: {
    icon: <XCircle className="w-4 h-4 text-red-500" />,
    label: "필수값 누락",
    color: "text-red-600",
  },
  skipped: {
    icon: <SkipForward className="w-4 h-4 text-gray-400" />,
    label: "스킵",
    color: "text-gray-500",
  },
  success: {
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    label: "성공",
    color: "text-green-600",
  },
  failed: {
    icon: <XCircle className="w-4 h-4 text-red-500" />,
    label: "실패",
    color: "text-red-600",
  },
};

const PreviewStep: React.FC<PreviewStepProps> = ({
  rows,
  teamId,
  onRowUpdate,
  onRowDelete,
  onBack,
  onStartRegistration,
}) => {
  const queryClient = useQueryClient();

  const handleCreateCategory = useCallback(
    async (name: string, parentId?: number): Promise<number | undefined> => {
      try {
        const response = await categoryApi.createCategory({
          name,
          parentId,
          priority: 0,
          teamId,
        });
        if (!response.success || !response.data) {
          return undefined;
        }
        await queryClient.invalidateQueries({
          queryKey: ["categoryTree", teamId],
        });
        return response.data.id;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "카테고리 생성에 실패했습니다";
        toast.error(message);
        return undefined;
      }
    },
    [teamId, queryClient]
  );

  const summary = useMemo(() => {
    const total = rows.length;
    const ready = rows.filter((r) => r.status === "ready").length;
    const unmatched = rows.filter(
      (r) => r.status === "category_unmatched"
    ).length;
    const duplicate = rows.filter((r) => r.status === "duplicate").length;
    const invalid = rows.filter((r) => r.status === "invalid").length;
    const skipped = rows.filter(
      (r) => r.userAction === "skip" || r.status === "skipped"
    ).length;

    return { total, ready, unmatched, duplicate, invalid, skipped };
  }, [rows]);

  // 등록 가능 건수: ready + (duplicate 중 register 선택) + (카테고리 미매칭이었으나 해결된 것)
  const registrableCount = useMemo(() => {
    return rows.filter((r) => {
      if (r.status === "invalid") return false;
      if (r.userAction === "skip" || r.status === "skipped") return false;
      if (r.status === "category_unmatched") return false;
      return true;
    }).length;
  }, [rows]);

  const handleCategoryChange = (
    rowIndex: number,
    categoryId: number | undefined
  ) => {
    const row = rows.find((r) => r.index === rowIndex);
    if (!row) return;

    const newStatus: RowStatus =
      categoryId !== undefined
        ? row.isDuplicate
          ? "duplicate"
          : "ready"
        : "category_unmatched";

    onRowUpdate(rowIndex, {
      status: newStatus,
      mapped: {
        ...row.mapped,
        categoryId: categoryId ?? null,
      },
      categoryMatch: {
        ...row.categoryMatch,
        matchedCategoryId: categoryId ?? null,
      },
    });
  };

  const handleDuplicateAction = (
    rowIndex: number,
    action: "register" | "skip"
  ) => {
    const row = rows.find((r) => r.index === rowIndex);
    if (!row) return;

    onRowUpdate(rowIndex, {
      userAction: action,
      status: action === "skip" ? "skipped" : "ready",
    });
  };

  const handleCostPriceChange = (rowIndex: number, value: string) => {
    const row = rows.find((r) => r.index === rowIndex);
    if (!row) return;

    const numVal = value.replace(/[^\d]/g, "");
    const costPrice = numVal ? parseInt(numVal, 10) : undefined;

    onRowUpdate(rowIndex, {
      mapped: {
        ...row.mapped,
        costPrice: isNaN(costPrice as number) ? undefined : costPrice,
      },
    });
  };

  const formatPrice = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "";
    return value.toLocaleString();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 상단 요약 */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <SummaryBadge
          label="총"
          count={summary.total}
          color="bg-gray-100 text-gray-700"
        />
        <SummaryBadge
          label="등록 준비"
          count={summary.ready}
          color="bg-green-100 text-green-700"
        />
        <SummaryBadge
          label="카테고리 미매칭"
          count={summary.unmatched}
          color="bg-amber-100 text-amber-700"
        />
        <SummaryBadge
          label="중복"
          count={summary.duplicate}
          color="bg-amber-100 text-amber-700"
        />
        <SummaryBadge
          label="필수값 누락"
          count={summary.invalid}
          color="bg-red-100 text-red-700"
        />
        <SummaryBadge
          label="스킵"
          count={summary.skipped}
          color="bg-gray-100 text-gray-500"
        />
      </div>

      {/* 프리뷰 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-24">
                상태
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 min-w-[150px]">
                품목명
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-24">
                브랜드
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-28">
                자동코드
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 min-w-[180px]">
                카테고리
              </th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-600 w-16">
                건보
              </th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 w-24">
                고시가격
              </th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 w-24">
                소비자가
              </th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 min-w-[120px]">
                매입원가
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 min-w-[100px]">
                메모
              </th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-600 w-14">
                삭제
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const statusConfig = STATUS_CONFIG[row.status];
              const isSkipped =
                row.userAction === "skip" || row.status === "skipped";
              const showDuplicateAction =
                row.isDuplicate && row.status !== "invalid";

              return (
                <React.Fragment key={row.index}>
                  <tr
                    className={`border-b border-gray-100 ${
                      isSkipped ? "opacity-40" : ""
                    } ${row.status === "invalid" ? "bg-red-50/50" : ""}`}
                  >
                    {/* 상태 */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {statusConfig.icon}
                        <span className={`text-xs ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </td>

                    {/* 품목명 */}
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {row.mapped.itemName || (
                        <span className="text-red-400">품목명 없음</span>
                      )}
                    </td>

                    {/* 브랜드 */}
                    <td className="px-3 py-2 text-gray-600">
                      {row.mapped.brand || "-"}
                    </td>

                    {/* 자동코드 */}
                    <td className="px-3 py-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                        {row.generatedItemCode}
                      </code>
                    </td>

                    {/* 카테고리 */}
                    <td className="px-3 py-2">
                      {row.status === "category_unmatched" ||
                      (!row.categoryMatch.matchedCategoryId &&
                        row.status !== "invalid") ? (
                        <div className="flex flex-col gap-1">
                          {row.categoryMatch.excelValue && (
                            <span className="text-xs text-amber-600">
                              &quot;{row.categoryMatch.excelValue}&quot; 미매칭
                            </span>
                          )}
                          <CategoryTreeSelect
                            mode="assign"
                            value={
                              row.categoryMatch.matchedCategoryId ?? undefined
                            }
                            onChange={(val) =>
                              handleCategoryChange(row.index, val)
                            }
                            teamId={teamId}
                            placeholder="카테고리 선택"
                            className="w-full"
                            onCreateCategory={handleCreateCategory}
                          />
                        </div>
                      ) : (
                        <span className="text-gray-700">
                          {row.categoryMatch.matchedCategoryName || "-"}
                        </span>
                      )}
                    </td>

                    {/* 건보 */}
                    <td className="px-3 py-2 text-center">
                      {row.mapped.isHealthInsuranceRegistered ? (
                        <span className="text-blue-600 font-medium">O</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* 고시가격 */}
                    <td className="px-3 py-2 text-right text-gray-700">
                      {formatPrice(row.mapped.notifiedPrice) || "-"}
                    </td>

                    {/* 소비자가 */}
                    <td className="px-3 py-2 text-right text-gray-700">
                      {formatPrice(row.mapped.consumerPrice) || "-"}
                    </td>

                    {/* 매입원가 */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={formatPrice(row.mapped.costPrice)}
                        onChange={(e) =>
                          handleCostPriceChange(row.index, e.target.value)
                        }
                        placeholder="원가 입력"
                        className="w-full px-2 py-1 text-right text-sm border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        disabled={isSkipped}
                      />
                    </td>

                    {/* 메모 */}
                    <td className="px-3 py-2 text-gray-600 text-xs truncate max-w-[150px]">
                      {row.mapped.memo || "-"}
                    </td>

                    {/* 삭제 */}
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => onRowDelete(row.index)}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="이 행 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* 중복 row 액션 - 해당 row 바로 아래 표시 */}
                  {showDuplicateAction && (
                    <tr className="bg-amber-50/50 border-b border-gray-100">
                      <td colSpan={11} className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span className="text-sm text-amber-700">
                            기존 품목과 이름이 중복됩니다.
                          </span>
                          <div className="flex gap-2 ml-auto">
                            <button
                              onClick={() =>
                                handleDuplicateAction(row.index, "register")
                              }
                              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                row.userAction === "register"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              등록
                            </button>
                            <button
                              onClick={() =>
                                handleDuplicateAction(row.index, "skip")
                              }
                              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                row.userAction === "skip"
                                  ? "bg-gray-600 text-white"
                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              스킵
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <Button variant="outline" onClick={onBack}>
          이전
        </Button>
        <Button
          variant="primary"
          onClick={onStartRegistration}
          disabled={registrableCount === 0}
        >
          등록 시작 ({registrableCount}건)
        </Button>
      </div>
    </div>
  );
};

// 요약 배지 컴포넌트
const SummaryBadge: React.FC<{
  label: string;
  count: number;
  color: string;
}> = ({ label, count, color }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
    <span className="text-sm font-medium">{label}</span>
    <span className="text-sm font-bold">{count}건</span>
  </div>
);

export default PreviewStep;
