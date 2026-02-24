# API 에러 처리 가이드

> **KARS 프로젝트 전체에서 일관된 API 에러 처리를 위한 표준 가이드**

---

## 📌 목차

1. [개요](#개요)
2. [에러 처리 원칙](#에러-처리-원칙)
3. [에러 타입](#에러-타입)
4. [유틸리티 함수](#유틸리티-함수)
5. [사용 예시](#사용-예시)
6. [마이그레이션 가이드](#마이그레이션-가이드)
7. [체크리스트](#체크리스트)

---

## 개요

### 목적
- 사용자에게 명확하고 이해하기 쉬운 에러 메시지 제공
- 개발자가 디버깅하기 쉬운 에러 로깅
- 프로젝트 전체에서 일관된 에러 처리

### 파일 위치
- **유틸리티**: `/src/utils/apiErrorHandler.ts`
- **문서**: `/docs/api-error-handling.md` (이 파일)
- **참조**: `/CLAUDE.md`

---

## 에러 처리 원칙

### 1. 이중 피드백 시스템
- **팝업 (alert/confirm)**: 중요한 에러는 사용자가 반드시 확인
- **Toast**: 자동으로 사라지는 간단한 알림

### 2. 명확한 에러 메시지
```
❌ 나쁜 예: "오류가 발생했습니다."
✅ 좋은 예: "출고완료된 주문은 수정할 수 없습니다."
```

### 3. 사용자 안내
- 왜 실패했는지 설명
- 어떻게 해결할 수 있는지 안내
- 필요시 관리자 문의 유도

### 4. 개발자 친화적 로깅
```typescript
console.error("[API Response Error]", response);
console.error("[API Request Error]", error);
```

---

## 에러 타입

### 1. API 응답 에러 (Response Error)
서버가 응답했지만 `success: false`인 경우

**예시 응답:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "출고완료된 주문은 수정할 수 없습니다.",
  "path": "/erp/order/206",
  "timestamp": "2026-02-23T23:57:03.982Z"
}
```

**처리 위치:** `onSuccess` 핸들러에서 `response.success` 체크

### 2. API 요청 에러 (Request Error)
네트워크 오류, 타임아웃, 500 에러 등

**예시:**
- Network Error
- Timeout
- 500 Internal Server Error
- 401 Unauthorized

**처리 위치:** `onError` 핸들러

### 3. 예외 에러 (Exception)
코드 실행 중 발생하는 에러

**예시:**
- TypeError
- ReferenceError
- 파일 처리 오류

**처리 위치:** `try-catch` 블록

---

## 유틸리티 함수

### 1. `extractErrorMessage(error, defaultMessage)`
에러 객체에서 메시지 추출

```typescript
import { extractErrorMessage } from "@/utils/apiErrorHandler";

const errorMessage = extractErrorMessage(
  error,
  "데이터 로드에 실패했습니다."
);
```

**메시지 추출 우선순위:**
1. `error.response.data.message` (Axios 에러)
2. `error.message` (Error 객체)
3. `error` (문자열)
4. `defaultMessage` (기본값)

---

### 2. `showErrorPopup(message, options)`
에러 팝업 표시

```typescript
import { showErrorPopup } from "@/utils/apiErrorHandler";

showErrorPopup("출고완료된 주문은 수정할 수 없습니다.", {
  title: "주문 수정 실패",
  helpText: "관리자에게 문의해주세요.",
  useAlert: true,
  showToast: true,
  toastDuration: 5000,
});
```

**옵션:**
| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `title` | string | "❌ 오류" | 팝업 제목 |
| `helpText` | string | - | 추가 안내 메시지 |
| `useAlert` | boolean | true | alert 사용 (false면 confirm) |
| `showToast` | boolean | true | toast 동시 표시 |
| `toastDuration` | number | 5000 | toast 표시 시간 (ms) |

---

### 3. `handleApiResponseError(response, options, onError)`
API 응답 에러 처리 (onSuccess에서 사용)

```typescript
import { handleApiResponseError } from "@/utils/apiErrorHandler";

onSuccess: async (response) => {
  if (response.success) {
    // 성공 처리
    toast.success("수정되었습니다.");
    onClose();
  } else {
    handleApiResponseError(
      response,
      {
        title: "주문 수정 실패",
        helpText: "관리자에게 문의해주세요.",
      },
      (message) => {
        // 추가 에러 처리
        setIsSubmitting(false);
      }
    );
  }
}
```

---

### 4. `handleApiRequestError(error, options, onError)`
API 요청 에러 처리 (onError에서 사용)

```typescript
import { handleApiRequestError } from "@/utils/apiErrorHandler";

onError: (error) => {
  handleApiRequestError(
    error,
    {
      title: "주문 수정 오류",
      helpText: "문제가 계속되면 관리자에게 문의해주세요.",
    },
    (message) => {
      // 추가 에러 처리
      setIsSubmitting(false);
      setIsFileUploading(false);
    }
  );
}
```

---

### 5. `createMutationErrorHandlers(config)` ⭐ 추천
React Query Mutation 에러 처리 헬퍼 (가장 간단!)

```typescript
import { createMutationErrorHandlers } from "@/utils/apiErrorHandler";

const { mutate: updateOrder } = useUpdateOrder();

const errorHandlers = createMutationErrorHandlers({
  successTitle: "주문 수정",
  errorTitle: "주문 수정 오류",
  helpText: "문제가 계속되면 관리자에게 문의해주세요.",
  onSuccessCallback: async (response) => {
    // 성공 시 추가 처리
    toast.success("주문이 수정되었습니다.");
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    onClose();
  },
  onErrorCallback: (message) => {
    // 에러 시 추가 처리
    setIsSubmitting(false);
  },
});

// 사용
updateOrder(orderData, errorHandlers);
```

**설정 옵션:**
| 옵션 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `successTitle` | string | ✅ | 작업명 (예: "주문 수정") |
| `errorTitle` | string | ❌ | 에러 제목 (기본값: "{successTitle} 오류") |
| `helpText` | string | ❌ | 추가 안내 메시지 |
| `onSuccessCallback` | function | ❌ | 성공 시 추가 처리 |
| `onErrorCallback` | function | ❌ | 에러 시 추가 처리 |
| `showToast` | boolean | ❌ | toast 표시 여부 (기본값: true) |

---

### 6. `showSimpleError(error, defaultMessage)`
간단한 에러 처리 (toast만)

```typescript
import { showSimpleError } from "@/utils/apiErrorHandler";

try {
  await fetchData();
} catch (error) {
  showSimpleError(error, "데이터 로드 실패");
}
```

---

## 사용 예시

### 예시 1: React Query Mutation (기본 패턴) ⭐

```typescript
import { useUpdateOrder } from "@/hooks/useOrder";
import { handleApiResponseError, handleApiRequestError } from "@/utils/apiErrorHandler";

const MyComponent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: updateOrder } = useUpdateOrder();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: OrderData) => {
    setIsSubmitting(true);

    updateOrder(data, {
      onSuccess: async (response) => {
        if (response.success) {
          // ✅ 성공 처리
          toast.success("주문이 수정되었습니다.");
          await queryClient.invalidateQueries({ queryKey: ["orders"] });
          onClose();
        } else {
          // ❌ 응답 에러 처리
          handleApiResponseError(
            response,
            {
              title: "주문 수정 실패",
              helpText: "관리자에게 문의해주세요.",
            },
            () => setIsSubmitting(false)
          );
        }
      },
      onError: (error) => {
        // ❌ 요청 에러 처리
        handleApiRequestError(
          error,
          {
            title: "주문 수정 오류",
            helpText: "문제가 계속되면 관리자에게 문의해주세요.",
          },
          () => setIsSubmitting(false)
        );
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? "처리 중..." : "수정"}
    </button>
  );
};
```

---

### 예시 2: React Query Mutation (헬퍼 사용) ⭐⭐⭐

```typescript
import { useUpdateOrder } from "@/hooks/useOrder";
import { createMutationErrorHandlers } from "@/utils/apiErrorHandler";

const MyComponent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: updateOrder } = useUpdateOrder();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: OrderData) => {
    setIsSubmitting(true);

    // 에러 핸들러 생성
    const errorHandlers = createMutationErrorHandlers({
      successTitle: "주문 수정",
      onSuccessCallback: async (response) => {
        toast.success("주문이 수정되었습니다.");
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        onClose();
      },
      onErrorCallback: () => {
        setIsSubmitting(false);
      },
    });

    // 실행
    updateOrder(data, {
      ...errorHandlers,
      onSettled: () => setIsSubmitting(false),
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? "처리 중..." : "수정"}
    </button>
  );
};
```

---

### 예시 3: 일반 API 호출 (async/await)

```typescript
import { showSimpleError } from "@/utils/apiErrorHandler";

const MyComponent = () => {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await orderApi.getOrders();
      if (response.success) {
        setData(response.data);
      } else {
        showSimpleError(response, "데이터 로드 실패");
      }
    } catch (error) {
      showSimpleError(error, "데이터 로드 중 오류 발생");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return <div>{/* UI */}</div>;
};
```

---

### 예시 4: 복잡한 비즈니스 로직

```typescript
import {
  handleApiResponseError,
  handleApiRequestError,
  showErrorPopup,
} from "@/utils/apiErrorHandler";

const MyComponent = () => {
  const handleComplexOperation = async () => {
    try {
      // Step 1: 주문 수정
      updateOrder(orderData, {
        onSuccess: async (response) => {
          if (response.success) {
            // Step 2: 파일 업로드
            try {
              const uploadResponse = await uploadFiles(files);
              if (!uploadResponse.success) {
                showErrorPopup(
                  "주문은 수정되었으나 파일 업로드에 실패했습니다.",
                  {
                    title: "파일 업로드 실패",
                    helpText: "다시 시도해주세요.",
                  }
                );
              } else {
                toast.success("모든 작업이 완료되었습니다.");
              }
            } catch (fileError) {
              showSimpleError(fileError, "파일 처리 중 오류 발생");
            }
          } else {
            handleApiResponseError(response, {
              title: "주문 수정 실패",
            });
          }
        },
        onError: (error) => {
          handleApiRequestError(error, {
            title: "주문 수정 오류",
          });
        },
      });
    } catch (error) {
      showSimpleError(error, "작업 중 오류 발생");
    }
  };

  return <button onClick={handleComplexOperation}>실행</button>;
};
```

---

## 마이그레이션 가이드

### 기존 코드를 새 패턴으로 변경하기

#### Before (기존 코드)
```typescript
updateOrder(data, {
  onSuccess: async (response) => {
    if (response.success) {
      toast.success("수정되었습니다.");
      onClose();
    } else {
      throw new Error(response.message || "수정 실패");
    }
  },
  onError: (error) => {
    console.error("오류:", error);
    toast.error(
      error instanceof Error ? error.message : "오류가 발생했습니다."
    );
  },
});
```

#### After (개선된 코드)
```typescript
import { createMutationErrorHandlers } from "@/utils/apiErrorHandler";

const errorHandlers = createMutationErrorHandlers({
  successTitle: "주문 수정",
  onSuccessCallback: async (response) => {
    toast.success("수정되었습니다.");
    onClose();
  },
});

updateOrder(data, errorHandlers);
```

---

## 체크리스트

API 호출 구현 시 다음을 확인하세요:

### 필수 항목
- [ ] `onSuccess`에서 `response.success` 체크
- [ ] 에러 발생 시 명확한 메시지 표시
- [ ] 에러 발생 시 상태 플래그 리셋 (`setIsSubmitting(false)` 등)
- [ ] 콘솔에 에러 객체 로깅

### 권장 항목
- [ ] `createMutationErrorHandlers` 헬퍼 사용
- [ ] 중요한 에러는 팝업으로 표시
- [ ] 일반 에러는 toast로 표시
- [ ] 에러 메시지에 사용자 안내 포함

### 선택 항목
- [ ] 에러 타입별 다른 처리
- [ ] 재시도 로직 구현
- [ ] 에러 추적/모니터링

---

## 에러 메시지 작성 가이드

### DO ✅
- 구체적이고 명확한 메시지
  - "출고완료된 주문은 수정할 수 없습니다."
  - "재고가 부족합니다. (필요: 10개, 현재: 5개)"
- 사용자가 할 수 있는 행동 안내
  - "관리자에게 문의해주세요."
  - "다시 시도해주세요."
- 비즈니스 용어 사용
  - "주문", "발주", "시연", "고객"

### DON'T ❌
- 모호한 메시지
  - "오류가 발생했습니다."
  - "실패했습니다."
- 기술적 용어/코드
  - "NullPointerException"
  - "Error 500"
- 사용자가 이해하기 어려운 내용
  - "데이터베이스 트랜잭션 롤백"

---

## 추가 리소스

- **유틸리티 코드**: `/src/utils/apiErrorHandler.ts`
- **프로젝트 가이드**: `/CLAUDE.md`
- **API 타입 정의**: `/src/types/common.ts`

---

## 업데이트 이력

| 날짜 | 버전 | 변경사항 |
|------|------|----------|
| 2026-02-24 | 1.0.0 | 초기 문서 작성 |

---

## 문의

에러 처리 관련 문의사항이나 개선 제안은 팀 채널로 공유해주세요.
