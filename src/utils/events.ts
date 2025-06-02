/**
 * 이벤트 기반 상태 관리를 위한 Event Emitter
 * Store 간 직접 의존성을 제거하고 느슨한 결합을 제공합니다.
 */

type EventCallback = (...args: unknown[]) => void;

class EventEmitter {
  private events: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string, ...args: unknown[]) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  once(event: string, callback: EventCallback) {
    const onceWrapper = (...args: unknown[]) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
}

// 전역 이벤트 인스턴스
export const globalEvents = new EventEmitter();

/**
 * 상태 관리 관련 이벤트들
 */
export const EVENTS = {
  // 인증 관련
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_TEAM_CHANGED: "auth:team-changed",
  AUTH_TEAM_RESET: "auth:team-reset",

  // 데이터 정리 관련
  DATA_RESET_ALL: "data:reset-all",
  DATA_RESET_TEAM_DEPENDENT: "data:reset-team-dependent",

  // 카테고리 관련
  CATEGORY_RESET: "category:reset",
  CATEGORY_INVALIDATE: "category:invalidate",
} as const;

/**
 * 타입 안전성을 위한 이벤트 데이터 타입들
 */
export type EventPayloads = {
  [EVENTS.AUTH_LOGIN]: { userId: number; teamId?: number };
  [EVENTS.AUTH_LOGOUT]: void;
  [EVENTS.AUTH_TEAM_CHANGED]: { teamId: number; teamName: string };
  [EVENTS.AUTH_TEAM_RESET]: void;
  [EVENTS.DATA_RESET_ALL]: void;
  [EVENTS.DATA_RESET_TEAM_DEPENDENT]: void;
  [EVENTS.CATEGORY_RESET]: void;
  [EVENTS.CATEGORY_INVALIDATE]: { teamId?: number };
};

/**
 * 타입 안전한 이벤트 발행 함수
 */
export const emitEvent = <T extends keyof EventPayloads>(
  event: T,
  ...args: EventPayloads[T] extends void ? [] : [EventPayloads[T]]
) => {
  globalEvents.emit(event, ...args);
};

/**
 * 타입 안전한 이벤트 구독 함수
 */
export const subscribeToEvent = <T extends keyof EventPayloads>(
  event: T,
  callback: EventPayloads[T] extends void
    ? () => void
    : (payload: EventPayloads[T]) => void
) => {
  globalEvents.on(event, callback as EventCallback);

  // 구독 해제 함수 반환
  return () => {
    globalEvents.off(event, callback as EventCallback);
  };
};
