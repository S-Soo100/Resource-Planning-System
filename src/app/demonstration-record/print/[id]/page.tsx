"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDemoById } from "@/api/demo-api";
import { DemoResponse } from "@/types/demo/demo";
import { DemoStatus } from "@/types/demo/demo";
import { getDisplayFileName } from "@/utils/fileUtils";
import { formatDateForDisplayFullUTC } from "@/utils/dateUtils";
import { formatDateTimeToKorean } from "@/utils/calendar/calendarUtils";

// 로컬 formatDate 함수 제거 - dateUtils의 formatDateForDisplayFullUTC 사용

// 전화번호 포맷팅 함수
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "-";
  const trimmedPhone = phone.trim();
  const numbers = trimmedPhone.replace(/\D/g, "");
  if (numbers.length === 11 && numbers.startsWith("010")) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  return trimmedPhone;
};

// 상태 텍스트 변환 함수
const getStatusText = (status: string): string => {
  switch (status) {
    case DemoStatus.requested:
      return "요청";
    case DemoStatus.approved:
      return "승인";
    case DemoStatus.rejected:
      return "반려";
    case DemoStatus.confirmedByShipper:
      return "출고팀 확인";
    case DemoStatus.shipmentCompleted:
      return "출고 완료";
    case DemoStatus.rejectedByShipper:
      return "출고 보류";
    case DemoStatus.demoCompleted:
      return "시연 종료";
    default:
      return status;
  }
};

// 숫자 3자리마다 콤마를 붙여주는 함수
const formatNumberWithCommas = (x: number | string) => {
  if (x === null || x === undefined || x === "") return "-";
  const num = typeof x === "number" ? x : parseFloat(x);
  if (isNaN(num)) return x;
  return num.toLocaleString();
};

// demoCurrencyUnit이 있는지 타입 가드 함수
function isDemoWithCurrencyUnit(
  obj: unknown
): obj is { demoCurrencyUnit: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "demoCurrencyUnit" in obj &&
    typeof (obj as { demoCurrencyUnit: unknown }).demoCurrencyUnit === "string"
  );
}

const DemoRecordPrint = () => {
  const params = useParams();
  const router = useRouter();
  const demoId = params.id as string;

  const [demo, setDemo] = useState<DemoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDemo = async () => {
      try {
        const res = await getDemoById(parseInt(demoId));
        if (res.success && res.data) {
          setDemo(res.data as unknown as DemoResponse);
        } else {
          alert("해당 시연을 찾을 수 없습니다.");
          router.push("/demonstration-record");
        }
      } catch (error) {
        console.error("시연 조회 중 오류:", error);
        alert("시연 조회에 실패했습니다.");
        router.push("/demonstration-record");
      }
      setIsLoading(false);
    };

    if (demoId) {
      fetchDemo();
    }
  }, [demoId, router]);

  // 인쇄 시작
  useEffect(() => {
    if (!isLoading && demo) {
      // 페이지 로딩 완료 후 약간의 지연을 두고 인쇄 다이얼로그 표시
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, demo]);

  // demoCurrencyUnit 안전하게 추출
  const currencyUnit = isDemoWithCurrencyUnit(demo)
    ? demo.demoCurrencyUnit
    : "원";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!demo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">시연을 찾을 수 없습니다.</div>
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
            min-width: 120px;
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

          .print-delivery-section {
            display: flex;
            gap: 20px;
            margin-top: 10px;
          }

          .print-delivery-box {
            flex: 1;
            border: 1px solid #666;
            padding: 10px;
          }

          .print-delivery-title {
            font-weight: bold;
            text-align: center;
            border-bottom: 1px solid #666;
            padding-bottom: 5px;
            margin-bottom: 8px;
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

          .print-delivery-section {
            display: flex;
            gap: 20px;
            margin-top: 10px;
          }

          .print-delivery-box {
            flex: 1;
            border: 1px solid #666;
            padding: 10px;
          }

          .print-delivery-title {
            font-weight: bold;
            text-align: center;
            border-bottom: 1px solid #666;
            padding-bottom: 5px;
            margin-bottom: 8px;
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
            시연 신청서
          </h1>
          <div className="print-info-row">
            <span className="print-info-label">문서 번호:</span>
            <span className="print-info-value">DEMO-{demo.id}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">출력 일시:</span>
            <span className="print-info-value">
              {formatDateForDisplayFullUTC(new Date().toISOString())}
            </span>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="print-section print-no-break">
          <div className="print-section-title">기본 정보</div>
          <div className="print-info-row">
            <span className="print-info-label">시연 제목:</span>
            <span className="print-info-value">{demo.demoTitle}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">상태:</span>
            <span className="print-info-value">
              <span className="print-status">
                {getStatusText(demo.demoStatus)}
              </span>
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">생성일:</span>
            <span className="print-info-value">
              {formatDateForDisplayFullUTC(demo.createdAt)}
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">요청자:</span>
            <span className="print-info-value">{demo.requester}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">행사 담당자:</span>
            <span className="print-info-value">{demo.handler}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">시연 창고:</span>
            <span className="print-info-value">
              {demo.warehouse?.warehouseName || "창고 정보 없음"}
            </span>
          </div>
        </div>

        {/* 시연 정보 */}
        <div className="print-section print-no-break">
          <div className="print-section-title">시연 정보</div>
          <div className="print-info-row">
            <span className="print-info-label">시연 유형:</span>
            <span className="print-info-value">{demo.demoNationType}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">결제 유형:</span>
            <span className="print-info-value">{demo.demoPaymentType}</span>
          </div>
          {demo.demoPaymentType !== "무료" && (
            <>
              <div className="print-info-row">
                <span className="print-info-label">시연 가격:</span>
                <span className="print-info-value">
                  {demo.demoPrice
                    ? `${formatNumberWithCommas(
                        demo.demoPrice
                      )} ${currencyUnit}`
                    : "-"}
                </span>
              </div>
              <div className="print-info-row">
                <span className="print-info-label">결제 예정일:</span>
                <span className="print-info-value">
                  {demo.demoPaymentDate
                    ? formatDateForDisplayFullUTC(demo.demoPaymentDate)
                    : "-"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* 시연 일정 및 담당자 */}
        <div className="print-section">
          <div className="print-section-title">시연 일정 및 담당자</div>
          <div className="print-info-row">
            <span className="print-info-label">담당자:</span>
            <span className="print-info-value">
              {demo.demoManager} ({formatPhoneNumber(demo.demoManagerPhone)})
            </span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">시연 주소:</span>
            <span
              className="print-info-value"
              style={{ textAlign: "left", wordBreak: "break-all" }}
            >
              {demo.demoAddress}
            </span>
          </div>

          {/* 상차/하차 정보 */}
          <div className="print-delivery-section">
            <div className="print-delivery-box">
              <div className="print-delivery-title">상차 정보</div>
              <div className="print-info-row">
                <span className="print-info-label">방법:</span>
                <span className="print-info-value">
                  {demo.demoStartDeliveryMethod || "-"}
                </span>
              </div>
              <div className="print-info-row">
                <span className="print-info-label">물품 상차 시간:</span>
                <span className="print-info-value">
                  {demo.demoStartDate ? formatDateTimeToKorean(demo.demoStartDate, demo.demoStartTime, demo.demoStartDeliveryMethod) : "-"}
                </span>
              </div>
            </div>
            <div className="print-delivery-box">
              <div className="print-delivery-title">하차 정보</div>
              <div className="print-info-row">
                <span className="print-info-label">방법:</span>
                <span className="print-info-value">
                  {demo.demoEndDeliveryMethod || "-"}
                </span>
              </div>
              <div className="print-info-row">
                <span className="print-info-label">물품 하차 시간:</span>
                <span className="print-info-value">
                  {demo.demoEndDate ? formatDateTimeToKorean(demo.demoEndDate, demo.demoEndTime, demo.demoEndDeliveryMethod) : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* 이벤트 날짜 정보 (선택 사항) */}
          {(demo.eventStartDate || demo.eventEndDate) && (
            <div className="print-info-row" style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #ccc" }}>
              <span className="print-info-label">이벤트 기간:</span>
              <span className="print-info-value">
                {demo.eventStartDate && demo.eventEndDate
                  ? `${formatDateForDisplayFullUTC(demo.eventStartDate)}${demo.eventStartTime ? ` ${demo.eventStartTime}` : ""} ~ ${formatDateForDisplayFullUTC(demo.eventEndDate)}${demo.eventEndTime ? ` ${demo.eventEndTime}` : ""}`
                  : demo.eventStartDate
                  ? `${formatDateForDisplayFullUTC(demo.eventStartDate)}${demo.eventStartTime ? ` ${demo.eventStartTime}` : ""} ~`
                  : demo.eventEndDate
                  ? `~ ${formatDateForDisplayFullUTC(demo.eventEndDate)}${demo.eventEndTime ? ` ${demo.eventEndTime}` : ""}`
                  : "-"}
              </span>
            </div>
          )}
        </div>

        {/* 시연품 목록 */}
        <div className="print-section">
          <div className="print-section-title">시연품 목록</div>
          {demo.demoItems && demo.demoItems.length > 0 ? (
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
                {demo.demoItems.map((item, index) => (
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
            <p>시연품이 없습니다.</p>
          )}
        </div>

        {/* 메모 */}
        {demo.memo && (
          <div className="print-section">
            <div className="print-section-title">메모</div>
            <div className="print-memo">{demo.memo}</div>
          </div>
        )}

        {/* 첨부파일 */}
        {demo.files && demo.files.length > 0 && (
          <div className="print-section">
            <div className="print-section-title">첨부파일</div>
            <div className="print-files">
              {demo.files.map((file, index) => (
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

export default DemoRecordPrint;
