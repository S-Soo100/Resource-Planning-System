/**
 * Supplier 라벨 context별 매핑 (v4.0)
 *
 * 화면 맥락에 따라 "고객/판매대상/거래처" 등 다른 라벨을 표시하기 위한 상수.
 * SelectSupplierModal 등에서 context prop으로 사용.
 */

export type SupplierContext =
  | "order"
  | "inbound"
  | "outbound"
  | "demo"
  | "default";

const SUPPLIER_LABELS: Record<SupplierContext, string> = {
  order: "판매대상",
  inbound: "거래처",
  outbound: "거래처",
  demo: "판매대상",
  default: "고객",
};

/**
 * context에 따른 Supplier 라벨 반환
 * @param context - 화면 맥락
 * @returns 한글 라벨 (없으면 "고객")
 */
export const getSupplierLabel = (
  context: SupplierContext | undefined
): string => {
  if (!context) return SUPPLIER_LABELS.default;
  return SUPPLIER_LABELS[context] ?? SUPPLIER_LABELS.default;
};

export { SUPPLIER_LABELS };
