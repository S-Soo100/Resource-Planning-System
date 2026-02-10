'use client';

import { X, Download } from 'lucide-react';
import { SalesRecord } from '@/types/sales';
import { format } from 'date-fns';

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

  // 총액 계산
  const supplyAmount = record.totalPrice || 0;
  const vat = Math.round(supplyAmount * 0.1);
  const totalAmount = supplyAmount + vat;

  // PDF 다운로드 (현재는 print 기능으로 대체)
  const handleDownloadPDF = () => {
    window.print();
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
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF 다운로드
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
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
                  <span className="font-semibold">KS_{format(new Date(), 'yyyyMMdd')}_{record.id.toString().padStart(4, '0')}</span>
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
                      <span className="font-medium">(주)강스터즈</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">사업자번호:</span>
                        <span className="text-[9px]">XXX-XX-XXXXX</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">대표자:</span>
                        <span>XXX</span>
                      </div>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-16">사업장주소:</span>
                      <span className="text-[9px]">XXXXX</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">업태:</span>
                        <span>제조업</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">종목:</span>
                        <span>의료기기</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">담당자:</span>
                        <span>{originalOrder.manager || 'XXX'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">연락처:</span>
                        <span className="text-[9px]">{originalOrder.supplier?.supplierPhoneNumber || 'XXX'}</span>
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
                      <th className="border border-gray-300 px-1 py-1 text-center w-8">No</th>
                      <th className="border border-gray-300 px-1 py-1 text-left w-16">품목코드</th>
                      <th className="border border-gray-300 px-1 py-1 text-left">품목명</th>
                      <th className="border border-gray-300 px-1 py-1 text-center w-10">수량</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-16">단가</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-16">부가세</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-20">금액</th>
                      <th className="border border-gray-300 px-1 py-1 text-left w-16">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => {
                      const itemVat = item.sellingPrice ? Math.round(item.quantity * item.sellingPrice * 0.1) : 0;
                      return (
                        <tr key={item.id}>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-[8px]">{item.item?.teamItem?.itemCode || '-'}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-[8px]">{item.item?.teamItem?.itemName || '-'}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                            {item.sellingPrice ? `₩${item.sellingPrice.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                            {item.sellingPrice ? `₩${itemVat.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right font-medium text-[8px]">
                            {item.sellingPrice ? `₩${(item.quantity * item.sellingPrice + itemVat).toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-[7px]">{item.memo || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-blue-50 font-semibold">
                    <tr>
                      <td colSpan={4} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        총 품목: {record.itemCount}종 {record.totalQuantity}개
                      </td>
                      <td colSpan={2} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        공급가액:
                      </td>
                      <td colSpan={2} className="border border-gray-300 px-1 py-0.5 text-right text-blue-600 text-[9px]">
                        ₩{supplyAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        부가세(10%):
                      </td>
                      <td colSpan={2} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        ₩{vat.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        합계금액:
                      </td>
                      <td colSpan={2} className="border border-gray-300 px-1 py-0.5 text-right text-blue-600 font-bold">
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

            {/* 절취선 (인쇄시에만) */}
            <div className="print:block hidden border-t-2 border-dashed border-gray-400 my-2 relative">
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[8px] text-gray-500">
                ✂ 절 취 선 ✂
              </span>
            </div>

            {/* 두 번째 명세서 (동일한 내용) */}
            <div className="p-6 print:p-4 print:h-[48vh] print:block hidden">
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
                  <span className="font-semibold">KS_{format(new Date(), 'yyyyMMdd')}_{record.id.toString().padStart(4, '0')}</span>
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
                      <span className="font-medium">(주)강스터즈</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">사업자번호:</span>
                        <span className="text-[9px]">XXX-XX-XXXXX</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">대표자:</span>
                        <span>XXX</span>
                      </div>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-16">사업장주소:</span>
                      <span className="text-[9px]">XXXXX</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">업태:</span>
                        <span>제조업</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">종목:</span>
                        <span>의료기기</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="flex">
                        <span className="text-gray-600 w-16">담당자:</span>
                        <span>{originalOrder.manager || 'XXX'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-12">연락처:</span>
                        <span className="text-[9px]">{originalOrder.supplier?.supplierPhoneNumber || 'XXX'}</span>
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
                      <th className="border border-gray-300 px-1 py-1 text-center w-8">No</th>
                      <th className="border border-gray-300 px-1 py-1 text-left w-16">품목코드</th>
                      <th className="border border-gray-300 px-1 py-1 text-left">품목명</th>
                      <th className="border border-gray-300 px-1 py-1 text-center w-10">수량</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-16">단가</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-16">부가세</th>
                      <th className="border border-gray-300 px-1 py-1 text-right w-20">금액</th>
                      <th className="border border-gray-300 px-1 py-1 text-left w-16">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => {
                      const itemVat = item.sellingPrice ? Math.round(item.quantity * item.sellingPrice * 0.1) : 0;
                      return (
                        <tr key={`copy-${item.id}`}>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-[8px]">{item.item?.teamItem?.itemCode || '-'}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-[8px]">{item.item?.teamItem?.itemName || '-'}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                            {item.sellingPrice ? `₩${item.sellingPrice.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                            {item.sellingPrice ? `₩${itemVat.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-right font-medium text-[8px]">
                            {item.sellingPrice ? `₩${(item.quantity * item.sellingPrice + itemVat).toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-[7px]">{item.memo || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-blue-50 font-semibold">
                    <tr>
                      <td colSpan={4} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        총 품목: {record.itemCount}종 {record.totalQuantity}개
                      </td>
                      <td colSpan={2} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        공급가액:
                      </td>
                      <td colSpan={2} className="border border-gray-300 px-1 py-0.5 text-right text-blue-600 text-[9px]">
                        ₩{supplyAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        부가세(10%):
                      </td>
                      <td colSpan={2} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        ₩{vat.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="border border-gray-300 px-1 py-0.5 text-right text-[8px]">
                        합계금액:
                      </td>
                      <td colSpan={2} className="border border-gray-300 px-1 py-0.5 text-right text-blue-600 font-bold">
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
