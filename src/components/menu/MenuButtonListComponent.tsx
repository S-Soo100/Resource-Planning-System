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
      icon: <MdOutlineInventory className="text-2xl" />,
      onClick: () => router.push(`/item?teamId=${teamId}`),
    },
    {
      title: "품목 조회/수정",
      subtitle: "모든 계정",
      icon: <FaBox className="text-2xl" />,
      onClick: () => router.push(`/records?teamId=${teamId}`),
    },
    {
      title: "재고 입출고 기록 조회",
      subtitle: "마스터 계정",
      icon: <FaClipboardList className="text-2xl" />,
      onClick: () => router.push(`/ioHistory?teamId=${teamId}`),
    },
    {
      title: "발주 요청",
      subtitle: "직원 계정, 타업체 계정",
      icon: <FaTruckLoading className="text-2xl" />,
      onClick: () => router.push(`/orderRequest?teamId=${teamId}`),
    },
    {
      title: "발주 기록 확인",
      subtitle: "마스터 계정, 직원 계정, 타업체 계정",
      icon: <PiNewspaperClippingFill className="text-2xl" />,
      onClick: () => router.push(`/orderRecord?teamId=${teamId}`),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Menu Body */}
      <main className="flex-1 flex flex-col items-center justify-top mt-4 space-y-6 p-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex items-center w-full max-w-sm p-4 bg-white shadow rounded-lg hover:bg-gray-100"
          >
            <div className="flex-col">
              <div className="flex-row flex ">
                <div className="flex-shrink-0 text-blue-500 mr-4">
                  {item.icon}
                </div>
                <span className="font-medium text-lg text-gray-800 flex">
                  {item.title}
                </span>
              </div>
              <span className="text-sm mx-10">{item.subtitle}</span>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
};

export default MenuButtonListComponent;
