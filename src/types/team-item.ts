export interface TeamItem {
  id: number;
  itemCode: string;
  itemName: string;
  teamId: number;
  memo: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateTeamItemDto {
  itemCode: string;
  itemName: string;
  teamId: number;
  memo?: string;
}
