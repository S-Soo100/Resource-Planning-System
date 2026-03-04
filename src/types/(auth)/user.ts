import { Order } from "../(order)/order";
import { IUserTeam } from "../team";

export type CustomerType = "b2c" | "b2b";

export interface IUser {
  id: number;
  email: string;
  name: string;
  restrictedWhs: string | number[];
  accessLevel: "user" | "admin" | "supplier" | "moderator";
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  teams?: IUserTeam[];
  orders?: Order[];
  // 고객관리 필드 (v2.5)
  customerType?: CustomerType | null;
  isRecipient?: boolean;
  depositorName?: string | null;
  residentId?: string | null;
  repurchaseCycleMonths?: number | null;
  repurchaseDueDate?: string | null;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  restrictedWhs: string;
  accessLevel: "user" | "supplier" | "moderator" | "admin";
  isAdmin: boolean;
}

export interface CreateUserResponse {
  id: number;
  email: string;
  name: string;
  restrictedWhs: string;
  accessLevel: "user" | "admin" | "supplier" | "moderator";
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  restrictedWhs?: string;
  accessLevel?: "user" | "admin" | "supplier" | "moderator";
  isAdmin?: boolean;
  password?: string;
  // 고객관리 필드 (v2.5)
  customerType?: CustomerType | null;
  isRecipient?: boolean;
  depositorName?: string | null;
  residentId?: string | null;
  repurchaseCycleMonths?: number | null;
}

export interface WarehouseAccessRequest {
  warehouseIds: string[];
}
