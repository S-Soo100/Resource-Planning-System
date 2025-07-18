"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  OrderRequestFormData,
  OrderRequestFormProps,
} from "@/types/(order)/orderRequestFormData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { authStore } from "@/store/authStore";
import { OrderItemWithDetails } from "@/types/(order)/orderRequestFormData";
import BasicInfoSection from "@/components/demonstration/sections/BasicInfoSection";
import AddressSection from "@/components/demonstration/sections/AddressSection";
import DateSection from "@/components/demonstration/sections/DateSection";
import DemoItemSection from "@/components/demonstration/sections/DemoItemSection";
import FileUploadSection from "@/components/demonstration/sections/FileUploadSection";
import NotesSection from "@/components/demonstration/sections/NotesSection";
import SubmitSection from "@/components/demonstration/sections/SubmitSection";

const DemonstrationForm: React.FC<OrderRequestFormProps> = ({
  isPackageOrder = false,
  title = "시연 요청",
  warehousesList: propWarehousesList,
  warehouseItems: propWarehouseItems,
  onWarehouseChange,
}) => {
  // ⚠️ API 미개발 상태 알림
  console.warn(
    "DemonstrationForm: API 통신이 미개발 상태입니다. 데모용으로만 동작합니다."
  );

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const auth = authStore((state) => state.user);
  const { user } = useCurrentUser();

  // 아이템 관련 상태
  const [orderItems, setOrderItems] = useState<
    (OrderItemWithDetails & { warehouseItemId: number; id: number })[]
  >([]);

  const [formData, setFormData] = useState<OrderRequestFormData>({
    manager: "",
    requester: user?.name || auth?.name || "",
    receiver: "",
    receiverPhone: "",
    address: "",
    detailAddress: "",
    requestDate: "",
    setupDate: "",
    notes: "",
    supplierId: null,
    warehouseId: null,
  });

  // 사용자 정보가 로드되면 자동으로 요청자 정보 설정
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        requester: user.name,
      }));
    }
  }, [user]);

  // 폼 입력 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 주소 변경 핸들러
  const handleAddressChange = (address: string) => {
    setFormData((prev) => ({
      ...prev,
      address,
    }));
  };

  // 날짜 변경 핸들러
  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "requestDate" | "setupDate"
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // 창고 변경 핸들러
  const handleWarehouseChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const warehouseId = parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      warehouseId: warehouseId || null,
    }));

    // props로 전달된 핸들러가 있으면 호출
    if (onWarehouseChange) {
      onWarehouseChange(warehouseId);
    }

    // 창고가 변경되면 아이템 목록 초기화
    setOrderItems([]);
  };

  const handleRemoveItem = (itemId: number) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleQuantityChange = (index: number, increment: boolean) => {
    const updatedItems = [...orderItems];
    const currentQuantity = updatedItems[index].quantity;

    if (increment) {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: currentQuantity + 1,
      };
    } else if (currentQuantity > 1) {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: currentQuantity - 1,
      };
    } else {
      // 수량이 1일 때 감소시키면 아이템 제거
      setOrderItems(updatedItems.filter((_, i) => i !== index));
      return;
    }

    setOrderItems(updatedItems);
  };

  // 파일 관련 핸들러들
  const handleFileChange = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 폼 검증
  const validateForm = (): boolean => {
    if (!formData.requester.trim()) {
      toast.error("요청자 정보가 없습니다.");
      return false;
    }
    if (!formData.receiver.trim()) {
      toast.error("수령자를 입력해주세요.");
      return false;
    }
    if (!formData.receiverPhone.trim()) {
      toast.error("수령자 연락처를 입력해주세요.");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("주소를 입력해주세요.");
      return false;
    }
    if (!formData.requestDate) {
      toast.error("요청일을 입력해주세요.");
      return false;
    }
    if (!formData.warehouseId) {
      toast.error("창고를 선택해주세요.");
      return false;
    }
    if (orderItems.length === 0) {
      toast.error("시연품을 선택해주세요.");
      return false;
    }

    return true;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: API 통신 미개발 상태
      // 실제 구현 시에는 다음과 같은 API 호출이 필요합니다:
      // - 시연 요청 데이터를 서버로 전송
      // - 파일 업로드 처리
      // - 서버 응답에 따른 적절한 처리

      // 임시로 성공 메시지만 표시 (API 미개발 상태)
      toast.success("시연 요청이 완료되었습니다! (API 미개발 상태 - 데모용)");

      // 폼 초기화
      setFormData({
        manager: "",
        requester: user?.name || auth?.name || "",
        receiver: "",
        receiverPhone: "",
        address: "",
        detailAddress: "",
        requestDate: "",
        setupDate: "",
        notes: "",
        supplierId: null,
        warehouseId: null,
      });
      setOrderItems([]);
      setFiles([]);

      // 메인 페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("시연 요청 중 오류 발생:", error);
      toast.error("시연 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">{title}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoSection
          formData={formData}
          onChange={handleChange}
          onWarehouseChange={handleWarehouseChange}
          warehousesList={propWarehousesList}
        />

        <AddressSection
          formData={formData}
          onChange={handleChange}
          onAddressChange={handleAddressChange}
        />

        <DateSection formData={formData} onDateChange={handleDateChange} />

        <DemoItemSection
          isPackageOrder={isPackageOrder}
          formData={formData}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          onRemoveItem={handleRemoveItem}
          onQuantityChange={handleQuantityChange}
          warehouseItems={propWarehouseItems}
        />

        <FileUploadSection
          files={files}
          onFileChange={handleFileChange}
          onRemoveFile={handleRemoveFile}
        />

        <NotesSection formData={formData} onChange={handleChange} />

        <SubmitSection
          isSubmitting={isSubmitting}
          onCancel={() => router.push("/")}
        />
      </form>
    </div>
  );
};

export default DemonstrationForm;
