"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui";

interface ExcelUploadStepProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ExcelUploadStep: React.FC<ExcelUploadStepProps> = ({
  onFileSelected,
  isProcessing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      alert("xlsx 또는 xls 파일만 업로드할 수 있습니다.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하만 가능합니다.`);
      return false;
    }
    return true;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelected(file);
      }
    },
    [validateFile, onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // 같은 파일 재선택 가능하도록 값 초기화
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-full max-w-lg p-12 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
          }
          ${isProcessing ? "opacity-50 pointer-events-none" : ""}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center text-center">
          {isProcessing ? (
            <>
              <div className="w-12 h-12 mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-semibold text-gray-700">
                파일을 분석하고 있습니다...
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100">
                {isDragOver ? (
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                ) : (
                  <Upload className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                엑셀 파일을 드래그하여 놓거나
              </p>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                파일 선택
              </Button>
              <p className="mt-4 text-sm text-gray-500">
                지원 형식: .xlsx, .xls (최대 1,000행, 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default ExcelUploadStep;
