#!/usr/bin/env python3
"""
원형 스피너를 새로운 Loading 컴포넌트로 교체하는 스크립트
"""
import os
import re
from pathlib import Path

# 교체할 파일 목록
files_to_fix = [
    "src/app/orderRecord/page.tsx",
    "src/app/demonstration/page.tsx",
    "src/app/calendar/page.tsx",
    "src/app/team-select/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/packageOrder/page.tsx",
    "src/app/orderRequest/page.tsx",
    "src/app/orderWheelchair/page.tsx",
    "src/app/supplier/page.tsx",
    "src/app/item/page.tsx",
    "src/app/stock/page.tsx",
    "src/app/warehouse-items/page.tsx",
    "src/app/orderRecord/[id]/page.tsx",
    "src/app/demoRecord/[id]/page.tsx",
    "src/app/demonstration-record/page.tsx",
    "src/app/package/page.tsx",
    "src/app/account/page.tsx",
    "src/app/account/edit-profile/page.tsx",
    "src/app/account/change-password/page.tsx",
    "src/app/stock/log/[code]/page.tsx",
    "src/components/menu/MainMenu.tsx",
    "src/components/admin/UserEditModal.tsx",
    "src/components/orderRecord/OrderRecordTabs.tsx",
    "src/components/orderRecord/OrderRecordTabsMobile.tsx",
    "src/components/orderRecord/OrderRecordTable.tsx",
    "src/components/demonstration/DemoRecordTable.tsx",
    "src/components/demonstration/DemonstrationRecordTabs.tsx",
    "src/components/demonstration/SimpleDemonstrationForm.tsx",
    "src/components/stock/StockTable.tsx",
    "src/components/ioHistory/IoHistoryList.tsx",
    "src/components/team-select/TeamList.tsx",
    "src/utils/withAuth.tsx",
]

# 원형 스피너 패턴들
spinner_patterns = [
    # 패턴 1: 기본 원형 스피너
    (
        r'<div className="animate-spin rounded-full h-\d+ w-\d+ border-b-2 border-(?:blue|purple|teal)-\d+(?:\s+mx-auto)?"></div>',
        '<LoadingCentered size="lg" />'
    ),
    # 패턴 2: mx-auto가 먼저 나오고 반응형 포함
    (
        r'<div className="(?:mx-auto\s+)?w-\d+ h-\d+(?:\s+md:w-\d+\s+md:h-\d+)?\s+rounded-full border-b-2 border-(?:blue|purple|teal)-\d+ animate-spin"></div>',
        '<LoadingCentered size="lg" />'
    ),
    # 패턴 3: border-t-2도 있는 경우
    (
        r'<div className="w-\d+ h-\d+ (?:mx-auto\s+)?border-t-2 border-b-2 border-(?:blue|purple|teal)-\d+ rounded-full animate-spin"></div>',
        '<LoadingCentered size="lg" />'
    ),
    # 패턴 4: border-t-transparent가 있는 경우 (작은 것)
    (
        r'<div className="w-\d+ h-\d+ rounded-full border-(?:2|4) border-(?:blue|purple|teal)-\d+ animate-spin border-t-transparent"\s*/>',
        '<LoadingCentered size="sm" />'
    ),
    # 패턴 5: border-t-transparent 닫는 태그 있는 경우
    (
        r'<div className="w-\d+ h-\d+ rounded-full border-(?:2|4) border-(?:blue|purple|teal)-\d+ animate-spin border-t-transparent"></div>',
        '<LoadingCentered size="sm" />'
    ),
]

def add_import_if_needed(content):
    """Loading import가 없으면 추가"""
    if 'from "@/components/ui/Loading"' in content or "from '@/components/ui/Loading'" in content:
        return content

    # import 문 찾기
    import_pattern = r"(import .+ from ['\"].+['\"];?\n)"
    imports = list(re.finditer(import_pattern, content))

    if imports:
        # 마지막 import 뒤에 추가
        last_import = imports[-1]
        insert_pos = last_import.end()
        new_import = 'import { LoadingCentered } from "@/components/ui/Loading";\n'
        content = content[:insert_pos] + new_import + content[insert_pos:]

    return content

def fix_file(filepath):
    """파일의 스피너를 교체"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        changed = False

        # 각 패턴에 대해 교체
        for pattern, replacement in spinner_patterns:
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                changed = True

        # 변경사항이 있으면 import 추가 및 저장
        if changed:
            content = add_import_if_needed(content)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {filepath}")
            return True
        else:
            print(f"⏭️  Skipped: {filepath} (no spinners found)")
            return False

    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")
        return False

def main():
    base_dir = Path("/Users/baek/myWebProjects/kars")
    fixed_count = 0

    print("🔄 Starting spinner replacement...\n")

    for file_path in files_to_fix:
        full_path = base_dir / file_path
        if full_path.exists():
            if fix_file(full_path):
                fixed_count += 1
        else:
            print(f"⚠️  File not found: {file_path}")

    print(f"\n✨ Done! Fixed {fixed_count} files.")

if __name__ == "__main__":
    main()
