import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrderComment,
  getOrderComments,
  updateOrderComment,
  deleteOrderComment,
} from "@/api/order-api";
import { OrderComment } from "@/types/(order)/orderComment";
import { ApiResponse } from "@/types/common";
import { toast } from "react-hot-toast";

// 댓글 생성 DTO 타입
export interface CreateOrderCommentDto {
  content: string;
}

// 댓글 수정 DTO 타입
export interface UpdateOrderCommentDto {
  content: string;
}

export const useOrderComments = (orderId: number) => {
  const queryClient = useQueryClient();

  // 댓글 목록 조회
  const {
    data: commentsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<ApiResponse<OrderComment[]>>({
    queryKey: ["comments", "order", orderId],
    queryFn: () =>
      getOrderComments(orderId) as Promise<ApiResponse<OrderComment[]>>,
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
  });

  const comments =
    commentsResponse?.success && Array.isArray(commentsResponse.data)
      ? commentsResponse.data
      : [];

  // 댓글 생성 뮤테이션
  const createCommentMutation = useMutation({
    mutationFn: (data: CreateOrderCommentDto) =>
      createOrderComment(orderId, data),
    onSuccess: (response) => {
      if (response.success) {
        // 댓글 목록 쿼리 무효화하여 새로고침
        queryClient.invalidateQueries({
          queryKey: ["comments", "order", orderId],
        });
        toast.success("댓글이 작성되었습니다.");
      } else {
        toast.error(response.message || "댓글 작성에 실패했습니다.");
      }
    },
    onError: () => {
      toast.error("댓글 작성에 실패했습니다.");
    },
  });

  // 댓글 수정 뮤테이션
  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: number;
      data: UpdateOrderCommentDto;
    }) => updateOrderComment(commentId, data),
    onSuccess: (response) => {
      if (response.success) {
        // 댓글 목록 쿼리 무효화하여 새로고침
        queryClient.invalidateQueries({
          queryKey: ["comments", "order", orderId],
        });
        toast.success("댓글이 수정되었습니다.");
      } else {
        toast.error(response.message || "댓글 수정에 실패했습니다.");
      }
    },
    onError: () => {
      toast.error("댓글 수정에 실패했습니다.");
    },
  });

  // 댓글 삭제 뮤테이션
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteOrderComment(orderId, commentId),
    onSuccess: (response) => {
      if (response.success) {
        // 댓글 목록 쿼리 무효화하여 새로고침
        queryClient.invalidateQueries({
          queryKey: ["comments", "order", orderId],
        });
        toast.success("댓글이 삭제되었습니다.");
      } else {
        toast.error(response.message || "댓글 삭제에 실패했습니다.");
      }
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다.");
    },
  });

  return {
    // 데이터
    comments,
    isLoading,
    error,

    // 액션
    refetch,
    createComment: createCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,

    // 로딩 상태
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
};
