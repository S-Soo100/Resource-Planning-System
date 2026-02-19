# KARS 디자인 패턴 검토 (Design Review)

지정된 파일 또는 현재 작업 중인 파일의 디자인 토큰 사용을 검토하고, KARS MD3 디자인 시스템 기준으로 수정이 필요한 항목을 식별하여 수정합니다.

## 실행 방법

```bash
/design-review                          # 대화형: 검토할 파일 경로 입력
/design-review src/app/some/page.tsx    # 특정 파일 직접 지정
/design-review src/components/foo/      # 디렉토리 내 모든 tsx 파일 검토
```

---

## 작업 단계

### 1. 대상 파일 확인
- 인수가 제공된 경우: 해당 경로의 파일(들) 읽기
- 인수가 없는 경우: 사용자에게 검토할 파일 경로 입력 요청

### 2. 디자인 토큰 위반 항목 스캔

아래 **금지 패턴** 목록을 기준으로 파일 내 위반 사항을 모두 찾아냄:

#### 색상 (하드코딩 → 토큰)
| 금지 패턴 | 대체 토큰 | 용도 |
|-----------|-----------|------|
| `bg-blue-*`, `text-blue-*`, `border-blue-*` | `bg-Primary-Main`, `text-Primary-Main` | Primary 색상 |
| `bg-purple-*`, `text-purple-*`, `border-purple-*` | `bg-Primary-Main`, `text-Primary-Main` | (구) 휠체어 발주색 → Primary로 통일 |
| `bg-red-*`, `text-red-*`, `border-red-*` | `bg-Error-Main`, `text-Error-Main` | 에러/삭제 |
| `bg-yellow-*` (폼 배경용) | `bg-Back-Low-10` | 수정 폼 배경 |
| `bg-gray-50`, `bg-gray-100` (카드/배경) | `bg-Back-Low-10`, `bg-Back-Mid-20` | 페이지/섹션 배경 |
| `bg-gray-800`, `bg-gray-900` (헤더) | `bg-Primary-Container` | 카드 헤더 |
| `text-gray-*` | `text-Text-Highest-100`, `text-Text-High-90`, `text-Text-Low-70` | 텍스트 계층 |
| `border-gray-*` | `border-Outline-Variant` | 테두리 |

#### 형태 (Shape)
| 금지 패턴 | 대체 | 용도 |
|-----------|------|------|
| `rounded-lg` (버튼) | `rounded-full` | 버튼, 배지, pill |
| `rounded-lg` (카드) | `rounded-2xl` | 카드, 섹션 컨테이너 |
| `rounded-lg` (모달) | `rounded-3xl` | 모달 |
| `rounded-lg` (인풋) | `rounded-xl` 또는 `rounded-full` | 인풋 필드 |

#### 컨테이너 패턴
| 금지 패턴 | 대체 | 용도 |
|-----------|------|------|
| `border-2 border-dashed border-gray-300` (빈 상태) | `bg-white rounded-2xl shadow-sm` | 빈 상태 카드 |
| `shadow-lg` on card (과도한 그림자) | `shadow-sm hover:shadow-md` | 카드 그림자 |
| `border border-gray-200` (카드 테두리) | border 제거 + `shadow-sm` | 카드 스타일 |
| `bg-white/10 hover:bg-white/20` (다크 배경 버튼) | `hover:bg-Primary-Main/10` or `hover:bg-Error-Container` | 아이콘 버튼 |

#### Segment Control
| 금지 패턴 | 대체 |
|-----------|------|
| 그라디언트 탭 (`bg-gradient-to-*`) | `bg-Back-Mid-20 rounded-2xl shadow-inner` 컨테이너 + `bg-white rounded-xl shadow-md` 선택탭 |
| `scale-105` 활성 탭 | `bg-white shadow-md` |
| `bg-blue-600` 활성 탭 | `bg-white text-Primary-Main shadow-md` |

### 3. 검토 결과 리포트 출력

파일별로 아래 형식으로 출력:

```
📁 [파일 경로]

❌ 위반 항목 (N개):
  Line 42: `bg-gray-800` → `bg-Primary-Container` (카드 헤더)
  Line 58: `rounded-lg` → `rounded-2xl` (카드 컨테이너)
  Line 71: `text-gray-500` → `text-Text-Low-70`
  Line 95: `bg-blue-600` → `bg-Primary-Main`

✅ 정상 항목: Primary-Container, Text-Highest-100 등 올바른 토큰 사용 확인
```

### 4. 수정 여부 확인

리포트 출력 후 사용자에게 질문:
- **"수정을 적용할까요? (전체 / 선택 / 건너뛰기)"**
- 전체 선택 시: 모든 위반 항목을 자동 수정
- 선택 시: 위반 항목 번호 입력받아 해당 항목만 수정
- 건너뛰기: 리포트만 제공하고 종료

### 5. 수정 적용

Edit 도구를 사용하여 위반 항목을 순서대로 수정.
수정 후 변경된 라인 수와 요약 출력.

---

## KARS MD3 디자인 토큰 레퍼런스

### 색상 팔레트
```
Primary-Main        #5B5BD6  (인디고/바이올렛)
Primary-Container   #E8E8FF  (연보라 배경)
Error-Main          #D32F2F  (에러/삭제)
Error-Container     #FFEBEE  (에러 연배경)
```

### 배경 계층
```
Back-Lowest-00   순백 (모달 내부)
Back-Low-10      #F9FAFD (페이지 배경, 섹션 배경)
Back-Mid-20      #F3F6F8 (segment control 배경, hover 배경)
Outline-Variant  #E0E0E0 (테두리)
```

### 텍스트 계층
```
Text-Highest-100   기본 텍스트 (헤딩, 본문)
Text-High-90       보조 텍스트 (서브 라벨)
Text-Low-70        비활성 텍스트 (플레이스홀더, 캡션)
```

### Shape 규칙
```
버튼/배지/pill:   rounded-full
인풋:             rounded-xl (또는 rounded-full)
카드/섹션:        rounded-2xl
모달:             rounded-3xl
아이콘 컨테이너:  rounded-xl (사각) 또는 rounded-full (원형)
```

### 컴포넌트 패턴

**카드:**
```tsx
<div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
```

**카드 헤더 (Primary):**
```tsx
<div className="bg-Primary-Container px-4 py-3">
  <h3 className="font-semibold text-Primary-Main">...</h3>
</div>
```

**Segment Control:**
```tsx
<div className="flex p-1.5 bg-Back-Mid-20 rounded-2xl shadow-inner">
  <button className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium
    bg-white text-Primary-Main shadow-md">  {/* 선택 탭 */}
  </button>
  <button className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium
    text-Text-Low-70 hover:bg-white/50">   {/* 비선택 탭 */}
  </button>
</div>
```

**빈 상태 (Empty State):**
```tsx
<div className="py-16 text-center bg-white rounded-2xl shadow-sm">
  <div className="w-14 h-14 bg-Primary-Container rounded-2xl flex items-center justify-center mx-auto mb-4">
    <Icon className="text-Primary-Main" size={28} />
  </div>
  <p className="text-Text-High-90 font-medium">등록된 항목이 없습니다</p>
</div>
```

**Excel-style 테이블:**
```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-Back-Low-10 border-b border-Outline-Variant">
        <th className="px-6 py-3 text-left text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
      </tr>
    </thead>
    <tbody className="divide-y divide-Outline-Variant">
      <tr className="hover:bg-Back-Low-10 transition-colors duration-150">
    </tbody>
  </table>
</div>
```

**배지/태그:**
```tsx
<span className="px-2.5 py-1 bg-Primary-Container text-Primary-Main rounded-full text-xs font-medium">
<span className="px-2.5 py-1 bg-Error-Container text-Error-Main rounded-full text-xs font-medium">
```

**인풋:**
```tsx
<input className="w-full px-4 py-2 border border-Outline-Variant rounded-xl
  focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main
  outline-none text-Text-Highest-100 bg-white" />
```

**Primary 버튼:**
```tsx
<button className="px-4 py-2 bg-Primary-Main text-white rounded-full
  hover:bg-Primary-Main/90 transition-colors text-sm font-medium">
```

---

## 주의사항

- 기능 로직(클래스명이 아닌 JSX 구조, 핸들러 등)은 수정하지 않음
- 디자인 토큰만 교체하는 최소한의 변경만 적용
- 수정 후 타입 오류가 발생할 여지가 있는 변경은 사전에 경고
- `tailwind.config.js`의 safelist에 없는 동적 클래스 사용 시 경고
