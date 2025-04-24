import { Order } from "../(order)/order";
import { IUserTeam } from "../team";

export interface IUser {
  id: number;
  email: string;
  name: string;
  restrictedWhs: string | number[];
  accessLevel: string;
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
  accessLevel: "user";
  isAdmin: false;
}

export interface CreateUserResponse {
  id: number;
  email: string;
  name: string;
  restrictedWhs: string;
  accessLevel: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: "admin" | "user";
}

export interface WarehouseAccessRequest {
  warehouseIds: string[];
}
