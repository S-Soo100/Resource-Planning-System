"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrder } from "@/api/order-api";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { OrderStatus } from "@/types/(order)/order";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateOrderStatus } from "@/hooks/(useOrder)/useOrderMutations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import OrderEditModal from "@/components/orderRecord/OrderEditModal";
import LoginModal from "@/components/login/LoginModal";
import { IAuth } from "@/types/(auth)/auth";
import { authService } from "@/services/authService";
import { authStore } from "@/store/authStore";
import { getDisplayFileName } from "@/utils/fileUtils";
import { useOrderComments } from "@/hooks/useOrderComments";
import {
  CreateOrderCommentDto,
  UpdateOrderCommentDto,
} from "@/types/(order)/orderComment";
import { OrderComment } from "@/types/(order)/orderComment";
import { IUser } from "@/types/(auth)/user";

// 날짜 포맷팅 함수
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}.${month}.${day}`;
};

// 전화번호 포맷팅 함수
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "-";

  // 숫자만 추출
  const numbers = phone.replace(/\D/g, "");

  // 11자리인 경우 (01012345678 -> 010-1234-5678)
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  // 10자리인 경우 (0101234567 -> 010-123-4567)
  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  // 그 외의 경우는 원본 반환
  return phone;
};

// 상태 텍스트 변환 함수
const getStatusText = (status: string): string => {
  switch (status) {
    case OrderStatus.requested:
      return "요청";
    case OrderStatus.approved:
      return "승인";
    case OrderStatus.rejected:
      return "반려";
    case OrderStatus.confirmedByShipper:
      return "출고팀 확인";
    case OrderStatus.shipmentCompleted:
      return "출고 완료";
    case OrderStatus.rejectedByShipper:
      return "출고 보류";
    default:
      return status;
  }
};

// 상태 색상 클래스 함수
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case OrderStatus.requested:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.approved:
      return "bg-green-100 text-green-800";
    case OrderStatus.rejected:
      return "bg-red-100 text-red-800";
    case OrderStatus.confirmedByShipper:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.shipmentCompleted:
      return "bg-purple-100 text-purple-800";
    case OrderStatus.rejectedByShipper:
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 상태 아이콘 함수
const getStatusIcon = (status: string): JSX.Element => {
  switch (status) {
    case OrderStatus.requested:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case OrderStatus.approved:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case OrderStatus.rejected:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

// 댓글 섹션 컴포넌트
interface OrderCommentSectionProps {
  record: IOrderRecord;
  currentUser: IUser | undefined;
}

const OrderCommentSection: React.FC<OrderCommentSectionProps> = ({
  record,
  currentUser,
}) => {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

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
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-gray-500"
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
      </h2>

      {/* 댓글 목록 */}
      <div className="overflow-y-auto mb-4 space-y-3 max-h-60">
        {isLoading ? (
          <p className="py-4 text-sm text-center text-gray-500">
            댓글을 불러오는 중...
          </p>
        ) : comments.length === 0 ? (
          <p className="py-4 text-sm text-center text-gray-500">
            아직 댓글이 없습니다.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
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
                    className="p-2 w-full text-sm rounded-md border border-gray-300 resize-none"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      disabled={isUpdating}
                      className="px-3 py-1 text-xs text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                    >
                      {isUpdating ? "저장중..." : "저장"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingContent("");
                      }}
                      disabled={isUpdating}
                      className="px-3 py-1 text-xs text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* 댓글 작성 폼 */}
      {currentUser && (
        <div className="pt-3 border-t">
          <div className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력해주세요..."
              className="p-3 w-full text-sm rounded-md border border-gray-300 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isCreating}
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isCreating}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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

const OrderRecordDetail = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const teamId = searchParams.get("teamId");

  const [order, setOrder] = useState<IOrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { user: auth } = useCurrentUser();
  const queryClient = useQueryClient();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const { refetchAll: refetchWarehouseItems } = useWarehouseItems();

  // authStore에서 직접 로그인 상태 확인
  const isAuthenticated = authStore.getState().isAuthenticated;

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);

      // authStore에서 직접 로그인 상태 확인
      const currentAuth = authStore.getState();
      console.log("🔍 로그인 상태 확인:", {
        auth,
        isAuthenticated,
        currentAuth,
        orderId,
        teamId,
      });

      // 로그인되지 않은 상태에서는 모달을 먼저 표시
      if (!currentAuth.isAuthenticated || !currentAuth.user) {
        console.log("비로그인 상태 - 로그인 모달 표시");
        setIsLoginModalOpen(true);
        setIsLoading(false);
        return;
      }

      try {
        const res = await getOrder(orderId);
        console.log("📋 발주 조회 결과:", res);
        if (res.success && res.data) {
          const orderData = res.data as IOrderRecord;
          setOrder(orderData);
          // 초기 상태 설정
          setSelectedStatus(orderData.status as OrderStatus);
        } else {
          alert("해당 발주를 찾을 수 없습니다.");
          router.push("/orderRecord");
        }
      } catch (error) {
        console.error("발주 조회 중 오류:", error);
        // API 호출 실패 시에도 로그인 모달 표시
        if (!currentAuth.isAuthenticated || !currentAuth.user) {
          setIsLoginModalOpen(true);
        } else {
          alert("발주 조회에 실패했습니다.");
          router.push("/orderRecord");
        }
      }
      setIsLoading(false);
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  // teamId가 있으면 콘솔에 출력 (디버깅용)
  useEffect(() => {
    if (teamId) {
      console.log("Team ID from URL params:", teamId);
    }
  }, [teamId]);

  // 로그인 성공 핸들러
  const handleLoginSuccess = async (userData: IAuth) => {
    console.log("로그인 성공:", userData);
    if (teamId) {
      // 팀 정보 설정
      await authService.selectTeam(parseInt(teamId));

      // 잠시 대기 후 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // 선택된 상태 관리
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null
  );

  // 상태 변경 핸들러
  const handleStatusChange = async () => {
    if (!order || !selectedStatus) return;

    // moderator 권한 사용자가 본인이 생성한 발주를 승인/반려하려고 할 때 제한
    if (auth?.accessLevel === "moderator") {
      if (order.userId === auth?.id) {
        if (
          selectedStatus === OrderStatus.approved ||
          selectedStatus === OrderStatus.rejected
        ) {
          alert("요청자 본인 이외의 승인권자가 승인해야 합니다");
          return;
        }
      }
    }

    if (
      !window.confirm(
        `정말 주문 상태를 '${getStatusText(
          selectedStatus
        )}'(으)로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await updateOrderStatusMutation.mutateAsync({
        id: orderId,
        data: { status: selectedStatus },
      });

      // 출고 완료 상태로 변경된 경우 추가 액션
      if (selectedStatus === OrderStatus.shipmentCompleted) {
        queryClient.invalidateQueries({
          queryKey: [
            ["warehouseItems"],
            ["inventoryRecords"],
            ["items"],
            ["warehouse"],
          ],
        });
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ["warehouseItems"] }),
          queryClient.refetchQueries({ queryKey: ["inventoryRecords"] }),
        ]);
        setTimeout(async () => {
          await refetchWarehouseItems();
        }, 1000);
        alert("출고 완료, 재고에 반영 했습니다.");
        toast.success("출고 완료 처리되었습니다. 재고가 업데이트되었습니다.", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#4CAF50",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        });
      } else {
        alert("주문 상태가 변경되었습니다.");
        toast.success("주문 상태가 변경되었습니다.", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#2196F3",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        });
      }

      // 상태 업데이트 후 데이터 새로고침
      window.location.reload();
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      alert("주문 상태 업데이트에 실패했습니다.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 드롭다운 변경 핸들러
  const handleStatusSelectChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
  };

  // 수정 권한 확인
  const hasPermissionToEdit = (record: IOrderRecord) => {
    if (!auth) return false;
    const isAdmin = auth.isAdmin;
    const isAuthor = record.userId === auth.id;
    if (isAdmin) return true;
    const isRequestedStatus = record.status === OrderStatus.requested;
    return isAuthor && isRequestedStatus;
  };

  // 상태 변경 권한 확인
  const hasPermissionToChangeStatus = () => {
    return auth?.accessLevel === "admin" || auth?.accessLevel === "moderator";
  };

  // 권한별 상태 변경 가능 여부 확인
  const canChangeStatus = (currentStatus: string) => {
    if (!auth) return false;

    console.log("🔍 권한 디버깅:", {
      userAccessLevel: auth.accessLevel,
      currentStatus: currentStatus,
      isAdmin: auth.isAdmin,
      userId: auth.id,
      orderUserId: order?.userId,
    });

    // Moderator 권한 체크
    if (auth.accessLevel === "moderator") {
      // Moderator는 requested, approved, rejected 상태만 변경 가능
      const canChange = [
        OrderStatus.requested,
        OrderStatus.approved,
        OrderStatus.rejected,
      ].includes(currentStatus as OrderStatus);
      console.log("📋 Moderator 권한 체크:", {
        allowedStatuses: [
          OrderStatus.requested,
          OrderStatus.approved,
          OrderStatus.rejected,
        ],
        currentStatus,
        canChange,
      });
      return canChange;
    }

    // Admin 권한 체크
    if (auth.accessLevel === "admin") {
      // Admin은 approved, confirmedByShipper, shipmentCompleted, rejectedByShipper 상태일 때만 변경 가능
      const allowedStatuses = [
        OrderStatus.approved,
        OrderStatus.confirmedByShipper,
        OrderStatus.shipmentCompleted,
        OrderStatus.rejectedByShipper,
      ];
      const canChange = allowedStatuses.includes(currentStatus as OrderStatus);
      // console.log("📋 Admin 권한 체크:", {
      //   allowedStatuses,
      //   currentStatus,
      //   canChange,
      // });
      return canChange;
    }

    console.log("❌ 권한 없음 - accessLevel:", auth.accessLevel);
    return false;
  };

  // 권한별 사용 가능한 상태 옵션 반환
  const getAvailableStatusOptions = () => {
    if (!auth) return [];

    if (auth.accessLevel === "moderator") {
      // Moderator는 초기 승인 단계만 담당
      return [
        { value: OrderStatus.requested, label: "요청" },
        {
          value: OrderStatus.approved,
          label: "승인",
          disabled: order?.userId === auth?.id,
        },
        {
          value: OrderStatus.rejected,
          label: "반려",
          disabled: order?.userId === auth?.id,
        },
      ];
    }

    if (auth.accessLevel === "admin") {
      // Admin은 출고 단계만 담당
      return [
        { value: OrderStatus.approved, label: "승인" },
        { value: OrderStatus.confirmedByShipper, label: "출고팀 확인" },
        { value: OrderStatus.shipmentCompleted, label: "출고 완료" },
        { value: OrderStatus.rejectedByShipper, label: "출고 보류" },
      ];
    }

    return [];
  };

  if (isLoading) {
    return (
      <div className="p-4 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="mb-4 h-8 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        teamId={teamId || undefined}
      />

      {/* 비로그인 상태면 아래 UI를 렌더링하지 않음 */}
      {!isLoginModalOpen && !authStore.getState().isAuthenticated ? null : (
        <>
          {/* order가 null이고 로그인 상태일 때만 '발주를 찾을 수 없습니다' */}
          {!order && authStore.getState().isAuthenticated && (
            <div className="flex flex-col justify-center items-center h-96">
              <p className="mb-4 text-lg text-gray-600">
                발주를 찾을 수 없습니다
              </p>
              <button
                className="px-4 py-2 text-white bg-blue-500 rounded"
                onClick={() => router.push("/orderRecord")}
              >
                발주 목록으로 돌아가기
              </button>
            </div>
          )}
          {/* 기존 order 상세 UI는 그대로 유지 */}
          {order && (
            <div className="p-4 min-h-screen bg-gray-50">
              <div className="mx-auto max-w-4xl">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => router.push("/orderRecord")}
                      className="flex gap-2 items-center px-3 py-2 text-gray-600 transition-colors hover:text-gray-800"
                    >
                      <ArrowLeft size={20} />
                      <span>목록으로</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  {/* 현재 상태 표시 */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColorClass(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="font-medium">
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  {/* 수정 버튼 */}
                  {hasPermissionToEdit(order) && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-4 py-2 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
                    >
                      발주 수정
                    </button>
                  )}
                </div>

                <div className="flex gap-4 items-center p-4 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm fp-4">
                  <span
                    className={`px-2 py-1 text-sm font-medium rounded-full ${
                      order.packageId && order.packageId > 0
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.packageId && order.packageId > 0 ? "패키지" : "개별"}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {order.title ||
                      `${
                        order.warehouse?.warehouseName || "알 수 없는 창고"
                      }에서 ${
                        order.orderItems && order.orderItems.length > 0
                          ? order.orderItems.length > 1
                            ? `${
                                order.orderItems[0]?.item?.teamItem?.itemName ||
                                "품목"
                              } 등 ${order.orderItems.length}개 품목`
                            : `${
                                order.orderItems[0]?.item?.teamItem?.itemName ||
                                "품목"
                              }`
                          : "품목"
                      } 출고`}
                  </h1>
                </div>
                {/* 상태 변경 섹션 */}
                {(() => {
                  const hasPermission = hasPermissionToChangeStatus();
                  const canChange = canChangeStatus(order.status);
                  console.log("🎯 상태 변경 섹션 조건 체크:", {
                    hasPermission,
                    canChange,
                    orderStatus: order.status,
                    authLevel: auth?.accessLevel,
                  });
                  return hasPermission && canChange;
                })() && (
                  <div className="p-4 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-gray-500"
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
                    </h2>
                    <div className="flex gap-4 items-center">
                      <span className="text-sm font-medium text-gray-600">
                        현재 상태:
                      </span>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${getStatusColorClass(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <span className="text-gray-400">→</span>
                      <select
                        value={
                          selectedStatus !== null
                            ? selectedStatus
                            : order.status
                        }
                        onChange={(e) =>
                          handleStatusSelectChange(
                            e.target.value as OrderStatus
                          )
                        }
                        disabled={isUpdatingStatus}
                        className="px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {getAvailableStatusOptions().map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                          >
                            {option.label}
                            {option.disabled &&
                            auth?.accessLevel === "moderator" &&
                            order?.userId === auth?.id
                              ? " (본인 발주)"
                              : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleStatusChange}
                        disabled={
                          isUpdatingStatus ||
                          selectedStatus === null ||
                          selectedStatus === order.status
                        }
                        className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isUpdatingStatus ? "변경 중..." : "상태 변경"}
                      </button>
                      {isUpdatingStatus && (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 animate-spin border-t-transparent"></div>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {auth?.accessLevel === "moderator"
                        ? "1차승인권자는 초기 승인 단계만 담당합니다."
                        : auth?.accessLevel === "admin"
                        ? "관리자는 출고 단계를 담당합니다."
                        : "상태 변경 권한이 없습니다."}
                    </div>
                  </div>
                )}

                {/* 발주 정보 카드 */}
                <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
                  {/* 기본 정보 */}
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <Package size={20} />
                      기본 정보
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">제목:</span>
                        <span className="font-medium text-blue-600">
                          {order.title || "제목 없음"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">발주 ID:</span>
                        <span className="font-medium">#{order.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">생성일:</span>
                        <span className="font-medium">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">발주자:</span>
                        <span className="font-medium">{order.requester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">담당자:</span>
                        <span className="font-medium">
                          {order.manager || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">출고 창고:</span>
                        <span className="font-medium text-blue-600">
                          {order.warehouse?.warehouseName || "창고 정보 없음"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 배송 정보 */}
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <Truck size={20} />
                      배송 정보
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">수령자:</span>
                        <span className="font-medium">{order.receiver}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">연락처:</span>
                        <span className="font-medium">
                          {formatPhoneNumber(order.receiverPhone)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">구매일:</span>
                        <span className="font-medium">
                          {order.purchaseDate
                            ? formatDate(order.purchaseDate)
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">출고예정일:</span>
                        <span className="font-medium">
                          {order.outboundDate
                            ? formatDate(order.outboundDate)
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">설치요청일:</span>
                        <span className="font-medium">
                          {order.installationDate
                            ? formatDate(order.installationDate)
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 주소 정보 */}
                <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    배송 주소
                  </h2>
                  <p className="text-gray-800 break-words">
                    {order.receiverAddress}
                  </p>
                </div>

                {/* 품목 정보 */}
                <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    발주 품목
                  </h2>
                  {order.orderItems && order.orderItems.length > 0 ? (
                    <div className="space-y-3">
                      {order.orderItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {item.item?.teamItem?.itemName ||
                                "알 수 없는 품목"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.item?.teamItem?.itemCode || "코드 없음"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {item.quantity}개
                            </div>
                            <div className="text-sm text-gray-500">
                              가격 정보 없음
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">발주 품목이 없습니다.</p>
                  )}
                </div>

                {/* 메모 */}
                {order.memo && (
                  <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      추가 요청사항
                    </h2>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {order.memo}
                    </p>
                  </div>
                )}

                {/* 첨부파일 */}
                {order.files && order.files.length > 0 && (
                  <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      첨부파일
                    </h2>
                    <div className="space-y-3">
                      {order.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex gap-3 items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <div className="font-medium text-gray-900">
                                {getDisplayFileName(file.fileName)}
                              </div>
                              {/* <div className="text-sm text-gray-500">
                                업로드: {formatDate(file.createdAt)}
                              </div> */}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = file.fileUrl;
                              link.download = file.fileName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-md transition-colors hover:bg-blue-100"
                          >
                            다운로드
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 댓글 섹션 */}
                {order && (
                  <OrderCommentSection record={order} currentUser={auth} />
                )}

                {/* 수정 모달 */}
                {isEditModalOpen && order && (
                  <OrderEditModal
                    isOpen={isEditModalOpen}
                    orderRecord={order}
                    onClose={() => {
                      setIsEditModalOpen(false);
                      window.location.reload();
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderRecordDetail;
