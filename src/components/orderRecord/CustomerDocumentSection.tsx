"use client";

import { useState, useRef } from "react";
import {
  useSupplierDocuments,
  useUploadSupplierDocument,
  useDeleteSupplierDocument,
} from "@/hooks/useCustomerDocuments";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/customer-document";
import { toast } from "react-hot-toast";
import { LoadingInline } from "@/components/ui/Loading";
import {
  FolderOpen,
  Upload,
  Trash2,
  Download,
  Filter,
  Info,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

const DOCUMENT_TYPES: DocumentType[] = [
  "prescription",
  "recipient",
  "receipt",
  "tax_invoice",
];

interface CustomerDocumentSectionProps {
  supplierId: number;
}

export default function CustomerDocumentSection({
  supplierId,
}: CustomerDocumentSectionProps) {
  const [filterType, setFilterType] = useState<DocumentType | undefined>(
    undefined
  );
  const {
    data: documents = [],
    isLoading,
    isError,
  } = useSupplierDocuments(supplierId, filterType);
  const { mutateAsync: uploadDocument, isPending: isUploading } =
    useUploadSupplierDocument();
  const { mutateAsync: deleteDocument, isPending: isDeleting } =
    useDeleteSupplierDocument();

  const [selectedType, setSelectedType] =
    useState<DocumentType>("prescription");
  const [memo, setMemo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API 미연결 시 안내 메시지
  if (isError || (documents.length === 0 && isError)) {
    return (
      <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
          <FolderOpen className="w-5 h-5 text-gray-500" />
          판매대상 서류
        </h2>
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            서류 기능 준비 중입니다. 곧 사용 가능합니다.
          </p>
        </div>
      </div>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("파일 크기는 10MB 이하만 가능합니다");
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("지원하지 않는 파일 형식입니다");
      return;
    }

    try {
      const result = await uploadDocument({
        supplierId,
        file,
        documentType: selectedType,
        memo: memo.trim() || undefined,
      });
      if (result.success) {
        toast.success("서류가 업로드되었습니다");
        setMemo("");
      } else {
        toast.error(result.error || "업로드에 실패했습니다");
      }
    } catch {
      toast.error("서류 업로드에 실패했습니다");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (docId: number, fileName: string) => {
    if (!confirm(`"${fileName}"을(를) 삭제하시겠습니까?`)) return;

    try {
      const result = await deleteDocument({ supplierId, docId });
      if (result.success) {
        toast.success("서류가 삭제되었습니다");
      } else {
        toast.error(result.error || "삭제에 실패했습니다");
      }
    } catch {
      toast.error("서류 삭제에 실패했습니다");
    }
  };

  return (
    <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
        <FolderOpen className="w-5 h-5 text-gray-500" />
        판매대상 서류 ({documents.length})
      </h2>

      {/* 업로드 영역 */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              서류 유형
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType)}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {DOCUMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm text-gray-600 mb-1">메모</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 (선택)"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
            {isUploading ? (
              <>
                <LoadingInline />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                파일 선택
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept={ACCEPTED_TYPES.join(",")}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          이미지, PDF, 문서, 스프레드시트 (최대 10MB)
        </p>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => setFilterType(undefined)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            !filterType
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          전체
        </button>
        {DOCUMENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filterType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {DOCUMENT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingInline />
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          등록된 서류가 없습니다
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                    {DOCUMENT_TYPE_LABELS[doc.documentType]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.fileName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatDateForDisplay(doc.createdAt)}</span>
                    {doc.memo && (
                      <>
                        <span>|</span>
                        <span className="truncate">{doc.memo}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="다운로드"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id, doc.fileName)}
                  disabled={isDeleting}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
