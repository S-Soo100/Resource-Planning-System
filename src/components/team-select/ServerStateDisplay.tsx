import React from "react";
import { IUser } from "@/types/user";

interface ServerStateDisplayProps {
  serverUser: IUser;
}

export const ServerStateDisplay: React.FC<ServerStateDisplayProps> = ({
  serverUser,
}) => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">
        서버 상태의 사용자 정보 (JSON)
      </h2>
      <pre className="bg-white p-4 rounded-lg overflow-auto">
        {JSON.stringify(serverUser, null, 2)}
      </pre>
    </div>
  );
};
