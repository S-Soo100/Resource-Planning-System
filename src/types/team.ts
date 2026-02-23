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
  teamName?: string;
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
  // 팀별 권한 필드 (v2.3 - 백엔드 TEAM_ROLE_API)
  accessLevel?: "user" | "moderator" | "admin" | "supplier";
  isAdmin?: boolean;
  restrictedWhs?: string | null;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// 팀별 유효 권한 응답 (v2.3 - 백엔드 TEAM_ROLE_API)
export interface TeamRoleResponse {
  accessLevel: "user" | "moderator" | "admin" | "supplier";
  isAdmin: boolean;
  restrictedWhs: string | null;
}

// 팀별 권한 수정 요청 (v2.3 - 백엔드 TEAM_ROLE_API)
export interface UpdateTeamRoleRequest {
  accessLevel?: "user" | "moderator" | "admin" | "supplier";
  isAdmin?: boolean;
  restrictedWhs?: string;
}

// 창고 접근 권한 응답 (v2.3 - 백엔드 TEAM_ROLE_API)
export interface WarehouseAccessResponse {
  canAccess: boolean;
}
