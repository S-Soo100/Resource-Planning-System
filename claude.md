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
| `/docs/supplier-management.md`  | 작성 필요  |

---

## 🔧 핵심 개발 규칙

### API & 데이터
- **React Query**: `['resource', params]` 키 구조
- **통신**: Axios
- **인증**: JWT + Zustand 상태 관리

### 날짜 처리
| 규칙              | 설명                                     |
| ----------------- | ---------------------------------------- |
| 빈 값             | `undefined` 반환 (빈 문자열 ❌)          |
| 서버 전송         | `undefined` 필드 제거                    |
| 형식              | `YYYY-MM-DDTHH:MM:SS+09:00` (KST)        |

### 가격 입력
| 규칙              | 설명                                     |
| ----------------- | ---------------------------------------- |
| **VAT**           | **자동 계산 금지** (영세율 0% 품목 존재) |
| 타입              | 폼: `string` → 저장: `number`            |
| 빈 값             | `undefined` 전송 (null ❌, 빈 문자열 ❌) |
| 소계              | `(판매가 + VAT) × 수량`                  |
| 검증              | `e.target.value.replace(/[^0-9]/g, '')` |

### 권한 시스템
| 등급       | 권한                        |
| ---------- | --------------------------- |
| Admin      | 모든 기능                   |
| Moderator  | 읽기 + 발주 승인            |
| User       | 기본 기능                   |
| Supplier   | 발주 관련만                 |

### 테마 색상
| 용도         | 색상                              |
| ------------ | --------------------------------- |
| 일반 기능    | 파란색 (`blue-500`, `blue-600`)   |
| 휠체어 발주  | 보라색 (`purple-500`, `purple-600`) |
| 경고/에러    | 빨간색 (`red-500`, `red-600`)     |

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