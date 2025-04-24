/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UpdateItemQuantityRequest } from "@/types/item";
import { SearchOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { useItems } from "@/hooks/useItems";
import { CreateInventoryRecordRequest } from "@/types/inventory-record";
import EditQuantityModal from "./modal/EditQuantityModal";
import InboundModal from "./modal/InboundModal";
import OutboundModal from "./modal/OutboundModal";
import { inventoryRecordService } from "@/services/inventoryRecordService";
import { authService } from "@/services/authService";

// 파일 타입 정의 추가
export interface AttachedFile {
  file: File;
  preview: string;
  name: string;
  type: string;
  size: number;
}

export interface StockTableFormValues extends CreateInventoryRecordRequest {
  inboundDate?: string | null;
  outboundDate?: string | null;
  inboundPlace?: string | null;
  inboundAddress?: string | null;
  inboundAddressDetail?: string | null;
  outboundPlace?: string | null;
  outboundAddress?: string | null;
  outboundAddressDetail?: string | null;
  inboundQuantity?: number | null;
  outboundQuantity?: number | null;
  remarks?: string | null;
  supplierId?: number | null;
  packageId?: number | null;
  itemId?: number | null;
  userId?: number | null;
  name?: string | null;
  description?: string | null;
  warehouseId: number | null;
  attachedFiles?: AttachedFile[]; // 첨부파일 필드 추가
}

export default function StockTable() {
  const router = useRouter();
  const {
    items,
    warehouses,
    isLoading,
    isError,
    invalidateInventory,
    refetchAll,
  } = useWarehouseItems();
  const { useUpdateItemQuantity } = useItems();
  const updateQuantityMutation = useUpdateItemQuantity();
  const [isEditQuantityModalOpen, setIsEditQuantityModalOpen] = useState(false);
  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [hideZeroStock, setHideZeroStock] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [selectedInboundItem, setSelectedInboundItem] = useState<any | null>(
    null
  );
  const [selectedOutboundItem, setSelectedOutboundItem] = useState<any | null>(
    null
  );

  const [quantityEditValues, setQuantityEditValues] = useState<{
    itemId: number | null;
    itemCode: string;
    itemName: string;
    currentQuantity: number;
    newQuantity: number;
    warehouseId: number;
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    currentQuantity: 0,
    newQuantity: 0,
    warehouseId: 0,
  });

  const [inboundValues, setInboundValues] = useState<{
    itemId: number | null;
    itemCode: string;
    itemName: string;
    quantity: number;
    date: string;
    inboundPlace: string;
    inboundAddress: string;
    inboundAddressDetail: string;
    remarks: string;
    warehouseId: number;
    attachedFiles: AttachedFile[];
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
    inboundPlace: "",
    inboundAddress: "",
    inboundAddressDetail: "",
    remarks: "",
    warehouseId: 0,
    attachedFiles: [],
  });

  const [outboundValues, setOutboundValues] = useState<{
    itemId: number | null;
    itemCode: string;
    itemName: string;
    currentQuantity: number;
    quantity: number;
    date: string;
    outboundPlace: string;
    outboundAddress: string;
    outboundAddressDetail: string;
    remarks: string;
    warehouseId: number;
    attachedFiles: AttachedFile[];
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    currentQuantity: 0,
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
    outboundPlace: "",
    outboundAddress: "",
    outboundAddressDetail: "",
    remarks: "",
    warehouseId: 0,
    attachedFiles: [],
  });

  // 페이지 초기 로드 시 데이터 리페치
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("StockTable: 초기 데이터 리페치 시작");

        // 팀 정보 먼저 갱신 (zustand 스토어 업데이트)
        await authService.refreshSelectedTeam();
        console.log("StockTable: 팀 정보 갱신 완료");

        // 이후 창고 및 아이템 데이터 리페치
        await refetchAll();
        console.log("StockTable: 초기 데이터 리페치 완료");
      } catch (error) {
        console.error("StockTable: 데이터 리페치 중 오류 발생", error);
      }
    };

    fetchData();
  }, []);

  // 페이지 로드 시 첫 번째 창고 자동 선택 (수정된 버전)
  useEffect(() => {
    // 데이터가 로드되고 창고 목록이 있을 때
    if (!isLoading && warehouses && warehouses.length > 0) {
      console.log("창고 목록 로드됨:", warehouses);

      // 선택된 창고가 없으면 첫 번째 창고 선택
      if (selectedWarehouseId === null) {
        const firstWarehouseId = Number(warehouses[0].id);
        console.log("첫 번째 창고 자동 선택:", firstWarehouseId);
        setSelectedWarehouseId(firstWarehouseId);
      }
    }
  }, [isLoading, warehouses]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleOpenEditQuantityModal = (item: any) => {
    setQuantityEditValues({
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      currentQuantity: item.itemQuantity,
      newQuantity: item.itemQuantity,
      warehouseId: item.warehouseId,
    });
    setIsEditQuantityModalOpen(true);
  };

  const handleCloseEditQuantityModal = () => {
    setIsEditQuantityModalOpen(false);
  };

  const handleOpenInboundModal = (warehouseId: number) => {
    setInboundValues({
      ...inboundValues,
      warehouseId,
      itemId: null,
      itemCode: "",
      itemName: "",
    });
    setSelectedWarehouseId(warehouseId);
    setSelectedInboundItem(null);
    setIsInboundModalOpen(true);
  };

  const handleCloseInboundModal = () => {
    setIsInboundModalOpen(false);
    setSelectedInboundItem(null);
  };

  const handleOpenOutboundModal = (warehouseId: number) => {
    setOutboundValues({
      ...outboundValues,
      warehouseId,
      itemId: null,
      itemCode: "",
      itemName: "",
      currentQuantity: 0,
    });
    setSelectedWarehouseId(warehouseId);
    setSelectedOutboundItem(null);
    setIsOutboundModalOpen(true);
  };

  const handleCloseOutboundModal = () => {
    setIsOutboundModalOpen(false);
    setSelectedOutboundItem(null);
  };

  const handleQuantityEditFormChange = (
    field: string,
    value: string | number
  ) => {
    setQuantityEditValues({
      ...quantityEditValues,
      [field]: value,
    });
  };

  const handleInboundFormChange = (
    field: string,
    value: string | number | null | AttachedFile[]
  ) => {
    if (field === "itemId") {
      const selectedItem = items.find((item) => item.id === value);
      setSelectedInboundItem(selectedItem || null);

      if (selectedItem) {
        setInboundValues({
          ...inboundValues,
          itemId: selectedItem.id,
          itemCode: selectedItem.itemCode,
          itemName: selectedItem.itemName,
        });
      } else {
        setInboundValues({
          ...inboundValues,
          itemId: null,
          itemCode: "",
          itemName: "",
        });
      }
    } else {
      setInboundValues({
        ...inboundValues,
        [field]: value,
      });
    }
  };

  const handleOutboundFormChange = (
    field: string,
    value: string | number | null | AttachedFile[]
  ) => {
    if (field === "itemId") {
      const selectedItem = items.find((item) => item.id === value);
      setSelectedOutboundItem(selectedItem || null);

      if (selectedItem) {
        setOutboundValues({
          ...outboundValues,
          itemId: selectedItem.id,
          itemCode: selectedItem.itemCode,
          itemName: selectedItem.itemName,
          currentQuantity: selectedItem.itemQuantity,
        });
      } else {
        setOutboundValues({
          ...outboundValues,
          itemId: null,
          itemCode: "",
          itemName: "",
          currentQuantity: 0,
        });
      }
    } else {
      setOutboundValues({
        ...outboundValues,
        [field]: value,
      });
    }
  };

  // 파일 업로드 처리 함수 (입고)
  const handleInboundFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((file) => {
      // 파일 미리보기 URL 생성
      const preview = URL.createObjectURL(file);

      return {
        file,
        preview,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    });

    setInboundValues({
      ...inboundValues,
      attachedFiles: [...inboundValues.attachedFiles, ...newFiles],
    });
  };

  // 파일 업로드 처리 함수 (출고)
  const handleOutboundFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((file) => {
      // 파일 미리보기 URL 생성
      const preview = URL.createObjectURL(file);

      return {
        file,
        preview,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    });

    setOutboundValues({
      ...outboundValues,
      attachedFiles: [...outboundValues.attachedFiles, ...newFiles],
    });
  };

  // 파일 삭제 처리 함수 (입고)
  const handleInboundFileDelete = (index: number) => {
    const updatedFiles = [...inboundValues.attachedFiles];

    // 미리보기 URL 해제
    URL.revokeObjectURL(updatedFiles[index].preview);

    // 파일 배열에서 제거
    updatedFiles.splice(index, 1);

    setInboundValues({
      ...inboundValues,
      attachedFiles: updatedFiles,
    });
  };

  // 파일 삭제 처리 함수 (출고)
  const handleOutboundFileDelete = (index: number) => {
    const updatedFiles = [...outboundValues.attachedFiles];

    // 미리보기 URL 해제
    URL.revokeObjectURL(updatedFiles[index].preview);

    // 파일 배열에서 제거
    updatedFiles.splice(index, 1);

    setOutboundValues({
      ...outboundValues,
      attachedFiles: updatedFiles,
    });
  };

  const handleUpdateQuantity = () => {
    if (!quantityEditValues.itemId) return;

    try {
      const data: UpdateItemQuantityRequest = {
        quantity: quantityEditValues.newQuantity,
      };

      updateQuantityMutation.mutate(
        {
          id: quantityEditValues.itemId.toString(),
          data,
          itemWarehouseId: quantityEditValues.warehouseId.toString(),
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              // 재고 기록 생성
              const recordData: CreateInventoryRecordRequest = {
                itemId: quantityEditValues.itemId,
                name: quantityEditValues.itemName,
                price: 0, // price는 항상 0으로 설정
                remarks: "", // 빈 문자열로 설정
              };

              // 수량 변화에 따라 입고 또는 출고 수량 설정
              const currentQuantity = quantityEditValues.currentQuantity;
              const newQuantity = quantityEditValues.newQuantity;

              if (newQuantity > currentQuantity) {
                // 수량 증가 (입고)
                recordData.inboundQuantity = newQuantity - currentQuantity;
                recordData.inboundDate = new Date().toISOString();
                // quantity는 양수로 설정 (입고)
                recordData.quantity = newQuantity - currentQuantity;
              } else if (newQuantity < currentQuantity) {
                // 수량 감소 (출고)
                recordData.outboundQuantity = currentQuantity - newQuantity;
                recordData.outboundDate = new Date().toISOString();
                // quantity는 음수로 설정 (출고)
                recordData.quantity = -(currentQuantity - newQuantity);
              }

              // 재고 기록 저장
              inventoryRecordService.createInventoryRecord(recordData, () =>
                invalidateInventory(quantityEditValues.warehouseId.toString())
              );

              alert("재고 수량이 성공적으로 업데이트되었습니다.");
              handleCloseEditQuantityModal();
            } else {
              alert(
                `오류 발생: ${
                  response.message || "알 수 없는 오류가 발생했습니다."
                }`
              );
            }
          },
          onError: (error) => {
            console.error("수량 업데이트 중 오류 발생:", error);
            alert("수량 업데이트 중 오류가 발생했습니다.");
          },
        }
      );
    } catch (error) {
      console.error("수량 업데이트 중 오류 발생:", error);
      alert("수량 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleSubmitInbound = () => {
    if (!inboundValues.itemId) return;

    try {
      const newTotalQuantity =
        (getItemById(inboundValues.itemId)?.itemQuantity || 0) +
        inboundValues.quantity;
      const data: UpdateItemQuantityRequest = {
        quantity: newTotalQuantity,
      };

      // 주소와 상세주소 합치기
      const fullAddress =
        inboundValues.inboundAddress +
        (inboundValues.inboundAddressDetail
          ? ` ${inboundValues.inboundAddressDetail}`
          : "");

      updateQuantityMutation.mutate(
        {
          id: inboundValues.itemId.toString(),
          data,
          itemWarehouseId: inboundValues.warehouseId.toString(),
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              // 입고 기록 생성
              const recordData: CreateInventoryRecordRequest = {
                itemId: inboundValues.itemId,
                inboundQuantity: inboundValues.quantity,
                inboundDate: inboundValues.date,
                inboundPlace: inboundValues.inboundPlace, // 입고처 필드 사용
                inboundAddress: fullAddress, // 합쳐진 주소 사용 (기본주소 + 상세주소)
                remarks: inboundValues.remarks,
                name: inboundValues.itemName,
                price: 0, // price는 항상 0으로 설정
                // 자동으로 quantity 계산 (입고는 양수)
                quantity: inboundValues.quantity,
                // 첨부파일 추가 (서버 구현 필요)
                // attachedFiles: inboundValues.attachedFiles
              };

              // 재고 기록 저장
              inventoryRecordService.createInventoryRecord(recordData, () =>
                invalidateInventory(inboundValues.warehouseId.toString())
              );

              alert("입고가 성공적으로 처리되었습니다.");
              handleCloseInboundModal();
            } else {
              alert(
                `오류 발생: ${
                  response.message || "알 수 없는 오류가 발생했습니다."
                }`
              );
            }
          },
          onError: (error) => {
            console.error("입고 처리 중 오류 발생:", error);
            alert("입고 처리 중 오류가 발생했습니다.");
          },
        }
      );
    } catch (error) {
      console.error("입고 처리 중 오류 발생:", error);
      alert("입고 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSubmitOutbound = () => {
    if (!outboundValues.itemId) return;

    try {
      const currentQuantity =
        getItemById(outboundValues.itemId)?.itemQuantity || 0;

      if (outboundValues.quantity > currentQuantity) {
        alert("출고 수량이 현재 재고보다 많습니다.");
        return;
      }

      // 주소와 상세주소 합치기
      const fullAddress =
        outboundValues.outboundAddress +
        (outboundValues.outboundAddressDetail
          ? ` ${outboundValues.outboundAddressDetail}`
          : "");

      const newTotalQuantity = currentQuantity - outboundValues.quantity;
      const data: UpdateItemQuantityRequest = {
        quantity: newTotalQuantity,
      };

      updateQuantityMutation.mutate(
        {
          id: outboundValues.itemId.toString(),
          data,
          itemWarehouseId: outboundValues.warehouseId.toString(),
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              // 출고 기록 생성
              const recordData: CreateInventoryRecordRequest = {
                itemId: outboundValues.itemId,
                outboundQuantity: outboundValues.quantity,
                outboundDate: outboundValues.date,
                outboundPlace: outboundValues.outboundPlace,
                outboundAddress: fullAddress, // 합쳐진 주소 사용 (기본주소 + 상세주소)
                remarks: outboundValues.remarks,
                name: outboundValues.itemName,
                price: 0, // price는 항상 0으로 설정
                // 자동으로 quantity 계산 (출고는 음수)
                quantity: -outboundValues.quantity,
                // 첨부파일 추가 (서버 구현 필요)
                // attachedFiles: outboundValues.attachedFiles
                // 임시로 비활성화됨
                // warehouseId: outboundValues.warehouseId
              };

              // 재고 기록 저장
              inventoryRecordService.createInventoryRecord(recordData, () =>
                invalidateInventory(outboundValues.warehouseId.toString())
              );

              alert("출고가 성공적으로 처리되었습니다.");
              handleCloseOutboundModal();
            } else {
              alert(
                `오류 발생: ${
                  response.message || "알 수 없는 오류가 발생했습니다."
                }`
              );
            }
          },
          onError: (error) => {
            console.error("출고 처리 중 오류 발생:", error);
            alert("출고 처리 중 오류가 발생했습니다.");
          },
        }
      );
    } catch (error) {
      console.error("출고 처리 중 오류 발생:", error);
      alert("출고 처리 중 오류가 발생했습니다.");
    }
  };

  // 창고별로 아이템 필터링
  const getWarehouseItems = (warehouseId: number) => {
    return items.filter((item) => item.warehouseId === warehouseId);
  };

  // 아이템 ID로 아이템 찾기
  const getItemById = (itemId: number) => {
    return items.find((item) => item.id === itemId);
  };

  // 검색 기능
  const getFilteredItems = (warehouseItems: any[]) => {
    return warehouseItems.filter((item) => {
      const matchesSearch =
        item.itemCode.toLowerCase().includes(searchText.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchText.toLowerCase());

      const passesZeroFilter = hideZeroStock ? item.itemQuantity > 0 : true;

      return matchesSearch && passesZeroFilter;
    });
  };

  // 창고 선택 핸들러
  const handleWarehouseSelect = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    // 창고 선택 시 최신 데이터로 리프레시
    refetchAll();
  };

  if (isLoading)
    return <div className="p-4 text-center">데이터를 불러오는 중...</div>;
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );

  return (
    <>
      <div key="warehouse-container" className="overflow-x-auto relative">
        {/* 창고 선택 카드 목록 */}
        <div className="mb-6 px-4">
          <h2 className="text-xl font-bold mb-4">창고 선택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {warehouses.map((warehouse) => (
              <div
                key={`warehouse-card-${warehouse.id}`}
                className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
                  selectedWarehouseId === Number(warehouse.id)
                    ? "bg-blue-500 text-white ring-2 ring-blue-600 transform scale-105"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => handleWarehouseSelect(Number(warehouse.id))}
              >
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    selectedWarehouseId === Number(warehouse.id)
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {warehouse.warehouseName}
                </h3>
                <div
                  className={`text-sm ${
                    selectedWarehouseId === Number(warehouse.id)
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {getWarehouseItems(Number(warehouse.id)).length}개 품목
                </div>
                {warehouse.warehouseAddress && (
                  <div
                    className={`text-sm mt-1 truncate ${
                      selectedWarehouseId === Number(warehouse.id)
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {warehouse.warehouseAddress}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedWarehouseId && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4 m-4">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="품목코드 또는 품목명 검색..."
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm"
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <SearchOutlined className="absolute right-3 top-2.5 text-gray-400 text-sm" />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hideZeroStock"
                    checked={hideZeroStock}
                    onChange={(e) => setHideZeroStock(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-400 h-4 w-4"
                  />
                  <label
                    htmlFor="hideZeroStock"
                    className="ml-2 text-sm text-gray-700"
                  >
                    재고가 0인 품목 숨기기
                  </label>
                </div>
              </div>
            </div>

            {/* 선택된 창고 정보 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-xl font-bold">
                  {warehouses.find((w) => Number(w.id) === selectedWarehouseId)
                    ?.warehouseName || `창고 ${selectedWarehouseId}`}
                </h2>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenInboundModal(selectedWarehouseId)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    입고
                  </button>
                  <button
                    onClick={() => handleOpenOutboundModal(selectedWarehouseId)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H4"
                      />
                    </svg>
                    출고
                  </button>
                </div>
              </div>

              {/* 창고 주소 표시 */}
              <div className="mb-4 px-4">
                <p className="text-sm text-gray-500">
                  {warehouses.find((w) => Number(w.id) === selectedWarehouseId)
                    ?.warehouseAddress || "주소 정보가 없습니다."}
                </p>
              </div>

              {/* 선택된 창고의 재고 테이블 */}
              <table className="mx-3 my-2 bg-white rounded-2xl overflow-hidden shadow-sm w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-1/12">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      품목 코드
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      품목명
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      재고수량
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      최종수정일
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-1/12">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(() => {
                    const warehouseItems =
                      getWarehouseItems(selectedWarehouseId);
                    const filteredItems = getFilteredItems(warehouseItems);

                    return filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="py-6">
                            <p className="text-lg text-gray-500 mb-4">
                              창고가 비었습니다.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, itemIndex) => (
                        <tr
                          key={`item-${selectedWarehouseId}-${item.id}-${itemIndex}`}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                              onClick={() =>
                                router.push(`/item/detail/${item.id}`)
                              }
                            >
                              {item.itemCode}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                              onClick={() =>
                                router.push(`/item/detail/${item.id}`)
                              }
                            >
                              {item.itemName}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                            {item.itemQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(item.updatedAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex justify-center">
                              <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-150 shadow-sm"
                                onClick={() =>
                                  handleOpenEditQuantityModal(item)
                                }
                              >
                                수정
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!selectedWarehouseId && warehouses.length > 0 && (
          <div className="text-center py-10 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium">창고를 선택해주세요</h3>
            <p className="mt-1 text-sm">
              위의 창고 목록에서 창고를 선택하면 해당 창고의 재고가 표시됩니다.
            </p>
          </div>
        )}

        <EditQuantityModal
          isOpen={isEditQuantityModalOpen}
          onClose={handleCloseEditQuantityModal}
          quantityEditValues={quantityEditValues}
          onFormChange={handleQuantityEditFormChange}
          onUpdateQuantity={handleUpdateQuantity}
        />
        <InboundModal
          isOpen={isInboundModalOpen}
          onClose={handleCloseInboundModal}
          inboundValues={inboundValues}
          onFormChange={handleInboundFormChange}
          onSubmitInbound={handleSubmitInbound}
          warehouseItems={
            selectedWarehouseId ? getWarehouseItems(selectedWarehouseId) : []
          }
          selectedItem={selectedInboundItem}
          onFileUpload={handleInboundFileUpload}
          onFileDelete={handleInboundFileDelete}
        />
        <OutboundModal
          isOpen={isOutboundModalOpen}
          onClose={handleCloseOutboundModal}
          outboundValues={outboundValues}
          onFormChange={handleOutboundFormChange}
          onSubmitOutbound={handleSubmitOutbound}
          warehouseItems={
            selectedWarehouseId ? getWarehouseItems(selectedWarehouseId) : []
          }
          selectedItem={selectedOutboundItem}
          onFileUpload={handleOutboundFileUpload}
          onFileDelete={handleOutboundFileDelete}
        />
      </div>
    </>
  );
}
