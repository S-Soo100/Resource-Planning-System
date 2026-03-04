import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  uploadTaxInvoice,
  getTaxInvoices,
  deleteTaxInvoice,
} from "@/api/order-api";
import { userApi } from "@/api/user-api";
import { CustomerDocument, DocumentType } from "@/types/customer-document";
import { ApiResponse } from "@/types/common";

// === 세금계산서 훅 ===

export const useTaxInvoices = (orderId: number | undefined) => {
  return useQuery<CustomerDocument[]>({
    queryKey: ["taxInvoices", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const response = await getTaxInvoices(orderId);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    enabled: !!orderId,
  });
};

export const useUploadTaxInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CustomerDocument>,
    Error,
    { orderId: number; file: File; memo?: string }
  >({
    mutationFn: ({ orderId, file, memo }) =>
      uploadTaxInvoice(orderId, file, memo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["taxInvoices", variables.orderId],
      });
    },
  });
};

export const useDeleteTaxInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CustomerDocument>,
    Error,
    { orderId: number; docId: number }
  >({
    mutationFn: ({ orderId, docId }) => deleteTaxInvoice(orderId, docId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["taxInvoices", variables.orderId],
      });
    },
  });
};

// === 고객 서류 훅 ===

export const useUserDocuments = (
  userId: number | undefined,
  documentType?: DocumentType
) => {
  return useQuery<CustomerDocument[]>({
    queryKey: ["userDocuments", userId, documentType],
    queryFn: async () => {
      if (!userId) return [];
      const response = await userApi.getDocuments(userId, documentType);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    enabled: !!userId,
  });
};

export const useUploadUserDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CustomerDocument>,
    Error,
    {
      userId: number;
      file: File;
      documentType: DocumentType;
      memo?: string;
      orderId?: number;
    }
  >({
    mutationFn: ({ userId, file, documentType, memo, orderId }) =>
      userApi.uploadDocument(userId, file, documentType, memo, orderId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userDocuments", variables.userId],
      });
    },
  });
};

export const useDeleteUserDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CustomerDocument>,
    Error,
    { userId: number; docId: number }
  >({
    mutationFn: ({ userId, docId }) => userApi.deleteDocument(userId, docId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userDocuments", variables.userId],
      });
    },
  });
};

// === 재구매 예정 고객 훅 ===

export const useRepurchaseDueUsers = (teamId: number | undefined) => {
  return useQuery({
    queryKey: ["repurchaseDueUsers", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const response = await userApi.getRepurchaseDueUsers(teamId);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    enabled: !!teamId,
  });
};
