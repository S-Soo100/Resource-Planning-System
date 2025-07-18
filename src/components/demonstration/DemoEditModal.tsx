"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, User, Calendar, Paperclip } from "lucide-react";
import { toast } from "react-hot-toast";
import { DemoResponse, PatchDemoRequest } from "@/types/demo/demo";
import { useUpdateDemo } from "@/hooks/(useDemo)/useDemoMutations";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { useFileUpload } from "@/hooks/useFileUpload";
import { uploadMultipleDemoFileById } from "@/api/demo-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DeliveryMethodSelector } from "@/components/ui/delivery-method-selector";
import AddressSection from "@/components/common/AddressSection";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { Address } from "react-daum-postcode";

// 숫자 포맷팅 함수
const formatNumber = (value: string): string => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (numericValue === "") return "";
  return Number(numericValue).toLocaleString();
};

interface DemoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  demo: DemoResponse | null;
  onSuccess: () => void;
}

const DemoEditModal: React.FC<DemoEditModalProps> = ({
  isOpen,
  onClose,
  demo,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<PatchDemoRequest>({
    handler: "",
    demoManager: "",
    demoManagerPhone: "",
    memo: "",
    demoTitle: "",
    demoNationType: "국내",
    demoAddress: "",
    demoPaymentType: "",
    demoPrice: undefined,
    demoStartDate: "",
    demoStartTime: "",
    demoStartDeliveryMethod: "",
    demoEndDate: "",
    demoEndTime: "",
    demoEndDeliveryMethod: "",
    warehouseId: 0,
    demoItems: [],
  });

  const [demoPriceDisplay, setDemoPriceDisplay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateDemoMutation = useUpdateDemo();
  const { warehouses } = useWarehouseItems();
  const fileUpload = useFileUpload();
  const { isAddressOpen, handleToggleAddressModal, handleCloseAddressModal } =
    useAddressSearch();

  // 시연 창고 필터링
  const demoWarehouses = React.useMemo(() => {
    if (!warehouses) return [];
    return warehouses.filter((warehouse) =>
      warehouse.warehouseName.includes("시연")
    );
  }, [warehouses]);

  // 사용 가능한 창고 목록
  const availableWarehouses = React.useMemo(() => {
    if (demoWarehouses.length > 0) {
      return demoWarehouses;
    }
    return warehouses || [];
  }, [demoWarehouses, warehouses]);

  // 초기 데이터 설정
  useEffect(() => {
    if (demo) {
      setFormData({
        handler: demo.handler || "",
        demoManager: demo.demoManager || "",
        demoManagerPhone: demo.demoManagerPhone || "",
        memo: demo.memo || "",
        demoTitle: demo.demoTitle || "",
        demoNationType: demo.demoNationType || "국내",
        demoAddress: demo.demoAddress || "",
        demoPaymentType: demo.demoPaymentType || "",
        demoPrice: demo.demoPrice,
        demoStartDate: demo.demoStartDate || "",
        demoStartTime: demo.demoStartTime || "",
        demoStartDeliveryMethod: demo.demoStartDeliveryMethod || "",
        demoEndDate: demo.demoEndDate || "",
        demoEndTime: demo.demoEndTime || "",
        demoEndDeliveryMethod: demo.demoEndDeliveryMethod || "",
        warehouseId: demo.warehouseId || 0,
        demoItems:
          demo.demoItems?.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            memo: item.memo || "",
          })) || [],
      });

      // 시연 비용 표시 설정
      if (demo.demoPrice) {
        setDemoPriceDisplay(formatNumber(demo.demoPrice.toString()));
      }
    }
  }, [demo]);

  // 폼 입력 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // 시연 비용 필드인 경우 숫자 포맷팅 적용
    if (name === "demoPrice") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const formattedValue = formatNumber(value);

      setDemoPriceDisplay(formattedValue);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue === "" ? undefined : Number(numericValue),
      }));
    }
    // 다른 숫자 필드들
    else if (name === "userId" || name === "warehouseId") {
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
    const fullAddress = `${data.address} ${data.buildingName || ""}`.trim();
    setFormData((prev) => ({
      ...prev,
      demoAddress: fullAddress,
    }));
  };

  // 폼 검증
  const validateForm = (): boolean => {
    if (!formData.demoTitle?.trim()) {
      toast.error("시연 제목을 입력해주세요.");
      return false;
    }
    if (!formData.demoAddress?.trim()) {
      toast.error("시연 장소를 입력해주세요.");
      return false;
    }
    if (!formData.demoStartDate) {
      toast.error("시연 시작일을 입력해주세요.");
      return false;
    }
    if (!formData.demoEndDate) {
      toast.error("시연 종료일을 입력해주세요.");
      return false;
    }
    if (!formData.warehouseId) {
      toast.error("창고를 선택해주세요.");
      return false;
    }
    return true;
  };

  // 파일 업로드 처리
  const handleFileUpload = async (demoId: number): Promise<boolean> => {
    if (fileUpload.files.length === 0) return true;

    try {
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      const oversizedFiles = fileUpload.files.filter(
        (file) => file.size > maxFileSize
      );

      if (oversizedFiles.length > 0) {
        toast.error("50MB를 초과하는 파일이 있어 업로드할 수 없습니다");
        return false;
      }

      toast.loading("파일 업로드 중...");
      const uploadResponse = await uploadMultipleDemoFileById(
        demoId,
        fileUpload.files
      );
      toast.dismiss();

      if (uploadResponse.success) {
        const uploadedFileNames = uploadResponse.data
          ?.map((file) => file.fileName)
          .join(", ");
        toast.success(`파일 '${uploadedFileNames}' 업로드가 완료되었습니다`);
        return true;
      } else {
        toast.error(
          `파일 업로드에 실패했습니다: ${
            uploadResponse.error || "알 수 없는 오류"
          }`
        );
        return false;
      }
    } catch (error) {
      console.error("파일 업로드 API 호출 중 오류:", error);
      toast.error("파일 업로드 과정에서 오류가 발생했습니다");
      return false;
    }
  };

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !demo) return;

    setIsSubmitting(true);

    try {
      const submitData: PatchDemoRequest = {
        ...formData,
        demoItems:
          demo.demoItems?.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            memo: item.memo || "",
          })) || [],
      };

      const response = await updateDemoMutation.mutateAsync({
        id: demo.id,
        data: submitData,
      });

      if (response.success) {
        // 파일 업로드 처리
        if (fileUpload.files.length > 0) {
          await handleFileUpload(demo.id);
        }

        toast.success("시연 기록이 수정되었습니다!");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "시연 기록 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("시연 기록 수정 중 오류:", error);
      toast.error("시연 기록 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !demo) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            시연 기록 수정
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 시연 창고 선택 */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              시연 창고 선택
            </h2>

            {availableWarehouses.length > 0 ? (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {demoWarehouses.length > 0 ? "시연 창고" : "창고"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="warehouseId"
                  value={formData.warehouseId}
                  onChange={handleInputChange}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">창고를 선택하세요</option>
                  {availableWarehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.warehouseName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ 현재 팀에 사용 가능한 창고가 없습니다. 관리자에게
                  문의하세요.
                </p>
              </div>
            )}
          </Card>

          {/* 신청자 정보 */}
          <Card className="p-6">
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <User className="mr-2 w-5 h-5" />
              신청자 정보
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  사내 담당자
                </label>
                <Input
                  type="text"
                  name="handler"
                  value={formData.handler}
                  onChange={handleInputChange}
                  placeholder="사내 행사 담당자"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  시연기관 담당자
                </label>
                <Input
                  type="text"
                  name="demoManager"
                  value={formData.demoManager}
                  onChange={handleInputChange}
                  placeholder="시연기관 담당자명을 입력하세요"
                />
              </div>
            </div>
          </Card>

          {/* 시연 기본 정보 */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              시연/행사 기본 정보
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  시연/행사 명 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="demoTitle"
                  value={formData.demoTitle}
                  onChange={handleInputChange}
                  placeholder="시연 제목을 입력하세요"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    국내/해외 시연 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="demoNationType"
                    value={formData.demoNationType}
                    onChange={handleInputChange}
                    className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="국내">국내 시연</option>
                    <option value="해외">해외 시연</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    결제 유형
                  </label>
                  <select
                    name="demoPaymentType"
                    value={formData.demoPaymentType}
                    onChange={handleInputChange}
                    className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택해주세요</option>
                    <option value="무료">무료</option>
                    <option value="유료">유료</option>
                  </select>
                </div>
              </div>

              {formData.demoPaymentType === "유료" && (
                <div className="space-y-4">
                  <h4 className="pb-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                    결제 정보
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        시연 비용{" "}
                        <span className="text-xs text-red-500">* VAT 포함</span>
                      </label>
                      <Input
                        type="text"
                        name="demoPrice"
                        value={demoPriceDisplay}
                        onChange={handleInputChange}
                        placeholder="시연 비용을 입력하세요 (예: 1,000,000)"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 시연기관 담당자 정보 */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              시연기관 담당자 정보
            </h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  시연기관 담당자
                </label>
                <Input
                  type="text"
                  name="demoManager"
                  value={formData.demoManager}
                  onChange={handleInputChange}
                  placeholder="시연기관 담당자명을 입력하세요"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  시연기관 담당자 연락처
                </label>
                <Input
                  type="tel"
                  name="demoManagerPhone"
                  value={formData.demoManagerPhone}
                  onChange={handleInputChange}
                  placeholder="시연기관 담당자 연락처를 입력하세요"
                />
              </div>
            </div>
          </Card>

          {/* 시연 일정 */}
          <Card className="p-6">
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <Calendar className="mr-2 w-5 h-5" />
              시연 일정 및 장소
            </h2>

            {/* 시연 시작 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">
                시연품 상차 일정
              </h3>
              <div className="space-y-6">
                <div>
                  <DateTimePicker
                    label="상차 일정"
                    date={formData.demoStartDate}
                    time={formData.demoStartTime}
                    onDateChange={(date) =>
                      setFormData((prev) => ({ ...prev, demoStartDate: date }))
                    }
                    onTimeChange={(time) =>
                      setFormData((prev) => ({ ...prev, demoStartTime: time }))
                    }
                    placeholder="상차 일자와 시간을 선택하세요"
                    helperText="시연품을 창고에서 출고하는 일정입니다"
                    minDate={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <DeliveryMethodSelector
                    label="배송 방법"
                    value={formData.demoStartDeliveryMethod}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        demoStartDeliveryMethod: value,
                      }))
                    }
                    type="delivery"
                    placeholder="상차 시 배송 방법을 선택하세요"
                    helperText="시연품을 시연 장소로 운송하는 방법입니다"
                  />
                </div>
              </div>
            </div>

            {/* 시연 장소 */}
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-medium text-gray-700">
                시연 장소
              </h3>
              <AddressSection
                address={formData.demoAddress!}
                detailAddress=""
                isAddressOpen={isAddressOpen}
                onChange={handleInputChange}
                onAddressChange={handleAddressChange}
                onToggleAddressModal={handleToggleAddressModal}
                onCloseAddressModal={handleCloseAddressModal}
                focusRingColor="blue"
                label="시연 장소"
              />
            </div>

            {/* 시연 종료 */}
            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-medium text-gray-700">
                시연품 창고 하차 일정
              </h3>
              <div className="space-y-6">
                <div>
                  <DateTimePicker
                    label="회수 일정"
                    date={formData.demoEndDate}
                    time={formData.demoEndTime}
                    onDateChange={(date) =>
                      setFormData((prev) => ({ ...prev, demoEndDate: date }))
                    }
                    onTimeChange={(time) =>
                      setFormData((prev) => ({ ...prev, demoEndTime: time }))
                    }
                    placeholder="회수 일자와 시간을 선택하세요"
                    helperText="시연품을 창고로 반입하는 일정입니다"
                    minDate={
                      formData.demoStartDate ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>

                <div>
                  <DeliveryMethodSelector
                    label="회수 방법"
                    value={formData.demoEndDeliveryMethod}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        demoEndDeliveryMethod: value,
                      }))
                    }
                    type="pickup"
                    placeholder="회수 시 운송 방법을 선택하세요"
                    helperText="시연품을 창고로 반입하는 방법입니다"
                  />
                </div>
              </div>
            </div>

            {/* 파일 첨부 */}
            <div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                첨부파일(견적서 등)
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

            {/* 특이사항 */}
            <div className="mt-6">
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
          </Card>

          {/* 시연 아이템 선택 - 기존 아이템 유지 */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              시연 아이템
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                기존 시연 아이템은 유지됩니다. 아이템 수정은 별도 기능에서
                가능합니다.
              </p>
              {demo?.demoItems && demo.demoItems.length > 0 && (
                <div className="mt-3 space-y-2">
                  {demo.demoItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-white rounded border"
                    >
                      <span className="text-sm">
                        {item.item?.teamItem?.itemName || "알 수 없는 품목"} -{" "}
                        {item.quantity}개
                      </span>
                      {item.memo && (
                        <span className="text-xs text-gray-500">
                          ({item.memo})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  수정 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 w-4 h-4" />
                  수정 완료
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoEditModal;
