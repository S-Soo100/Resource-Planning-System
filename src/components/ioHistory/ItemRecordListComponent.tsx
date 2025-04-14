"use client";

import React, { useState, useEffect } from "react";
import { InventoryRecord } from "@/types/inventory-record";

export default function IoHistoryRecordListComponent() {
  // 오늘 날짜를 YYYY-MM-DD 형식으로 변환
  const today = new Date().toISOString().split("T")[0];

  // 더미 데이터 생성
  const createDummyData = (): InventoryRecord[] => {
    const dummyRecord: InventoryRecord = {
      id: 1,
      name: "테스트 상품",
      quantity: 100,
      price: 15000,
      description: "테스트 상품 설명입니다.",
      createdAt: "2023-06-15T09:30:00Z",
      updatedAt: "2023-07-20T14:45:00Z",
      supplierId: 5,
      supplier: {
        id: 5,
        name: "주식회사 공급사",
        contact: "010-1234-5678",
        email: "supplier@example.com",
      },
    };

    return Array(30)
      .fill(null)
      .map((_, index) => ({
        ...dummyRecord,
        id: index + 1,
        name: `테스트 상품 ${index + 1}`,
        quantity: 100 + index * 5,
        price: 15000 + index * 1000,
        updatedAt: new Date(
          new Date(dummyRecord.updatedAt).getTime() + index * 86400000
        ).toISOString(),
      }));
  };

  const [allRecords] = useState<InventoryRecord[]>(createDummyData());
  const [filteredRecords, setFilteredRecords] =
    useState<InventoryRecord[]>(allRecords);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const recordsPerPage = 10;

  // 날짜 필터 핸들러
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  // 필터링 적용
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredRecords(allRecords);
    } else {
      const filtered = allRecords.filter((record) => {
        const recordDate = new Date(record.updatedAt);
        let isInRange = true;

        if (startDate) {
          const filterStartDate = new Date(startDate);
          // 시작날짜의 시간을 00:00:00으로 설정
          filterStartDate.setHours(0, 0, 0, 0);
          isInRange = isInRange && recordDate >= filterStartDate;
        }

        if (endDate) {
          const filterEndDate = new Date(endDate);
          // 종료날짜의 시간을 23:59:59로 설정
          filterEndDate.setHours(23, 59, 59, 999);
          isInRange = isInRange && recordDate <= filterEndDate;
        }

        return isInRange;
      });

      setFilteredRecords(filtered);
    }
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
  }, [startDate, endDate, allRecords]);

  // 페이지네이션 계산
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // 필터 초기화 핸들러
  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  // 필터가 적용되었는지 확인
  const isFilterActive = startDate || endDate;

  return (
    <section className="m-2 p-2 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">재고 기록 목록</h2>

      {/* 필터 영역 */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="startDate" className="mr-2 font-medium">
              시작일:
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={today}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="endDate" className="mx-2 font-medium">
              종료일:
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
              max={today}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {isFilterActive && (
            <button
              onClick={clearFilter}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
            >
              필터 초기화
            </button>
          )}
          <div className="ml-auto text-sm text-gray-600">
            총 {filteredRecords.length}개의 항목
          </div>
        </div>

        {isFilterActive && (
          <div className="mt-2 text-sm text-gray-600">
            {startDate && endDate
              ? `${startDate} ~ ${endDate} 기간 내 데이터`
              : startDate
              ? `${startDate} 이후 데이터`
              : `${endDate} 이전 데이터`}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">수정일</th>
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">상품명</th>
              <th className="py-2 px-4 border-b text-left">수량</th>
              <th className="py-2 px-4 border-b text-left">가격</th>
              <th className="py-2 px-4 border-b text-left">설명</th>
              <th className="py-2 px-4 border-b text-left">등록일</th>
              <th className="py-2 px-4 border-b text-left">공급사</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b font-medium">
                    {formatDate(record.updatedAt)}
                  </td>
                  <td className="py-2 px-4 border-b">{record.id}</td>
                  <td className="py-2 px-4 border-b">{record.name}</td>
                  <td className="py-2 px-4 border-b">{record.quantity}</td>
                  <td className="py-2 px-4 border-b">
                    {record.price.toLocaleString()}원
                  </td>
                  <td className="py-2 px-4 border-b">{record.description}</td>
                  <td className="py-2 px-4 border-b">
                    {formatDate(record.createdAt)}
                  </td>
                  <td className="py-2 px-4 border-b">{record.supplier.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  필터 조건에 맞는 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {filteredRecords.length > 0 && (
        <div className="flex justify-center mt-4">
          <nav>
            <ul className="flex list-none">
              <li>
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 mx-1 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                >
                  이전
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index}>
                  <button
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 mx-1 border rounded-md ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 mx-1 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                >
                  다음
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </section>
  );
}
