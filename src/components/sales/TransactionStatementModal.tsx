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

          {/* 거래명세서 본문 */}
          <div className="p-8 print:p-12" id="transaction-statement">
            {/* 헤더 */}
            <div className="text-center mb-8 pb-4 border-b-2 border-blue-600">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">거래명세서</h1>
              <p className="text-sm text-gray-500">TRANSACTION STATEMENT</p>
            </div>

            {/* 발행 정보 */}
            <div className="flex justify-between mb-6 text-sm">
              <div>
                <span className="text-gray-600">발행일자:</span>{' '}
                <span className="font-semibold">{today}</span>
              </div>
              <div>
                <span className="text-gray-600">문서번호:</span>{' '}
                <span className="font-semibold">TXN-{format(new Date(), 'yyyyMMdd')}-{record.id.toString().padStart(4, '0')}</span>
              </div>
            </div>

            {/* 공급자 & 공급받는자 정보 */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* 공급자 정보 */}
              <div className="border border-gray-300 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  [공급자 정보]
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-24">회사명:</span>
                    <span className="font-medium">(주)강스터즈</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">사업자번호:</span>
                    <span>XXX-XX-XXXXX</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">대표자:</span>
                    <span>XXX</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">사업장주소:</span>
                    <span>XXXXX</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">업태:</span>
                    <span>제조업</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">종목:</span>
                    <span>의료기기</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">담당자:</span>
                    <span>{originalOrder.manager || 'XXX'}</span>
                  </div>
                </div>
              </div>

              {/* 공급받는자 정보 */}
              <div className="border border-gray-300 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  [공급받는자 정보]
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-24">회사명:</span>
                    <span className="font-medium">{record.supplierName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">연락처:</span>
                    <span>{originalOrder.supplier?.supplierPhoneNumber || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">수령인:</span>
                    <span>{originalOrder.receiver || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">수령인 연락처:</span>
                    <span>{originalOrder.receiverPhone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 거래 정보 */}
            <div className="border border-gray-300 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="flex">
                  <span className="text-gray-600 w-32">발주번호:</span>
                  <span className="font-semibold">#{record.id}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">발주일자:</span>
                  <span>{formatDate(record.purchaseDate)}</span>
                </div>
                <div className="flex col-span-2">
                  <span className="text-gray-600 w-32">발주제목:</span>
                  <span className="font-medium">{record.title}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">발주 상태:</span>
                  <span className="font-medium">{record.status}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">설치일:</span>
                  <span>{originalOrder.installationDate ? formatDate(originalOrder.installationDate) : '-'}</span>
                </div>
                {originalOrder.receiverAddress && (
                  <div className="flex col-span-2">
                    <span className="text-gray-600 w-32">배송지:</span>
                    <span>{originalOrder.receiverAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 품목 상세 테이블 */}
            <div className="mb-6">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-center w-12">No</th>
                    <th className="border border-gray-300 px-3 py-2 text-left w-24">품목코드</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">품목명</th>
                    <th className="border border-gray-300 px-3 py-2 text-center w-16">수량</th>
                    <th className="border border-gray-300 px-3 py-2 text-right w-24">단가</th>
                    <th className="border border-gray-300 px-3 py-2 text-right w-28">금액</th>
                    <th className="border border-gray-300 px-3 py-2 text-left w-32">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 px-3 py-2">{item.item?.teamItem?.itemCode || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2">{item.item?.teamItem?.itemName || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        {item.sellingPrice ? `₩${item.sellingPrice.toLocaleString()}` : '-'}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-medium">
                        {item.sellingPrice ? `₩${(item.quantity * item.sellingPrice).toLocaleString()}` : '-'}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-xs">{item.memo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-blue-50 font-semibold">
                  <tr>
                    <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right">
                      총 품목: {record.itemCount}종 {record.totalQuantity}개
                    </td>
                    <td colSpan={2} className="border border-gray-300 px-3 py-2 text-right">
                      공급가액:
                    </td>
                    <td colSpan={2} className="border border-gray-300 px-3 py-2 text-right text-blue-600">
                      ₩{supplyAmount.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right">
                      부가세(10%):
                    </td>
                    <td colSpan={2} className="border border-gray-300 px-3 py-2 text-right">
                      ₩{vat.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right">
                      합계금액:
                    </td>
                    <td colSpan={2} className="border border-gray-300 px-3 py-2 text-right text-lg text-blue-600">
                      ₩{totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 특이사항 / 메모 */}
            {record.memo && (
              <div className="border border-gray-300 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">[특이사항]</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{record.memo}</p>
              </div>
            )}

            {/* 결재 영역 */}
            <div className="border border-gray-300 rounded-lg mb-6">
              <div className="grid grid-cols-3">
                <div className="border-r border-gray-300 p-4 text-center">
                  <div className="font-semibold mb-8">담당자</div>
                  <div className="h-16 flex items-center justify-center text-gray-400">(서명)</div>
                </div>
                <div className="border-r border-gray-300 p-4 text-center">
                  <div className="font-semibold mb-8">검토</div>
                  <div className="h-16 flex items-center justify-center text-gray-400">(서명)</div>
                </div>
                <div className="p-4 text-center">
                  <div className="font-semibold mb-8">승인</div>
                  <div className="h-16 flex items-center justify-center text-gray-400">(서명)</div>
                </div>
              </div>
            </div>

            {/* 푸터 */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p>본 거래명세서는 KARS(Kangsters Auto Resource-management System)에서 자동 생성되었습니다.</p>
              <p className="mt-1">발행일시: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
              <p className="mt-1">© 2025 Kangsters. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 인쇄 스타일 */}
      <style jsx global>{`
        @media print {
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
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
