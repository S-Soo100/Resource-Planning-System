import { Warehouse } from "@/types/warehouse";

/**
 * 창고 권한 체크에 필요한 컨텍스트
 * usePermission() 훅의 반환값에서 { isAdmin, restrictedWhs }를 전달
 */
interface WarehousePermissionContext {
  isAdmin: boolean;
  restrictedWhs: string | number[] | null;
}

/**
 * 사용자가 특정 창고에 접근할 수 있는지 확인
 * @param context 권한 컨텍스트 (usePermission()에서 제공)
 * @param warehouseId 확인할 창고 ID
 * @returns 접근 가능 여부
 */
export function hasWarehouseAccess(
  context: WarehousePermissionContext,
  warehouseId: number
): boolean {
  // Admin은 모든 창고에 접근 가능
  if (context.isAdmin) {
    return true;
  }

  // 제한된 창고 ID 목록 가져오기
  const restrictedIds = getRestrictedWarehouseIds(context.restrictedWhs);

  // 제한된 창고 목록이 없으면 모든 창고 접근 가능
  if (restrictedIds.length === 0) {
    return true;
  }

  // 해당 창고가 제한 목록에 없으면 접근 가능
  return !restrictedIds.includes(warehouseId);
}

/**
 * 사용자가 접근 가능한 창고만 필터링
 * @param context 권한 컨텍스트 (usePermission()에서 제공)
 * @param warehouses 전체 창고 목록
 * @returns 접근 가능한 창고 목록
 */
export function filterAccessibleWarehouses(
  context: WarehousePermissionContext,
  warehouses: Warehouse[]
): Warehouse[] {
  if (!warehouses || warehouses.length === 0) {
    return [];
  }

  // Admin은 모든 창고 접근 가능
  if (context.isAdmin) {
    return warehouses;
  }

  // 제한된 창고 ID 목록 가져오기
  const restrictedIds = getRestrictedWarehouseIds(context.restrictedWhs);

  // 제한된 창고 목록이 없으면 모든 창고 반환
  if (restrictedIds.length === 0) {
    return warehouses;
  }

  // 제한된 창고를 제외한 목록 반환
  return warehouses.filter(
    (warehouse) => !restrictedIds.includes(warehouse.id)
  );
}

/**
 * 제한된 창고 ID 목록을 파싱하여 반환
 * @param restrictedWhs 제한된 창고 (문자열 "1,3,5" 또는 숫자 배열)
 * @returns 제한된 창고 ID 목록
 */
export function getRestrictedWarehouseIds(
  restrictedWhs: string | number[] | null
): number[] {
  if (
    !restrictedWhs ||
    restrictedWhs === "" ||
    (Array.isArray(restrictedWhs) && restrictedWhs.length === 0)
  ) {
    return [];
  }

  if (typeof restrictedWhs === "string") {
    if (restrictedWhs.trim() === "") {
      return [];
    }
    return restrictedWhs
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
  } else if (Array.isArray(restrictedWhs)) {
    return restrictedWhs.map((id) =>
      typeof id === "string" ? parseInt(id) : id
    );
  }

  return [];
}

/**
 * 창고 접근 제한 메시지 생성
 * @param warehouseName 창고명
 * @returns 제한 메시지
 */
export function getWarehouseAccessDeniedMessage(warehouseName: string): string {
  return `'${warehouseName}' 창고에 대한 접근 권한이 없습니다.`;
}
