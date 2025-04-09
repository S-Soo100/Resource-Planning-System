"use client";
import CustomItemTable from "@/components/item/CustomItemTable";

export default function Page() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">품목 관리</h1>
      <CustomItemTable />
    </div>
  );
}
