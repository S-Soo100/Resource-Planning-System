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
// // 사용 예시
// <table>
//   <thead>
//     <tr>
//       <TableCell isHeader={true}>제목</TableCell>
//     </tr>
//   </thead>
//   <tbody>
//     <tr>
//       <TableCell isHeader={false}>내용</TableCell>
//     </tr>
//   </tbody>
// </table>;
