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

const MainMenuComponent = () => {
  const router = useRouter();

  const menuItems = [
    {
      title: "재고 조회",
      subtitle: "마스터 계정, 직원 계정, 타업체 계정",
      icon: <MdOutlineInventory className="text-3xl" />,
      onClick: () => router.push(`/stock`),
    },
    {
      title: "창고별 품목 관리",
      subtitle: "창고별로 관리하는 품목들이 보이고, 전체품목중에서 추가/삭제",
      icon: <FaBox className="text-3xl" />,
      onClick: () => router.push(`/items`),
    },
    {
      title: "재고 입출고 기록 조회",
      subtitle: "마스터 계정",
      icon: <FaClipboardList className="text-3xl" />,
      onClick: () => router.push(`/ioHistory`),
    },
    {
      title: "발주 요청",
      subtitle: "직원 계정, 타업체 계정",
      icon: <FaTruckLoading className="text-3xl" />,
      onClick: () => router.push(`/orderRequest`),
    },
    {
      title: "발주 기록 확인",
      subtitle: "마스터 계정, 직원 계정, 타업체 계정",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => router.push(`/orderRecord`),
    },
    {
      title: "패키지 관리",
      subtitle: " ",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => router.push(`/package`),
    },

    {
      title: "관리 - 전체 품목 관리",
      subtitle: "모든 품목 목록이 보임",
      icon: <FaBox className="text-3xl" />,
      onClick: () => router.push(`/team-items`),
    },
    {
      title: "관리자 기능",
      subtitle: " ",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => router.push(`/admin`),
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
            className="flex items-center w-full max-w-2xl px-8 py-4 transition-all duration-200 bg-white border border-gray-200 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex-col w-full">
              <div className="flex flex-row items-center">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-8 text-white bg-blue-600 rounded-full">
                  {item.icon}
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  {item.title}
                </span>
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
