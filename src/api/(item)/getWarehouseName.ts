export const getWarehouseName = ({ id }: { id: number }) => {
  switch (id) {
    case 0:
      return "안산 창고";
    case 1:
      return "판교 쇼룸";
    case 2:
      return "덕구테크";
    default:
      return "미지정 창고";
  }
};
