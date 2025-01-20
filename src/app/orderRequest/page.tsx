"use client";
import { useState } from "react";
// import Link from "next/link";

export default function OrderRequestPage() {
  const [formData, setFormData] = useState({
    package: "",
    quantity: 1,
    notes: "",
    requester: "",
    phone: "",
    address: "",
  });

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // 여기에 API 호출 또는 데이터 전송 로직 추가
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold text-center mb-4">발주 요청</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 패키지 선택 */}
        <label htmlFor="package" className="block text-sm font-medium">
          패키지 선택
        </label>
        <select
          id="package"
          name="package"
          value={formData.package}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">선택하세요</option>
          <option value="package1">패키지 1</option>
          <option value="package2">패키지 2</option>
          <option value="package3">패키지 3</option>
          <option value="package4">패키지 4</option>
        </select>

        {/* 패키지 갯수 */}
        <label htmlFor="quantity" className="block text-sm font-medium">
          패키지 갯수
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          className="p-2 border rounded"
        />

        {/* 기타 요청 사항 */}
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

        {/* 요청자 */}
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
        />

        {/* 전화번호 */}
        <label htmlFor="phone" className="block text-sm font-medium">
          전화번호
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          pattern="\d{3}-\d{4}-\d{4}"
          placeholder="xxx-xxxx-xxxx"
          className="p-2 border rounded"
        />

        {/* 주소 */}
        <label htmlFor="address" className="block text-sm font-medium">
          주소
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="주소를 입력하세요"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          발주 요청하기
        </button>
      </form>
    </div>
  );
}

// Tailwind CSS를 사용하여 모바일 특화 레이아웃을 적용하였습니다. App Router와 연동 시 이 컴포넌트를 페이지 파일로 설정하세요.
