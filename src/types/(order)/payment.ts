import { ApiResponse } from "../common";

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  paymentDate: string;
  refundDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
}

export interface UpdatePaymentRequest {
  status?: PaymentStatus;
  transactionId?: string;
  refundDate?: string;
}

export interface PaymentResponse extends ApiResponse {
  data?: Payment;
}

export interface PaymentsResponse extends ApiResponse {
  data?: Payment[];
}

export interface PaymentsByOrderResponse extends ApiResponse {
  data?: {
    orderId: string;
    payments: Payment[];
  };
}
