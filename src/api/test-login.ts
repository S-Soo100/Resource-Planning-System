import { loginApi } from "./login";

export const testLogin = async () => {
  try {
    console.log("로그인 시도...");
    const response = await loginApi.login({
      email: process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL?.toString() || "",
      password: process.env.NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD?.toString() || "",
    });

    console.log("로그인 응답:", response);

    if (response.success) {
      const token = localStorage.getItem("token");
      console.log("저장된 토큰:", token);

      // 토큰이 있다면 Bearer 토큰 형식으로 출력
      if (token) {
        console.log("Bearer 토큰:", `Bearer ${token}`);
      }
    } else {
      console.log("로그인 실패:", response.error);
    }
  } catch (error) {
    console.log("로그인 중 오류 발생:", error);
  }
};
