import { useState, useRef } from "react";
import { normalizeFileName, encodeFileName } from "@/utils/fileUtils";

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

  // 파일 업로드 시 서버로 보낼 파일명 인코딩
  const getEncodedFiles = () => {
    const encodedFiles = files.map((file) => {
      const originalName = file.name;
      const encodedFileName = encodeFileName(file.name);
      const encodedFile = new File([file], encodedFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });

      console.log("[파일 업로드] 서버 전송용 인코딩:", {
        original: originalName,
        encoded: encodedFileName,
        isChanged: originalName !== encodedFileName,
      });

      return encodedFile;
    });

    console.log(
      "[파일 업로드] 최종 서버 전송 파일들:",
      encodedFiles.map((f) => ({ name: f.name, size: f.size }))
    );
    return encodedFiles;
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
