import React from "react";
import { useGetWarehouseInventoryRecords } from "../hooks/useInventoryRecord";
import { format } from "date-fns";
import { InventoryRecord } from "../types/inventory-record";

interface InventoryRecordListProps {
  warehouseId: string;
  startDate?: Date;
  endDate?: Date;
}

export const InventoryRecordList: React.FC<InventoryRecordListProps> = ({
  warehouseId,
  startDate,
  endDate,
}) => {
  const { records, isLoading, error } = useGetWarehouseInventoryRecords(
    startDate?.toISOString(),
    endDate?.toISOString()
  );

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러가 발생했습니다: {error.message}</div>;
  if (!records) return <div>데이터가 없습니다.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              날짜
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              품목
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              수량
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              유형
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              비고
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record: InventoryRecord) => (
            <tr key={record.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {format(
                  new Date(
                    record.inboundDate || record.outboundDate || new Date()
                  ),
                  "yyyy-MM-dd"
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {record.item?.itemName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {record.inboundQuantity || record.outboundQuantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {record.inboundDate ? "입고" : "출고"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{record.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
