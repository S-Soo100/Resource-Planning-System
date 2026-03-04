"use client";

import { useRepurchaseDueUsers } from "@/hooks/useCustomerDocuments";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { usePermission } from "@/hooks/usePermission";
import { LoadingCentered } from "@/components/ui/Loading";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { RepurchaseDueUser } from "@/types/customer-document";

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

export default function RepurchasePage() {
  const { team } = useCurrentTeam();
  const { isSupplier } = usePermission();
  const {
    data: users = [],
    isLoading,
    refetch,
  } = useRepurchaseDueUsers(team?.id);

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
              재구매 예정 고객
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              재구매 예정일이 지난 고객 목록입니다
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      </div>

      {/* 요약 카드 */}
      {!isLoading && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">30일 이상 경과</p>
            <p className="text-2xl font-bold text-red-700">
              {
                users.filter((u) => getDaysOverdue(u.repurchaseDueDate) >= 30)
                  .length
              }
              명
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-600">14~29일 경과</p>
            <p className="text-2xl font-bold text-orange-700">
              {
                users.filter((u) => {
                  const days = getDaysOverdue(u.repurchaseDueDate);
                  return days >= 14 && days < 30;
                }).length
              }
              명
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600">전체</p>
            <p className="text-2xl font-bold text-blue-700">{users.length}명</p>
          </div>
        </div>
      )}

      {/* 목록 */}
      {isLoading ? (
        <LoadingCentered />
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500">
            재구매 예정 고객이 없습니다
          </p>
          <p className="text-sm text-gray-400 mt-1">
            모든 고객의 재구매 예정일이 아직 도래하지 않았습니다
          </p>
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
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    고객 유형
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
                {users.map((user: RepurchaseDueUser) => {
                  const daysOverdue = getDaysOverdue(user.repurchaseDueDate);
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {user.customerType ? (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
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
                        {user.repurchaseCycleMonths
                          ? `${user.repurchaseCycleMonths}개월`
                          : "3개월"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {new Date(user.repurchaseDueDate).toLocaleDateString(
                          "ko-KR"
                        )}
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
            {users.map((user: RepurchaseDueUser) => {
              const daysOverdue = getDaysOverdue(user.repurchaseDueDate);
              return (
                <div key={user.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
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
                      {user.customerType === "b2c"
                        ? "B2C"
                        : user.customerType === "b2b"
                          ? "B2B"
                          : "-"}{" "}
                      | 수급자: {user.isRecipient ? "O" : "-"}
                    </p>
                    <p>
                      주기: {user.repurchaseCycleMonths ?? 3}개월 | 예정일:{" "}
                      {new Date(user.repurchaseDueDate).toLocaleDateString(
                        "ko-KR"
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
