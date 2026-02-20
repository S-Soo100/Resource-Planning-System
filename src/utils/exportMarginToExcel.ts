import * as XLSX from 'xlsx';
import { MarginAnalysisRecord } from '@/types/margin-analysis';
import { format } from 'date-fns';

/**
 * 마진 분석 데이터를 엑셀로 내보내기 (3 sheets)
 */
export const exportMarginToExcel = (
  records: MarginAnalysisRecord[],
  yearMonth: string,
  filename?: string
) => {
  // Sheet 1: 마진 분석 (전체 데이터)
  const marginData = records.map((record, index) => ({
    No: index + 1,
    품목코드: record.itemCode,
    품목명: record.itemName,
    거래건수: record.transactionCount,
    판매수량: record.salesQuantity,
    판매가합계: record.hasSalesPrice ? record.salesAmount : '미입력',
    원가합계: record.hasCostPrice ? record.costAmount : '미입력',
    마진액:
      record.marginAmount !== null
        ? record.marginAmount
        : '미입력',
    마진율:
      record.marginRate !== null
        ? `${record.marginRate.toFixed(1)}%`
        : '미입력',
  }));

  // 합계 행 추가
  const totalTransactionCount = records.reduce(
    (sum, r) => sum + r.transactionCount,
    0
  );
  const totalSalesQuantity = records.reduce(
    (sum, r) => sum + r.salesQuantity,
    0
  );
  const totalSalesAmount = records.reduce(
    (sum, r) =>
      r.hasSalesPrice && r.salesAmount !== null ? sum + r.salesAmount : sum,
    0
  );
  const totalCostAmount = records.reduce(
    (sum, r) =>
      r.hasCostPrice && r.costAmount !== null ? sum + r.costAmount : sum,
    0
  );
  const totalMarginAmount = records.reduce(
    (sum, r) => (r.marginAmount !== null ? sum + r.marginAmount : sum),
    0
  );

  // 평균 마진율 계산
  const recordsWithMarginRate = records.filter(
    (r) => r.marginRate !== null
  );
  const averageMarginRate =
    recordsWithMarginRate.length > 0
      ? recordsWithMarginRate.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
        recordsWithMarginRate.length
      : 0;

  marginData.push({
    No: '',
    품목코드: '',
    품목명: '합계',
    거래건수: totalTransactionCount,
    판매수량: totalSalesQuantity,
    판매가합계: totalSalesAmount,
    원가합계: totalCostAmount,
    마진액: totalMarginAmount,
    마진율: `${averageMarginRate.toFixed(1)}%`,
  } as any);

  const worksheet1 = XLSX.utils.json_to_sheet(marginData);

  // Sheet 2: 역마진 품목 (마진율 < 0)
  const negativeMarginRecords = records.filter((r) => r.isNegativeMargin);
  const negativeMarginData = negativeMarginRecords.map((record, index) => ({
    No: index + 1,
    품목코드: record.itemCode,
    품목명: record.itemName,
    거래건수: record.transactionCount,
    판매수량: record.salesQuantity,
    판매가합계: record.salesAmount,
    원가합계: record.costAmount,
    마진액: record.marginAmount,
    마진율: `${record.marginRate?.toFixed(1)}%`,
  }));

  const worksheet2 = XLSX.utils.json_to_sheet(negativeMarginData);

  // Sheet 3: 원가/판매가 미입력
  const missingDataRecords = records.filter(
    (r) => !r.hasCostPrice || !r.hasSalesPrice
  );
  const missingDataData = missingDataRecords.map((record, index) => ({
    No: index + 1,
    품목코드: record.itemCode,
    품목명: record.itemName,
    거래건수: record.transactionCount,
    판매수량: record.salesQuantity,
    판매가합계: record.hasSalesPrice ? record.salesAmount : '미입력',
    원가합계: record.hasCostPrice ? record.costAmount : '미입력',
    비고: (() => {
      const missing = [];
      if (!record.hasSalesPrice) missing.push('판매가 미입력');
      if (!record.hasCostPrice) missing.push('원가 미입력');
      return missing.join(', ');
    })(),
  }));

  const worksheet3 = XLSX.utils.json_to_sheet(missingDataData);

  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet1, '마진 분석');
  XLSX.utils.book_append_sheet(workbook, worksheet2, '역마진 품목');
  XLSX.utils.book_append_sheet(workbook, worksheet3, '원가판매가 미입력');

  // 파일명 생성
  const defaultFilename = `마진분석_${yearMonth}_${format(
    new Date(),
    'yyyyMMdd_HHmmss'
  )}.xlsx`;
  XLSX.writeFile(workbook, filename || defaultFilename);
};
