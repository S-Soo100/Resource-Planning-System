import React, { useState } from "react";
import { OrderRequestFormData } from "@/types/(order)/orderRequestFormData";
import { Address } from "react-daum-postcode";
import SearchAddressModal from "../../SearchAddressModal";

interface AddressSectionProps {
  formData: OrderRequestFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onAddressChange: (address: string) => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  formData,
  onChange,
  onAddressChange,
}) => {
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  const handleAddressChange = (data: Address) => {
    onAddressChange(data.address);
    setIsAddressOpen(false);
  };

  return (
    <>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          배송 주소
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={onChange}
            placeholder="주소를 입력하세요"
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            readOnly
          />
          <button
            type="button"
            onClick={() => setIsAddressOpen(true)}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            주소 검색
          </button>
        </div>
        <input
          type="text"
          name="detailAddress"
          value={formData.detailAddress}
          onChange={onChange}
          placeholder="상세주소를 입력하세요"
          className="px-3 py-2 mt-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 주소 검색 모달 */}
      {isAddressOpen && (
        <SearchAddressModal
          onCompletePost={handleAddressChange}
          onClose={() => setIsAddressOpen(false)}
        />
      )}
    </>
  );
};

export default AddressSection;
