"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Calendar, User, Paperclip, X } from "lucide-react";
import DemoItemSelector, { SelectedDemoItem } from "./DemoItemSelector";
import { toast } from "react-hot-toast";
import { CreateDemoDto } from "@/types/demo/demo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import AddressSection from "@/components/common/AddressSection";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Address } from "react-daum-postcode";

// CreateDemoDto를 기반으로 하되 UI에 필요한 추가 필드들을 포함
interface DemonstrationFormData
  extends Omit<
    CreateDemoDto,
    | "orderItems"
    | "userId"
    | "supplierId"
    | "packageId"
    | "warehouseId"
    | "status"
  > {
  // UI에서 추가로 필요한 필드들
  eventName: string;
  eventType: string;
  eventPrice?: number;
  demonstrationStartDate: string;
  demonstrationStartTime: string;
  demonstrationEndDate: string;
  demonstrationEndTime: string;
  managerPhone: string;
  deliveryMethod: string;
  retrievalMethod: string;
  // 주소 관련 필드 추가
  address: string;
  detailAddress: string;
}

const SimpleDemonstrationForm: React.FC = () => {
  const { user } = useCurrentUser();
  const [selectedItems, setSelectedItems] = useState<SelectedDemoItem[]>([]);
  const [formData, setFormData] = useState<DemonstrationFormData>({
    requester: "",
    receiver: "",
    receiverPhone: "",
    receiverAddress: "",
    purchaseDate: "",
    outboundDate: "",
    installationDate: "",
    manager: "",
    memo: "",
    // UI 추가 필드들
    eventName: "",
    eventType: "",
    eventPrice: undefined,
    demonstrationStartDate: "",
    demonstrationStartTime: "",
    demonstrationEndDate: "",
    demonstrationEndTime: "",
    managerPhone: "",
    deliveryMethod: "",
    retrievalMethod: "",
    // 주소 관련 필드
    address: "",
    detailAddress: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 주소 검색 훅 사용
  const {
    isAddressOpen,
    handleAddressChange: handleAddressChangeFromHook,
    handleToggleAddressModal,
    handleCloseAddressModal,
  } = useAddressSearch();

  // 파일 업로드 훅 사용
  const fileUpload = useFileUpload();

  // 현재 사용자 정보로 신청자 설정
  React.useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({
        ...prev,
        requester: user.name,
      }));
    }
  }, [user]);

  // 폼 입력 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // eventPrice는 숫자로 변환
    if (name === "eventPrice") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 주소 변경 핸들러
  const handleAddressChange = (data: Address) => {
    handleAddressChangeFromHook(data, setFormData);
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const requiredFields = [
      { field: formData.eventName, name: "행사 명" },
      { field: formData.eventType, name: "행사 유형" },
      { field: formData.managerPhone, name: "담당자 연락처" },
      { field: formData.demonstrationStartDate, name: "물품 배송일" },
      { field: formData.demonstrationStartTime, name: "물품 배송 시간" },
      { field: formData.demonstrationEndDate, name: "시연 종료일" },
      { field: formData.demonstrationEndTime, name: "물품 회수 시간" },
      { field: formData.address, name: "물품 이동 장소" },
    ];

    for (const { field, name } of requiredFields) {
      if (!field.trim()) {
        toast.error(`${name}을 입력해주세요.`);
        return false;
      }
    }

    if (selectedItems.length === 0) {
      toast.error("시연 아이템을 선택해주세요.");
      return false;
    }

    return true;
  };

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 주소 정보를 receiverAddress에 결합
      const fullAddress = formData.detailAddress
        ? `${formData.address} ${formData.detailAddress}`
        : formData.address;

      // 여기에 실제 API 호출 로직을 구현
      const submitData = {
        ...formData,
        eventType: formData.eventType,
        eventPrice: formData.eventPrice,
        receiver: formData.manager, // 행사 담당자를 수령인으로 사용
        receiverPhone: formData.managerPhone, // 담당자 연락처를 수령인 연락처로 사용
        receiverAddress: fullAddress, // 주소와 세부주소를 결합
        purchaseDate: formData.demonstrationStartDate, // 시연 시작일을 구매 요청일로 사용
        outboundDate: formData.demonstrationEndDate, // 시연 종료일을 출고 예정일로 사용
        selectedItems: selectedItems.map((item) => ({
          category: "demo", // 카테고리 정보가 제거되었으므로 기본값 설정
          itemName: item.itemName,
          quantity: item.quantity,
        })),
        submittedAt: new Date().toISOString(),
        files: fileUpload.files.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      };

      console.log("시연 신청 데이터:", submitData);

      // 임시로 2초 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("시연 신청이 완료되었습니다!");

      // 폼 초기화 (신청자는 유지)
      setFormData({
        requester: user?.name || "",
        receiver: "",
        receiverPhone: "",
        receiverAddress: "",
        purchaseDate: "",
        outboundDate: "",
        installationDate: "",
        manager: "",
        memo: "",
        eventName: "",
        eventType: "",
        eventPrice: undefined,
        demonstrationStartDate: "",
        demonstrationStartTime: "",
        demonstrationEndDate: "",
        demonstrationEndTime: "",
        managerPhone: "",
        deliveryMethod: "",
        retrievalMethod: "",
        address: "",
        detailAddress: "",
      });
      setSelectedItems([]);
      fileUpload.resetFiles(); // 파일 업로드 훅 초기화
    } catch (error) {
      console.error("시연 신청 오류:", error);
      toast.error("시연 신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 mx-auto space-y-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">시연 신청</h1>
        <p className="text-gray-600">
          제품 시연을 위한 아이템 선택 및 신청 정보를 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 신청자 정보 */}
        <Card className="p-6">
          <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
            <User className="mr-2 w-5 h-5" />
            신청자 정보
          </h2>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              신청자
            </label>
            <Input
              type="text"
              name="requester"
              value={formData.requester}
              onChange={handleInputChange}
              placeholder="신청자명이 자동으로 설정됩니다"
              disabled
              className="bg-gray-50"
            />
          </div>
        </Card>

        {/* 행사 담당자 정보 */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            행사 정보
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                행사 명 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="행사명을 입력하세요"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  행사 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">선택해주세요</option>
                  <option value="무료">무료</option>
                  <option value="유료">유료</option>
                </select>
              </div>

              {formData.eventType === "유료" && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    행사비 (원)
                  </label>
                  <Input
                    type="number"
                    name="eventPrice"
                    value={formData.eventPrice || ""}
                    onChange={handleInputChange}
                    placeholder="행사비를 입력하세요"
                    min="0"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  행사 담당자
                </label>
                <Input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  placeholder="행사 담당자명을 입력하세요"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  담당자 연락처 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  name="managerPhone"
                  value={formData.managerPhone}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                  required
                />
              </div>
            </div>

            {/* 첨부파일 업로드 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                첨부파일
              </label>
              <div className="mb-2 text-xs text-amber-600">
                * 파일 크기는 최대 50MB까지 업로드 가능합니다.
              </div>
              <div className="mb-3 text-xs text-gray-500">
                * 시연 관련 자료나 참고 문서를 첨부해주세요.
              </div>
              <div
                onClick={() => fileUpload.selectedFiles.current?.click()}
                onDragOver={fileUpload.handleDragOver}
                onDragLeave={fileUpload.handleDragLeave}
                onDrop={fileUpload.handleDrop}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                  fileUpload.isDragOver
                    ? "bg-blue-50 border-blue-500"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <Paperclip className="mb-2 w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {fileUpload.isDragOver
                      ? "파일을 여기에 놓으세요"
                      : "클릭하여 파일 선택 또는 파일을 여기로 드래그"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, 이미지, 문서 파일 등
                  </p>
                </div>
              </div>
              <input
                ref={fileUpload.selectedFiles}
                type="file"
                hidden
                multiple
                onChange={fileUpload.handleFileSelection}
              />

              {/* 업로드된 파일 목록 */}
              <div className="p-3 mt-4 bg-gray-50 rounded-lg">
                <div className="mb-2 text-sm font-medium text-gray-700">
                  업로드된 파일
                </div>
                <div className="space-y-1">
                  {fileUpload.files.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      업로드 항목이 없습니다.
                    </div>
                  ) : (
                    fileUpload.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-white rounded border"
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => fileUpload.handleRemoveFile(index)}
                          className="p-1 text-red-600 transition-colors hover:text-red-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 시연 정보 */}
        <Card className="p-6">
          <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
            <Calendar className="mr-2 w-5 h-5" />
            물품 이동 정보
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                물품 배송일(행사장소 배송날짜)
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="demonstrationStartDate"
                value={formData.demonstrationStartDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                물품 배송 시간(공장에서 배송 시작하는 시간)
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                name="demonstrationStartTime"
                value={formData.demonstrationStartTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                물품 이동 방식
              </label>
              <select
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleInputChange}
                className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택해주세요</option>
                <option value="용차">용차</option>
                <option value="택배">택배</option>
                <option value="직접">직접</option>
              </select>
            </div>

            {/* 시연 장소 - 주소 검색으로 변경 */}
            <div className="md:col-span-2">
              <AddressSection
                address={formData.address}
                detailAddress={formData.detailAddress}
                isAddressOpen={isAddressOpen}
                onChange={handleInputChange}
                onAddressChange={handleAddressChange}
                onToggleAddressModal={handleToggleAddressModal}
                onCloseAddressModal={handleCloseAddressModal}
                focusRingColor="blue"
                label="물품 이동 장소"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                시연 종료일(회수날짜) <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="demonstrationEndDate"
                value={formData.demonstrationEndDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                물품 회수 시간(공장에서 회수하는 시간)
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                name="demonstrationEndTime"
                value={formData.demonstrationEndTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                물품 철수 방식
              </label>
              <select
                name="retrievalMethod"
                value={formData.retrievalMethod}
                onChange={handleInputChange}
                className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택해주세요</option>
                <option value="용차">용차</option>
                <option value="택배">택배</option>
                <option value="직접">직접</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                특이사항
              </label>
              <textarea
                name="memo"
                value={formData.memo}
                onChange={handleInputChange}
                placeholder="시연과 관련된 특이사항이나 요청사항을 입력하세요"
                rows={3}
                className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* 시연 아이템 선택 */}
        <DemoItemSelector
          selectedItems={selectedItems}
          onItemsChange={setSelectedItems}
        />

        {/* 제출 버튼 */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin" />
                <span>제출 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>시연 신청</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SimpleDemonstrationForm;
