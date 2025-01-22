"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { IoLogOutOutline } from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AppBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logout = () => {
    Cookies.remove("token");
    router.push("/signin");
  };

  const renderLeftContent = () => {
    if (pathname === "/" || pathname === "/menu") {
      return (
        <div className="flex items-center space-x-2">
          <div className="bg-gray-200 rounded-full p-2">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <span className="font-medium">자동차왕 헨리 초이</span>
        </div>
      );
    } else if (pathname !== "/signin") {
      return (
        <button
          onClick={() => router.back()}
          className="text-white bg-gray-700 px-3 py-1 rounded-full"
        >
          뒤로가기
        </button>
      );
    }
    return null;
  };

  const renderRightContent = () => {
    if (pathname === "/" || pathname === "/menu") {
      return (
        <div className="bg-slate-700 rounded-full p-2">
          <IoLogOutOutline className="text-white text-2xl" onClick={logout} />
        </div>
      );
    } else if (pathname !== "/signin") {
      return (
        <div className="relative">
          <div
            className="bg-gray-200 rounded-full p-2 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <User className="h-6 w-6 text-blue-600" />
          </div>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md">
              <ul className="py-2">
                <li
                  className="text-black px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {}}
                >
                  메뉴 1
                </li>
                <li
                  className="text-black px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {}}
                >
                  메뉴 2
                </li>
                <li
                  className="text-black px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {}}
                >
                  메뉴 3
                </li>
                <li
                  className="text-black px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={logout}
                >
                  로그아웃
                </li>
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between bg-gray-800 text-white p-4">
      {renderLeftContent()}
      {renderRightContent()}
    </div>
  );
}
