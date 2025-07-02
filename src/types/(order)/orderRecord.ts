import { OrderItem, OrderFile } from "../(order)/order";
import { OrderComment } from "./orderComment";

export interface IOrderRecord {
  id: number;
  userId: number;
  supplierId: number;
  packageId: number;
  warehouseId: number; // 창고 ID 추가
  requester: string; // 이전의 orderer
  receiver: string; // 이전의 recipient
  receiverPhone: string; // 이전의 recipientPhone
  receiverAddress: string; // 이전의 address
  purchaseDate: string;
  outboundDate: string;
  installationDate: string;
  manager: string;
  status: string;
  memo: string; // 이전의 additionalItems
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  supplier?: {
    id: number;
    supplierName: string;
    supplierPhoneNumber: string;
  };
  package?: {
    id: number;
    packageName: string;
    itemlist: string[];
  };
  warehouse?: {
    id: number;
    warehouseName: string;
  };
  orderItems?: OrderItem[];
  files?: OrderFile[];
  comments?: OrderComment[];
}
