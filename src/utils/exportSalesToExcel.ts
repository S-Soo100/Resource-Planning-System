import * as XLSX from 'xlsx';
import { SalesRecord } from '@/types/sales';
import { format } from 'date-fns';

/**
 * 판매 데이터를 엑셀로 내보내기 (권한별 컬럼 차별화)
 * @param records 판매 레코드 배열
 * @param filename 파일명 (선택)
 * @param showMarginColumns 마진 컬럼 표시 여부 (Admin/Moderator)
 */
export const exportSalesToExcel = (
  records: SalesRecord[],
  filename?: string,
  showMarginColumns = false
) => {
  // Sheet 1: 발주 요약 (권한별 컬럼 차별화)
  const summaryData = records.map((record, index) => {
    const baseData: any = {
      No: index + 1,
      발주일자: record.purchaseDate,
      제목: record.title,
      판매처: record.supplierName,
      수령인: record.receiver,
      품목수: `${record.itemCount}종 ${record.totalQuantity}개`,
      판매가: record.totalPrice !== null ? record.totalPrice : '미입력',
    };

    // Admin/Moderator만 마진 정보 포함
    if (showMarginColumns) {
      baseData.원가 =
        record.costAmount !== null && record.costAmount !== undefined
          ? record.costAmount
          : '미입력';
      baseData.마진액 =
        record.marginAmount !== null && record.marginAmount !== undefined
          ? record.marginAmount
          : '-';
      baseData.마진율 =
        record.marginRate !== null && record.marginRate !== undefined
          ? `${record.marginRate.toFixed(1)}%`
          : '-';
    }

    baseData.상태 = record.status;
    baseData.담당자 = record.manager;
    baseData.비고 = record.memo || '-';

    return baseData;
  });

  // 합계 행 추가
  const totalQuantity = records.reduce((sum, r) => sum + r.totalQuantity, 0);
  const totalItems = records.reduce((sum, r) => sum + r.itemCount, 0);
  const totalSales = records.reduce(
    (sum, r) => (r.totalPrice !== null ? sum + r.totalPrice : sum),
    0
  );

  const totalRow: any = {
    No: '',
    발주일자: '',
    제목: '',
    판매처: '',
    수령인: '합계',
    품목수: `${totalItems}종 ${totalQuantity}개`,
    판매가: totalSales,
  };

  if (showMarginColumns) {
    const totalCost = records.reduce(
      (sum, r) =>
        r.costAmount !== null && r.costAmount !== undefined
          ? sum + r.costAmount
          : sum,
      0
    );
    const totalMargin = records.reduce(
      (sum, r) =>
        r.marginAmount !== null && r.marginAmount !== undefined
          ? sum + r.marginAmount
          : sum,
      0
    );
    const recordsWithMargin = records.filter(
      (r) => r.marginRate !== null && r.marginRate !== undefined
    );
    const avgMarginRate =
      recordsWithMargin.length > 0
        ? recordsWithMargin.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
          recordsWithMargin.length
        : 0;

    totalRow.원가 = totalCost;
    totalRow.마진액 = totalMargin;
    totalRow.마진율 = `${avgMarginRate.toFixed(1)}%`;
  }

  totalRow.상태 = '';
  totalRow.담당자 = '';
  totalRow.비고 = '';

  summaryData.push(totalRow);

  const worksheet1 = XLSX.utils.json_to_sheet(summaryData);

  // Sheet 2: 품목 상세 (모든 orderItem 펼침)
  const detailData: any[] = [];
  records.forEach((record) => {
    record.orderItems.forEach((item) => {
      const itemPrice = item.sellingPrice ?? null;
      const itemTotal =
        itemPrice !== null && itemPrice !== undefined
          ? itemPrice * item.quantity
          : null;

      detailData.push({
        발주일자: record.purchaseDate,
        제목: record.title,
        판매처: record.supplierName,
        품목코드: item.item?.teamItem?.itemCode || '',
        품목명: item.item?.teamItem?.itemName || '',
        수량: item.quantity,
        단가: itemPrice !== null && itemPrice !== undefined ? itemPrice : '미입력',
        금액: itemTotal !== null ? itemTotal : '미입력',
        상태: record.status,
        담당자: record.manager,
      });
    });
  });

  const worksheet2 = XLSX.utils.json_to_sheet(detailData);

  // Sheet 3: 판매가 미입력 발주
  const missingPriceRecords = records.filter((r) => r.totalPrice === null);
  const missingPriceData = missingPriceRecords.map((record, index) => ({
    No: index + 1,
    발주일자: record.purchaseDate,
    제목: record.title,
    판매처: record.supplierName,
    수령인: record.receiver,
    품목수: `${record.itemCount}종 ${record.totalQuantity}개`,
    상태: record.status,
    담당자: record.manager,
    비고: record.memo || '-',
  }));

  const worksheet3 = XLSX.utils.json_to_sheet(missingPriceData);

  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet1, '판매 요약');
  XLSX.utils.book_append_sheet(workbook, worksheet2, '품목 상세');
  XLSX.utils.book_append_sheet(workbook, worksheet3, '판매가 미입력');

  // 파일명 생성
  const defaultFilename = `판매내역_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
  XLSX.writeFile(workbook, filename || defaultFilename);
};
