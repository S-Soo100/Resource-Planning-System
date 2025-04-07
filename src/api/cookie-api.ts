/* eslint-disable @typescript-eslint/no-explicit-any */
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
