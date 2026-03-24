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
  totalPrice?: string; // 주문 총 판매가격 (입력은 문자열로)
};

export type OrderItemWithDetails = {
  teamItem: TeamItem;
  quantity: number;
  stockAvailable?: boolean;
  stockQuantity?: number;
  memo?: string; // 품목별 개별 메모

  // 🆕 v2.6.0: 총액 입력 방식
  totalPrice?: string; // 사용자 입력 (총 금액: 공급가액 + VAT)
  isZeroRated?: boolean; // 개별 영세율 체크 여부

  // 자동 계산되는 필드 (백엔드 전송용)
  sellingPrice?: string; // 주문 품목 판매가 (공급가액, 자동 계산)
  vat?: string; // 주문 품목 세금 (부가세, 자동 계산)

  // v4.0: 시리얼코드
  serialCode1?: string;
  serialCode2?: string;
  serialCode3?: string;
};

export interface OrderRequestFormProps {
  isPackageOrder?: boolean;
  title?: string;
  warehousesList?: Warehouse[];
  warehouseItems?: { [warehouseId: string]: Item[] };
  onWarehouseChange?: (warehouseId: number) => Promise<ApiResponse>;
}
