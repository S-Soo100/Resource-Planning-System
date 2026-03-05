"use client";

import React from "react";
import { SupplierDetailSummary } from "@/types/supplier";
import { usePermission } from "@/hooks/usePermission";

interface SupplierDetailSummaryProps {
  summary: SupplierDetailSummary | null;
  isLoading?: boolean;
}

export function SupplierDetailSummaryComponent({
  summary,
  isLoading,
}: SupplierDetailSummaryProps) {
  const { canViewMargin } = usePermission();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 bg-white rounded-xl border border-Outline-Variant px-4 py-2.5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-Back-Mid-20 rounded w-24" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const marginText =
    canViewMargin && summary.averageMarginRate !== undefined
      ? `마진율 ${summary.averageMarginRate.toFixed(1)}%`
      : null;

  return (
    <div className="flex items-center flex-wrap gap-x-5 gap-y-1 bg-white rounded-xl border border-Outline-Variant px-4 py-2.5 text-sm">
      <StatItem
        label="매출"
        count={summary.totalSalesOrders}
        amount={summary.totalSalesAmount}
        color="text-blue-600"
      />
      <div className="w-px h-4 bg-Outline-Variant" />
      <StatItem
        label="매입"
        count={summary.totalPurchaseOrders}
        amount={summary.totalPurchaseAmount}
        color="text-orange-600"
      />
      {marginText && (
        <>
          <div className="w-px h-4 bg-Outline-Variant" />
          <span className="text-xs font-medium text-purple-600">
            {marginText}
          </span>
        </>
      )}
    </div>
  );
}

function StatItem({
  label,
  count,
  amount,
  color,
}: {
  label: string;
  count: number;
  amount: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold ${color}`}>{label}</span>
      <span className="text-Text-High-90">{count.toLocaleString()}건</span>
      <span className="text-Text-Low-70">·</span>
      <span className="font-medium text-Text-Highest-100">
        ₩{amount.toLocaleString()}
      </span>
    </div>
  );
}
