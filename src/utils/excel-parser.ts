import * as XLSX from "xlsx";
import { Category } from "@/types/(item)/category";
import { TeamItem, CreateTeamItemDto } from "@/types/(item)/team-item";
import { BulkUploadRow } from "@/types/(item)/bulk-upload";
import {
  extractBrandAbbreviation,
  getMaxSequenceNumber,
} from "./item-code-generator";

const MAX_ROWS = 1000;

/**
 * 품목 일괄 등록 양식 헤더 (detectColumnMapping과 1:1 매핑)
 */
export const BULK_UPLOAD_TEMPLATE_HEADERS = [
  "품목명",
  "브랜드",
  "카테고리",
  "건보여부",
  "고시가격",
  "소비자가",
  "매입원가",
  "메모",
] as const;

/**
 * 품목 일괄 등록 양식 .xlsx 다운로드
 */
export function downloadBulkUploadTemplate(): void {
  const sampleRows = [
    [
      "전동휠체어 A모델",
      "OttoBock",
      "(팀 카테고리명 입력)",
      "지원",
      2500000,
      3000000,
      2000000,
      "예시 데이터입니다",
    ],
    [
      "수동휠체어 B모델",
      "Sunrise",
      "(팀 카테고리명 입력)",
      "미지원",
      "",
      800000,
      500000,
      "",
    ],
  ];

  const wsData = [[...BULK_UPLOAD_TEMPLATE_HEADERS], ...sampleRows];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "품목 일괄 등록");
  XLSX.writeFile(wb, "품목_일괄등록_양식.xlsx");
}

/**
 * 엑셀 파일을 파싱하여 raw 데이터 배열을 반환
 */
export function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("파일을 읽을 수 없습니다."));
          return;
        }

        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error("시트가 없는 엑셀 파일입니다."));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(
          worksheet,
          { defval: "" }
        );

        if (jsonData.length === 0) {
          reject(new Error("엑셀 파일에 데이터가 없습니다."));
          return;
        }

        if (jsonData.length > MAX_ROWS) {
          reject(
            new Error(
              `최대 ${MAX_ROWS}행까지 처리할 수 있습니다. (현재 ${jsonData.length}행)`
            )
          );
          return;
        }

        // 모든 값을 문자열로 변환
        const stringified = jsonData.map((row) => {
          const result: Record<string, string> = {};
          for (const [key, value] of Object.entries(row)) {
            result[key] = String(value ?? "").trim();
          }
          return result;
        });

        resolve(stringified);
      } catch {
        reject(new Error("엑셀 파일 파싱에 실패했습니다."));
      }
    };

    reader.onerror = () => {
      reject(new Error("파일 읽기에 실패했습니다."));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * 카테고리 트리를 평탄화하여 모든 카테고리를 배열로 반환
 */
function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = [];
  for (const cat of categories) {
    result.push(cat);
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategories(cat.children));
    }
  }
  return result;
}

/**
 * 엑셀 카테고리 문자열을 기존 카테고리와 매칭
 * 정확히 같거나 공백 제거 후 같으면 매칭
 */
function matchCategory(
  excelValue: string,
  flatCategories: Category[]
): { id: number; name: string } | null {
  if (!excelValue) return null;

  const normalized = excelValue.replace(/\s+/g, "").toLowerCase();

  for (const cat of flatCategories) {
    const catNormalized = cat.name.replace(/\s+/g, "").toLowerCase();
    if (catNormalized === normalized) {
      return { id: cat.id, name: cat.name };
    }
  }

  return null;
}

/**
 * "건보" 컬럼 값을 boolean으로 변환
 */
function parseHealthInsurance(value: string): boolean {
  return (
    value === "지원" ||
    value === "O" ||
    value === "o" ||
    value === "Y" ||
    value === "y"
  );
}

/**
 * 가격 문자열을 숫자로 변환 (쉼표 제거)
 */
function parsePrice(value: string): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[,\s원]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : Math.round(num);
}

/**
 * 엑셀 컬럼명을 자동 감지하여 매핑 키를 반환
 */
function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const h = header.trim().toLowerCase();

    if (h === "품목" || h === "품목명" || h === "품명" || h === "아이템명") {
      mapping["itemName"] = header;
    } else if (h === "브랜드" || h === "제조사") {
      mapping["brand"] = header;
    } else if (
      h === "종류" ||
      h === "카테고리" ||
      h === "분류" ||
      h.includes("카테고리")
    ) {
      mapping["category"] = header;
    } else if (h === "건보" || h === "건강보험" || h.includes("건보")) {
      mapping["healthInsurance"] = header;
    } else if (h === "고시가격" || h === "고시가" || h.includes("고시")) {
      mapping["notifiedPrice"] = header;
    } else if (
      h === "소비자가격" ||
      h === "소비자가" ||
      h === "판매가" ||
      h.includes("소비자")
    ) {
      mapping["consumerPrice"] = header;
    } else if (h === "특징" || h === "메모" || h === "비고" || h === "설명") {
      mapping["memo"] = header;
    } else if (
      h === "매입원가" ||
      h === "원가" ||
      h === "매입가" ||
      h.includes("원가") ||
      h.includes("매입")
    ) {
      mapping["costPrice"] = header;
    }
  }

  return mapping;
}

/**
 * raw 엑셀 데이터를 BulkUploadRow 배열로 매핑
 */
export function mapExcelDataToRows(
  rawData: Record<string, string>[],
  categories: Category[],
  existingItems: TeamItem[]
): BulkUploadRow[] {
  if (rawData.length === 0) return [];

  const flatCats = flattenCategories(categories);
  const headers = Object.keys(rawData[0]);
  const colMap = detectColumnMapping(headers);

  // I10: 품목명 누락 행은 파싱 단계에서 아예 제외
  const filteredData = rawData.filter((raw) => {
    const itemName = (raw[colMap["itemName"]] || "").trim();
    return itemName.length > 0;
  });

  // 접두사별 순번 카운터 (배치 내 중복 방지)
  const prefixCounters: Record<string, number> = {};

  // 기존 품목명 Set (중복 체크용)
  const existingItemNames = new Set(
    existingItems.map((item) => item.itemName.toLowerCase().trim())
  );

  return filteredData.map((raw, index) => {
    const itemName = raw[colMap["itemName"]] || "";
    const brand = raw[colMap["brand"]] || "";
    const categoryValue = raw[colMap["category"]] || "";
    const healthInsurance = raw[colMap["healthInsurance"]] || "";
    const notifiedPriceStr = raw[colMap["notifiedPrice"]] || "";
    const consumerPriceStr = raw[colMap["consumerPrice"]] || "";
    const memo = raw[colMap["memo"]] || "";
    const costPriceStr = raw[colMap["costPrice"]] || "";

    // 카테고리 매칭
    const catMatch = matchCategory(categoryValue, flatCats);

    // 품목코드 자동 생성
    const prefix = extractBrandAbbreviation(brand);
    if (prefixCounters[prefix] === undefined) {
      prefixCounters[prefix] = 0;
    }
    const offsetInBatch = prefixCounters[prefix];
    prefixCounters[prefix] = offsetInBatch + 1;

    const maxExisting = getMaxSequenceNumber(prefix, existingItems);
    const nextSeq = maxExisting + 1 + offsetInBatch;
    const generatedItemCode = `${prefix}-${String(nextSeq).padStart(3, "0")}`;

    // 가격 파싱
    const notifiedPrice = parsePrice(notifiedPriceStr);
    const consumerPrice = parsePrice(consumerPriceStr);
    const costPrice = parsePrice(costPriceStr);
    const isHealthInsuranceRegistered = parseHealthInsurance(healthInsurance);

    // 중복 체크
    const isDuplicate = existingItemNames.has(itemName.toLowerCase().trim());

    // 상태 결정
    let status: BulkUploadRow["status"] = "ready";
    if (!itemName) {
      status = "invalid";
    } else if (!catMatch) {
      status = "category_unmatched";
    } else if (isDuplicate) {
      status = "duplicate";
    }

    const mapped: Partial<CreateTeamItemDto> = {
      itemName: itemName || undefined,
      itemCode: generatedItemCode,
      brand: brand || undefined,
      categoryId: catMatch?.id ?? null,
      isHealthInsuranceRegistered,
      isNotifiedPrice: notifiedPrice !== undefined,
      notifiedPrice,
      consumerPrice,
      costPrice,
      memo: memo || undefined,
      isService: false,
    };

    return {
      index: index + 1,
      status,
      raw,
      mapped,
      generatedItemCode,
      categoryMatch: {
        excelValue: categoryValue,
        matchedCategoryId: catMatch?.id ?? null,
        matchedCategoryName: catMatch?.name ?? null,
      },
      isDuplicate,
      userAction: isDuplicate ? "skip" : undefined,
    };
  });
}
