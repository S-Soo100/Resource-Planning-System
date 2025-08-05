import { useState, useRef } from "react";
import { normalizeFileName } from "@/utils/fileUtils";

export const useFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const selectedFiles = useRef<HTMLInputElement>(null);

  const handleFileSelection = () => {
    if (selectedFiles.current && selectedFiles.current.files) {
      const newFiles = Array.from(selectedFiles.current.files);
      console.log(
        "[파일 업로드] 원본 파일들:",
        newFiles.map((f) => ({ name: f.name, size: f.size }))
      );

      // 파일명 정규화하여 새로운 File 객체 생성
      const normalizedFiles = newFiles.map((file) => {
        const originalName = file.name;
        const normalizedFileName = normalizeFileName(file);
        const normalizedFile = new File([file], normalizedFileName, {
          type: file.type,
          lastModified: file.lastModified,
        });

        console.log("[파일 업로드] 파일명 정규화:", {
          original: originalName,
          normalized: normalizedFileName,
          isChanged: originalName !== normalizedFileName,
        });

        return normalizedFile;
      });

      setFiles((prevFiles) => [...prevFiles, ...normalizedFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log(
      "[파일 업로드] 드래그된 원본 파일들:",
      droppedFiles.map((f) => ({ name: f.name, size: f.size }))
    );

    // 파일명 정규화하여 새로운 File 객체 생성
    const normalizedFiles = droppedFiles.map((file) => {
      const originalName = file.name;
      const normalizedFileName = normalizeFileName(file);
      const normalizedFile = new File([file], normalizedFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });

      console.log("[파일 업로드] 드래그 파일명 정규화:", {
        original: originalName,
        normalized: normalizedFileName,
        isChanged: originalName !== normalizedFileName,
      });

      return normalizedFile;
    });
    setFiles((prevFiles) => [...prevFiles, ...normalizedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const resetFiles = () => {
    setFiles([]);
  };

  // 파일 업로드 시 서버로 보낼 파일들 (백엔드 요청에 맞춰 수정)
  const getEncodedFiles = () => {
    console.log(
      "[파일 업로드] 최종 서버 전송 파일들:",
      files.map((f) => ({ name: f.name, size: f.size }))
    );
    return files; // 백엔드 요청에 맞춰 정규화된 파일명 그대로 사용
  };

  return {
    files,
    isDragOver,
    selectedFiles,
    handleFileSelection,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveFile,
    resetFiles,
    getEncodedFiles, // 인코딩된 파일들 반환
  };
};
