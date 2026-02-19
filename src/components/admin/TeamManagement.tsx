"use client";

import React, { useState, useEffect } from "react";
import { useTeamAdmin } from "@/hooks/admin/useTeamAdmin";
import { authStore } from "@/store/authStore";
import { UpdateTeamRequest } from "@/types/team";
import { teamApi } from "@/api/team-api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";
import { LoadingCentered } from "@/components/ui/Loading";
import SearchAddressModal from "@/components/SearchAddressModal";
import { Search } from "lucide-react";
import { Address } from "react-daum-postcode";

interface TeamManagementProps {
  isReadOnly?: boolean;
}

const TeamManagement: React.FC<TeamManagementProps> = ({
  isReadOnly = false,
}) => {
  const selectedTeam = authStore((state) => state.selectedTeam);
  const teamId = selectedTeam?.id;

  const { teamUsers, isLoading, error } = useTeamAdmin(teamId || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  const [formData, setFormData] = useState<UpdateTeamRequest>({
    teamName: "",
    companyName: "",
    businessRegistrationNumber: "",
    representativeName: "",
    businessAddress: "",
    email: "",
    phoneNumber: "",
  });

  // 팀 데이터가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (selectedTeam) {
      setFormData({
        teamName: selectedTeam.teamName || "",
        companyName: selectedTeam.companyName || "",
        businessRegistrationNumber: selectedTeam.businessRegistrationNumber || "",
        representativeName: selectedTeam.representativeName || "",
        businessAddress: selectedTeam.businessAddress || "",
        email: selectedTeam.email || "",
        phoneNumber: selectedTeam.phoneNumber || "",
      });
    }
  }, [selectedTeam]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 주소 검색 핸들러
  const handleAddressComplete = (data: Address) => {
    setFormData((prev) => ({ ...prev, businessAddress: data.address }));
    setIsAddressOpen(false);
  };

  const handleSave = async () => {
    if (!teamId) {
      toast.error("팀 정보를 찾을 수 없습니다.");
      return;
    }

    setIsSaving(true);
    try {
      // undefined 필드 제거 (빈 문자열은 undefined로 변환)
      const submitData: UpdateTeamRequest = {};
      if (formData.teamName?.trim()) submitData.teamName = formData.teamName.trim();
      if (formData.companyName?.trim()) submitData.companyName = formData.companyName.trim();
      if (formData.businessRegistrationNumber?.trim())
        submitData.businessRegistrationNumber = formData.businessRegistrationNumber.trim();
      if (formData.representativeName?.trim())
        submitData.representativeName = formData.representativeName.trim();
      if (formData.businessAddress?.trim())
        submitData.businessAddress = formData.businessAddress.trim();
      if (formData.email?.trim()) submitData.email = formData.email.trim();
      if (formData.phoneNumber?.trim()) submitData.phoneNumber = formData.phoneNumber.trim();

      const response = await teamApi.updateTeam(teamId, submitData);

      if (response.success) {
        toast.success("팀 정보가 성공적으로 수정되었습니다.");
        setIsEditing(false);

        // authStore의 selectedTeam 업데이트
        if (response.data) {
          authStore.getState().setTeam(response.data);
        }
      } else {
        throw new Error(response.error || "팀 정보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("팀 정보 수정 오류:", error);
      toast.error(
        error instanceof Error ? error.message : "팀 정보 수정 중 오류가 발생했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // 원래 데이터로 되돌리기
    if (selectedTeam) {
      setFormData({
        teamName: selectedTeam.teamName || "",
        companyName: selectedTeam.companyName || "",
        businessRegistrationNumber: selectedTeam.businessRegistrationNumber || "",
        representativeName: selectedTeam.representativeName || "",
        businessAddress: selectedTeam.businessAddress || "",
        email: selectedTeam.email || "",
        phoneNumber: selectedTeam.phoneNumber || "",
      });
    }
    setIsEditing(false);
  };

  const fieldClass = isEditing
    ? "w-full px-4 py-2 border border-Outline-Variant rounded-md focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main outline-none text-Text-Highest-100 bg-white"
    : "px-4 py-2 bg-Back-Low-10 rounded-md text-Text-Highest-100";

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-center items-center py-8">
          <LoadingCentered />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center text-Error-Main py-8">
          팀 정보를 불러오는데 실패했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-Outline-Variant">
        <div>
          <h2 className="text-lg font-semibold text-Text-Highest-100">팀 정보 관리</h2>
          <p className="text-sm text-Text-Low-70 mt-0.5">팀의 회사 정보를 관리할 수 있습니다.</p>
        </div>
        <div className="flex gap-2 items-center">
          {isReadOnly && (
            <span className="px-3 py-1 text-xs font-medium text-Primary-Main bg-Primary-Container rounded-full">
              읽기 전용
            </span>
          )}
          {!isReadOnly && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="primary">
              정보 수정
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 기본 정보 섹션 */}
        <div>
          <h3 className="text-sm font-semibold text-Text-Low-70 uppercase tracking-wider mb-4">기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-Text-Highest-100 mb-1">
                팀 이름
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName || ""}
                  onChange={handleInputChange}
                  className={fieldClass}
                  placeholder="팀 이름을 입력하세요"
                />
              ) : (
                <div className={fieldClass}>{selectedTeam?.teamName || "-"}</div>
              )}
            </div>
          </div>
        </div>

        {/* 회사 정보 섹션 */}
        <div className="border-t border-Outline-Variant pt-6">
          <h3 className="text-sm font-semibold text-Text-Low-70 uppercase tracking-wider mb-4">회사 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-Text-Highest-100 mb-1">
                회사명
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                  className={fieldClass}
                  placeholder="회사명을 입력하세요"
                />
              ) : (
                <div className={fieldClass}>{selectedTeam?.companyName || "-"}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-Text-Highest-100 mb-1">
                대표자 이름
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="representativeName"
                  value={formData.representativeName || ""}
                  onChange={handleInputChange}
                  className={fieldClass}
                  placeholder="대표자 이름을 입력하세요"
                />
              ) : (
                <div className={fieldClass}>{selectedTeam?.representativeName || "-"}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-Text-Highest-100 mb-1">
                사업자등록번호
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber || ""}
                  onChange={handleInputChange}
                  className={fieldClass}
                  placeholder="000-00-00000"
                />
              ) : (
                <div className={fieldClass}>{selectedTeam?.businessRegistrationNumber || "-"}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-Text-Highest-100 mb-1">
                이메일
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className={fieldClass}
                  placeholder="company@example.com"
                />
              ) : (
                <div className={fieldClass}>{selectedTeam?.email || "-"}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-Text-Highest-100 mb-1">
                대표 전화번호
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleInputChange}
                  className={fieldClass}
                  placeholder="02-0000-0000"
                />
              ) : (
                <div className={fieldClass}>{selectedTeam?.phoneNumber || "-"}</div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-Text-Highest-100 mb-1">
                사업장 주소
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress || ""}
                    onChange={handleInputChange}
                    className={`flex-1 px-4 py-2 border border-Outline-Variant rounded-md focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main outline-none text-Text-Highest-100 bg-white`}
                    placeholder="사업장 주소를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddressOpen(true)}
                    className="px-4 py-2 bg-Primary-Main hover:bg-Primary-Main/90 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-Primary-Main/20 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">주소 검색</span>
                  </button>
                </div>
              ) : (
                <div className={fieldClass}>{selectedTeam?.businessAddress || "-"}</div>
              )}
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        {isEditing && !isReadOnly && (
          <div className="flex justify-end gap-3 pt-6 border-t border-Outline-Variant">
            <Button onClick={handleCancel} variant="default" disabled={isSaving}>
              취소
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              loading={isSaving}
              disabled={isSaving}
            >
              저장
            </Button>
          </div>
        )}
      </div>

      {/* 주소 검색 모달 */}
      {isAddressOpen && (
        <SearchAddressModal
          onCompletePost={handleAddressComplete}
          onClose={() => setIsAddressOpen(false)}
        />
      )}
    </div>
  );
};

export default TeamManagement;
