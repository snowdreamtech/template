---
description: Initialize the project to prepare for subsequent development.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Initialize Environment and Skills**
   - Ensure the development environment supports the following tools and languages: `nodejs`, `python`.
   - Ensure the IDE installs recommended extensions and plugins based on the project configuration files.
   - Review `$ARGUMENTS`, the project structure, and existing code to determine which skills are necessary, optional, or recommended.
   - Based on the analysis, install the following skills. You should determine the installation priority:
     - `npx --yes skills add ${github_proxy}https://github.com/vercel-labs/skills --all`
     - `npx --yes skills add ${github_proxy}https://github.com/vercel-labs/next-skills --all`
     - `npx --yes skills add ${github_proxy}https://github.com/anthropics/skills --all`
     - `npx --yes skills add ${github_proxy}https://github.com/antfu/skills --all`
     - `npx --yes skills add ${github_proxy}https://github.com/github/awesome-copilot --all`
