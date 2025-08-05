import { useState, useRef } from "react";
import { normalizeFileName, encodeFileName } from "@/utils/fileUtils";

export const useFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const selectedFiles = useRef<HTMLInputElement>(null);

  const handleFileSelection = () => {
    if (selectedFiles.current && selectedFiles.current.files) {
      const newFiles = Array.from(selectedFiles.current.files);
      // 파일명 정규화하여 새로운 File 객체 생성
      const normalizedFiles = newFiles.map((file) => {
        const normalizedFileName = normalizeFileName(file);
        return new File([file], normalizedFileName, {
          type: file.type,
          lastModified: file.lastModified,
        });
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
    // 파일명 정규화하여 새로운 File 객체 생성
    const normalizedFiles = droppedFiles.map((file) => {
      const normalizedFileName = normalizeFileName(file);
      return new File([file], normalizedFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });
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
    return files.map((file) => {
      const encodedFileName = encodeFileName(file.name);
      return new File([file], encodedFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });
    });
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
