import { IOrder } from "./order";
import { ITeam } from "./team";

export interface IUser {
  id: number;
  email: string;
  name: string;
  restrictedWhs: number[];
  accessLevel: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  teams: ITeam[];
  Orders: IOrder[];
}

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   role: "admin" | "user";
//   warehouseAccess: string[];
//   createdAt: string;
//   updatedAt: string;
// }

// export interface UserLogin {
//   email: string;
//   password: string;
// }

// export interface UserLoginResponse {
//   token: string;
//   user: User;
// }

// export interface UserProfile {
//   id: string;
//   email: string;
//   name: string;
//   role: "admin" | "user";
//   warehouseAccess: string[];
// }
