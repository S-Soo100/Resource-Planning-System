"use client";

import React, { useState } from "react";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";
import { useParams } from "next/navigation";
import { useInventoryRecordsByTeamId } from "@/hooks/useInventoryRecordsByTeamId";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Item } from "@/types/(item)/item";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import ItemQuantityHistory from "@/components/item/ItemQuantityHistory";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTeamItems } from "@/hooks/useTeamItems";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getRecordPurposeLabel } from "@/constants/recordPurpose";

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = params.id as string;
  const { useGetItem } = useItemStockManagement();
  const { data: itemResponse, isLoading: isItemLoading } = useGetItem(itemId);
  const { records, isLoading: isRecordsLoading } =
    useInventoryRecordsByTeamId();
  const { warehouses } = useWarehouseItems();
  const { user } = useCurrentUser();
  const { useUpdateTeamItem } = useTeamItems();
  const { updateTeamItemAsync } = useUpdateTeamItem();
  const queryClient = useQueryClient();

  // 단가 편집 상태 관리
  const [isEditingCostPrice, setIsEditingCostPrice] = useState(false);
  const [editedCostPrice, setEditedCostPrice] = useState<string>("");

  const item = itemResponse?.data as Item | undefined;
  const warehouse = warehouses.find((w) => w.id === item?.warehouseId);

  // 현재 품목의 입출고 내역만 필터링
  const itemRecords = records.filter(
    (record) => record.itemId === Number(itemId)
  );

  // 단가 편집 시작
  const handleCostPriceClick = () => {
    if ((user?.accessLevel !== "admin" && user?.accessLevel !== "moderator") || !item) return;
    setIsEditingCostPrice(true);
    setEditedCostPrice(
      item.teamItem.costPrice?.toString() || ""
    );
  };

  // 단가 저장
  const handleCostPriceSave = async () => {
    if (!item) return;

    try {
      const newCostPrice = editedCostPrice.trim() === ""
        ? null
        : Number(editedCostPrice);

      // 숫자가 아닌 경우 에러 처리
      if (editedCostPrice.trim() !== "" && isNaN(newCostPrice as number)) {
        alert("올바른 숫자를 입력해주세요.");
        return;
      }

      const result = await updateTeamItemAsync({
        id: item.teamItem.id,
        teamItemDto: {
          itemCode: item.teamItem.itemCode,
          itemName: item.teamItem.itemName,
          memo: item.teamItem.memo,
          teamId: item.teamItem.teamId,
          categoryId: item.teamItem.categoryId || null,
          costPrice: newCostPrice as number | undefined,
        },
      });

      if (result.success) {
        // Item 쿼리 캐시 무효화하여 최신 데이터 가져오기
        queryClient.invalidateQueries({
          queryKey: ["item", itemId],
        });
        // Items 목록도 무효화
        queryClient.invalidateQueries({
          queryKey: ["items"],
        });
        // TeamItems 무효화
        queryClient.invalidateQueries({
          queryKey: ["teamItems"],
        });
        // 구매 페이지 캐시 무효화 (모든 필터 조합)
        queryClient.invalidateQueries({
          queryKey: ["purchase"],
          exact: false,
        });
        // 판매 페이지 캐시도 무효화
        queryClient.invalidateQueries({
          queryKey: ["sales"],
          exact: false,
        });

        toast.success("단가가 수정되었습니다.");
      }

      setIsEditingCostPrice(false);
    } catch (error) {
      console.error("단가 업데이트 실패:", error);
      toast.error("단가 수정에 실패했습니다.");
    }
  };

  // 단가 편집 취소
  const handleCostPriceCancel = () => {
    setIsEditingCostPrice(false);
    setEditedCostPrice("");
  };

  // Enter 키로 저장, Escape 키로 취소
  const handleCostPriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCostPriceSave();
    } else if (e.key === "Escape") {
      handleCostPriceCancel();
    }
  };

  if (isItemLoading || isRecordsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">품목을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">품목 상세 정보</h1>
          <p className="text-gray-600">품목의 상세 정보와 입출고 내역을 확인하세요</p>
        </div>

        {/* 품목 기본 정보 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          {/* 이미지 섹션 */}
          {item.teamItem.imageUrl && (
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <img
                  src={item.teamItem.imageUrl}
                  alt={item.teamItem.itemName}
                  className="w-56 h-56 object-cover rounded-xl border-4 border-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          )}

          {/* 창고 정보 */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-lg font-bold text-gray-800">
                  {warehouse?.warehouseName || "-"}
                </p>
              </div>
              {warehouse?.warehouseAddress && (
                <p className="text-sm text-gray-700 ml-7">
                  {warehouse.warehouseAddress}
                </p>
              )}
            </div>
          </div>

          {/* 품목 정보 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">품목 코드</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">{item.teamItem.itemCode}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">품목명</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">{item.teamItem.itemName}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-sm text-green-700 font-medium">현재 수량</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{item.itemQuantity} <span className="text-base font-normal">개</span></p>
            </div>

            {/* 단가 (Admin/Moderator 전용) */}
            {(user?.accessLevel === "admin" || user?.accessLevel === "moderator") && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 hover:border-purple-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-purple-700 font-medium">단가 (원가)</p>
                </div>
                {isEditingCostPrice ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedCostPrice}
                      onChange={(e) => setEditedCostPrice(e.target.value)}
                      onKeyDown={handleCostPriceKeyDown}
                      onBlur={handleCostPriceSave}
                      autoFocus
                      placeholder="단가 입력"
                      className="w-full px-3 py-2 border-2 border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
                    />
                    <span className="text-sm text-purple-600 font-medium whitespace-nowrap">원</span>
                  </div>
                ) : (
                  <p
                    onClick={handleCostPriceClick}
                    className="text-lg font-semibold text-purple-700 cursor-pointer hover:text-purple-600 hover:underline transition-colors flex items-center gap-1 group"
                  >
                    {item.teamItem.costPrice !== null && item.teamItem.costPrice !== undefined
                      ? (
                        <>
                          {item.teamItem.costPrice.toLocaleString()}
                          <span className="text-base font-normal">원</span>
                        </>
                      )
                      : (
                        <span className="flex items-center gap-1 text-purple-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          클릭하여 입력
                        </span>
                      )}
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">생성일</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(item.createdAt), "yyyy-MM-dd", { locale: ko })}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">최종 수정일</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(item.updatedAt), "yyyy-MM-dd", { locale: ko })}
              </p>
            </div>
          </div>
        </div>

        {/* 재고 변동 이력 (Admin/Moderator 전용) */}
        {(user?.accessLevel === "admin" || user?.accessLevel === "moderator") && (
          <div className="mb-6">
            <ItemQuantityHistory itemId={Number(itemId)} />
          </div>
        )}

        {/* 입출고 내역 (Admin/Moderator 전용) */}
        {(user?.accessLevel === "admin" || user?.accessLevel === "moderator") && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">입출고 내역</h2>
            {itemRecords.length > 0 && (
              <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                총 {itemRecords.length}건
              </span>
            )}
          </div>

          {itemRecords.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        날짜
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        구분
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        목적
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        수량
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        위치
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {itemRecords.map((record, index) => (
                      <tr
                        key={record.id}
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {format(
                            new Date(
                              record.inboundDate || record.outboundDate || ""
                            ),
                            "yyyy-MM-dd HH:mm",
                            { locale: ko }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${
                              record.inboundQuantity !== null
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                                : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {record.inboundQuantity !== null ? (
                              <>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                입고
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                출고
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {getRecordPurposeLabel(record.recordPurpose)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {record.inboundQuantity !== null && (
                            <span className="text-green-600">+</span>
                          )}
                          {record.outboundQuantity !== null && (
                            <span className="text-red-600">-</span>
                          )}
                          {record.inboundQuantity ??
                            record.outboundQuantity ??
                            "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {record.inboundLocation ||
                            record.outboundLocation ||
                            "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {record.remarks || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium">입출고 내역이 없습니다</p>
              <p className="text-sm mt-1">품목의 입출고가 발생하면 여기에 표시됩니다</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
