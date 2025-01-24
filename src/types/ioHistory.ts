// io-history(입출고 기록)
export interface IIoHistory {
  ioId: number; // 입출고 id
  inboundDate: Date | string; // 입고일자
  outboundDate: Date | string; // 출고일자
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
