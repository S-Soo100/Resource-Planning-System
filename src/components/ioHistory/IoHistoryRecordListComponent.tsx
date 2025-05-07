"use client";

import React, { useState, useEffect } from "react";
import { useGetWarehouseInventoryRecords } from "@/hooks/useInventoryRecord";
import { format } from "date-fns";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Warehouse } from "@/types/warehouse";
import { ko } from "date-fns/locale";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// 날짜 포맷팅 유틸리티 함수
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "yyyy-MM-dd HH:mm", { locale: ko });
  } catch (error) {
    console.error("날짜 포맷팅 에러:", error);
    return dateString;
  }
};

export default function IoHistoryRecordListComponent() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { warehouses = [] } = useWarehouseItems();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const {
    records = [],
    isLoading: isDataLoading,
    error,
  } = useGetWarehouseInventoryRecords(0, startDate, endDate);

  // 필터링된 기록
  const filteredRecords = records.filter(
    (record) => record.item?.warehouseId === selectedWarehouseId
  );

  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      console.log("Setting initial warehouse:", warehouses[0].id);
      setSelectedWarehouseId(Number(warehouses[0].id));
    }
  }, [warehouses, selectedWarehouseId]);

  console.log("API Response:", records);
  console.log("Current selectedWarehouseId:", selectedWarehouseId);
  console.log("Current warehouses:", warehouses);

  if (isUserLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.accessLevel === "supplier") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            열람 권한이 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            해당 페이지에 접근할 수 있는 권한이 없습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        에러 발생:{" "}
        {error.message || "데이터를 불러오는 중 문제가 발생했습니다."}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {warehouses.map((warehouse: Warehouse) => (
          <div
            key={warehouse.id}
            onClick={() => setSelectedWarehouseId(Number(warehouse.id))}
            className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
              selectedWarehouseId === Number(warehouse.id)
                ? "bg-blue-500 text-white ring-2 ring-blue-600 transform scale-105"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${
                selectedWarehouseId === Number(warehouse.id)
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              {warehouse.warehouseName}
            </h3>
            {warehouse.warehouseAddress && (
              <div
                className={`text-sm mt-1 truncate ${
                  selectedWarehouseId === Number(warehouse.id)
                    ? "text-blue-100"
                    : "text-gray-500"
                }`}
              >
                {warehouse.warehouseAddress}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 필터 섹션 */}
      <div className="mb-6 space-y-4">
        {/* 날짜 필터 */}
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              조회 시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              조회 종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 기록 목록 테이블 */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">데이터가 없습니다</p>
          <p className="text-gray-400 text-sm mt-2">
            선택한 기간에 입출고 기록이 없습니다
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  일자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구분
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  품목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수량
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  위치
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.inboundQuantity
                      ? formatDate(record.inboundDate)
                      : formatDate(record.outboundDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.inboundQuantity
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.inboundQuantity ? "입고" : "출고"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.item?.itemName || record.itemId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.inboundQuantity || record.outboundQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.inboundLocation || record.outboundLocation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
