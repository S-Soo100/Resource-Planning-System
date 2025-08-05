import React, { useRef } from "react";
import { Paperclip, X } from "lucide-react";
import { getDisplayFileName } from "@/utils/fileUtils";

interface FileUploadSectionProps {
  files: File[];
  onFileChange: (newFiles: File[]) => void;
  onRemoveFile: (index: number) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  files,
  onFileChange,
  onRemoveFile,
}) => {
  const selectedFiles = useRef<HTMLInputElement>(null);

  // 파일 선택 핸들러
  const handleFileSelection = () => {
    selectedFiles.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      onFileChange(newFiles);
    }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        첨부파일
      </label>
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleFileSelection}
          className="flex gap-2 items-center px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
        >
          <Paperclip className="w-4 h-4" />
          파일 선택
        </button>
        <input
          ref={selectedFiles}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="text-sm text-gray-700">
                  {getDisplayFileName(file.name)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSection;
