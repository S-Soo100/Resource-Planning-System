import { InventoryRecord } from "../(inventoryRecord)/inventory-record";
import {
  CreateOrderItemRequest,
  OrderFile,
  OrderItem,
  OrderPackage,
  OrderSupplier,
  OrderUser,
  OrderWarehouse,
} from "../(order)/order";

export enum DemoStatus {
  //! 주문 데모 상태
  //! enum의 key와 서버에 주고받는 string의 뜻이 다르다.
  requested = "requested", // 요청 (초기 상태)
  approved = "approved", // 승인 (1차승인권자)
  rejected = "rejected", // 반려 (1차승인권자)
  confirmedByShipper = "confirmedByShipper", // 시연팀 확인 완료
  demoShipmentCompleted = "shipmentCompleted", // 시연 출고 완료
  demoCompletedAndReturned = "rejectedByShipper", // 시연 복귀 완료
}

export interface Demo {
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
  status: DemoStatus;
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

export interface DemoResponse {
  success: boolean;
  data: Demo[];
}

export interface CreateDemoDto {
  userId: number;
  supplierId: number;
  packageId: number;
  warehouseId: number;
  requester: string;
  receiver: string;
  receiverPhone: string;
  receiverAddress: string;
  purchaseDate: string;
  outboundDate: string;
  installationDate: string;
  manager: string;
  status: DemoStatus;
  memo: string;
  orderItems: CreateOrderItemRequest[];
}
