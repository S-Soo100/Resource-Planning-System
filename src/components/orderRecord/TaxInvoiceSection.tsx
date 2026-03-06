"use client";

import { useState, useRef } from "react";
import {
  useTaxInvoices,
  useUploadTaxInvoice,
  useDeleteTaxInvoice,
} from "@/hooks/useCustomerDocuments";
import { toast } from "react-hot-toast";
import { LoadingInline } from "@/components/ui/Loading";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Plus,
  ChevronUp,
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

interface TaxInvoiceSectionProps {
  orderId: number;
  isTaxInvoiceIssued?: boolean;
  onTaxInvoiceToggle?: (checked: boolean) => void;
  isToggling?: boolean;
}

export default function TaxInvoiceSection({
  orderId,
  isTaxInvoiceIssued,
  onTaxInvoiceToggle,
  isToggling,
}: TaxInvoiceSectionProps) {
  const { data: invoices = [], isLoading } = useTaxInvoices(orderId);
  const { mutateAsync: uploadInvoice, isPending: isUploading } =
    useUploadTaxInvoice();
  const { mutateAsync: deleteInvoice, isPending: isDeleting } =
    useDeleteTaxInvoice();

  const [memo, setMemo] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const result = await uploadInvoice({
        orderId,
        file,
        memo: memo.trim() || undefined,
      });
      if (result.success) {
        toast.success("세금계산서가 업로드되었습니다");
        setMemo("");
        setIsUploadOpen(false);
      } else {
        toast.error(result.message || "업로드에 실패했습니다");
      }
    } catch {
      toast.error("세금계산서 업로드에 실패했습니다");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (docId: number, fileName: string) => {
    if (!confirm(`"${fileName}"을(를) 삭제하시겠습니까?`)) return;

    try {
      const result = await deleteInvoice({ orderId, docId });
      if (result.success) {
        toast.success("세금계산서가 삭제되었습니다");
      } else {
        toast.error(result.message || "삭제에 실패했습니다");
      }
    } catch {
      toast.error("세금계산서 삭제에 실패했습니다");
    }
  };

  return (
    <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* 헤더: 타이틀 + 발행 상태 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex gap-2 items-center text-lg font-semibold text-gray-900">
          <FileText className="w-5 h-5 text-gray-500" />
          세금계산서
          {invoices.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({invoices.length})
            </span>
          )}
        </h2>
        {isTaxInvoiceIssued !== undefined &&
          (onTaxInvoiceToggle ? (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isTaxInvoiceIssued}
                onChange={(e) => onTaxInvoiceToggle(e.target.checked)}
                disabled={isToggling}
                className="w-4 h-4 text-green-600 rounded border-gray-300 disabled:opacity-50"
              />
              <span
                className={`text-sm ${isTaxInvoiceIssued ? "text-green-700 font-medium" : "text-gray-600"}`}
              >
                발행 완료
              </span>
            </label>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                isTaxInvoiceIssued
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  isTaxInvoiceIssued ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              {isTaxInvoiceIssued ? "발행 완료" : "미발행"}
            </span>
          ))}
      </div>

      {/* 파일 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingInline />
        </div>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-3">
          등록된 세금계산서가 없습니다
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {invoice.fileName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatDateForDisplay(invoice.createdAt)}</span>
                    {invoice.memo && (
                      <>
                        <span>|</span>
                        <span className="truncate">{invoice.memo}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                <a
                  href={invoice.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="다운로드"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(invoice.id, invoice.fileName)}
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

      {/* 업로드 토글 버튼 / 접이식 업로드 영역 */}
      {isUploadOpen ? (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              세금계산서 업로드
            </span>
            <button
              onClick={() => setIsUploadOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                파일 메모
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="세금계산서에 대한 메모 (선택)"
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700 transition-colors flex-shrink-0">
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
      ) : (
        <button
          onClick={() => setIsUploadOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-dashed border-blue-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          세금계산서 업로드
        </button>
      )}
    </div>
  );
}
