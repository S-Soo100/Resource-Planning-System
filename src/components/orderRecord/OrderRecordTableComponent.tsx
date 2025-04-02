"use client";
import OrderRecordRow from "@/components/orderRecord/(tableBody)/OrderRecordRow";
import { IOrderRecord } from "@/types/orderRecord";
import { useState, useEffect } from "react";
import TableCell from "./(tableBody)/TableCell";

const OrderRecordTableComponent = () => {
  const [records, setRecords] = useState<IOrderRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<IOrderRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
      setFilteredRecords(dummyData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // 필터링 및 검색 로직 적용
    let result = [...records];

    // 검색어 필터링
    if (searchTerm) {
      result = result.filter(
        (record) =>
          record.orderer.includes(searchTerm) ||
          record.package.includes(searchTerm) ||
          record.recipient.includes(searchTerm)
      );
    }

    // 상태 필터링
    if (statusFilter) {
      result = result.filter((record) => record.status === statusFilter);
    }

    // 정렬
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredRecords(result);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  }, [records, searchTerm, statusFilter, sortOrder]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterToggle = () => {
    if (statusFilter === null) setStatusFilter("배송 중");
    else if (statusFilter === "배송 중") setStatusFilter("배송 완료");
    else setStatusFilter(null);
  };

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleAddNewRecord = () => {
    // 추후 구현: 새 발주 기록 추가 모달 또는 페이지로 이동
    alert("새 발주 기록 추가 기능은 개발 중입니다.");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">발주 기록 확인</h1>

      {/* 검색 및 제어 버튼 영역 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="발주자, 패키지, 수령자 검색..."
          value={searchTerm}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-md flex-grow"
        />

        <button
          onClick={handleFilterToggle}
          className={`px-4 py-2 rounded-md ${
            statusFilter ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {statusFilter ? `${statusFilter} 필터링 중` : "모든 상태"}
        </button>

        <button
          onClick={handleSortToggle}
          className="px-4 py-2 bg-gray-200 rounded-md flex items-center"
        >
          날짜순 {sortOrder === "asc" ? "오름차순" : "내림차순"}
        </button>

        <button
          onClick={handleAddNewRecord}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
        >
          새 발주 추가
        </button>
      </div>

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
export default OrderRecordTableComponent;
