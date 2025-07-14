import { CreateOrderItemRequest } from "../(order)/order";
import { Item } from "../(item)/item";
import { IUser } from "../(auth)/user";

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
  requester: string; // 나
  handler: string; // 행사 담당자 in 우리팀
  demoManager: string;
  demoManagerPhone: string;
  memo: string;
  // UI 추가 필드들
  demoTitle: string;
  demoNationType: string; // 국내행사 해외행사 구분
  demoAddress: string; // address 와 detailAddress 를 합친 값
  demoPaymentType: string; // 유료 무료
  demoPrice?: number;
  demoPaymentDate?: Date; //결제 예정일
  demoCurrencyUnit: string; // 화폐 단위
  // 행사 물품 보내는 날짜
  demoStartDate: string; // 며칠에 상차 하는지
  demoStartTime: string; // 몇시에 상차 하는지
  demoStartDeliveryMethod: string; // 보내는 방법
  demoEndDate: string; // 며칠에 다시 안산에 받아서 하차 하는지
  demoEndTime: string; // 몇시에 다시 안산에 받아서 하차 하는지
  demoEndDeliveryMethod: string; // 회수 방법
  userId: number; // 나
  warehouseId: number; // 시연품 창고
  demoItems: Item[];
  user: IUser; // 나
  files: File[]; // 첨부된 파일들
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
  demoAddress: string;
  purchaseDate: string;
  outboundDate: string;
  installationDate: string;
  demoManager: string;
  status: DemoStatus;
  memo: string;
  orderItems: CreateOrderItemRequest[];
}
