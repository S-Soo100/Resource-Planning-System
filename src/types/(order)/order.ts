import { ApiResponse } from "../common";

export interface OrderResponse extends ApiResponse {
  data?: Order;
}

export interface OrdersResponse extends ApiResponse {
  data?: Order[];
}

export interface Order {
  id: number;
  userId: number;
  supplierId: number;
  requester: string;
  receiver: string;
  receiverPhone: string;
  receiverAddress: string;
  purchaseDate: string;
  manager: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: OrderUser;
  supplier: OrderSupplier;
  orderItems: OrderItem[];
}

export interface OrderUser {
  id: number;
  email: string;
  name: string;
}

export interface OrderSupplier {
  id: number;
  supplierName: string;
  supplierPhoneNumber: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  memo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  userId: number;
  supplierId: number;
  requester: string;
  receiver: string;
  receiverPhone: string;
  receiverAddress: string;
  purchaseDate: string;
  manager: string;
  status: string;
  orderItems: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  itemId: number;
  quantity: number;
  memo: string;
}

export interface UpdateOrderDto {
  requester?: string;
  receiver?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  purchaseDate?: string;
  manager?: string;
  status?: string;
  orderItems?: CreateOrderItemRequest[];
}

export interface UpdateOrderStatusDto {
  status: string;
}
