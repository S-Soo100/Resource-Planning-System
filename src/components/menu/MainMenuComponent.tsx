"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  FaBox,
  FaClipboardList,
  FaTruckLoading,
  // FaWarehouse,
} from "react-icons/fa";
import { MdOutlineInventory } from "react-icons/md";
import { PiNewspaperClippingFill } from "react-icons/pi";
import { authStore } from "@/store/authStore";

const MainMenuComponent = () => {
  const router = useRouter();
  const user = authStore((state) => state.user);

  // 권한 체크 함수
  const checkAdminAccess = (path: string) => {
    // 타이틀에 "관리 -"가 포함된 메뉴는 관리자 권한 필요
    if (!user?.isAdmin) {
      alert("관리자만 해당 기능을 사용할 수 있습니다");
      return;
    }
    router.push(path);
  };

  const menuItems = [
    {
      title: "재고 조회",
      subtitle: "마스터 계정, 직원 계정, 타업체 계정",
      icon: <MdOutlineInventory className="text-3xl" />,
      onClick: () => router.push(`/stock`),
      requireAdmin: false,
    },
    {
      title: "재고 입출고 기록 조회",
      subtitle: "마스터 계정",
      icon: <FaClipboardList className="text-3xl" />,
      onClick: () => router.push(`/ioHistory`),
      requireAdmin: false,
    },
    {
      title: "패키지 출고 요청",
      subtitle: "직원 계정, 타업체 계정",
      icon: <FaTruckLoading className="text-3xl" />,
      onClick: () => router.push(`/orderRequest`),
      requireAdmin: false,
    },
    {
      title: "개별 품목 출고 요청",
      subtitle: "직원 계정, 타업체 계정",
      icon: <FaTruckLoading className="text-3xl" />,
      onClick: () => router.push(`/orderRequest`),
      requireAdmin: false,
    },
    {
      title: "발주 기록 확인",
      subtitle: "마스터 계정, 직원 계정, 타업체 계정",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => router.push(`/orderRecord`),
      requireAdmin: false,
    },
    {
      title: "패키지 관리",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => router.push(`/package`),
      requireAdmin: false,
    },
    {
      title: "업체 관리",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => router.push(`/supplier`),
      requireAdmin: false,
    },
    {
      title: "관리 - 창고별 품목 관리",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAdminAccess(`/items`),
      requireAdmin: true,
    },
    {
      title: "관리 - 전체 품목 관리",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAdminAccess(`/team-items`),
      requireAdmin: true,
    },
    {
      title: "관리 - 팀 관리",
      subtitle: " ",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAdminAccess(`/admin`),
      requireAdmin: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Menu Body */}
      <main className="flex flex-col items-center w-full p-4 space-y-4 pb-6">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`flex items-center w-full max-w-2xl px-8 py-4 transition-all duration-200 bg-white border border-gray-200 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${
              item.requireAdmin && !user?.isAdmin ? "opacity-70" : ""
            }`}
          >
            <div className="flex-col w-full">
              <div className="flex flex-row items-center">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-8 text-white bg-blue-600 rounded-full">
                  {item.icon}
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  {item.title}
                </span>
                {item.requireAdmin && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    관리자 전용
                  </span>
                )}
              </div>
              <span className="block mt-2 ml-20 text-base text-gray-600">
                {item.subtitle}
              </span>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
};

export default MainMenuComponent;
