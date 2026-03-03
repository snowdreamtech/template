module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 120],
    "subject-max-length": [2, "always", 120],
    "body-max-line-length": [2, "always", 120],
    "footer-max-line-length": [2, "always", 120],
    "type-enum": [2, "always", ["feat", "fix", "docs", "style", "refactor", "test", "chore", "ci", "perf", "build"]],

    // Custom rule: Disallow Chinese characters in commit messages
    "no-chinese": [2, "always"],
  },
  plugins: [
    {
      rules: {
        "no-chinese": ({ header, body, footer }) => {
          const text = `${header}\n${body}\n${footer}`;
          const hasChinese = /[\u4e00-\u9fa5]/.test(text);
          return [!hasChinese, "Commit message must be in English only (no Chinese characters allowed)."];
        },
      },
    },
  ],
};
