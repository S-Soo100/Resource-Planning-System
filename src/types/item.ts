import { ApiResponse } from "./common";

// item(품목)
export interface Item {
  id: number; // 품목 id
  itemCode: string; // 품목 코드
  itemName: string; // 품목 이름
  itemQuantity: number; // 수량
  warehouseId: number; // 창고 id (FK)
  createdAt: string;
  updatedAt: string;
  InventoryRecords?: {
    id: number;
    inboundDate: string;
    outboundDate: string;
    inboundQuantity: number;
    outboundQuantity: number;
  }[];
}

// 현재 앱에서는 이 인터페이스가 아닌 아래쪽에 정의된 CreateItemRequest를 사용하고 있습니다.
// export interface CreateItemRequest {
//   itemCode: string;
//   itemName: string;
//   itemQuantity: number;
//   warehouseId: number;
// }

export const dummyItemResponse: Item[] = [
  {
    id: 0,
    itemCode: "RX-0",
    itemName: "Unicorn Gundam",
    itemQuantity: 3,
    warehouseId: 0,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-02T00:00:00.000Z",
  },
  {
    id: 1,
    itemCode: "MS-06S",
    itemName: "휠리엑스 트레드밀",
    itemQuantity: 2,
    warehouseId: 0,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-02T00:00:00.000Z",
  },
  {
    id: 2,
    itemCode: "MS-06F",
    itemName: "휠리 허브 유선",
    itemQuantity: 12,
    warehouseId: 0,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-02T00:00:00.000Z",
  },
  {
    id: 3,
    itemCode: "RX-78",
    itemName: "First Gundam",
    itemQuantity: 3,
    warehouseId: 0,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-02T00:00:00.000Z",
  },
  {
    id: 4,
    itemCode: "RX-78-2",
    itemName: "휠리 허브 무선",
    itemQuantity: 323,
    warehouseId: 0,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-02T00:00:00.000Z",
  },
];

// export interface Item {
//   id: string;
//   name: string;
//   description: string;
//   sku: string;
//   warehouseId: string;
//   quantity: number;
//   minimumQuantity: number;
//   category: string;
//   unit: string;
//   price: number;
//   createdAt: string;
//   updatedAt: string;
// }

// 프론트엔드에서 사용할 형식
export interface CreateItemRequest {
  name: string; // itemName과 동일
  description: string;
  sku: string; // itemCode와 동일
  warehouseId: number; // warehouseId와 동일
  quantity: number; // itemQuantity와 동일
  minimumQuantity: number;
  category: string;
  unit: string;
  price: number;
}

// API 요청 시 사용할 형식
export interface CreateItemApiRequest {
  itemName: string;
  itemCode: string;
  itemQuantity: number;
  warehouseId: number;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  sku?: string;
  warehouseId?: string;
  minimumQuantity?: number;
  category?: string;
  unit?: string;
  price?: number;
}

export interface UpdateItemQuantityRequest {
  quantity: number;
  // reason: string;
}

export interface ItemResponse extends ApiResponse {
  data?: Item;
}

export interface ItemsResponse extends ApiResponse {
  data?: Item[];
}

export interface ItemsByWarehouseResponse extends ApiResponse {
  data?: {
    warehouseId: string;
    items: Item[];
  };
}
