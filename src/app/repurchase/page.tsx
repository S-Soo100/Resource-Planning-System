"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRepurchaseDueSuppliers } from "@/hooks/useCustomerDocuments";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { usePermission } from "@/hooks/usePermission";
import { LoadingCentered } from "@/components/ui/Loading";
import { ArrowLeft, RefreshCw, AlertCircle, Download } from "lucide-react";
import Link from "next/link";
import { RepurchaseDueSupplier } from "@/types/supplier";
import * as XLSX from "xlsx";

type CustomerFilter = "all" | "b2c" | "b2b" | "none";

const FILTER_OPTIONS: { value: CustomerFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "b2c", label: "B2C" },
  { value: "b2b", label: "B2B" },
  { value: "none", label: "미분류" },
];

// 경과일수 계산
const getDaysOverdue = (dueDateStr: string): number => {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const diffTime = today.getTime() - dueDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// 경과일수에 따른 색상
const getOverdueColor = (days: number): string => {
  if (days >= 30) return "text-red-600 bg-red-50";
  if (days >= 14) return "text-orange-600 bg-orange-50";
  if (days >= 7) return "text-yellow-600 bg-yellow-50";
  return "text-blue-600 bg-blue-50";
};

// 엑셀 내보내기
const exportToExcel = (
  suppliers: RepurchaseDueSupplier[],
  filterLabel: string
) => {
  const data = suppliers.map((supplier, index) => ({
    No: index + 1,
    판매대상명: supplier.supplierName,
    이메일: supplier.email || "-",
    연락처: supplier.supplierPhoneNumber || "-",
    판매대상유형:
      supplier.customerType === "b2c"
        ? "B2C"
        : supplier.customerType === "b2b"
          ? "B2B"
          : "-",
    수급자: supplier.isRecipient ? "O" : "-",
    입금자명: supplier.depositorName || "-",
    "재구매 주기(개월)": supplier.repurchaseCycleMonths ?? 3,
    재구매예정일: new Date(supplier.repurchaseDueDate).toLocaleDateString(
      "ko-KR"
    ),
    경과일: getDaysOverdue(supplier.repurchaseDueDate),
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  ws["!cols"] = [
    { wch: 5 }, // No
    { wch: 15 }, // 판매대상명
    { wch: 25 }, // 이메일
    { wch: 15 }, // 연락처
    { wch: 10 }, // 판매대상유형
    { wch: 8 }, // 수급자
    { wch: 12 }, // 입금자명
    { wch: 15 }, // 재구매 주기
    { wch: 15 }, // 재구매예정일
    { wch: 10 }, // 경과일
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "재구매 예정 판매대상");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `재구매예정판매대상_${filterLabel}_${today}.xlsx`);
};

export default function RepurchasePage() {
  const router = useRouter();
  const { team } = useCurrentTeam();
  const { isSupplier } = usePermission();
  const {
    data: suppliers = [],
    isLoading,
    refetch,
  } = useRepurchaseDueSuppliers(team?.id);

  const [filter, setFilter] = useState<CustomerFilter>("all");

  // 필터링된 목록
  const filteredSuppliers = suppliers.filter((s) => {
    if (filter === "all") return true;
    if (filter === "b2c") return s.customerType === "b2c";
    if (filter === "b2b") return s.customerType === "b2b";
    if (filter === "none") return !s.customerType;
    return true;
  });

  // 필터별 카운트
  const counts = {
    all: suppliers.length,
    b2c: suppliers.filter((s) => s.customerType === "b2c").length,
    b2b: suppliers.filter((s) => s.customerType === "b2b").length,
    none: suppliers.filter((s) => !s.customerType).length,
  };

  if (isSupplier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">접근 권한이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/menu"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              재구매 예정 판매대상
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              재구매 예정일이 지난 고객 목록입니다
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isLoading && filteredSuppliers.length > 0 && (
            <button
              onClick={() =>
                exportToExcel(
                  filteredSuppliers,
                  FILTER_OPTIONS.find((o) => o.value === filter)?.label ??
                    "전체"
                )
              }
              className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              엑셀
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      {!isLoading && suppliers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">30일 이상 경과</p>
            <p className="text-2xl font-bold text-red-700">
              {
                filteredSuppliers.filter(
                  (s) => getDaysOverdue(s.repurchaseDueDate) >= 30
                ).length
              }
              명
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-600">14~29일 경과</p>
            <p className="text-2xl font-bold text-orange-700">
              {
                filteredSuppliers.filter((s) => {
                  const days = getDaysOverdue(s.repurchaseDueDate);
                  return days >= 14 && days < 30;
                }).length
              }
              명
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-600">7~13일 경과</p>
            <p className="text-2xl font-bold text-yellow-700">
              {
                filteredSuppliers.filter((s) => {
                  const days = getDaysOverdue(s.repurchaseDueDate);
                  return days >= 7 && days < 14;
                }).length
              }
              명
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600">전체</p>
            <p className="text-2xl font-bold text-blue-700">
              {filteredSuppliers.length}명
            </p>
          </div>
        </div>
      )}

      {/* B2C/B2B 필터 탭 */}
      {!isLoading && suppliers.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {option.label}
              <span className="ml-1 text-xs opacity-75">
                ({counts[option.value]})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 목록 */}
      {isLoading ? (
        <LoadingCentered />
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500">
            재구매 예정 판매대상이 없습니다
          </p>
          <p className="text-sm text-gray-400 mt-1">
            모든 고객의 재구매 예정일이 아직 도래하지 않았습니다
          </p>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">해당 분류의 판매대상이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* 테이블 (데스크톱) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    판매대상명
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    판매대상 유형
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    수급자
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    재구매 주기
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    예정일
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    경과일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSuppliers.map((supplier: RepurchaseDueSupplier) => {
                  const daysOverdue = getDaysOverdue(
                    supplier.repurchaseDueDate
                  );
                  return (
                    <tr
                      key={supplier.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/supplier/${supplier.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {supplier.supplierName}
                        </div>
                        {supplier.email && (
                          <div className="text-xs text-gray-500">
                            {supplier.email}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {supplier.customerType ? (
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              supplier.customerType === "b2c"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {supplier.customerType === "b2c" ? "B2C" : "B2B"}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {supplier.isRecipient ? (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            수급자
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {supplier.repurchaseCycleMonths
                          ? `${supplier.repurchaseCycleMonths}개월`
                          : "3개월"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {new Date(
                          supplier.repurchaseDueDate
                        ).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getOverdueColor(daysOverdue)}`}
                        >
                          {daysOverdue}일 경과
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 카드 (모바일) */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredSuppliers.map((supplier: RepurchaseDueSupplier) => {
              const daysOverdue = getDaysOverdue(supplier.repurchaseDueDate);
              return (
                <Link
                  key={supplier.id}
                  href={`/supplier/${supplier.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {supplier.supplierName}
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getOverdueColor(daysOverdue)}`}
                    >
                      {daysOverdue}일 경과
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      유형:{" "}
                      {supplier.customerType === "b2c"
                        ? "B2C"
                        : supplier.customerType === "b2b"
                          ? "B2B"
                          : "-"}{" "}
                      | 수급자: {supplier.isRecipient ? "O" : "-"}
                    </p>
                    <p>
                      주기: {supplier.repurchaseCycleMonths ?? 3}개월 | 예정일:{" "}
                      {new Date(supplier.repurchaseDueDate).toLocaleDateString(
                        "ko-KR"
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
