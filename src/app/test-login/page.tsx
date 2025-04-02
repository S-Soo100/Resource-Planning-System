"use client";

import { useState } from "react";
import { loginApi } from "@/api/login";

export default function TestLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleTestLogin = async () => {
    try {
      console.log("로그인 시도...");
      const response = await loginApi.login({
        email,
        password,
      });

      console.log("로그인 응답:", response);

      if (response.success) {
        const token = localStorage.getItem("token");
        console.log("저장된 토큰:", token);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">로그인 테스트</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
        </div>

        <button
          onClick={handleTestLogin}
          className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          로그인 테스트 실행
        </button>

        <p className="mt-4 text-sm text-gray-600">
          콘솔을 열어서 로그인 결과를 확인해주세요.
        </p>
      </div>
    </div>
  );
}
