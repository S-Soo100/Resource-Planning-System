"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrder } from "@/api/order-api";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { OrderStatus } from "@/types/(order)/order";
import { getDisplayFileName } from "@/utils/fileUtils";
import { formatDateForDisplayFull, formatDateForDisplayFullUTC } from "@/utils/dateUtils";

// 통합 날짜 유틸리티 사용 - 중복 함수 제거됨

// 전화번호 포맷팅 함수
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "-";
  const numbers = phone.replace(/\D/g, "");
  if (numbers.length === 11 && numbers.startsWith("010")) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  return phone;
};

// 상태 텍스트 변환 함수
const getStatusText = (status: string): string => {
  switch (status) {
    case OrderStatus.requested:
      return "요청";
    case OrderStatus.approved:
      return "승인";
    case OrderStatus.rejected:
      return "반려";
    case OrderStatus.confirmedByShipper:
      return "출고팀 확인";
    case OrderStatus.shipmentCompleted:
      return "출고 완료";
    case OrderStatus.rejectedByShipper:
      return "출고 보류";
    default:
      return status;
  }
};

const OrderRecordPrint = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<IOrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrder(orderId);
        if (res.success && res.data) {
          setOrder(res.data as IOrderRecord);
        } else {
          alert("해당 발주를 찾을 수 없습니다.");
          router.push("/orderRecord");
        }
      } catch (error) {
        console.error("발주 조회 중 오류:", error);
        alert("발주 조회에 실패했습니다.");
        router.push("/orderRecord");
      }
      setIsLoading(false);
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  // 인쇄 시작
  useEffect(() => {
    if (!isLoading && order) {
      // 페이지 로딩 완료 후 약간의 지연을 두고 인쇄 다이얼로그 표시
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, order]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">발주를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <>
      {/* 인쇄 전용 스타일 */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }

          .print-no-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-header {
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }

          .print-section {
            margin-bottom: 15px;
            border: 1px solid #ccc;
            padding: 10px;
          }

          .print-section-title {
            font-weight: bold;
            font-size: 14px;
            border-bottom: 1px solid #666;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }

          .print-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            align-items: center;
          }

          .print-info-label {
            font-weight: bold;
            min-width: 100px;
          }

          .print-info-value {
            flex: 1;
            text-align: right;
          }

          .print-status {
            display: inline-block;
            padding: 3px 8px;
            border: 1px solid #000;
            font-weight: bold;
          }

          .print-items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          .print-items-table th,
          .print-items-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }

          .print-items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }

          .print-memo {
            white-space: pre-wrap;
            border: 1px solid #ccc;
            padding: 10px;
            background-color: #f9f9f9;
          }

          .print-files {
            border: 1px solid #ccc;
            padding: 10px;
          }

          .print-file-item {
            padding: 5px 0;
            border-bottom: 1px dotted #ccc;
          }

          .no-print {
            display: none !important;
          }
        }

        @media screen {
          body {
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
          }

          .print-container {
            max-width: 210mm; /* A4 너비 */
            min-height: 297mm; /* A4 높이 */
            margin: 0 auto;
            padding: 20mm; /* 인쇄 여백과 동일 */
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            font-size: 12px;
            line-height: 1.4;
            border: 1px solid #ddd;
          }

          /* 화면에서도 인쇄 스타일과 비슷하게 */
          .print-section {
            margin-bottom: 15px;
            border: 1px solid #ccc;
            padding: 10px;
          }

          .print-section-title {
            font-weight: bold;
            font-size: 14px;
            border-bottom: 1px solid #666;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }

          .print-items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          .print-items-table th,
          .print-items-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }

          .print-items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }

          .print-header {
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
        }
      `}</style>

      <div className="print-container">
        {/* 헤더 */}
        <div className="print-header print-no-break">
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 10px 0",
              textAlign: "center",
            }}
          >
            발주 요청서
          </h1>
          <div className="print-info-row">
            <span className="print-info-label">문서 번호:</span>
            <span className="print-info-value">ORDER-{order.id}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">출력 일시:</span>
            <span className="print-info-value">
              {formatDateForDisplayFull(new Date().toISOString())}
            </span>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="print-section print-no-break">
          <div className="print-section-title">기본 정보</div>
          <div className="print-info-row">
            <span className="print-info-label">제목:</span>
            <span className="print-info-value">
              {order.title || "제목 없음"}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">상태:</span>
            <span className="print-info-value">
              <span className="print-status">
                {getStatusText(order.status)}
              </span>
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">생성일:</span>
            <span className="print-info-value">
              {formatDateForDisplayFullUTC(order.createdAt)}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">발주자:</span>
            <span className="print-info-value">{order.requester}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">담당자:</span>
            <span className="print-info-value">{order.manager || "-"}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">출고 창고:</span>
            <span className="print-info-value">
              {order.warehouse?.warehouseName || "창고 정보 없음"}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">발주 유형:</span>
            <span className="print-info-value">
              {order.packageId && order.packageId > 0 ? "패키지" : "개별"}
            </span>
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="print-section print-no-break">
          <div className="print-section-title">배송 정보</div>
          <div className="print-info-row">
            <span className="print-info-label">수령자:</span>
            <span className="print-info-value">{order.receiver}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">연락처:</span>
            <span className="print-info-value">
              {formatPhoneNumber(order.receiverPhone)}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">배송 주소:</span>
            <span
              className="print-info-value"
              style={{ textAlign: "left", wordBreak: "break-all" }}
            >
              {order.receiverAddress}
            </span>
          </div>
          {/* <div className="print-info-row">
            <span className="print-info-label">구매일:</span>
            <span className="print-info-value">
              {order.purchaseDate ? formatDateForDisplayFullUTC(order.purchaseDate) : "-"}
            </span>
          </div> */}
          <div className="print-info-row">
            <span className="print-info-label">출고예정일:</span>
            <span className="print-info-value">
              {order.outboundDate ? formatDateForDisplayFullUTC(order.outboundDate) : "-"}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">설치요청일:</span>
            <span className="print-info-value">
              {order.installationDate
                ? formatDateForDisplayFullUTC(order.installationDate)
                : "-"}
            </span>
          </div>
        </div>

        {/* 발주 품목 */}
        <div className="print-section">
          <div className="print-section-title">발주 품목</div>
          {order.orderItems && order.orderItems.length > 0 ? (
            <table className="print-items-table">
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>품목명</th>
                  <th style={{ width: "30%" }}>품목코드</th>
                  <th style={{ width: "15%" }}>수량</th>
                  <th style={{ width: "15%" }}>단위</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item.item?.teamItem?.itemName || "알 수 없는 품목"}
                    </td>
                    <td>{item.item?.teamItem?.itemCode || "코드 없음"}</td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ textAlign: "center" }}>개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>발주 품목이 없습니다.</p>
          )}
        </div>

        {/* 메모 */}
        {order.memo && (
          <div className="print-section">
            <div className="print-section-title">추가 요청사항</div>
            <div className="print-memo">{order.memo}</div>
          </div>
        )}

        {/* 첨부파일 */}
        {order.files && order.files.length > 0 && (
          <div className="print-section">
            <div className="print-section-title">첨부파일</div>
            <div className="print-files">
              {order.files.map((file, index) => (
                <div key={file.id} className="print-file-item">
                  <strong>{index + 1}.</strong>{" "}
                  {getDisplayFileName(file.fileName)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 서명란 */}
        <div
          className="print-section print-no-break"
          style={{ marginTop: "30px" }}
        >
          <div className="print-section-title">서명</div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <div style={{ textAlign: "center", width: "30%" }}>
              <div
                style={{
                  borderBottom: "1px solid #000",
                  height: "40px",
                  marginBottom: "5px",
                }}
              ></div>
              <div>요청자</div>
            </div>
            <div style={{ textAlign: "center", width: "30%" }}>
              <div
                style={{
                  borderBottom: "1px solid #000",
                  height: "40px",
                  marginBottom: "5px",
                }}
              ></div>
              <div>승인자</div>
            </div>
            <div style={{ textAlign: "center", width: "30%" }}>
              <div
                style={{
                  borderBottom: "1px solid #000",
                  height: "40px",
                  marginBottom: "5px",
                }}
              ></div>
              <div>출고 담당자</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderRecordPrint;
