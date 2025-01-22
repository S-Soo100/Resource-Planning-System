"use client";
import { useState, useEffect } from "react";
import styles from "./Log.module.css";
import { useParams } from "next/navigation";

interface LogItem {
  date: string;
  incomming: number;
  outcomming: number;
  quantity: number;
  remark: string;
}

export default function Log({ code }: { code: string }) {
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
  const params: { code: string } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/logs/${code}`);
      const data: LogItem[] = await response.json();
      setLogData(data);
    };

    fetchData();
  }, [code]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>물품 {params.code} 입/출고 로그</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>날짜</th>
            <th className={styles.th}>입고</th>
            <th className={styles.th}>출고</th>
            <th className={styles.th}>수량</th>
            <th className={styles.th}>비고</th>
          </tr>
        </thead>
        <tbody>
          {logData.map((log, index) => (
            <tr key={index}>
              <td className={styles.td}>{log.date}</td>
              <td className={styles.td}>{log.incomming}</td>
              <td className={styles.td}>{log.outcomming}</td>
              <td className={styles.td}>{log.quantity}</td>
              <td className={styles.td}>{log.remark}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
