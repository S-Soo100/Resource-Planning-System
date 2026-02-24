import * as XLSX from 'xlsx';
import { Supplier } from '@/types/supplier';
import { SalesRecord } from '@/types/sales';
import { PurchaseRecord } from '@/types/purchase';
import { TeamItem } from '@/types/(item)/team-item';
import { format } from 'date-fns';

/**
 * 고객 상세 데이터를 엑셀로 내보내기
 * @param supplier 고객 정보
 * @param salesRecords 매출 레코드
 * @param purchaseRecords 매입 레코드
 * @param teamItemsMap 품목 맵 (원가 조회용)
 * @param dateRange 조회 날짜 범위
 * @param showMarginColumns 마진 컬럼 표시 여부
 */
export const exportSupplierDetailToExcel = (
  supplier: Supplier,
  salesRecords: SalesRecord[],
  purchaseRecords: PurchaseRecord[],
  teamItemsMap?: Map<number, TeamItem>,
  dateRange?: { startDate: string; endDate: string },
  showMarginColumns = false
) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 고객 기본 정보
  const supplierInfoData = [
    ['고객명', supplier.supplierName],
    ['대표자명', supplier.representativeName || '-'],
    ['전화번호', supplier.supplierPhoneNumber || '-'],
    ['이메일', supplier.email || '-'],
    ['사업자등록번호', supplier.registrationNumber || '-'],
    ['주소', supplier.supplierAddress || '-'],
    ['메모', supplier.memo || '-'],
    [],
    ['조회 기간', dateRange ? `${dateRange.startDate} ~ ${dateRange.endDate}` : '전체'],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(supplierInfoData);
  XLSX.utils.book_append_sheet(wb, ws1, '고객 정보');

  // Sheet 2: 매출 내역 요약
  const salesSummaryData = [
    ['총 매출 건수', salesRecords.length],
    [
      '총 매출 금액',
      salesRecords.reduce((sum, r) => sum + (r.totalPrice || 0), 0).toLocaleString() + '원',
    ],
  ];

  if (showMarginColumns) {
    const totalMargin = salesRecords.reduce(
      (sum, r) => sum + (r.marginAmount || 0),
      0
    );
    const recordsWithMargin = salesRecords.filter((r) => r.marginRate !== null && r.marginRate !== undefined);
    const avgMarginRate =
      recordsWithMargin.length > 0
        ? (
            recordsWithMargin.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
            recordsWithMargin.length
          ).toFixed(1)
        : 0;

    salesSummaryData.push(
      ['총 마진액', totalMargin.toLocaleString() + '원'],
      ['평균 마진율', avgMarginRate + '%']
    );
  }

  const ws2 = XLSX.utils.aoa_to_sheet(salesSummaryData);
  XLSX.utils.book_append_sheet(wb, ws2, '매출 요약');

  // Sheet 3: 매출 상세 내역
  const salesDetailData = salesRecords.map((record, index) => {
    const baseData: any = {
      No: index + 1,
      발주일자: record.purchaseDate,
      제목: record.title,
      수령인: record.receiver,
      품목수: record.itemCount,
      총수량: record.totalQuantity,
      매출금액: record.totalPrice !== null ? record.totalPrice : '미입력',
    };

    if (showMarginColumns) {
      baseData.원가 = record.costAmount !== null && record.costAmount !== undefined ? record.costAmount : '미입력';
      baseData.마진액 = record.marginAmount !== null && record.marginAmount !== undefined ? record.marginAmount : '-';
      baseData.마진율 = record.marginRate !== null && record.marginRate !== undefined ? `${record.marginRate.toFixed(1)}%` : '-';
    }

    baseData.상태 = record.status;
    baseData.담당자 = record.manager;
    baseData.비고 = record.memo || '-';

    return baseData;
  });

  const ws3 = XLSX.utils.json_to_sheet(salesDetailData);
  XLSX.utils.book_append_sheet(wb, ws3, '매출 상세');

  // Sheet 4: 매입 내역 요약
  const totalPurchaseAmount = purchaseRecords.reduce((sum, r) => {
    const teamItemId = r.originalRecord.item?.teamItem?.id;
    if (!teamItemId || !teamItemsMap) return sum;

    const teamItem = teamItemsMap.get(teamItemId);
    const costPrice = teamItem?.costPrice;

    if (costPrice !== null && costPrice !== undefined) {
      return sum + r.quantity * costPrice;
    }
    return sum;
  }, 0);

  const purchaseSummaryData = [
    ['총 매입 건수', purchaseRecords.length],
    ['총 매입 금액', totalPurchaseAmount.toLocaleString() + '원'],
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(purchaseSummaryData);
  XLSX.utils.book_append_sheet(wb, ws4, '매입 요약');

  // Sheet 5: 매입 상세 내역
  const purchaseDetailData = purchaseRecords.map((record, index) => {
    const teamItemId = record.originalRecord.item?.teamItem?.id;
    let costPrice: number | null = null;
    let totalPrice: number | null = null;

    if (teamItemId && teamItemsMap) {
      const teamItem = teamItemsMap.get(teamItemId);
      costPrice = teamItem?.costPrice ?? null;
      if (costPrice !== null) {
        totalPrice = record.quantity * costPrice;
      }
    }

    return {
      No: index + 1,
      입고일자: record.inboundDate,
      품목코드: record.itemCode,
      품목명: record.itemName,
      수량: record.quantity,
      단가: costPrice !== null ? costPrice : '미입력',
      금액: totalPrice !== null ? totalPrice : '-',
      비고: record.remarks || '-',
    };
  });

  const ws5 = XLSX.utils.json_to_sheet(purchaseDetailData);
  XLSX.utils.book_append_sheet(wb, ws5, '매입 상세');

  // 파일 다운로드
  const defaultFilename = `고객_${supplier.supplierName}_${format(
    new Date(),
    'yyyyMMdd_HHmmss'
  )}.xlsx`;
  XLSX.writeFile(wb, defaultFilename);
};
