// warehouse(창고)
export interface IWarehouse {
  warehouseId: number; // 창고 id
  warehouseName: string; // 창고 이름
  warehouseAddress: string; // 창고 주소
  teamId: number; // 팀 id (FK)
}
