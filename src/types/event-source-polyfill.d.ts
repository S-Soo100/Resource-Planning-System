/**
 * event-source-polyfill 타입 정의
 */

declare module 'event-source-polyfill' {
  export interface EventSourcePolyfillInit {
    headers?: Record<string, string>;
    withCredentials?: boolean;
    heartbeatTimeout?: number;
  }

  export class EventSourcePolyfill extends EventTarget {
    static readonly CONNECTING: 0;
    static readonly OPEN: 1;
    static readonly CLOSED: 2;

    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSED: 2;

    readonly url: string;
    readonly readyState: 0 | 1 | 2;
    readonly withCredentials: boolean;

    onopen: ((this: EventSourcePolyfill, ev: Event) => any) | null;
    onmessage: ((this: EventSourcePolyfill, ev: MessageEvent) => any) | null;
    onerror: ((this: EventSourcePolyfill, ev: Event) => any) | null;

    constructor(url: string, eventSourceInitDict?: EventSourcePolyfillInit);

    close(): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void;
  }
}
