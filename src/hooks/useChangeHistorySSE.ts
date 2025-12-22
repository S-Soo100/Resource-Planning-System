/**
 * 변경 이력 SSE (Server-Sent Events) 실시간 알림 훅
 * @see /docs/user log notice api/CHANGE_HISTORY_API 1.md
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getToken } from '@/api/cookie-api';
import type { ChangeHistoryItem, ChangeHistoryResponse } from '@/types/change-history';
import { getActionLabel } from '@/utils/changeHistory';

/**
 * SSE 연결 타입
 */
type SSEType = 'order' | 'demo' | 'item';

/**
 * SSE 이벤트 데이터
 */
interface SSEEventData {
  timestamp?: string;
}

/**
 * 변경 이력 SSE 훅
 * @param type 연결 타입 (order/demo/item)
 * @param id 대상 ID
 * @param enabled 활성화 여부 (기본: true)
 */
export const useChangeHistorySSE = (
  type: SSEType,
  id: number,
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // 비활성화 상태거나 ID가 없으면 연결 안 함
    if (!enabled || !id) return;

    // 인증 토큰 가져오기
    const token = getToken();

    if (!token) {
      // 토큰이 없으면 SSE 연결하지 않음 (로그인 전에는 정상)
      return;
    }

    // EventSource는 헤더 설정을 지원하지 않으므로, 토큰을 쿼리 파라미터로 전달
    // 실제 구현에서는 백엔드와 협의하여 안전한 방식으로 변경 필요
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const sseUrl = `${apiUrl}/change-history/${type}/${id}/stream?token=${token}`;

    console.log(`[SSE] 연결 시작: ${type}/${id}`);

    // EventSource 생성
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    // 연결 성공
    eventSource.addEventListener('open', () => {
      console.log(`[SSE] 연결 성공: ${type}/${id}`);
    });

    // 변경 이벤트 수신
    eventSource.addEventListener('change', (event) => {
      try {
        const newChange: ChangeHistoryItem = JSON.parse(event.data);
        console.log(`[SSE] 변경 이벤트 수신:`, newChange);

        // React Query 캐시 업데이트
        const queryKey = [`${type}ChangeHistory`, id];
        queryClient.setQueryData<ChangeHistoryResponse>(
          queryKey,
          (old) => {
            if (!old) return old;

            return {
              ...old,
              data: [newChange, ...old.data],
              meta: {
                ...old.meta,
                total: old.meta.total + 1,
              },
            };
          }
        );

        // 토스트 알림 표시
        message.info({
          content: `${newChange.userName}님이 ${getActionLabel(newChange.action)}했습니다`,
          duration: 3,
        });
      } catch (error) {
        console.error('[SSE] 변경 이벤트 파싱 오류:', error);
      }
    });

    // Heartbeat 이벤트 (연결 유지 확인)
    eventSource.addEventListener('heartbeat', (event) => {
      try {
        const data: SSEEventData = JSON.parse(event.data);
        console.log(`[SSE] Heartbeat 수신:`, data.timestamp);
      } catch (error) {
        console.error('[SSE] Heartbeat 파싱 오류:', error);
      }
    });

    // 에러 처리
    eventSource.addEventListener('error', (error) => {
      console.error(`[SSE] 연결 오류:`, error);

      // 연결 종료
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('[SSE] 연결이 종료되었습니다.');
      }

      // 연결 재시도는 브라우저가 자동으로 처리
      // 하지만 토큰 만료 등의 문제가 있을 수 있으므로 필요시 재연결 로직 추가
    });

    // Cleanup: 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (eventSourceRef.current) {
        console.log(`[SSE] 연결 종료: ${type}/${id}`);
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [type, id, enabled, queryClient]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  };
};
