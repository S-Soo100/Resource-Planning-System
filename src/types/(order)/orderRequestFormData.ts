import { TeamItem } from "../team-item";

export type OrderRequestFormData = {
  supplierId?: number | null | undefined;
  packageId?: number | null | undefined;
  requester: string;
  receiver: string;
  receiverPhone: string;
  address: string;
  detailAddress: string;
  requestDate: string;
  setupDate: string;
  notes: string;
};

export type OrderItemWithDetails = {
  teamItem: TeamItem;
  quantity: number;
};

export interface OrderRequestFormProps {
  isPackageOrder?: boolean;
  title?: string;
}
