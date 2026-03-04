// 고객 서류 관리 타입 (v2.5)

export type DocumentType =
  | "prescription"
  | "recipient"
  | "receipt"
  | "tax_invoice";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  prescription: "처방전",
  recipient: "수급자 서류",
  receipt: "영수증",
  tax_invoice: "세금계산서",
};

export interface CustomerDocument {
  id: number;
  userId: number;
  orderId: number | null;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RepurchaseDueUser {
  id: number;
  email: string;
  name: string;
  customerType: string | null;
  isRecipient: boolean;
  depositorName: string | null;
  repurchaseCycleMonths: number | null;
  repurchaseDueDate: string;
  createdAt: string;
  teamUserMap: {
    teamId: number;
    accessLevel: string;
  }[];
}
