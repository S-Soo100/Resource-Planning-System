"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface LogItem {
  date: string;
  incomming: number;
  outcomming: number;
  quantity: number;
  remark: string;
}

export default function Log() {
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
      const response = await fetch(`/api/logs/${code}`);
      const data: LogItem[] = await response.json();
      setLogData(data);
    };

    fetchData();
  }, [code]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl text-center mb-4 font-bold">
        물품 {code} 입/출고 로그
      </h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 bg-gray-100">날짜</th>
            <th className="border border-gray-300 p-2 bg-gray-100">입고</th>
            <th className="border border-gray-300 p-2 bg-gray-100">출고</th>
            <th className="border border-gray-300 p-2 bg-gray-100">수량</th>
            <th className="border border-gray-300 p-2 bg-gray-100">비고</th>
          </tr>
        </thead>
        <tbody>
          {logData.map((log, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">{log.date}</td>
              <td className="border border-gray-300 p-2">{log.incomming}</td>
              <td className="border border-gray-300 p-2">{log.outcomming}</td>
              <td className="border border-gray-300 p-2">{log.quantity}</td>
              <td className="border border-gray-300 p-2">{log.remark}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
