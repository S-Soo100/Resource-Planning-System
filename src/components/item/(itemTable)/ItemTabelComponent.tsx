"use client";
import { Item } from "@/types/item";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAllInventories } from "@/hooks/useAllInventories";

export default function ItemTableComponent() {
  const router = useRouter();
  const { items, isLoading, isError } = useAllInventories();

  const IitemTableColumns: ColumnsType<Item> = [
    {
      title: "No",
      dataIndex: "id",
      sorter: {
        compare: (a, b) => a.id - b.id,
        multiple: 1,
      },
      width: "7%",
      render: (val: number) => (
        <button className="drop-shadow-lg">{val}</button>
      ),
    },
    {
      title: "Product",
      dataIndex: "itemName",
      width: "15%",
      render: (value: string, record) => (
        <a
          className="text-blue-500 hover:font-extrabold"
          onClick={() => {
            router.push(`/item/log/${record.itemCode}`);
          }}
        >
          {value}
        </a>
      ),
    },
    {
      title: "Qty",
      dataIndex: "itemQuantity",
      width: "5%",
    },
    {
      title: "Warehouse",
      dataIndex: "warehouseId",
      width: "5%",
    },
  ];

  if (isLoading) return <div>Loading Data...</div>;
  if (isError) return <div>Error loading inventory data.</div>;

  return (
    <Suspense fallback={<div>Loading Data...</div>}>
      <section className="m-2 rounded-lg shadow-lg">
        <Table
          columns={IitemTableColumns}
          dataSource={items}
          rowKey={(record) =>
            record?.id ? `item-table-${record.id}` : Math.random().toString()
          }
        />
      </section>
    </Suspense>
  );
}
