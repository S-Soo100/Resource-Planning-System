import React from "react";

const TableCell = ({
  children,
  isHeader = false,
  className = "",
}: {
  children: React.ReactNode;
  isHeader: boolean;
  className?: string;
}) => {
  const Component = isHeader ? "th" : "td";
  return (
    <Component className={`border border-gray-300 px-2 py-2 ${className}`}>
      {children}
    </Component>
  );
};

export default TableCell;
