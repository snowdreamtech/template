module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 100],
    "subject-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 100],
    "footer-max-line-length": [2, "always", 100],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "deps",
        "security",
      ],
    ],
    // Custom rule: Disallow Chinese characters in commit messages
    "no-chinese": [2, "always"],
  },
  plugins: [
    {
      rules: {
        "no-chinese": ({ header, body, footer }) => {
          // Avoid matching "undefined" or "null" literal strings if parts are missing
          const text = [header, body, footer].filter(Boolean).join("\n");
          // Match CJK ideographs, CJK symbols/punctuation, and half/full-width forms
          const hasChinese = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(text);
          return [
            !hasChinese,
            "Commit message must be in English only (no Chinese characters or punctuation allowed).",
          ];
        },
      },
    },
  ],
};
