"use client";
import { Iitem } from "@/types/item";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useItems } from "@/hooks/useItems";

export default function ItemTableComponent() {
  const router = useRouter();
  const { data: items, isLoading, isError } = useItems();

  const IitemTableColumns: ColumnsType<Iitem> = [
    {
      title: "No",
      dataIndex: "itemId",
      sorter: {
        compare: (a, b) => a.itemId - b.itemId,
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
        <Table columns={IitemTableColumns} dataSource={items} rowKey="itemId" />
      </section>
    </Suspense>
  );
}
