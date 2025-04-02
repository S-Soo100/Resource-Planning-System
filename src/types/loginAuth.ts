export interface LoginAuth {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
