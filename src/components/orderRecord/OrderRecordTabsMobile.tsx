import React from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { OrderStatus } from "@/types/(order)/order";
import { IUser } from "@/types/(auth)/user";

interface Props {
  records: IOrderRecord[];
  expandedRowId: number | null;
  onRowClick: (id: number) => void;
  formatDate: (date: string) => string;
  getStatusText: (status: string) => string;
  getStatusColorClass: (status: string) => string;
  hasPermissionToEdit: (record: IOrderRecord) => boolean;
  onEditClick: (record: IOrderRecord) => void;
  onDetailClick: (record: IOrderRecord) => void;
  // 상태 변경 관련 props 추가
  hasPermissionToChangeStatus: () => boolean;
  handleStatusChange: (
    orderId: number,
    newStatus: OrderStatus
  ) => Promise<void>;
  isUpdatingStatus: number | null;
  userAccessLevel: string;
  auth: IUser | null | undefined;
}

const OrderRecordTabsMobile: React.FC<Props> = ({
  records,
  expandedRowId,
  onRowClick,
  formatDate,
  getStatusText,
  getStatusColorClass,
  hasPermissionToEdit,
  onEditClick,
  onDetailClick,
  // 상태 변경 관련 props 추가
  hasPermissionToChangeStatus,
  handleStatusChange,
  isUpdatingStatus,
  userAccessLevel,
  auth,
}) => {
  // 상태 변경 드롭다운 컴포넌트
  const StatusDropdown = ({ record }: { record: IOrderRecord }) => {
    // 권한이 없는 경우 상태만 표시
    if (!hasPermissionToChangeStatus()) {
      return (
        <div className="flex gap-2 items-center">
          <div
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
              record.status
            )}`}
          >
            {getStatusText(record.status)}
          </div>
        </div>
      );
    }

    // 출고 완료 상태인 경우 상태만 표시하고 변경 불가
    if (record.status === OrderStatus.shipmentCompleted) {
      return (
        <div className="flex gap-2 items-center">
          <div
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
              record.status
            )} cursor-not-allowed`}
            title="출고 완료된 주문은 상태를 변경할 수 없습니다"
          >
            {getStatusText(record.status)}
          </div>
        </div>
      );
    }

    // admin 권한 사용자의 경우 특정 상태일 때만 드롭다운 표시
    if (userAccessLevel === "admin") {
      const allowedStatusesForAdmin = [
        OrderStatus.approved,
        OrderStatus.confirmedByShipper,
        OrderStatus.shipmentCompleted,
        OrderStatus.rejectedByShipper,
      ];

      if (!allowedStatusesForAdmin.includes(record.status as OrderStatus)) {
        return (
          <div className="flex gap-2 items-center">
            <div
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
                record.status
              )}`}
            >
              {getStatusText(record.status)}
            </div>
          </div>
        );
      }
    }

    // 권한이 있는 경우 드롭다운과 현재 상태 표시
    return (
      <div className="flex gap-3 items-center">
        {/* 현재 상태 표시 */}
        <div className="flex gap-2 items-center">
          <div
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
              record.status
            )}`}
          >
            {getStatusText(record.status)}
          </div>
        </div>

        {/* 상태 변경 드롭다운 */}
        <div className="relative">
          <select
            value={record.status}
            onChange={(e) =>
              handleStatusChange(record.id, e.target.value as OrderStatus)
            }
            disabled={isUpdatingStatus === record.id}
            className="px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300 hover:border-gray-400 transition-colors"
          >
            {/* 권한에 따라 다른 선택지 표시 */}
            {userAccessLevel === "moderator" ? (
              // Moderator: 요청, 승인, 반려만 가능 (단, 본인 발주는 승인/반려 불가)
              <>
                <option value={OrderStatus.requested}>요청</option>
                <option
                  value={OrderStatus.approved}
                  disabled={record.userId === auth?.id}
                >
                  승인{record.userId === auth?.id ? " (본인 발주)" : ""}
                </option>
                <option
                  value={OrderStatus.rejected}
                  disabled={record.userId === auth?.id}
                >
                  반려{record.userId === auth?.id ? " (본인 발주)" : ""}
                </option>
              </>
            ) : userAccessLevel === "admin" ? (
              // Admin: 출고팀 확인, 출고 완료, 출고 보류만 가능
              <>
                <option value={OrderStatus.confirmedByShipper}>
                  출고팀 확인
                </option>
                <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
                <option value={OrderStatus.rejectedByShipper}>출고 보류</option>
              </>
            ) : (
              // 기본값 (권한이 없는 경우)
              <>
                <option value={OrderStatus.requested}>요청</option>
                <option value={OrderStatus.approved}>승인</option>
                <option value={OrderStatus.rejected}>반려</option>
                <option value={OrderStatus.confirmedByShipper}>
                  출고팀 확인
                </option>
                <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
                <option value={OrderStatus.rejectedByShipper}>출고 보류</option>
              </>
            )}
          </select>
          {isUpdatingStatus === record.id && (
            <div className="flex absolute inset-0 justify-center items-center bg-gray-100 bg-opacity-50 rounded-md">
              <div className="w-4 h-4 rounded-full border-2 animate-spin border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col divide-y">
      {records.map((record) => (
        <div key={record.id}>
          {/* 클릭 가능한 헤더 영역 */}
          <div
            className="px-2 py-3 cursor-pointer hover:bg-gray-50"
            onClick={() => onRowClick(record.id)}
          >
            {/* 1번째 줄 */}
            <div className="flex gap-2 items-center">
              <span className="flex items-center text-xs text-gray-500">
                <Calendar size={14} className="mr-1" />
                {formatDate(record.createdAt)}
              </span>
              <span className="flex-1 text-xs text-gray-700 truncate">
                {record.package?.packageName &&
                record.package.packageName !== "개별 품목"
                  ? record.package.packageName
                  : record.orderItems && record.orderItems.length > 0
                  ? record.orderItems
                      .slice(0, 1)
                      .map(
                        (item) =>
                          `${
                            item.item?.teamItem?.itemName || "알 수 없는 품목"
                          }${item.quantity}개`
                      )
                      .join(", ") + (record.orderItems.length > 1 ? " 외" : "")
                  : "품목 없음"}
              </span>
              <span
                className="text-xs text-gray-700 truncate max-w-[60px]"
                title={record.receiver}
              >
                {record.receiver.length > 6
                  ? `${record.receiver.slice(0, 6)}...`
                  : record.receiver}
              </span>
            </div>
            {/* 2번째 줄 */}
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-600">{record.requester}</span>
              <span className="flex gap-1 items-center">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${getStatusColorClass(
                    record.status
                  )}`}
                >
                  {getStatusText(record.status)}
                </span>
                <span className="flex justify-center items-center w-5 h-5 bg-gray-100 rounded-full">
                  {expandedRowId === record.id ? (
                    <ChevronUp size={14} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-500" />
                  )}
                </span>
              </span>
            </div>
          </div>

          {/* 확장된 내용 영역 - 클릭 이벤트 차단 */}
          {expandedRowId === record.id && (
            <div
              className="px-2 pb-3 space-y-3 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 상태 변경 섹션 */}
              {hasPermissionToChangeStatus() && (
                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center pb-1 mb-2 text-sm font-bold text-gray-700 border-b">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 w-4 h-4 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    상태 변경
                  </div>
                  <div className="flex justify-center">
                    <StatusDropdown record={record} />
                  </div>
                </div>
              )}

              {/* 발주 상세 정보 */}
              <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center pb-1 mb-2 text-sm font-bold text-gray-700 border-b">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 w-4 h-4 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  발주 상세 정보
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-600">생성일:</span>
                    <span className="px-2 py-1 text-gray-800 bg-gray-50 rounded-md">
                      {formatDate(record.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-600">구매일:</span>
                    <span className="px-2 py-1 text-gray-800 bg-gray-50 rounded-md">
                      {record.purchaseDate
                        ? formatDate(record.purchaseDate)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-600">
                      출고예정일:
                    </span>
                    <span className="px-2 py-1 text-gray-800 bg-gray-50 rounded-md">
                      {record.outboundDate
                        ? formatDate(record.outboundDate)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-600">
                      설치요청일:
                    </span>
                    <span className="px-2 py-1 text-gray-800 bg-gray-50 rounded-md">
                      {record.installationDate
                        ? formatDate(record.installationDate)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-600">발주자:</span>
                    <span className="px-2 py-1 text-gray-800 bg-gray-50 rounded-md">
                      {record.requester}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-600">담당자:</span>
                    <span className="px-2 py-1 text-gray-800 bg-gray-50 rounded-md">
                      {record.manager || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-600">
                      출고 창고:
                    </span>
                    <span className="px-2 py-1 font-medium text-white bg-blue-500 rounded-md">
                      {record.warehouse?.warehouseName || "창고 정보 없음"}
                    </span>
                  </div>
                </div>
              </div>
              {/* 배송 정보 */}
              <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center pb-1 mb-2 text-sm font-bold text-gray-700 border-b">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 w-4 h-4 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2v5a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-9a1 1 0 00-.293-.707l-2-2A1 1 0 0017 3h-1c0-.552-.447-1-1-1H5a1 1 0 00-1 1H3z" />
                  </svg>
                  배송 정보
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-600">수령자:</span>
                    <span className="px-2 py-1 text-gray-800 bg-gray-50 rounded-md">
                      {record.receiver}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-600">연락처:</span>
                    <span className="px-2 py-1 text-gray-800 bg-gray-50 rounded-md">
                      {record.receiverPhone}
                    </span>
                  </div>
                  <div className="flex flex-col py-1 border-b border-gray-100">
                    <span className="mb-1 font-medium text-gray-600">
                      주소:
                    </span>
                    <span className="p-2 text-gray-800 break-words bg-gray-50 rounded-md">
                      {record.receiverAddress}
                    </span>
                  </div>
                </div>
              </div>
              {/* 주문 품목 목록 */}
              {record.orderItems && record.orderItems.length > 0 && (
                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center pb-1 mb-2 text-sm font-bold text-gray-700 border-b">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 w-4 h-4 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    주문 품목 목록
                  </div>
                  <div className="overflow-hidden bg-gray-50 rounded-lg">
                    <div className="flex justify-between px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100">
                      <span>품목</span>
                      <span>수량</span>
                    </div>
                    <ul className="overflow-y-auto max-h-40 divide-y divide-gray-200">
                      {record.orderItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between items-center px-2 py-1"
                        >
                          <span className="text-xs font-medium text-gray-700">
                            {item.item?.teamItem?.itemName || "알 수 없는 품목"}
                          </span>
                          <span className="px-2 py-1 text-xs text-gray-600 bg-white rounded-md">
                            {item.quantity}개
                          </span>
                        </li>
                      ))}
                    </ul>
                    {record.memo && (
                      <div className="px-2 py-1 bg-gray-100">
                        <span className="text-xs font-medium text-gray-600">
                          추가 요청사항:{" "}
                        </span>
                        <span className="text-xs italic text-gray-800">
                          {record.memo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* 첨부 파일 */}
              {record.files && record.files.length > 0 && (
                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center pb-1 mb-2 text-sm font-bold text-gray-700 border-b">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 w-4 h-4 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    첨부 파일
                  </div>
                  <ul className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                    {record.files.map((file) => (
                      <li key={file.id} className="px-2 py-1">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          {file.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetailClick(record);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md transition-colors hover:bg-green-600"
                  >
                    상세보기
                  </button>
                  {hasPermissionToEdit(record) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(record);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md transition-colors hover:bg-blue-600"
                    >
                      수정
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderRecordTabsMobile;
