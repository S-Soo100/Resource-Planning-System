"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import { Iitem, inventoryDummyData } from "@/types/item";
import { getWarehouseName } from "@/api/(inventory)/getWarehouseName";

const InventoryTable: React.FC = () => {
  const router = useRouter();

  const columns: TableColumnsType<Iitem> = [
    {
      title: "no",
      dataIndex: "itemId",
      // sorter: (a, b) => a.itemId - b.itemId,
      width: "5%",
      render: (text) => <div>{text}</div>,
    },
    {
      title: "물품 코드",
      dataIndex: "itemCode",
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
      onFilter: (value, record) => record.itemCode.includes(value as string),
      width: "20%",
      render: (text) => (
        <a
          onClick={() => router.push(`/inventory/log/${text}`)}
          // style={{ cursor: "pointer", color: "#1890ff" }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "품목",
      dataIndex: "itemName",
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
      onFilter: (value, record) => record.itemName.includes(value as string),
      width: "20%",
    },
    {
      title: "재고",
      dataIndex: "itemQuantity",
      sorter: (a, b) => a.itemQuantity - b.itemQuantity,
      width: "10%",
    },
    {
      title: "창고",
      dataIndex: "warehouseId",
      width: "15%",
      render: (text) => (
        <a
          onClick={() => router.push(`/inventory/warehouse/${text}`)}
          // style={{ cursor: "pointer", color: "#1890ff" }}
        >
          {text}
        </a>
      ),
    },
  ];

  const onChange: TableProps<Iitem>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  return (
    <>
      <Table<Iitem>
        columns={columns}
        dataSource={inventoryDummyData}
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
    </>
  );
};

export default InventoryTable;
