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
  email: string;
  supplierAddress: string;
  supplierPhoneNumber: string;
  registrationNumber: string; // 사업자 번호
  memo: string;
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
