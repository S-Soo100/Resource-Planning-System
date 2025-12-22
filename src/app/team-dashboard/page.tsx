/**
 * 팀 활동 대시보드 페이지 (v3.0)
 */
'use client';

import React from 'react';
import { useAuth, useSelectedTeam } from '@/store/authStore';
import TeamActivityDashboard from '@/components/team/TeamActivityDashboard';
import { Alert } from 'antd';

const TeamDashboardPage = () => {
  const { user } = useAuth();
  const { selectedTeam } = useSelectedTeam();

  // 로그인 체크
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          type="warning"
          message="로그인이 필요합니다"
          description="팀 대시보드를 보려면 로그인해주세요."
          showIcon
        />
      </div>
    );
  }

  // 팀 정보 체크
  if (!selectedTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          type="info"
          message="팀 정보가 없습니다"
          description="팀을 선택해주세요."
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">팀 활동 대시보드</h1>

      <TeamActivityDashboard
        teamId={selectedTeam.id}
        teamName={selectedTeam.teamName}
      />

      <div className="mt-6 text-sm text-gray-500">
        <p>💡 이 페이지는 팀 전체의 실시간 활동을 보여줍니다.</p>
        <p className="mt-1">• 시연, 주문, 재고 변경 사항이 자동으로 업데이트됩니다.</p>
        <p className="mt-1">• 타입 필터를 사용하여 원하는 활동만 볼 수 있습니다.</p>
      </div>
    </div>
  );
};

export default TeamDashboardPage;
