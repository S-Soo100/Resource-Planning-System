const TableCell = ({
  children,
  isHeader = false,
}: {
  children: string | number;
  isHeader: boolean;
}) => {
  const Component = isHeader ? "th" : "td";
  return (
    <Component className="border border-gray-300 px-2 py-2">
      {children}
    </Component>
  );
};

export default TableCell;
