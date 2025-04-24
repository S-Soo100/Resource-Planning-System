/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef } from "react";

interface SearchAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (address: string) => void;
}

export default function SearchAddressModal({
  isOpen,
  onClose,
  onAddressSelect,
}: SearchAddressModalProps) {
  const postcodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && postcodeRef.current) {
      // 다음 우편번호 스크립트 동적 로드
      const script = document.createElement("script");
      script.src =
        "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.daum && postcodeRef.current) {
          new window.daum.Postcode({
            oncomplete: (data: any) => {
              // 선택한 주소 정보
              let fullAddress = data.address;
              let extraAddress = "";

              // 법정동명이 있을 경우 추가
              if (data.bname !== "") {
                extraAddress += data.bname;
              }
              // 건물명이 있을 경우 추가
              if (data.buildingName !== "") {
                extraAddress +=
                  extraAddress !== ""
                    ? `, ${data.buildingName}`
                    : data.buildingName;
              }
              // 최종 주소 구성
              fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";

              // 선택한 주소를 부모 컴포넌트로 전달
              onAddressSelect(fullAddress);
              onClose();
            },
            width: "100%",
            height: "450px",
          }).embed(postcodeRef.current);
        }
      };

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [isOpen, onAddressSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  주소 검색
                </h3>
                <div ref={postcodeRef} className="w-full h-[450px]"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
