"use client";
import React from "react";
import { Truck, Plane, Ship, Package, Car } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DeliveryMethodSelectorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  type?: "delivery" | "pickup"; // delivery: 배송, pickup: 회수
}

const deliveryOptions = [
  {
    value: "직접배송",
    label: "직접배송",
    icon: Car,
    description: "직접 운송",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    selectedColor: "bg-blue-500 text-white border-blue-500",
  },
  {
    value: "택배",
    label: "택배",
    icon: Package,
    description: "택배 서비스",
    color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    selectedColor: "bg-green-500 text-white border-green-500",
  },
  {
    value: "용차",
    label: "용차",
    icon: Truck,
    description: "전용 차량",
    color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    selectedColor: "bg-orange-500 text-white border-orange-500",
  },
  {
    value: "항공",
    label: "항공",
    icon: Plane,
    description: "항공 운송",
    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    selectedColor: "bg-purple-500 text-white border-purple-500",
  },
  {
    value: "해운",
    label: "해운",
    icon: Ship,
    description: "해상 운송",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
    selectedColor: "bg-cyan-500 text-white border-cyan-500",
  },
];

const pickupOptions = [
  {
    value: "직접회수",
    label: "직접회수",
    icon: Car,
    description: "직접 회수",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    selectedColor: "bg-blue-500 text-white border-blue-500",
  },
  {
    value: "택배",
    label: "택배",
    icon: Package,
    description: "택배 회수",
    color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    selectedColor: "bg-green-500 text-white border-green-500",
  },
  {
    value: "용차",
    label: "용차",
    icon: Truck,
    description: "전용 차량",
    color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    selectedColor: "bg-orange-500 text-white border-orange-500",
  },
  {
    value: "항공",
    label: "항공",
    icon: Plane,
    description: "항공 회수",
    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    selectedColor: "bg-purple-500 text-white border-purple-500",
  },
  {
    value: "해운",
    label: "해운",
    icon: Ship,
    description: "해상 회수",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
    selectedColor: "bg-cyan-500 text-white border-cyan-500",
  },
];

const DeliveryMethodSelector: React.FC<DeliveryMethodSelectorProps> = ({
  label,
  value,
  onChange,
  placeholder = "배송 방법을 선택하세요",
  error,
  helperText,
  disabled = false,
  className,
  type = "delivery",
}) => {
  const options = type === "delivery" ? deliveryOptions : pickupOptions;

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-5">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange?.(option.value)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center p-2 rounded-md border transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected ? option.selectedColor : option.color,
                !isSelected && !disabled && "hover:scale-102"
              )}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {!value && <p className="text-sm text-gray-500 italic">{placeholder}</p>}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export { DeliveryMethodSelector };
