/**
 * 변경 이력 엑셀 내보내기 유틸리티
 */

import type { ChangeHistoryItem } from '@/types/change-history';
import {
  formatDateTime,
  formatValue,
  getActionLabel,
  getAccessLevelLabel,
} from './changeHistory';

/**
 * 변경 이력을 CSV 형식으로 변환
 * @param items 변경 이력 아이템 목록
 * @param type 데이터 타입 (order/demo/item)
 * @returns CSV 문자열
 */
export const convertToCSV = (
  items: ChangeHistoryItem[],
  type: 'order' | 'demo' | 'item'
): string => {
  if (items.length === 0) return '';

  // CSV 헤더
  const headers =
    type === 'item'
      ? ['번호', '일시', '변동량', '이전 수량', '변경 수량', '작업자', '권한', '비고']
      : ['번호', '일시', '액션', '변경 필드', '이전 값', '변경 값', '작업자', '권한', '비고'];

  // CSV 행 데이터
  const rows = items.map((item, index) => {
    if (type === 'item') {
      // Item 재고 변동
      const oldQty = item.oldValue?.itemQuantity || 0;
      const newQty = item.newValue?.itemQuantity || 0;
      const diff = newQty - oldQty;

      return [
        index + 1,
        formatDateTime(item.createdAt),
        `${diff > 0 ? '+' : ''}${diff}개`,
        oldQty,
        newQty,
        item.userName,
        getAccessLevelLabel(item.accessLevel),
        item.remarks || '-',
      ];
    } else {
      // Order/Demo 변경 이력
      return [
        index + 1,
        formatDateTime(item.createdAt),
        getActionLabel(item.action),
        item.fieldLabel || '-',
        item.oldValue ? formatValue(item.oldValue, item.field) : '-',
        item.newValue ? formatValue(item.newValue, item.field) : '-',
        item.userName,
        getAccessLevelLabel(item.accessLevel),
        item.remarks || '-',
      ];
    }
  });

  // CSV 문자열 생성
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) =>
          // 쉼표나 줄바꿈이 포함된 경우 따옴표로 감싸기
          String(cell).includes(',') || String(cell).includes('\n')
            ? `"${String(cell).replace(/"/g, '""')}"`
            : String(cell)
        )
        .join(',')
    ),
  ].join('\n');

  return csvContent;
};

/**
 * CSV 파일 다운로드
 * @param csvContent CSV 문자열
 * @param filename 파일명 (확장자 제외)
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  // BOM 추가 (한글 깨짐 방지)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 다운로드 링크 생성 및 클릭
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * 변경 이력 엑셀 내보내기
 * @param items 변경 이력 아이템 목록
 * @param type 데이터 타입 (order/demo/item)
 * @param id 대상 ID
 */
export const exportChangeHistory = (
  items: ChangeHistoryItem[],
  type: 'order' | 'demo' | 'item',
  id: number
): void => {
  if (items.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  const csvContent = convertToCSV(items, type);
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `${type}_${id}_변경이력_${timestamp}`;

  downloadCSV(csvContent, filename);
};
