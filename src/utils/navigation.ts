import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * 뒤로가기 버튼 클릭 시 메인 메뉴로 이동하는 함수
 */
export const navigateByAuthStatus = (router: AppRouterInstance) => {
  router.push("/menu");
};

/**
 * 현재 사용자의 로그인 상태를 확인하는 함수
 */
export const isUserLoggedIn = (): boolean => {
  return typeof window !== "undefined"
    ? !!localStorage.getItem("token")
    : false;
};
