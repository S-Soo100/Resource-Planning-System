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

export enum OrderStatus {
  requested = "requested", // 요청
  approved = "approved", // 승인
  rejected = "rejected", // 반려
  confirmedByShipper = "confirmedByShipper", // 출고자 확인
  shipmentCompleted = "shipmentCompleted", // 출고 완료
  rejectedByShipper = "rejectedByShipper", // 출고자 반려
}

export interface CreateOrderDto {
  userId: number;
  supplierId: number | null;
  packageId: number | null;
  requester: string;
  receiver: string;
  receiverPhone: string;
  receiverAddress: string;
  purchaseDate: string;
  outboundDate: string;
  installationDate: string;
  manager: string;
  status: OrderStatus;
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

export interface CreatOrderResponse {
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
  user: {
    id: number;
    email: string;
    name: string;
  };
  supplier: {
    id: number;
    supplierName: string;
    supplierPhoneNumber: string;
  };
  package: {
    id: number;
    packageName: string;
    itemlist: string;
  };
  warehouse: {
    id: number;
    warehouseName: string;
    warehouseAddress: string;
  };
  orderItems: Array<{
    id: number;
    orderId: number;
    itemId: number;
    quantity: number;
    memo: string;
    createdAt: string;
    updatedAt: string;
    item: {
      id: number;
      itemCode: string;
      itemName: string;
      itemQuantity: number;
    };
  }>;
  inventoryRecords: Array<{
    id: number;
    inboundDate: string;
    outboundDate: string;
    inboundLocation: string;
    outboundLocation: string;
    inboundQuantity: number;
    outboundQuantity: number;
    remarks: string;
    supplierId: number;
    packageId: number;
    itemId: number;
    userId: number;
    orderId: number;
    warehouseId: number;
    countryCode: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }>;
  files: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    orderId: number;
  }>;
}
