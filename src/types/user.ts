// user
export interface IUser {
  userId: number; // user id
  userAuth: number; // 유저 권한
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  warehouseAccess: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  token: string;
  user: User;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  warehouseAccess: string[];
}
