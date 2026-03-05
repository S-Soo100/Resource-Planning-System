import { CustomerType } from "@/types/supplier";

export interface FieldVisibility {
  showRegistrationNumber: boolean;
  showRepresentativeName: boolean;
  showResidentId: boolean;
  showIsRecipient: boolean;
  showDepositorName: boolean;
  showRepurchaseCycle: boolean;
  showRepurchaseDueDate: boolean;
}

/**
 * 고객 유형(B2B/B2C)과 수급자 여부에 따른 필드 표시 규칙
 *
 * | 필드           | B2B | B2C(비수급자) | B2C(수급자) | 미설정 |
 * |----------------|-----|-------------|------------|--------|
 * | 사업자번호     | ✅  | ❌          | ❌         | ✅     |
 * | 대표자명       | ✅  | ❌          | ❌         | ✅     |
 * | 주민번호       | ❌  | ✅          | ✅         | ✅     |
 * | 수급자 여부    | ❌  | ✅          | ✅         | ✅     |
 * | 입금자명       | ❌  | ❌          | ✅         | ✅     |
 * | 재구매 주기    | ❌  | ❌          | ✅         | ✅     |
 * | 재구매 예정일  | ❌  | ❌          | ✅         | ✅     |
 */
export function getFieldVisibility(
  customerType: CustomerType | null | undefined,
  isRecipient: boolean | undefined
): FieldVisibility {
  const isB2B = customerType === "b2b";
  const isB2C = customerType === "b2c";
  const isUnset = !customerType;
  const isRecipientTrue = isRecipient === true;

  return {
    showRegistrationNumber: isB2B || isUnset,
    showRepresentativeName: isB2B || isUnset,
    showResidentId: isB2C || isUnset,
    showIsRecipient: isB2C || isUnset,
    showDepositorName: (isB2C && isRecipientTrue) || isUnset,
    showRepurchaseCycle: (isB2C && isRecipientTrue) || isUnset,
    showRepurchaseDueDate: (isB2C && isRecipientTrue) || isUnset,
  };
}

export function getCustomerTypeBadge(
  customerType: CustomerType | null | undefined
) {
  if (!customerType) return null;
  return {
    text: customerType.toUpperCase(),
    color:
      customerType === "b2c"
        ? "bg-indigo-100 text-indigo-700"
        : "bg-emerald-100 text-emerald-700",
  };
}

export function getRecipientBadge(isRecipient: boolean | undefined) {
  if (!isRecipient) return null;
  return { text: "수급자", color: "bg-green-100 text-green-700" };
}
