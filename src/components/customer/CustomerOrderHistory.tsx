"use client";

import React from "react";
import { useCustomerOrders } from "@/hooks/useCustomers";
import { LoadingCentered } from "@/components/ui/Loading";
import { ClipboardList } from "lucide-react";
import Link from "next/link";

interface CustomerOrderHistoryProps {
  userId: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-gray-100 text-gray-700" },
  approved: { label: "승인", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "진행 중", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "완료", color: "bg-green-100 text-green-700" },
  cancelled: { label: "취소", color: "bg-red-100 text-red-700" },
};

export default function CustomerOrderHistory({
  userId,
}: CustomerOrderHistoryProps) {
  const { data: orders = [], isLoading } = useCustomerOrders(userId);

  if (isLoading) {
    return <LoadingCentered />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-sm text-Text-Low-70">발주 이력이 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      {/* 테이블 (데스크톱) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                제목
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                거래처
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                발주일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] ?? {
                label: order.status,
                color: "bg-gray-100 text-gray-700",
              };
              return (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/orderRecord/${order.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {order.title || `발주 #${order.id}`}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {order.supplier?.supplierName || "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("ko-KR")
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 카드 (모바일) */}
      <div className="md:hidden divide-y divide-gray-200">
        {orders.map((order) => {
          const statusInfo = STATUS_LABELS[order.status] ?? {
            label: order.status,
            color: "bg-gray-100 text-gray-700",
          };
          return (
            <Link
              key={order.id}
              href={`/orderRecord/${order.id}`}
              className="block p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-900">
                  {order.title || `발주 #${order.id}`}
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>거래처: {order.supplier?.supplierName || "-"}</p>
                <p>
                  발주일:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("ko-KR")
                    : "-"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
