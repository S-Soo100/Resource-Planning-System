"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Calendar, User, Paperclip, X } from "lucide-react";
import DemoItemSelector, { SelectedDemoItem } from "./DemoItemSelector";
import { toast } from "react-hot-toast";
import { Demo } from "@/types/demo/demo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import AddressSection from "@/components/common/AddressSection";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Address } from "react-daum-postcode";
import { Item } from "@/types/(item)/item";
import { IUser } from "@/types/(auth)/user";

// Demo 인터페이스를 기반으로 한 폼 데이터
interface DemonstrationFormData
  extends Omit<Demo, "demoItems" | "user" | "files" | "demoPaymentDate"> {
  demoItems?: Item[];
  user?: IUser | null;
  files?: File[];
  // 주소 관련 필드 (기존 호환성을 위해 유지)
  address: string;
  detailAddress: string;
  // 폼에서 사용할 문자열 타입의 결제 예정일
  demoPaymentDate: string;
}

const SimpleDemonstrationForm: React.FC = () => {
  const { user } = useCurrentUser();
  const { warehouses } = useWarehouseItems();
  const [selectedItems, setSelectedItems] = useState<SelectedDemoItem[]>([]);
  const [isHandlerSelf, setIsHandlerSelf] = useState(false);
  const [formData, setFormData] = useState<DemonstrationFormData>({
    requester: user?.name || "",
    handler: "",
    demoManager: "",
    demoManagerPhone: "",
    memo: "",
    demoTitle: "",
    demoNationType: "국내",
    demoAddress: "",
    demoPaymentType: "",
    demoPrice: undefined,
    demoPaymentDate: "",
    demoCurrencyUnit: "KRW",
    demoStartDate: "",
    demoStartTime: "",
    demoStartDeliveryMethod: "",
    demoEndDate: "",
    demoEndTime: "",
    demoEndDeliveryMethod: "",
    userId: user?.id || 0,
    warehouseId: 0,
    demoItems: [],
    user: user || null,
    files: [],
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

  // 시연 창고 필터링 및 자동 선택
  const demoWarehouses = React.useMemo(() => {
    if (!warehouses) return [];
    return warehouses.filter((warehouse) =>
      warehouse.warehouseName.includes("시연")
    );
  }, [warehouses]);

  // 사용 가능한 창고 목록 (시연 창고가 있으면 시연 창고, 없으면 모든 창고)
  const availableWarehouses = React.useMemo(() => {
    if (demoWarehouses.length > 0) {
      return demoWarehouses;
    }
    return warehouses || [];
  }, [demoWarehouses, warehouses]);

  // 현재 사용자 정보로 신청자 설정
  React.useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({
        ...prev,
        requester: user.name,
        userId: user.id,
        user: user,
      }));
    }
  }, [user]);

  // 창고 자동 선택 (시연 창고 우선, 없으면 첫 번째 창고)
  React.useEffect(() => {
    if (availableWarehouses.length > 0 && formData.warehouseId === 0) {
      setFormData((prev) => ({
        ...prev,
        warehouseId: availableWarehouses[0].id,
      }));
    }
  }, [availableWarehouses, formData.warehouseId]);

  // 사내 담당자 체크박스 상태에 따라 handler 필드 자동 설정
  React.useEffect(() => {
    if (isHandlerSelf && user?.name) {
      setFormData((prev) => ({
        ...prev,
        handler: user.name,
      }));
    } else if (!isHandlerSelf) {
      setFormData((prev) => ({
        ...prev,
        handler: "",
      }));
    }
  }, [isHandlerSelf, user]);

  // 숫자를 3자리씩 끊어서 표시하는 함수
  const formatNumber = (value: string): string => {
    // 숫자가 아닌 문자 제거
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue === "") return "";

    // 3자리씩 끊어서 쉼표 추가
    return parseInt(numericValue).toLocaleString();
  };

  // 시연 비용 표시용 상태 추가
  const [demoPriceDisplay, setDemoPriceDisplay] = useState<string>("");

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
      address: data.address,
      demoAddress: fullAddress,
    }));
    handleAddressChangeFromHook(data, setFormData);
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const requiredFields = [
      { field: formData.warehouseId, name: "시연 창고" },
      { field: formData.demoTitle, name: "시연/행사 명" },
      { field: formData.demoNationType, name: "국내/해외 시연" },
      { field: formData.demoPaymentType, name: "결제 유형" },
      { field: formData.demoManager, name: "현지 담당자" },
      { field: formData.demoManagerPhone, name: "현지 담당자 연락처" },
      { field: formData.demoStartDate, name: "상차 일자" },
      { field: formData.demoStartTime, name: "상차 시간" },
      { field: formData.demoEndDate, name: "시연품 회수일" },
      { field: formData.demoEndTime, name: "회수 시간" },
      { field: formData.demoAddress || formData.address, name: "시연 장소" },
    ];

    for (const { field, name } of requiredFields) {
      if (!field || !field.toString().trim()) {
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
      // 주소 정보를 demoAddress에 결합
      const fullAddress = formData.detailAddress
        ? `${formData.address} ${formData.detailAddress}`
        : formData.address;

      const submitData: Demo = {
        ...formData,
        demoAddress: fullAddress,
        userId: user?.id || 0,
        warehouseId: formData.warehouseId || 0,
        user: user!,
        demoPaymentDate: formData.demoPaymentDate
          ? new Date(formData.demoPaymentDate)
          : undefined,
        demoItems: selectedItems.map((item, index) => ({
          id: index + 1, // 임시 ID
          itemName: item.itemName,
          itemQuantity: item.quantity,
          itemCode: `DEMO-${index + 1}`, // 임시 코드
          teamItem: {
            id: index + 1,
            itemName: item.itemName,
            itemCode: `DEMO-${index + 1}`,
            teamId: 0,
            memo: "",
            category: {
              id: 1,
              name: "데모 아이템",
              priority: 1,
              teamId: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          warehouseId: formData.warehouseId || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })) as Item[],
        files: fileUpload.files,
      };

      console.log("시연 신청 데이터:", submitData);

      // 임시로 2초 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("시연 신청이 완료되었습니다!");

      // 폼 초기화
      setFormData({
        requester: user?.name || "",
        handler: "",
        demoManager: "",
        demoManagerPhone: "",
        memo: "",
        demoTitle: "",
        demoNationType: "국내",
        demoAddress: "",
        demoPaymentType: "",
        demoPrice: undefined,
        demoPaymentDate: "",
        demoCurrencyUnit: "KRW",
        demoStartDate: "",
        demoStartTime: "",
        demoStartDeliveryMethod: "",
        demoEndDate: "",
        demoEndTime: "",
        demoEndDeliveryMethod: "",
        userId: user?.id || 0,
        warehouseId: 0,
        demoItems: [],
        user: user || null,
        files: [],
        address: "",
        detailAddress: "",
      });
      setSelectedItems([]);
      fileUpload.resetFiles();
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
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          제품 시연 신청
        </h1>
        <p className="text-gray-600">
          제품 시연을 위한 상세 정보를 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    warehouseId: Number(e.target.value),
                  }))
                }
                className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {availableWarehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseName}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {demoWarehouses.length > 0
                  ? "현재 팀에서 사용 가능한 시연 창고가 자동으로 선택됩니다."
                  : "시연 창고가 없어 모든 창고 중 첫 번째 창고가 자동으로 선택됩니다."}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ 현재 팀에 사용 가능한 창고가 없습니다. 관리자에게 문의하세요.
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

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                사내 담당자 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 items-center">
                <Input
                  type="text"
                  name="handler"
                  value={formData.handler}
                  onChange={handleInputChange}
                  placeholder={
                    isHandlerSelf
                      ? "사내 담당자명"
                      : "사내 담당자명을 입력하세요"
                  }
                  disabled={isHandlerSelf}
                  className={isHandlerSelf ? "flex-1 bg-gray-100" : "flex-1"}
                  required
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isHandlerSelf"
                    checked={isHandlerSelf}
                    onChange={(e) => setIsHandlerSelf(e.target.checked)}
                    className="mr-2 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isHandlerSelf"
                    className="text-sm text-gray-700 whitespace-nowrap"
                  >
                    본인
                  </label>
                </div>
              </div>
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
                  결제 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  name="demoPaymentType"
                  value={formData.demoPaymentType}
                  onChange={handleInputChange}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">선택해주세요</option>
                  <option value="무료">무료</option>
                  <option value="유료">유료</option>
                </select>
              </div>
            </div>

            {formData.demoPaymentType === "유료" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    화폐 단위
                  </label>
                  <select
                    name="demoCurrencyUnit"
                    value={formData.demoCurrencyUnit}
                    onChange={handleInputChange}
                    className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="KRW">KRW (원)</option>
                    <option value="USD">USD (달러)</option>
                    <option value="EUR">EUR (유로)</option>
                    <option value="JPY">JPY (엔)</option>
                    <option value="CNY">CNY (위안)</option>
                  </select>
                </div>

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
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    결제 예정일
                  </label>
                  <Input
                    type="date"
                    name="demoPaymentDate"
                    value={formData.demoPaymentDate || ""}
                    onChange={handleInputChange}
                    placeholder="결제 예정일을 선택하세요"
                  />
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
                시연기관 담당자 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="demoManager"
                value={formData.demoManager}
                onChange={handleInputChange}
                placeholder="시연기관 담당자명을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                시연기관 담당자 연락처 <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                name="demoManagerPhone"
                value={formData.demoManagerPhone}
                onChange={handleInputChange}
                placeholder="시연기관 담당자 연락처를 입력하세요"
                required
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  상차 일자 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="demoStartDate"
                  value={formData.demoStartDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="mb-1 text-sm font-medium text-gray-700">
                  상차 시간 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  name="demoStartTime"
                  value={formData.demoStartTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  배송 방법
                </label>
                <select
                  name="demoStartDeliveryMethod"
                  value={formData.demoStartDeliveryMethod}
                  onChange={handleInputChange}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">선택해주세요</option>
                  <option value="직접배송">직접배송</option>
                  <option value="택배">택배</option>
                  <option value="용차">용차</option>
                  <option value="항공">항공</option>
                  <option value="해운">해운</option>
                </select>
              </div>
            </div>
          </div>

          {/* 시연 장소 */}
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-medium text-gray-700">
              시연 장소
            </h3>
            <AddressSection
              address={formData.address}
              detailAddress={formData.detailAddress}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  시연품 회수일 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="demoEndDate"
                  value={formData.demoEndDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  회수 시간 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  name="demoEndTime"
                  value={formData.demoEndTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  회수 방법
                </label>
                <select
                  name="demoEndDeliveryMethod"
                  value={formData.demoEndDeliveryMethod}
                  onChange={handleInputChange}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">선택해주세요</option>
                  <option value="직접회수">직접회수</option>
                  <option value="택배">택배</option>
                  <option value="용차">용차</option>
                  <option value="항공">항공</option>
                  <option value="해운">해운</option>
                </select>
              </div>
            </div>
          </div>

          {/* 시연 장소 */}
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

        {/* 시연 아이템 선택 */}
        <DemoItemSelector
          selectedItems={selectedItems}
          onItemsChange={setSelectedItems}
          warehouseId={formData.warehouseId}
        />

        {/* 제출 버튼 */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-8 py-3 space-x-2 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-b-2 border-white animate-spin" />
                <span>제출 중...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
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
