// item(품목)
export interface IItem {
  itemId: number; // 품목 id
  itemCode: string; // 품목 코드
  itemName: string; // 품목 이름
  itemQuantity: number; // 수량
  warehouseId: number; // 창고 id (FK)
}
