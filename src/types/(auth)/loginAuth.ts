import { IAuth } from "./auth";

export interface LoginAuth {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: IAuth;
}
