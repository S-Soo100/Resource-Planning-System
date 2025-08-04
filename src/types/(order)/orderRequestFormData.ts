import { TeamItem } from "../(item)/team-item";
import { Warehouse } from "../warehouse";
import { ApiResponse } from "../common";
import { Item } from "../(item)/item";

export type OrderRequestFormData = {
  title: string; // 제목 필드 추가
  supplierId?: number | null | undefined;
  packageId?: number | null | undefined;
  warehouseId?: number | null | undefined;
  requester: string;
  receiver: string;
  receiverPhone: string;
  address: string;
  detailAddress: string;
  requestDate: string;
  setupDate: string;
  notes: string;
  manager: string;
  demoCost?: string; // 시연 비용
};

export type OrderItemWithDetails = {
  teamItem: TeamItem;
  quantity: number;
  stockAvailable?: boolean;
  stockQuantity?: number;
};

export interface OrderRequestFormProps {
  isPackageOrder?: boolean;
  title?: string;
  warehousesList?: Warehouse[];
  warehouseItems?: { [warehouseId: string]: Item[] };
  onWarehouseChange?: (warehouseId: number) => Promise<ApiResponse>;
}
