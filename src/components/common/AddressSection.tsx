import React from "react";
import SearchAddressModal from "../SearchAddressModal";
import { Address } from "react-daum-postcode";

interface AddressSectionProps {
  address: string;
  detailAddress: string;
  isAddressOpen: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (data: Address) => void;
  onToggleAddressModal: () => void;
  onCloseAddressModal: () => void;
  focusRingColor?: string;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  address,
  detailAddress,
  isAddressOpen,
  onChange,
  onAddressChange,
  onToggleAddressModal,
  onCloseAddressModal,
  focusRingColor = "blue",
}) => {
  const focusRingClass =
    focusRingColor === "purple"
      ? "focus:ring-purple-500"
      : "focus:ring-blue-500";

  const buttonColor =
    focusRingColor === "purple"
      ? "bg-purple-500 hover:bg-purple-600 focus:ring-purple-500"
      : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500";

  return (
    <>
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <label
          htmlFor="address"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          수령지 주소 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="address"
            name="address"
            value={address}
            onChange={onChange}
            className={`flex-1 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
            placeholder="주소를 입력하세요"
            required
          />
          <button
            type="button"
            className={`px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor}`}
            onClick={onToggleAddressModal}
          >
            주소 검색
          </button>
        </div>
        <input
          type="text"
          id="detailAddress"
          name="detailAddress"
          value={detailAddress}
          onChange={onChange}
          className={`px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
          placeholder="상세 주소"
        />
      </div>

      {/* 주소 검색 모달 */}
      {isAddressOpen && (
        <SearchAddressModal
          onCompletePost={onAddressChange}
          onClose={onCloseAddressModal}
        />
      )}
    </>
  );
};

export default AddressSection;
