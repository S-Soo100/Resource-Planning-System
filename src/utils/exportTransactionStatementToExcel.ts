import ExcelJS from 'exceljs';
import { SalesRecord } from '@/types/sales';
import { format } from 'date-fns';

interface TeamInfo {
  companyName?: string;
  businessRegistrationNumber?: string;
  representativeName?: string;
  businessAddress?: string;
  phoneNumber?: string;
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'D1D5DB' } },
  bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
  left: { style: 'thin', color: { argb: 'D1D5DB' } },
  right: { style: 'thin', color: { argb: 'D1D5DB' } },
};

const BLUE_FILL: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'EFF6FF' },
};

const GRAY_FILL: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'F3F4F6' },
};

const HEADER_FILL: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'F9FAFB' },
};

/**
 * 거래명세서를 엑셀로 내보내기 (PDF와 동일한 레이아웃)
 */
export const exportTransactionStatementToExcel = async (
  record: SalesRecord,
  teamInfo: TeamInfo | null
) => {
  const { originalOrder, orderItems } = record;

  const today = format(new Date(), 'yyyy년 MM월 dd일');
  const documentNumber = `KS_${format(new Date(), 'yyyyMMdd')}_${record.id.toString().padStart(4, '0')}`;

  // 금액 계산
  const supplyAmount = orderItems.reduce((sum, item) => {
    return sum + (item.sellingPrice ? item.sellingPrice * item.quantity : 0);
  }, 0);

  const vat = orderItems.reduce((sum, item) => {
    const unitVat = item.vat ?? 0;
    return sum + unitVat * item.quantity;
  }, 0);

  const totalAmount = supplyAmount + vat;

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('거래명세서', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      margins: { left: 0.4, right: 0.4, top: 0.3, bottom: 0.3, header: 0, footer: 0 },
    },
  });

  // 컬럼 너비 설정
  ws.columns = [
    { width: 6 },   // A: No
    { width: 32 },  // B: 품목명
    { width: 8 },   // C: 수량
    { width: 14 },  // D: 단가
    { width: 14 },  // E: 부가세
    { width: 16 },  // F: 금액
  ];

  /**
   * 명세서 1장을 렌더링하는 함수
   * @returns 다음 시작 행 번호
   */
  const renderStatement = (startRow: number): number => {
    let row = startRow;

    // ─── 제목 ───
    ws.mergeCells(`A${row}:F${row}`);
    const titleCell = ws.getCell(`A${row}`);
    titleCell.value = '거래명세서';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.border = {
      top: { style: 'thin', color: { argb: 'D1D5DB' } },
      bottom: { style: 'medium', color: { argb: '2563EB' } },
      left: { style: 'thin', color: { argb: 'D1D5DB' } },
      right: { style: 'thin', color: { argb: 'D1D5DB' } },
    };
    COLS.slice(1).forEach(col => {
      ws.getCell(`${col}${row}`).border = {
        top: { style: 'thin', color: { argb: 'D1D5DB' } },
        bottom: { style: 'medium', color: { argb: '2563EB' } },
        right: { style: 'thin', color: { argb: 'D1D5DB' } },
      };
    });
    ws.getRow(row).height = 30;
    row++;

    // 빈 행
    COLS.forEach(col => { ws.getCell(`${col}${row}`).border = THIN_BORDER; });
    ws.getRow(row).height = 8;
    row++;

    // ─── 발행 정보 ───
    ws.getCell(`A${row}`).value = '발행일자:';
    ws.getCell(`A${row}`).font = { size: 9, color: { argb: '666666' } };
    ws.getCell(`A${row}`).border = THIN_BORDER;
    ws.getCell(`B${row}`).value = today;
    ws.getCell(`B${row}`).font = { size: 9, bold: true };
    ws.getCell(`B${row}`).border = THIN_BORDER;
    ws.getCell(`C${row}`).border = THIN_BORDER;
    ws.getCell(`D${row}`).value = '문서번호:';
    ws.getCell(`D${row}`).font = { size: 9, color: { argb: '666666' } };
    ws.getCell(`D${row}`).alignment = { horizontal: 'right' };
    ws.getCell(`D${row}`).border = THIN_BORDER;
    ws.mergeCells(`E${row}:F${row}`);
    ws.getCell(`E${row}`).value = documentNumber;
    ws.getCell(`E${row}`).font = { size: 9, bold: true };
    ws.getCell(`E${row}`).alignment = { horizontal: 'right' };
    ws.getCell(`E${row}`).border = THIN_BORDER;
    ws.getCell(`F${row}`).border = THIN_BORDER;
    ws.getRow(row).height = 16;
    row++;

    // 빈 행
    COLS.forEach(col => { ws.getCell(`${col}${row}`).border = THIN_BORDER; });
    ws.getRow(row).height = 6;
    row++;

    // ─── 공급자 / 공급받는자 헤더 ───
    ws.mergeCells(`A${row}:C${row}`);
    ws.getCell(`A${row}`).value = '[공급자 정보]';
    ws.getCell(`A${row}`).font = { size: 9, bold: true };
    COLS.slice(0, 3).forEach(col => {
      ws.getCell(`${col}${row}`).fill = GRAY_FILL;
      ws.getCell(`${col}${row}`).border = THIN_BORDER;
    });

    ws.mergeCells(`D${row}:F${row}`);
    ws.getCell(`D${row}`).value = '[공급받는자 정보]';
    ws.getCell(`D${row}`).font = { size: 9, bold: true };
    COLS.slice(3, 6).forEach(col => {
      ws.getCell(`${col}${row}`).fill = GRAY_FILL;
      ws.getCell(`${col}${row}`).border = THIN_BORDER;
    });
    ws.getRow(row).height = 16;
    row++;

    // ─── 공급자 / 공급받는자 상세 ───
    const infoRows: { label: string; left: string; right: string }[] = [
      { label: '회사명', left: teamInfo?.companyName || '-', right: record.supplierName },
      { label: '사업자번호', left: teamInfo?.businessRegistrationNumber || '-', right: '-' },
      { label: '대표자', left: teamInfo?.representativeName || '-', right: '-' },
      { label: '사업장주소', left: teamInfo?.businessAddress || '-', right: originalOrder.receiverAddress || '-' },
      { label: '담당자', left: originalOrder.requester || '-', right: originalOrder.receiver || '-' },
      { label: '연락처', left: teamInfo?.phoneNumber || '-', right: originalOrder.receiverPhone || '-' },
    ];

    infoRows.forEach(info => {
      ws.getCell(`A${row}`).value = info.label;
      ws.getCell(`A${row}`).font = { size: 8, color: { argb: '666666' } };
      ws.getCell(`A${row}`).border = THIN_BORDER;
      ws.mergeCells(`B${row}:C${row}`);
      ws.getCell(`B${row}`).value = info.left;
      ws.getCell(`B${row}`).font = { size: 8 };
      ws.getCell(`B${row}`).border = THIN_BORDER;
      ws.getCell(`C${row}`).border = THIN_BORDER;
      ws.getCell(`D${row}`).value = info.label;
      ws.getCell(`D${row}`).font = { size: 8, color: { argb: '666666' } };
      ws.getCell(`D${row}`).border = THIN_BORDER;
      ws.mergeCells(`E${row}:F${row}`);
      ws.getCell(`E${row}`).value = info.right;
      ws.getCell(`E${row}`).font = { size: 8 };
      ws.getCell(`E${row}`).border = THIN_BORDER;
      ws.getCell(`F${row}`).border = THIN_BORDER;
      ws.getRow(row).height = 14;
      row++;
    });

    // 빈 행
    COLS.forEach(col => { ws.getCell(`${col}${row}`).border = THIN_BORDER; });
    ws.getRow(row).height = 6;
    row++;

    // ─── 품목 테이블 헤더 ───
    const headers = ['No', '품목명', '수량', '단가', '부가세', '금액'];
    const headerAligns: ExcelJS.Alignment['horizontal'][] = ['center', 'left', 'center', 'right', 'right', 'right'];

    headers.forEach((h, i) => {
      const cell = ws.getCell(`${COLS[i]}${row}`);
      cell.value = h;
      cell.font = { size: 9, bold: true };
      cell.fill = HEADER_FILL;
      cell.alignment = { horizontal: headerAligns[i], vertical: 'middle' };
      cell.border = THIN_BORDER;
    });
    ws.getRow(row).height = 18;
    row++;

    // ─── 품목 행 ───
    orderItems.forEach((item, index) => {
      const unitVat = item.vat ?? 0;
      const itemVat = unitVat * item.quantity;
      const itemTotal = item.sellingPrice
        ? item.sellingPrice * item.quantity + itemVat
        : 0;

      const values: (string | number)[] = [
        index + 1,
        item.item?.teamItem?.itemName || '-',
        item.quantity,
        item.sellingPrice ?? 0,
        item.sellingPrice ? unitVat : 0,
        item.sellingPrice ? itemTotal : 0,
      ];

      values.forEach((v, i) => {
        const cell = ws.getCell(`${COLS[i]}${row}`);
        cell.value = v;
        cell.font = { size: 8, bold: i === 5 };
        cell.alignment = { horizontal: headerAligns[i], vertical: 'middle' };
        cell.border = THIN_BORDER;
        if (typeof v === 'number' && i >= 3) {
          cell.numFmt = '#,##0';
        }
      });
      ws.getRow(row).height = 16;
      row++;
    });

    // ─── 빈 행 3칸 (테두리 유지) ───
    for (let i = 0; i < 3; i++) {
      COLS.forEach(col => {
        ws.getCell(`${col}${row}`).border = THIN_BORDER;
      });
      ws.getRow(row).height = 16;
      row++;
    }

    // ─── 합계 헤더 행 ───
    ws.mergeCells(`A${row}:C${row}`);
    ws.getCell(`A${row}`).value = `총 품목: ${record.itemCount}종 ${record.totalQuantity}개`;
    ws.getCell(`A${row}`).font = { size: 8, bold: true };
    ws.getCell(`A${row}`).alignment = { horizontal: 'center', vertical: 'middle' };

    const footerLabels = [null, null, null, '공급가액', '부가세', '합계'];
    footerLabels.forEach((label, i) => {
      const cell = ws.getCell(`${COLS[i]}${row}`);
      if (label) cell.value = label;
      cell.font = { size: 8, bold: true };
      cell.fill = BLUE_FILL;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = THIN_BORDER;
    });
    ws.getRow(row).height = 16;
    row++;

    // ─── 합계 값 행 ───
    ws.mergeCells(`A${row}:C${row}`);
    const footerValues = [null, null, null, supplyAmount, vat, totalAmount];
    footerValues.forEach((v, i) => {
      const cell = ws.getCell(`${COLS[i]}${row}`);
      if (v !== null) {
        cell.value = v;
        cell.numFmt = '₩#,##0';
      }
      cell.font = {
        size: 8,
        bold: i === 5,
        color: (i === 3 || i === 5) ? { argb: '2563EB' } : undefined,
      };
      cell.fill = BLUE_FILL;
      cell.alignment = { horizontal: i < 3 ? 'center' : 'right', vertical: 'middle' };
      cell.border = THIN_BORDER;
    });
    ws.getRow(row).height = 16;
    row++;

    // 빈 행
    COLS.forEach(col => { ws.getCell(`${col}${row}`).border = THIN_BORDER; });
    ws.getRow(row).height = 6;
    row++;

    // ─── 푸터 ───
    ws.mergeCells(`A${row}:F${row}`);
    ws.getCell(`A${row}`).value = '본 거래명세서는 KARS(Kangsters Auto Resource-management System)시스템으로 생성되었습니다.';
    ws.getCell(`A${row}`).font = { size: 7, color: { argb: '999999' } };
    ws.getCell(`A${row}`).alignment = { horizontal: 'center' };
    COLS.forEach(col => { ws.getCell(`${col}${row}`).border = THIN_BORDER; });
    ws.getRow(row).height = 12;
    row++;

    ws.mergeCells(`A${row}:F${row}`);
    ws.getCell(`A${row}`).value = `발행일시: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} | © 2025 Kangsters. All rights reserved.`;
    ws.getCell(`A${row}`).font = { size: 7, color: { argb: '999999' } };
    ws.getCell(`A${row}`).alignment = { horizontal: 'center' };
    COLS.forEach(col => { ws.getCell(`${col}${row}`).border = THIN_BORDER; });
    ws.getRow(row).height = 12;
    row++;

    return row;
  };

  // ─── 첫 번째 명세서 ───
  let currentRow = renderStatement(1);

  // ─── 절취선 ───
  ws.mergeCells(`A${currentRow}:F${currentRow}`);
  ws.getCell(`A${currentRow}`).value = '· · · · · · · · · · · · · · ✂ 절 취 선 ✂ · · · · · · · · · · · · · ·';
  ws.getCell(`A${currentRow}`).font = { size: 8, color: { argb: '999999' } };
  ws.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getCell(`A${currentRow}`).border = {
    top: { style: 'dashed', color: { argb: '9CA3AF' } },
    bottom: { style: 'dashed', color: { argb: '9CA3AF' } },
  };
  ws.getRow(currentRow).height = 20;
  currentRow++;

  // ─── 두 번째 명세서 ───
  renderStatement(currentRow);

  // ─── 파일 다운로드 ───
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `거래명세서_${documentNumber}_${format(new Date(), 'HHmmss')}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
