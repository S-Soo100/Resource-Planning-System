"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDemoById } from "@/api/demo-api";
import { DemoResponse } from "@/types/demo/demo";
import { DemoStatus } from "@/types/demo/demo";
import {
  ArrowLeft,
  Package,
  Calendar,
  Presentation,
  Car,
  Truck,
  Plane,
  Ship,
  Trash2,
  Printer,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDateForDisplay, formatDateForDisplayUTC } from "@/utils/dateUtils";
import { formatDateTimeToKorean } from "@/utils/calendar/calendarUtils";
import {
  useUpdateDemoStatus,
  useDeleteDemo,
} from "@/hooks/(useDemo)/useDemoMutations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
// useWarehouseItems 훅 제거 - 이 페이지에서는 불필요
import DemoEditModal from "@/components/demonstration/DemoEditModal";
import LoginModal from "@/components/login/LoginModal";
import { IAuth } from "@/types/(auth)/auth";
import { authService } from "@/services/authService";
import { authStore } from "@/store/authStore";
import { getDisplayFileName } from "@/utils/fileUtils";
import {
  useDemoComments,
  CreateDemoCommentDto,
  type DemoComment,
} from "@/hooks/(useDemo)/useDemoComments";

// 로컬 formatDate 함수 제거 - dateUtils의 formatDateForDisplayUTC 사용

// 상태 텍스트 변환 함수
const getStatusText = (status: string): string => {
  switch (status) {
    case DemoStatus.requested:
      return "요청";
    case DemoStatus.approved:
      return "승인";
    case DemoStatus.rejected:
      return "반려";
    case DemoStatus.confirmedByShipper:
      return "출고팀 확인";
    case DemoStatus.shipmentCompleted:
      return "출고 완료";
    case DemoStatus.rejectedByShipper:
      return "출고 보류";
    case DemoStatus.demoCompleted:
      return "시연 종료";
    default:
      return status;
  }
};

// 상태 색상 클래스 함수
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case DemoStatus.requested:
      return "bg-yellow-100 text-yellow-800";
    case DemoStatus.approved:
      return "bg-green-100 text-green-800";
    case DemoStatus.rejected:
      return "bg-red-100 text-red-800";
    case DemoStatus.confirmedByShipper:
      return "bg-blue-100 text-blue-800";
    case DemoStatus.shipmentCompleted:
      return "bg-purple-100 text-purple-800";
    case DemoStatus.rejectedByShipper:
      return "bg-orange-100 text-orange-800";
    case DemoStatus.demoCompleted:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 상태 아이콘 함수
const getStatusIcon = (status: string): JSX.Element => {
  switch (status) {
    case DemoStatus.requested:
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
    case DemoStatus.approved:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case DemoStatus.rejected:
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

// 숫자 3자리마다 콤마를 붙여주는 함수
const formatNumberWithCommas = (x: number | string) => {
  if (x === null || x === undefined || x === "") return "-";
  const num = typeof x === "number" ? x : parseFloat(x);
  if (isNaN(num)) return x;
  return num.toLocaleString();
};

// 전화번호 포맷팅 함수
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "-";

  // 앞뒤 공백 제거
  const trimmedPhone = phone.trim();

  // 숫자만 추출
  const numbers = trimmedPhone.replace(/\D/g, "");

  // 11자리이고 010으로 시작하는 경우만 포맷팅 (01012345678 -> 010-1234-5678)
  if (numbers.length === 11 && numbers.startsWith("010")) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  // 그 외의 경우는 원본 그대로 반환
  return trimmedPhone;
};

// demoCurrencyUnit이 있는지 타입 가드 함수
function isDemoWithCurrencyUnit(
  obj: unknown
): obj is { demoCurrencyUnit: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "demoCurrencyUnit" in obj &&
    typeof (obj as { demoCurrencyUnit: unknown }).demoCurrencyUnit === "string"
  );
}

// 상차/하차 방법별 아이콘 매핑
const deliveryMethodIcon = (method: string) => {
  switch (method) {
    case "직접배송":
    case "직접회수":
      return <Car className="w-5 h-5 text-blue-500" />;
    case "택배":
      return <Package className="w-5 h-5 text-green-500" />;
    case "용차":
      return <Truck className="w-5 h-5 text-orange-500" />;
    case "항공":
      return <Plane className="w-5 h-5 text-purple-500" />;
    case "해운":
      return <Ship className="w-5 h-5 text-cyan-500" />;
    default:
      return <Car className="w-5 h-5 text-gray-400" />;
  }
};

// 댓글 섹션 컴포넌트
const DemoCommentSection: React.FC<{ demoId: number }> = ({ demoId }) => {
  const { user: currentUser } = useCurrentUser();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const {
    comments,
    isLoading,
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDemoComments(demoId);

  // 권한 확인 함수들
  const canEditComment = (comment: DemoComment) => {
    if (!currentUser) return false;
    return comment.userId === currentUser.id;
  };
  const canDeleteComment = (comment: DemoComment) => {
    if (!currentUser) return false;
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
    const commentData: CreateDemoCommentDto = { content: newComment.trim() };
    createComment(commentData);
    setNewComment("");
  };
  // 댓글 수정 핸들러
  const handleEditComment = (commentId: number) => {
    if (!editingContent.trim()) return;
    updateComment({
      commentId,
      data: { content: editingContent.trim() },
    });
    setEditingCommentId(null);
    setEditingContent("");
  };
  // 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    deleteComment(commentId);
  };
  return (
    <div className="p-4 mt-8 bg-white rounded-xl border border-gray-100 shadow-sm">
      <h3 className="flex items-center pb-2 mb-3 text-sm font-bold text-gray-700 border-b">
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
      </h3>
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
          comments.map((comment: DemoComment) => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    {comment.userName || comment.user?.name || "익명"}
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

const DemoRecordDetail = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoId = params.id as string;
  const teamId = searchParams.get("teamId");

  const [demo, setDemo] = useState<DemoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 선택된 상태 관리 추가
  const [selectedStatus, setSelectedStatus] = useState<DemoStatus | null>(null);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });

  const { user: auth } = useCurrentUser();
  const queryClient = useQueryClient();
  const updateDemoStatusMutation = useUpdateDemoStatus();
  const deleteDemoMutation = useDeleteDemo();
  // useWarehouseItems 훅 제거 - 이 페이지에서는 불필요

  // authStore에서 직접 로그인 상태 확인
  const isAuthenticated = authStore.getState().isAuthenticated;

  useEffect(() => {
    const fetchDemo = async () => {
      setIsLoading(true);

      // authStore에서 직접 로그인 상태 확인
      const currentAuth = authStore.getState();
      console.log("🔍 로그인 상태 확인:", {
        auth,
        isAuthenticated,
      });

      // 로그인되지 않은 상태에서는 모달을 먼저 표시
      if (!currentAuth.isAuthenticated || !currentAuth.user) {
        console.log("비로그인 상태 - 로그인 모달 표시");
        setIsLoginModalOpen(true);
        setIsLoading(false);
        return;
      }

      try {
        const res = await getDemoById(parseInt(demoId));
        console.log("📋 시연 조회 결과:", res);
        if (res.success && res.data) {
          const demoData = res.data as unknown as DemoResponse;
          setDemo(demoData);
          // 초기 상태 설정
          setSelectedStatus(demoData.demoStatus as DemoStatus);
        } else {
          console.error("시연 조회 실패:", res.message);
          toast.error(res.message || "해당 시연을 찾을 수 없습니다.");
          router.push("/demonstration-record");
        }
      } catch (error) {
        console.error("시연 조회 중 오류:", error);
        // API 호출 실패 시에도 로그인 모달 표시
        if (!currentAuth.isAuthenticated || !currentAuth.user) {
          setIsLoginModalOpen(true);
        } else {
          toast.error("시연 조회 중 네트워크 오류가 발생했습니다.");
          router.push("/demonstration-record");
        }
      }
      setIsLoading(false);
    };
    if (demoId) {
      fetchDemo();
    }
  }, [demoId, router]); // auth, isAuthenticated, teamId는 authStore에서 직접 가져오므로 의존성에서 제외

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

  // 시연 삭제 핸들러
  const handleDeleteDemo = async () => {
    if (!demo) return;

    if (
      !confirm(
        `시연 신청을 삭제하시겠습니까?\n\n시연 제목: ${demo.demoTitle}\n신청자: ${demo.requester}\n상태: ${demo.demoStatus}`
      )
    ) {
      return;
    }

    try {
      await deleteDemoMutation.mutateAsync(demo.id);
      toast.success("시연 신청이 삭제되었습니다.");
      // 시연 목록 페이지로 이동
      router.push("/demonstration-record");
    } catch (error) {
      toast.error("시연 신청 삭제에 실패했습니다.");
      console.error("시연 삭제 오류:", error);
    }
  };

  // 상태 변경 핸들러
  const handleStatusChange = async () => {
    if (!demo || !selectedStatus) return;

    // moderator 권한 사용자가 본인이 생성한 시연을 승인/반려하려고 할 때 제한
    if (auth?.accessLevel === "moderator") {
      if (demo.userId === auth?.id) {
        if (
          selectedStatus === DemoStatus.approved ||
          selectedStatus === DemoStatus.rejected
        ) {
          alert("요청자 본인 이외의 승인권자가 승인해야 합니다");
          return;
        }
      }
    }

    if (
      !window.confirm(
        `정말 시연 상태를 '${getStatusText(
          selectedStatus
        )}'(으)로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await updateDemoStatusMutation.mutateAsync({
        id: parseInt(demoId),
        data: { status: selectedStatus },
      });

      // 시연 출고 완료 상태로 변경된 경우 추가 액션
      if (selectedStatus === DemoStatus.shipmentCompleted) {
        // 캐시 무효화만 수행하고 refetch는 하지 않음
        queryClient.invalidateQueries({
          queryKey: [
            ["warehouseItems"],
            ["inventoryRecords"],
            ["items"],
            ["warehouse"],
            ["allWarehouses"],
          ],
        });
        alert("시연 출고 완료, 재고에 반영 했습니다.");
        toast.success(
          "시연 출고 완료 처리되었습니다. 재고가 업데이트되었습니다.",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#4CAF50",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
          }
        );
      }
      // 시연 완료 상태로 변경된 경우 재고 복구
      else if (selectedStatus === DemoStatus.demoCompleted) {
        // 캐시 무효화만 수행하고 refetch는 하지 않음
        queryClient.invalidateQueries({
          queryKey: [
            ["warehouseItems"],
            ["inventoryRecords"],
            ["items"],
            ["warehouse"],
            ["allWarehouses"],
          ],
        });
        alert("시연 완료, 재고가 복구되었습니다.");
        toast.success("시연 완료 처리되었습니다. 재고가 복구되었습니다.", {
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
        alert("시연 상태가 변경되었습니다.");
        toast.success("시연 상태가 변경되었습니다.", {
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

      // 서버에서 오는 에러 메시지를 그대로 표시
      let errorMessage = "상태 변경에 실패했습니다.";
      let errorDetails = "";
      let errorTitle = "상태 변경 실패";

      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;

        // 에러 타입별로 추가 정보 제공
        if (error.message.includes("재고")) {
          errorTitle = "재고 부족";
          errorDetails =
            "재고가 부족하여 상태 변경이 불가능합니다.\n\n• 재고 현황을 확인해주세요\n• 품목 수량을 조정해주세요\n• 담당자에게 문의해주세요";
        } else if (error.message.includes("권한")) {
          errorTitle = "권한 부족";
          errorDetails =
            "해당 작업을 수행할 권한이 없습니다.\n\n• 관리자에게 문의해주세요\n• 필요한 권한을 요청해주세요";
        } else if (error.message.includes("네트워크")) {
          errorTitle = "네트워크 오류";
          errorDetails =
            "네트워크 연결에 문제가 있습니다.\n\n• 인터넷 연결을 확인해주세요\n• 잠시 후 다시 시도해주세요";
        } else if (error.message.includes("시간")) {
          errorTitle = "요청 시간 초과";
          errorDetails =
            "요청 시간이 초과되었습니다.\n\n• 잠시 후 다시 시도해주세요\n• 서버 상태를 확인해주세요";
        } else if (error.message.includes("서버")) {
          errorTitle = "서버 오류";
          errorDetails =
            "서버에서 오류가 발생했습니다.\n\n• 잠시 후 다시 시도해주세요\n• 문제가 지속되면 관리자에게 문의해주세요";
        }
      }

      // 에러 모달 표시
      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        details: errorDetails,
      });

      // 토스트로도 간단한 메시지 표시
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#F44336",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
          maxWidth: "400px",
        },
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 드롭다운 변경 핸들러
  const handleStatusSelectChange = (newStatus: DemoStatus) => {
    setSelectedStatus(newStatus);
  };

  // 수정 권한 확인
  const hasPermissionToEdit = (record: DemoResponse) => {
    if (!auth) return false;
    const isAdmin = auth.isAdmin;
    const isAuthor = record.userId === auth.id;
    if (isAdmin) return true;
    const isRequestedStatus = record.demoStatus === DemoStatus.requested;
    return isAuthor && isRequestedStatus;
  };

  // 상태 변경 권한 확인
  const hasPermissionToChangeStatus = () => {
    return auth?.accessLevel === "admin" || auth?.accessLevel === "moderator";
  };

  // 권한별 상태 변경 가능 여부 확인
  const canChangeStatus = (currentStatus: string) => {
    if (!auth) return false;

    // console.log("🔍 권한 디버깅:", {
    //   userAccessLevel: auth.accessLevel,
    //   currentStatus: currentStatus,
    //   isAdmin: auth.isAdmin,
    //   userId: auth.id,
    //   demoUserId: demo?.userId,
    // });

    // Moderator 권한 체크
    if (auth.accessLevel === "moderator") {
      // Moderator는 requested, approved, rejected 상태만 변경 가능
      const canChange = [
        DemoStatus.requested,
        DemoStatus.approved,
        DemoStatus.rejected,
      ].includes(currentStatus as DemoStatus);
      console.log("📋 Moderator 권한 체크:", {
        allowedStatuses: [
          DemoStatus.requested,
          DemoStatus.approved,
          DemoStatus.rejected,
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
        DemoStatus.approved,
        DemoStatus.confirmedByShipper,
        DemoStatus.shipmentCompleted,
        DemoStatus.rejectedByShipper,
        DemoStatus.demoCompleted,
      ];
      const canChange = allowedStatuses.includes(currentStatus as DemoStatus);
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
        { value: DemoStatus.requested, label: "요청" },
        {
          value: DemoStatus.approved,
          label: "승인",
          disabled: demo?.userId === auth?.id,
        },
        {
          value: DemoStatus.rejected,
          label: "반려",
          disabled: demo?.userId === auth?.id,
        },
      ];
    }

    if (auth.accessLevel === "admin") {
      // Admin은 출고 단계만 담당
      return [
        { value: DemoStatus.confirmedByShipper, label: "출고팀 확인" },
        { value: DemoStatus.shipmentCompleted, label: "출고 완료" },
        { value: DemoStatus.rejectedByShipper, label: "출고 보류" },
        { value: DemoStatus.demoCompleted, label: "시연 종료" },
      ];
    }

    return [];
  };

  // demoCurrencyUnit 안전하게 추출
  const currencyUnit = isDemoWithCurrencyUnit(demo)
    ? demo.demoCurrencyUnit
    : "원";

  if (isLoading) {
    return (
      <div className="p-4 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6 animate-pulse">
            {/* 헤더 스켈레톤 */}
            <div className="flex gap-4 items-center">
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
              <div className="w-48 h-8 bg-gray-200 rounded"></div>
            </div>

            {/* 상태 스켈레톤 */}
            <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>

            {/* 카드 스켈레톤 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <div className="mb-4 w-32 h-6 bg-gray-200 rounded"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <div className="mb-4 w-32 h-6 bg-gray-200 rounded"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 주소 스켈레톤 */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="mb-4 w-32 h-6 bg-gray-200 rounded"></div>
              <div className="w-full h-4 bg-gray-200 rounded"></div>
            </div>

            {/* 시연품 스켈레톤 */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="mb-4 w-32 h-6 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex-1">
                      <div className="mb-1 w-32 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
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
          {/* demo가 null이고 로그인 상태일 때만 '시연을 찾을 수 없습니다' */}
          {!demo && authStore.getState().isAuthenticated && (
            <div className="flex flex-col justify-center items-center h-96">
              <p className="mb-4 text-lg text-gray-600">
                시연을 찾을 수 없습니다
              </p>
              <button
                className="px-4 py-2 text-white bg-blue-500 rounded"
                onClick={() => router.push("/demonstration-record")}
              >
                시연 목록으로 돌아가기
              </button>
            </div>
          )}
          {/* 기존 demo 상세 UI는 그대로 유지 */}
          {demo && (
            <div className="p-4 min-h-screen bg-gray-50">
              <div className="mx-auto max-w-4xl">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => router.push("/demonstration-record")}
                      className="flex gap-2 items-center px-3 py-2 text-gray-600 transition-colors hover:text-gray-800"
                    >
                      <ArrowLeft size={20} />
                      <span>목록으로</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {demo.demoTitle} 상세정보
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        window.open(
                          `/demonstration-record/print/${demoId}`,
                          "_blank"
                        )
                      }
                      className="flex gap-2 items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                    >
                      <Printer size={16} />
                      <span>인쇄</span>
                    </button>
                  </div>
                </div>

                {/* 현재 상태 표시 + 시연 수정 버튼 */}
                <div className="flex flex-wrap gap-4 items-center mb-6">
                  <div className="flex flex-1 gap-4 items-center min-w-0">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColorClass(
                        demo.demoStatus
                      )}`}
                    >
                      {getStatusIcon(demo.demoStatus)}
                      <span className="font-medium">
                        {getStatusText(demo.demoStatus)}
                      </span>
                    </div>
                    {/* 결재/승인 이력 요약 */}
                    {demo.approvalHistory &&
                      demo.approvalHistory.length > 0 && (
                        <div className="flex-1 min-w-0 text-xs text-gray-500 truncate">
                          <span className="mr-1 font-semibold">이력:</span>
                          {demo.approvalHistory
                            .map(
                              (h) =>
                                `${getStatusText(h.status)}(${
                                  h.user?.name || "?"
                                })`
                            )
                            .join(" → ")}
                        </div>
                      )}
                  </div>
                  {/* 시연 수정/삭제 버튼 (맨 오른쪽) */}
                  {hasPermissionToEdit(demo) ? (
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
                      >
                        시연 수정
                      </button>
                      <button
                        onClick={handleDeleteDemo}
                        disabled={deleteDemoMutation.isPending}
                        className="p-2 text-white bg-gray-500 rounded-lg transition-colors hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="시연 삭제"
                      >
                        {deleteDemoMutation.isPending ? (
                          <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    (() => {
                      const nonEditableStatuses = [
                        DemoStatus.approved,
                        DemoStatus.rejected,
                        DemoStatus.confirmedByShipper,
                        DemoStatus.shipmentCompleted,
                        DemoStatus.rejectedByShipper,
                        DemoStatus.demoCompleted,
                      ];

                      if (
                        nonEditableStatuses.includes(
                          demo.demoStatus as DemoStatus
                        )
                      ) {
                        const statusText = getStatusText(demo.demoStatus);
                        return (
                          <div className="flex gap-2 items-center ml-auto">
                            <div className="px-4 py-2 text-sm text-amber-700 bg-amber-100 rounded-lg border border-amber-200">
                              {statusText} 상태의 시연은 수정할 수 없습니다
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()
                  )}
                </div>

                {/* 상태 변경 섹션 */}
                {(() => {
                  const hasPermission = hasPermissionToChangeStatus();
                  const canChange = canChangeStatus(demo.demoStatus);
                  // console.log("🎯 상태 변경 섹션 조건 체크:", {
                  //   hasPermission,
                  //   canChange,
                  //   demoStatus: demo.demoStatus,
                  //   authLevel: auth?.accessLevel,
                  // });
                  return hasPermission && canChange;
                })() && (
                  <div className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-blue-500"
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
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex gap-3 items-center">
                        <span className="text-sm font-medium text-gray-600">
                          현재 상태:
                        </span>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getStatusColorClass(
                            demo.demoStatus
                          )}`}
                        >
                          {getStatusIcon(demo.demoStatus)}
                          <span className="text-sm font-medium">
                            {getStatusText(demo.demoStatus)}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="flex gap-3 items-center">
                        <div className="relative">
                          <select
                            value={selectedStatus || ""}
                            onChange={(e) =>
                              handleStatusSelectChange(
                                e.target.value as DemoStatus
                              )
                            }
                            disabled={isUpdatingStatus}
                            className="px-4 py-2 pr-10 bg-white rounded-lg border border-gray-300 transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">-선택-</option>
                            {getAvailableStatusOptions().map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                              >
                                {option.label}
                                {option.disabled &&
                                auth?.accessLevel === "moderator" &&
                                demo?.userId === auth?.id
                                  ? " (본인 시연)"
                                  : ""}
                              </option>
                            ))}
                          </select>
                          <div className="flex absolute inset-y-0 right-0 items-center pr-3 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                        <button
                          onClick={handleStatusChange}
                          disabled={!selectedStatus || isUpdatingStatus}
                          className="px-4 py-2 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isUpdatingStatus ? "변경 중..." : "상태 변경"}
                        </button>
                      </div>
                      {isUpdatingStatus && (
                        <div className="flex gap-2 items-center">
                          <div className="w-4 h-4 rounded-full border-2 border-blue-500 animate-spin border-t-transparent"></div>
                          <span className="text-sm text-gray-500">
                            변경 중...
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 mt-4 bg-blue-100 rounded-lg">
                      <div className="flex gap-2 items-start">
                        <svg
                          className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-sm text-blue-800">
                          {auth?.accessLevel === "moderator"
                            ? "1차승인권자는 초기 승인 단계만 담당합니다."
                            : auth?.accessLevel === "admin"
                            ? "관리자는 출고 단계를 담당합니다."
                            : "상태 변경 권한이 없습니다."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 권한 정보 섹션 (상태 변경 권한이 없는 경우) */}
                {!hasPermissionToChangeStatus() && (
                  <div className="p-4 mb-6 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm">
                    <div className="flex gap-3 items-start">
                      <svg
                        className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.667-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">
                          상태 변경 권한 없음
                        </h3>
                        <p className="mt-1 text-sm text-yellow-700">
                          {auth?.accessLevel === "user"
                            ? "일반 사용자는 상태 변경 권한이 없습니다."
                            : auth?.accessLevel === "supplier"
                            ? "공급업체는 상태 변경 권한이 없습니다."
                            : "상태 변경 권한이 없습니다."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 시연 정보 카드 */}
                <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
                  {/* 기본 정보 */}
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <Package size={20} />
                      기본 정보
                    </h2>
                    <div className="space-y-3">
                      {/* <div className="flex justify-between">
                        <span className="text-gray-600">시연 ID:</span>
                        <span className="font-medium">#{demo.id}</span>
                      </div> */}
                      <div className="flex justify-between">
                        <span className="text-gray-600">생성일:</span>
                        <span className="font-medium">
                          {formatDateForDisplayUTC(demo.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">요청자:</span>
                        <span className="font-medium">{demo.requester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">행사 담당자:</span>
                        <span className="font-medium">{demo.handler}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">시연 창고:</span>
                        <span className="font-medium text-blue-600">
                          {demo.warehouse?.warehouseName || "창고 정보 없음"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 시연 정보 */}
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <Presentation size={20} />
                      시연 정보
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">시연 제목:</span>
                        <span className="font-medium">{demo.demoTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">시연 유형:</span>
                        <span className="font-medium">
                          {demo.demoNationType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">결제 유형:</span>
                        <span className="font-medium">
                          {demo.demoPaymentType}
                        </span>
                      </div>
                      {demo.demoPaymentType !== "무료" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">시연 가격:</span>
                            <span className="font-medium">
                              {demo.demoPrice
                                ? `${formatNumberWithCommas(
                                    demo.demoPrice
                                  )} ${currencyUnit}`
                                : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">결제 예정일:</span>
                            <span className="font-medium">
                              {demo.demoPaymentDate
                                ? formatDateForDisplayUTC(demo.demoPaymentDate)
                                : "-"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 시연 일정 정보 */}
                <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                    <Calendar size={20} />
                    시연 일정
                  </h2>
                  {/* 담당자 정보 */}
                  <div className="mb-4">
                    {/* <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      담당자 정보
                    </h2> */}
                    <div className="flex justify-between">
                      <span className="text-gray-800">담당자:</span>
                      <span className="font-medium">
                        {demo.demoManager} (
                        {formatPhoneNumber(demo.demoManagerPhone)})
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* 상차 정보 */}
                    <div className="p-4 mb-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex gap-2 items-center mb-2">
                        {deliveryMethodIcon(demo.demoStartDeliveryMethod)}
                        <h3 className="font-medium text-blue-900">상차 정보</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">상차 방법:</span>
                          <span className="font-medium">
                            {demo.demoStartDeliveryMethod || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">상차 날짜:</span>
                          <span className="font-medium">
                            {demo.demoStartDate
                              ? formatDateTimeToKorean(demo.demoStartDate)
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">물품 상차 시간:</span>
                          <span className="font-medium">
                            {demo.demoStartTime || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* 하차 정보 */}
                    <div className="p-4 mb-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex gap-2 items-center mb-2">
                        {deliveryMethodIcon(demo.demoEndDeliveryMethod)}
                        <h3 className="font-medium text-purple-900">
                          하차 정보
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">하차 방법:</span>
                          <span className="font-medium">
                            {demo.demoEndDeliveryMethod || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">하차 날짜:</span>
                          <span className="font-medium">
                            {demo.demoEndDate
                              ? formatDateTimeToKorean(demo.demoEndDate)
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">물품 하차 시간:</span>
                          <span className="font-medium">
                            {demo.demoEndTime || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 시연 주소 정보 (상차/하차 정보 바로 아래) */}
                  <div className="p-4 mt-2 mb-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex gap-2 items-start mb-2">
                      <svg
                        className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <h3 className="font-medium text-blue-900">시연 주소</h3>
                    </div>
                    <div className="pl-7">
                      <p className="leading-relaxed text-gray-900 break-words">
                        {demo.demoAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 시연품 정보 */}
                <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    시연품 목록
                  </h2>
                  {demo.demoItems && demo.demoItems.length > 0 ? (
                    <div className="space-y-3">
                      {demo.demoItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
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
                            {/* <div className="text-sm text-gray-500">
                              {item.memo || "메모 없음"}
                            </div> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">시연품이 없습니다.</p>
                  )}
                </div>

                {/* 메모 */}
                {demo.memo && (
                  <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      메모
                    </h2>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {demo.memo}
                    </p>
                  </div>
                )}

                {/* 첨부파일 */}
                {demo.files && demo.files.length > 0 && (
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
                          d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a3 3 0 00-3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      첨부파일
                    </h2>
                    <div className="space-y-3">
                      {demo.files.map((file) => (
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
                                업로드: {formatDateForDisplayUTC(demo.createdAt)}
                              </div> */}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = file.fileUrl;
                              link.download = getDisplayFileName(file.fileName);
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

                {/* 수정 모달 */}
                {isEditModalOpen && demo && (
                  <DemoEditModal
                    isOpen={isEditModalOpen}
                    demo={demo}
                    onClose={() => {
                      setIsEditModalOpen(false);
                      window.location.reload();
                    }}
                    onSuccess={() => {}}
                  />
                )}

                {/* 에러 모달 */}
                {errorModal.isOpen && (
                  <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl border border-red-100 shadow-2xl max-h-[90vh] overflow-y-auto">
                      {/* 헤더 */}
                      <div className="flex gap-3 items-start p-6 pb-4 border-b border-red-100">
                        <div className="flex-shrink-0 flex justify-center items-center w-10 h-10 bg-red-100 rounded-full">
                          <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-red-700 mb-1">
                            {errorModal.title}
                          </h3>
                          <p className="text-sm text-red-600 leading-relaxed">
                            {errorModal.message}
                          </p>
                        </div>
                      </div>

                      {/* 상세 내용 */}
                      {errorModal.details && (
                        <div className="p-6 pt-4">
                          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <h4 className="flex gap-2 items-center mb-3 font-semibold text-red-800">
                              <svg
                                className="w-4 h-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-sm sm:text-base">
                                해결 방법
                              </span>
                            </h4>
                            <div className="text-sm leading-relaxed text-red-700 space-y-2">
                              {errorModal.details
                                .split("\n")
                                .map((line, index) => (
                                  <div key={index}>
                                    {line.startsWith("•") ? (
                                      <div className="flex gap-2 items-start">
                                        <span className="flex-shrink-0 mt-1 text-red-500 text-xs">
                                          •
                                        </span>
                                        <span className="text-sm">
                                          {line.substring(1).trim()}
                                        </span>
                                      </div>
                                    ) : line.trim() ? (
                                      <span className="block">{line}</span>
                                    ) : null}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 버튼 */}
                      <div className="flex justify-end p-6 pt-4 border-t border-red-100">
                        <button
                          onClick={() =>
                            setErrorModal({ ...errorModal, isOpen: false })
                          }
                          className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-xl shadow-sm transition-colors duration-200 hover:bg-red-700 active:bg-red-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          확인
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* 표기하지 않은 demo 데이터 정보 나열
              {demo && (
                <div className="p-6 mt-12 bg-gray-50 border-t border-gray-200">
                  <h2 className="mb-2 text-base font-semibold text-gray-700">
                    표기하지 않은 demo 데이터
                  </h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>[id] {demo.id}</div>
                    <div>[userId] {demo.userId}</div>
                    <div>[warehouseId] {demo.warehouseId}</div>
                    <div>[createdAt] {demo.createdAt}</div>
                    <div>[updatedAt] {demo.updatedAt}</div>
                    <div>
                      [deletedAt] {demo.deletedAt ? demo.deletedAt : "-"}
                    </div>
                    <div>
                      [user] {demo.user ? JSON.stringify(demo.user) : "-"}
                    </div>
                    <div>
                      [warehouse]{" "}
                      {demo.warehouse ? JSON.stringify(demo.warehouse) : "-"}
                    </div>
                    <div>
                      [comments] {demo.comments ? demo.comments.length : 0}개
                    </div>
                    <div>
                      [approvalHistory]{" "}
                      {demo.approvalHistory ? demo.approvalHistory.length : 0}개
                    </div>
                    <div>
                      [inventoryRecord]{" "}
                      {demo.inventoryRecord ? demo.inventoryRecord.length : 0}개
                    </div>
                  </div>
                </div>
              )} */}
              {/* 댓글 섹션 */}
              {demo && <DemoCommentSection demoId={demo.id} />}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DemoRecordDetail;
