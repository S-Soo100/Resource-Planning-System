import { VersionUpdate, ChangeType, ChangeItem } from "@/types/update";

/**
 * CHANGELOG.md의 Keep a Changelog 형식을 파싱하여 구조화된 데이터로 변환
 */
export function parseChangelog(markdown: string): VersionUpdate[] {
  const lines = markdown.split("\n");
  const updates: VersionUpdate[] = [];
  let currentVersion: VersionUpdate | null = null;
  let currentChangeType: ChangeType | null = null;
  let currentItem: ChangeItem | null = null;

  // 변경사항 타입 매핑 (한글 + 영문)
  const changeTypeMap: Record<string, ChangeType> = {
    "추가됨": "추가됨",
    "Added": "추가됨",
    "변경됨": "변경됨",
    "Changed": "변경됨",
    "수정됨": "수정됨",
    "Fixed": "수정됨",
    "보안": "보안",
    "Security": "보안",
    "개선됨": "개선됨",
    "Improved": "개선됨",
    "제거됨": "제거됨",
    "Removed": "제거됨",
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 버전 헤더 파싱: ## v1.16.1 (2026-01-23)
    const versionMatch = line.match(/^##\s+v?(\d+\.\d+\.\d+)\s+\((\d{4}-\d{2}-\d{2})\)/);
    if (versionMatch) {
      // 이전 버전 저장
      if (currentVersion) {
        updates.push(currentVersion);
      }

      // 새 버전 시작
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2],
        isLatest: updates.length === 0, // 첫 번째 버전이 최신
        changes: {},
      };
      currentChangeType = null;
      currentItem = null;
      continue;
    }

    // 변경사항 타입 헤더 파싱: ### 추가됨 (Added)
    const typeMatch = line.match(/^###\s+(.+?)(?:\s+\(.+\))?$/);
    if (typeMatch && currentVersion) {
      const typeText = typeMatch[1].trim();
      currentChangeType = changeTypeMap[typeText] || null;
      currentItem = null;
      continue;
    }

    // 변경사항 아이템 파싱: - **제목**: 설명
    const itemMatch = line.match(/^-\s+\*\*(.+?)\*\*:\s*(.*)$/);
    if (itemMatch && currentVersion && currentChangeType) {
      // 이전 아이템 저장
      if (currentItem) {
        if (!currentVersion.changes[currentChangeType]) {
          currentVersion.changes[currentChangeType] = [];
        }
        currentVersion.changes[currentChangeType]!.push(currentItem);
      }

      // 새 아이템 시작
      currentItem = {
        title: itemMatch[1].trim(),
        description: itemMatch[2].trim() ? [itemMatch[2].trim()] : [],
      };
      continue;
    }

    // 하위 설명 파싱: 들여쓰기 2칸 + - 또는 공백으로 시작
    const descMatch = line.match(/^\s{2,}-\s+(.+)$/);
    if (descMatch && currentItem) {
      currentItem.description.push(descMatch[1].trim());
      continue;
    }

    // 빈 줄이나 다른 섹션 시작 시 현재 아이템 저장
    if (line.trim() === "" || line.startsWith("#")) {
      if (currentItem && currentVersion && currentChangeType) {
        if (!currentVersion.changes[currentChangeType]) {
          currentVersion.changes[currentChangeType] = [];
        }
        currentVersion.changes[currentChangeType]!.push(currentItem);
        currentItem = null;
      }
    }
  }

  // 마지막 아이템과 버전 저장
  if (currentItem && currentVersion && currentChangeType) {
    if (!currentVersion.changes[currentChangeType]) {
      currentVersion.changes[currentChangeType] = [];
    }
    currentVersion.changes[currentChangeType]!.push(currentItem);
  }
  if (currentVersion) {
    updates.push(currentVersion);
  }

  return updates;
}

