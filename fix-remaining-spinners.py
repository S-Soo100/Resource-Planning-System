#!/usr/bin/env python3
import re
from pathlib import Path

files = [
    "src/app/account/change-password/page.tsx",
    "src/app/account/edit-profile/page.tsx",
    "src/app/account/page.tsx",
    "src/app/demoRecord/[id]/page.tsx",
    "src/app/stock/log/[code]/page.tsx",
    "src/app/stock/page.tsx",
    "src/app/supplier/page.tsx",
    "src/app/team-select/page.tsx",
    "src/components/demonstration/DemoRecordTable.tsx",
    "src/components/demonstration/DemonstrationRecordTabs.tsx",
    "src/components/demonstration/SimpleDemonstrationForm.tsx",
    "src/components/orderRecord/OrderRecordTable.tsx",
    "src/components/orderRecord/OrderRecordTabs.tsx",
    "src/components/orderRecord/OrderRecordTabsMobile.tsx",
    "src/components/stock/StockTable.tsx",
]

def add_import(content):
    if 'Loading' in content and '@/components/ui/Loading' in content:
        return content
    import_pattern = r"(import .+ from ['\"].+['\"];?\n)"
    imports = list(re.finditer(import_pattern, content))
    if imports:
        last = imports[-1]
        pos = last.end()
        new_imp = 'import { LoadingCentered, LoadingInline } from "@/components/ui/Loading";\n'
        return content[:pos] + new_imp + content[pos:]
    return content

def fix_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            orig = f.read()
        
        content = orig
        
        # 모든 animate-spin div를 찾아서 교체
        # 큰 로딩 (h-8 이상)
        content = re.sub(
            r'<div className="[^"]*animate-spin[^"]*rounded-full[^"]*h-(?:8|10|12|14|16)[^"]*"[^>]*></div>',
            '<LoadingCentered size="lg" />',
            content
        )
        
        # 작은 로딩 (h-4, h-5)
        content = re.sub(
            r'<div className="[^"]*animate-spin[^"]*rounded-full[^"]*h-(?:4|5)[^"]*"[^>]*(?:/>|></div>)',
            '<LoadingInline />',
            content
        )
        
        # 나머지 모든 animate-spin div
        content = re.sub(
            r'<div className="[^"]*animate-spin[^"]*"[^>]*(?:/>|></div>)',
            '<LoadingCentered />',
            content
        )
        
        if content != orig:
            content = add_import(content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {path}")
            return True
        else:
            print(f"⏭️  {path}")
            return False
    except Exception as e:
        print(f"❌ {path}: {e}")
        return False

base = Path("/Users/baek/myWebProjects/kars")
fixed = 0
for f in files:
    if fix_file(base / f):
        fixed += 1

print(f"\n✨ Fixed {fixed} files")
