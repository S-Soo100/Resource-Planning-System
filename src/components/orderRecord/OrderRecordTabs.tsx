"use client";

import { useState, useEffect } from "react";
import { useOrder } from "@/hooks/useOrder";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import TableCell from "./(tableBody)/TableCell";
import { authStore } from "@/store/authStore";
import { useSuppliers } from "@/hooks/useSupplier";
import { Supplier } from "@/types/supplier";
import { ApiResponse } from "@/types/common";

type TabType = "all" | "user" | "supplier";

interface OrderResponse extends ApiResponse {
  data: IOrderRecord[];
}

const OrderRecordTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [userId, setUserId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const recordsPerPage = 10;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

  const { useAllOrders, useUserOrders, useSupplierOrders } = useOrder();
  const { useGetSuppliers } = useSuppliers();

  // 탭이 변경될 때 authStore에서 사용자 ID 가져오기
  useEffect(() => {
    if (activeTab === "user") {
      const user = authStore.getState().user;
      if (user && user.id) {
        setUserId(user.id.toString());
      }
    }
  }, [activeTab]);

  // 거래처 목록 조회 훅 사용
  const { suppliers: suppliersResponse, isLoading: suppliersLoading } =
    useGetSuppliers();

  // 거래처 목록 가져오기 (지연 로딩 적용)
  useEffect(() => {
    if (activeTab === "supplier") {
      // 거래처 탭으로 변경될 때 0.5초 후 로딩 시작
      const timer = setTimeout(() => {
        setIsLoadingSuppliers(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // 거래처 목록 설정
  useEffect(() => {
    if (suppliersResponse && !suppliersLoading && isLoadingSuppliers) {
      // API 응답 데이터 구조에 맞게 처리
      if (
        typeof suppliersResponse === "object" &&
        "data" in suppliersResponse
      ) {
        setSuppliers(suppliersResponse.data as Supplier[]);
      } else {
        setSuppliers(suppliersResponse as Supplier[]);
      }
      setIsLoadingSuppliers(false);
    }
  }, [suppliersResponse, suppliersLoading, isLoadingSuppliers]);

  // 선택된 탭에 따라 적절한 데이터 불러오기
  const { data: allOrders, isLoading: allLoading } = useAllOrders();
  const { data: userOrders, isLoading: userLoading } = useUserOrders(userId);
  const { data: supplierOrders, isLoading: supplierLoading } =
    useSupplierOrders(supplierId);

  // 현재 활성화된 탭에 따라 보여줄 데이터 선택
  const getActiveOrders = (): IOrderRecord[] => {
    switch (activeTab) {
      case "user":
        return (userOrders as OrderResponse)?.data || [];
      case "supplier":
        return (supplierOrders as OrderResponse)?.data || [];
      case "all":
      default:
        return (allOrders as OrderResponse)?.data || [];
    }
  };

  // 검색 필터링 적용
  const filteredOrders = getActiveOrders().filter(
    (order: IOrderRecord) =>
      order.orderer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      order.package?.packageName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false ||
      order.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
  );

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredOrders.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // 탭 변경 핸들러
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1); // 탭 변경 시 첫 페이지로 이동
  };

  // 검색 핸들러
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSupplierId(e.target.value);
  };

  // 페이지네이션 핸들러
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // 로딩 상태 확인
  const isLoading = () => {
    switch (activeTab) {
      case "user":
        return userLoading;
      case "supplier":
        return supplierLoading;
      case "all":
      default:
        return allLoading;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">발주 기록 관리</h1>

      {/* 탭 버튼 */}
      <div className="flex mb-4 border-b">
        <button
          onClick={() => handleTabChange("all")}
          className={`py-2 px-4 ${
            activeTab === "all"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          전체 발주 기록
        </button>
        <button
          onClick={() => handleTabChange("user")}
          className={`py-2 px-4 ${
            activeTab === "user"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          내 발주 기록
        </button>
        <button
          onClick={() => handleTabChange("supplier")}
          className={`py-2 px-4 ${
            activeTab === "supplier"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
        >
          거래처별 발주 기록
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="발주자, 패키지, 수령자 검색..."
          value={searchTerm}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-md flex-grow"
        />

        {activeTab === "user" && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">사용자 ID:</span>
            <span className="px-3 py-1 bg-gray-100 rounded">
              {userId || "로그인이 필요합니다"}
            </span>
          </div>
        )}

        {activeTab === "supplier" && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">거래처:</span>
            {isLoadingSuppliers ? (
              <span className="text-sm text-gray-500">
                거래처 목록 로딩 중...
              </span>
            ) : (
              <select
                value={supplierId}
                onChange={handleSupplierChange}
                className="px-4 py-2 border rounded-md"
              >
                <option value="">거래처 선택</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id.toString()}>
                    {supplier.supplierName}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* 데이터 테이블 */}
      {isLoading() ? (
        <div className="text-center py-4">데이터를 불러오는 중...</div>
      ) : (
        <>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <TableCell isHeader={true}>ID</TableCell>
                <TableCell isHeader={true}>발주자</TableCell>
                <TableCell isHeader={true}>패키지</TableCell>
                <TableCell isHeader={true}>수량</TableCell>
                <TableCell isHeader={true}>수령자</TableCell>
                <TableCell isHeader={true}>날짜</TableCell>
                <TableCell isHeader={true}>현재상태</TableCell>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((record: IOrderRecord) => (
                  <tr key={record.id} className="hover:bg-gray-100">
                    <TableCell isHeader={false}>{record.id}</TableCell>
                    <TableCell isHeader={false}>{record.orderer}</TableCell>
                    <TableCell isHeader={false}>
                      {record.package?.packageName}
                    </TableCell>
                    <TableCell isHeader={false}>{record.quantity}</TableCell>
                    <TableCell isHeader={false}>{record.recipient}</TableCell>
                    <TableCell isHeader={false}>{record.date}</TableCell>
                    <TableCell isHeader={false}>{record.status}</TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 border">
                    표시할 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              이전
            </button>
            <span>
              페이지 {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderRecordTabs;
