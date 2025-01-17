"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaBox, FaClipboardList, FaWarehouse } from "react-icons/fa";
const MenuComponent = () => {
  const router = useRouter();

  const menuItems = [
    {
      title: "재고 조회",
      icon: <FaBox className="text-2xl" />,
      onClick: () => router.push("/inventory"),
    },
    {
      title: "발주 요청",
      icon: <FaClipboardList className="text-2xl" />,
      onClick: () => router.push("/order-request"),
    },
    {
      title: "입출고 기록 조회",
      icon: <FaWarehouse className="text-2xl" />,
      onClick: () => router.push("/records"),
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
            <div className="flex-shrink-0 text-blue-500 mr-4">{item.icon}</div>
            <span className="font-medium text-lg text-gray-800">
              {item.title}
            </span>
          </button>
        ))}
      </main>
    </div>
  );
};

export default MenuComponent;
