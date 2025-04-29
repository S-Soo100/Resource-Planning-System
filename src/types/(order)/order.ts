import { ApiResponse } from "../common";
import { InventoryRecord } from "../inventory-record";

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
  packageId: number;
  warehouseId: number;
  countryCode: string;
  requester: string;
  receiver: string;
  receiverPhone: string;
  receiverAddress: string;
  purchaseDate: string;
  outboundDate: string;
  installationDate: string;
  manager: string;
  status: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: OrderUser;
  supplier: OrderSupplier;
  package: OrderPackage;
  warehouse: OrderWarehouse;
  orderItems: OrderItem[];
  inventoryRecords: InventoryRecord[];
  files: OrderFile[];
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

export interface OrderPackage {
  id: number;
  packageName: string;
  itemlist: string;
}

export interface OrderWarehouse {
  id: number;
  warehouseName: string;
  warehouseAddress: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  memo: string;
  createdAt: string;
  updatedAt: string;
  item: OrderItemDetail;
}

export interface OrderItemDetail {
  id: number;
  itemCode: string;
  itemName: string;
  itemQuantity: number;
}

export interface OrderFile {
  id: number;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  orderId: number;
}

export interface CreateOrderDto {
  userId: number;
  supplierId: number;
  packageId: number;
  requester: string;
  receiver: string;
  receiverPhone: string;
  receiverAddress: string;
  purchaseDate: string;
  outboundDate: string;
  installationDate: string;
  manager: string;
  status: string;
  memo: string;
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
  outboundDate?: string;
  installationDate?: string;
  manager?: string;
  status?: string;
  memo?: string;
  orderItems?: CreateOrderItemRequest[];
}

export interface UpdateOrderStatusDto {
  status: string;
}
