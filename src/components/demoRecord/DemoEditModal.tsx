"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import SearchAddressModal from "../SearchAddressModal";
import { Address } from "react-daum-postcode";
import {
  Paperclip,
  Plus,
  Minus,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  Presentation,
} from "lucide-react";
import { useUpdateDemo } from "@/hooks/(useDemo)/useDemoMutations";
import { toast } from "react-hot-toast";
import { DemoStatus } from "@/types/demo/demo";
import { DemoResponse } from "@/types/demo/demo";
import { authStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { hasWarehouseAccess } from "@/utils/warehousePermissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Modal } from "@/components/ui";
import { ItemSelectionModal } from "@/components/ui";
import { useWarehouseWithItems } from "@/hooks/useWarehouseWithItems";
import { Item } from "@/types/(item)/item";
import { Warehouse } from "@/types/warehouse";
import { ApiResponse } from "@/types/common";
import { uploadMultipleDemoFileById, deleteDemoFile } from "@/api/demo-api";
import { TeamItem } from "@/types/(item)/team-item";

interface DemoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoRecord: DemoResponse | null;
}

interface DemoItemWithDetails {
  teamItem: TeamItem;
  quantity: number;
  stockAvailable: boolean;
  stockQuantity: number;
  warehouseItemId: number;
  memo?: string;
}

const DemoEditModal: React.FC<DemoEditModalProps> = ({
  isOpen,
  onClose,
  demoRecord,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const selectedFiles = useRef<HTMLInputElement>(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // 기존 파일 관리 상태
  const [existingFiles, setExistingFiles] = useState<
    Array<{ id: number; fileName: string; fileUrl: string }>
  >([]);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const auth = authStore((state) => state.user);
  const { user } = useCurrentUser();

  // 아이템 관련 상태
  const [demoItems, setDemoItems] = useState<DemoItemWithDetails[]>([]);

  // ItemSelectionModal 상태 추가
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    handler: "",
    demoManager: "",
    demoManagerPhone: "",
    memo: "",
    demoTitle: "",
    demoNationType: "",
    demoAddress: "",
    demoPaymentType: "",
    demoPrice: undefined as number | undefined,
    demoPaymentDate: "",
    demoCurrencyUnit: "KRW",
    demoStartDate: "",
    demoStartTime: "",
    demoStartDeliveryMethod: "",
    demoEndDate: "",
    demoEndTime: "",
    demoEndDeliveryMethod: "",
    warehouseId: null as number | null,
  });

  // 훅 호출
  const { useUpdateDemo } = useUpdateDemo();
  const { mutate: updateDemo } = useUpdateDemo();
  const { warehousesList, warehouseItems, handleWarehouseChange } =
    useWarehouseWithItems();

  // 현재 창고의 아이템들
  const currentWarehouseItems = useMemo(() => {
    if (formData.warehouseId && warehouseItems[formData.warehouseId]) {
      return warehouseItems[formData.warehouseId];
    }
    return [];
  }, [formData.warehouseId, warehouseItems]);

  // 권한 확인
  const canEdit = () => {
    if (!auth || !demoRecord) return false;
    const isAdmin = auth.isAdmin;
    const isAuthor = demoRecord.userId === auth.id;
    if (isAdmin) return true;
    const isRequestedStatus = demoRecord.demoStatus === DemoStatus.requested;
    return isAuthor && isRequestedStatus;
  };

  const getPermissionMessage = () => {
    if (!auth) return "로그인이 필요합니다.";
    if (!demoRecord) return "시연 정보가 없습니다.";

    const isAdmin = auth.isAdmin;
    const isAuthor = demoRecord.userId === auth.id;
    const isRequestedStatus = demoRecord.demoStatus === DemoStatus.requested;

    if (isAdmin) return "관리자는 모든 시연을 수정할 수 있습니다.";
    if (isAuthor && isRequestedStatus)
      return "요청 상태의 시연만 수정할 수 있습니다.";
    if (!isAuthor) return "본인이 작성한 시연만 수정할 수 있습니다.";
    if (!isRequestedStatus)
      return "요청 상태가 아닌 시연은 수정할 수 없습니다.";

    return "수정 권한이 없습니다.";
  };

  // 초기 데이터 설정
  useEffect(() => {
    if (demoRecord) {
      setFormData({
        handler: demoRecord.handler || "",
        demoManager: demoRecord.demoManager || "",
        demoManagerPhone: demoRecord.demoManagerPhone || "",
        memo: demoRecord.memo || "",
        demoTitle: demoRecord.demoTitle || "",
        demoNationType: demoRecord.demoNationType || "",
        demoAddress: demoRecord.demoAddress || "",
        demoPaymentType: demoRecord.demoPaymentType || "",
        demoPrice: demoRecord.demoPrice,
        demoPaymentDate: demoRecord.demoPaymentDate || "",
        demoCurrencyUnit: "KRW",
        demoStartDate: demoRecord.demoStartDate || "",
        demoStartTime: demoRecord.demoStartTime || "",
        demoStartDeliveryMethod: demoRecord.demoStartDeliveryMethod || "",
        demoEndDate: demoRecord.demoEndDate || "",
        demoEndTime: demoRecord.demoEndTime || "",
        demoEndDeliveryMethod: demoRecord.demoEndDeliveryMethod || "",
        warehouseId: demoRecord.warehouseId || null,
      });

      // 기존 시연품 설정
      if (demoRecord.demoItems) {
        const itemsWithDetails: DemoItemWithDetails[] =
          demoRecord.demoItems.map((item) => ({
            teamItem: item.item.teamItem,
            quantity: item.quantity,
            stockAvailable: true, // 기본값
            stockQuantity: item.item.itemQuantity || 0,
            warehouseItemId: item.itemId,
            memo: item.memo || "",
          }));
        setDemoItems(itemsWithDetails);
      }

      // 기존 파일 설정
      if (demoRecord.files) {
        setExistingFiles(demoRecord.files);
      }
    }
  }, [demoRecord]);

  // 창고 변경 핸들러
  const handleWarehouseChangeWrapper = useCallback(
    (warehouseId: number) => {
      handleWarehouseChange(warehouseId);
      setFormData((prev) => ({ ...prev, warehouseId }));
    },
    [handleWarehouseChange]
  );

  // 폼 데이터 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 주소 변경 핸들러
  const handleAddressChange = (data: Address) => {
    setFormData((prev) => ({
      ...prev,
      demoAddress: `${data.address} ${data.buildingName}`.trim(),
    }));
    setIsAddressOpen(false);
  };

  // 날짜 변경 핸들러
  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "demoStartDate" | "demoEndDate" | "demoPaymentDate"
  ) => {
    setFormData((prev) => ({ ...prev, [type]: e.target.value }));
  };

  // 시연품 추가 핸들러
  const handleAddDemoItem = (item: Item) => {
    const existingItem = demoItems.find(
      (demoItem) => demoItem.teamItem.id === item.teamItem.id
    );

    if (existingItem) {
      setDemoItems((prev) =>
        prev.map((demoItem) =>
          demoItem.teamItem.id === item.teamItem.id
            ? { ...demoItem, quantity: demoItem.quantity + 1 }
            : demoItem
        )
      );
    } else {
      const newItem: DemoItemWithDetails = {
        teamItem: item.teamItem,
        quantity: 1,
        stockAvailable: item.itemQuantity > 0,
        stockQuantity: item.itemQuantity || 0,
        warehouseItemId: item.id,
        memo: "",
      };
      setDemoItems((prev) => [...prev, newItem]);
    }
  };

  // 시연품 수량 변경 핸들러
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setDemoItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // 시연품 제거 핸들러
  const handleRemoveDemoItem = (index: number) => {
    setDemoItems((prev) => prev.filter((_, i) => i !== index));
  };

  // 시연품 메모 변경 핸들러
  const handleDemoItemMemoChange = (index: number, memo: string) => {
    setDemoItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, memo } : item))
    );
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async () => {
    if (!demoRecord || files.length === 0) return;

    setIsFileUploading(true);
    try {
      const response = await uploadMultipleDemoFileById(
        demoRecord.id,
        files,
        30
      );

      if (response.success) {
        toast.success("파일이 업로드되었습니다.");
        setFiles([]);
        // 파일 목록 새로고침
        queryClient.invalidateQueries({ queryKey: ["demo", demoRecord.id] });
      } else {
        toast.error("파일 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("파일 업로드 오류:", error);
      toast.error("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsFileUploading(false);
    }
  };

  // 파일 삭제 핸들러
  const handleDeleteFile = async (fileId: number) => {
    if (!demoRecord) return;

    try {
      const response = await deleteDemoFile(fileId);
      if (response.success) {
        toast.success("파일이 삭제되었습니다.");
        setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
      } else {
        toast.error("파일 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("파일 삭제 오류:", error);
      toast.error("파일 삭제 중 오류가 발생했습니다.");
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit()) {
      toast.error(getPermissionMessage());
      return;
    }

    if (!demoRecord) {
      toast.error("시연 정보가 없습니다.");
      return;
    }

    // 폼 검증
    if (!formData.handler.trim()) {
      toast.error("행사 담당자를 입력해주세요.");
      return;
    }
    if (!formData.demoManager.trim()) {
      toast.error("시연 담당자를 입력해주세요.");
      return;
    }
    if (!formData.demoTitle.trim()) {
      toast.error("시연 제목을 입력해주세요.");
      return;
    }
    if (!formData.demoAddress.trim()) {
      toast.error("시연 주소를 입력해주세요.");
      return;
    }
    if (demoItems.length === 0) {
      toast.error("시연품을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 날짜 포맷팅 함수
      const formatDateToISO = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const updateData = {
        handler: formData.handler,
        demoManager: formData.demoManager,
        demoManagerPhone: formData.demoManagerPhone,
        memo: formData.memo,
        demoTitle: formData.demoTitle,
        demoNationType: formData.demoNationType,
        demoAddress: formData.demoAddress,
        demoPaymentType: formData.demoPaymentType,
        demoPrice: formData.demoPrice,
        demoPaymentDate: formData.demoPaymentDate
          ? formatDateToISO(formData.demoPaymentDate)
          : undefined,
        demoStartDate: formData.demoStartDate
          ? formatDateToISO(formData.demoStartDate)
          : undefined,
        demoStartTime: formData.demoStartTime,
        demoStartDeliveryMethod: formData.demoStartDeliveryMethod,
        demoEndDate: formData.demoEndDate
          ? formatDateToISO(formData.demoEndDate)
          : undefined,
        demoEndTime: formData.demoEndTime,
        demoEndDeliveryMethod: formData.demoEndDeliveryMethod,
        warehouseId: formData.warehouseId,
        demoItems: demoItems.map((item) => ({
          itemId: item.warehouseItemId,
          quantity: item.quantity,
          memo: item.memo || "",
        })),
      };

      updateDemo(
        { id: demoRecord.id, data: updateData },
        {
          onSuccess: () => {
            toast.success("시연이 수정되었습니다.");
            onClose();
          },
          onError: () => {
            toast.error("시연 수정에 실패했습니다.");
          },
        }
      );
    } catch (error) {
      console.error("시연 수정 오류:", error);
      toast.error("시연 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // 파일 제거 핸들러
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  if (!demoRecord) {
    return null;
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">시연 수정</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* 권한 확인 메시지 */}
          {!canEdit() && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800">
                  {getPermissionMessage()}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 섹션 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  기본 정보
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    행사 담당자 *
                  </label>
                  <input
                    type="text"
                    name="handler"
                    value={formData.handler}
                    onChange={handleChange}
                    disabled={!canEdit()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="행사 담당자명"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시연 담당자 *
                  </label>
                  <input
                    type="text"
                    name="demoManager"
                    value={formData.demoManager}
                    onChange={handleChange}
                    disabled={!canEdit()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="시연 담당자명"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시연 담당자 연락처
                  </label>
                  <input
                    type="tel"
                    name="demoManagerPhone"
                    value={formData.demoManagerPhone}
                    onChange={handleChange}
                    disabled={!canEdit()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  시연 정보
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시연 제목 *
                  </label>
                  <input
                    type="text"
                    name="demoTitle"
                    value={formData.demoTitle}
                    onChange={handleChange}
                    disabled={!canEdit()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="시연/행사명"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시연 유형
                  </label>
                  <select
                    name="demoNationType"
                    value={formData.demoNationType}
                    onChange={handleChange}
                    disabled={!canEdit()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">선택해주세요</option>
                    <option value="국내행사">국내행사</option>
                    <option value="해외행사">해외행사</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    결제 유형
                  </label>
                  <select
                    name="demoPaymentType"
                    value={formData.demoPaymentType}
                    onChange={handleChange}
                    disabled={!canEdit()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">선택해주세요</option>
                    <option value="무료">무료</option>
                    <option value="유료">유료</option>
                  </select>
                </div>

                {formData.demoPaymentType === "유료" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시연 가격
                    </label>
                    <input
                      type="number"
                      name="demoPrice"
                      value={formData.demoPrice || ""}
                      onChange={handleChange}
                      disabled={!canEdit()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="가격을 입력하세요"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 시연 일정 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">시연 일정</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">상차 정보</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상차 날짜
                    </label>
                    <input
                      type="date"
                      name="demoStartDate"
                      value={formData.demoStartDate}
                      onChange={(e) => handleDateChange(e, "demoStartDate")}
                      disabled={!canEdit()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상차 시간
                    </label>
                    <input
                      type="time"
                      name="demoStartTime"
                      value={formData.demoStartTime}
                      onChange={handleChange}
                      disabled={!canEdit()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상차 방법
                    </label>
                    <select
                      name="demoStartDeliveryMethod"
                      value={formData.demoStartDeliveryMethod}
                      onChange={handleChange}
                      disabled={!canEdit()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">선택해주세요</option>
                      <option value="직접배송">직접배송</option>
                      <option value="택배">택배</option>
                      <option value="용차">용차</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">하차 정보</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      하차 날짜
                    </label>
                    <input
                      type="date"
                      name="demoEndDate"
                      value={formData.demoEndDate}
                      onChange={(e) => handleDateChange(e, "demoEndDate")}
                      disabled={!canEdit()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      하차 시간
                    </label>
                    <input
                      type="time"
                      name="demoEndTime"
                      value={formData.demoEndTime}
                      onChange={handleChange}
                      disabled={!canEdit()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      하차 방법
                    </label>
                    <select
                      name="demoEndDeliveryMethod"
                      value={formData.demoEndDeliveryMethod}
                      onChange={handleChange}
                      disabled={!canEdit()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">선택해주세요</option>
                      <option value="직접회수">직접회수</option>
                      <option value="택배">택배</option>
                      <option value="용차">용차</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 시연 주소 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">시연 주소</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시연 주소 *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="demoAddress"
                    value={formData.demoAddress}
                    onChange={handleChange}
                    disabled={!canEdit()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="시연 주소를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddressOpen(true)}
                    disabled={!canEdit()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    주소 검색
                  </button>
                </div>
              </div>
            </div>

            {/* 시연품 섹션 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">시연품</h3>
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(true)}
                  disabled={!canEdit()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                  시연품 추가
                </button>
              </div>

              {demoItems.length > 0 ? (
                <div className="space-y-3">
                  {demoItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.teamItem.itemName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.teamItem.itemCode}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(index, item.quantity - 1)
                          }
                          disabled={!canEdit() || item.quantity <= 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}개
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(index, item.quantity + 1)
                          }
                          disabled={!canEdit()}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.memo || ""}
                        onChange={(e) =>
                          handleDemoItemMemoChange(index, e.target.value)
                        }
                        disabled={!canEdit()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="메모"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveDemoItem(index)}
                        disabled={!canEdit()}
                        className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  시연품을 추가해주세요.
                </div>
              )}
            </div>

            {/* 메모 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">메모</h3>

              <textarea
                name="memo"
                value={formData.memo}
                onChange={handleChange}
                disabled={!canEdit()}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="시연 관련 특이사항을 입력하세요"
              />
            </div>

            {/* 파일 업로드 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">첨부파일</h3>

              {/* 기존 파일 목록 */}
              {existingFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">기존 파일</h4>
                  {existingFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {file.fileName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        disabled={!canEdit()}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 새 파일 업로드 */}
              {canEdit() && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">새 파일 추가</h4>

                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">
                      파일을 드래그하여 업로드하거나 클릭하여 선택하세요
                    </p>
                    <input
                      ref={selectedFiles}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => selectedFiles.current?.click()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      파일 선택
                    </button>
                  </div>

                  {/* 선택된 파일 목록 */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={isFileUploading}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
                      >
                        {isFileUploading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            업로드 중...
                          </div>
                        ) : (
                          "파일 업로드"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!canEdit() || isSubmitting}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    수정 중...
                  </div>
                ) : (
                  "시연 수정"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 주소 검색 모달 */}
      <SearchAddressModal
        isOpen={isAddressOpen}
        onClose={() => setIsAddressOpen(false)}
        onAddressSelect={handleAddressChange}
      />

      {/* 아이템 선택 모달 */}
      <ItemSelectionModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onItemSelect={handleAddDemoItem}
        warehouseItems={currentWarehouseItems}
        title="시연품 선택"
      />
    </>
  );
};

export default DemoEditModal;
