import React from "react";
import { IAuth } from "@/types/(auth)/auth";

interface UserInfoDisplayProps {
  user: IAuth | null;
}

export const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({ user }) => {
  return (
    <div className="mb-8 p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">
        Zustand Store의 사용자 정보
      </h2>
      <div className="space-y-2">
        <p>
          <span className="font-medium">ID:</span> {user?.id}
        </p>
        <p>
          <span className="font-medium">이름:</span> {user?.name}
        </p>
        <p>
          <span className="font-medium">이메일:</span> {user?.email}
        </p>
        <p>
          <span className="font-medium">관리자 여부:</span>{" "}
          {user?.isAdmin ? "예" : "아니오"}
        </p>
      </div>
    </div>
  );
};
