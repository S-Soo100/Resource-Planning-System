// supplier(구매처)
export interface ISupplier {
  supplierId: number; // 구매처 id
  supplierName: string; // 구매처 이름
  supplierAddress: string; // 주소
  supplierPhoneNumber: string; // 전화번호
  registrationNumber: string; // 사업자 번호
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
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
