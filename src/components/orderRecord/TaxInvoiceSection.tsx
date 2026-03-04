"use client";

import { useState, useRef } from "react";
import {
  useTaxInvoices,
  useUploadTaxInvoice,
  useDeleteTaxInvoice,
} from "@/hooks/useCustomerDocuments";
import { toast } from "react-hot-toast";
import { LoadingInline } from "@/components/ui/Loading";
import { FileText, Upload, Trash2, Download } from "lucide-react";
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
}

export default function TaxInvoiceSection({ orderId }: TaxInvoiceSectionProps) {
  const { data: invoices = [], isLoading } = useTaxInvoices(orderId);
  const { mutateAsync: uploadInvoice, isPending: isUploading } =
    useUploadTaxInvoice();
  const { mutateAsync: deleteInvoice, isPending: isDeleting } =
    useDeleteTaxInvoice();

  const [memo, setMemo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      toast.error("파일 크기는 10MB 이하만 가능합니다");
      return;
    }

    // 파일 형식 검증
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
      } else {
        toast.error(result.message || "업로드에 실패했습니다");
      }
    } catch {
      toast.error("세금계산서 업로드에 실패했습니다");
    }

    // 파일 입력 초기화
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
      <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
        <FileText className="w-5 h-5 text-gray-500" />
        세금계산서 ({invoices.length})
      </h2>

      {/* 업로드 영역 */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="flex items-end gap-3">
          <div className="flex-1">
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

      {/* 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingInline />
        </div>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          등록된 세금계산서가 없습니다
        </p>
      ) : (
        <div className="space-y-2">
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
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
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
    </div>
  );
}
