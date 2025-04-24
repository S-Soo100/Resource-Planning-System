import { IMappingUser } from "./mappingUser";
import { TeamWarehouse } from "./warehouse";

export interface IUserTeam {
  id: number;
  teamName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  teamName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  teamUserMap: IMappingUser[];
  warehouses: TeamWarehouse[];
}

export interface CreateTeamRequest {
  teamName: string;
  // description?: string;
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

export interface UserTeamMapping {
  id: number;
  mapping_id: string;
  userId: number;
  teamId: number;
  user: {
    id: number;
    email: string;
    name: string;
  };
}
