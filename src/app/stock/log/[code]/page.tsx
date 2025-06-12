"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { getToken } from "@/api/cookie-api";
import { navigateByAuthStatus } from "@/utils/navigation";

interface LogItem {
  date: string;
  incomming: number;
  outcomming: number;
  quantity: number;
  remark: string;
}

export default function ItemLogPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [logData, setLogData] = useState<LogItem[]>([
    {
      date: "2024.12.25",
      incomming: 0,
      outcomming: 3,
      quantity: 1,
      remark: "노아네 집 설치",
    },
    {
      date: "2024.12.26",
      incomming: 3,
      outcomming: 0,
      quantity: 4,
      remark: "덕구에서 3대 수령",
    },
  ]);
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const response = await fetch(`/api/logs/${code}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      const data: LogItem[] = await response.json();
      setLogData(data);
    };

    fetchData();
  }, [code]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            로그인이 필요합니다
          </h2>
          <p className="mb-6 text-gray-600">
            해당 페이지는 로그인한 사용자만 접근할 수 있습니다.
          </p>
          <button
            onClick={() => navigateByAuthStatus(router)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-8 mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-center">
        물품 {code} 입/출고 로그
      </h1>
      <table className="w-full border border-collapse border-gray-300">
        <thead>
          <tr>
            <th className="p-2 bg-gray-100 border border-gray-300">날짜</th>
            <th className="p-2 bg-gray-100 border border-gray-300">입고</th>
            <th className="p-2 bg-gray-100 border border-gray-300">출고</th>
            <th className="p-2 bg-gray-100 border border-gray-300">수량</th>
            <th className="p-2 bg-gray-100 border border-gray-300">비고</th>
          </tr>
        </thead>
        <tbody>
          {logData.map((log, index) => (
            <tr key={index}>
              <td className="p-2 border border-gray-300">{log.date}</td>
              <td className="p-2 border border-gray-300">{log.incomming}</td>
              <td className="p-2 border border-gray-300">{log.outcomming}</td>
              <td className="p-2 border border-gray-300">{log.quantity}</td>
              <td className="p-2 border border-gray-300">{log.remark}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
