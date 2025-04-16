"use client";

import React, { useState, useEffect } from "react";
import { ApiInventoryRecord } from "@/types/inventory-record";
import { useInventoryRecord } from "@/hooks/useInventoryRecord";
import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import IoHistoryTable from "./IoHistoryTable";

export default function IoHistoryRecordListComponent() {
  // 오늘 날짜를 YYYY-MM-DD 형식으로 변환
  const today = new Date().toISOString().split("T")[0];

  // useInventoryRecord 훅을 사용하여 데이터 가져오기
  const { records, isLoading, error } = useInventoryRecord();

  // 창고 정보 상태 추가
  const [warehouses, setWarehouses] = useState<TeamWarehouse[]>([]);

  const [filteredRecords, setFilteredRecords] = useState<ApiInventoryRecord[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const recordsPerPage = 10;

  // 팀의 창고 정보 가져오기
  useEffect(() => {
    const team = authService.getSelectedTeam();
    if (team && team.Warehouses) {
      setWarehouses(team.Warehouses);
    } else {
      setWarehouses([]);
    }
  }, []);

  // 날짜 필터 핸들러
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  // 필터링 적용
  useEffect(() => {
    if (!records) {
      setFilteredRecords([]);
      return;
    }

    if (!startDate && !endDate) {
      // 명시적 타입 캐스팅
      setFilteredRecords(records as unknown as ApiInventoryRecord[]);
    } else {
      const filtered = (records as unknown as ApiInventoryRecord[]).filter(
        (record) => {
          if (!record || !record.updatedAt) return false;

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
        }
      );

      setFilteredRecords(filtered);
    }
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
  }, [startDate, endDate, records]);

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

  // 날짜 포맷팅 함수 - 예외 처리 추가 (null 타입 처리)
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    } catch (error) {
      console.error("날짜 형식 오류:", error);
      return "-";
    }
  };

  // 필터 초기화 핸들러
  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  // 필터가 적용되었는지 확인
  const isFilterActive = startDate || endDate;

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <section className="m-2 p-2 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">재고 기록 목록</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </section>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <section className="m-2 p-2 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">재고 기록 목록</h2>
        <div className="p-4 text-center text-red-500">
          <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
          <p>{error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-full p-4 rounded-lg shadow-lg  bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        재고 기록 목록
      </h2>

      {/* 필터 영역 */}
      <div className="mb-6 p-5 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <label
              htmlFor="startDate"
              className="mr-2 font-medium text-gray-700"
            >
              시작일:
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={today}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="endDate" className="mx-2 font-medium text-gray-700">
              종료일:
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
              max={today}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          {isFilterActive && (
            <button
              onClick={clearFilter}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors duration-200"
            >
              필터 초기화
            </button>
          )}
          <div className="ml-auto text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
            총 {filteredRecords.length}개의 항목
          </div>
        </div>

        {isFilterActive && (
          <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-md border-l-4 border-blue-400">
            {startDate && endDate
              ? `${startDate} ~ ${endDate} 기간 내 데이터`
              : startDate
              ? `${startDate} 이후 데이터`
              : `${endDate} 이전 데이터`}
          </div>
        )}
      </div>

      {/* 테이블 컴포넌트 */}
      <IoHistoryTable
        records={currentRecords}
        warehouses={warehouses}
        formatDate={formatDate}
      />

      {/* 페이지네이션 */}
      {filteredRecords.length > 0 && (
        <div className="flex justify-center mt-6">
          <nav>
            <ul className="flex list-none">
              <li>
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 mx-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
                >
                  이전
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index}>
                  <button
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 mx-1 border rounded-md transition-colors duration-200 ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "bg-white border-gray-300 hover:bg-gray-50"
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
                  className="px-4 py-2 mx-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
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
