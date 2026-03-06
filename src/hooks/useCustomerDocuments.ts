import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  uploadTaxInvoice,
  getTaxInvoices,
  deleteTaxInvoice,
} from "@/api/order-api";
import { supplierApi } from "@/api/supplier-api";
import { CustomerDocument, DocumentType } from "@/types/customer-document";
import { RepurchaseDueSupplier } from "@/types/supplier";
import { ApiResponse } from "@/types/common";

// === 세금계산서 훅 (변경 없음) ===

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

// === 고객 서류 훅 (v3.1 - E-006: Supplier 기반으로 전환) ===

export const useSupplierDocuments = (
  supplierId: number | undefined,
  documentType?: DocumentType
) => {
  return useQuery<CustomerDocument[]>({
    queryKey: ["supplierDocuments", supplierId, documentType],
    queryFn: async () => {
      if (!supplierId) return [];
      try {
        const response = await supplierApi.getDocuments(
          supplierId,
          documentType
        );
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!supplierId,
    retry: false,
  });
};

export const useUploadSupplierDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CustomerDocument>,
    Error,
    {
      supplierId: number;
      file: File;
      documentType: DocumentType;
      memo?: string;
    }
  >({
    mutationFn: ({ supplierId, file, documentType, memo }) =>
      supplierApi.uploadDocument(supplierId, file, documentType, memo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["supplierDocuments", variables.supplierId],
      });
    },
  });
};

export const useDeleteSupplierDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<void>,
    Error,
    { supplierId: number; docId: number }
  >({
    mutationFn: ({ supplierId, docId }) =>
      supplierApi.deleteDocument(supplierId, docId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["supplierDocuments", variables.supplierId],
      });
    },
  });
};

// === 재구매 예정 고객 훅 (v3.1 - E-006: Supplier 기반으로 전환) ===

export const useRepurchaseDueSuppliers = (teamId: number | undefined) => {
  return useQuery<RepurchaseDueSupplier[]>({
    queryKey: ["repurchaseDueSuppliers", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      try {
        const response = await supplierApi.getRepurchaseDueSuppliers(teamId);
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch {
        console.warn("[E-006] 재구매 API 미연결 - teamId:", teamId);
        return [];
      }
    },
    enabled: !!teamId,
    retry: false,
  });
};
