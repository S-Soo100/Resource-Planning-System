import React from "react";

interface WarehouseCardProps {
  warehouse: {
    id: number;
    warehouseName: string;
    warehouseAddress?: string;
  };
  isSelected: boolean;
  itemCount: number;
  onClick: (warehouseId: number) => void;
}

export default function WarehouseCard({
  warehouse,
  isSelected,
  itemCount,
  onClick,
}: WarehouseCardProps) {
  return (
    <div
      className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-blue-500 text-white ring-2 ring-blue-600 transform scale-105"
          : "bg-white hover:bg-gray-50"
      }`}
      onClick={() => onClick(warehouse.id)}
    >
      <h3
        className={`text-lg font-semibold mb-2 ${
          isSelected ? "text-white" : "text-gray-800"
        }`}
      >
        {warehouse.warehouseName}
      </h3>
      <div
        className={`text-sm ${isSelected ? "text-blue-100" : "text-gray-500"}`}
      >
        {itemCount}개 품목
      </div>
      {warehouse.warehouseAddress && (
        <div
          className={`text-sm mt-1 truncate ${
            isSelected ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {warehouse.warehouseAddress}
        </div>
      )}
    </div>
  );
}
