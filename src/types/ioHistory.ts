// io-history(입출고 기록)
export interface IIoHistory {
  ioId: number; // 입출고 id
  inboundDate: Date | string | null; // 입고일자
  outboundDate: Date | string | null; // 출고일자
  outboundLocation: string; // 출고처
  inboundLocation: string; // 입고처
  inboundQuantity: number; // 입고 수량
  outboundQuantity: number; // 출고 수량
  remarks?: string; // 비고
  warehouseId: number; // 창고 id (FK)
  packageId: number; // 패키지 id (FK)
  supplierId: number; // 구매처 id (FK)
  itemId: number; // 품목 id (FK)
  userId: number; // user id (FK)
}

export const dummyIoHistoryResponse: IIoHistory[] = [
  {
    ioId: 1,
    inboundDate: "2024-01-10",
    outboundDate: "2024-01-15",
    inboundLocation: "서울 창고",
    outboundLocation: "부산 물류센터",
    inboundQuantity: 100,
    outboundQuantity: 50,
    remarks: "부분 출고",
    warehouseId: 1,
    packageId: 101,
    supplierId: 201,
    itemId: 301,
    userId: 401,
  },
  {
    ioId: 2,
    inboundDate: "2024-02-05",
    outboundDate: null,
    inboundLocation: "인천 창고",
    outboundLocation: "",
    inboundQuantity: 200,
    outboundQuantity: 0,
    remarks: "미출고 상태",
    warehouseId: 2,
    packageId: 102,
    supplierId: 202,
    itemId: 302,
    userId: 402,
  },
  {
    ioId: 3,
    inboundDate: "2023-12-20",
    outboundDate: "2024-01-05",
    inboundLocation: "대전 창고",
    outboundLocation: "광주 물류센터",
    inboundQuantity: 150,
    outboundQuantity: 150,
    remarks: "완전 출고",
    warehouseId: 3,
    packageId: 103,
    supplierId: 203,
    itemId: 303,
    userId: 403,
  },
  // 나머지 17개 데이터
  ...Array.from({ length: 17 }, (_, i) => ({
    ioId: i + 4,
    inboundDate: `2024-0${(i % 3) + 1}-${(i % 28) + 1}`,
    outboundDate:
      Math.random() > 0.5 ? `2024-0${(i % 3) + 1}-${(i % 28) + 5}` : null,
    inboundLocation: ["서울 창고", "부산 창고", "대구 창고"][i % 3],
    outboundLocation: ["부산 물류센터", "대전 물류센터", "광주 물류센터"][
      i % 3
    ],
    inboundQuantity: Math.floor(Math.random() * 500) + 50,
    outboundQuantity: Math.random() > 0.5 ? Math.floor(Math.random() * 300) : 0,
    remarks: Math.random() > 0.7 ? "특이사항 없음" : undefined,
    warehouseId: (i % 5) + 1,
    packageId: 100 + i,
    supplierId: 200 + i,
    itemId: 300 + i,
    userId: 400 + i,
  })),
];
