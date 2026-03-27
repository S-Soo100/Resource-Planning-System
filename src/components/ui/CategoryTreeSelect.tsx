"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Check, X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { useCategoryTree } from "@/hooks/useCategoryTree";
import { Category } from "@/types/(item)/category";

// ── 타입 ──

interface CategoryTreeSelectFilterProps {
  mode: "filter";
  value: number[] | undefined;
  onChange: (value: number[] | undefined) => void;
  teamId: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface CategoryTreeSelectAssignProps {
  mode: "assign";
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  teamId: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onCreateCategory?: (
    name: string,
    parentId?: number
  ) => Promise<number | undefined>;
}

export type CategoryTreeSelectProps =
  | CategoryTreeSelectFilterProps
  | CategoryTreeSelectAssignProps;

// ── 유틸 ──

/** 부모 카테고리의 모든 자식 ID를 재귀적으로 수집 */
const collectChildIds = (category: Category): number[] => {
  const ids: number[] = [];
  if (category.children && category.children.length > 0) {
    for (const child of category.children) {
      ids.push(child.id);
      ids.push(...collectChildIds(child));
    }
  }
  return ids;
};

/** 트리에서 ID로 카테고리 찾기 */
const findCategoryById = (
  tree: Category[],
  id: number
): Category | undefined => {
  for (const cat of tree) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const found = findCategoryById(cat.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

/** 트리의 모든 카테고리를 플랫 배열로 */
const flattenTree = (tree: Category[]): Category[] => {
  const result: Category[] = [];
  for (const cat of tree) {
    result.push(cat);
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenTree(cat.children));
    }
  }
  return result;
};

// ── 컴포넌트 ──

/**
 * 계층형 카테고리 트리 셀렉트 (v4.0)
 *
 * - filter 모드: 다중 선택 (체크박스), "전체" 옵션, 부모 선택 시 자식 자동 포함
 * - assign 모드: 단일 선택, 부모/자식 모두 선택 가능
 */
const CategoryTreeSelect: React.FC<CategoryTreeSelectProps> = (props) => {
  const { mode, teamId, placeholder, className, disabled = false } = props;
  const onCreateCategory =
    mode === "assign" ? props.onCreateCategory : undefined;
  const assignOnChange =
    mode === "assign"
      ? (props.onChange as (v: number | undefined) => void)
      : undefined;

  const { data: tree = [], isLoading } = useCategoryTree(teamId);

  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 인라인 생성 폼 상태
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState<
    number | undefined
  >(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  // 플랫 목록 (키보드 탐색용)
  const flatItems = useMemo(() => flattenTree(tree), [tree]);

  // 최상위 카테고리만 추출 (부모 선택 드롭다운용)
  const topLevelCategories = useMemo(
    () => tree.filter((cat) => !cat.parentId),
    [tree]
  );

  const resetCreateForm = useCallback(() => {
    setShowCreateForm(false);
    setNewCategoryName("");
    setNewCategoryParentId(undefined);
    setCreateError(null);
  }, []);

  const handleCreateSubmit = useCallback(async () => {
    if (!onCreateCategory) return;
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const newId = await onCreateCategory(trimmedName, newCategoryParentId);
      if (newId !== undefined) {
        // 성공: 폼 닫기 + 자동 선택 + 드롭다운 닫기
        resetCreateForm();
        if (mode === "assign" && assignOnChange) {
          assignOnChange(newId);
        }
        setIsOpen(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "카테고리 생성에 실패했습니다";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  }, [
    onCreateCategory,
    newCategoryName,
    newCategoryParentId,
    resetCreateForm,
    mode,
    assignOnChange,
  ]);

  // ── 외부 클릭으로 닫기 ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        resetCreateForm();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [resetCreateForm]);

  // ── 생성 폼 input 자동 포커스 ──
  useEffect(() => {
    if (showCreateForm && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [showCreateForm]);

  // ── 포커스 스크롤 ──
  useEffect(() => {
    if (focusIndex >= 0 && listRef.current) {
      const item = listRef.current.children[
        mode === "filter" ? focusIndex + 1 : focusIndex
      ] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusIndex, mode]);

  // ── filter 모드 핸들러 ──

  const selectedFilterIds: number[] =
    mode === "filter" ? (props.value ?? []) : [];

  const handleFilterToggle = useCallback(
    (category: Category) => {
      if (mode !== "filter") return;
      const onChange = props.onChange as (v: number[] | undefined) => void;
      const currentIds = new Set(selectedFilterIds);
      const selfAndChildIds = [category.id, ...collectChildIds(category)];

      const allSelected = selfAndChildIds.every((id) => currentIds.has(id));

      if (allSelected) {
        // 해제: 자신 + 자식 모두 제거
        for (const id of selfAndChildIds) {
          currentIds.delete(id);
        }
      } else {
        // 선택: 자신 + 자식 모두 추가
        for (const id of selfAndChildIds) {
          currentIds.add(id);
        }
      }

      const result = Array.from(currentIds);
      onChange(result.length > 0 ? result : undefined);
    },
    [mode, props, selectedFilterIds]
  );

  const handleSelectAll = useCallback(() => {
    if (mode !== "filter") return;
    const onChange = props.onChange as (v: number[] | undefined) => void;
    const allIds = flatItems.map((c) => c.id);
    const allSelected = allIds.every((id) => selectedFilterIds.includes(id));

    if (allSelected) {
      onChange(undefined);
    } else {
      onChange(allIds);
    }
  }, [mode, props, flatItems, selectedFilterIds]);

  const isAllSelected =
    mode === "filter" &&
    flatItems.length > 0 &&
    flatItems.every((c) => selectedFilterIds.includes(c.id));

  // ── assign 모드 핸들러 ──

  const selectedAssignId: number | undefined =
    mode === "assign" ? (props.value as number | undefined) : undefined;

  const handleAssignSelect = useCallback(
    (category: Category) => {
      if (mode !== "assign" || !assignOnChange) return;

      if (selectedAssignId === category.id) {
        assignOnChange(undefined);
      } else {
        assignOnChange(category.id);
      }
      setIsOpen(false);
    },
    [mode, assignOnChange, selectedAssignId]
  );

  // ── 키보드 핸들링 ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusIndex(0);
        } else if (focusIndex >= 0 && focusIndex < flatItems.length) {
          const target = flatItems[focusIndex];
          if (mode === "filter") {
            handleFilterToggle(target);
          } else {
            handleAssignSelect(target);
          }
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusIndex(0);
        } else {
          setFocusIndex((prev) =>
            prev < flatItems.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusIndex(-1);
        break;
    }
  };

  // ── 표시 텍스트 ──
  const displayText = useMemo(() => {
    if (mode === "filter") {
      if (!selectedFilterIds.length) return placeholder ?? "카테고리 선택";
      if (isAllSelected) return "전체";
      // 선택된 부모만 표시 (자식이 모두 포함된 경우)
      const names = selectedFilterIds
        .map((id) => findCategoryById(tree, id)?.name)
        .filter(Boolean);
      if (names.length <= 2) return names.join(", ");
      return `${names[0]} 외 ${names.length - 1}개`;
    }

    if (selectedAssignId !== undefined) {
      return (
        findCategoryById(tree, selectedAssignId)?.name ??
        placeholder ??
        "카테고리 선택"
      );
    }
    return placeholder ?? "카테고리 선택";
  }, [
    mode,
    selectedFilterIds,
    selectedAssignId,
    tree,
    isAllSelected,
    placeholder,
  ]);

  // ── 카테고리 행 렌더 ──
  const renderCategory = (category: Category, depth: number = 0) => {
    const isParent =
      category.children !== undefined && category.children.length > 0;
    const flatIndex = flatItems.findIndex((c) => c.id === category.id);
    const isFocused = focusIndex === flatIndex;

    if (mode === "filter") {
      const selfAndChildIds = [category.id, ...collectChildIds(category)];
      const allChecked = selfAndChildIds.every((id) =>
        selectedFilterIds.includes(id)
      );
      const someChecked =
        !allChecked &&
        selfAndChildIds.some((id) => selectedFilterIds.includes(id));

      return (
        <React.Fragment key={category.id}>
          <li
            role="option"
            aria-selected={allChecked}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm transition-colors",
              isFocused && "bg-Back-Mid-20",
              !isFocused && "hover:bg-Back-Low-10"
            )}
            style={{ paddingLeft: `${12 + depth * 20}px` }}
            onClick={() => handleFilterToggle(category)}
          >
            <span
              className={cn(
                "flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                allChecked
                  ? "bg-Primary-Main border-Primary-Main"
                  : someChecked
                    ? "bg-Primary-Main/30 border-Primary-Main"
                    : "border-Outline-Variant bg-white"
              )}
            >
              {(allChecked || someChecked) && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </span>
            <span className={cn(isParent && "font-semibold")}>
              {category.name}
            </span>
          </li>
          {isParent &&
            category.children!.map((child) => renderCategory(child, depth + 1))}
        </React.Fragment>
      );
    }

    // assign 모드
    const isSelected = selectedAssignId === category.id;

    return (
      <React.Fragment key={category.id}>
        <li
          role="option"
          aria-selected={isSelected}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm transition-colors",
            isSelected && "bg-Primary-Main/10 text-Primary-Main",
            isFocused && !isSelected && "bg-Back-Mid-20",
            !isFocused && !isSelected && "hover:bg-Back-Low-10"
          )}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
          onClick={() => handleAssignSelect(category)}
        >
          <span className={cn(isParent && "font-semibold")}>
            {category.name}
          </span>
          {isSelected && (
            <Check className="w-3.5 h-3.5 text-Primary-Main ml-auto" />
          )}
        </li>
        {isParent &&
          category.children!.map((child) => renderCategory(child, depth + 1))}
      </React.Fragment>
    );
  };

  // ── 메인 렌더 ──
  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onKeyDown={handleKeyDown}
    >
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full rounded-md border border-Outline-Variant bg-white px-3 py-2 text-sm text-left transition-colors",
          "focus:border-Primary-Main focus:outline-none focus:ring-2 focus:ring-Primary-Main/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-Back-Mid-20",
          isOpen && "border-Primary-Main ring-2 ring-Primary-Main/20"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={disabled ? -1 : 0}
      >
        <span
          className={cn(
            "truncate",
            !selectedFilterIds.length &&
              selectedAssignId === undefined &&
              "text-Text-Lowest-60"
          )}
        >
          {displayText}
        </span>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {/* filter 모드: 선택 초기화 버튼 */}
          {mode === "filter" && selectedFilterIds.length > 0 && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              className="p-0.5 rounded-full hover:bg-Back-Mid-20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                (props.onChange as (v: number[] | undefined) => void)(
                  undefined
                );
              }}
            >
              <X className="w-3.5 h-3.5 text-Text-Low-70" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-Text-Lowest-60 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-Outline-Variant bg-white shadow-lg flex flex-col">
          <ul
            ref={listRef}
            role="listbox"
            aria-multiselectable={mode === "filter"}
            className="max-h-60 overflow-auto"
          >
            {isLoading && (
              <li className="px-3 py-2 text-sm text-Text-Lowest-60">
                불러오는 중...
              </li>
            )}

            {!isLoading && flatItems.length === 0 && (
              <li className="px-3 py-2 text-sm text-Text-Lowest-60">
                카테고리가 없습니다
              </li>
            )}

            {!isLoading && flatItems.length > 0 && (
              <>
                {/* filter 모드: "전체" 옵션 */}
                {mode === "filter" && (
                  <li
                    role="option"
                    aria-selected={isAllSelected}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm font-semibold border-b border-Outline-Variant transition-colors hover:bg-Back-Low-10"
                    )}
                    onClick={handleSelectAll}
                  >
                    <span
                      className={cn(
                        "flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        isAllSelected
                          ? "bg-Primary-Main border-Primary-Main"
                          : "border-Outline-Variant bg-white"
                      )}
                    >
                      {isAllSelected && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </span>
                    <span>전체</span>
                  </li>
                )}

                {tree.map((category) => renderCategory(category, 0))}
              </>
            )}
          </ul>

          {/* 인라인 카테고리 생성 폼 (assign 모드 + onCreateCategory prop 있을 때만) */}
          {onCreateCategory && (
            <div className="border-t border-Outline-Variant bg-white rounded-b-md">
              {!showCreateForm ? (
                <button
                  type="button"
                  className="flex items-center gap-1.5 w-full px-3 py-2 text-sm text-Primary-Main hover:bg-Back-Low-10 transition-colors"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 카테고리</span>
                </button>
              ) : (
                <div className="px-3 py-2 flex flex-col gap-2">
                  <input
                    ref={createInputRef}
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateSubmit();
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        e.stopPropagation();
                        resetCreateForm();
                      }
                    }}
                    placeholder="카테고리명"
                    className="w-full px-2 py-1.5 text-sm border border-Outline-Variant rounded focus:border-Primary-Main focus:ring-1 focus:ring-Primary-Main/20 focus:outline-none"
                    disabled={isCreating}
                  />
                  <select
                    value={newCategoryParentId ?? ""}
                    onChange={(e) =>
                      setNewCategoryParentId(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full px-2 py-1.5 text-sm border border-Outline-Variant rounded focus:border-Primary-Main focus:ring-1 focus:ring-Primary-Main/20 focus:outline-none bg-white"
                    disabled={isCreating}
                  >
                    <option value="">없음 (최상위)</option>
                    {topLevelCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {createError && (
                    <p className="text-xs text-red-500">{createError}</p>
                  )}
                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={resetCreateForm}
                      disabled={isCreating}
                      className="px-2.5 py-1 text-xs rounded border border-Outline-Variant text-Text-Low-70 hover:bg-Back-Low-10 transition-colors disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateSubmit}
                      disabled={isCreating || !newCategoryName.trim()}
                      className="px-2.5 py-1 text-xs rounded bg-Primary-Main text-white hover:bg-Primary-Main/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {isCreating && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                      확인
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { CategoryTreeSelect };
