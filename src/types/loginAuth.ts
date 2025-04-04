import { IAuth } from "./auth";

export interface LoginAuth {
  email: string;
  password: string;
}

export interface LoginResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // data: any;
  token: string;
  user: IAuth;
}
