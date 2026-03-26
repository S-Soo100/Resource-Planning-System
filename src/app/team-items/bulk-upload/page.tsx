"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";

import { usePermission } from "@/hooks/usePermission";
import { useTeamItems } from "@/hooks/useTeamItems";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useCategoryTree } from "@/hooks/useCategoryTree";
import { teamItemsApi } from "@/api/team-items-api";

import { Button } from "@/components/ui";
import ExcelUploadStep from "@/components/admin/bulk-upload/ExcelUploadStep";
import PreviewStep from "@/components/admin/bulk-upload/PreviewStep";
import ProgressStep from "@/components/admin/bulk-upload/ProgressStep";

import { parseExcelFile, mapExcelDataToRows } from "@/utils/excel-parser";
import { BulkUploadRow, BulkUploadResult } from "@/types/(item)/bulk-upload";
import { CreateTeamItemDto } from "@/types/(item)/team-item";

type Step = "upload" | "preview" | "progress";

const STEP_LABELS: Record<Step, string> = {
  upload: "파일 업로드",
  preview: "프리뷰 & 편집",
  progress: "등록 & 결과",
};

export default function BulkUploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { team } = useCurrentTeam();
  const { isAdminOrModerator, isLoading: isPermissionLoading } =
    usePermission();
  const { useGetTeamItems } = useTeamItems();
  const { teamItems = [], isLoading: isTeamItemsLoading } = useGetTeamItems();

  const teamId = team?.id ?? 0;
  const { data: categoryTree = [] } = useCategoryTree(teamId || undefined);

  // Step 관리
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [rows, setRows] = useState<BulkUploadRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 등록 진행 상태
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerCurrent, setRegisterCurrent] = useState(0);
  const [registerTotal, setRegisterTotal] = useState(0);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const abortRef = useRef(false);

  // Step 2: row 업데이트 핸들러
  const handleRowUpdate = useCallback(
    (index: number, updates: Partial<BulkUploadRow>) => {
      setRows((prev) =>
        prev.map((row) => (row.index === index ? { ...row, ...updates } : row))
      );
    },
    []
  );

  // Step 2: 행 삭제 핸들러
  const handleRowDelete = useCallback((index: number) => {
    setRows((prev) => prev.filter((row) => row.index !== index));
  }, []);

  // Step 2 → Step 1 되돌아가기
  const handleBackToUpload = useCallback(() => {
    setRows([]);
    setCurrentStep("upload");
  }, []);

  // 등록 중단
  const handleAbort = useCallback(() => {
    abortRef.current = true;
  }, []);

  // 품목 관리로 이동
  const handleGoToTeamItems = useCallback(() => {
    router.push("/team-items");
  }, [router]);

  // 권한 가드
  if (!isPermissionLoading && !isAdminOrModerator) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            접근 권한이 없습니다
          </h2>
          <p className="mb-6 text-gray-600">
            관리자 또는 1차 승인권자만 이용할 수 있습니다.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/team-items")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            품목 관리로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (!team || !teamId) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            팀을 선택해주세요
          </h2>
          <Button
            variant="primary"
            onClick={() => router.push("/team-select")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            팀 선택 페이지로
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: 파일 선택 핸들러
  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);
    try {
      const rawData = await parseExcelFile(file);
      const mappedRows = mapExcelDataToRows(rawData, categoryTree, teamItems);
      setRows(mappedRows);
      setCurrentStep("preview");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "파일 처리 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2 → Step 3: 등록 시작
  const handleStartRegistration = async () => {
    // 등록 대상 필터링
    const registrableRows = rows.filter((r) => {
      if (r.status === "invalid") return false;
      if (r.userAction === "skip" || r.status === "skipped") return false;
      if (r.status === "category_unmatched") return false;
      return true;
    });

    if (registrableRows.length === 0) {
      toast.error("등록할 수 있는 항목이 없습니다.");
      return;
    }

    setCurrentStep("progress");
    setIsRegistering(true);
    setRegisterTotal(registrableRows.length);
    setRegisterCurrent(0);
    abortRef.current = false;

    let successCount = 0;
    let failedCount = 0;
    const skippedCount = rows.filter(
      (r) => r.userAction === "skip" || r.status === "skipped"
    ).length;

    const updatedRows = [...rows];

    for (let i = 0; i < registrableRows.length; i++) {
      if (abortRef.current) break;

      const row = registrableRows[i];
      const rowIdx = updatedRows.findIndex((r) => r.index === row.index);

      try {
        // DTO 구성
        const dto: CreateTeamItemDto = {
          itemCode: row.generatedItemCode,
          itemName: row.mapped.itemName || "",
          teamId,
          categoryId: row.mapped.categoryId ?? null,
          brand: row.mapped.brand,
          memo: row.mapped.memo,
          costPrice: row.mapped.costPrice,
          isNotifiedPrice: row.mapped.isNotifiedPrice,
          notifiedPrice: row.mapped.notifiedPrice,
          consumerPrice: row.mapped.consumerPrice,
          isHealthInsuranceRegistered: row.mapped.isHealthInsuranceRegistered,
          isService: false,
        };

        const response = await teamItemsApi.createTeamItem(dto);

        if (response.success) {
          successCount++;
          if (rowIdx >= 0) {
            updatedRows[rowIdx] = { ...updatedRows[rowIdx], status: "success" };
          }
        } else {
          failedCount++;
          if (rowIdx >= 0) {
            updatedRows[rowIdx] = {
              ...updatedRows[rowIdx],
              status: "failed",
              error: response.error || "생성 실패",
            };
          }
        }
      } catch (err) {
        failedCount++;
        const errorMessage =
          err instanceof Error ? err.message : "알 수 없는 오류";
        if (rowIdx >= 0) {
          updatedRows[rowIdx] = {
            ...updatedRows[rowIdx],
            status: "failed",
            error: errorMessage,
          };
        }
      }

      setRegisterCurrent(i + 1);
    }

    setRows(updatedRows);
    setIsRegistering(false);

    const finalResult: BulkUploadResult = {
      total: rows.length,
      success: successCount,
      failed: failedCount,
      skipped:
        skippedCount + (rows.length - registrableRows.length - skippedCount),
      details: updatedRows,
    };
    setResult(finalResult);

    // 캐시 무효화 (등록 완료 후 1회)
    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["teamItems", teamId] });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/team-items")}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              엑셀 품목 일괄 등록
            </h1>
          </div>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-6">
          {(["upload", "preview", "progress"] as Step[]).map((step, i) => {
            const stepNumber = i + 1;
            const isActive = currentStep === step;
            const isPast =
              (step === "upload" && currentStep !== "upload") ||
              (step === "preview" && currentStep === "progress");

            return (
              <React.Fragment key={step}>
                {i > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      isPast ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isPast
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span
                    className={`text-sm hidden sm:inline ${
                      isActive ? "font-semibold text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {STEP_LABELS[step]}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* 로딩 상태 */}
        {(isPermissionLoading || isTeamItemsLoading) && (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Step 렌더링 */}
        {!isPermissionLoading && !isTeamItemsLoading && (
          <>
            {currentStep === "upload" && (
              <ExcelUploadStep
                onFileSelected={handleFileSelected}
                isProcessing={isProcessing}
              />
            )}

            {currentStep === "preview" && (
              <PreviewStep
                rows={rows}
                teamId={teamId}
                onRowUpdate={handleRowUpdate}
                onRowDelete={handleRowDelete}
                onBack={handleBackToUpload}
                onStartRegistration={handleStartRegistration}
              />
            )}

            {currentStep === "progress" && (
              <ProgressStep
                isRegistering={isRegistering}
                current={registerCurrent}
                total={registerTotal}
                result={result}
                onAbort={handleAbort}
                onGoToTeamItems={handleGoToTeamItems}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
