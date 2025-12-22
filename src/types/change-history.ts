/**
 * 변경 이력 관련 TypeScript 타입 정의
 * @see /docs/user log notice api/CHANGE_HISTORY_API 1.md
 * @see /docs/user log notice api/CHANGE_HISTORY_API 2.md (v3.0)
 */

/**
 * 변경 액션 타입
 */
export type ChangeAction =
  | 'create' // 생성
  | 'update' // 수정
  | 'status_change' // 상태 변경
  | 'delete' // 삭제
  | 'quantity_change'; // 재고 변동

/**
 * 사용자 권한 레벨
 */
export type AccessLevel = 'user' | 'moderator' | 'admin';

/**
 * 변경 이력 아이템
 */
export interface ChangeHistoryItem {
  /** 이력 고유 ID */
  id: number;

  /** 변경 유형 */
  action: ChangeAction;

  /** 변경된 필드명 (영문) */
  field: string | null;

  /** 변경된 필드명 (한글) */
  fieldLabel: string | null;

  /** 이전 값 ({ fieldName: value } 형태) */
  oldValue: Record<string, any> | null;

  /** 새 값 ({ fieldName: value } 형태) */
  newValue: Record<string, any> | null;

  /** 변경자 이름 */
  userName: string;

  /** 변경자 이메일 */
  userEmail: string;

  /** 변경자 권한 */
  accessLevel: AccessLevel;

  /** 변경 사유 (선택 입력) */
  remarks: string | null;

  /** 변경 일시 (ISO8601 형식) */
  createdAt: string;
}

/**
 * 페이지네이션 메타데이터
 */
export interface ChangeHistoryMeta {
  /** 전체 항목 수 */
  total: number;

  /** 현재 페이지 */
  page: number;

  /** 페이지당 항목 수 */
  limit: number;

  /** 전체 페이지 수 */
  totalPages: number;
}

/**
 * 변경 이력 API 응답
 */
export interface ChangeHistoryResponse {
  /** 변경 이력 목록 */
  data: ChangeHistoryItem[];

  /** 페이지네이션 정보 */
  meta: ChangeHistoryMeta;
}

/**
 * 변경 이력 조회 파라미터
 */
export interface ChangeHistoryParams {
  /** 페이지 번호 */
  page?: number;

  /** 페이지당 항목 수 */
  limit?: number;

  /** 필터링할 액션 타입 */
  action?: ChangeAction;
}

// ============================================================================
// v3.0: 팀별 SSE 스트림 타입 정의
// ============================================================================

/**
 * 엔티티 타입 (v3.0)
 */
export type EntityType = 'demo' | 'order' | 'item';

/**
 * 팀별 SSE 변경 이벤트 (v3.0)
 */
export interface TeamHistoryEvent {
  /** 엔티티 타입 */
  entityType: EntityType;

  /** 엔티티 ID */
  entityId: number;

  /** 팀 ID */
  teamId: number;

  /** 이력 ID */
  id: number;

  /** 변경 유형 */
  action: ChangeAction;

  /** 변경된 필드명 (영문) */
  field?: string;

  /** 변경된 필드명 (한글) */
  fieldLabel?: string;

  /** 이전 값 */
  oldValue?: Record<string, any>;

  /** 새 값 */
  newValue?: Record<string, any>;

  /** 변경자 이름 */
  userName: string;

  /** 변경자 이메일 */
  userEmail: string;

  /** 변경자 권한 */
  accessLevel: AccessLevel;

  /** 변경 사유 */
  remarks?: string;

  /** 변경 일시 (ISO8601 형식) */
  createdAt: string;
}

/**
 * SSE Heartbeat 이벤트 (v3.0)
 */
export interface HeartbeatEvent {
  /** 이벤트 타입 */
  type: 'heartbeat';

  /** 서버 시간 (ISO8601 형식) */
  timestamp: string;
}

/**
 * 팀별 SSE 이벤트 유니온 타입 (v3.0)
 */
export type TeamSSEEvent = TeamHistoryEvent | HeartbeatEvent;
