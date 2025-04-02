import * as XLSX from "xlsx";
import path from "path";

const analyzeApiDoc = () => {
  const filePath = path.join(__dirname, "erp-api-doc.xlsx");
  const workbook = XLSX.readFile(filePath);

  // 모든 시트 정보 출력
  console.log("=== API 문서 분석 ===\n");
  console.log("시트 목록:", workbook.SheetNames);

  // 각 시트별 내용 분석
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`\n=== ${sheetName} 시트 분석 ===`);
    console.log(`총 ${data.length}개의 행이 있습니다.`);

    if (data.length > 0) {
      console.log("\n첫 번째 행의 구조:");
      console.log(Object.keys(data[0] as Record<string, unknown>));
    }
  });
};

analyzeApiDoc();
