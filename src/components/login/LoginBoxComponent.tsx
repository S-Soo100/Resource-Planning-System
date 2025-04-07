"use client";
import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoginAuth } from "@/types/loginAuth";
// import Cookies from "js-cookie";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
// import { authApi } from "@/api/auth-api";
import { authService } from "@/services/authService";

export default function LoginBoxComponent() {
  const [auth, setAuth] = useState<LoginAuth>({ email: "", password: "" });
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // setLoading(true);
    try {
      const userBool = await authService.login(auth);
      if (userBool) {
        setTimeout(() => {
          router.push("/team-select");
        }, 2000);
      }
    } catch (err) {
      // setError("로그인 중 오류가 발생했습니다.");
      console.error("로그인 에러:", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 min-w-96">
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <User className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">KARS1234</h1>
          <p className="text-gray-600 mb-8">계정에 로그인하세요</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={auth.email}
                onChange={(e) =>
                  setAuth({ email: e.target.value, password: auth.password })
                }
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          placeholder:text-gray-400"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                value={auth.password}
                onChange={(e) =>
                  setAuth({ email: auth.email, password: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  placeholder:text-gray-400"
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg
                      hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      transition-colors duration-200"
          >
            로그인
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
          {/* <div className="text-center text-sm text-gray-600">
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
    </div>
  );
}
