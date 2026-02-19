# KARS 디자인 패턴 적용 (Design Apply)

새 페이지나 컴포넌트를 작성할 때 KARS MD3 디자인 시스템 패턴을 처음부터 올바르게 적용합니다.
"어떤 컴포넌트가 필요한가?"를 묻고, 해당 컴포넌트 유형에 맞는 보일러플레이트를 생성합니다.

## 실행 방법

```bash
/design-apply                          # 대화형 모드
/design-apply page                     # 페이지 보일러플레이트 생성
/design-apply page admin               # admin 권한 체크 포함 페이지
/design-apply card                     # 카드 컴포넌트 패턴
/design-apply table                    # Excel-style 테이블 패턴
/design-apply modal                    # 모달 컴포넌트 패턴
/design-apply segment                  # Segment Control 패턴
/design-apply form                     # 폼 패턴
```

---

## 작업 단계

### 1. 유형 확인

인수가 없는 경우 사용자에게 질문:
```
어떤 패턴을 적용할까요?
1. page         — 페이지 전체 (권한 체크 포함)
2. page admin   — Admin/Moderator 전용 페이지
3. card         — 카드 컴포넌트 (헤더 + 바디)
4. table        — Excel-style 테이블
5. modal        — 모달 컴포넌트
6. segment      — Segment Control 탭 네비게이션
7. form         — 입력 폼 (인풋 + 버튼)
8. empty        — 빈 상태(Empty State) 블록
9. badge        — 배지/태그 모음
```

### 2. 추가 컨텍스트 수집

유형 결정 후:
- **파일 경로**: 어디에 생성할지 (`src/app/...` 또는 `src/components/...`)
- **컴포넌트 이름**: PascalCase (예: `OrderHistoryPage`, `WarehouseCard`)
- **필요한 props**: 주요 데이터 타입이나 인터페이스

### 3. 보일러플레이트 생성

아래 패턴을 기반으로 코드를 작성하되, 사용자가 제공한 컨텍스트로 적절히 채워 넣음.

---

## 패턴 레퍼런스

### [page] 기본 페이지

```tsx
"use client";
import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingCentered } from "@/components/ui/Loading";

export default function MyPage() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingCentered size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-Back-Low-10">
      <div className="mx-auto max-w-7xl">
        {/* 페이지 헤더 */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-Text-Highest-100">페이지 제목</h1>
            <p className="text-sm text-Text-Low-70 mt-0.5">페이지 설명</p>
          </div>
          {/* 액션 버튼 */}
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 transition-colors text-sm font-medium self-start sm:self-auto">
            작업 버튼
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* 내용 */}
        </div>
      </div>
    </div>
  );
}
```

### [page admin] Admin/Moderator 전용 페이지

```tsx
"use client";
import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoadingCentered } from "@/components/ui/Loading";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingCentered size="lg" />
      </div>
    );
  }

  if (!user || (user.accessLevel !== "admin" && user.accessLevel !== "moderator")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-Text-Highest-100 mb-4">
            접근 권한이 필요합니다
          </h2>
          <p className="text-Text-Low-70 mb-6">
            이 페이지는 관리자 또는 1차 승인권자만 접근할 수 있습니다.
          </p>
          <button
            onClick={() => router.push("/menu")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isReadOnly = user.accessLevel === "moderator";

  return (
    <div className="p-4 md:p-6 min-h-screen bg-Back-Low-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-Text-Highest-100">관리 페이지</h1>
            <p className="text-sm text-Text-Low-70 mt-0.5">설명 텍스트</p>
          </div>
          {isReadOnly && (
            <span className="px-4 py-2 bg-Primary-Container text-Primary-Main rounded-full text-sm self-start">
              1차 승인권자 권한으로는 조회만 가능합니다
            </span>
          )}
        </div>
        {/* 콘텐츠 */}
      </div>
    </div>
  );
}
```

### [card] 카드 컴포넌트

```tsx
{/* Primary Container 헤더 카드 */}
<div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
  {/* 카드 헤더 */}
  <div className="bg-Primary-Container px-4 py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="text-Primary-Main" size={16} />
        <h3 className="font-semibold text-sm text-Primary-Main">{title}</h3>
      </div>
      <div className="flex gap-1">
        <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-Primary-Main/10 text-Primary-Main transition-colors">
          <Edit2 size={14} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-Error-Container text-Error-Main transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </div>
  {/* 카드 바디 */}
  <div className="p-4">
    <p className="text-xs font-semibold text-Text-Low-70 uppercase tracking-wider mb-2">섹션 제목</p>
    {/* 배지 */}
    <div className="flex flex-wrap gap-1.5">
      <span className="px-2.5 py-1 bg-Primary-Container text-Primary-Main rounded-full text-xs font-medium">
        태그
      </span>
    </div>
  </div>
</div>

{/* 섹션 카드 (헤더 + 콘텐츠) */}
<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
  <div className="flex justify-between items-center px-6 py-4 border-b border-Outline-Variant">
    <div>
      <h2 className="text-lg font-semibold text-Text-Highest-100">섹션 제목</h2>
      <p className="text-sm text-Text-Low-70 mt-0.5">섹션 설명</p>
    </div>
    <button className="px-4 py-2 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 transition-colors text-sm font-medium">
      액션
    </button>
  </div>
  <div className="p-6">
    {/* 콘텐츠 */}
  </div>
</div>
```

### [table] Excel-style 테이블

```tsx
<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
  {/* 테이블 헤더 */}
  <div className="flex justify-between items-center px-6 py-4 border-b border-Outline-Variant">
    <h2 className="text-lg font-semibold text-Text-Highest-100">목록</h2>
    <button className="px-4 py-2 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 transition-colors text-sm font-medium">
      추가
    </button>
  </div>

  {/* 검색 바 (선택사항) */}
  <div className="px-6 py-3 border-b border-Outline-Variant bg-Back-Low-10">
    <input
      type="text"
      placeholder="검색..."
      className="w-full px-4 py-2 border border-Outline-Variant rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main bg-white"
    />
  </div>

  {/* 테이블 */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-Back-Low-10 border-b border-Outline-Variant">
          <th className="px-6 py-3 text-left text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
            컬럼명
          </th>
          <th className="px-6 py-3 text-right text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
            관리
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-Outline-Variant">
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-Back-Low-10 transition-colors duration-150">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-Primary-Container rounded-full flex-shrink-0">
                  <span className="text-sm font-semibold text-Primary-Main">
                    {item.name.charAt(0)}
                  </span>
                </div>
                <span className="font-medium text-Text-Highest-100">{item.name}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button className="px-3 py-1.5 text-xs font-medium bg-Back-Low-10 text-Text-High-90 rounded-full hover:bg-Back-Mid-20 transition-colors">
                  수정
                </button>
                <button className="px-3 py-1.5 text-xs font-medium bg-Error-Container text-Error-Main rounded-full hover:brightness-95 transition-all">
                  삭제
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* 빈 상태 */}
  {items.length === 0 && (
    <div className="py-16 text-center">
      <div className="w-12 h-12 bg-Primary-Container rounded-full flex items-center justify-center mx-auto mb-3">
        <Icon className="text-Primary-Main" size={22} />
      </div>
      <p className="text-Text-Low-70">등록된 항목이 없습니다</p>
    </div>
  )}
</div>
```

### [modal] 모달

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg mx-4 overflow-hidden shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-Outline-Variant">
          <h2 className="text-lg font-semibold text-Text-Highest-100">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-Back-Low-10 text-Text-Low-70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
```

### [segment] Segment Control

```tsx
{/* 기본 Segment Control */}
<div className="flex p-1.5 bg-Back-Mid-20 rounded-2xl shadow-inner">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        activeTab === tab.id
          ? "bg-white text-Primary-Main shadow-md"
          : "text-Text-Low-70 hover:bg-white/50 hover:text-Text-High-90"
      }`}
    >
      {tab.icon}
      {tab.label}
    </button>
  ))}
</div>
```

### [form] 폼

```tsx
<form onSubmit={handleSubmit}>
  {/* 텍스트 인풋 */}
  <div className="mb-4">
    <label className="block mb-1.5 text-sm font-medium text-Text-Highest-100">
      필드 이름
    </label>
    <input
      type="text"
      className="w-full px-4 py-2 border border-Outline-Variant rounded-xl focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main outline-none text-Text-Highest-100 bg-white"
      placeholder="입력하세요"
    />
  </div>

  {/* 체크박스 목록 */}
  <div className="max-h-60 overflow-y-auto border border-Outline-Variant rounded-xl p-3 bg-Back-Low-10">
    {items.map((item) => (
      <li key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer">
        <input type="checkbox" className="accent-Primary-Main" />
        <label className="cursor-pointer text-sm text-Text-Highest-100">{item.name}</label>
      </li>
    ))}
  </div>

  {/* 버튼 그룹 */}
  <div className="flex justify-end gap-2 mt-6">
    <button
      type="button"
      className="px-4 py-2 bg-Back-Mid-20 text-Text-High-90 rounded-full hover:bg-Back-Mid-20/80 transition-colors text-sm font-medium"
    >
      취소
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 transition-colors text-sm font-medium"
    >
      저장
    </button>
  </div>
</form>
```

### [empty] 빈 상태 (Empty State)

```tsx
{/* 원형 아이콘 */}
<div className="py-16 text-center bg-white rounded-2xl shadow-sm">
  <div className="w-12 h-12 bg-Primary-Container rounded-full flex items-center justify-center mx-auto mb-3">
    <Icon className="text-Primary-Main" size={22} />
  </div>
  <p className="text-Text-High-90 font-medium">등록된 항목이 없습니다</p>
  <p className="text-Text-Low-70 text-sm mt-1.5">새 항목을 추가해보세요</p>
</div>

{/* 사각형 아이콘 + CTA 버튼 */}
<div className="text-center py-16 bg-white rounded-2xl shadow-sm">
  <div className="w-14 h-14 bg-Primary-Container rounded-2xl flex items-center justify-center mx-auto mb-4">
    <Icon className="text-Primary-Main" size={28} />
  </div>
  <p className="text-Text-High-90 font-medium mb-1.5">항목이 없습니다</p>
  <p className="text-Text-Low-70 text-sm mb-4">첫 번째 항목을 추가해보세요</p>
  <button className="px-4 py-2 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 text-sm font-medium">
    추가하기
  </button>
</div>
```

### [badge] 배지 모음

```tsx
{/* Primary */}
<span className="px-2.5 py-1 bg-Primary-Container text-Primary-Main rounded-full text-xs font-medium">
  Primary 태그
</span>

{/* Error/삭제 */}
<span className="px-2.5 py-1 bg-Error-Container text-Error-Main rounded-full text-xs font-medium">
  삭제 태그
</span>

{/* 읽기 전용 */}
<span className="px-3 py-1 text-xs font-medium text-Primary-Main bg-Primary-Container rounded-full">
  읽기 전용
</span>

{/* 중립 */}
<span className="px-2.5 py-1 bg-Back-Mid-20 text-Text-High-90 rounded-full text-xs font-medium">
  중립 태그
</span>
```

---

## 생성 완료 후

보일러플레이트 출력 후:
1. 해당 파일 경로에 실제로 파일을 생성할지 확인
2. 생성 시 적절한 import 구문 자동 추가 (`lucide-react` 아이콘, hooks 등)
3. 생성 후 `/design-review` 커맨드로 검증 권장 안내

---

## 주의사항

- 보일러플레이트는 시작점이므로 비즈니스 로직은 별도 구현 필요
- TypeScript 타입은 실제 프로젝트의 `@/types/` 참조
- 훅은 실제 프로젝트의 `@/hooks/` 참조 (`useCurrentUser`, `useCurrentTeam` 등)
- 페이지 생성 시 `"use client"` 지시어 필수
