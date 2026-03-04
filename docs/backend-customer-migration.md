# 백엔드 고객 데이터 마이그레이션 요구사항

> E-006: 고객관리 데이터 모델 리팩토링 (User → Supplier 통합)

## 배경

현재 "고객" 데이터가 User 테이블에 저장되어 팀 멤버와 혼동됨. 발주 시스템에서는 이미 Supplier를 "고객"으로 사용 중이므로, Supplier 기반으로 통합 필요.

---

## 1. Supplier 테이블 신규 컬럼 (6개)

| 컬럼명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| `customerType` | ENUM('b2c', 'b2b') | 고객 유형 | nullable |
| `isRecipient` | BOOLEAN | 수급자 여부 | default: false |
| `depositorName` | VARCHAR(100) | 입금자명 | nullable |
| `residentId` | VARCHAR(255) | 주민등록번호 | 암호화 저장 권장 |
| `repurchaseCycleMonths` | INT | 재구매 주기 (개월) | nullable |
| `repurchaseDueDate` | DATETIME | 재구매 예정일 | nullable |

### SQL 마이그레이션 (참고)

```sql
ALTER TABLE supplier
  ADD COLUMN customerType ENUM('b2c', 'b2b') DEFAULT NULL,
  ADD COLUMN isRecipient BOOLEAN DEFAULT FALSE,
  ADD COLUMN depositorName VARCHAR(100) DEFAULT NULL,
  ADD COLUMN residentId VARCHAR(255) DEFAULT NULL,
  ADD COLUMN repurchaseCycleMonths INT DEFAULT NULL,
  ADD COLUMN repurchaseDueDate DATETIME DEFAULT NULL;
```

---

## 2. 신규/확장 API 엔드포인트

### 2-1. PATCH /supplier/:id (기존 API 확장)

기존 Supplier 업데이트 API에 고객 필드 6개를 추가로 받을 수 있도록 확장.

```typescript
// Request Body (기존 필드 + 신규 필드)
{
  supplierName?: string;
  email?: string;
  // ... 기존 필드들 ...
  customerType?: "b2c" | "b2b" | null;
  isRecipient?: boolean;
  depositorName?: string;
  residentId?: string;
  repurchaseCycleMonths?: number;
  repurchaseDueDate?: string; // ISO 8601
}
```

### 2-2. POST /supplier/:id/documents/upload

고객 서류 업로드. 기존 `/user/:userId/documents/upload`와 동일한 스펙.

```typescript
// multipart/form-data
{
  file: File;
  documentType: "prescription" | "recipient" | "receipt" | "tax_invoice";
  memo?: string;
}

// Response
{
  id: number;
  supplierId: number;
  documentType: string;
  fileName: string;
  fileUrl: string;
  memo?: string;
  createdAt: string;
}
```

### 2-3. GET /supplier/:id/documents?documentType=

고객 서류 목록 조회. 기존 `/user/:userId/documents`와 동일한 스펙.

```typescript
// Query Parameters
{
  documentType?: "prescription" | "recipient" | "receipt" | "tax_invoice";
}

// Response
CustomerDocument[] // supplierId 기반
```

### 2-4. DELETE /supplier/:id/documents/:docId

고객 서류 삭제. 기존 `/user/:userId/documents/:docId`와 동일.

### 2-5. GET /supplier/repurchase-due?teamId=

재구매 예정 고객(Supplier) 조회. 기존 `/user/repurchase-due`와 동일한 로직.

```typescript
// Response
{
  id: number;
  supplierName: string;
  email?: string;
  customerType?: "b2c" | "b2b";
  isRecipient?: boolean;
  repurchaseCycleMonths?: number;
  repurchaseDueDate: string;
  // Supplier 고유 필드
  supplierPhoneNumber?: string;
  registrationNumber?: string;
}[]
```

---

## 3. 데이터 마이그레이션

### 3-1. User → Supplier 고객 데이터 이전

User 테이블의 고객 필드를 Supplier로 복사. 매핑 기준:
- User가 발주 기록에서 `supplierId`로 연결된 Supplier가 있으면 해당 Supplier에 복사
- 연결된 Supplier가 없으면 새 Supplier 레코드 생성 (supplierName = User.name)

### 3-2. 서류 마이그레이션

`customer_documents` 테이블에서 `userId` → `supplierId` 컬럼 추가 후 매핑 데이터 이전.

---

## 4. 레거시 API 유지 기간

| 레거시 API | 상태 | 비고 |
|-----------|------|------|
| `GET /user/:userId/documents` | 당분간 유지 | 프론트 전환 완료 후 제거 |
| `POST /user/:userId/documents/upload` | 당분간 유지 | 프론트 전환 완료 후 제거 |
| `DELETE /user/:userId/documents/:docId` | 당분간 유지 | 프론트 전환 완료 후 제거 |
| `GET /user/repurchase-due` | 당분간 유지 | 프론트 전환 완료 후 제거 |
| User 고객 필드 (customerType 등) | 당분간 유지 | 읽기 전용으로 전환 권장 |

---

## 5. 프론트엔드 대응 사항

프론트엔드는 백엔드 완료를 가정하고 먼저 전환하되, 신규 API 실패 시 graceful degradation 적용:
- 서류 API 실패 → "서류 기능 준비 중입니다" 안내
- 재구매 API 실패 → 배너/카운트 자동 숨김
- 고객 필드 미존재 → optional chaining + 기본값
