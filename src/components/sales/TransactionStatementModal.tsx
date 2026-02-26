'use client';

import { X, Download, FileSpreadsheet } from 'lucide-react';
import { SalesRecord } from '@/types/sales';
import { format } from 'date-fns';
import { useAuth, useSelectedTeam } from '@/store/authStore';
import { exportTransactionStatementToExcel } from '@/utils/exportTransactionStatementToExcel';

interface TransactionStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SalesRecord;
}

export function TransactionStatementModal({
  isOpen,
  onClose,
  record,
}: TransactionStatementModalProps) {
  if (!isOpen) return null;

  const { user } = useAuth();
  const { selectedTeam } = useSelectedTeam();
  const { originalOrder, orderItems } = record;

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일');
    } catch {
      return dateString;
    }
  };

  // 오늘 날짜
  const today = format(new Date(), 'yyyy년 MM월 dd일');

  // 문서번호 생성
  const documentNumber = `KS_${format(new Date(), 'yyyyMMdd')}_${record.id.toString().padStart(4, '0')}`;

  // 총액 계산: 각 품목의 실제 VAT를 합산
  const supplyAmount = orderItems.reduce((sum, item) => {
    return sum + (item.sellingPrice ? item.sellingPrice * item.quantity : 0);
  }, 0);

  const vat = orderItems.reduce((sum, item) => {
    const unitVat = item.vat ?? 0; // VAT가 없으면 0원
    return sum + (unitVat * item.quantity);
  }, 0);

  const totalAmount = supplyAmount + vat;

  // PDF 다운로드 (인쇄 기능 활용)
  const handleDownloadPDF = () => {
    // 원래 제목 저장
    const originalTitle = document.title;

    // PDF 파일명 설정: 거래명세서_{문서번호}_{userId}
    const pdfFileName = `거래명세서_${documentNumber}_${user?.id || 'unknown'}`;
    document.title = pdfFileName;

    // 인쇄 대화상자 열기
    window.print();

    // 인쇄 후 원래 제목 복원 (약간의 딜레이 후)
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // 엑셀 다운로드
  const handleDownloadExcel = async () => {
    await exportTransactionStatementToExcel(record, selectedTeam ? {
      companyName: selectedTeam.companyName,
      businessRegistrationNumber: selectedTeam.businessRegistrationNumber,
      representativeName: selectedTeam.representativeName,
      businessAddress: selectedTeam.businessAddress,
      phoneNumber: selectedTeam.phoneNumber,
    } : null);
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* 모달 컨텐츠 */}
        <div
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 모달 헤더 (인쇄 시 숨김) */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between print:hidden z-10">
            <h2 className="text-xl font-bold text-gray-900">거래명세서</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                엑셀 다운로드
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF 다운로드
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 거래명세서 본문 (2개 1세트) */}
          <div className="print:p-0" id="transaction-statement">
            {/* 첫 번째 명세서 */}
            <div className="p-6 print:p-4 print:h-[48vh]">
              {/* 헤더 */}
              <div className="text-center mb-3 pb-2 border-b-2 border-blue-600">
                <h1 className="text-xl font-bold text-gray-900">거래명세서</h1>
              </div>

              {/* 발행 정보 */}
              <div className="flex justify-between mb-3 text-xs">
                <div>
                  <span className="text-gray-600">발행일자:</span>{' '}
                  <span className="font-semibold">{today}</span>
                </div>
                <div>
                  <span className="text-gray-600">문서번호:</span>{' '}
                  <span className="font-semibold">{documentNumber}</span>
                </div>
              </div>

              {/* 공급자 & 공급받는자 정보 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* 공급자 정보 */}
                <div className="border border-gray-300 rounded p-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-1 pb-1 border-b border-gray-200">
                    [공급자 정보]
                  </h3>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex">
                      <span className="text-gray-600 w-16">회사명:</span>
                      <span className="font-medium">{selectedTeam?.companyName || '-'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">사업자번호:</span>
                        <span className="text-[9px]">{selectedTeam?.businessRegistrationNumber || '-'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">대표자:</span>
                        <span>{selectedTeam?.representativeName || '-'}</span>
                      </div>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-16">사업장주소:</span>
                      <span className="text-[9px]">{selectedTeam?.businessAddress || '-'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">담당자:</span>
                        <span>{originalOrder.requester || '-'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">연락처:</span>
                        <span className="text-[9px]">{selectedTeam?.phoneNumber || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 공급받는자 정보 */}
                <div className="border border-gray-300 rounded p-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-1 pb-1 border-b border-gray-200">
                    [공급받는자 정보]
                  </h3>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex">
                      <span className="text-gray-600 w-16">회사명:</span>
                      <span className="font-medium">{record.supplierName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">사업자번호:</span>
                        <span className="text-[9px]">-</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">대표자:</span>
                        <span>-</span>
                      </div>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-16">사업장주소:</span>
                      <span className="text-[9px]">{originalOrder.receiverAddress || '-'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">담당자:</span>
                        <span>{originalOrder.receiver || '-'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">연락처:</span>
                        <span className="text-[9px]">{originalOrder.receiverPhone || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 품목 상세 테이블 */}
              <div className="mb-2">
                <table className="w-full border border-gray-300 text-[9px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-1 py-1 text-center w-8 text-[10px]">No</th>
                      <th className="border border-gray-300 px-1 py-1 text-left w-[45%] text-[10px]">품목명</th>
                      <th className="border border-gray-300 px-1 py-1 text-center w-12 text-[10px]">수량</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-[100px] text-[10px]">단가</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-[90px] text-[10px]">부가세</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-[110px] text-[10px]">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => {
                      // VAT: item.vat가 없으면 0원
                      const unitVat = item.vat ?? 0;
                      const itemVat = unitVat * item.quantity;
                      const itemTotal = item.sellingPrice
                        ? (item.sellingPrice * item.quantity) + itemVat
                        : 0;

                      return (
                        <tr key={item.id}>
                          <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">{index + 1}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-[9px]">{item.item?.teamItem?.itemName || '-'}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">{item.quantity}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px]">
                            {item.sellingPrice ? `₩${item.sellingPrice.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px]">
                            {item.sellingPrice ? `₩${unitVat.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right font-medium text-[9px]">
                            {item.sellingPrice ? `₩${itemTotal.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                    {/* 여백 행 3칸 */}
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr key={`empty-${i}`}>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]">&nbsp;</td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50 font-semibold">
                    <tr>
                      <td colSpan={3} className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">
                        총 품목: {record.itemCount}종 {record.totalQuantity}개
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">
                        공급가액
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">
                        부가세
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">
                        합계
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="border border-gray-300 px-1 py-0.5"></td>
                      <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px] text-blue-600">
                        ₩{supplyAmount.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px]">
                        ₩{vat.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px] text-blue-600 font-bold">
                        ₩{totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 푸터 */}
              <div className="text-center text-[8px] text-gray-500 pt-1">
                <p>본 거래명세서는 KARS(Kangsters Auto Resource-management System)시스템으로 생성되었습니다.</p>
                <p className="mt-0.5">발행일시: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')} | © 2025 Kangsters. All rights reserved.</p>
              </div>
            </div>

            {/* 절취선 */}
            <div className="border-t-2 border-dashed border-gray-400 my-2 relative">
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[8px] text-gray-500">
                ✂ 절 취 선 ✂
              </span>
            </div>

            {/* 두 번째 명세서 (동일한 내용) */}
            <div className="p-6 print:p-4 print:h-[48vh]">
              {/* 헤더 */}
              <div className="text-center mb-3 pb-2 border-b-2 border-blue-600">
                <h1 className="text-xl font-bold text-gray-900">거래명세서</h1>
              </div>

              {/* 발행 정보 */}
              <div className="flex justify-between mb-3 text-xs">
                <div>
                  <span className="text-gray-600">발행일자:</span>{' '}
                  <span className="font-semibold">{today}</span>
                </div>
                <div>
                  <span className="text-gray-600">문서번호:</span>{' '}
                  <span className="font-semibold">{documentNumber}</span>
                </div>
              </div>

              {/* 공급자 & 공급받는자 정보 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* 공급자 정보 */}
                <div className="border border-gray-300 rounded p-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-1 pb-1 border-b border-gray-200">
                    [공급자 정보]
                  </h3>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex">
                      <span className="text-gray-600 w-16">회사명:</span>
                      <span className="font-medium">{selectedTeam?.companyName || '-'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">사업자번호:</span>
                        <span className="text-[9px]">{selectedTeam?.businessRegistrationNumber || '-'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">대표자:</span>
                        <span>{selectedTeam?.representativeName || '-'}</span>
                      </div>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-16">사업장주소:</span>
                      <span className="text-[9px]">{selectedTeam?.businessAddress || '-'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">담당자:</span>
                        <span>{originalOrder.requester || '-'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">연락처:</span>
                        <span className="text-[9px]">{selectedTeam?.phoneNumber || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 공급받는자 정보 */}
                <div className="border border-gray-300 rounded p-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-1 pb-1 border-b border-gray-200">
                    [공급받는자 정보]
                  </h3>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex">
                      <span className="text-gray-600 w-16">회사명:</span>
                      <span className="font-medium">{record.supplierName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">사업자번호:</span>
                        <span className="text-[9px]">-</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">대표자:</span>
                        <span>-</span>
                      </div>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-16">사업장주소:</span>
                      <span className="text-[9px]">{originalOrder.receiverAddress || '-'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">담당자:</span>
                        <span>{originalOrder.receiver || '-'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">연락처:</span>
                        <span className="text-[9px]">{originalOrder.receiverPhone || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 품목 상세 테이블 */}
              <div className="mb-2">
                <table className="w-full border border-gray-300 text-[9px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-1 py-1 text-center w-8 text-[10px]">No</th>
                      <th className="border border-gray-300 px-1 py-1 text-left w-[45%] text-[10px]">품목명</th>
                      <th className="border border-gray-300 px-1 py-1 text-center w-12 text-[10px]">수량</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-[100px] text-[10px]">단가</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-[90px] text-[10px]">부가세</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-[110px] text-[10px]">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => {
                      // VAT: item.vat가 없으면 0원
                      const unitVat = item.vat ?? 0;
                      const itemVat = unitVat * item.quantity;
                      const itemTotal = item.sellingPrice
                        ? (item.sellingPrice * item.quantity) + itemVat
                        : 0;

                      return (
                        <tr key={`copy-${item.id}`}>
                          <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">{index + 1}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-[9px]">{item.item?.teamItem?.itemName || '-'}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">{item.quantity}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px]">
                            {item.sellingPrice ? `₩${item.sellingPrice.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px]">
                            {item.sellingPrice ? `₩${unitVat.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right font-medium text-[9px]">
                            {item.sellingPrice ? `₩${itemTotal.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                    {/* 여백 행 3칸 */}
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr key={`copy-empty-${i}`}>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]">&nbsp;</td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                        <td className="border border-gray-300 px-1 py-0.5 text-[9px]"></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50 font-semibold">
                    <tr>
                      <td colSpan={3} className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">
                        총 품목: {record.itemCount}종 {record.totalQuantity}개
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">
                        공급가액
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">
                        부가세
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-center text-[9px]">
                        합계
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="border border-gray-300 px-1 py-0.5"></td>
                      <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px] text-blue-600">
                        ₩{supplyAmount.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px]">
                        ₩{vat.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 text-right text-[9px] text-blue-600 font-bold">
                        ₩{totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 푸터 */}
              <div className="text-center text-[8px] text-gray-500 pt-1">
                <p>본 거래명세서는 KARS(Kangsters Auto Resource-management System)시스템으로 생성되었습니다.</p>
                <p className="mt-0.5">발행일시: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')} | © 2025 Kangsters. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 인쇄 스타일 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          body * {
            visibility: hidden;
          }

          #transaction-statement,
          #transaction-statement * {
            visibility: visible;
          }

          #transaction-statement {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            margin: 0;
            padding: 0;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }

          .print\\:p-4 {
            padding: 1rem !important;
          }

          .print\\:h-\\[48vh\\] {
            height: 48vh !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }

          /* 절취선 스타일 */
          .border-dashed {
            border-style: dashed !important;
          }
        }
      `}</style>
    </>
  );
}
