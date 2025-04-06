import { IMappingUser } from "./mappingUser";
import { IWarehouse } from "./warehouse";

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  TeamUserMap: IMappingUser[];
  Warehouses: IWarehouse[];
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

export interface TeamResponse {
  success: boolean;
  data?: Team;
  error?: string;
}

export interface TeamsResponse {
  success: boolean;
  data?: Team[];
  error?: string;
}
