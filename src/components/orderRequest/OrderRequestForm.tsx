"use client";
import { useEffect, useRef, useState } from "react";
import SearchAddressModal from "../SearchAddressModal";
import { Address } from "react-daum-postcode";
import { Paperclip, Plus, Minus, X } from "lucide-react";
import { useOrder } from "@/hooks/useOrder";
import { useTeamItems } from "@/hooks/useTeamItems";
import { useSuppliers } from "@/hooks/useSupplier";
import { toast } from "react-hot-toast";
import { CreateOrderDto, OrderStatus } from "@/types/(order)/order";
import { Supplier } from "@/types/supplier";
import {
  OrderItemWithDetails,
  OrderRequestFormData,
  OrderRequestFormProps,
} from "@/types/(order)/orderRequestFormData";

const OrderRequestForm: React.FC<OrderRequestFormProps> = ({
  isPackageOrder = false,
  title = "발주 요청",
}) => {
  const [requestDate, setRequestDate] = useState("");
  const [setupDate, setSetupDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const selectedFiles = useRef<HTMLInputElement>(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  // 아이템 관련 상태
  const [orderItems, setOrderItems] = useState<OrderItemWithDetails[]>([]);

  const [formData, setFormData] = useState<OrderRequestFormData>({
    requester: "",
    receiver: "",
    receiverPhone: "",
    address: "",
    detailAddress: "",
    requestDate: "",
    setupDate: "",
    notes: "",
    supplierId: null,
  });

  // 훅 호출
  const { useCreateOrder } = useOrder();
  const { mutate: createOrder } = useCreateOrder();
  const { useGetTeamItems } = useTeamItems();
  const { data: teamItems } = useGetTeamItems();
  const { useGetSuppliers } = useSuppliers();
  const { suppliers: suppliersResponse } = useGetSuppliers();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    if (suppliersResponse) {
      if (
        typeof suppliersResponse === "object" &&
        "data" in suppliersResponse
      ) {
        setSuppliers(suppliersResponse.data as Supplier[]);
      } else {
        setSuppliers(suppliersResponse as Supplier[]);
      }
    }
  }, [suppliersResponse]);

  const handleFileSelection = () => {
    if (selectedFiles.current && selectedFiles.current.files) {
      const fileList = Array.from(selectedFiles.current.files);
      setFiles(fileList);
    }
  };

  useEffect(() => {
    // 현재 날짜를 ISO 형식(YYYY-MM-DD)으로 변환
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    setRequestDate(formattedDate);
    setSetupDate(formattedDate);

    setFormData((prev) => ({
      ...prev,
      requestDate: formattedDate,
      setupDate: formattedDate,
    }));
  }, []);

  // 아이템 선택 핸들러
  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = parseInt(e.target.value);
    if (itemId === 0) {
      return;
    }
    const selected = teamItems?.find((item) => item.id === itemId) || null;
    if (!selected) {
      return;
    }

    // 이미 추가된 아이템인지 확인
    const isItemExists = orderItems.some(
      (item) => item.teamItem.id === selected.id
    );

    if (isItemExists) {
      toast.error("이미 추가된 아이템입니다");
      return;
    }

    // 아이템 추가
    setOrderItems((prev) => [
      ...prev,
      {
        teamItem: selected,
        quantity: 1,
      },
    ]);

    // 선택 초기화
    e.target.value = "0";
  };

  // 아이템 제거 핸들러
  const handleRemoveItem = (itemId: number) => {
    setOrderItems((prev) => prev.filter((item) => item.teamItem.id !== itemId));
  };

  // 아이템 수량 변경 핸들러
  const handleQuantityChange = (index: number, increment: boolean) => {
    setOrderItems((prev) => {
      const updated = prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            quantity: increment
              ? item.quantity + 1
              : item.quantity > 0
              ? item.quantity - 1
              : item.quantity,
          };
        }
        return item;
      });
      return updated;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddressChange = (data: Address) => {
    setFormData({ ...formData, address: data.address });
    setIsAddressOpen(false);
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "requestDate" | "setupDate"
  ) => {
    const { value } = e.target;
    if (type === "requestDate") {
      setRequestDate(value);
    } else {
      setSetupDate(value);
    }

    setFormData({
      ...formData,
      [type]: value,
    });
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = parseInt(e.target.value);
    if (supplierId === 0) {
      setFormData({
        ...formData,
        supplierId: null,
        receiver: "",
        receiverPhone: "",
        address: "",
      });
      return;
    }

    const selectedSupplier = suppliers?.find(
      (supplier: Supplier) => supplier.id === supplierId
    );
    if (selectedSupplier) {
      setFormData({
        ...formData,
        supplierId,
        receiver: selectedSupplier.supplierName,
        receiverPhone: selectedSupplier.supplierPhoneNumber,
        address: selectedSupplier.supplierAddress,
      });
    }
  };

  const validateForm = (): boolean => {
    if (orderItems.length === 0) {
      toast.error("최소 하나 이상의 품목을 선택해주세요");
      return false;
    }
    if (!formData.requester) {
      toast.error("요청자를 입력해주세요");
      return false;
    }
    if (!formData.receiver) {
      toast.error("수령인을 입력해주세요");
      return false;
    }
    if (!formData.receiverPhone) {
      toast.error("수령인 연락처를 입력해주세요");
      return false;
    }
    if (!formData.address) {
      toast.error("배송지를 입력해주세요");
      return false;
    }
    if (!formData.requestDate) {
      toast.error("배송일을 선택해주세요");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const orderData: CreateOrderDto = {
        userId: 1,
        supplierId: 1,
        packageId: 0,
        requester: formData.requester,
        receiver: formData.receiver,
        receiverPhone: formData.receiverPhone,
        receiverAddress: `${formData.address} ${formData.detailAddress}`.trim(),
        purchaseDate: formData.requestDate,
        outboundDate: formData.requestDate,
        installationDate: formData.setupDate,
        manager: "",
        status: OrderStatus.requested,
        memo: formData.notes,
        orderItems: orderItems.map((item) => ({
          itemId: item.teamItem.id,
          quantity: item.quantity,
          memo: formData.notes,
        })),
      };

      createOrder(orderData, {
        onSuccess: () => {
          toast.success("발주 요청이 완료되었습니다");
          // 폼 초기화
          setFormData({
            requester: "",
            receiver: "",
            receiverPhone: "",
            address: "",
            detailAddress: "",
            requestDate: "",
            setupDate: "",
            notes: "",
          });
          setOrderItems([]);
        },
        onError: (error) => {
          console.error("발주 요청 실패:", error);
          toast.error("발주 요청에 실패했습니다");
        },
      });
    } catch (error) {
      console.error("발주 요청 실패:", error);
      toast.error("발주 요청에 실패했습니다");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        {/* 개별품목 선택 (개별품목 출고 요청인 경우에만 표시) */}
        {!isPackageOrder && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              품목 선택
            </label>
            <select
              name="item"
              onChange={handleItemSelect}
              className="w-full px-3 py-2 border rounded-md"
              required={!isPackageOrder}
            >
              <option value="0">품목 선택</option>
              {teamItems?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemName} ({item.itemCode})
                </option>
              ))}
            </select>
          </div>
        )}

        {orderItems.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">선택된 품목</h3>
            <div className="border rounded-md p-3">
              {orderItems.map((item, index) => (
                <div
                  key={item.teamItem.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.teamItem.itemName}</p>
                    <p className="text-xs text-gray-500">
                      코드: {item.teamItem.itemCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(index, false)}
                      className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(index, true)}
                      className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.teamItem.id)}
                      className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <label htmlFor="notes" className="block text-sm font-medium">
          기타 요청 사항
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <label htmlFor="requester" className="block text-sm font-medium">
          요청자
        </label>
        <input
          type="text"
          id="requester"
          name="requester"
          value={formData.requester}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />

        <label htmlFor="requestDate" className="block text-sm font-medium">
          출고 요청일
        </label>
        <input
          type="date"
          id="requestDate"
          name="requestDate"
          data-placeholder="날짜 선택"
          value={requestDate}
          onChange={(e) => handleDateChange(e, "requestDate")}
          className="p-2 border rounded"
          required
        />

        <label htmlFor="setupDate" className="block text-sm font-medium">
          설치 기한
        </label>
        <input
          type="date"
          id="setupDate"
          name="setupDate"
          data-placeholder="날짜 선택"
          value={setupDate}
          onChange={(e) => handleDateChange(e, "setupDate")}
          className="p-2 border rounded"
          required
        />
        {/* 공급업체 선택 */}
        <div className="space-y-2">
          <label className="flex gap-3 flex-row text-sm font-medium text-gray-700">
            공급업체 선택
            <p className="text-xs text-red-500">*업체 공급시에만</p>
          </label>
          <select
            name="supplier"
            onChange={handleSupplierChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="0">공급업체 선택</option>
            {Array.isArray(suppliers) &&
              suppliers.length > 0 &&
              suppliers.map((supplier: Supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierName}
                </option>
              ))}
          </select>
        </div>
        <label htmlFor="receiver" className="block text-sm font-medium">
          수령인
        </label>
        <input
          type="text"
          id="receiver"
          name="receiver"
          value={formData.receiver}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />

        <label htmlFor="phone" className="block text-sm font-medium">
          수령인 연락처
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.receiverPhone}
          onChange={handleChange}
          placeholder="xxx-xxxx-xxxx"
          className="p-2 border rounded"
          required
        />

        <label htmlFor="address" className="block text-sm font-medium">
          수령지 주소
        </label>
        <div className="flex flex-row">
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="주소를 입력하세요"
            required
          />
          <button
            type="button"
            className="ml-3 p-2 border rounded text-black hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            onClick={() => setIsAddressOpen(!isAddressOpen)}
          >
            주소 검색
          </button>
        </div>
        {isAddressOpen && (
          <SearchAddressModal onCompletePost={handleAddressChange} />
        )}

        <input
          type="text"
          id="detailAddress"
          name="detailAddress"
          value={formData.detailAddress}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="상세 주소"
        />

        <label htmlFor="file-upload">파일 업로드</label>
        <div
          onClick={() => selectedFiles.current?.click()}
          className="flex flex-row items-center gap-2 p-2 border rounded hover:bg-blue-100"
        >
          <Paperclip className="w-4 h-4" />
          파일 업로드
          <p className="text-xs text-red-600">
            *현재는 하나의 파일만 올라갑니다.
          </p>
        </div>
        <input
          ref={selectedFiles}
          type={"file"}
          hidden
          multiple={true}
          onChange={handleFileSelection}
        />
        <div className="border p-2 rounded-md">
          <div className="mb-2">업로드된 파일</div>
          <ul className="p-2 border rounded text-black ">
            {files.length == 0 ? (
              <div className="text-gray-400 text-sm">
                업로드 항목이 없습니다.
              </div>
            ) : null}
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          발주 요청하기
        </button>
      </form>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
    </div>
  );
};

export default OrderRequestForm;
