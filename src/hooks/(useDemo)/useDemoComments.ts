import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  creatDemoCommentById,
  getDemoCommentById,
  updateDemoCommentByCommentId,
  deleteDemoCommentByCommentId,
} from "@/api/demo-api";
import { toast } from "react-hot-toast";

// 댓글 타입 (DemoResponse의 comments 참고)
export interface DemoComment {
  id: number;
  demoId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface CreateDemoCommentDto {
  content: string;
}

export interface UpdateDemoCommentDto {
  content: string;
}

export const useDemoComments = (demoId: number) => {
  const queryClient = useQueryClient();

  // 댓글 목록 조회
  const {
    data: commentsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments", "demo", demoId],
    queryFn: async () => {
      const res = await getDemoCommentById(demoId);
      if (res.success && Array.isArray(res.data))
        return res.data as DemoComment[];
      return [];
    },
    enabled: !!demoId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const comments = Array.isArray(commentsResponse) ? commentsResponse : [];

  // 댓글 생성
  const createCommentMutation = useMutation({
    mutationFn: (data: CreateDemoCommentDto) =>
      creatDemoCommentById(demoId, data.content),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "demo", demoId],
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

  // 댓글 수정
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId }: { commentId: number }) =>
      updateDemoCommentByCommentId(commentId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "demo", demoId],
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

  // 댓글 삭제
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteDemoCommentByCommentId(commentId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "demo", demoId],
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
    comments,
    isLoading,
    error,
    refetch,
    createComment: createCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
};
