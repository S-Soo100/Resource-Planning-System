"use client";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { useState } from "react";
import OrderRecordDetails from "./OrderRecordDetail";
import TableCell from "./TableCell";

const OrderRecordRow: React.FC<{ record: IOrderRecord }> = ({ record }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr
        key={record.date}
        className="text-center text-sm cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell isHeader={false}>{record.id}</TableCell>
        <TableCell isHeader={false}>{record.orderer}</TableCell>
        <TableCell isHeader={false}>{record.package}</TableCell>
        <TableCell isHeader={false}>{record.quantity}</TableCell>
        <TableCell isHeader={false}>{record.recipient}</TableCell>
        <TableCell isHeader={false}>{record.date}</TableCell>
        <TableCell isHeader={false}>{record.status}</TableCell>
      </tr>
      {isExpanded && <OrderRecordDetails record={record} />}
    </>
  );
};

export default OrderRecordRow;
