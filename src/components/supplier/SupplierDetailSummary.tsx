"use client";

import React from "react";
import { SupplierDetailSummary } from "@/types/supplier";
import { TrendingUp, DollarSign, ShoppingBag, Coins } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SupplierDetailSummaryProps {
  summary: SupplierDetailSummary | null;
  isLoading?: boolean;
}

export function SupplierDetailSummaryComponent({
  summary,
  isLoading,
}: SupplierDetailSummaryProps) {
  const { user } = useCurrentUser();
  const canViewMargin = user?.accessLevel === "admin" || user?.accessLevel === "moderator";

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-5 animate-pulse"
          >
            <div className="h-4 bg-Back-Mid-20 rounded w-2/3 mb-3"></div>
            <div className="h-8 bg-Back-Mid-20 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const cards = [
    {
      title: "총 매출 건수",
      value: `${summary.totalSalesOrders.toLocaleString()}건`,
      icon: TrendingUp,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      show: true,
    },
    {
      title: "총 매출 금액",
      value: `₩${summary.totalSalesAmount.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      show: true,
      subtitle: canViewMargin && summary.averageMarginRate !== undefined
        ? `평균 마진율: ${summary.averageMarginRate.toFixed(1)}%`
        : undefined,
    },
    {
      title: "총 매입 건수",
      value: `${summary.totalPurchaseOrders.toLocaleString()}건`,
      icon: ShoppingBag,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      show: true,
    },
    {
      title: "총 매입 금액",
      value: `₩${summary.totalPurchaseAmount.toLocaleString()}`,
      icon: Coins,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      show: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.filter((card) => card.show).map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm text-Text-Low-70">{card.title}</p>
            <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-Text-Highest-100 mb-1">
            {card.value}
          </p>
          {card.subtitle && (
            <p className="text-xs text-purple-600 font-medium">
              {card.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
