import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const analyzeApiDoc = () => {
  const filePath = path.join(__dirname, "erp-api-doc.xlsx");
  const workbook = XLSX.readFile(filePath);

  // item 시트 분석
  const itemSheet = workbook.Sheets["item"];
  const itemData = XLSX.utils.sheet_to_json(itemSheet);

  console.log("=== Item API 상세 분석 ===\n");
  itemData.forEach((row, index) => {
    console.log(`\nAPI #${index + 1}:`);
    console.log(`경로: ${row["경로"]}`);
    console.log(`메서드: ${row["메서드"]}`);
    console.log(`설명: ${row["설명"]}`);
    console.log(`상세설명: ${row["상세설명"]}`);
    console.log(`파라미터: ${row["파라미터"]}`);
    console.log(`응답코드: ${row["응답코드"]}`);
    console.log(`응답설명: ${row["응답설명"]}`);
  });
};

analyzeApiDoc();
