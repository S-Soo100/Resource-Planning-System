import fs from "fs";
import path from "path";
import { parseChangelog } from "@/lib/changelog-parser";
import UpdatePageClient from "./UpdatePageClient";

// Server Component: 빌드/요청 시 CHANGELOG.md를 파일시스템에서 직접 읽음
// Turbopack/webpack 로더 의존성 제거
export default function UpdatePage() {
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  const changelogContent = fs.readFileSync(changelogPath, "utf-8");
  const updates = parseChangelog(changelogContent);

  return <UpdatePageClient updates={updates} />;
}
