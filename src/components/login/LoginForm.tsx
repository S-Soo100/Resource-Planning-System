"use client";
import React, { useState } from "react";
import { Mail, Lock, User, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoginAuth } from "@/types/(auth)/loginAuth";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { authService } from "@/services/authService";
import { Button, Input } from "@/components/ui";
import { APP_VERSION } from "@/constants/version";
import Link from "next/link";

export default function LoginForm() {
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

          <Input
            id="email"
            type="email"
            label="이메일"
            value={auth.email}
            onChange={(e) =>
              setAuth({ email: e.target.value, password: auth.password })
            }
            leftIcon={<Mail className="w-5 h-5" />}
            placeholder="name@example.com"
            required
          />

          <Input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            label="비밀번호"
            value={auth.password}
            onChange={(e) =>
              setAuth({ email: auth.email, password: e.target.value })
            }
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-600 hover:text-gray-800"
              >
                {isPasswordVisible ? (
                  <FaEye className="w-4 h-4" />
                ) : (
                  <FaRegEyeSlash className="w-4 h-4" />
                )}
              </button>
            }
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            로그인
          </Button>
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
          <div className="text-center">
            <Link
              href="/update"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              v{APP_VERSION}
            </Link>
          </div>
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
