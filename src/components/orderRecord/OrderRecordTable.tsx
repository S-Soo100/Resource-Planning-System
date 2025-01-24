"use client";
import OrderRecordRow from "@/components/orderRecord/(tableBody)/OrderRecordRow";
import { IOrderRecord } from "@/types/orderRecord";
import { useState, useEffect } from "react";
import TableCell from "./(tableBody)/TableCell";

const OrderRecordTable = () => {
  const [records, setRecords] = useState<IOrderRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    // Fetch data from API or database (placeholder for now)
    const fetchData = async () => {
      const dummyData: IOrderRecord[] = Array.from({ length: 20 }, (_, i) => ({
        id: Math.floor(Math.random() * 999) + 1000,
        orderer: "김기성",
        package: `패키지 ${String.fromCharCode(65 + (i % 26))}`,
        quantity: Math.floor(Math.random() * 20) + 1,
        date: `2025-01-${String(i + 1).padStart(2, "0")}`,
        address: `주소 ${i + 1}`,
        recipient: `수령자 ${i + 1}`,
        recipientPhone: `010-${String(i + 1).padStart(4, "0")}-${String(
          5678 + i
        ).slice(-4)}`,
        additionalItems: `추가물품 ${i + 1}`,
        quote: `견적서 링크 ${i + 1}`,
        orderSheet: `발주서 링크 ${i + 1}`,
        status: i % 2 === 0 ? "배송 중" : "배송 완료",
      }));
      setRecords(dummyData);
    };

    fetchData();
  }, []);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">발주 기록 확인</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <TableCell isHeader>id</TableCell>
            <TableCell isHeader>발주자</TableCell>
            <TableCell isHeader>패키지</TableCell>
            <TableCell isHeader>수량</TableCell>
            <TableCell isHeader>수령자</TableCell>
            <TableCell isHeader>날짜</TableCell>
            <TableCell isHeader>현재상태</TableCell>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((record) => (
            <OrderRecordRow key={record.date} record={record} />
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          이전
        </button>
        <span>
          페이지 {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
};
export default OrderRecordTable;
