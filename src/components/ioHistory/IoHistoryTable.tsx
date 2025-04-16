"use client";

import React, { useState } from "react";
import { ApiInventoryRecord } from "@/types/inventory-record";
import { TeamWarehouse } from "@/types/warehouse";

interface IoHistoryTableProps {
  records: ApiInventoryRecord[];
  warehouses: TeamWarehouse[];
  formatDate: (dateString: string | null | undefined) => string;
}

export default function IoHistoryTable({
  records,
  warehouses,
  formatDate,
}: IoHistoryTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  // 창고 이름 가져오기 함수
  const getWarehouseName = (warehouseId?: number): string => {
    if (!warehouseId) return "-";
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    return warehouse ? warehouse.warehouseName : `창고 ${warehouseId}`;
  };

  // 행 클릭 핸들러
  const handleRowClick = (id: number) => {
    if (expandedRowId === id) {
      setExpandedRowId(null); // 이미 확장된 행이면 축소
    } else {
      setExpandedRowId(id); // 새로운 행 확장
    }
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">
              대상 창고위치
            </th>
            <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">
              구분
            </th>
            <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">
              상품명
            </th>
            <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">
              수량
            </th>
            <th className="py-3 px-6 border-b text-left text-gray-700 font-semibold">
              날짜
            </th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            <>
              {records.map((record) => (
                <React.Fragment key={record?.id || Math.random()}>
                  <tr
                    onClick={() => record?.id && handleRowClick(record.id)}
                    className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="py-3 px-6 border-b text-gray-700">
                      {getWarehouseName(record?.item?.warehouseId)}
                    </td>
                    <td className="py-3 px-6 border-b text-gray-700">
                      {record?.inboundQuantity !== null &&
                      record?.inboundQuantity !== undefined ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            ></path>
                          </svg>
                          입고
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            ></path>
                          </svg>
                          출고
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 border-b text-gray-700">
                      {record?.item?.itemName || "-"}
                    </td>
                    <td className="py-3 px-6 border-b">
                      {record?.inboundQuantity !== null &&
                      record?.inboundQuantity !== undefined ? (
                        <span className="text-green-600 font-medium">
                          +{record.inboundQuantity}
                        </span>
                      ) : record?.outboundQuantity !== null &&
                        record?.outboundQuantity !== undefined ? (
                        <span className="text-red-600 font-medium">
                          -{record.outboundQuantity}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-6 border-b text-gray-700">
                      {record?.inboundQuantity !== null &&
                      record?.inboundQuantity !== undefined
                        ? formatDate(record?.inboundDate)
                        : formatDate(record?.outboundDate)}
                    </td>
                  </tr>
                  {expandedRowId === record?.id && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-6 py-4">
                        <div className="overflow-x-auto">
                          <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-100 p-4 rounded-lg border border-gray-300">
                            {JSON.stringify(record, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </>
          ) : (
            <tr>
              <td
                colSpan={5}
                className="py-8 text-center text-gray-500 bg-gray-50"
              >
                필터 조건에 맞는 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
