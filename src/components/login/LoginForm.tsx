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
import { IAuth } from "@/types/(auth)/auth";
import { authStore } from "@/store/authStore";
import { motion } from "framer-motion";

interface LoginFormProps {
  onLoginSuccess?: (userData: IAuth) => void;
  redirectUrl?: string;
  teamId?: string;
  isModal?: boolean;
  notice?: React.ReactNode;
}

export default function LoginForm({
  onLoginSuccess,
  isModal = false,
  notice,
}: LoginFormProps = {}) {
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
        // 모달에서 로그인한 경우 onLoginSuccess 콜백 호출
        if (isModal && onLoginSuccess) {
          // authStore에서 사용자 정보를 가져와서 콜백 호출
          const userData = authStore.getState().user;
          if (userData) {
            onLoginSuccess(userData);
          }
          // 모달에서는 로딩 상태를 유지하지 않음
        } else {
          // 일반 로그인 플로우
          setTimeout(() => {
            router.push("/team-select");
          }, 2000);
        }
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 mx-4 bg-white shadow-lg rounded-xl"
      >
        {notice}
        <div className="text-center">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
          >
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
              }}
              transition={{
                duration: 0.5,
                delay: 0.8,
                ease: "easeInOut"
              }}
            >
              <User className="w-12 h-12 text-blue-600" />
            </motion.div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-2 text-2xl font-bold text-gray-900"
          >
            KARS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mb-8 text-gray-600"
          >
            캥스터즈 자동 재고관리 시스템
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10, x: -5 }}
              animate={{
                opacity: 1,
                y: 0,
                x: [0, -5, 5, -5, 5, 0]
              }}
              transition={{
                opacity: { duration: 0.2 },
                y: { duration: 0.2 },
                x: { duration: 0.4, delay: 0.2 }
              }}
              className="p-3 text-sm text-red-700 bg-red-100 rounded-lg"
            >
              {loginError}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
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
                <motion.button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-600 hover:text-gray-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPasswordVisible ? (
                    <FaEye className="w-4 h-4" />
                  ) : (
                    <FaRegEyeSlash className="w-4 h-4" />
                  )}
                </motion.button>
              }
              placeholder="••••••••"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
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
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-6 space-y-4"
        >
          <div className="text-center">
            <motion.a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              비밀번호를 잊으셨나요?
            </motion.a>
          </div>
          <div className="text-center">
            <Link
              href="/update"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              v{APP_VERSION}
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{
              scale: [0.8, 1, 0.9, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              scale: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              },
              rotate: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            className="p-5 bg-white rounded-full"
          >
            <Loader className="w-8 h-8 text-blue-600" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
