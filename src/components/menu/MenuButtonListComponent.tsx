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

const MenuButtonListComponent = () => {
  const router = useRouter();

  const menuItems = [
    {
      title: "재고 조회",
      subtitle: "마스터 계정, 직원 계정, 타업체 계정",
      icon: <MdOutlineInventory className="text-3xl" />,
      onClick: () => router.push(`/inventory`),
    },
    {
      title: "품목 조회/수정",
      subtitle: "모든 계정",
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
      onClick: () => router.push(`/orderRecord`),
    },
    {
      title: "관리자 기능",
      subtitle: " ",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => router.push(`/orderRecord`),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Menu Body */}
      <main className="flex flex-col items-center flex-1 p-4 mt-4 space-y-4 justify-top">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex items-center w-full max-w-2xl px-8 py-6 transition-all duration-200 bg-white border border-gray-200 shadow-md rounded-2xl hover:bg-gray-50 hover:shadow-lg"
          >
            <div className="flex-col w-full">
              <div className="flex flex-row items-center">
                <div className="flex-shrink-0 mr-8 text-blue-600">
                  {item.icon}
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  {item.title}
                </span>
              </div>
              <span className="block mt-2 ml-16 text-base text-gray-600">
                {item.subtitle}
              </span>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
};

export default MenuButtonListComponent;
