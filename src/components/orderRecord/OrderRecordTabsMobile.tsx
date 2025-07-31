import React from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { OrderStatus } from "@/types/(order)/order";
import { IUser } from "@/types/(auth)/user";
import { OrderComment } from "@/types/(order)/orderComment";
import {
  useOrderComments,
  type CreateOrderCommentDto,
  type UpdateOrderCommentDto,
} from "@/hooks/useOrderComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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

// 댓글 섹션 컴포넌트
interface OrderCommentSectionProps {
  record: IOrderRecord;
  currentUser: IUser | undefined;
}

const OrderCommentSection: React.FC<OrderCommentSectionProps> = ({
  record,
  currentUser,
}) => {
  const [newComment, setNewComment] = React.useState("");
  const [editingCommentId, setEditingCommentId] = React.useState<number | null>(
    null
  );
  const [editingContent, setEditingContent] = React.useState("");

  // 실제 API를 사용한 댓글 관리
  const {
    comments,
    isLoading,
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useOrderComments(record.id);

  // 권한 확인 함수들
  const canEditComment = (comment: OrderComment) => {
    if (!currentUser) return false;
    // 수정은 오직 본인 댓글만 가능 (Admin도 본인 댓글만)
    return comment.userId === currentUser.id;
  };

  const canDeleteComment = (comment: OrderComment) => {
    if (!currentUser) return false;
    // 삭제는 본인 댓글 + Admin은 모든 댓글 가능
    return (
      comment.userId === currentUser.id || currentUser.accessLevel === "admin"
    );
  };

  // 댓글 작성 시간 포맷팅
  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 댓글 작성 핸들러
  const handleSubmitComment = () => {
    if (!newComment.trim() || !currentUser) return;

    const commentData: CreateOrderCommentDto = {
      content: newComment.trim(),
    };

    createComment(commentData);
    setNewComment("");
  };

  // 댓글 수정 핸들러
  const handleEditComment = (commentId: number) => {
    if (!editingContent.trim()) return;

    const updateData: UpdateOrderCommentDto = {
      content: editingContent.trim(),
    };

    updateComment({ commentId, data: updateData });
    setEditingCommentId(null);
    setEditingContent("");
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    deleteComment(commentId);
  };

  return (
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
            d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
        댓글 ({comments.length})
      </div>

      {/* 댓글 목록 */}
      <div className="overflow-y-auto mb-3 space-y-2 max-h-40">
        {isLoading ? (
          <p className="py-2 text-xs text-center text-gray-500">
            댓글을 불러오는 중...
          </p>
        ) : comments.length === 0 ? (
          <p className="py-2 text-xs text-center text-gray-500">
            아직 댓글이 없습니다.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-2 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-gray-800">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatCommentDate(comment.createdAt)}
                  </span>
                  {comment.createdAt !== comment.updatedAt && (
                    <span className="text-xs text-gray-400">(수정됨)</span>
                  )}
                </div>

                {(canEditComment(comment) || canDeleteComment(comment)) && (
                  <div className="flex space-x-1">
                    {canEditComment(comment) && (
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingContent(comment.content);
                        }}
                        disabled={isUpdating || isDeleting}
                        className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        수정
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isUpdating || isDeleting}
                        className="text-xs text-red-600 hover:text-red-800 disabled:text-gray-400"
                      >
                        {isDeleting ? "삭제중..." : "삭제"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="p-2 w-full text-xs rounded-md border border-gray-300 resize-none"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      disabled={isUpdating}
                      className="px-2 py-1 text-xs text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                    >
                      {isUpdating ? "저장중..." : "저장"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingContent("");
                      }}
                      disabled={isUpdating}
                      className="px-2 py-1 text-xs text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* 댓글 작성 폼 */}
      {currentUser && (
        <div className="pt-2 border-t">
          <div className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력해주세요..."
              className="p-2 w-full text-xs rounded-md border border-gray-300 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={isCreating}
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isCreating}
                className="px-3 py-1 text-xs text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isCreating ? "작성 중..." : "댓글 작성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const { user: currentUser } = useCurrentUser();

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
                  </div>
                </div>
              )}
              {/* 추가 요청사항 */}
              {record.memo && (
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
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    추가 요청사항
                  </div>
                  <div className="flex flex-col justify-between items-start border-b border-gray-100 py-1.5 sm:py-2">
                    <span className="w-full text-xs text-center text-gray-900 rounded-md sm:text-sm">
                      {record.memo}
                    </span>
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

              {/* 댓글 섹션 */}
              {currentUser && (
                <OrderCommentSection
                  record={record}
                  currentUser={currentUser}
                />
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
