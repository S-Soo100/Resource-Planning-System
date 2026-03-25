import { TeamItem } from "@/types/(item)/team-item";

/**
 * 한글 초성 → 영문 매핑 테이블
 * 유니코드 한글 초성 순서: ㄱ ㄲ ㄴ ㄷ ㄸ ㄹ ㅁ ㅂ ㅃ ㅅ ㅆ ㅇ ㅈ ㅉ ㅊ ㅋ ㅌ ㅍ ㅎ
 */
const CHOSUNG_TO_ENGLISH: Record<number, string> = {
  0: "G", // ㄱ
  1: "GG", // ㄲ
  2: "N", // ㄴ
  3: "D", // ㄷ
  4: "DD", // ㄸ
  5: "R", // ㄹ
  6: "M", // ㅁ
  7: "B", // ㅂ
  8: "BB", // ㅃ
  9: "S", // ㅅ
  10: "SS", // ㅆ
  11: "O", // ㅇ
  12: "J", // ㅈ
  13: "JJ", // ㅉ
  14: "CH", // ㅊ
  15: "K", // ㅋ
  16: "T", // ㅌ
  17: "P", // ㅍ
  18: "H", // ㅎ
};

/**
 * 한글 문자에서 초성 인덱스를 추출
 */
function getChosungIndex(char: string): number | null {
  const code = char.charCodeAt(0);
  // 한글 유니코드 범위: 0xAC00 ~ 0xD7A3
  if (code < 0xac00 || code > 0xd7a3) return null;
  return Math.floor((code - 0xac00) / 588);
}

/**
 * 한글 브랜드명에서 초성 기반 영문 약자를 추출
 * 예: 닛신 → NS, 오토복 → OTB, 케어라인 → KRL
 */
function extractKoreanAbbreviation(brand: string): string {
  const chars = brand.replace(/\s+/g, "").split("");
  let abbreviation = "";

  for (const char of chars) {
    const chosungIdx = getChosungIndex(char);
    if (chosungIdx !== null) {
      const english = CHOSUNG_TO_ENGLISH[chosungIdx];
      if (english) {
        abbreviation += english;
      }
    }
  }

  return abbreviation || "ETC";
}

/**
 * 브랜드명에서 품목코드 접두사(약자)를 추출
 * - 한글 브랜드: 초성 → 영문 매핑
 * - 영문 브랜드: 앞 3글자 대문자
 * - 브랜드 없음: ETC
 */
export function extractBrandAbbreviation(
  brand: string | undefined | null
): string {
  if (!brand || brand.trim() === "") return "ETC";

  const trimmed = brand.trim();

  // 한글 포함 여부 체크
  const hasKorean = /[가-힣]/.test(trimmed);

  if (hasKorean) {
    return extractKoreanAbbreviation(trimmed);
  }

  // 영문 브랜드: 앞 3글자 대문자
  const englishOnly = trimmed.replace(/[^a-zA-Z]/g, "");
  if (englishOnly.length === 0) return "ETC";

  return englishOnly.slice(0, 3).toUpperCase();
}

/**
 * 기존 TeamItem 목록에서 동일 접두사의 최대 순번을 추출
 * 예: NS-003이 최대면 3을 반환
 */
export function getMaxSequenceNumber(
  prefix: string,
  existingItems: TeamItem[]
): number {
  let maxSeq = 0;

  for (const item of existingItems) {
    if (!item.itemCode) continue;

    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`^${escaped}-(\\d+)$`, "i");
    const match = item.itemCode.match(pattern);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  return maxSeq;
}

/**
 * 품목코드를 자동 생성
 * 형식: {약자}-{3자리순번} (예: NS-001, OTB-002)
 *
 * @param brand 브랜드명
 * @param existingItems 기존 TeamItem 목록 (순번 계산용)
 * @param offsetInBatch 동일 배치 내 동일 접두사의 오프셋 (0부터)
 */
export function generateItemCode(
  brand: string | undefined | null,
  existingItems: TeamItem[],
  offsetInBatch: number = 0
): string {
  const prefix = extractBrandAbbreviation(brand);
  const maxExisting = getMaxSequenceNumber(prefix, existingItems);
  const nextSeq = maxExisting + 1 + offsetInBatch;
  const paddedSeq = String(nextSeq).padStart(3, "0");

  return `${prefix}-${paddedSeq}`;
}
