/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cookies } from "react-cookie";

const cookies = new Cookies();

export const setToken = (value: string, options?: any) => {
  // localStorage와 쿠키 둘 다에 저장
  if (typeof window !== "undefined") {
    localStorage.setItem("token", value);
  }
  return cookies.set("token", value, { ...options });
};

export const getToken = () => {
  // 쿠키 우선, 없으면 localStorage에서 읽기
  const cookieToken = cookies.get("token");
  if (cookieToken) return cookieToken;

  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const refreshToken = () => {
  // localStorage와 쿠키 둘 다에서 제거
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
  return cookies.remove("token");
};
