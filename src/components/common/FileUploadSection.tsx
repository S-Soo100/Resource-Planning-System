import React from "react";
import { Paperclip, X } from "lucide-react";

interface FileUploadSectionProps {
  files: File[];
  isDragOver: boolean;
  onFileSelection: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: (index: number) => void;
  selectedFiles: React.RefObject<HTMLInputElement>;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  files,
  isDragOver,
  onFileSelection,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  selectedFiles,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <label
        htmlFor="file-upload"
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        파일 업로드
      </label>
      <div className="mb-2 text-xs text-amber-600">
        * 파일 크기는 최대 50MB까지 업로드 가능합니다.
      </div>
      <div className="mb-3 text-xs text-red-600">
        * 발주서, 견적서 등 필요증빙 필수 첨부
      </div>
      <div
        onClick={() => selectedFiles.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver
            ? "bg-blue-50 border-blue-500"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <Paperclip className="mb-2 w-8 h-8 text-gray-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {isDragOver
              ? "파일을 여기에 놓으세요"
              : "클릭하여 파일 선택 또는 파일을 여기로 드래그"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PDF, 이미지, 문서 파일 등
          </p>
        </div>
      </div>
      <input
        ref={selectedFiles}
        type="file"
        hidden
        multiple
        onChange={onFileSelection}
      />

      {/* 업로드된 파일 목록 */}
      <div className="p-3 mt-4 bg-gray-50 rounded-lg">
        <div className="mb-2 text-sm font-medium text-gray-700">
          업로드된 파일
        </div>
        <div className="space-y-1">
          {files.length === 0 ? (
            <div className="text-sm text-gray-400">업로드 항목이 없습니다.</div>
          ) : (
            files.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-white rounded border"
              >
                <span className="text-sm truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="p-1 text-red-600 transition-colors hover:text-red-800"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadSection;
