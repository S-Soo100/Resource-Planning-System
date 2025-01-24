"use client";

import { IOrderRecord } from "@/types/orderRecord";
import React from "react";

const OrderRecordDetails: React.FC<{ record: IOrderRecord }> = ({ record }) => {
  return (
    <tr className="bg-gray-50">
      <td colSpan={10} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 배송 상세 정보 */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-xl mb-4 border-b pb-2">
              배송 상세 정보
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong className="font-semibold">주소:</strong>{" "}
                {record.address}
              </p>
              <p>
                <strong className="font-semibold">수령자:</strong>{" "}
                {record.recipient}
              </p>
              <p>
                <strong className="font-semibold">전화번호:</strong>{" "}
                {record.recipientPhone}
              </p>
              <p>
                <strong className="font-semibold">상태:</strong> {record.status}
              </p>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-xl mb-4 border-b pb-2">추가 정보</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong className="font-semibold">주문자:</strong>{" "}
                {record.orderer}
              </p>
              <p>
                <strong className="font-semibold">패키지:</strong>{" "}
                {record.package}
              </p>
              <p>
                <strong className="font-semibold">수량:</strong>{" "}
                {record.quantity}
              </p>
              <p>
                <strong className="font-semibold">추가물품:</strong>{" "}
                {record.additionalItems}
              </p>
            </div>
            <div className="flex space-x-6 mt-4">
              <a
                href={record.quote}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline font-medium"
              >
                견적서 보기
              </a>
              <a
                href={record.orderSheet}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline font-medium"
              >
                발주서 보기
              </a>
            </div>
          </div>
        </div>

        {/* 주문 날짜 */}
        <div className="mt-8 bg-gray-100 p-4 rounded-lg shadow-sm">
          <p className="text-gray-600">
            <strong className="font-medium">주문 날짜:</strong> {record.date}
          </p>
        </div>
      </td>
    </tr>
  );
};

export default OrderRecordDetails;
