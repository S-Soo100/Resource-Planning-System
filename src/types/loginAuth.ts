import { Auth } from "./auth";

export interface LoginAuth {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Auth;
}
