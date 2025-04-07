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

interface MenuButtonListComponentProps {
  teamId: string;
}

const MenuButtonListComponent: React.FC<MenuButtonListComponentProps> = ({
  teamId,
}) => {
  const router = useRouter();

  const menuItems = [
    {
      title: "재고 조회",
      subtitle: "마스터 계정, 직원 계정, 타업체 계정",
      icon: <MdOutlineInventory className="text-3xl" />,
      onClick: () => router.push(`/item?teamId=${teamId}`),
    },
    {
      title: "품목 조회/수정",
      subtitle: "모든 계정",
      icon: <FaBox className="text-3xl" />,
      onClick: () => router.push(`/records?teamId=${teamId}`),
    },
    {
      title: "재고 입출고 기록 조회",
      subtitle: "마스터 계정",
      icon: <FaClipboardList className="text-3xl" />,
      onClick: () => router.push(`/ioHistory?teamId=${teamId}`),
    },
    {
      title: "발주 요청",
      subtitle: "직원 계정, 타업체 계정",
      icon: <FaTruckLoading className="text-3xl" />,
      onClick: () => router.push(`/orderRequest?teamId=${teamId}`),
    },
    {
      title: "발주 기록 확인",
      subtitle: "마스터 계정, 직원 계정, 타업체 계정",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => router.push(`/orderRecord?teamId=${teamId}`),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Menu Body */}
      <main className="flex-1 flex flex-col items-center justify-top mt-4 space-y-4 p-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex items-center w-full max-w-2xl px-8 py-6 bg-white shadow-md rounded-2xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:shadow-lg"
          >
            <div className="flex-col w-full">
              <div className="flex-row flex items-center">
                <div className="flex-shrink-0 text-blue-600 mr-8">
                  {item.icon}
                </div>
                <span className="font-semibold text-xl text-gray-900">
                  {item.title}
                </span>
              </div>
              <span className="text-base text-gray-600 ml-16 mt-2 block">
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
