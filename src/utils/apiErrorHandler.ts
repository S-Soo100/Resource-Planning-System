/**
 * API 에러 처리 유틸리티
 *
 * KARS 프로젝트 전체에서 일관된 에러 처리를 위한 유틸리티 함수들
 *
 * @see /docs/api-error-handling.md - 상세 가이드 문서
 */

import { toast } from "react-hot-toast";

/**
 * 서버 응답 타입 (공통)
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  path?: string;
  timestamp?: string;
  error?: string;
}

/**
 * 에러 객체에서 메시지 추출
 *
 * 우선순위:
 * 1. Axios 에러 응답 (error.response.data.message)
 * 2. Error 객체 (error.message)
 * 3. 문자열 에러
 * 4. 기본 메시지
 *
 * @param error - 에러 객체
 * @param defaultMessage - 기본 에러 메시지
 * @returns 추출된 에러 메시지
 */
export function extractErrorMessage(
  error: any,
  defaultMessage: string = "오류가 발생했습니다."
): string {
  // 1순위: Axios 에러 응답
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // 2순위: Error 객체
  if (error?.message) {
    return error.message;
  }

  // 3순위: 문자열 에러
  if (typeof error === "string") {
    return error;
  }

  // 4순위: 기본 메시지
  return defaultMessage;
}

/**
 * 에러 팝업 표시 옵션
 */
export interface ShowErrorPopupOptions {
  /** 팝업 제목 (기본값: "❌ 오류") */
  title?: string;
  /** 추가 안내 메시지 */
  helpText?: string;
  /** confirm 대신 alert 사용 여부 */
  useAlert?: boolean;
  /** toast도 함께 표시할지 여부 (기본값: true) */
  showToast?: boolean;
  /** toast 표시 시간 (ms, 기본값: 5000) */
  toastDuration?: number;
}

/**
 * 에러 팝업 표시
 *
 * 사용자에게 명확한 에러 메시지를 팝업으로 표시하고,
 * 선택적으로 toast도 함께 표시
 *
 * @param message - 에러 메시지
 * @param options - 팝업 옵션
 *
 * @example
 * ```typescript
 * showErrorPopup("출고완료된 주문은 수정할 수 없습니다.", {
 *   title: "주문 수정 실패",
 *   helpText: "관리자에게 문의해주세요."
 * });
 * ```
 */
export function showErrorPopup(
  message: string,
  options: ShowErrorPopupOptions = {}
): void {
  const {
    title = "❌ 오류",
    helpText,
    useAlert = true,
    showToast = true,
    toastDuration = 5000,
  } = options;

  // 팝업 메시지 구성
  let popupMessage = `${title}\n\n${message}`;
  if (helpText) {
    popupMessage += `\n\n${helpText}`;
  }

  // 팝업 표시
  if (useAlert) {
    window.alert(popupMessage);
  } else {
    window.confirm(popupMessage + "\n\n확인을 눌러 닫기");
  }

  // Toast 표시
  if (showToast) {
    toast.error(message, {
      duration: toastDuration,
    });
  }
}

/**
 * API 응답 에러 처리 (onSuccess에서 success: false인 경우)
 *
 * @param response - API 응답 객체
 * @param options - 팝업 옵션
 * @param onError - 추가 에러 처리 콜백
 *
 * @example
 * ```typescript
 * onSuccess: async (response) => {
 *   if (response.success) {
 *     // 성공 처리
 *   } else {
 *     handleApiResponseError(response, {
 *       title: "주문 수정 실패",
 *       helpText: "관리자에게 문의해주세요."
 *     });
 *   }
 * }
 * ```
 */
export function handleApiResponseError(
  response: ApiResponse,
  options: ShowErrorPopupOptions = {},
  onError?: (message: string) => void
): void {
  const errorMessage = response.message || "요청 처리에 실패했습니다.";

  // 콘솔 로깅
  console.error("[API Response Error]", response);

  // 에러 팝업 표시
  showErrorPopup(errorMessage, options);

  // 추가 콜백 실행
  if (onError) {
    onError(errorMessage);
  }
}

/**
 * API 요청 에러 처리 (onError에서 네트워크/서버 에러)
 *
 * @param error - 에러 객체
 * @param options - 팝업 옵션
 * @param onError - 추가 에러 처리 콜백
 *
 * @example
 * ```typescript
 * onError: (error) => {
 *   handleApiRequestError(error, {
 *     title: "주문 수정 오류",
 *     helpText: "문제가 계속되면 관리자에게 문의해주세요."
 *   }, () => {
 *     setIsSubmitting(false);
 *   });
 * }
 * ```
 */
export function handleApiRequestError(
  error: any,
  options: ShowErrorPopupOptions = {},
  onError?: (message: string) => void
): void {
  const errorMessage = extractErrorMessage(
    error,
    "요청 처리 중 오류가 발생했습니다."
  );

  // 콘솔 로깅
  console.error("[API Request Error]", error);

  // 에러 팝업 표시
  showErrorPopup(errorMessage, options);

  // 추가 콜백 실행
  if (onError) {
    onError(errorMessage);
  }
}

/**
 * React Query Mutation 에러 처리 헬퍼
 *
 * React Query의 useMutation에서 사용할 수 있는
 * onSuccess, onError 핸들러를 생성
 *
 * @param config - 에러 처리 설정
 * @returns onSuccess, onError 핸들러 객체
 *
 * @example
 * ```typescript
 * const { mutate: updateOrder } = useUpdateOrder();
 *
 * const errorHandlers = createMutationErrorHandlers({
 *   successTitle: "주문 수정",
 *   errorTitle: "주문 수정 오류",
 *   onSuccessCallback: async (response) => {
 *     // 성공 시 추가 처리
 *     await queryClient.invalidateQueries(["orders"]);
 *     onClose();
 *   },
 *   onErrorCallback: () => {
 *     setIsSubmitting(false);
 *   }
 * });
 *
 * updateOrder(data, errorHandlers);
 * ```
 */
export interface MutationErrorHandlersConfig {
  /** 성공 작업명 (예: "주문 수정") */
  successTitle: string;
  /** 에러 팝업 제목 (기본값: "{successTitle} 오류") */
  errorTitle?: string;
  /** 추가 안내 메시지 */
  helpText?: string;
  /** 성공 시 추가 처리 콜백 */
  onSuccessCallback?: (response: ApiResponse) => void | Promise<void>;
  /** 에러 시 추가 처리 콜백 */
  onErrorCallback?: (message: string) => void;
  /** toast 표시 여부 (기본값: true) */
  showToast?: boolean;
}

export function createMutationErrorHandlers(
  config: MutationErrorHandlersConfig
) {
  const {
    successTitle,
    errorTitle = `${successTitle} 오류`,
    helpText = "문제가 계속되면 관리자에게 문의해주세요.",
    onSuccessCallback,
    onErrorCallback,
    showToast = true,
  } = config;

  return {
    onSuccess: async (response: ApiResponse) => {
      if (response.success) {
        // 성공 처리
        if (onSuccessCallback) {
          await onSuccessCallback(response);
        }
      } else {
        // response.success = false인 경우
        handleApiResponseError(
          response,
          {
            title: `❌ ${successTitle} 실패`,
            helpText,
            showToast,
          },
          onErrorCallback
        );
      }
    },
    onError: (error: any) => {
      // 네트워크/서버 에러
      handleApiRequestError(
        error,
        {
          title: `❌ ${errorTitle}`,
          helpText,
          showToast,
        },
        onErrorCallback
      );
    },
  };
}

/**
 * 간단한 에러 처리 (toast만 표시)
 *
 * @param error - 에러 객체
 * @param defaultMessage - 기본 에러 메시지
 *
 * @example
 * ```typescript
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   showSimpleError(error, "데이터 로드 실패");
 * }
 * ```
 */
export function showSimpleError(
  error: any,
  defaultMessage: string = "오류가 발생했습니다."
): void {
  const errorMessage = extractErrorMessage(error, defaultMessage);
  console.error("[Simple Error]", error);
  toast.error(errorMessage);
}
