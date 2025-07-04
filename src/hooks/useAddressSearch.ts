import { useState } from "react";
import { Address } from "react-daum-postcode";

export const useAddressSearch = () => {
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  const handleAddressChange = <T extends { address: string }>(
    data: Address,
    setFormData: (updater: (prev: T) => T) => void
  ) => {
    setFormData((prev: T) => ({ ...prev, address: data.address }));
    setIsAddressOpen(false);
  };

  const handleToggleAddressModal = () => {
    setIsAddressOpen(!isAddressOpen);
  };

  const handleCloseAddressModal = () => {
    setIsAddressOpen(false);
  };

  return {
    isAddressOpen,
    handleAddressChange,
    handleToggleAddressModal,
    handleCloseAddressModal,
  };
};
