import { ApiResponse } from "./common";

export enum DeliveryStatus {
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface Delivery {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  trackingNumber: string;
  carrier: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryRequest {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  estimatedDeliveryDate: string;
  shippingAddress: string;
}

export interface UpdateDeliveryRequest {
  status?: DeliveryStatus;
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shippingAddress?: string;
}

export interface DeliveryResponse extends ApiResponse {
  data?: Delivery;
}

export interface DeliveriesResponse extends ApiResponse {
  data?: Delivery[];
}

export interface DeliveriesByOrderResponse extends ApiResponse {
  data?: {
    orderId: string;
    deliveries: Delivery[];
  };
}
