"use client";
import DaumPostcode, { Address } from "react-daum-postcode";

export default function SearchAddressModal() {
  const onCompletePost: (address: Address) => void = (address) => {
    alert(address.address);
    console.log(address.address);
  };

  return (
    <div className="m-2 p-2 bg-slate-400">
      <DaumPostcode onComplete={onCompletePost}></DaumPostcode>
    </div>
  );
}
