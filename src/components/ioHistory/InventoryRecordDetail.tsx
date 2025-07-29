import React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Download } from "lucide-react";
import { getSafeFileName } from "@/utils/fileUtils";
import { InventoryRecord } from "@/types/(inventoryRecord)/inventory";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";

interface FileInfo {
  fileName: string;
  fileUrl: string;
  size?: number;
}

interface InventoryRecordDetailProps {
  record: InventoryRecord;
}

// 날짜 포맷팅 유틸리티 함수
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "yyyy-MM-dd HH:mm", { locale: ko });
  } catch (error) {
    console.error("날짜 포맷팅 에러:", error);
    return dateString;
  }
};

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / (1024 * 1024)).toFixed(1) + "MB";
}

export default function InventoryRecordDetail({
  record,
}: InventoryRecordDetailProps) {
  const { warehouses } = useWarehouseItems();
  const warehouse = warehouses.find((w) => w.id === record.item?.warehouseId);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="text-sm font-medium text-gray-700 mb-2">상세 정보</h4>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="max-w-xl mx-auto divide-y divide-gray-200">
          <div className="p-3">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-gray-600 min-w-0 flex-shrink-0">ID</span>
                <span className="font-medium ml-4">{record.id}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600 min-w-0 flex-shrink-0">
                  구분
                </span>
                <span className="font-medium ml-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      record.inboundQuantity !== null
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {record.inboundQuantity !== null ? "입고" : "출고"}
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600 min-w-0 flex-shrink-0">
                  품목
                </span>
                <div className="font-medium ml-4 min-w-0 flex-1">
                  {record.item?.teamItem ? (
                    <div className="space-y-1">
                      <div className="text-blue-700 font-medium">
                        {record.item.teamItem.itemName}
                      </div>
                      <div className="text-xs text-gray-500">
                        코드: {record.item.teamItem.itemCode}
                      </div>
                      {record.item.teamItem.category?.name && (
                        <div className="text-xs text-gray-400">
                          카테고리: {record.item.teamItem.category.name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-500">
                      품목 정보 없음 (ID: {record.itemId})
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600 min-w-0 flex-shrink-0">
                  수량
                </span>
                <span className="font-medium ml-4">
                  {record.inboundQuantity ?? record.outboundQuantity ?? "-"}
                </span>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">입고 위치</div>
              <div className="font-medium break-words whitespace-pre-wrap">
                {record.inboundLocation || "-"}
              </div>
              <div className="text-gray-600">출고 위치</div>
              <div className="font-medium break-words whitespace-pre-wrap">
                {record.outboundLocation || "-"}
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">입고일</div>
              <div className="font-medium">
                {formatDate(record.inboundDate) || "-"}
              </div>
              <div className="text-gray-600">출고일</div>
              <div className="font-medium">
                {formatDate(record.outboundDate) || "-"}
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">비고</div>
              <div className="font-medium truncate">
                {record.remarks || "-"}
              </div>
              <div className="text-gray-600">창고</div>
              <div className="font-medium">
                {warehouse?.warehouseName || "-"}
              </div>
              {/* <div className="text-gray-600">처리자 ID</div>
              <div className="font-medium">{record.userId || "-"}</div> */}
              <div className="text-gray-600">처리자</div>
              <div className="font-medium">
                {record.user
                  ? `${record.user.name} (${record.user.email})`
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 첨부 파일 섹션 */}
      {record.files && record.files.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">첨부 파일</h4>
          <div className="space-y-2">
            {record.files.map((file: FileInfo, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span
                    className="text-sm text-gray-800 truncate max-w-xs"
                    title={getSafeFileName(file.fileName)}
                  >
                    {getSafeFileName(file.fileName)}
                  </span>
                  {file.size && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({formatFileSize(file.size)})
                    </span>
                  )}
                </div>
                <a
                  href={file.fileUrl}
                  download={getSafeFileName(file.fileName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  <span>다운로드</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-gray-400">첨부된 파일이 없습니다</div>
      )}
    </div>
  );
}
