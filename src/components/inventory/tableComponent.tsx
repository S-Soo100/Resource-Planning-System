"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";

import { QuestionCircleOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";

interface DataType {
  key: React.Key;
  code: string;
  name: string;
  age: number;
  address: string;
}

const TableComponent: React.FC = () => {
  const router = useRouter();

  const columns: TableColumnsType<DataType> = [
    {
      title: "물품 코드",
      dataIndex: "code",
      filters: [
        {
          text: "RX",
          value: "RX",
        },
        {
          text: "MS",
          value: "MS",
        },
      ],
      filterMode: "tree",
      filterSearch: true,
      onFilter: (value, record) => record.code.includes(value as string),
      width: "20%",
      render: (text) => (
        <a
          onClick={() => router.push(`/inventory/log/${text}`)}
          style={{ cursor: "pointer", color: "#1890ff" }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "품목",
      dataIndex: "name",
      filters: [
        {
          text: "휠리엑스",
          value: "휠리엑스",
        },
        {
          text: "휠리 허브",
          value: "휠리 허브",
          children: [
            {
              text: "무선",
              value: "무선",
            },
            {
              text: "유선",
              value: "유선",
            },
          ],
        },
        {
          text: "Gundam",
          value: "Gundam",
          children: [
            {
              text: "Unicorn",
              value: "Unicorn",
            },
            {
              text: "First",
              value: "First",
            },
          ],
        },
      ],
      filterMode: "tree",
      filterSearch: true,
      onFilter: (value, record) => record.name.includes(value as string),
      width: "20%",
    },
    {
      title: "재고 수량",
      dataIndex: "age",
      sorter: (a, b) => a.age - b.age,
      width: "15%",
    },
    {
      title: "최종수정일",
      dataIndex: "address",
      width: "15%",
    },
  ];

  const data: DataType[] = [
    {
      key: "1",
      code: "RX-0",
      name: "Unicorn Gundam",
      age: 3,
      address: "2024-11-21",
    },
    {
      key: "2",
      code: "MS-06S",
      name: "휠리엑스 트레드밀",
      age: 2,
      address: "2024-11-21",
    },
    {
      key: "3",
      code: "MS-06F",
      name: "휠리 허브 유선",
      age: 12,
      address: "2024-12-25",
    },
    {
      key: "4",
      code: "RX-78",
      name: "First Gundam",
      age: 3,
      address: "2024-12-25",
    },
    {
      key: "5",
      code: "RX-78-2",
      name: "휠리 허브 무선",
      age: 323,
      address: "1993-05-18",
    },
  ];

  const onChange: TableProps<DataType>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  return (
    <div>
      <Table<DataType>
        columns={columns}
        dataSource={data}
        onChange={onChange}
      />

      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="primary"
        style={{ insetInlineEnd: 24 }}
        onClick={() => alert("재고 수정")}
      />
      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="default"
        style={{ insetInlineEnd: 94 }}
        onClick={() => alert("출고 처리")}
      />
    </div>
  );
};

export default TableComponent;
