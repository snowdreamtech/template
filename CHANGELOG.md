<!-- DO NOT EDIT MANUALLY - This file is managed by automated professional tools -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2026-03-15)


### Features

* add .devcontainer configuration for one-click dev environment ([48dfe45](https://github.com/snowdreamtech/template/commit/48dfe459c9c15a7a155b5c142bed60cd5798a88f))
* add init target to Makefile to hydrate project from template ([23a61be](https://github.com/snowdreamtech/template/commit/23a61be8fed1e58edf63dcad1b222e7a57c28e7e))
* add Makefile with standard development targets ([c265cd3](https://github.com/snowdreamtech/template/commit/c265cd3adbb8d589c8aba19f0a03f94021d688de))
* add packageManager field and AI-native GitHub issue templates ([3a3ef24](https://github.com/snowdreamtech/template/commit/3a3ef2465a7233cb91616f005f7b14bebf0f8ac7))
* add patterns to .gitignore for Ansible vault passwords, facts cache, navigator artifacts, and external collections. ([af9506e](https://github.com/snowdreamtech/template/commit/af9506e9305b1a55ce74963d030d65ee77f7f2b6))
* add PowerShell linter setup and adjust linting workflow to use pipeline input for script analysis ([752808e](https://github.com/snowdreamtech/template/commit/752808e9fbdc07815c9fb401d3a7df2408083e41))
* Add Windows compatibility for project initialization by introducing PowerShell and CMD wrappers that delegate to `init-project.sh`. ([94a7b6a](https://github.com/snowdreamtech/template/commit/94a7b6ae437524eed3da6e82ed5f9602cbd6ee89))
* **aide:** add rules definition mirroring .cline/rules structure ([952febb](https://github.com/snowdreamtech/template/commit/952febbc176e8b8a57a540272dffd84e1fae0925))
* **audit:** integrate multi-stack security audit tools (Go, Rust, Containers) and add summary report ([8e123b0](https://github.com/snowdreamtech/template/commit/8e123b011f63f8e652aac523436c1f98550d9214))
* **ci:** ensure all lint tools are installed via setup script ([091ebc2](https://github.com/snowdreamtech/template/commit/091ebc266dc5f7dea64326d5e6b62fb4f6f5737a))
* **ci:** implement modular setup and JIT tool installation ([8351b98](https://github.com/snowdreamtech/template/commit/8351b98e0c160fbf122316633ccfa1d0a475fd9b))
* **ci:** implement split matrix architecture for quality gate ([6e22df7](https://github.com/snowdreamtech/template/commit/6e22df764a382a9b2569d6dfdfa56551d5e03a8d))
* **ci:** standardize dev tooling and github workflows ([5c8753d](https://github.com/snowdreamtech/template/commit/5c8753defca18272a27c6af7984314b15ec1028a))
* **cli:** introduce interactive commitizen commit interface ([147f40c](https://github.com/snowdreamtech/template/commit/147f40c5cfe15ba790ccb8ed38710f2d058a60ad))
* complete holistic project perfection with constant-driven library and verify CI pipeline ([ee09231](https://github.com/snowdreamtech/template/commit/ee092313c7b704bd8bc2448053f98d3a4fe64511))
* complete holistic project perfection with constant-driven library and verify CI pipeline ([c6cd246](https://github.com/snowdreamtech/template/commit/c6cd246aef3d0448ca8ba7253a604b793d5f0490))
* complete holistic project perfection with constant-driven library and verify CI pipeline ([c3610eb](https://github.com/snowdreamtech/template/commit/c3610eb5885ec1a648e6a10cfbbb73de759f7473))
* **dev:** add universal devcontainer configuration ([a951af1](https://github.com/snowdreamtech/template/commit/a951af1cb680b2856402a184731535776ede415b))
* **devcontainer:** implement hybrid Docker/Compose setup with documentation ([0122b37](https://github.com/snowdreamtech/template/commit/0122b379e3ced2da95cc42c05f3980ee128ea1c2))
* **devcontainer:** switch to multi-container setup with docker-compose (Option 1) ([a3fb304](https://github.com/snowdreamtech/template/commit/a3fb304b01bd83a08b273d5de41e6072ebdc07d8))
* **devcontainer:** sync settings and extensions from .vscode ([a929550](https://github.com/snowdreamtech/template/commit/a929550288ddc2504f7d1a5a8c0730e093707b5c))
* enable CodeQL analysis for GitHub Actions workflow files ([8aa0ca5](https://github.com/snowdreamtech/template/commit/8aa0ca5874591b7614893f977be4da26b55c1159))
* **env:** enhance check-env with broad language support and robust versioning ([914f428](https://github.com/snowdreamtech/template/commit/914f428b5d4932315c2769cba07671b2f5abe3e8))
* expand .gitignore with comprehensive rules for common development tools and build artifacts, removing specific vault password files. ([5dd3ed7](https://github.com/snowdreamtech/template/commit/5dd3ed781eff30cdbb2fbe5d551c79b5a1d2071f))
* **github:** add community health files and issue templates ([02a02b7](https://github.com/snowdreamtech/template/commit/02a02b748558451bb9452ff9400fb243e875c39c))
* **git:** ignore and remove health report artifacts ([38a0def](https://github.com/snowdreamtech/template/commit/38a0defc03703e9a035594d36e0f90bb6034d15c))
* **ide:** expand VS Code launch variants for core languages ([174dfed](https://github.com/snowdreamtech/template/commit/174dfed50f2c27adf87f57200942e4ca58eae6fa))
* implement atomic changelog updates and deduplication for archived entries in the changelog archiving script ([d0422bf](https://github.com/snowdreamtech/template/commit/d0422bf763854c0b2fb0e8b3a4dfcbf7c492b569))
* implement update, audit, and bench script suites with SSoT delegation ([344266f](https://github.com/snowdreamtech/template/commit/344266fda8123b638ded8aea057c79aac85e5db4))
* integrate update, audit, and bench suites into Makefile and package.json ([e4de6f9](https://github.com/snowdreamtech/template/commit/e4de6f9442a562c80d6463a5ab3fe55115d2d227))
* **lint:** ensure 100% robust linting coverage across all tools and platforms ([877578e](https://github.com/snowdreamtech/template/commit/877578eefda3b0a811abefeb6b9d88e1ced21ce0))
* **lint:** expand lint-wrapper with Go and Node.js runtime checks ([3ebf52a](https://github.com/snowdreamtech/template/commit/3ebf52a9665dc77ef7c497ceec6dcfb5c0278889))
* **lint:** expand pre-commit with rust and goreleaser v2 support ([64a2088](https://github.com/snowdreamtech/template/commit/64a2088e1b4067f8d163e014411da87d72110e57))
* **lint:** localize gitleaks binary into .venv/bin via scripts/setup.sh ([23df3c5](https://github.com/snowdreamtech/template/commit/23df3c5dca5c2f0754c9d3b20bdecae777148207))
* **lint:** replace hadolint with dockerfile-utils in pre-commit ([5184d3a](https://github.com/snowdreamtech/template/commit/5184d3aba9d6313dd0ee9b8b4412364ffbbf4540))
* **makefile:** implement automatic Node.js package manager detection ([256e5b6](https://github.com/snowdreamtech/template/commit/256e5b60d1eb8a00e5834e3036dbb2f3d1ba1ca0))
* **ops:** expand init-project.sh scaffolding and finalize project standards ([9244c44](https://github.com/snowdreamtech/template/commit/9244c44364b535231a0a242923f1920a9ac2d3ce))
* **pre-commit:** add 13 language-level lightweight lint hooks for shift-left quality ([3116891](https://github.com/snowdreamtech/template/commit/31168913f2e7ec67c01ba50daf06f6ec177b0f2f))
* **pre-commit:** migrate checkmake to local shift-left with quiet config ([6520c16](https://github.com/snowdreamtech/template/commit/6520c16edbd6444420570af4feec3b79560a4280))
* **productivity:** add rules sync, hydration script, and VS Code configs ([2819e61](https://github.com/snowdreamtech/template/commit/2819e618033ced6e74cf2a1ec358a10ecd24c865))
* **productivity:** expand launch and tasks with Vue/React support ([1c79578](https://github.com/snowdreamtech/template/commit/1c7957800021a87bd0b20d00dab8d3d6b55d21b3))
* **release:** add advanced verbosity control (-q, -v) to archiving script ([1cfe633](https://github.com/snowdreamtech/template/commit/1cfe63381195ba0177a576cfc81004c86d952074))
* **release:** add automated major-version changelog archiving ([2ae9641](https://github.com/snowdreamtech/template/commit/2ae96418019fdcf715a46830a671ad62b25af948))
* **release:** add execution context guard to archiving script ([34e020e](https://github.com/snowdreamtech/template/commit/34e020e61dffb120ce6a3aa293e9c13dc56b2d01))
* **release:** enhance archiving script with ANSI colors and smart directory discovery ([610bc86](https://github.com/snowdreamtech/template/commit/610bc866a555393265b6d1475b618ce4569684d9))
* **release:** ensure POSIX compliance and cross-platform support for archiving ([e41ca71](https://github.com/snowdreamtech/template/commit/e41ca71ba4915f24149b8311675e2fe5a465c927))
* **release:** ensure robust history generation and correct grep parsing ([2809172](https://github.com/snowdreamtech/template/commit/280917272a48d20feb647d6e321be8acbd0ec05d))
* **release:** final polish for archiving script (validation, normalization, logging) ([b73a671](https://github.com/snowdreamtech/template/commit/b73a671e2ab7a8e974e0d0753576f8bcb6c3a963))
* **release:** fix history recursion bug and add help interface to archiving script ([58afaab](https://github.com/snowdreamtech/template/commit/58afaabc2f1eb633a918ed0f0f4ee00c9b38a90d))
* **release:** implement check-env suite with SSoT delegation and professional CLI ([aeb8378](https://github.com/snowdreamtech/template/commit/aeb8378cb001d1bb04be27e6665c89c667423cc4))
* **release:** implement cleanup suite with SSoT delegation and professional CLI ([aa7b7f3](https://github.com/snowdreamtech/template/commit/aa7b7f30d42879ea7f86917e0c098c12c5ecceef))
* **release:** implement GitHub Actions Job Summary in archiving script ([e857b92](https://github.com/snowdreamtech/template/commit/e857b92b648f48358dfe3eda5116f09a616acd20))
* **release:** implement multi-language version discovery in archiving script ([ad2d0f5](https://github.com/snowdreamtech/template/commit/ad2d0f5ab503193936af19d11780efa76364c40d))
* **release:** implement unified build suite with SSoT delegation and professional CLI ([6f43bb4](https://github.com/snowdreamtech/template/commit/6f43bb42487a9ca9c5b563b3747ccbd2d3a69d6b))
* **release:** implement unified commit suite with SSoT delegation and professional CLI ([2fb37bf](https://github.com/snowdreamtech/template/commit/2fb37bf9eb6e3f9268366a8ad2577c2848a430d8))
* **release:** implement unified docs suite with SSoT delegation and professional CLI ([dbf6c81](https://github.com/snowdreamtech/template/commit/dbf6c8131320afbfe53ff33dcd16cd8781cd3efb))
* **release:** implement unified env suite and integrate perfection tools into Makefile ([b4cd344](https://github.com/snowdreamtech/template/commit/b4cd344067598b9ae89df9122378fec526452209))
* **release:** implement unified format suite with SSoT delegation and professional CLI ([93b5bca](https://github.com/snowdreamtech/template/commit/93b5bcae4c553481c6e2f6be8f1d3d00dd0aba5d))
* **release:** implement unified install suite with SSoT delegation and professional CLI ([e5bcdd3](https://github.com/snowdreamtech/template/commit/e5bcdd3c902fb176cacd309fe467cb8445e32463))
* **release:** implement unified lint suite with SSoT delegation and professional CLI ([7b4b91d](https://github.com/snowdreamtech/template/commit/7b4b91da5e163659643b30efbf80f23af33dc89f))
* **release:** implement unified release suite with SSoT delegation and professional CLI ([d7ef010](https://github.com/snowdreamtech/template/commit/d7ef0100799d3a092019764a25c1d444f1cad505))
* **release:** implement unified test suite with SSoT delegation and professional CLI ([6b859f8](https://github.com/snowdreamtech/template/commit/6b859f8d0b5a7f9c6fc651eae0c54cafad2b8564))
* **release:** implement unified verify suite with SSoT delegation and professional CLI ([0e202f8](https://github.com/snowdreamtech/template/commit/0e202f8070f7dad4a693edf88ecea59f2a2fe5f1))
* **release:** improve script robustness and multi-language support ([7c2f3fd](https://github.com/snowdreamtech/template/commit/7c2f3fd25e023d94600b3c496dc17f4e224cd278))
* **release:** masterpiece archiving refinements (universal versioning, subdirectory support, concurrency lock) ([7a8ace0](https://github.com/snowdreamtech/template/commit/7a8ace01c9197b12998196a6d57f2ed073dc1d47))
* **release:** polish archiving script with dry-run, traps, and history sorting ([70e4068](https://github.com/snowdreamtech/template/commit/70e4068a76b7786cd1ac88415b736126469d7e7d))
* **release:** refactor Makefile and package.json to delegate tasks to standardized scripts ([1013cc9](https://github.com/snowdreamtech/template/commit/1013cc9e040727653660d582300609579f6cd993))
* **release:** standardize init-project.sh with help, dry-run, and execution guard ([2889e9c](https://github.com/snowdreamtech/template/commit/2889e9c3f2ca5718c6bb73f848b80a9344109eb3))
* **release:** standardize setup.sh with help, execution guard, and CI summary ([ad0380d](https://github.com/snowdreamtech/template/commit/ad0380d239c7e5b11fd5170b31611a782682c894))
* **release:** standardize Windows script wrappers with SSoT delegation pattern ([d27d33a](https://github.com/snowdreamtech/template/commit/d27d33a427e3d2582a82f57e6b85bfb662a4165e))
* **release:** unify professional CLI standard (logging, verbosity, flags) across all scripts ([3aa1b82](https://github.com/snowdreamtech/template/commit/3aa1b82cb6a6ad23402e1732ff3d7e0d9b50d643))
* **release:** upgrade release orchestration with manifest sync and v-prefix standardization ([c02612e](https://github.com/snowdreamtech/template/commit/c02612e5aad62692c677a040772249c2e2db10ba))
* **rules:** mandate POSIX shell and cross-platform delegation chain ([65b2012](https://github.com/snowdreamtech/template/commit/65b20129c5cbc921d5ae8724d059d68d54ed8905))
* **scripts:** add idempotency guard to install_checkmake in setup.sh ([42a77db](https://github.com/snowdreamtech/template/commit/42a77db111fdae1ffd315165af35b90b53f0a7f9))
* **scripts:** add MacPorts support and fix hadolint version ([de21817](https://github.com/snowdreamtech/template/commit/de21817c86f5f16c89051eba9fbc89cd730dc7a8))
* **scripts:** add non-interactive mode and TTY detection to init-project.sh ([b752331](https://github.com/snowdreamtech/template/commit/b7523319d6bc52eeaf29d4eeb6f7e2b752284e6f))
* **scripts:** consolidate success footers and refine reporting logic ([982ea30](https://github.com/snowdreamtech/template/commit/982ea30dab26f84c0dc526e2dbba46722f07f2ce))
* **scripts:** enhance check-env with ruby support and language-aware detection ([9d0e292](https://github.com/snowdreamtech/template/commit/9d0e292be683742bcd7d81e2357bf1ead7923a8c))
* **scripts:** enhance resilience, add interactive sync and standardized error tracking ([49281f8](https://github.com/snowdreamtech/template/commit/49281f802eb6a9b0da28182002257d75d6b49280))
* **scripts:** expanded backend and mobile language support in check-env ([c9a8548](https://github.com/snowdreamtech/template/commit/c9a8548c401a02f5f0af1c0ddf22a68cda7391d5))
* **scripts:** extend 24h cooldown to pnpm, rubocop, and pre-commit updates ([c6b7e1a](https://github.com/snowdreamtech/template/commit/c6b7e1a723628f351cdbdcaa698a4784324c750c))
* **scripts:** implement robust file-based language detection for tool installation ([437d075](https://github.com/snowdreamtech/template/commit/437d0756bf125b4ecb9e619729fb14dd4119c816))
* **scripts:** remove output suppression for better auditing ([7e132de](https://github.com/snowdreamtech/template/commit/7e132de1a295d1605f1745d5c5f9d41cc4085636))
* **scripts:** standardize success messages and Next Action prompts ([59b0e51](https://github.com/snowdreamtech/template/commit/59b0e517942a60eae3077ade1afa8b93c91660e5))
* **scripts:** support conditional output suppression via run_quiet helper ([1c85246](https://github.com/snowdreamtech/template/commit/1c85246c0600a249ae037afaf08c7071944d9e5d))
* **scripts:** support Go (go get) and Rust (cargo update) in update.sh ([6d2c0a5](https://github.com/snowdreamtech/template/commit/6d2c0a5e48cd3e9ebed1ba8fdbb6c1e1d3da4735))
* **security:** integrate security audit tools and enhance auditing scripts ([a4ccb53](https://github.com/snowdreamtech/template/commit/a4ccb53907692a0ca5790009f8d71e8b94ec6c23))
* **security:** protect CHANGELOG.md from manual and AI-agent edits ([b21ce3a](https://github.com/snowdreamtech/template/commit/b21ce3a5bf2f6330956d12d735a29cfbe106918e))
* set Ruff line length to 120 ([3f91ec5](https://github.com/snowdreamtech/template/commit/3f91ec5cf6d0098c6b3ace26b9f6fadbdebf7114))
* **setup:** enhance execution summary with diagnostic categories and privacy protections ([0695152](https://github.com/snowdreamtech/template/commit/06951521ca9ded3914c9b66e754c21b3ba7fe244))
* **setup:** enhance execution summary with legend and warning logic ([6c6c725](https://github.com/snowdreamtech/template/commit/6c6c7253bec640da56da5ba13da0e8a5060f1202))
* synchronize all 18 tool suites into package.json scripts ([17e8670](https://github.com/snowdreamtech/template/commit/17e867098b31fa8d52de167a70ebf4ded09d9c7a))
* **tests:** add comprehensive BATS test suite for scripts ([f5fc91b](https://github.com/snowdreamtech/template/commit/f5fc91b94c85ad3054a2719014621d1982e3d133))
* Update numerous AI agent rules, prompts, and workflows, and add Prettier configuration. ([03602fb](https://github.com/snowdreamtech/template/commit/03602fb5907df8a4248ccf9d463ec5f6a36eaf04))


### Bug Fixes

* add dearmor and keyrings to cspell dictionary ([8b27434](https://github.com/snowdreamtech/template/commit/8b27434687d0be301dc7babd9a6a408ef9e4dcd8))
* address audit gaps in init-project.sh and goreleaser config ([03ea4a3](https://github.com/snowdreamtech/template/commit/03ea4a326222809e672448719b56a18bad30fd72))
* align Makefile setup target with workflow requirements ([6392e67](https://github.com/snowdreamtech/template/commit/6392e67238787f155f111d557e23e7434f68b430))
* **audit:** add pip-audit to dev dependencies and update audit script ([dcebb26](https://github.com/snowdreamtech/template/commit/dcebb26946a660316d4a358ac66c75e00c36dda9))
* **audit:** integrate direct Node.js audit and fix summary reporting ([3f6668b](https://github.com/snowdreamtech/template/commit/3f6668b42246e10517ebadc81a69ac6ade3b6b28))
* **changelog:** replace broken HEAD...HEAD diff link with correct commits URL ([b443075](https://github.com/snowdreamtech/template/commit/b4430755c8b8c36ddba73c5dcbf98bace5f5c7c2))
* **ci:** add --shell=sh flag to shellcheck for POSIX compliance validation ([30b73f5](https://github.com/snowdreamtech/template/commit/30b73f5ddb5592aaf858c4cce46018097eecf1bd))
* **ci:** add missing stylelint and sort-package-json to global install ([e37850d](https://github.com/snowdreamtech/template/commit/e37850da6036e9b3631111de7a5b55c683749e6b))
* **ci:** add required permissions for lint workflow calls ([34543bf](https://github.com/snowdreamtech/template/commit/34543bf47584d4de16b0add1249089af9218240f))
* **ci:** address POSIX sh compatibility in setup logic ([57d9faa](https://github.com/snowdreamtech/template/commit/57d9faaf62f2017ae18f7e6c2c633f3aaf3e26c9))
* **ci:** ensure summaries are printed to stdout even if GITHUB_STEP_SUMMARY is set ([1ed3cfa](https://github.com/snowdreamtech/template/commit/1ed3cfa588205ff4a0dc3172889216cd9f95cdb0))
* **ci:** handle missing dependencies gracefully in dry-run mode to fix recursive test failures ([fe66d7c](https://github.com/snowdreamtech/template/commit/fe66d7c5f0862c12df45216b30f74d4fdc2337fa))
* **ci:** pin actions/checkout to stable v6.0.2 ([addc3f4](https://github.com/snowdreamtech/template/commit/addc3f463b5ac41911ecc523c7cc97c19ce9ab0f))
* **ci:** remove deprecated semgrep-action; fix python 3.12 compat ([9c25d50](https://github.com/snowdreamtech/template/commit/9c25d50c245cb2178666529fa318b4c67f9a7f93))
* **ci:** replace broken pip semgrep with semgrep-action ([f88d1c8](https://github.com/snowdreamtech/template/commit/f88d1c8a04d60c64fe814216bee0578de261c93b))
* **ci:** synchronize lockfile and improve tool versioning ([2cbb532](https://github.com/snowdreamtech/template/commit/2cbb53240bc0e8250a92fa145addd608207b13b9))
* correct MacPorts actionlint port name in Makefile setup target ([4703245](https://github.com/snowdreamtech/template/commit/4703245f0b1a62bd06f7d7a5a5fb3859a533d80a))
* correct package names across all package managers in Makefile setup target ([c74f2fc](https://github.com/snowdreamtech/template/commit/c74f2fce0d2647ba1453e7f12fea24123dc9ed04))
* **deps:** add GITHUB_PROXY prefix to curl and Invoke-WebRequest downloads ([3ed9402](https://github.com/snowdreamtech/template/commit/3ed940208e3e0aa3dd2f10d8c05175876d501ac6))
* **deps:** add pnpm overrides to fix security vulnerabilities ([0e29494](https://github.com/snowdreamtech/template/commit/0e294946af6a36b23dc8651b91c914bdc368751b))
* **deps:** remove invalid pnpm and yarn ecosystems from dependabot configuration ([ecefd20](https://github.com/snowdreamtech/template/commit/ecefd2072e72038870c264f557ea1be5a660f8ca))
* **devcontainer:** apply security hardening to compose services ([bb05e99](https://github.com/snowdreamtech/template/commit/bb05e9939e656aced40fc46456593377b535c65d))
* **docs:** add .md extension to internal links to fix lychee link checker errors ([c87a922](https://github.com/snowdreamtech/template/commit/c87a92220bec3d1d84713b65621415bd6be2b0e4))
* **docs:** use AI-generated PNG as site logo ([17f098b](https://github.com/snowdreamtech/template/commit/17f098b18231ed4b12026a7ecba7bb57c804eae4))
* **gha:** correct trivy-action tag name ([1388b3e](https://github.com/snowdreamtech/template/commit/1388b3eb42e42673d2295ce3b85c17ee646d074a))
* **gha:** grant contents: read permission to jobs calling reusable verify workflow ([8c6cb07](https://github.com/snowdreamtech/template/commit/8c6cb070380695af7a64bd9ff12bfde227be2e4a))
* **gha:** move concurrency to job-level in reusable workflows to prevent deadlocks ([09fd9e0](https://github.com/snowdreamtech/template/commit/09fd9e0484e80c051cc082fb5e09fb9c0a4fa856))
* **gitattributes:** add CRLF line endings for *.ps1 and *.bat files ([294fc0f](https://github.com/snowdreamtech/template/commit/294fc0f621e61cc0f1c90a2948acee6d9ced889c))
* **git:** correct hook escaping in .pre-commit-config.yaml ([def163b](https://github.com/snowdreamtech/template/commit/def163bb0967e32acf68506cd2d51c451097f72d))
* **git:** force commitlint to always run on commit-msg stage ([8a35f8b](https://github.com/snowdreamtech/template/commit/8a35f8b1663c92f1743701542403bd5070dc0fa2))
* **hooks:** replace non-portable sed with python one-liner ([6c6c725](https://github.com/snowdreamtech/template/commit/6c6c7253bec640da56da5ba13da0e8a5060f1202))
* **hooks:** resolve PSScriptAnalyzer argument injection and missing module errors ([cf3d3f6](https://github.com/snowdreamtech/template/commit/cf3d3f63fe2cfc7168fa05071d56ffc378ac1b6e))
* **hooks:** use perfect cross-platform python one-liner for trailing-whitespace ([55f090c](https://github.com/snowdreamtech/template/commit/55f090c76da93a59bdafde029fa681c57f721f1c))
* install actionlint-py only on APT/DNF Linux, remove from shared pip step ([8d11254](https://github.com/snowdreamtech/template/commit/8d11254f5ed5b4d0b2edbfac5e3eb95212ad56f7))
* install trivy via apt repo (github releases temporarily unavailable) ([3e256fd](https://github.com/snowdreamtech/template/commit/3e256fd2786444b55ea24e388ed0bf7046dbc871))
* **lint:** correct line endings for Windows scripts to CRLF ([d0d57e9](https://github.com/snowdreamtech/template/commit/d0d57e9b7fd6c5bad1510eae6bb59f2b8fd86b88))
* **lint:** ignore pnpm-lock.yaml in prettier and fix typo ([81f5b28](https://github.com/snowdreamtech/template/commit/81f5b286101b028c94f2a8130ae58630c53a268b))
* **lint:** ignore PRUNE_DIRS in makefile lint tools ([64d2e77](https://github.com/snowdreamtech/template/commit/64d2e773a55ed234a5aefc8fa05292f529291198))
* **lint:** migrate editorconfig-checker to native binary to avoid rate limits ([887477a](https://github.com/snowdreamtech/template/commit/887477af0c3007f1012ff7a72fadf4c938072433))
* **lint:** prevent custom pre-commit hooks from destroying CRLF endings ([3ad4fee](https://github.com/snowdreamtech/template/commit/3ad4feee17041efa349e8a208e05fc44cf2fc91f))
* **lint:** prevent global exclusions from bypassing repo-wide hooks ([d9c06d1](https://github.com/snowdreamtech/template/commit/d9c06d16fd47aa7c6f4e1d5c64c8c7700ecbbeb4))
* **lint:** remove always_run from language-specific linters to support polyglot omitting ([cd75561](https://github.com/snowdreamtech/template/commit/cd755614a5accc7d436d85d896c3d6895ddc876a))
* **lint:** replace Write-Host with Write-Output in PowerShell scripts ([5b39531](https://github.com/snowdreamtech/template/commit/5b39531f5e814a351526413c5248ac3f9167ee05))
* **lint:** resolve audit issues from post-commit review ([413ce30](https://github.com/snowdreamtech/template/commit/413ce30cd9a592eb510c76bfe81ae2f3971ebf3f))
* **lint:** skip pre-commit execution in dry-run mode when tool is missing ([f4cf6f3](https://github.com/snowdreamtech/template/commit/f4cf6f3e188881d54876331fc6506d7c5fbfd362))
* **powershell:** rename Delegate-To-Shell to Invoke-ShellDelegation ([38f8c57](https://github.com/snowdreamtech/template/commit/38f8c5755cb5aa5f7e8e6247aa6128168850be8e))
* **pre-commit:** add shfmt -i 2 to enforce space indentation ([e2ef3aa](https://github.com/snowdreamtech/template/commit/e2ef3aa5e798b86a6cec3099cebfac995c5ac736))
* **productivity:** resolve syntax errors in VS Code configs ([3d3ab85](https://github.com/snowdreamtech/template/commit/3d3ab8520ea65dd3df8f022915a5b9573bc30104))
* remove non-existent sync-rules command from init script ([da95e6f](https://github.com/snowdreamtech/template/commit/da95e6ff33d6baff5dce1d5953a06ca40259acc0))
* remove unsupported noSymlinks and globbyOptions from markdownlint-cli2 config ([39bcb4e](https://github.com/snowdreamtech/template/commit/39bcb4eff5112b793737a0fa63874b986c43f3e2))
* replace broken trivy-action with direct binary install to avoid source checkout bug ([00139ca](https://github.com/snowdreamtech/template/commit/00139ca6b65a6b2683bd753b91bcd13b386a5db0))
* **rules:** add JetBrains AI rules and upgrade GitHub Copilot instructions to full rule set ([cf73bfc](https://github.com/snowdreamtech/template/commit/cf73bfc8c56e054efc554576db4f733e8ee7c948))
* **rules:** add missing JetBrains AI rules and upgrade GitHub Copilot instructions ([4e12369](https://github.com/snowdreamtech/template/commit/4e12369e474c2c5630092f03b1df76e5ce39a065))
* **scripts:** add idempotency guards for govulncheck and cargo-audit in setup.sh ([0497217](https://github.com/snowdreamtech/template/commit/049721702d20698395797fb57a388fb687b94e41))
* **scripts:** correct typo by replacing info with log_info in setup.sh ([a5c14e7](https://github.com/snowdreamtech/template/commit/a5c14e7f926c87bd25106482ebc85a2cdda0e041))
* **scripts:** correct variable naming bugs in setup.sh install_checkmake ([03470b8](https://github.com/snowdreamtech/template/commit/03470b85c663523c6ee7c5d9365e2b2192c99a6f))
* **scripts:** replace Write-Host with Write-Information in setup.ps1 ([3a2baf7](https://github.com/snowdreamtech/template/commit/3a2baf7eedb9aeae15eb741136664da16067a897))
* **scripts:** resolve infinite loop and polish staging UX in commit script ([048f582](https://github.com/snowdreamtech/template/commit/048f58297554ba978aea8f37fe4f223b144f423a))
* **scripts:** resolve infinite loop in commit script and harden npm runners ([7e0a921](https://github.com/snowdreamtech/template/commit/7e0a9212d40696c13b2302c22836ce4890fc5078))
* **scripts:** resolve regressions in cleanup.sh and init-project tests ([b854483](https://github.com/snowdreamtech/template/commit/b854483d741524bcb7a67ce7d1c5dcca2cf08781))
* **scripts:** resolve update.sh syntax error and add 24h cooldown for package managers ([4696ab5](https://github.com/snowdreamtech/template/commit/4696ab55676c7ce2734ff4f43370cf8c7b3975cd))
* **scripts:** support pnpm self-update with corepack fallback in update.sh ([07be3b6](https://github.com/snowdreamtech/template/commit/07be3b6fead42adfd4c9c34abb84b6ab8eac8bca))
* **scripts:** use approved verb Invoke and configure PSScriptAnalyzer rules ([c4689d5](https://github.com/snowdreamtech/template/commit/c4689d5c1f104da718640d5f7090e64a99e1197e))
* **setup:** add dry-run guards to installation modules ([e0f8218](https://github.com/snowdreamtech/template/commit/e0f82187e0f2e8854785100f85dd9cf66a7a3f6c))
* **setup:** avoid duplicate summary header across CI steps ([dff40dd](https://github.com/snowdreamtech/template/commit/dff40dd68f3e1e04ce5636a5d5dae27cce4a5371))
* **setup:** avoid non-POSIX upstream tflint installer ([98f11c3](https://github.com/snowdreamtech/template/commit/98f11c31b4d80ef0a0a3e285be28f36108192437))
* **setup:** avoid script exit on framework/runtime detection failure ([f45d4ea](https://github.com/snowdreamtech/template/commit/f45d4ea3c53a85a5f085b25ffe56dd7c5f0b376c))
* **setup:** move global detections to init block to prevent CI duplication ([35e1f59](https://github.com/snowdreamtech/template/commit/35e1f59d4879f0b01217624990b2ec3ad2ad439d))
* **setup:** prevent duplicate legend and refine version detection ([48910aa](https://github.com/snowdreamtech/template/commit/48910aa3cbb809d98a0d9c3a2e730c829bebb74f))
* **setup:** robust cross-step summary duplication suppression in CI ([7d735ef](https://github.com/snowdreamtech/template/commit/7d735ef411e7235863a37a1f65757e99c7de5b8f))
* **setup:** simplify summary duplication logic using a single master sentinel ([fe4f43c](https://github.com/snowdreamtech/template/commit/fe4f43cee4c4bbe1a13fb6360b512d7df31c3210))
* **test:** resolve failures in bench and update scripts during dry-run ([5e552c9](https://github.com/snowdreamtech/template/commit/5e552c93a3632685c14225306aa7bef6157719e8))
* **test:** resolve pester scoping failure and refine pytest detection ([90d27c5](https://github.com/snowdreamtech/template/commit/90d27c5b3d4ff9aabe00aee1169b48522d3c423c))
* **test:** resolve recursive loop in test script and fix Pester regression ([8f1aec7](https://github.com/snowdreamtech/template/commit/8f1aec77d72e435176b6afd90f4c7a53f28f9c16))
* **tests:** align test suite with Node v24.1.0 and updated script logic ([8e5b579](https://github.com/snowdreamtech/template/commit/8e5b57912599f0b8828acde9590c278e4d086227))
* **tooling:** pin all dependency versions and switch to pnpm in Makefile ([3f95f1e](https://github.com/snowdreamtech/template/commit/3f95f1e0e57ae6b6043c7ca36bf171dcee539aad))
* two-pass lint strategy and improve ignore patterns for check target ([bbf3624](https://github.com/snowdreamtech/template/commit/bbf36244d980dd8ee98e14b203b0c5fa1f061cf2))
* **update:** make MacPorts upgrade non-interactive with -N flag ([17fa0c0](https://github.com/snowdreamtech/template/commit/17fa0c000d154e1a1d16168108d3a3c8c9a56235))
* **update:** resolve recursion exit code and fixed command typos ([1a91cd3](https://github.com/snowdreamtech/template/commit/1a91cd352ad89475adaf1823841bfc859995469f))
* **workflow:** restore dotnet format step in lint.yml ([640b8ad](https://github.com/snowdreamtech/template/commit/640b8adff679b886d00496be74d8523e952306e7))
* **workflows:** replace hardcoded tool versions with dynamic GitHub API fetching in init workflow ([36c8fc9](https://github.com/snowdreamtech/template/commit/36c8fc92fe9a72b2e9d98256f148c154e0894692))


### Performance Improvements

* **core:** eliminate npx usage for 50% faster linting ([bab1815](https://github.com/snowdreamtech/template/commit/bab1815ceebd087bc7a3cc8c1bc2bd14e4a0895d))
* **lint:** optimize pre-commit performance by 50%+ ([10efac2](https://github.com/snowdreamtech/template/commit/10efac23c4c33a6877a91b0e6fd04bc4bbe11228))
* **optimization:** enable reusable workflow and optimize devcontainer warmup ([7e31ced](https://github.com/snowdreamtech/template/commit/7e31ced1751b1ff6feed7a95c6543d0a970acb6b))

## [Unreleased]

### Added

- Initial project template with AI IDE ecosystem support (50+ AI IDEs)
- Core rule system in `.agent/rules/` as Single Source of Truth
- SpecKit workflow suite for full feature lifecycle management
- DevContainer with Docker Compose for reproducible development environments
- Comprehensive CI/CD pipeline (lint, security scan, CodeQL, GoReleaser, stale)
- Pre-commit hooks with 50+ quality gate checks
- VS Code productivity configurations (tasks and launch profiles)
- Project hydration script (`scripts/init-project.sh`)
- GitHub community health files (SECURITY, CONTRIBUTING, CODE_OF_CONDUCT)
- Multi-IDE prompt/command shortcuts for all major AI coding assistants

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A

[Unreleased]: https://github.com/snowdreamtech/template/commits/main/
