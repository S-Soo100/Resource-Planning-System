import { IMappingUser } from "./mappingUser";
import { TeamWarehouse } from "./warehouse";

export interface IUserTeam {
  id: number;
  teamName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  teamName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  teamUserMap: IMappingUser[];
  warehouses: TeamWarehouse[];
  mainWarehouseId: number;
  package?: { id: number; packageName: string }[];
  suppliers?: {
    id: number;
    supplierName: string;
    supplierAddress: string;
    supplierPhoneNumber: string;
  }[];
  // 회사 정보 필드 (v2.2)
  companyName?: string;
  businessRegistrationNumber?: string;
  representativeName?: string;
  businessAddress?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CreateTeamRequest {
  teamName: string;
  // description?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  // 회사 정보 필드 (v2.2)
  companyName?: string;
  businessRegistrationNumber?: string;
  representativeName?: string;
  businessAddress?: string;
  email?: string;
  phoneNumber?: string;
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
