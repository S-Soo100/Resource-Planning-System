"use client";
import React, { useState } from "react";
import { Mail, Lock, User, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoginAuth } from "@/types/(auth)/loginAuth";
// import Cookies from "js-cookie";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
// import { authApi } from "@/api/auth-api";
import { authService } from "@/services/authService";

export default function LoginBoxComponent() {
  const [auth, setAuth] = useState<LoginAuth>({ email: "", password: "" });
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      const userBool = await authService.login(auth);
      if (userBool) {
        setTimeout(() => {
          router.push("/team-select");
        }, 2000);
      } else {
        setLoginError(
          "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
        );
        setIsLoading(false);
      }
    } catch (err) {
      setLoginError("로그인 중 오류가 발생했습니다.");
      console.error("로그인 에러:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen bg-gray-50 min-w-96">
      <div className="w-full max-w-md p-8 mx-4 bg-white shadow-lg rounded-xl">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">KARS</h1>
          <p className="mb-8 text-gray-600">캥스터즈 자동 재고관리 시스템</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {loginError && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {loginError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="email"
                type="email"
                value={auth.email}
                onChange={(e) =>
                  setAuth({ email: e.target.value, password: auth.password })
                }
                className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                value={auth.password}
                onChange={(e) =>
                  setAuth({ email: auth.email, password: e.target.value })
                }
                className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button type="button" onClick={togglePasswordVisibility}>
                  <div className="text-black">
                    {isPasswordVisible ? (
                      <FaEye onClick={togglePasswordVisibility} />
                    ) : (
                      <FaRegEyeSlash onClick={togglePasswordVisibility} />
                    )}
                  </div>
                </button>
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              비밀번호를 잊으셨나요?
            </a>
          </div>
          {/* <div className="text-sm text-center text-gray-600">
            계정이 없으신가요?{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              회원가입
            </a>
          </div> */}
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="p-5 bg-white rounded-full">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
