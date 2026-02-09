import * as XLSX from 'xlsx';
import { PurchaseRecord } from '@/types/purchase';
import { format } from 'date-fns';

/**
 * 숫자를 통화 형식으로 변환
 */
const formatCurrency = (value: number | null): string => {
  if (value === null) return '미입력';
  return `₩${value.toLocaleString('ko-KR')}`;
};

/**
 * 구매 데이터를 엑셀로 내보내기
 */
export const exportPurchaseToExcel = (
  records: PurchaseRecord[],
  filename?: string
) => {
  // Sheet 1: 전체 구매 내역
  const allData = records.map((record, index) => ({
    No: index + 1,
    입고일자: record.inboundDate,
    품목코드: record.itemCode,
    품목명: record.itemName,
    카테고리: record.categoryName,
    수량: record.quantity,
    단가: record.unitPrice !== null ? record.unitPrice : '미입력',
    금액: record.totalPrice !== null ? record.totalPrice : '미입력',
    공급처: record.supplierName || '-',
    창고: record.warehouseName || '-',
    비고: record.remarks || '-',
  }));

  // 합계 행 추가
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
  const totalAmount = records.reduce(
    (sum, r) => (r.totalPrice !== null ? sum + r.totalPrice : sum),
    0
  );

  allData.push({
    No: '',
    입고일자: '',
    품목코드: '',
    품목명: '',
    카테고리: '합계',
    수량: totalQuantity,
    단가: '',
    금액: totalAmount,
    공급처: '',
    창고: '',
    비고: '',
  } as any);

  const worksheet1 = XLSX.utils.json_to_sheet(allData);

  // Sheet 2: 원가 미입력 품목
  const missingCostRecords = records.filter((r) => r.unitPrice === null);
  const missingCostData = missingCostRecords.map((record, index) => ({
    No: index + 1,
    입고일자: record.inboundDate,
    품목코드: record.itemCode,
    품목명: record.itemName,
    카테고리: record.categoryName,
    수량: record.quantity,
    공급처: record.supplierName || '-',
    창고: record.warehouseName || '-',
    비고: record.remarks || '-',
  }));

  const worksheet2 = XLSX.utils.json_to_sheet(missingCostData);

  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet1, '구매 내역');
  XLSX.utils.book_append_sheet(workbook, worksheet2, '원가 미입력');

  // 파일명 생성
  const defaultFilename = `구매내역_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
  XLSX.writeFile(workbook, filename || defaultFilename);
};
