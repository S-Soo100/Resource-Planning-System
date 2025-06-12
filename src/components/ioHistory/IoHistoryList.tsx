"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useInventoryRecordsByTeamId } from "@/hooks/useInventoryRecordsByTeamId";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Warehouse } from "@/types/warehouse";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { filterRecordsByDateRange } from "@/utils/dateFilter";
import InventoryRecordDetail from "./InventoryRecordDetail";
import { navigateByAuthStatus } from "@/utils/navigation";
import { Button } from "@/components/ui/button";

// 날짜 포맷팅 유틸리티 함수
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function IoHistoryList() {
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
    new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString()
      .split("T")[0]
  );
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

  const {
    records,
    isLoading: isDataLoading,
    error,
  } = useInventoryRecordsByTeamId();

  // 날짜 필터 초기화 함수
  const resetDateFilter = () => {
    setStartDate(
      new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split("T")[0]
    );
    setEndDate(
      new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .split("T")[0]
    );
  };

  // 필터링된 기록
  const filteredRecords = useMemo(() => {
    // 날짜로 필터링
    const dateFilteredRecords = filterRecordsByDateRange(
      records,
      startDate,
      endDate
    );

    // 창고로 필터링
    if (selectedWarehouseId) {
      return dateFilteredRecords.filter(
        (record) => record.item?.warehouseId === selectedWarehouseId
      );
    }

    return dateFilteredRecords;
  }, [records, startDate, endDate, selectedWarehouseId]);

  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(Number(warehouses[0].id));
    }
  }, [warehouses, selectedWarehouseId]);

  if (isUserLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.accessLevel === "supplier") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            열람 권한이 없습니다
          </h2>
          <p className="mb-6 text-gray-600">
            해당 페이지에 접근할 수 있는 권한이 없습니다.
          </p>
          <Button
            variant="outline"
            onClick={() => navigateByAuthStatus(router)}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            뒤로가기
          </Button>
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
    <div className="container p-4 mx-auto">
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-4">
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
        <div className="flex items-end gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              조회 종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={resetDateFilter}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            초기화
          </button>
        </div>
      </div>

      {/* 기록 목록 테이블 */}
      {filteredRecords.length === 0 ? (
        <div className="py-8 text-center rounded-lg bg-gray-50">
          <p className="text-lg text-gray-500">데이터가 없습니다</p>
          <p className="mt-2 text-sm text-gray-400">
            선택한 기간에 입출고 기록이 없습니다
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full overflow-hidden bg-white rounded-lg shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                  일자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                  구분
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">
                  품목
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                  수량
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[34%]">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <React.Fragment key={record.id}>
                  <tr
                    onClick={() =>
                      setExpandedRecordId(
                        expandedRecordId === record.id ? null : record.id
                      )
                    }
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {record.inboundQuantity
                        ? formatDate(record.inboundDate)
                        : formatDate(record.outboundDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
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
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {record.item?.teamItem ? (
                        <div className="space-y-1">
                          <div className="font-medium text-blue-700">
                            {record.item.teamItem.itemName}
                          </div>
                          <div className="text-xs text-gray-500">
                            코드: {record.item.teamItem.itemCode}
                          </div>
                          {record.item.teamItem.category?.name && (
                            <div className="text-xs text-gray-400">
                              카테고리: {record.item.teamItem.category.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-500">
                          품목 정보 없음 (ID: {record.itemId})
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {record.inboundQuantity || record.outboundQuantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {record.remarks}
                    </td>
                  </tr>
                  {expandedRecordId === record.id && (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 bg-gray-50">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {record.item?.teamItem ? (
                              <>
                                [{record.item.teamItem.itemCode}]{" "}
                                {record.item.teamItem.itemName}
                                {record.item.teamItem.category?.name && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({record.item.teamItem.category.name})
                                  </span>
                                )}
                              </>
                            ) : (
                              `품목 ID: ${record.itemId}`
                            )}{" "}
                            {record.inboundQuantity ? "입고" : "출고"}건 (
                            {record.inboundQuantity || record.outboundQuantity}
                            개) -{" "}
                            {warehouses.find(
                              (w) => w.id === record.item?.warehouseId
                            )?.warehouseName || "알 수 없는 창고"}
                          </h3>
                        </div>
                        <InventoryRecordDetail record={record} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
