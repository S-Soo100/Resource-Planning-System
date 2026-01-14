/**
 * 팀별 변경 이력 SSE (Server-Sent Events) 실시간 알림 훅 (v3.1 - EventSourcePolyfill)
 * @see /docs/user log notice api/CHANGE_HISTORY_API 2.md
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { getToken } from '@/api/cookie-api';
import type { TeamSSEEvent, TeamHistoryEvent, EntityType } from '@/types/change-history';
import { getActionLabel, getEntityTypeLabel } from '@/utils/changeHistory';

/**
 * 팀별 SSE 훅 옵션
 */
export interface UseTeamChangeHistorySSEOptions {
  /** 활성화 여부 */
  enabled?: boolean;
  /** 필터링할 엔티티 타입 */
  types?: EntityType[];
  /** 변경 이벤트 콜백 */
  onEvent?: (event: TeamHistoryEvent) => void;
  /** Heartbeat 콜백 */
  onHeartbeat?: (timestamp: string) => void;
  /** 에러 콜백 */
  onError?: (error: Event) => void;
}

/**
 * 팀별 변경 이력 SSE 훅 (v3.0)
 * @param teamId 팀 ID
 * @param options 옵션
 */
export const useTeamChangeHistorySSE = (
  teamId: number,
  options: UseTeamChangeHistorySSEOptions = {}
) => {
  const {
    enabled = true,
    types,
    onEvent,
    onHeartbeat,
    onError,
  } = options;

  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);

  useEffect(() => {
    // 비활성화 상태거나 팀 ID가 없으면 연결 안 함
    if (!enabled || !teamId) return;

    // 인증 토큰 가져오기
    const token = getToken();

    if (!token) {
      console.warn('[Team SSE] 토큰이 없어 연결하지 않음');
      return;
    }

    // URL 생성
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const typesParam = types ? `?types=${types.join(',')}` : '';
    const sseUrl = `${apiUrl}/change-history/team/${teamId}/stream${typesParam}`;

    console.log(`[Team SSE] 연결 시작: Team ${teamId}`, types || 'all types');

    // EventSourcePolyfill 생성 (Authorization 헤더 지원)
    const eventSource = new EventSourcePolyfill(sseUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    eventSourceRef.current = eventSource;

    // 연결 성공
    eventSource.addEventListener('open', () => {
      console.log(`[Team SSE] 연결 성공: Team ${teamId}`);
    });

    // 메시지 수신 (변경 + heartbeat)
    eventSource.onmessage = (event) => {
      try {
        const data: TeamSSEEvent = JSON.parse(event.data);

        // Heartbeat 처리
        if ('type' in data && data.type === 'heartbeat') {
          console.log(`[Team SSE] Heartbeat:`, data.timestamp);
          onHeartbeat?.(data.timestamp);
          return;
        }

        // 변경 이벤트 처리
        const teamEvent = data as TeamHistoryEvent;
        console.log(`[Team SSE] 변경 이벤트:`, teamEvent);

        // 콜백 실행
        onEvent?.(teamEvent);

        // 토스트 알림
        message.info({
          content: `[${getEntityTypeLabel(teamEvent.entityType)}] ${teamEvent.userName}님이 ${getActionLabel(teamEvent.action)}했습니다`,
          duration: 3,
        });

        // React Query 캐시 무효화 (선택적)
        // queryClient.invalidateQueries(['teamChangeHistory', teamId]);
      } catch (error) {
        console.error('[Team SSE] 메시지 파싱 오류:', error);
      }
    };

    // 에러 처리
    eventSource.onerror = (error) => {
      console.error(`[Team SSE] 연결 오류:`, error);
      onError?.(error);

      if (eventSource.readyState === EventSourcePolyfill.CLOSED) {
        console.log('[Team SSE] 연결이 종료되었습니다.');
      }
    };

    // Cleanup: 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (eventSourceRef.current) {
        console.log(`[Team SSE] 연결 종료: Team ${teamId}`);
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [teamId, enabled, types, queryClient, onEvent, onHeartbeat, onError]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSourcePolyfill.OPEN,
  };
};
