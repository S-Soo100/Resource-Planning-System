import { IUser } from "@/types/(auth)/user";
import { Warehouse } from "@/types/warehouse";

/**
 * 사용자가 특정 창고에 접근할 수 있는지 확인
 * @param user 현재 사용자
 * @param warehouseId 확인할 창고 ID
 * @returns 접근 가능 여부
 */
export function hasWarehouseAccess(user: IUser, warehouseId: number): boolean {
  // Admin은 모든 창고에 접근 가능
  if (user.accessLevel === "admin") {
    return true;
  }

  // restrictedWhs가 없거나 빈 문자열이거나 빈 배열인 경우 모든 창고 접근 가능
  if (
    !user.restrictedWhs ||
    user.restrictedWhs === "" ||
    (Array.isArray(user.restrictedWhs) && user.restrictedWhs.length === 0)
  ) {
    return true;
  }

  // restrictedWhs 배열을 number[]로 변환하여 체크
  let restrictedWarehouseIds: number[] = [];

  if (typeof user.restrictedWhs === "string") {
    if (user.restrictedWhs.trim() === "") {
      return true; // 빈 문자열인 경우 제한 없음
    }
    restrictedWarehouseIds = user.restrictedWhs
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
  } else if (Array.isArray(user.restrictedWhs)) {
    restrictedWarehouseIds = user.restrictedWhs.map((id) =>
      typeof id === "string" ? parseInt(id) : id
    );
  }

  // 제한된 창고 목록에 포함되어 있으면 접근 불가
  return !restrictedWarehouseIds.includes(warehouseId);
}

/**
 * 사용자가 접근 가능한 창고만 필터링
 * @param user 현재 사용자
 * @param warehouses 전체 창고 목록
 * @returns 접근 가능한 창고 목록
 */
export function filterAccessibleWarehouses(
  user: IUser,
  warehouses: Warehouse[]
): Warehouse[] {
  if (!user || !warehouses) {
    return [];
  }

  return warehouses.filter((warehouse) =>
    hasWarehouseAccess(user, warehouse.id)
  );
}

/**
 * 사용자에게 제한된 창고 목록을 반환
 * @param user 현재 사용자
 * @returns 제한된 창고 ID 목록
 */
export function getRestrictedWarehouseIds(user: IUser): number[] {
  if (
    !user.restrictedWhs ||
    user.restrictedWhs === "" ||
    (Array.isArray(user.restrictedWhs) && user.restrictedWhs.length === 0)
  ) {
    return [];
  }

  if (typeof user.restrictedWhs === "string") {
    if (user.restrictedWhs.trim() === "") {
      return [];
    }
    return user.restrictedWhs
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
  } else if (Array.isArray(user.restrictedWhs)) {
    return user.restrictedWhs.map((id) =>
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
