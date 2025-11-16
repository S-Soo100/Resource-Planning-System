import { CreateOrderItemRequest } from "../(order)/order";
import { Item } from "../(item)/item";

export enum DemoStatus {
  requested = "requested", // 요청
  approved = "approved", // 승인
  rejected = "rejected", // 반려
  confirmedByShipper = "confirmedByShipper", // 출고자 확인
  shipmentCompleted = "shipmentCompleted", // 출고 완료
  rejectedByShipper = "rejectedByShipper", // 출고자 반려
  demoCompleted = "demoCompleted", //X 시연 종료
}

export interface Demo {
  id: number;
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
  user: {
    id: number;
    email: string;
    name: string;
    accessLevel: string;
    isAdmin: boolean;
    teamUserMap: Array<{
      id: number;
      userId: number;
      teamId: number;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  files: File[]; // 첨부된 파일들
  createdAt: string;
  updatedAt: string;
  demoStatus: string;
  // approvalStatus: string;
  // approvedBy: number | null;
  // approvedAt: string | null;
}

export interface DemoArrayResponse {
  success: boolean;
  data: DemoResponse[];
}

export interface DemoDetailResponse {
  success: boolean;
  data: DemoResponse;
}

export interface DemoResponse {
  id: number;
  requester: string;
  handler: string;
  demoManager: string;
  demoManagerPhone: string;
  memo: string;
  demoTitle: string;
  demoNationType: string;
  demoPaymentType: string;
  demoPrice?: number;
  demoPaymentDate?: string;
  demoAddress: string;
  demoStartDate: string;
  demoStartTime: string;
  demoEndDate: string;
  demoEndTime: string;
  demoStartDeliveryMethod: string;
  demoEndDeliveryMethod: string;
  userId: number;
  warehouseId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  demoStatus: string;
  // approvalStatus: string;
  // approvedBy: number | null;
  // approvedAt: string | null;
  user: {
    id: number;
    email: string;
    name: string;
    accessLevel: string;
    isAdmin: boolean;
    teamUserMap: Array<{
      id: number;
      userId: number;
      teamId: number;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    }>;
  };
  warehouse: {
    id: number;
    warehouseName: string;
    warehouseAddress: string;
    teamId: number;
  };
  demoItems: Array<{
    id: number;
    itemId: number;
    quantity: number;
    memo: string;
    item: {
      id: number;
      itemQuantity: number;
      teamItem: {
        id: number;
        itemCode: string;
        itemName: string;
        memo: string;
        imageUrl?: string | null;
      };
    };
  }>;
  files: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
  }>;
  comments: Array<{
    id: number;
    demoId: number;
    userId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      name: string;
    };
  }>;
  approvalHistory: Array<{
    id: number;
    demoId: number;
    approvedBy: number;
    status: string;
    memo: string;
    previousStatus: string;
    approvedAt: string;
    user: {
      id: number;
      name: string;
    };
  }>;
  inventoryRecord: Array<{
    id: number;
    inboundDate: string;
    outboundDate: string;
    inboundQuantity: number;
    outboundQuantity: number;
  }>;
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

// 서버가 기대하는 시연 생성 요청 데이터 타입
export interface CreateDemoRequest {
  requester: string;
  handler: string;
  demoManager: string;
  demoManagerPhone: string;
  memo: string;
  demoTitle: string;
  demoNationType: string;
  demoAddress: string;
  demoPaymentType: string;
  demoPrice?: number;
  demoPaymentDate?: string;
  demoStartDate: string;
  demoStartTime: string;
  demoStartDeliveryMethod: string;
  demoEndDate: string;
  demoEndTime: string;
  demoEndDeliveryMethod: string;
  userId: number;
  warehouseId: number;
  demoItems: Array<{
    itemId: number;
    quantity: number;
    memo: string;
  }>;
}

// 폼에서 사용할 데이터 타입 (주소 필드 포함)
export interface DemonstrationFormData {
  requester: string; // 신청자 (현재 로그인한 사용자)
  handler: string; // 사내 담당자 (행사 담당자)
  demoManager: string; // 시연기관 담당자 (현지 담당자)
  demoManagerPhone: string; // 시연기관 담당자 연락처
  memo: string; // 특이사항 (시연 관련 메모)
  demoTitle: string; // 시연/행사 명
  demoNationType: string; // 국내/해외 시연 구분
  demoAddress: string; // 시연품 배송장소 (주소 + 상세주소 결합)
  demoPaymentType: string; // 결제 유형 (무료/유료)
  demoPrice?: number; // 시연 비용 (VAT 포함, 유료 시에만)
  demoPaymentDate?: string; // 결제 예정일 (유료 시에만)
  demoCurrencyUnit: string; // 화폐 단위 (KRW, USD, EUR 등)
  demoStartDate: string; // 시연품 상차 일자
  demoStartTime: string; // 시연품 상차 시간
  demoStartDeliveryMethod: string; // 상차 배송 방법 (직접배송, 택배, 용차 등)
  demoEndDate: string; // 시연품 회수일
  demoEndTime: string; // 시연품 회수 시간
  demoEndDeliveryMethod: string; // 회수 방법 (직접회수, 택배, 용차 등)
  userId: number; // 신청자 ID (현재 로그인한 사용자 ID)
  warehouseId: number; // 시연품 창고 ID
  // 주소 관련 필드 (기존 호환성을 위해 유지)
  address: string; // 기본 주소 (주소 검색 API 결과)
  detailAddress: string; // 상세 주소 (사용자 입력)
}

// 시연 수정 요청 데이터 타입 (백엔드 API 스펙에 맞춤)
export interface PatchDemoRequest {
  handler?: string;
  demoManager?: string;
  demoManagerPhone?: string;
  memo?: string;
  demoTitle?: string;
  demoNationType?: string;
  demoPaymentType?: string;
  demoPrice?: number;
  demoPaymentDate?: string; // Date가 아닌 string으로 받음
  demoAddress?: string;
  demoStartDate?: string;
  demoStartTime?: string;
  demoEndDate?: string;
  demoEndTime?: string;
  demoStartDeliveryMethod?: string;
  demoEndDeliveryMethod?: string;
  warehouseId?: number;
  demoItems?: Array<{
    itemId: number;
    quantity: number;
    memo: string;
  }>;
}
