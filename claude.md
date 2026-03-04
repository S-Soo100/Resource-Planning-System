# KARS - Claude Code 설정

## 📌 프로젝트 개요
**KARS** (Kangsters Auto Resource-management System) - 보조기기 업체용 통합 자원 관리 시스템

### 기술 스택
- **프론트**: React 18.2 + Next.js 15.1.3 + TypeScript + Tailwind CSS
- **상태 관리**: Zustand + React Query (TanStack Query)
- **UI**: Ant Design + Framer Motion

---

## 🎨 코딩 규칙

### 스타일
- React 함수형 컴포넌트 + TypeScript strict 모드
- Tailwind CSS 클래스 우선 사용

### 명명 규칙
| 대상       | 규칙        | 예시                                |
| ---------- | ----------- | ----------------------------------- |
| 컴포넌트   | PascalCase  | `OrderRequestForm.tsx`              |
| 훅         | camelCase   | `useOrder.ts` (use 접두사 필수)     |
| 타입 파일  | kebab-case  | `order-record.ts`                   |

### 대화 규칙
1. 친근한 반말 어투
2. 불확실한 내용은 명확히 표시
3. 단계적 사고 과정으로 답변
4. 한국어로 응답

### 작업 규칙

**워크플로우:**
1. **요청 분석**: 요구사항을 파악하고 유형 판단 (Feature / Bug / Improvement / Epic)
2. **코드베이스 탐색**: 관련 파일, 영향 범위, 기존 패턴 분석
3. **브랜치 생성**: `feature/설명` 또는 `fix/설명`
4. **구현**: 승인된 내용에 따라 코드 작성
5. **커밋**: 변경사항을 의미 있는 단위로 커밋

**티켓 관리:**
- GitHub Issues 사용 금지 — `/BACKLOG.md`에서 로컬 관리
- UX 개선/버그/기능 요청 → `BACKLOG.md`에 티켓 추가
- 완료 시 체크박스 `[x]` 표시

---

## 📚 기능별 참조 문서
> **중요**: 기능 수정/확장 시 반드시 해당 문서를 먼저 확인할 것!

### 🏠 메인 & UI
| 문서                                 | 주요 내용                                 |
| ------------------------------------ | ----------------------------------------- |
| `/docs/menu-tab-state-management.md` | 메인 탭 상태 관리 (Zustand + localStorage) |

### 💰 판매 & 구매
| 문서                           | 주요 내용                                |
| ------------------------------ | ---------------------------------------- |
| `/docs/sales-management.md`    | 판매 내역, 거래명세서, 부가세(10%), 엑셀 |
| `/docs/purchase-management.md` | 구매 내역, 원가 정보, 엑셀               |
| `/docs/margin-analysis.md`     | 마진 분석, 품목별 마진율, 역마진 식별, 엑셀 |

### 📦 발주 & 시연
| 문서                               | 주요 내용                              | 주요 기능                            |
| ---------------------------------- | -------------------------------------- | ------------------------------------ |
| `/docs/order-management.md`        | 발주 워크플로우, 권한 제어, 휠체어 발주 | 가격 정보(v2.0): VAT 직접 입력, 가격 수정 모달 |
| `/docs/demonstration-management.md` | 시연 프로세스, 재고 연동               | 유료/무료 시연, 출고/복귀            |

### 📊 재고 관리
| 문서                                    | 주요 내용                                  | 버전  |
| --------------------------------------- | ------------------------------------------ | ----- |
| `/docs/inventory-record-purpose.md`     | recordPurpose 필드, 목적별 집계 필터링     | v2.1  |
| `/docs/inbound-management.md`           | 입고 프로세스 (작성 필요)                  | -     |
| `/docs/outbound-management.md`          | 출고 프로세스 (작성 필요)                  | -     |
| `/docs/inventory-management.md`         | 재고 현황 (작성 필요)                      | -     |

### 🗂️ 기준 정보
| 문서                            | 상태       |
| ------------------------------- | ---------- |
| `/docs/item-management.md`      | 작성 필요  |
| `/docs/warehouse-management.md` | 작성 필요  |
| `/docs/supplier-management.md`  | v3.1 완료 (고객 관리 통합) |
| `/docs/backend-customer-migration.md` | v3.1 백엔드 마이그레이션 요구사항 |

### 👥 관리자 & 팀 관리
| 문서                               | 주요 내용                                        |
| ---------------------------------- | ------------------------------------------------ |
| `/docs/team-members-management.md` | 팀 멤버 관리, 팀별 권한 시스템, 창고 접근 제어    |

### 🛠️ 개발 가이드
| 문서                               | 주요 내용                                |
| ---------------------------------- | ---------------------------------------- |
| `/docs/api-error-handling.md`      | API 에러 처리 표준 가이드, 유틸리티 함수 |

---

## 🔧 핵심 개발 규칙

### API & 데이터
- **React Query**: `['resource', params]` 키 구조
- **통신**: Axios
- **인증**: JWT + Zustand 상태 관리
- **캐시 무효화**: 데이터 변경 후 `queryClient.invalidateQueries`로 자동 UI 업데이트 (페이지 새로고침 금지)
- **에러 처리**: `/docs/api-error-handling.md` 참고 (표준 유틸리티 함수 사용)

### 날짜 처리
| 규칙              | 설명                                     |
| ----------------- | ---------------------------------------- |
| 빈 값             | `undefined` 반환 (빈 문자열 ❌)          |
| 서버 전송         | `undefined` 필드 제거                    |
| 형식              | `YYYY-MM-DDTHH:MM:SS+09:00` (KST)        |

### 가격 입력 (v2.6.0+)

**새로운 입력 방식: 총액 입력 → 자동 계산**

사용자는 **총 금액만 입력**하면, 시스템이 자동으로 공급가액과 부가세를 계산합니다.

| 입력       | 설명                                     |
| ---------- | ---------------------------------------- |
| **총 금액** | 사용자가 입력 (견적서 총액 그대로)      |
| **영세율**  | 체크박스로 선택 (전체 또는 개별)         |
| 공급가액   | 자동 계산 (읽기 전용)                    |
| 부가세     | 자동 계산 (읽기 전용)                    |

**계산 로직:**
- **일반 부가세**: `공급가액 = 총액 ÷ 1.1`, `VAT = 총액 - 공급가액`
- **영세율(0%)**: `공급가액 = 총액`, `VAT = 0`

**기술 스펙:**
- 타입: 폼 `string` → 저장 `number`
- 반올림: `Math.round()` 사용하여 소수점 제거
- 빈 값: `undefined` 전송 (null ❌, 빈 문자열 ❌)
- 검증: 숫자만 허용 (`/^\d+$/`)

**예시:**
```typescript
// 일반 부가세 (10%)
총 금액: 110,000원 입력
  ↓ 자동 계산
공급가액: 100,000원 (110,000 ÷ 1.1)
부가세: 10,000원 (110,000 - 100,000)

// 영세율 (0%)
총 금액: 200,000원 입력 + 영세율 체크
  ↓ 자동 계산
공급가액: 200,000원
부가세: 0원
```

### 권한 시스템

KARS는 **팀별 권한 중심 아키텍처**를 사용합니다.

#### 권한 레벨
| 등급       | 권한                        | 한글 표시       |
| ---------- | --------------------------- | --------------- |
| Admin      | 모든 기능 + 팀 관리자       | 관리자          |
| Moderator  | 읽기 + 발주 승인            | 1차 승인권자    |
| User       | 기본 기능                   | 일반 사용자     |
| Supplier   | 발주 관련만                 | 납품처          |

#### 권한 아키텍처 원칙

**팀 권한이 유일한 기준 (Team-Permission Only)**
- `TeamUserMapping.accessLevel`이 **유일한 권한 소스**
- `User.accessLevel`은 **레거시** — 참조 금지, 신규 코드에서 사용 금지
- 프론트엔드 권한 체크는 반드시 `usePermission()` 훅을 사용할 것
- **API가 팀 권한대로 동작하지 않으면 API를 수정해야 함** (프론트에서 우회하지 않는다)

**isAdmin 자동 계산**
- `isAdmin` 필드는 별도로 입력받지 않음
- 항상 자동 계산: `isAdmin = (accessLevel === "admin")`
- 관리자 선택 시 isAdmin 자동 true 설정

**3단계 사용자 생성 플로우**
```typescript
// 1. 사용자 생성 (User 테이블)
const user = await userApi.createUser(userData);

// 2. 팀에 추가 (TeamUserMapping 생성)
await teamApi.addUserToTeam(teamId, userId);

// 3. 팀 권한 설정 (TeamUserMapping.accessLevel 설정) ⭐ 필수!
await teamRoleApi.updateTeamRole(teamId, userId, {
  accessLevel: userData.accessLevel,
  isAdmin: userData.accessLevel === "admin",
  restrictedWhs: userData.restrictedWhs,
});
```

**마이그레이션 완료 (v3.0)**
> ✅ 모든 페이지가 `usePermission()` 훅을 통해 팀 권한(`TeamUserMapping.accessLevel`) 기반으로 전환 완료.
> - `usePermission()`: 중앙 권한 훅 — `isAdmin`, `isModerator`, `canEditPrice`, `canViewMargin` 등 비즈니스 헬퍼 제공
> - 유일한 예외: `team-select/page.tsx` (팀 선택 전이므로 `serverUser?.isAdmin` 사용)
> - `User.accessLevel` / `auth.isAdmin` 직접 참조는 **금지** — 반드시 `usePermission()` 사용

### 테마 색상
| 용도         | 색상                              |
| ------------ | --------------------------------- |
| 일반 기능    | 파란색 (`blue-500`, `blue-600`)   |
| 휠체어 발주  | 보라색 (`purple-500`, `purple-600`) |
| 경고/에러    | 빨간색 (`red-500`, `red-600`)     |

### 모달 & z-index 관리
| 레이어       | z-index | 용도                              |
| ------------ | ------- | --------------------------------- |
| 기본 모달    | `z-50`  | SelectSupplierModal 등 1차 모달   |
| 중첩 모달    | `z-[60]` | AddSupplierModal 등 2차 모달      |
| 최상위 모달  | `z-[70]` | 알림, 긴급 다이얼로그             |

**규칙:**
- 모달 위에 다른 모달이 열릴 경우 z-index를 10 단위로 증가
- 백드롭 클릭 방지가 필요한 경우 `e.stopPropagation()` 사용
- 모달 닫기 시 하위 모달들도 함께 닫기

### 검증 아키텍처 (3-레이어)
필수 데이터 검증은 3개 레이어에서 수행:

1. **UI 레이어**: 폼 제출 전 검증
   ```typescript
   if (!formData.supplierId) {
     toast.error("고객을 선택해주세요");
     return false;
   }
   ```

2. **서비스 레이어**: 런타임 검증
   ```typescript
   if (!formData.supplierId) {
     throw new Error("고객을 선택해주세요");
   }
   ```

3. **타입 시스템**: 컴파일타임 검증
   ```typescript
   interface CreateOrderDto {
     supplierId: number; // nullable 불가
   }
   ```

### 자동 채우기 패턴
사용자 경험과 데이터 정확성의 균형:

**DO:**
- 선택 시 관련 정보 자동 입력 (편의성)
- 자동 입력 후 수동 수정 허용 (유연성)
- 필수 필드는 명확히 검증 (정확성)

**DON'T:**
- 자동 입력 후 수정 불가능하게 만들기
- 빈 값으로 덮어쓰기 (기존 입력값 손실)
- 자동 채우기 실패 시 에러 발생

**예시:**
```typescript
const handleSupplierSelect = (supplier: Supplier) => {
  setFormData({
    ...formData, // 기존 데이터 유지
    supplierId: supplier.id, // 필수 필드
    receiver: supplier.representativeName || supplier.supplierName || "",
    receiverPhone: supplier.supplierPhoneNumber || "",
    address: supplier.supplierAddress || "",
    detailAddress: "", // 상세주소는 사용자가 직접 입력
  });
};
```

### 창고 접근 권한 패턴

**직관적인 체크박스 로직 (v2.5.0+)**

체크박스는 "접근 가능"을 의미하도록 설계 (직관성 우선):

```typescript
// ❌ 잘못된 방법 (헷갈림)
// 체크 = 접근 제한

// ✅ 올바른 방법 (직관적)
// 체크 = 접근 가능
```

**프론트엔드 → 백엔드 변환**

```typescript
// 1. 폼 상태: 접근 가능한 창고 ID 배열
const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);

// 2. 저장 시: 전체 - 접근 가능 = 제한된 창고
const allWarehouseIds = warehouses.map((w) => w.id);
const restrictedIds = allWarehouseIds.filter(
  (id) => !selectedWarehouses.includes(id)
);

// 3. 백엔드 전송: 쉼표로 구분된 문자열
const restrictedWhs = restrictedIds.length > 0 ? restrictedIds.join(",") : "";
```

**백엔드 → 프론트엔드 변환**

```typescript
// 1. 백엔드 수신: "1,3,5" (제한된 창고)
const restrictedWhs = user.restrictedWhs || "";

// 2. 파싱
const restrictedIds = restrictedWhs
  .split(",")
  .map((id) => parseInt(id.trim()))
  .filter((id) => !isNaN(id));

// 3. 변환: 전체 - 제한 = 접근 가능
const allWarehouseIds = warehouses.map((w) => w.id);
const accessibleIds = allWarehouseIds.filter(
  (id) => !restrictedIds.includes(id)
);

// 4. 폼 상태 설정
setSelectedWarehouses(accessibleIds);
```

**일관성 유지**
- UserManagementModal: 신규 사용자 생성 시
- UserEditModal: 기존 사용자 정보 수정 시
- 두 모달 모두 동일한 로직 사용 (접근 가능 ↔ 제한)

---

## ⚙️ 주요 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run type-check   # TypeScript 타입 체크
npm run lint         # ESLint 검사
```

---

## 🔄 업데이트 관리

### 자동 업데이트 (권장) 🤖
`/update-changelog` 슬래시 커맨드 사용:

```bash
/update-changelog         # 대화형 모드
/update-changelog patch   # 버그 수정 (1.16.1 → 1.16.2)
/update-changelog minor   # 새 기능 (1.16.1 → 1.17.0)
/update-changelog major   # 대규모 변경 (1.16.1 → 2.0.0)
```

**자동 처리 항목**:
1. ✅ 최근 커밋 분석 & 변경사항 분류
2. ✅ `CHANGELOG.md`에 새 버전 섹션 추가
3. ✅ `src/constants/version.ts` 버전 업데이트
4. ✅ `/update` 페이지 자동 생성

### 수동 업데이트 체크리스트 ✋

변경 시 **반드시** 업데이트:

- [ ] `CHANGELOG.md` - [Keep a Changelog](https://keepachangelog.com) 형식
- [ ] `src/constants/version.ts` - `APP_VERSION` 업데이트
- [ ] `/docs` 폴더 문서 (비즈니스 로직 변경 시)
- [ ] 커밋 전 **빌드 테스트 필수** (`npm run build`)

> ⚠️ `/update` 페이지는 자동 생성되므로 직접 수정 금지!