import { ApiResponse } from "../common";
import { InventoryRecord } from "../(inventoryRecord)/inventory-record";

export interface OrderResponse extends ApiResponse {
  data?: Order;
}

export interface OrdersResponse extends ApiResponse {
  data?: Order[];
}

export interface Order {
  id: number;
  title: string; //! 신규 추가한 필드!!
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
  totalPrice?: number | null; // 주문 총 판매가격
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
  itemId: number;
  quantity: number;
  memo: string;
  sellingPrice?: number | null; // 주문 품목 판매가
  vat?: number | null; // 주문 품목 세금 (부가세)
  item: {
    id: number;
    itemQuantity: number;
    teamItem: {
      id: number;
      itemCode: string;
      itemName: string;
      memo: string;
      costPrice?: number | null; // 품목 원가
    };
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
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
  title: string; // 제목 필드 추가
  supplierId: number; // 필수 필드 (거래처 필터링용)
  packageId: number | null;
  warehouseId: number;
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
  totalPrice?: number; // 주문 총 판매가격 (선택)
  orderItems: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  itemId: number;
  quantity: number;
  memo: string;
  sellingPrice?: number; // 주문 품목 판매가 (선택)
  vat?: number; // 주문 품목 세금 (선택)
}

export interface UpdateOrderDto {
  title?: string; // 제목 필드 추가
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
  totalPrice?: number; // 주문 총 판매가격 (선택)
  orderItems?: CreateOrderItemRequest[];
}

export interface UpdateOrderStatusDto {
  status: string;
}

// 발주 상세 정보 수정 DTO (고객 정보 등)
export interface UpdateOrderDetailsDto {
  totalPrice?: number;
  orderItems?: Array<{
    itemId: number;
    sellingPrice: number;
    vat?: number;
  }>;
  supplierId?: number;
}

export interface CreatOrderResponse {
  id: number;
  title: string; // 제목 필드 추가
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
  totalPrice?: number | null; // 주문 총 판매가격
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
    sellingPrice?: number | null; // 주문 품목 판매가
    createdAt: string;
    updatedAt: string;
    item: {
      id: number;
      itemCode: string;
      itemName: string;
      itemQuantity: number;
      costPrice?: number | null; // 품목 원가
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
