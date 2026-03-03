# [Bug] Turbopack에서 CHANGELOG.md import 시 Build Error 발생

- **유형**: Bug
- **우선순위**: P2
- **영역**: 빌드 / 개발 환경
- **상태**: 열림
- **발견 경위**: E2E 테스트 실제 브라우저 검증 중 발견

---

## 버그 설명

`npm run dev` (Turbopack 모드)로 개발 서버 실행 시, `src/app/update/page.tsx`에서 `CHANGELOG.md`를 직접 import하는 부분에서 Build Error가 발생한다.

```
./CHANGELOG.md
Unknown module type
This module doesn't have an associated type. Use a known file extension,
or register a loader for it.
```

## 재현 단계

1. `npm run dev` 실행 (Turbopack 모드: `next dev --turbopack`)
2. 브라우저에서 아무 페이지 접근
3. "Build Error - Failed to compile" 표시

## 기대 동작

Turbopack 모드에서도 `.md` 파일을 문자열로 import할 수 있어야 한다.

## 현재 동작

- **webpack** (`next build`, `next dev`): `next.config.js`의 `asset/source` 규칙으로 정상 동작
- **Turbopack** (`next dev --turbopack`): `.md` 파일 로더 미지원으로 Build Error

## 근본 원인

`next.config.js`에 webpack 로더만 설정되어 있고, Turbopack 로더 설정이 없음:

```javascript
// ✅ webpack - 동작함
webpack: (config) => {
  config.module.rules.push({
    test: /\.md$/,
    type: "asset/source",
  });
  return config;
},

// ❌ Turbopack - 설정 없음
```

## 영향 범위

- `src/app/update/page.tsx` - `import changelogContent from "../../../CHANGELOG.md"`
- 개발 서버 전체 페이지에 영향 (Turbopack 사용 시)
- 프로덕션 빌드는 webpack 사용하므로 영향 없음

## 현재 임시 조치

Playwright 테스트에서 `npx next dev --port 3000` (Turbopack 없이)으로 dev 서버를 실행하여 우회.

## 제안 해결 방안

### 방안 1: Turbopack 로더 설정 추가 (권장)

```javascript
// next.config.js
turbopack: {
  rules: {
    "*.md": {
      loaders: ["raw-loader"],
      as: "*.js",
    },
  },
},
```

> Next.js 15.1에서 `turbopack` 키가 unrecognized로 경고됨. Next.js 버전 업그레이드 필요할 수 있음.

### 방안 2: update 페이지를 Server Component로 변환

```typescript
// src/app/update/page.tsx - Server Component
import fs from "fs";
import path from "path";

export default function UpdatePage() {
  const changelogContent = fs.readFileSync(
    path.join(process.cwd(), "CHANGELOG.md"),
    "utf-8"
  );
  // ...
}
```

### 방안 3: API Route로 CHANGELOG 제공

```typescript
// src/app/api/changelog/route.ts
export async function GET() {
  const content = fs.readFileSync("CHANGELOG.md", "utf-8");
  return Response.json({ content });
}
```

## 기술 분석

- **수정 파일**: `next.config.js`, `src/app/update/page.tsx`
- **관련 패키지**: `next@15.1.11`, `raw-loader` (devDependency로 설치됨)
- **예상 작업량**: S
