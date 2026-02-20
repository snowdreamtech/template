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
     - `npx --yes skills add ${github_proxy}https://github.com/vercel-labs/agent-skills --all`
     - `npx --yes skills add ${github_proxy}https://github.com/anthropics/skills --all`
     - `npx --yes skills add ${github_proxy}https://github.com/antfu/skills --all`
     - `npx --yes skills add ${github_proxy}https://github.com/github/awesome-copilot --all`
     - `npx --yes skills add ${github_proxy} https://github.com/browser-use/browser-use --all`
     - `npx --yes skills add ${github_proxy}https://github.com/wshobson/agents --skill postgresql-table-design`
     - `npx --yes skills add ${github_proxy}https://github.com/redis/agent-skills --skill redis-development`
     - `npx --yes skills add ${github_proxy}https://github.com/wshobson/agents --skill bash-defensive-patterns`
     - `npx --yes skills add ${github_proxy}https://github.com/sickn33/antigravity-awesome-skills --skill docker-expert`
     - `npx --yes skills add ${github_proxy}https://github.com/jeffallan/claude-skills --skill kubernetes-specialist`
     - `npx --yes skills add ${github_proxy}https://github.com/jeffallan/claude-skills --skill golang-pro`
     - `npx --yes skills add ${github_proxy}https://github.com/jeffallan/claude-skills --skill flutter-expert`
     - `npx --yes skills add ${github_proxy}https://github.com/wshobson/agents --skill rust-async-patterns`
     - `npx --yes skills add ${github_proxy}https://github.com/apollographql/skills --skill rust-best-practices`
     - `npx --yes skills add ${github_proxy}https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max`
     - `npx --yes skills add ${github_proxy}https://github.com/coreyhaines31/marketingskills --skill seo-audit`
     - `npx --yes skills add ${github_proxy}https://github.com/squirrelscan/skills --skill audit-website`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill brainstorming`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill systematic-debugging`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill writing-plans`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill test-driven-development`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill executing-plans`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill requesting-code-review`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill using-superpowers`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill subagent-driven-development`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill verification-before-completion`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill receiving-code-review`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill using-git-worktrees`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill writing-skills`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill dispatching-parallel-agents`
     - `npx --yes skills add ${github_proxy}https://github.com/obra/superpowers --skill finishing-a-development-branch`
