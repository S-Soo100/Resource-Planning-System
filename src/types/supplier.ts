// supplier(구매처)
// export interface ISupplier {
//   supplierId: number; // 구매처 id
//   supplierName: string; // 구매처 이름
//   supplierAddress: string; // 주소
//   supplierPhoneNumber: string; // 전화번호
//   registrationNumber: string; // 사업자 번호
// }

export interface Supplier {
  id: number;
  supplierName: string;
  email?: string;
  supplierAddress?: string;
  supplierPhoneNumber?: string;
  registrationNumber?: string; // 사업자 번호
  memo?: string;
  teamId: number;
  createdAt?: string;
  updatedAt?: string;
  representativeName?: string; // 대표자 이름 (v2.2)
}

export interface CreateSupplierRequest {
  supplierName: string;
  email?: string;
  supplierAddress?: string;
  supplierPhoneNumber?: string;
  registrationNumber?: string;
  memo?: string;
  teamId?: number;
  representativeName?: string; // 대표자 이름 (v2.2)
}

export interface UpdateSupplierRequest {
  supplierName?: string;
  email?: string;
  supplierAddress?: string;
  supplierPhoneNumber?: string;
  registrationNumber?: string;
  memo?: string;
  teamId?: number;
  representativeName?: string; // 대표자 이름 (v2.2)
}

export interface SupplierResponse {
  success: boolean;
  data?: Supplier;
  error?: string;
}

export interface SuppliersResponse {
  success: boolean;
  data?: Supplier[];
  error?: string;
}

/**
 * 고객 상세 페이지 요약 통계 (v2.5)
 */
export interface SupplierDetailSummary {
  // 판매 관련
  totalSalesOrders: number; // 총 판매 건수
  totalSalesAmount: number; // 총 판매 금액 (VAT 포함)
  totalMargin?: number; // 총 마진액 (Admin/Moderator만)
  averageMarginRate?: number; // 평균 마진율 (Admin/Moderator만)

  // 구매 관련
  totalPurchaseOrders: number; // 총 구매 건수
  totalPurchaseAmount: number; // 총 구매 금액 (원가)
}
