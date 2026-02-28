module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // 새 기능
        "fix",      // 버그 수정
        "improve",  // 개선
        "refactor", // 리팩토링
        "docs",     // 문서
        "style",    // 코드 스타일 (포매팅 등)
        "test",     // 테스트
        "chore",    // 빌드, 설정 변경
        "revert",   // 되돌리기
        "ci",       // CI/CD 관련
      ],
    ],
    "subject-empty": [2, "never"],
    "subject-case": [0], // 한국어 + 영문 고유명사 혼용 허용
    "type-empty": [2, "never"],
    "header-max-length": [2, "always", 100],
  },
};
