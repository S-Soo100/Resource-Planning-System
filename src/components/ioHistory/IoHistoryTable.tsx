"use client";
import { getWarehouseName } from "@/api/(item)/getWarehouseName";
import { useIoHistory } from "@/hooks/useIoHistory";
import { useState, useMemo } from "react";
import { Table, Button, Space, Tag } from "antd";

export default function IoHistoryTable() {
  const { data: ioHistory, isLoading, isError } = useIoHistory();
  const [filter, setFilter] = useState<"all" | "inbound" | "outbound">("all");

  const filteredHistory = useMemo(() => {
    if (!ioHistory) return [];

    switch (filter) {
      case "inbound":
        return ioHistory.filter((record) => record.outboundDate === null);
      case "outbound":
        return ioHistory.filter((record) => record.inboundDate === null);
      default:
        return ioHistory;
    }
  }, [ioHistory, filter]);

  const columns = [
    {
      title: "상태",
      key: "status",
      dataIndex: "outboundDate",
      render: (outboundDate: string | null) => (
        <Tag color={outboundDate === null ? "blue" : "red"}>
          {outboundDate === null ? "입고" : "출고"}
        </Tag>
      ),
    },
    {
      title: "창고",
      dataIndex: "warehouseId",
      key: "warehouse",
      render: (warehouseId: number) => getWarehouseName({ id: warehouseId }),
    },
    {
      title: "입고일",
      dataIndex: "inboundDate",
      key: "inboundDate",
      render: (date: string | null) => date || "-",
    },
    {
      title: "출고일",
      dataIndex: "outboundDate",
      key: "outboundDate",
      render: (date: string | null) => date || "-",
    },
    {
      title: "입고처",
      dataIndex: "inboundLocation",
      key: "inboundLocation",
    },
    {
      title: "출고처",
      dataIndex: "outboundLocation",
      key: "outboundLocation",
    },
    {
      title: "입고 수량",
      dataIndex: "inboundQuantity",
      key: "inboundQuantity",
    },
    {
      title: "출고 수량",
      dataIndex: "outboundQuantity",
      key: "outboundQuantity",
    },
    {
      title: "비고",
      dataIndex: "remarks",
      key: "remarks",
      render: (remarks: string | null) => remarks || "-",
    },
  ];

  if (isError) return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">입출고 기록</h2>
      <Space className="mb-4">
        <Button
          type={filter === "all" ? "primary" : "default"}
          onClick={() => setFilter("all")}
        >
          모두 보기
        </Button>
        <Button
          type={filter === "inbound" ? "primary" : "default"}
          onClick={() => setFilter("inbound")}
        >
          입고 건만
        </Button>
        <Button
          type={filter === "outbound" ? "primary" : "default"}
          onClick={() => setFilter("outbound")}
        >
          출고 건만
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredHistory}
        rowKey="ioId"
        loading={isLoading}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          showTotal: (total) => `총 ${total}건`,
        }}
      />
    </div>
  );
}
