import { Order } from "../(order)/order";
import { IUserTeam } from "../team";

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
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  restrictedWhs: string;
  accessLevel: "user" | "supplier" | "moderator";
  isAdmin: false;
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
}

export interface WarehouseAccessRequest {
  warehouseIds: string[];
}
