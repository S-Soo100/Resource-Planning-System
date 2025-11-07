"use client";

import React from "react";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";
import { useParams } from "next/navigation";
import { useInventoryRecordsByTeamId } from "@/hooks/useInventoryRecordsByTeamId";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Item } from "@/types/(item)/item";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = params.id as string;
  const { useGetItem } = useItemStockManagement();
  const { data: itemResponse, isLoading: isItemLoading } = useGetItem(itemId);
  const { records, isLoading: isRecordsLoading } =
    useInventoryRecordsByTeamId();
  const { warehouses } = useWarehouseItems();

  const item = itemResponse?.data as Item | undefined;
  const warehouse = warehouses.find((w) => w.id === item?.warehouseId);

  // 현재 품목의 입출고 내역만 필터링
  const itemRecords = records.filter(
    (record) => record.itemId === Number(itemId)
  );

  if (isItemLoading || isRecordsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">품목을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 품목 기본 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">품목 상세 정보</h1>

          {/* 창고 정보 */}
          <div className="bg-white rounded-lg shadow-sm py-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-800">
                {warehouse?.warehouseName || "-"}
              </p>
              {warehouse?.warehouseAddress && (
                <p className="text-sm text-gray-600 mt-1">
                  {warehouse.warehouseAddress}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">품목 코드</p>
              <p className="font-medium">{item.teamItem.itemCode}</p>
            </div>
            <div>
              <p className="text-gray-600">품목명</p>
              <p className="font-medium">{item.teamItem.itemName}</p>
            </div>
            <div>
              <p className="text-gray-600">현재 수량</p>
              <p className="font-medium">{item.itemQuantity} 개</p>
            </div>
            <div>
              <p className="text-gray-600">생성일</p>
              <p className="font-medium">
                {format(new Date(item.createdAt), "yyyy-MM-dd", { locale: ko })}
              </p>
            </div>
            <div>
              <p className="text-gray-600">최종 수정일</p>
              <p className="font-medium">
                {format(new Date(item.updatedAt), "yyyy-MM-dd", { locale: ko })}
              </p>
            </div>
          </div>
        </div>

        {/* 입출고 내역 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">입출고 내역</h2>
          {itemRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      구분
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(
                          new Date(
                            record.inboundDate || record.outboundDate || ""
                          ),
                          "yyyy-MM-dd HH:mm",
                          { locale: ko }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            record.inboundQuantity !== null
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {record.inboundQuantity !== null ? "입고" : "출고"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.inboundQuantity ??
                          record.outboundQuantity ??
                          "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.inboundLocation ||
                          record.outboundLocation ||
                          "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              입출고 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
