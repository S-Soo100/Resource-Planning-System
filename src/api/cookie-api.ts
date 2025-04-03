/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAuth } from "@/types/auth";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

export const setToken = (value: string, options?: any) => {
  return cookies.set("token", value, { ...options });
};

export const getToken = () => {
  return cookies.get("token");
};

export const refreshToken = () => {
  console.log("Token refreshed");
  return cookies.remove("token");
};

export const setAuthCookie = (value: IAuth, options?: any) => {
  return cookies.set("authCookie", value, { ...options });
};

export const getAuthCookie = () => {
  return cookies.get("authCookie");
};
