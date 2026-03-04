"use client";

import { useState, useMemo } from "react";
import { useTeamCustomers } from "@/hooks/useCustomers";
import { usePermission } from "@/hooks/usePermission";
import { LoadingCentered } from "@/components/ui/Loading";
import { ArrowLeft, Search, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { IUser } from "@/types/(auth)/user";

type CustomerFilter = "all" | "b2c" | "b2b" | "none";

const FILTER_OPTIONS: { value: CustomerFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "b2c", label: "B2C" },
  { value: "b2b", label: "B2B" },
  { value: "none", label: "미분류" },
];

export default function CustomersPage() {
  const { customers, isLoading } = useTeamCustomers();
  const { isSupplier } = usePermission();
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [search, setSearch] = useState("");

  // 검색 + 필터
  const filteredCustomers = useMemo(() => {
    return customers.filter((user: IUser) => {
      // 검색 필터
      const q = search.toLowerCase();
      if (
        q &&
        !user.name.toLowerCase().includes(q) &&
        !user.email.toLowerCase().includes(q)
      ) {
        return false;
      }
      // 유형 필터
      if (filter === "b2c") return user.customerType === "b2c";
      if (filter === "b2b") return user.customerType === "b2b";
      if (filter === "none") return !user.customerType;
      return true;
    });
  }, [customers, filter, search]);

  // 필터별 카운트
  const counts = useMemo(
    () => ({
      all: customers.filter((u: IUser) => {
        const q = search.toLowerCase();
        if (
          q &&
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        )
          return false;
        return true;
      }).length,
      b2c: customers.filter((u: IUser) => {
        const q = search.toLowerCase();
        if (
          q &&
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        )
          return false;
        return u.customerType === "b2c";
      }).length,
      b2b: customers.filter((u: IUser) => {
        const q = search.toLowerCase();
        if (
          q &&
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        )
          return false;
        return u.customerType === "b2b";
      }).length,
      none: customers.filter((u: IUser) => {
        const q = search.toLowerCase();
        if (
          q &&
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        )
          return false;
        return !u.customerType;
      }).length,
    }),
    [customers, search]
  );

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
            <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
            <p className="text-sm text-gray-500 mt-1">
              고객 정보를 조회하고 관리합니다
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{customers.length}명</span>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 또는 이메일로 검색"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 필터 탭 */}
      {!isLoading && customers.length > 0 && (
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
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500">
            등록된 고객이 없습니다
          </p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* 테이블 (데스크톱) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    고객명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    이메일
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    고객 유형
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    수급자
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    재구매 예정일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((user: IUser) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/customers/${user.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.customerType ? (
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            user.customerType === "b2c"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {user.customerType === "b2c" ? "B2C" : "B2B"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.isRecipient ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          수급자
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {user.repurchaseDueDate
                        ? new Date(user.repurchaseDueDate).toLocaleDateString(
                            "ko-KR"
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 카드 (모바일) */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredCustomers.map((user: IUser) => (
              <Link
                key={user.id}
                href={`/customers/${user.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {user.customerType && (
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          user.customerType === "b2c"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {user.customerType === "b2c" ? "B2C" : "B2B"}
                      </span>
                    )}
                    {user.isRecipient && (
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        수급자
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>{user.email}</p>
                  {user.repurchaseDueDate && (
                    <p>
                      재구매 예정:{" "}
                      {new Date(user.repurchaseDueDate).toLocaleDateString(
                        "ko-KR"
                      )}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
