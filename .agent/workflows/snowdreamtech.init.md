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

   ### 1. Minimal Runtime (Mandatory)
   - `npx skills add https://github.com/vercel-labs/skills --skill find-skills`
   - `npx skills add https://github.com/anthropics/skills --skill skill-creator`
   - `npx skills add https://github.com/anthropics/skills --skill docx`
   - `npx skills add https://github.com/anthropics/skills --skill xlsx`
   - `npx skills add https://github.com/anthropics/skills --skill pptx`
   - `npx skills add https://github.com/anthropics/skills --skill pdf`
   - `npx skills add https://github.com/anthropics/skills --skill frontend-design`
   - `npx skills add https://github.com/anthropics/skills --skill webapp-testing`
   - `npx skills add https://github.com/anthropics/skills --skill mcp-builder`
   - `npx skills add https://github.com/anthropics/skills --skill canvas-design`
   - `npx skills add https://github.com/anthropics/skills --skill algorithmic-art`
   - `npx skills add https://github.com/anthropics/skills --skill web-artifacts-builder`
   - `npx skills add https://github.com/anthropics/skills --skill theme-factory`
   - `npx skills add https://github.com/anthropics/skills --skill internal-comms`
   - `npx skills add https://github.com/anthropics/skills --skill doc-coauthoring`
   - `npx skills add filesystem`
   - `npx skills add git`
   - `npx skills add shell`
   - `npx skills add fetch`
   - `npx skills add json`
   - `npx skills add yaml`
   - `npx skills add markdown`
   - `npx skills add path`

   ### 2. Recommended Runtime (Commonly Used)
   - `npx skills add xml`
   - `npx skills add toml`
   - `npx skills add ini`
   - `npx skills add csv`
   - `npx skills add html`

   - `npx skills add process`
   - `npx skills add sqlite`
   - `npx skills add openapi`
   - `npx skills add http`
   - `npx skills add compression`
   - `npx skills add crypto`

   ### 3. Advanced Runtime (High-Level Integration)
   - `npx skills add docker`
   - `npx skills add kubernetes`
   - `npx skills add terraform`
   - `npx skills add aws`
   - `npx skills add gcp`
   - `npx skills add azure`

   - `npx skills add postgres`
   - `npx skills add redis`
   - `npx skills add rabbitmq`
   - `npx skills add elasticsearch`

   - `npx skills add protobuf`
   - `npx skills add graphql`
   - `npx skills add dotenv`
   - `npx skills add properties`
