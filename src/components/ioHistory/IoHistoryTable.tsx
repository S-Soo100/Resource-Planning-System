"use client";
import { getWarehouseName } from "@/api/(item)/getWarehouseName";
import { useIoHistory } from "@/hooks/useIoHistory";

export default function IoHistoryTable() {
  const { data: ioHistory, isLoading, isError } = useIoHistory();

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">입출고 기록</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">창고</th>
            <th className="border px-4 py-2">입고일</th>
            <th className="border px-4 py-2">출고일</th>
            <th className="border px-4 py-2">입고처</th>
            <th className="border px-4 py-2">출고처</th>
            <th className="border px-4 py-2">입고 수량</th>
            <th className="border px-4 py-2">출고 수량</th>
            <th className="border px-4 py-2">비고</th>
          </tr>
        </thead>
        <tbody>
          {ioHistory?.map((record) => (
            <tr key={record.ioId} className="hover:bg-gray-100">
              <td className="border px-4 py-2 font-semibold">
                {getWarehouseName({ id: record.warehouseId })}
              </td>
              <td className="border px-4 py-2">
                {(record.inboundDate as string) || "-"}
              </td>
              <td className="border px-4 py-2">
                {(record.outboundDate as string) || "-"}
              </td>
              <td className="border px-4 py-2">{record.inboundLocation}</td>
              <td className="border px-4 py-2">{record.outboundLocation}</td>
              <td className="border px-4 py-2">{record.inboundQuantity}</td>
              <td className="border px-4 py-2">{record.outboundQuantity}</td>
              <td className="border px-4 py-2">{record.remarks || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
