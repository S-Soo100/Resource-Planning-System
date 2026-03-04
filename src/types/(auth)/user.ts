import { Order } from "../(order)/order";
import { IUserTeam } from "../team";

/** @deprecated Supplier 타입의 CustomerType 사용 권장 (E-006) */
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
  /** @deprecated 고객 필드는 Supplier 타입으로 이전됨 (E-006) */
  customerType?: CustomerType | null;
  /** @deprecated 고객 필드는 Supplier 타입으로 이전됨 (E-006) */
  isRecipient?: boolean;
  /** @deprecated 고객 필드는 Supplier 타입으로 이전됨 (E-006) */
  depositorName?: string | null;
  /** @deprecated 고객 필드는 Supplier 타입으로 이전됨 (E-006) */
  residentId?: string | null;
  /** @deprecated 고객 필드는 Supplier 타입으로 이전됨 (E-006) */
  repurchaseCycleMonths?: number | null;
  /** @deprecated 고객 필드는 Supplier 타입으로 이전됨 (E-006) */
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
  /** @deprecated 고객 필드는 Supplier 타입으로 이전됨 (E-006) */
  customerType?: CustomerType | null;
  /** @deprecated */
  isRecipient?: boolean;
  /** @deprecated */
  depositorName?: string | null;
  /** @deprecated */
  residentId?: string | null;
  /** @deprecated */
  repurchaseCycleMonths?: number | null;
}

export interface WarehouseAccessRequest {
  warehouseIds: string[];
}
