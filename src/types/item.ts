// item(품목)
export interface Iitem {
  key: React.Key;
  itemId: number; // 품목 id
  itemCode: string; // 품목 코드
  itemName: string; // 품목 이름
  itemQuantity: number; // 수량
  warehouseId: number; // 창고 id (FK)
}

export const inventoryDummyData: Iitem[] = [
  {
    key: "0",
    itemId: 0,
    itemCode: "RX-0",
    itemName: "Unicorn Gundam",
    itemQuantity: 3,
    warehouseId: 0,
  },
  {
    key: "1",
    itemId: 1,
    itemCode: "MS-06S",
    itemName: "휠리엑스 트레드밀",
    itemQuantity: 2,
    warehouseId: 0,
  },
  {
    key: "2",
    itemId: 2,
    itemCode: "MS-06F",
    itemName: "휠리 허브 유선",
    itemQuantity: 12,
    warehouseId: 0,
  },
  {
    key: "3",
    itemId: 3,
    itemCode: "RX-78",
    itemName: "First Gundam",
    itemQuantity: 3,
    warehouseId: 0,
  },
  {
    key: "4",
    itemId: 4,
    itemCode: "RX-78-2",
    itemName: "휠리 허브 무선",
    itemQuantity: 323,
    warehouseId: 0,
  },
];
