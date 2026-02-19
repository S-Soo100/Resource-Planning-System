"use client";

import React, { useState } from "react";
import { usePackages } from "@/hooks/usePackages";
import { useTeamItems } from "@/hooks/useTeamItems";
import {
  CreateIPackageDto,
  UpdatePackageDto,
  PackageApi,
} from "@/types/(item)/package";
import { TeamItem } from "@/types/(item)/team-item";
import { authStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft, Package, Calendar, Edit2, Trash2, X, Plus, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { navigateByAuthStatus } from "@/utils/navigation";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { LoadingCentered } from "@/components/ui/Loading";

// 모달 컴포넌트
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg mx-4 overflow-hidden shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-Outline-Variant">
          <h2 className="text-lg font-semibold text-Text-Highest-100">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-Back-Low-10 text-Text-Low-70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default function PacakgePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  // usePackages 훅 수정
  const packageHooks = usePackages();
  const getPackages = packageHooks.useGetPackages();
  const packages = getPackages.packages || [];
  const isLoading = getPackages.isLoading;
  const error = getPackages.error;

  const createPackageMutation = packageHooks.useCreatePackage();
  const updatePackageMutation = packageHooks.useUpdatePackage();
  const deletePackageMutation = packageHooks.useDeletePackage();

  // useTeamItems 훅 수정
  const getTeamItems = useTeamItems().useGetTeamItems();
  const teamItems = getTeamItems.teamItems || [];
  const isTeamItemsLoading = getTeamItems.isLoading;

  // useWarehouseItems 훅 추가 (itemCode -> itemId 매핑용)
  const { items: warehouseItems, isLoading: isWarehouseItemsLoading } = useWarehouseItems();

  const selectedTeamId = authStore((state) => state.selectedTeam?.id);

  // 모달 상태 관리
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 새 패키지 상태 관리
  const [newPackageName, setNewPackageName] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // itemCode 배열

  // 수정 모드 상태 관리
  const [editMode, setEditMode] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState("");
  const [editPackageName, setEditPackageName] = useState("");
  const [editSelectedItems, setEditSelectedItems] = useState<string[]>([]);

  // 아이템 목록 펼침/접힘 상태 관리
  const [expandedPackages, setExpandedPackages] = useState<
    Record<number, boolean>
  >({});

  // 드래그 상태 관리
  const [draggedPackageId, setDraggedPackageId] = useState<number | null>(null);

  // 아이템 목록 펼침/접힘 토글
  const togglePackageExpand = (packageId: number) => {
    setExpandedPackages((prev) => ({
      ...prev,
      [packageId]: !prev[packageId],
    }));
  };

  // 아이템 선택 관리
  const handleItemSelect = (itemCode: string) => {
    if (selectedItems.includes(itemCode)) {
      setSelectedItems(selectedItems.filter((code) => code !== itemCode));
    } else {
      setSelectedItems([...selectedItems, itemCode]);
    }
  };

  // 수정모드 아이템 선택 관리
  const handleEditItemSelect = (itemCode: string) => {
    if (editSelectedItems.includes(itemCode)) {
      setEditSelectedItems(
        editSelectedItems.filter((code) => code !== itemCode)
      );
    } else {
      setEditSelectedItems([...editSelectedItems, itemCode]);
    }
  };

  // 모달 열기
  const openAddModal = () => {
    setNewPackageName("");
    setSelectedItems([]);
    setIsAddModalOpen(true);
  };

  // 모달 닫기
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  // itemCode를 itemId로 변환하는 헬퍼 함수
  const convertItemCodesToIds = (itemCodes: string[]): number[] => {
    return itemCodes
      .map((code) => {
        const item = warehouseItems.find(
          (item) => item.teamItem.itemCode === code
        );
        return item?.id; // Item의 PK
      })
      .filter((id): id is number => id !== undefined);
  };

  // 패키지 추가 핸들러
  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId) {
      alert("선택된 팀이 없습니다.");
      return;
    }

    if (selectedItems.length === 0) {
      alert("최소 하나 이상의 아이템을 선택해주세요.");
      return;
    }

    // itemCode 배열을 itemId 배열로 변환
    const itemIds = convertItemCodesToIds(selectedItems);

    if (itemIds.length === 0) {
      alert("선택된 아이템을 찾을 수 없습니다.");
      return;
    }

    const packageData: CreateIPackageDto = {
      packageName: newPackageName,
      teamId: Number(selectedTeamId),
      itemIds: itemIds, // itemIds 사용
    };

    const success = await createPackageMutation.createPackageAsync(packageData);
    if (success.success) {
      setNewPackageName("");
      setSelectedItems([]);
      closeAddModal();
      alert("패키지가 추가되었습니다.");
    }
  };

  // 수정 모드 시작 핸들러 - packageItems에서 itemCode 추출
  const handleStartEdit = (pkg: PackageApi) => {
    // packageItems에서 itemCode 추출
    const itemCodes = pkg.packageItems
      .map((pkgItem) => pkgItem.item.teamItem.itemCode)
      .filter((code, index, self) => self.indexOf(code) === index); // 중복 제거

    setEditMode(true);
    setEditingPackageId(pkg.id.toString());
    setEditPackageName(pkg.packageName);
    setEditSelectedItems(itemCodes);
  };

  // 패키지 수정 핸들러
  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editSelectedItems.length === 0) {
      alert("최소 하나 이상의 아이템을 선택해주세요.");
      return;
    }

    // itemCode 배열을 itemId 배열로 변환
    const itemIds = convertItemCodesToIds(editSelectedItems);

    if (itemIds.length === 0) {
      alert("선택된 아이템을 찾을 수 없습니다.");
      return;
    }

    const packageData: UpdatePackageDto = {
      packageName: editPackageName,
      itemIds: itemIds, // itemIds 사용
    };

    const success = await updatePackageMutation.updatePackageAsync({
      id: editingPackageId,
      packageData,
    });

    if (success.success) {
      setEditMode(false);
      setEditingPackageId("");
      setEditPackageName("");
      setEditSelectedItems([]);
      alert("패키지가 수정되었습니다.");
    }
  };

  // 패키지 삭제 핸들러
  const handleDeletePackage = async (packageId: number) => {
    if (window.confirm("정말로 이 패키지를 삭제하시겠습니까?")) {
      const success = await deletePackageMutation.deletePackageAsync(
        packageId.toString()
      );
      if (success.success) {
        alert("패키지가 삭제되었습니다.");
      }
    }
  };

  // 수정 취소 핸들러
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingPackageId("");
    setEditPackageName("");
    setEditSelectedItems([]);
  };

  // 드래그 시작 핸들러
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, packageId: number) => {
    setDraggedPackageId(packageId);
    e.dataTransfer.effectAllowed = "move";
  };

  // 드래그 종료 핸들러
  const handleDragEnd = () => {
    setDraggedPackageId(null);
  };

  // 아이템 코드로 아이템 찾기
  const findItemByCode = (itemCode: string): TeamItem | undefined => {
    return teamItems.find((item) => item.itemCode === itemCode);
  };

  // 패키지의 아이템 목록을 배지 형태로 표시 (packageItems에서 데이터 추출)
  const renderPackageItems = (pkg: PackageApi) => {
    // API 2.0: packageItems가 있으면 사용
    if (pkg.packageItems && pkg.packageItems.length > 0) {
      const packageItems = pkg.packageItems;
      const isExpanded = expandedPackages[pkg.id] || false;
      const displayCount = isExpanded
        ? packageItems.length
        : Math.min(5, packageItems.length);
      const hasMore = packageItems.length > 5;

      return (
        <div>
          <div className="flex flex-wrap gap-1.5">
            {packageItems
              .slice(0, displayCount)
              .filter((pkgItem) => pkgItem.deletedAt === null) // 삭제되지 않은 아이템만
              .map((pkgItem) => (
                <span
                  key={pkgItem.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-Primary-Container text-Primary-Main"
                  title={`${pkgItem.item.teamItem.itemName} (${pkgItem.item.teamItem.itemCode})`}
                >
                  {pkgItem.item.teamItem.itemName}
                </span>
              ))}
          </div>

          {hasMore && (
            <button
              onClick={() => togglePackageExpand(pkg.id)}
              className="mt-2 text-xs text-Primary-Main hover:text-Primary-Main/80 focus:outline-none font-medium"
            >
              {isExpanded ? "접기" : `+ ${packageItems.length - 5}개 더 보기`}
            </button>
          )}
        </div>
      );
    }

    // Fallback: 구버전 itemlist 문자열 파싱
    if (pkg.itemlist) {
      const itemCodes = pkg.itemlist.split(',').map(code => code.trim()).filter(code => code);
      const isExpanded = expandedPackages[pkg.id] || false;
      const displayCount = isExpanded
        ? itemCodes.length
        : Math.min(5, itemCodes.length);
      const hasMore = itemCodes.length > 5;

      return (
        <div>
          <div className="flex flex-wrap gap-1.5">
            {itemCodes.slice(0, displayCount).map((itemCode, index) => {
              const teamItem = teamItems.find(item => item.itemCode === itemCode);
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-Primary-Container text-Primary-Main"
                  title={teamItem ? `${teamItem.itemName} (${itemCode})` : itemCode}
                >
                  {teamItem ? teamItem.itemName : itemCode}
                </span>
              );
            })}
          </div>

          {hasMore && (
            <button
              onClick={() => togglePackageExpand(pkg.id)}
              className="mt-2 text-xs text-Primary-Main hover:text-Primary-Main/80 focus:outline-none font-medium"
            >
              {isExpanded ? "접기" : `+ ${itemCodes.length - 5}개 더 보기`}
            </button>
          )}
        </div>
      );
    }

    return <p className="text-sm text-Text-Low-70">아이템 없음</p>;
  };

  if (isUserLoading || isLoading || isTeamItemsLoading || isWarehouseItemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingCentered size="lg" />
          <p className="mt-4 text-Text-Low-70">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 권한 체크: Admin, Moderator만 접근 가능
  if (!user || (user.accessLevel !== 'admin' && user.accessLevel !== 'moderator')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-Text-Highest-100 mb-4">
            접근 권한이 필요합니다
          </h2>
          <p className="text-Text-Low-70 mb-6">
            패키지 관리 페이지는 관리자 또는 1차 승인권자만 접근할 수 있습니다.
          </p>
          <button
            onClick={() => router.push('/menu')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-Error-Main">오류: {error.message}</div>
    );
  }

  if (!selectedTeamId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-Text-Highest-100 mb-4">
            팀을 선택해주세요
          </h2>
          <p className="text-Text-Low-70 mb-6">
            패키지 관리를 위해서는 팀을 먼저 선택해야 합니다.
          </p>
          <button
            onClick={() => navigateByAuthStatus(router)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-Back-Mid-20 text-Text-High-90 rounded-full hover:bg-Back-Mid-20/80 transition-colors"
          >
            <ArrowLeft size={18} />
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  // 패키지 추가 폼 (모달에 들어갈 내용)
  const renderAddPackageForm = () => (
    <form onSubmit={handleAddPackage}>
      <div className="mb-4">
        <label className="block mb-1.5 text-sm font-medium text-Text-Highest-100">패키지 이름</label>
        <input
          type="text"
          value={newPackageName}
          onChange={(e) => setNewPackageName(e.target.value)}
          className="w-full px-4 py-2 border border-Outline-Variant rounded-xl focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main outline-none text-Text-Highest-100"
          placeholder="패키지 이름을 입력하세요"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1.5 text-sm font-medium text-Text-Highest-100">
          아이템 선택 <span className="text-Primary-Main font-normal">({selectedItems.length}개 선택됨)</span>
        </label>
        <div className="max-h-60 overflow-y-auto border border-Outline-Variant rounded-xl p-3 bg-Back-Low-10">
          {teamItems.length === 0 ? (
            <p className="text-Text-Low-70 text-sm">등록된 팀 아이템이 없습니다.</p>
          ) : (
            <ul className="space-y-1.5">
              {teamItems.map((item) => (
                <li key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer" onClick={() => handleItemSelect(item.itemCode)}>
                  <input
                    type="checkbox"
                    id={`item-${item.id}`}
                    checked={selectedItems.includes(item.itemCode)}
                    onChange={() => handleItemSelect(item.itemCode)}
                    className="accent-Primary-Main"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label htmlFor={`item-${item.id}`} className="cursor-pointer text-sm text-Text-Highest-100">
                    {item.itemName}{" "}
                    <span className="text-Text-Low-70">
                      ({item.itemCode})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        {selectedItems.length > 0 && (
          <div className="mt-2.5">
            <p className="text-xs font-semibold text-Text-Low-70 mb-1.5">선택된 아이템:</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedItems
                .map((itemCode) => findItemByCode(itemCode))
                .filter((item) => item !== undefined) // 미등록 아이템 제외
                .map((item) => (
                  <span
                    key={item.itemCode}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-Primary-Container text-Primary-Main"
                  >
                    {item.itemName}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={closeAddModal}
          className="px-4 py-2 bg-Back-Mid-20 text-Text-High-90 rounded-full hover:bg-Back-Mid-20/80 transition-colors text-sm font-medium"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedItems.length === 0}
        >
          패키지 추가
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-Back-Low-10">
      <div className="mx-auto max-w-7xl">

        {/* 페이지 헤더 */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-Text-Highest-100">패키지 관리</h1>
            <p className="text-sm text-Text-Low-70 mt-0.5">자주 사용하는 품목 묶음을 패키지로 저장하고 발주 시 빠르게 활용하세요</p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 transition-colors text-sm font-medium self-start sm:self-auto flex-shrink-0"
          >
            <Plus size={16} />
            새 패키지 추가
          </button>
        </div>

        {/* 패키지 개념 설명 카드 */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-start gap-3 px-6 py-5">
            <div className="w-9 h-9 flex items-center justify-center bg-Primary-Container rounded-xl flex-shrink-0 mt-0.5">
              <Info size={18} className="text-Primary-Main" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-Text-Highest-100 mb-1">패키지란?</h2>
              <p className="text-sm text-Text-Low-70 leading-relaxed">
                패키지는 <span className="font-medium text-Text-High-90">자주 함께 발주되는 품목들을 하나의 묶음으로 저장한 템플릿</span>입니다.
                예를 들어 &quot;휠체어 기본 세트&quot;처럼 반복적으로 주문하는 구성을 패키지로 등록해두면,
                발주 시 패키지를 선택하는 것만으로 품목들을 한 번에 추가할 수 있어 업무 효율을 높일 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 패키지 추가 모달 */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          title="새 패키지 추가"
        >
          {renderAddPackageForm()}
        </Modal>

        {/* 패키지 수정 폼 (inline) */}
        {editMode && (
          <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-Outline-Variant">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-Text-Highest-100">패키지 수정</h2>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-Back-Low-10 text-Text-Low-70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdatePackage}>
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-Text-Highest-100">패키지 이름</label>
                <input
                  type="text"
                  value={editPackageName}
                  onChange={(e) => setEditPackageName(e.target.value)}
                  className="w-full px-4 py-2 border border-Outline-Variant rounded-xl focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main outline-none text-Text-Highest-100"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-Text-Highest-100">
                  아이템 선택 <span className="text-Primary-Main font-normal">({editSelectedItems.length}개 선택됨)</span>
                </label>
                <div className="max-h-60 overflow-y-auto border border-Outline-Variant rounded-xl p-3 bg-Back-Low-10">
                  {teamItems.length === 0 ? (
                    <p className="text-Text-Low-70 text-sm">등록된 팀 아이템이 없습니다.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {teamItems.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer" onClick={() => handleEditItemSelect(item.itemCode)}>
                          <input
                            type="checkbox"
                            id={`edit-item-${item.id}`}
                            checked={editSelectedItems.includes(item.itemCode)}
                            onChange={() => handleEditItemSelect(item.itemCode)}
                            className="accent-Primary-Main"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label
                            htmlFor={`edit-item-${item.id}`}
                            className="cursor-pointer text-sm text-Text-Highest-100"
                          >
                            {item.itemName}{" "}
                            <span className="text-Text-Low-70">
                              ({item.itemCode})
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {editSelectedItems.length > 0 && (
                  <div className="mt-2.5">
                    <p className="text-xs font-semibold text-Text-Low-70 mb-1.5">선택된 아이템:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {editSelectedItems
                        .map((itemCode) => findItemByCode(itemCode))
                        .filter((item) => item !== undefined) // 미등록 아이템 제외
                        .map((item) => (
                          <span
                            key={item.itemCode}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-Primary-Container text-Primary-Main"
                          >
                            {item.itemName}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-Primary-Main text-white rounded-full hover:bg-Primary-Main/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={editSelectedItems.length === 0}
                >
                  수정 완료
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-Back-Mid-20 text-Text-High-90 rounded-full hover:bg-Back-Mid-20/80 transition-colors text-sm font-medium"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 패키지 목록 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-Primary-Main" size={20} />
            <h2 className="text-base font-semibold text-Text-Highest-100">패키지 목록</h2>
            <span className="text-sm text-Text-Low-70">({packages.length}개)</span>
          </div>
          {packages.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-Primary-Container rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="text-Primary-Main" size={28} />
              </div>
              <p className="text-Text-High-90 font-medium">등록된 패키지가 없습니다</p>
              <p className="text-Text-Low-70 text-sm mt-1.5">새 패키지를 추가해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg: PackageApi) => (
                <div
                  key={pkg.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, pkg.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-move ${
                    draggedPackageId === pkg.id ? "opacity-50 scale-95" : ""
                  }`}
                >
                  <div className="p-4 flex flex-col gap-3">
                    {/* 타이틀 행 */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 flex items-center justify-center bg-Primary-Container rounded-xl flex-shrink-0">
                          <Package className="text-Primary-Main" size={15} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-Text-Highest-100 truncate">
                            {pkg.packageName}
                          </h3>
                          <div className="flex items-center gap-1 text-Text-Low-70 text-xs mt-0.5">
                            <Calendar size={11} />
                            <span>
                              {new Date(pkg.createdAt as string).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* 아이콘 버튼들 */}
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => handleStartEdit(pkg)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-Primary-Container text-Text-Low-70 hover:text-Primary-Main transition-colors"
                          title="수정"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-Error-Container text-Text-Low-70 hover:text-Error-Main transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 아이템 배지 */}
                    {renderPackageItems(pkg)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
