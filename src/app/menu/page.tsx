import MenuButtonListComponent from "@/components/menu/MenuButtonListComponent";
import React from "react";

interface PageProps {
  searchParams: {
    teamId?: string;
  };
}

export default function MenuPage({ searchParams }: PageProps) {
  const { teamId } = searchParams;

  if (!teamId) {
    return (
      <div className="p-4 text-red-500">
        팀이 선택되지 않았습니다. 팀 선택 페이지로 돌아가주세요.
      </div>
    );
  }

  return (
    <>
      <MenuButtonListComponent teamId={teamId} />
    </>
  );
}
