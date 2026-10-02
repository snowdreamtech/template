<!-- DO NOT EDIT MANUALLY - This file is managed by automated professional tools -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.14.0](https://github.com/snowdreamtech/template/compare/v0.16.1...v0.14.0) (2026-10-02)


### ⚠ BREAKING CHANGES

* **security:** mise now downloads binaries ONLY from GitHub Releases
* mise does NOT automatically detect musl

### ci

* **dependabot:** add path monitoring for mise toolchain config ([ebc7227](https://github.com/snowdreamtech/template/commit/ebc72273a85cb32f3e66b84305c726e47ce55b63))
* **deps:** remove MISE_SKIP_CHECKSUM workaround ([0a80645](https://github.com/snowdreamtech/template/commit/0a8064500cc0ecef8851af4aea31023f5809512e))


### 🚀 Features

* add comprehensive performance testing and documentation infrastructure ([c1d8996](https://github.com/snowdreamtech/template/commit/c1d8996e4f44ce7222cf589812325b700e7e5f96))
* add missing performance and documentation scripts ([fe65a58](https://github.com/snowdreamtech/template/commit/fe65a58f25c3214e93d156a03079c51d169d3240))
* add rocket icon to performance workflow name ([e6a6146](https://github.com/snowdreamtech/template/commit/e6a61461a6315e84e993d6edfc618ef61f27003e))
* add support for riscv64, ppc64le, loong64, and s390x architectures in install script ([26d48f0](https://github.com/snowdreamtech/template/commit/26d48f019620413782b0348cedc3c320412e29e4))
* add UNIRTM_HOOK_ALLOW_MISSING=1 to .unirtm.toml ([a1ceab9](https://github.com/snowdreamtech/template/commit/a1ceab9944841fe017617af3d39a777358ac2a1c))
* **cd:** sync release orchestration enhancements from base repo ([b00fee8](https://github.com/snowdreamtech/template/commit/b00fee866cebcb89c24604a96bdfcd8816c60467))
* **ci:** add centralized Harden Runner endpoints configuration ([5389a6e](https://github.com/snowdreamtech/template/commit/5389a6eb811a6b1ecfeefd6a0a3512e9a7d8b078))
* **ci:** add GitHub API rate limit info to summary reports ([8c4293a](https://github.com/snowdreamtech/template/commit/8c4293afbd82f74278af2db4ecb77abf6a9b1aab))
* **ci:** enable auto-merge for ALL dependabot updates including major ([9c8bae2](https://github.com/snowdreamtech/template/commit/9c8bae233e0e8834a611370dc897ac67db64057a))
* **ci:** enable release-please for all configured branches ([bc94753](https://github.com/snowdreamtech/template/commit/bc94753270413815bb340e27fd6154f41e37d771))
* **ci:** implement universal binary-first tool verification ([5bedab1](https://github.com/snowdreamtech/template/commit/5bedab16aba4891d0395ba2e0462148810c8b2ac))
* **ci:** improve release-please configuration and remove fixed version ([e1fcd64](https://github.com/snowdreamtech/template/commit/e1fcd648d91c306f6f385eca7600b3d6d2fefc5e))
* **ci:** sync Harden Runner endpoints from centralized config ([48b4221](https://github.com/snowdreamtech/template/commit/48b42213ee409890c4dd9a64f230c251dbac7b77))
* **deps:** consolidate all dependabot updates into single PR ([e753902](https://github.com/snowdreamtech/template/commit/e753902201ce2f059747de31b59681442bb149b0))
* **deps:** optimize dependabot configuration and grouping strategy ([900f3af](https://github.com/snowdreamtech/template/commit/900f3aff782a709643b81f9721a45da7a0d10a87))
* **dev:** add POSIX-compatible CI simulation script ([a587a39](https://github.com/snowdreamtech/template/commit/a587a390faa640adce2d448b773222cbb373c41d))
* **devcontainer:** add comprehensive SSH and GPG permission configuration ([843180b](https://github.com/snowdreamtech/template/commit/843180b5722d20b1704e482d40b1c4a80f890fdc))
* **devcontainer:** add Docker availability check in init script ([7ca1fe4](https://github.com/snowdreamtech/template/commit/7ca1fe4c37ada1893e94e9ac28ec578952c1d99e))
* **devcontainer:** add support for local git config file ([2fb5e43](https://github.com/snowdreamtech/template/commit/2fb5e435b5038617746aff9837dec98865cd4d5c))
* **devcontainer:** add volume cache for osv-scanner ([95891da](https://github.com/snowdreamtech/template/commit/95891daa85b4e4759ce3fe748d6107894a8f8cac))
* **devcontainer:** add volume cache for trivy ([9f931a1](https://github.com/snowdreamtech/template/commit/9f931a1d4e63544dbc34dbb795635990587f86e9))
* **devcontainer:** add vscode extension customizations for auto-installation ([efae646](https://github.com/snowdreamtech/template/commit/efae64695c1208107298d792e272f05128405b6d))
* **devcontainer:** enable GPG signing support ([4d88e12](https://github.com/snowdreamtech/template/commit/4d88e125ddc84966237d382d897c03b1cf73da06))
* **devcontainer:** forward common development and web ports ([35ff5f6](https://github.com/snowdreamtech/template/commit/35ff5f6256f3f2e88ccce449121826eac48fdc2b))
* **docker:** add docker-compose file detection for hadolint and dockerfile-utils ([836880d](https://github.com/snowdreamtech/template/commit/836880de8c86ea0e548ed9edabe589d38357903f))
* enable remote.SSH.allowLocalServerDownload to improve connection reliability ([8a6c80d](https://github.com/snowdreamtech/template/commit/8a6c80dd26e92e1a2d37be50a2ca5ca5113f08d8))
* **lint:** add two-pass auto-fix mechanism to make lint ([9fba0f1](https://github.com/snowdreamtech/template/commit/9fba0f1436429e3e3d161358ab1dbc8d299b7fe8))
* **make:** add sync-harden-runner target for workflow endpoint management ([d24708d](https://github.com/snowdreamtech/template/commit/d24708dd86bb09946f3337dfd0747ca5fbcd51bc))
* **mise:** add yamllint to core tools in mise.toml ([406bbb3](https://github.com/snowdreamtech/template/commit/406bbb32f3a9f47bdfee72e2422b273a6cab252b))
* **release:** add separate-pull-requests for future manifest mode ([a543dde](https://github.com/snowdreamtech/template/commit/a543dded3032285624672de89e68d37130970bad))
* **scripts:** add missing performance and documentation scripts ([f8d9c61](https://github.com/snowdreamtech/template/commit/f8d9c613cfa599e503bed8190e13da66cbf928d7))
* **scripts:** add tool to remove Windows wrapper scripts ([5bfd3ef](https://github.com/snowdreamtech/template/commit/5bfd3ef8ec9241cb09eca577d58616d1c29e2987))
* **security:** add CDN and download mirror endpoints to harden runner ([3ff8a5d](https://github.com/snowdreamtech/template/commit/3ff8a5d3d073a57bb4681c619e94aa797983ef23))
* **security:** add DockerHub endpoints to harden runner ([48b6416](https://github.com/snowdreamtech/template/commit/48b6416ced65a68194a50d4ffb406c7e7257a37f))
* **security:** add sigstore wildcard endpoint to harden runner ([2e26b98](https://github.com/snowdreamtech/template/commit/2e26b98d181cc8e4c739febde72e90fcfdee99da))
* **security:** implement three-layer defense against Aqua Registry ([ef13665](https://github.com/snowdreamtech/template/commit/ef136651dc6d7d358cf4de2748a0a10a841730bf))
* **task:** add audit:fix and fix tasks for one-click self-healing ([589e107](https://github.com/snowdreamtech/template/commit/589e107522ccdeb2fba0b8bc5c4bb2eb3440b788))
* update vscode settings with enhanced editor, explorer, and terminal configurations ([44230bc](https://github.com/snowdreamtech/template/commit/44230bceaf3deebc247739e9f91c55a1d2721803))


### 🐛 Bug Fixes

* add pattern matching for binaries with version/platform suffixes ([9ce22d9](https://github.com/snowdreamtech/template/commit/9ce22d9e618960d62c4711bea1c9130d5d82f3df))
* **cd:** delete remote tag before re-push to trigger downstream docker build ([be75906](https://github.com/snowdreamtech/template/commit/be759064255c0e8f8e24f45efb260d5a26466c2a))
* **cd:** disable persist-credentials to ensure WORKFLOW_SECRET PAT is used for tag push ([bedf7bf](https://github.com/snowdreamtech/template/commit/bedf7bf3bdabc083f6fd60d69d99dd2d482ea0ee))
* **ci:** add aggressive cache refresh after uninstall in install_tool_safe ([433899c](https://github.com/snowdreamtech/template/commit/433899cd8435f737a6193f15e3189a987260e5ef))
* **ci:** add DCO signoff to dependabot-sync commits ([cfe7546](https://github.com/snowdreamtech/template/commit/cfe75468ce43c5b61c7ac8e5915eb767b0032815))
* **ci:** add DCO signoff to release-please commits ([8fd8b67](https://github.com/snowdreamtech/template/commit/8fd8b6729aa68027072f68acec9735397eea54cc))
* **ci:** add GITHUB_TOKEN to all make commands for API rate limit prevention ([2060bca](https://github.com/snowdreamtech/template/commit/2060bca9cef56a23645775c519e8054fdf1b0261))
* **ci:** add missing endpoints for trivy and sigstore ([115a19d](https://github.com/snowdreamtech/template/commit/115a19de02c7cd1d274ecb0191bd035a02d273ef))
* **ci:** add node-audit special handling in CI fallback ([d82624c](https://github.com/snowdreamtech/template/commit/d82624cda69bbf48e21ef2693d5c5477c278463e))
* **ci:** detect docker-compose files in dependabot generator ([530ca75](https://github.com/snowdreamtech/template/commit/530ca7534583ea16bb876c0e8bfbf209d958a42a))
* **ci:** disable gpg signing in workflow commit steps ([43f266e](https://github.com/snowdreamtech/template/commit/43f266e0e3c9b65bfbb6da0c761caa8d4f047c20))
* **ci:** disable paranoid mode in CI for lockfile sync ([1b282ce](https://github.com/snowdreamtech/template/commit/1b282ce6fa3d1ecca5c18de89a4962ec7e50226b))
* **ci:** disable shellcheck integration in actionlint to prevent Windows hang ([1d711d8](https://github.com/snowdreamtech/template/commit/1d711d8c1bc4c7482651f1abe228c970ba6f024c))
* **ci:** enable release-please for dev branch and fix DCO signoff ([ab8f065](https://github.com/snowdreamtech/template/commit/ab8f065dce45cc794d78aa075fc8c066eeec2bf5))
* **ci:** ensure npm install includes devDependencies in pages workflow ([4795ca3](https://github.com/snowdreamtech/template/commit/4795ca36f2eed5b3b9f522da75e5f6fd926aea61))
* **ci:** exclude unreleased version compare links from lychee checks ([6165757](https://github.com/snowdreamtech/template/commit/6165757ebf73b2d1b7abf5c738d66f6402a06f14))
* **ci:** explicitly specify checkmake mise tool spec to avoid aqua registry lookup ([acefebb](https://github.com/snowdreamtech/template/commit/acefebb98efc3563a9011f2ea05e7cc7274f5aef))
* **ci:** extract version from TOML table syntax in install_tool_safe ([9740407](https://github.com/snowdreamtech/template/commit/9740407dd5b970e1bcecc26d58ce756f2fd36027))
* **ci:** fix PSScriptAnalyzer and yamllint configuration ([166826a](https://github.com/snowdreamtech/template/commit/166826afd22a16c5fe7ccf131ae28d6f46d48525))
* **ci:** fix yamllint truthy error in performance workflow ([7e7dfd0](https://github.com/snowdreamtech/template/commit/7e7dfd052065a8b361212d0a1611a60bc951b06b))
* **ci:** handle mise shims in verify_binary_exists ([bc0dfd9](https://github.com/snowdreamtech/template/commit/bc0dfd945090a3b63cf27ee90b9073547ff76ec5))
* **ci:** improve binary resolution fallback for GitHub tools ([53ae080](https://github.com/snowdreamtech/template/commit/53ae0802fb5eb5d618f71be3f9f0fe6d9d89232a))
* **ci:** improve post-install binary name resolution ([46ab8b0](https://github.com/snowdreamtech/template/commit/46ab8b00c8b5f65bdd1e2171964650ef46359e75))
* **ci:** make link checker non-blocking to avoid false failures ([99c2ec9](https://github.com/snowdreamtech/template/commit/99c2ec99befd980c996953bd53471ded5f6d404a))
* **ci:** pass GITHUB_TOKEN to lychee for link checking ([dfb9fd1](https://github.com/snowdreamtech/template/commit/dfb9fd185e4f1bbe4987b4e991db85a4a03639e8))
* **ci:** pin GitHub Actions to commit SHA in performance workflow ([13623d9](https://github.com/snowdreamtech/template/commit/13623d9cf5ae7a6677a8645a8d568bb39a2752a2))
* **ci:** quote 'on' keyword in performance workflow ([4710acd](https://github.com/snowdreamtech/template/commit/4710acd942f39592bfe55f4ceb73af7ec47153c7))
* **ci:** remove unsupported signoff parameter and add release-as 0.5.0 ([d01b2df](https://github.com/snowdreamtech/template/commit/d01b2dffa875d815316b5d41922b58ce9d574879))
* **ci:** replace head -n -1 with sed for macOS compatibility ([67aaa95](https://github.com/snowdreamtech/template/commit/67aaa95afe68cdfcade622a3478fe3b0b000ccca))
* **ci:** resolve actual binary names for platform-specific tools ([e6856c9](https://github.com/snowdreamtech/template/commit/e6856c9a622d12a915744b44f1542106c87034ad))
* **ci:** resolve Docker Buildx container restart race condition ([01a1c2d](https://github.com/snowdreamtech/template/commit/01a1c2d500ea125ed63e0091fd5a6a136fa58544))
* **ci:** resolve npm-pnpm-audit hook failure on Windows ([095f3a5](https://github.com/snowdreamtech/template/commit/095f3a553e352c426e39aa727b37cd3f610b3408))
* **ci:** restrict release-please to main branch only ([0db8a91](https://github.com/snowdreamtech/template/commit/0db8a910c4bbba1426944ccfcca648a593bb097e))
* **ci:** restrict release-please to main branch only ([b97162a](https://github.com/snowdreamtech/template/commit/b97162aa0092875bb8af1820cb4db6c06d17665b))
* **ci:** revert goreleaser to use --version flag ([564d899](https://github.com/snowdreamtech/template/commit/564d899198c6f0c19872642d6b3e2968d54536ab))
* **ci:** skip DCO check for snowdream user in release-please PRs ([dde607b](https://github.com/snowdreamtech/template/commit/dde607bc3c474bf8967811bb9902c672f998717b))
* **ci:** support binaries installed in root directory ([72631b4](https://github.com/snowdreamtech/template/commit/72631b4d0f2c3cd53ea50b5e42a64585a92e98fc))
* **ci:** suppress zizmor findings for performance.yml and skip flaky tests ([0616771](https://github.com/snowdreamtech/template/commit/06167717e490f73f34e49386e4a776907caa554c))
* **ci:** temporarily disable npm-pnpm-audit hook due to API compatibility ([6ed58d9](https://github.com/snowdreamtech/template/commit/6ed58d92ebd50ff746dfe5f1d630f59cc7eb4441))
* **ci:** update node-audit to use new npm bulk advisory endpoint ([526ca79](https://github.com/snowdreamtech/template/commit/526ca79e307d38240e54505bda3b06d75f1e8b9a))
* **ci:** use correct version command for goreleaser ([b271332](https://github.com/snowdreamtech/template/commit/b271332e9b02f2f34513943f86ce8297f3c31dc4))
* **ci:** use GITHUB_TOKEN for release-please to enable DCO signoff ([51051ba](https://github.com/snowdreamtech/template/commit/51051ba4a2e7fdca3a9ed927e09fdec94b20f77d))
* **ci:** use GITHUB_TOKEN for release-please to prevent tag creation issues ([73266aa](https://github.com/snowdreamtech/template/commit/73266aa2d12b86d1cce4ba785d48141dbe817a44))
* **ci:** use mise exec for shim smoke tests ([12306a9](https://github.com/snowdreamtech/template/commit/12306a9fbf8a8f4192002424aa03898223628077))
* **ci:** use npm instead of pnpm for audit to avoid API compatibility issues ([641c9f7](https://github.com/snowdreamtech/template/commit/641c9f744927c5aa15369cd56bcb7e31bb44bf3d))
* **ci:** use platform-specific binary name for editorconfig-checker ([2b38f2a](https://github.com/snowdreamtech/template/commit/2b38f2a2fbb5445b5b5118a64efa34bd56495023))
* **ci:** use valid log level for lychee verbose option ([171e721](https://github.com/snowdreamtech/template/commit/171e7218eb1e6cf00645c27f7d9d8187e5c9bf47))
* **ci:** use WORKFLOW_SECRET for release-please to enable chain-triggering ([9339b9c](https://github.com/snowdreamtech/template/commit/9339b9c343147d687e69ab362653b7df10accb82))
* correct Alpine Linux Node.js installation behavior ([bbd85fa](https://github.com/snowdreamtech/template/commit/bbd85fa7048b058ee6a2d13ccf27debfac4912e7))
* **dco:** use PR author instead of branch name to prevent bypass ([eb55adf](https://github.com/snowdreamtech/template/commit/eb55adf2ccc05f6a0bea0a1f9c37c5fb56f08e02))
* **deps:** add missing windows-amd64 platform for python in unirtm.lock ([fa18c7c](https://github.com/snowdreamtech/template/commit/fa18c7cd60bf9ffec9259b3ae749fc8faef68aec))
* **deps:** correct devcontainers directory to root ([9d83806](https://github.com/snowdreamtech/template/commit/9d838067e3fb82e84c1107f0036cc4a7b7855f56))
* **deps:** correct indentation in test script for editorconfig compliance ([0a44088](https://github.com/snowdreamtech/template/commit/0a44088beafca6ea70111f98062e1889d21c069f))
* **deps:** exclude .devcontainer from docker ecosystem detection ([67e96c3](https://github.com/snowdreamtech/template/commit/67e96c3c1b94c72811d81af229a017f927fd3de4))
* **deps:** set valid golangci-lint version to v1.64.8 ([625796e](https://github.com/snowdreamtech/template/commit/625796e5e0bb7313e0b4a44ead0a0f75145e4bad))
* **devcontainer:** add command availability checks before usage ([a0a4ce0](https://github.com/snowdreamtech/template/commit/a0a4ce0d1bed246c722270f920e79f2046a1bfe7))
* **devcontainer:** add command to keep container running ([5484045](https://github.com/snowdreamtech/template/commit/54840456dfb76e040655d49cf28b45e9b64ead1d))
* **devcontainer:** add workspace volume mount and fix configuration ([9ff708b](https://github.com/snowdreamtech/template/commit/9ff708be2aa74af62eae40012f163229bb688296))
* **devcontainer:** add YAML document start marker for yamllint ([44ccf81](https://github.com/snowdreamtech/template/commit/44ccf8108ad6ea15b92069f15bbc1ce852723ec0))
* **devcontainer:** correct updateContentCommand to use make install ([774bba2](https://github.com/snowdreamtech/template/commit/774bba245b5025973492b2cd8fb10826eae7af12))
* **devcontainer:** handle missing host directories gracefully ([9b79301](https://github.com/snowdreamtech/template/commit/9b7930189a20c8c44983a739d80ec05d8b5987f5))
* **devcontainer:** make git config cross-platform compatible ([600052a](https://github.com/snowdreamtech/template/commit/600052ae9d9067de738a875009df7e8371099625))
* **devcontainer:** use dynamic workspace folder variable ([73421d6](https://github.com/snowdreamtech/template/commit/73421d6f6724ae63613d30566103b55191d43c87))
* **devcontainer:** use find instead of ls for directory permissions ([ffeaee8](https://github.com/snowdreamtech/template/commit/ffeaee833e3a9f4ad7a88d45b906ad12ca52b62d))
* **devcontainer:** use global git config instead of local ([934bb1c](https://github.com/snowdreamtech/template/commit/934bb1c3bec475b571daab4168cdd233d10b6816))
* **docs:** ensure make docs build works correctly ([6a0df9c](https://github.com/snowdreamtech/template/commit/6a0df9ce6acf22d2d8606dda0444c48d369967bd))
* **docs:** fix broken relative links in documentation ([c13692c](https://github.com/snowdreamtech/template/commit/c13692c6ecf4fca79bf117fcda7076abef1acba1))
* **docs:** override lodash-es to 4.18.1 and fix goreleaser deprecation ([5efcc86](https://github.com/snowdreamtech/template/commit/5efcc868f0581c6dcd4b84ec208cde9d71a18b11))
* **docs:** pin mermaid to 11.17.2 and enable legacy peer deps for vitepress build ([2a799a2](https://github.com/snowdreamtech/template/commit/2a799a2a8b476e878fc9431f785c8e58a88e20b2))
* **docs:** regenerate pnpm lockfile to match overrides ([b553918](https://github.com/snowdreamtech/template/commit/b553918d8c7d81bc4a7f740a756c590a06d48e2a))
* **docs:** resolve npm vulnerabilities by pinning exact dependency versions ([d628640](https://github.com/snowdreamtech/template/commit/d6286404ea025ee0cad3123b5b0b3bc6bd21a551))
* **docs:** update TPGi CCA link to GitHub releases page ([b061ca1](https://github.com/snowdreamtech/template/commit/b061ca1150e4dd23b47fd88b3f9992d0f97c1df8))
* **lint:** ensure pre-commit runs exactly 2 times, not 3 ([4085676](https://github.com/snowdreamtech/template/commit/40856766a964a95216a171fd5760bde2b91240c5))
* **lint:** fix yamllint, markdownlint, and editorconfig issues ([b7925a2](https://github.com/snowdreamtech/template/commit/b7925a2f9661b860f50134e5de1a028f172e971a))
* **lint:** ignore CHANGELOG.md in all directories for markdownlint ([ebe338c](https://github.com/snowdreamtech/template/commit/ebe338c66126b82624c63e45b5c8a7c6bf77fcc1))
* **lint:** restore color output in Pass 1 auto-fix stage ([fe3d523](https://github.com/snowdreamtech/template/commit/fe3d52320f604686e0f5dededbd07da463a0f176))
* **linux:** use -perm /111 instead of +111 for better compatibility ([512e69b](https://github.com/snowdreamtech/template/commit/512e69b504a1810c4fa126fab5b6079bfbba125d))
* **macos:** avoid -perm flag for BSD find compatibility ([79b98b0](https://github.com/snowdreamtech/template/commit/79b98b071476afe24a80e9876c7e2509022c1529))
* **macos:** use -perm +111 instead of -executable for BSD find compatibility ([911c1b4](https://github.com/snowdreamtech/template/commit/911c1b47e643bcb1d95e6400a7e6abdbfeea82fe))
* make version regex robust against initial release in cd.yml ([f560288](https://github.com/snowdreamtech/template/commit/f5602885c3ef4ca42fe6e085a83c6077c51cc09c))
* **mise:** add additional paranoid mode disable flags ([7e83141](https://github.com/snowdreamtech/template/commit/7e83141b005bb8e0e6dc930f35eec7436c1bceb1))
* **mise:** disable attestation checks in sync-lock to prevent false positives ([3f09708](https://github.com/snowdreamtech/template/commit/3f09708fefcf850b11f0ed2f7c29525f2c6c2b0d))
* **mise:** permanently disable paranoid mode for lockfile sync ([49dbb04](https://github.com/snowdreamtech/template/commit/49dbb044f65c4c5203edd751218f3d90315214f6))
* **mise:** remove provenance fields from lockfile to prevent attestation errors ([f7790b5](https://github.com/snowdreamtech/template/commit/f7790b5803b47822c1191f28c155763a3ce43844))
* **mise:** update yamllint version to match versions.sh ([d9bcf61](https://github.com/snowdreamtech/template/commit/d9bcf61f7092f248186d41ceb66fcd98d3015a34))
* **mise:** workaround for GitHub attestation verification failures ([2911054](https://github.com/snowdreamtech/template/commit/29110547a86ebe51593eac637c0b4dc4c14977bc))
* **node:** auto-install bash in Alpine for npm compatibility ([0042fa2](https://github.com/snowdreamtech/template/commit/0042fa2abb6ae389277660b3d0656f54ea669643))
* **node:** configure mise for musl binaries in Alpine environments ([232bce2](https://github.com/snowdreamtech/template/commit/232bce29a4401ebe42fd529c448a47d404562abe))
* **node:** explicitly set MISE_NODE_* env vars for Alpine ([25d506d](https://github.com/snowdreamtech/template/commit/25d506d6d952fa479dca79e427d10905d37fc9b6))
* **node:** export ALPINE_VERSION for mise.toml template evaluation ([62d9344](https://github.com/snowdreamtech/template/commit/62d934444f440eec678ac2227c723ab7f1e46e8d))
* **node:** use boolean false for node.compile setting ([97d5bd5](https://github.com/snowdreamtech/template/commit/97d5bd57d4dc1ffc52a777524c5aabf92a9a061d))
* **pre-commit:** migrate deprecated stage name ([8392cbf](https://github.com/snowdreamtech/template/commit/8392cbfe73aee175bb7732255a7f992c75078184))
* **python:** install build dependencies for Alpine/musl environments ([3f53883](https://github.com/snowdreamtech/template/commit/3f53883e79ed5b9d74ca2369052b0014a3d4f0fc))
* **release:** set separate-pull-requests to false for unified PR ([07054f5](https://github.com/snowdreamtech/template/commit/07054f5d69e832f976b46e1648d39779042cfb15))
* replace %b with %s in printf to avoid Windows path issues ([29ba55b](https://github.com/snowdreamtech/template/commit/29ba55b82400d7ec41074c2951cbbd614eab3cb5))
* resolve devcontainer startup with docker-compose configuration ([fa788e4](https://github.com/snowdreamtech/template/commit/fa788e4f3c94e767f465eea9f17acb4ab8f4a01e))
* **scripts:** ensure summary table displays by default ([a0d1b69](https://github.com/snowdreamtech/template/commit/a0d1b69300d151b2f448a2f1375e0f81e97cd6b2))
* **scripts:** fix JSON output formatting issues ([7b30a64](https://github.com/snowdreamtech/template/commit/7b30a640d262c9d47bd75956f92d5d3819cd4ce8))
* **scripts:** install PyYAML via pip instead of pipx in sync-harden-runner ([16285a8](https://github.com/snowdreamtech/template/commit/16285a8ec6f27dada410103a3118482e38b82875))
* **scripts:** prevent sync-harden-runner from deleting workflow content ([32a4228](https://github.com/snowdreamtech/template/commit/32a4228e6e456a62cf761590491c5c56b6b24b8b))
* **security:** add docker.yml to zizmor ignore rules ([66e35cf](https://github.com/snowdreamtech/template/commit/66e35cf2e63c97fc8b1ecbad2a13e283a16031c7))
* **security:** add template-injection rule to zizmor config ([92396c1](https://github.com/snowdreamtech/template/commit/92396c15000fed537d3f4057f41dddd3bd7fe69b))
* **security:** resolve postcss vulnerability and fix gh issue creation label ([d1a10c0](https://github.com/snowdreamtech/template/commit/d1a10c0e4673c96c4bc05f34ec58527f4d1dead0))
* **setup:** ensure yaml and toml modules are always installed locally ([7ca7026](https://github.com/snowdreamtech/template/commit/7ca7026761c0a58a939935db83e37922a872a243))
* **setup:** handle mise bin tools verification ([5c386fa](https://github.com/snowdreamtech/template/commit/5c386faae9715eeada52124c8315b71b7ad871de))
* **setup:** handle non-zero exit codes in smoke tests ([3fe6c05](https://github.com/snowdreamtech/template/commit/3fe6c054d4609b2263399b5df10d10f280919c2c))
* **setup:** normalize version strings in is_version_match to handle v prefix ([e5efefd](https://github.com/snowdreamtech/template/commit/e5efefdf81ca728f3b75703007cd475c6a2fa0f1))
* **setup:** use mise which for binary verification in CI ([ded29c1](https://github.com/snowdreamtech/template/commit/ded29c17cdd851f46808a02ad086264f1038eb71))
* **shell:** restore missing functions and add aggressive cache refresh ([f89f7f0](https://github.com/snowdreamtech/template/commit/f89f7f0913ecb6e165f8072d6b88f985b672dbcb))
* skip executable permission check on Windows (POSIX compliant) ([e365e6a](https://github.com/snowdreamtech/template/commit/e365e6aa58b67f08d058cc0a5853c8991e2e71ef))
* **tasks:** make osv-scanner recursive and allow missing lockfiles ([fc5913d](https://github.com/snowdreamtech/template/commit/fc5913dd652471ee4ffc343646a7a5ca3f915fec))
* **tools:** complete taplo provider migration to npm ([cdeaf76](https://github.com/snowdreamtech/template/commit/cdeaf762d62dfde4a14d90136cf298fe4c8e125d))
* **tools:** switch taplo from GitHub source to npm precompiled binary ([18de234](https://github.com/snowdreamtech/template/commit/18de2342744562645b849d24edbd94e6524259d1))
* **unirtm:** add missing macos platform entries for editorconfig-checker@4.0.0 ([30c33f1](https://github.com/snowdreamtech/template/commit/30c33f1e527b062436491cc10c7dc24613da41be))
* update nanoid to 3.3.18 in package-lock.json ([7411de0](https://github.com/snowdreamtech/template/commit/7411de016dbe4a384dc51712354aac7852f4e00b))
* **windows:** check root directory in verify_tool_atomic fallback ([9e2ace6](https://github.com/snowdreamtech/template/commit/9e2ace6e8cf960c25f159e53ec5b3a2d9cce3904))
* **windows:** skip command check for binaries without .exe extension ([a5ed6ca](https://github.com/snowdreamtech/template/commit/a5ed6caebb29aa8555d704cb1d8dabf4ea384111))
* **windows:** skip executable permission checks in lint-wrapper ([035ae54](https://github.com/snowdreamtech/template/commit/035ae54f20404a7c66a1a07459efb1d77678ab3f))
* **windows:** split executable check to avoid test evaluation on Windows ([cc76373](https://github.com/snowdreamtech/template/commit/cc763732a359bd52681a19b277854ea6bbe826e2))


### 🛠 Refactoring

* apply black formatting style to all pre-commit hook scripts ([b9fe7ff](https://github.com/snowdreamtech/template/commit/b9fe7ffb8fa098e2f9e38410c70efada552edfd0))
* **ci:** deduplicate *.githubusercontent.com:443 in Harden Runner ([ee235af](https://github.com/snowdreamtech/template/commit/ee235aff9e27ad017986503174fef521273b5529))
* **ci:** deduplicate harden runner endpoints using wildcards ([542b6e4](https://github.com/snowdreamtech/template/commit/542b6e475fbfef0467d75dc9f3b9cf80f957b535))
* **ci:** improve sed regex for better cross-platform compatibility ([e194255](https://github.com/snowdreamtech/template/commit/e19425594f9847540431fd6d6be685088d3de4d7))
* **ci:** migrate bats to install_tool_safe ([f6b9587](https://github.com/snowdreamtech/template/commit/f6b9587e1dd6bd20f16b2ae0f68f3919c2b3b243))
* **ci:** migrate clang-format to install_tool_safe ([ce1b854](https://github.com/snowdreamtech/template/commit/ce1b8547a5b3a8fdb421de141fb12b4b1eafe82e))
* **ci:** migrate golangci-lint and govulncheck to install_tool_safe ([30e6e61](https://github.com/snowdreamtech/template/commit/30e6e618b157537a86c51ffb16f0169373544eb6))
* **ci:** migrate google-java-format to install_tool_safe ([a4a093e](https://github.com/snowdreamtech/template/commit/a4a093e2084824496fd37568ecdbce5c6dd07683))
* **ci:** migrate hadolint and dockerfile-utils to install_tool_safe ([a6f3942](https://github.com/snowdreamtech/template/commit/a6f3942a587ce62b2050ef6afc526b7bea21f678))
* **ci:** migrate helm, scala, toml, runner tools to install_tool_safe ([f30a534](https://github.com/snowdreamtech/template/commit/f30a534e30ea8ae843d2b46ad95c631911020bd5))
* **ci:** migrate ktlint to install_tool_safe ([bc525dc](https://github.com/snowdreamtech/template/commit/bc525dce2ff8f687645af7e90b129e250a81a413))
* **ci:** migrate markdown, rego, swift tools to install_tool_safe ([fb274ad](https://github.com/snowdreamtech/template/commit/fb274ad3546c7ff231cbfaf5dacb0ff55d1e31b2))
* **ci:** migrate node.js tools to install_tool_safe ([c4c59bc](https://github.com/snowdreamtech/template/commit/c4c59bc42a36e2abec3495bd425f59b12327a9c9))
* **ci:** migrate osv-scanner, zizmor, cargo-audit to install_tool_safe ([e2c80af](https://github.com/snowdreamtech/template/commit/e2c80af148ea5fdb632eb5064ae4bc8b4205f841))
* **ci:** migrate protobuf, haskell, sql tools to install_tool_safe ([c5f4e3d](https://github.com/snowdreamtech/template/commit/c5f4e3d9c57f7cab3861a46c7149923e0c0d21c8))
* **ci:** migrate rubocop to install_tool_safe ([8b5dc75](https://github.com/snowdreamtech/template/commit/8b5dc755a029e45f42542e18cf4e67723af57073))
* **ci:** migrate ruff and pip-audit to install_tool_safe ([91b43ea](https://github.com/snowdreamtech/template/commit/91b43ea3f27954df693a56543257ca3bdf3b0d86))
* **ci:** migrate spectral to install_tool_safe ([d9e5ae0](https://github.com/snowdreamtech/template/commit/d9e5ae095e0e6d7a30505ed728627bc293a9e572))
* **ci:** migrate stylua to install_tool_safe ([ced2e51](https://github.com/snowdreamtech/template/commit/ced2e518bc5f8e61a457744f42c55d8ed15b278d))
* **ci:** migrate tflint to install_tool_safe ([d0b1181](https://github.com/snowdreamtech/template/commit/d0b1181fb261e060a824059eb4f791ed7ed0fb49))
* **ci:** migrate yamllint and dotenv-linter to install_tool_safe ([c8c841b](https://github.com/snowdreamtech/template/commit/c8c841bf5b0fe1d57b32c192e79b72036b721a95))
* **ci:** redesign tool detection - binary first, version second ([ac64925](https://github.com/snowdreamtech/template/commit/ac64925f4223322621685f28555196f83d21f0b0))
* **ci:** remove redundant VENV environment variable ([72c4af5](https://github.com/snowdreamtech/template/commit/72c4af58c840f2e1390badac198c276e9fd8d49e))
* **ci:** standardize token usage across all workflows ([54b8445](https://github.com/snowdreamtech/template/commit/54b84456eb13b77b79cbbea32510405ec6f616b7))
* completely remove pnpm configuration and lockfiles ([d6a7e6d](https://github.com/snowdreamtech/template/commit/d6a7e6de2ab484ff51f386fb4eae2e3ee56d7985))
* **devcontainer:** enhance init.sh with improved logging and error handling ([61a8c52](https://github.com/snowdreamtech/template/commit/61a8c5261559248d38b8adfda64860d7ef420209))
* **devcontainer:** move initialization logic to shell script ([944119a](https://github.com/snowdreamtech/template/commit/944119ab3a1a8219500e581cd4dc4d8c1e2ab8a1))
* **devcontainer:** remove direct SSH mount in favor of copy approach ([c5dabca](https://github.com/snowdreamtech/template/commit/c5dabcaeb68bc9b10108b5ec8c810734de22381c))
* **devcontainer:** remove duplicate containerEnv configuration ([b2943e9](https://github.com/snowdreamtech/template/commit/b2943e9e361157b17204e9b8912d1d3dd77c56fc))
* **devcontainer:** remove duplicate mise bootstrap from init.sh ([a2108d5](https://github.com/snowdreamtech/template/commit/a2108d56bd8335f854f69dd71839927f5f99d530))
* **devcontainer:** remove duplicate VS Code extensions config ([3657b5d](https://github.com/snowdreamtech/template/commit/3657b5df4e930249e55ff5d0bf048f57ca460d80))
* **devcontainer:** remove redundant chown command ([5f79cc6](https://github.com/snowdreamtech/template/commit/5f79cc6acd2a983e94bf40058e20c34253049507))
* **devcontainer:** remove redundant trivy cache settings ([1ffa32d](https://github.com/snowdreamtech/template/commit/1ffa32d80498d1c2805277d3a081ad6201d745f6))
* **devcontainer:** remove updateContentCommand ([363840f](https://github.com/snowdreamtech/template/commit/363840ffe8ee1e2468e99bb715fce22a9b67fcd9))
* **devcontainer:** simplify configuration and add credential forwarding ([38f8445](https://github.com/snowdreamtech/template/commit/38f844553c05e2b9ae70f160a2fa741ba4caea18))
* **devcontainer:** simplify SSH configuration by copying from host ([62458b0](https://github.com/snowdreamtech/template/commit/62458b063c1bc395cd3050ba1ce8f899053cd31a))
* **lint:** merge Pass 1 and auto-fix into single step ([7cd02aa](https://github.com/snowdreamtech/template/commit/7cd02aa9345c6a394cf2062bcd4b9f8ee789b591))
* **mise:** use sed instead of perl for better POSIX compatibility ([80059f0](https://github.com/snowdreamtech/template/commit/80059f0511dea64dfe0127b8de958c1ad401d64e))
* **pre-commit:** clean up redundant exclude fields and optimize filtering ([d95b727](https://github.com/snowdreamtech/template/commit/d95b727b6ae1e88d7f48d301b3355b798e712348))
* **pre-commit:** optimize configuration and extract python scripts ([f712d68](https://github.com/snowdreamtech/template/commit/f712d683b3e2bc9edbe4562c123190ceb75f8c5e))
* **release:** standardize release asset naming conventions ([efa63e9](https://github.com/snowdreamtech/template/commit/efa63e9cd8a4fc2d73a342772eaef34aaa12d251))
* remove Windows wrapper scripts ([19820e4](https://github.com/snowdreamtech/template/commit/19820e4f9f4c499b56fe4f69a952762cbe4bee37))
* **scripts:** remove MISE_GITHUB_TOKEN in favor of GITHUB_TOKEN ([ec135c4](https://github.com/snowdreamtech/template/commit/ec135c42784ae0bb59e29b5a6e1fc7a04a24a52e))
* **security:** deduplicate harden runner endpoints ([29c4faa](https://github.com/snowdreamtech/template/commit/29c4faaa760da0b9aa4ff1f668fc7e5ec19dd315))
* **setup:** remove rarely-used tools from default installation ([da6ffc5](https://github.com/snowdreamtech/template/commit/da6ffc581284f96d2bf28a651611e303dc17ce6d))
* **test:** remove PowerShell test support ([eaf7e6c](https://github.com/snowdreamtech/template/commit/eaf7e6ce718c60fa3dd6a1c7f0efd47dc70a065b))
* update pre-commit hooks to use unirtm hook-exec instead of lint-wrapper.sh ([ea80e6c](https://github.com/snowdreamtech/template/commit/ea80e6c20e17b1da216e7826204a9fdfdc02a1d3))


### 📖 Documentation

* add Alpine Linux (musl) compatibility guide ([d50022c](https://github.com/snowdreamtech/template/commit/d50022ccbf65623ec597f22dd647064a63071557))
* add Alpine Linux dependencies and quickstart guide ([86846ae](https://github.com/snowdreamtech/template/commit/86846aebc5fc045130cbfd1e1933fa7c84850f3a))
* add comprehensive Alpine Linux Node.js solution guide ([fb1ada1](https://github.com/snowdreamtech/template/commit/fb1ada1b42106210a59703af3bdc6dec2ce87c3c))
* add comprehensive token usage audit report ([9983421](https://github.com/snowdreamtech/template/commit/9983421492acc679c2e27a2b01cdf3a6909c7ab9))
* add GitHub API rate limit monitoring documentation ([05b8fdf](https://github.com/snowdreamtech/template/commit/05b8fdfcd04f4a784d06f1c9a979dde251f85a42))
* add perfect cross-platform Node.js solution guide ([91c595c](https://github.com/snowdreamtech/template/commit/91c595c4202a9f9676602722a577292cb887cf45))
* add tool installation and API documentation ([6357510](https://github.com/snowdreamtech/template/commit/6357510e4e2775de9bcde6a8bc7e67e293964ce6))
* add Windows shell migration guide ([1d44801](https://github.com/snowdreamtech/template/commit/1d4480161f5d95f832472e01f034f5a683f1df18))
* **ai:** add file modification best practices to AI interaction guidelines ([4e31796](https://github.com/snowdreamtech/template/commit/4e317967e31c9b7875e585b321fc606872add40a))
* **changelog:** replace MISE_GITHUB_TOKEN with GITHUB_TOKEN ([7cffbd9](https://github.com/snowdreamtech/template/commit/7cffbd9cc42781245aaadba129b9bd41f76671fe))
* **ci:** add install_tool_safe pattern documentation to 06-ci-testing.md ([ca9d719](https://github.com/snowdreamtech/template/commit/ca9d719464dd62b0c8e6e27b98c01a0f4ff549b6))
* **ci:** add refactoring summary document ([275a598](https://github.com/snowdreamtech/template/commit/275a5982256b273c615ac6422bc1668f653a0a20))
* **ci:** finalize refactoring summary - 45/56 tools complete (80%) ([58c4c95](https://github.com/snowdreamtech/template/commit/58c4c95219c4398e1a5212f1059f518c4d824502))
* **ci:** improve dependabot auto-merge workflow documentation ([c47f53e](https://github.com/snowdreamtech/template/commit/c47f53e8c332e2de06a76930f005114abeec1aee))
* **ci:** update refactoring summary - 44/56 tools complete (79%) ([dae1a53](https://github.com/snowdreamtech/template/commit/dae1a53d7f870d8dffaca808c5869b310d7ed716))
* **ci:** update refactoring summary with latest progress (23/56 tools) ([6876f4c](https://github.com/snowdreamtech/template/commit/6876f4c70d3140723765db12cf6db37f2b827cbb))
* clean up broken and dead markdown links ([4a14786](https://github.com/snowdreamtech/template/commit/4a14786911f2a66022b779d5ee21f572dbba5949))
* fix dead links in documentation ([7682cf9](https://github.com/snowdreamtech/template/commit/7682cf9beb94edcffe0cffa6f9a3c68499a71889))
* **mise:** add comprehensive mise configuration best practices ([18968e9](https://github.com/snowdreamtech/template/commit/18968e957bcfadb0b5425926105914d9ed2b7c08))
* **mise:** document attestation verification error and workarounds ([7f07ae7](https://github.com/snowdreamtech/template/commit/7f07ae7b4a5af23868d523f6d6f10d11e3379be1))
* replace mise and make with unirtm across all documentation ([139c952](https://github.com/snowdreamtech/template/commit/139c95298d2d667f82e98cbf61b861746bb63da2))
* restore .md extension in links for lychee compatibility ([782b1f5](https://github.com/snowdreamtech/template/commit/782b1f50cd361e935f99603ccaff8d5b52029110))
* **scripts:** update Chinese README to reflect removal of Windows wrappers ([2aac80a](https://github.com/snowdreamtech/template/commit/2aac80a70c4a402ed725ea782fb857e2b88aa82f))
* **scripts:** update README to reflect POSIX-only strategy ([8b72ab6](https://github.com/snowdreamtech/template/commit/8b72ab6fb5a35722644b41f0a942f8d7c44887c6))
* **scripts:** update README to reflect removal of Windows wrappers ([b4c0341](https://github.com/snowdreamtech/template/commit/b4c034128113419ded409702f2bb23b43673a823))
* **security:** add comprehensive asdf supply chain risk analysis ([515eea1](https://github.com/snowdreamtech/template/commit/515eea10cedc50f05f0cecd3f421129e1ce59cd4))
* **security:** add mise supply chain security analysis and mitigation ([c0c72f8](https://github.com/snowdreamtech/template/commit/c0c72f889b691ca3ed847e3b11dd3576c1586653))
* **security:** fix broken mise documentation links ([8c3f625](https://github.com/snowdreamtech/template/commit/8c3f6250d0bc1abbb929768e796e30e52bf06397))
* update READMEs to reflect migration from mise to unirtm ([39386e5](https://github.com/snowdreamtech/template/commit/39386e54f5686572d8a113936e87ebd14eae7013))


### ♻️ Miscellaneous Chores

* add egress network allowlist entries to all GitHub Actions workflows ([9616592](https://github.com/snowdreamtech/template/commit/961659274a02544704ba1a9e22327d70b11fb109))
* **ci:** add debug logging for post-install binary resolution ([9e68985](https://github.com/snowdreamtech/template/commit/9e689851baffbc86669df0a2249f115ed7be84cd))
* **ci:** add install dir contents to shfmt debugging ([c7544f8](https://github.com/snowdreamtech/template/commit/c7544f8cc9ce9cb5a4fac371f65dead920063ebc))
* **ci:** add more debugging for post-install binary resolution ([1b166ef](https://github.com/snowdreamtech/template/commit/1b166efee21619476e791357a63df316ff06bd35))
* **ci:** disable goreleaser workflow ([b3b83bf](https://github.com/snowdreamtech/template/commit/b3b83bf8556e2f00a29fb44cdd9adf73017e9a96))
* clean up .bak files and update dependabot-sync workflow ([9475a55](https://github.com/snowdreamtech/template/commit/9475a559642fe06e7a10c4c60c80c79f5511adea))
* **deps:** bump @commitlint/cli in the all-dependencies group ([0a3d231](https://github.com/snowdreamtech/template/commit/0a3d2315026f6ecf4be2925dd07b3d7424ad1bd1))
* **deps:** bump mermaid in /docs in the all-dependencies group ([bd4189e](https://github.com/snowdreamtech/template/commit/bd4189e65620a7d63226dae2a12b494f6acb6d74))
* **deps:** bump mermaid in /docs in the all-dependencies group ([060979a](https://github.com/snowdreamtech/template/commit/060979a73ff38e703afcf75ab98c64d51b595e64))
* **deps:** bump mise to v2026.4.14 ([2bf29e3](https://github.com/snowdreamtech/template/commit/2bf29e3e3f8385913f9367de8a1170a151b5bd82))
* **deps:** bump postcss ([7badf33](https://github.com/snowdreamtech/template/commit/7badf3302ed6350820413c80f7eadfb3fce36a04))
* **deps:** bump the all-dependencies group in /docs with 2 updates ([6333878](https://github.com/snowdreamtech/template/commit/633387889e894b4fd6b02b0c4a26a44a9ffdf7e0))
* **deps:** bump the all-dependencies group in /docs with 2 updates ([485f42d](https://github.com/snowdreamtech/template/commit/485f42de0853074dee8368166426986130b6d8e0))
* **deps:** bump the all-dependencies group in /docs with 2 updates ([64b0880](https://github.com/snowdreamtech/template/commit/64b0880a13fcf4c81df80e25fc25056497f38de1))
* **deps:** bump the all-dependencies group in /docs with 3 updates ([3e4b847](https://github.com/snowdreamtech/template/commit/3e4b8479f8be438ffe369c01e099b35844a1d7e0))
* **deps:** bump the all-dependencies group in /docs with 3 updates ([8c8ffd9](https://github.com/snowdreamtech/template/commit/8c8ffd91c27ffc4a74cf44ea5c3eadec988ffa04))
* **deps:** bump the all-dependencies group with 2 updates ([5f6a1b3](https://github.com/snowdreamtech/template/commit/5f6a1b308a94ed14bf821595dc77d645a32b6026))
* **deps:** bump the all-dependencies group with 2 updates ([f390fc0](https://github.com/snowdreamtech/template/commit/f390fc033ead9ad97f3a540b187a2c80715f4912))
* **deps:** bump the all-dependencies group with 2 updates ([43cddbb](https://github.com/snowdreamtech/template/commit/43cddbbba2b44a08ac459653d36484843a00603e))
* **deps:** bump the all-dependencies group with 2 updates ([76dac5a](https://github.com/snowdreamtech/template/commit/76dac5abb03817d9b1461700c8467bc4a83ab1ab))
* **deps:** bump unirtm version to 0.25.3 ([49f7888](https://github.com/snowdreamtech/template/commit/49f788808736ba4e1d2902e1911192ad1ad77ede))
* **deps:** bump vite in /docs in the all-dependencies group ([91cdab1](https://github.com/snowdreamtech/template/commit/91cdab13e0b1cbf7e533b1173f02661b0c4dade4))
* **deps:** bump vite in /docs in the all-dependencies group ([6cccd02](https://github.com/snowdreamtech/template/commit/6cccd0239f14774c5dca746a861871855022e1cf))
* **deps:** bump vite in /docs in the all-dependencies group ([bcad411](https://github.com/snowdreamtech/template/commit/bcad411a69b84ae6eb1db8cb71e8e8a3f54f48d6))
* **deps:** bump vite in /docs in the all-dependencies group ([f3e5f8f](https://github.com/snowdreamtech/template/commit/f3e5f8fbf6c7bc524b70caccf8aa20eea3bbd4e7))
* **deps:** bump vite in /docs in the all-dependencies group ([8ed895d](https://github.com/snowdreamtech/template/commit/8ed895da084eace6e4aa43ed23b11c31e00764f4))
* **deps:** migrate unirtm.lock keys to canonical prefixed format ([16421b7](https://github.com/snowdreamtech/template/commit/16421b7ed716746da0be4e147bed5ab75f77045d))
* **deps:** regenerate unirtm.lock with v0.25.0 format ([9227ed1](https://github.com/snowdreamtech/template/commit/9227ed1faa7f52f24dea36a7de6c458d22620f9e))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([b1f5025](https://github.com/snowdreamtech/template/commit/b1f5025ad7a0d16c04dc97831aabae4d5cb3a417))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([99a5407](https://github.com/snowdreamtech/template/commit/99a5407350ca41f08f3bb4800ff5d5f53794807e))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([d11dc23](https://github.com/snowdreamtech/template/commit/d11dc238dea7c96d819cbe90ca04040711888c54))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([7bcbf01](https://github.com/snowdreamtech/template/commit/7bcbf015baabcf22d722bde9c5f13ffb97b902f6))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([f647663](https://github.com/snowdreamtech/template/commit/f647663c13f0413f88c1537d91dd7e6fef24935e))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([cc12ad8](https://github.com/snowdreamtech/template/commit/cc12ad8cdb30427eb7abc0e294feaadd8987db49))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([894db7f](https://github.com/snowdreamtech/template/commit/894db7f09eb0bc1a054ed258b7885ce3e6fd2bee))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([c0de47a](https://github.com/snowdreamtech/template/commit/c0de47a1bb871d72f949bb61ced766ef899ea773))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([3a449a5](https://github.com/snowdreamtech/template/commit/3a449a5908cc66aa03e5a7440281ee3eb1d215dd))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([3048ce8](https://github.com/snowdreamtech/template/commit/3048ce82d370c21fb6990a11eb075320f6d08f54))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([060e7f0](https://github.com/snowdreamtech/template/commit/060e7f0a3e66bb11384c895a223e4af222b6dc25))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([c25be9a](https://github.com/snowdreamtech/template/commit/c25be9a89a117cd06895462718ded507c2c57b57))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([51ca272](https://github.com/snowdreamtech/template/commit/51ca272cfbe5689ae0d56c6730f028c478afc73b))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([96489e5](https://github.com/snowdreamtech/template/commit/96489e537df3216e95a316e78ca2b78b0fd54aaa))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([cd4628a](https://github.com/snowdreamtech/template/commit/cd4628a4e7cf6b6d65afdf323da830c57b535c84))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([4b105cd](https://github.com/snowdreamtech/template/commit/4b105cd4d43fbb34fe59cdf92267c3e87b9cb9e3))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([7bdfbef](https://github.com/snowdreamtech/template/commit/7bdfbef6e5a49b2d87161051509b9072827907dd))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([6078b1b](https://github.com/snowdreamtech/template/commit/6078b1b351067096a49eaa9d6c3f664cc8b53fce))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([443e9f5](https://github.com/snowdreamtech/template/commit/443e9f58fd1fdba36393be6bf5589d890fdef792))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([ad7782e](https://github.com/snowdreamtech/template/commit/ad7782e6cf9fe016fea9d8c28485e9360ca42d8f))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([74e1355](https://github.com/snowdreamtech/template/commit/74e1355c9ab00b26e752041c0039c9c3a618235f))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([6c009ed](https://github.com/snowdreamtech/template/commit/6c009edf6b232c71942c8ab53b98d845b2afed4a))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([5668326](https://github.com/snowdreamtech/template/commit/5668326618635423468db8669a2fe868b5aceb3c))
* **deps:** sync dependabot config and mise toolchain [skip ci] ([816f2d1](https://github.com/snowdreamtech/template/commit/816f2d17208e90cf7279af257db5c16e74b83b0e))
* **deps:** sync dependabot config and unirtm toolchain ([e6c6d24](https://github.com/snowdreamtech/template/commit/e6c6d241754751d0daf1b9e83f4366379e056313))
* **deps:** sync dependabot config and unirtm toolchain ([a7cc3ed](https://github.com/snowdreamtech/template/commit/a7cc3eda6a77ba7de712012d49ced48bd09eae59))
* **deps:** sync dependabot config and unirtm toolchain ([8c0e483](https://github.com/snowdreamtech/template/commit/8c0e483f46df93398ac92901d0406d8877527129))
* **deps:** sync dependabot config and unirtm toolchain ([d908c5b](https://github.com/snowdreamtech/template/commit/d908c5b7fdaf77401564dbf1af2e207a4b262752))
* **deps:** sync dependabot config and unirtm toolchain ([d7023c0](https://github.com/snowdreamtech/template/commit/d7023c0be316486305fce889c7b004b20ad7c275))
* **deps:** sync dependabot config and unirtm toolchain ([bb56138](https://github.com/snowdreamtech/template/commit/bb56138d75144c8748f145064e922dd3e6d6dc74))
* **deps:** sync dependabot config and unirtm toolchain ([c244660](https://github.com/snowdreamtech/template/commit/c244660fcb9c0d9a6ed9aaf2829d2964f68d987b))
* **deps:** sync dependabot config and unirtm toolchain ([886b3fa](https://github.com/snowdreamtech/template/commit/886b3fa8c417add860d17fe12e0750964ce03886))
* **deps:** sync dependabot config and unirtm toolchain ([4f74adf](https://github.com/snowdreamtech/template/commit/4f74adfffc0e78819a8a53ed22284f2c0897e8e2))
* **deps:** sync dependabot config and unirtm toolchain ([eabf483](https://github.com/snowdreamtech/template/commit/eabf483fd39cd3a00f73d7e380a8e82a8de3eb3d))
* **deps:** sync dependabot config and unirtm toolchain ([70cd8d9](https://github.com/snowdreamtech/template/commit/70cd8d91e24ff5d79ee4508b8d87a71c43f87912))
* **deps:** sync dependabot config and unirtm toolchain ([f561c65](https://github.com/snowdreamtech/template/commit/f561c65fd180508bba43e61ed445fba6e3898d23))
* **deps:** sync dependabot config and unirtm toolchain ([5169535](https://github.com/snowdreamtech/template/commit/5169535295d32ab02b3705fac84c58f3295188cc))
* **deps:** sync dependabot config and unirtm toolchain ([b70d42e](https://github.com/snowdreamtech/template/commit/b70d42ee1c936de486631a5579fce9c88075185a))
* **deps:** sync dependabot config and unirtm toolchain ([2de6141](https://github.com/snowdreamtech/template/commit/2de614154fc5abf1b011618a96bd21161e0f846c))
* **deps:** sync dependabot config and unirtm toolchain [skip ci] ([c193711](https://github.com/snowdreamtech/template/commit/c19371194eda1fa7ec8417de087d0b01465b213e))
* **deps:** sync dependabot config and unirtm toolchain [skip ci] ([629f2b2](https://github.com/snowdreamtech/template/commit/629f2b287a3e02a0251c43807523328a2e650855))
* **deps:** update go version to 1.26.5 ([91349d4](https://github.com/snowdreamtech/template/commit/91349d45d07f4928818f869a38e06042912d0710))
* **deps:** update golangci-lint to v2.13.2 with /v2 module path and remove lockfile ([2199c57](https://github.com/snowdreamtech/template/commit/2199c574af594eed06aa6e121ebe6a186f943e0b))
* **deps:** update govulncheck tool version to v1.7.0 for Go 1.27 AST support ([54e84b9](https://github.com/snowdreamtech/template/commit/54e84b9edc847675b20fa7ef7262d41b95878661))
* **deps:** update mise to v2026.4.11 ([fcb9b01](https://github.com/snowdreamtech/template/commit/fcb9b01bc444d2f5754c14324b19ffe7f745ef5e))
* **deps:** update mise.lock with yamllint 1.38.0 ([72a0ca1](https://github.com/snowdreamtech/template/commit/72a0ca13318f27ba9fafe1af84d9d070851c1d90))
* **deps:** update taplo references in lint-wrapper and comments ([bfa2c28](https://github.com/snowdreamtech/template/commit/bfa2c2843a8aaf1d03fe0ea425fb38b4397ae0dc))
* **deps:** update unirtm tool dependencies to latest versions ([c1606f7](https://github.com/snowdreamtech/template/commit/c1606f7653eafcd4b4d4ce730d5f1f716f589398))
* **deps:** update unirtm toolchain version to 0.28.0 ([b24cb8e](https://github.com/snowdreamtech/template/commit/b24cb8ef46c5fd2abce6b84a0cb8354b725f9ae7))
* **deps:** update unirtm toolchain version to 0.30.0 ([2334d08](https://github.com/snowdreamtech/template/commit/2334d088055136020e9a3c176d338c8185cb9ac0))
* **deps:** update unirtm toolchain versions ([23e763a](https://github.com/snowdreamtech/template/commit/23e763a3ea3618766e9f9103095f1aff52764652))
* **deps:** upgrade golang version to 1.27.0 in template ([8559102](https://github.com/snowdreamtech/template/commit/8559102441208d4d9d5150bea6705f565129a190))
* **deps:** upgrade mise from 2026.4.14 to 2026.4.15 ([df1e37e](https://github.com/snowdreamtech/template/commit/df1e37ea4bbca1913ddb01a7b34d8fd3197ba19d))
* **deps:** upgrade taplo to 0.10.0 using github provider ([50225e3](https://github.com/snowdreamtech/template/commit/50225e3ab711fd56f5affabf24ef729f6aff871b))
* **deps:** upgrade unirtm-version to 0.30.1 ([87148d3](https://github.com/snowdreamtech/template/commit/87148d3c7b1f17d59f660ba3b9aba1ab944f4f27))
* **deps:** upgrade unirtm-version to 0.31.0 ([883b51e](https://github.com/snowdreamtech/template/commit/883b51e6ca6902771f0340bd871c600317bcc22d))
* **deps:** upgrade unirtm-version to 0.31.1 ([154816a](https://github.com/snowdreamtech/template/commit/154816a94e4aaeeec926fc990bdcc6fb2d9458c4))
* **deps:** upgrade unirtm-version to 0.33.0 ([4705424](https://github.com/snowdreamtech/template/commit/4705424ba009f34cc81151f0078fab48188c7df0))
* **devcontainer:** remove debug echo statements ([301cf52](https://github.com/snowdreamtech/template/commit/301cf52a2020939b0f63dd1b41feaf097818a86d))
* **devcontainer:** replace MISE_ variables with UNIRTM_ and remove redundant HOST_HOME ([26e7368](https://github.com/snowdreamtech/template/commit/26e73687789097f86a41609a97d47dcb4e07c3d9))
* **devcontainer:** update devcontainer image to latest ([5988d66](https://github.com/snowdreamtech/template/commit/5988d66920220f588096912ac114aeb4482fd25e))
* **dev:** release 0.4.0 ([eced437](https://github.com/snowdreamtech/template/commit/eced437482a347a8a0bfbfe3ae39eb1628978c4c))
* **dev:** release 0.4.0 ([5416f9a](https://github.com/snowdreamtech/template/commit/5416f9a8eece27daed64afd02dfa767cef387a2e))
* **docs:** explicitly add esbuild and vite to devDependencies for tracking ([ea50d16](https://github.com/snowdreamtech/template/commit/ea50d166a8f149e4892180ffb28f0259a7a95367))
* **docs:** resolve esbuild and vite vulnerabilities via overrides ([f39d782](https://github.com/snowdreamtech/template/commit/f39d782f5b1ae3fba6d10a7b18cf3c564e502daf))
* fine-tune pre-commit config to perfectly match UniRTM configuration ([286f118](https://github.com/snowdreamtech/template/commit/286f118352e27127e67661db7de80fc542565073))
* formatting fixes and workflow updates ([34fbbe8](https://github.com/snowdreamtech/template/commit/34fbbe8c5255f85db61d77ef7a6bc04606600813))
* generate package-lock.json files after migrating from pnpm to npm ([972f7e8](https://github.com/snowdreamtech/template/commit/972f7e82c1cf42576fd9bcc0968b6c3253c6a47f))
* **git:** ignore temporary mjs timestamps and trivy cache directory ([5875d36](https://github.com/snowdreamtech/template/commit/5875d36e2dbaa136c9cc25844a5144493857309d))
* **git:** preserve pkg directory in gitignore for standard source layouts ([c0f7694](https://github.com/snowdreamtech/template/commit/c0f76946940ff88af39e0b6a3405e62f2bdc8125))
* improve devcontainer init script with better error handling and mise configuration ([39493e2](https://github.com/snowdreamtech/template/commit/39493e2405093b0b71ac40db6015f9f98bb2012c))
* **lint:** exclude .specify directory from editorconfig checking ([8b7aefa](https://github.com/snowdreamtech/template/commit/8b7aefa1dbe795817a82f0040d254ebcd1840466))
* **main:** release 0.0.1 ([32370a4](https://github.com/snowdreamtech/template/commit/32370a462c920caa4ce509037d1948a256c2fa8e))
* **main:** release 0.0.2 ([1296640](https://github.com/snowdreamtech/template/commit/1296640aeddd3ac5b2a4bcc3f8e998e07962b980))
* **main:** release 0.0.3 ([d1e59d1](https://github.com/snowdreamtech/template/commit/d1e59d1ed126f87b237d9a2a7b7ddd1fb8d75717))
* **main:** release 0.0.4 ([673b664](https://github.com/snowdreamtech/template/commit/673b664ad96eea2134914e015191e92195a5cb02))
* **main:** release 0.0.4 ([50f54df](https://github.com/snowdreamtech/template/commit/50f54df242ad2f1b3eb9af763359692728e38200))
* **main:** release 0.0.4 ([f0ef6ca](https://github.com/snowdreamtech/template/commit/f0ef6ca4b3206fe9207b4732132dcce99815c413))
* **main:** release 0.1.0 ([eb020cd](https://github.com/snowdreamtech/template/commit/eb020cd127b8190da4b6a59cd39c901fa5848720))
* **main:** release 0.10.0 ([1139f92](https://github.com/snowdreamtech/template/commit/1139f9288c79467381d3cf38389f65b724839ed6))
* **main:** release 0.11.0 ([7e03bfd](https://github.com/snowdreamtech/template/commit/7e03bfda7c5b5caa7d6bfad9c410fc85065cd05a))
* **main:** release 0.12.0 ([04ca93f](https://github.com/snowdreamtech/template/commit/04ca93f913b54cceed8e721a9362218f96b1008d))
* **main:** release 0.13.0 ([0f9dd47](https://github.com/snowdreamtech/template/commit/0f9dd4727a7e438c23c5d1ebc90ce28faf3dd4dc))
* **main:** release 0.13.1 ([07dea06](https://github.com/snowdreamtech/template/commit/07dea063b65dfd2cc0b7251754be2df0fad75aac))
* **main:** release 0.14.0 ([0626ae4](https://github.com/snowdreamtech/template/commit/0626ae499bd1ccf7e867d9944be9089e2c03287a))
* **main:** release 0.14.0 ([775a72f](https://github.com/snowdreamtech/template/commit/775a72fd68201e4eba2a184e0ed91c6ec8fadccf))
* **main:** release 0.14.0 ([043d2a4](https://github.com/snowdreamtech/template/commit/043d2a4202505e42c645e899c6731f5fb8f52c8e))
* **main:** release 0.15.0 ([6093285](https://github.com/snowdreamtech/template/commit/609328596217c6f3ac7ec3f0b6f54117e8b48c7f))
* **main:** release 0.2.0 ([6707425](https://github.com/snowdreamtech/template/commit/67074258991e7822b1db7d5227b1095ed4aca458))
* **main:** release 0.3.0 ([2036489](https://github.com/snowdreamtech/template/commit/2036489ab7d7df669e8c2489b3ff4953c24c14f7))
* **main:** release 0.4.0 ([1c66ecb](https://github.com/snowdreamtech/template/commit/1c66ecbb5fb529d40d714b9052451a8ad385701d))
* **main:** release 0.5.0 ([2e24c34](https://github.com/snowdreamtech/template/commit/2e24c34bdb4aa777d60d997537fb0aff5b2e2a25))
* **main:** release 0.6.0 ([f3c6b45](https://github.com/snowdreamtech/template/commit/f3c6b459774ca65df2ffbf852486260a45c31cd0))
* **main:** release 0.6.1 ([c66f36b](https://github.com/snowdreamtech/template/commit/c66f36b136a87d8f24ddcb2af92300b17beedf3b))
* **main:** release 0.7.0 ([8b56095](https://github.com/snowdreamtech/template/commit/8b56095912f538971c53704e5633e99614b19eeb))
* **main:** release 0.7.0 ([ae017c0](https://github.com/snowdreamtech/template/commit/ae017c03dece57b28e0179cda07297b64d54d667))
* **main:** release 0.7.1 ([907dec7](https://github.com/snowdreamtech/template/commit/907dec72f18b9d91b7f9d96950df653e33b83fd0))
* **main:** release 0.8.0 ([de253c8](https://github.com/snowdreamtech/template/commit/de253c8124e169cc86e5ec0cadd22114d6045de5))
* **main:** release 0.8.1 ([661f828](https://github.com/snowdreamtech/template/commit/661f82859b2e7578cc71836885afb9044b3fbad1))
* **main:** release 0.8.2 ([bdbb873](https://github.com/snowdreamtech/template/commit/bdbb87399201185b53cebdf9b2e0072dd7d22e6c))
* **main:** release 0.9.0 ([2e6cf66](https://github.com/snowdreamtech/template/commit/2e6cf66f9f6c528ab9ac936f7f08ab1f1e0705b9))
* **main:** release 0.9.1 ([bacb8c0](https://github.com/snowdreamtech/template/commit/bacb8c086bd5ad57dd79c6eac13675b673cc3de9))
* **main:** release 0.9.2 ([748e5a8](https://github.com/snowdreamtech/template/commit/748e5a877bf4fbd3cb3f9dc8ca5a3b3f023a8d5a))
* **mise:** add PyYAML to core tools for YAML processing ([fdfd2ee](https://github.com/snowdreamtech/template/commit/fdfd2ee261a2d951fd6f648491a6140c2a0566e2))
* **pre-commit:** remove duplicate online zizmor hook ([0124b68](https://github.com/snowdreamtech/template/commit/0124b6870b360f9fa7b55c8bfc47e29e4e3596f1))
* regenerate unirtm.lock with algorithm prefix ([de2b74b](https://github.com/snowdreamtech/template/commit/de2b74b0d0efbad5fa742a7324331504895e1c73))
* release 0.6.1 ([f6fc042](https://github.com/snowdreamtech/template/commit/f6fc042cad7d1c4991a20657655bc4b6b339d0d9))
* release 0.7.1 ([5535492](https://github.com/snowdreamtech/template/commit/5535492160f3525dff06ff9f0c6d78147467bed3))
* release main ([7c79c69](https://github.com/snowdreamtech/template/commit/7c79c69b290fcf8ca42dd96b5da9e4d386a6221d))
* release main ([10e8a24](https://github.com/snowdreamtech/template/commit/10e8a2436e17c20d88911ae536bc4b2d7dd902a5))
* release main ([9671f29](https://github.com/snowdreamtech/template/commit/9671f29e05dabcef89fe40a2566973b1daddc348))
* release main ([3ce846e](https://github.com/snowdreamtech/template/commit/3ce846eda8539f7ccdc46fd21f0d59a1b59537dd))
* release main ([1fa1601](https://github.com/snowdreamtech/template/commit/1fa1601e33c1fd73937eca3b9e6e88f61b390a36))
* release main ([91fc3d6](https://github.com/snowdreamtech/template/commit/91fc3d66da1c32ee41868c560f8f21c42ecd1108))
* release main ([700980f](https://github.com/snowdreamtech/template/commit/700980f0d84553b1094f49745d30f5daf9a22b1b))
* release main ([f194b67](https://github.com/snowdreamtech/template/commit/f194b6782d11cd801472361df52aa91e89ff4885))
* release main ([55a97dd](https://github.com/snowdreamtech/template/commit/55a97ddfbd7dc4d81d95104d2d32ed1e6dc7d763))
* release main ([ac32ddd](https://github.com/snowdreamtech/template/commit/ac32ddd54d05d077fbfb0d310df419e82cef3e39))
* release main ([a3848c6](https://github.com/snowdreamtech/template/commit/a3848c6ef66794de17cb5a0411310a863fe2e6af))
* release main ([40863d5](https://github.com/snowdreamtech/template/commit/40863d5425314b3ad86c556202e48981d0bf6668))
* release main ([e0a7459](https://github.com/snowdreamtech/template/commit/e0a7459cb2b774cddbbae5d44b2eb0573a60081d))
* release main ([5e48a77](https://github.com/snowdreamtech/template/commit/5e48a775a831dad88f43d8cbea9a1c160957cb3c))
* release main ([e715f5d](https://github.com/snowdreamtech/template/commit/e715f5dbeb88ad32de35674076f64b523a224a5f))
* release main ([13ea78a](https://github.com/snowdreamtech/template/commit/13ea78a11f570db235eddc14406cf7399308e2d3))
* release main ([88b235c](https://github.com/snowdreamtech/template/commit/88b235ce8bbb67c63cbcbcbe63862992407e825c))
* release main ([782aa1a](https://github.com/snowdreamtech/template/commit/782aa1a112092bc881b36c47087a9a84829473a8))
* release main ([76bafd6](https://github.com/snowdreamtech/template/commit/76bafd6d4eecbe14ec4b7fbe707280b4b4db9c07))
* release main ([#179](https://github.com/snowdreamtech/template/issues/179)) ([5abb138](https://github.com/snowdreamtech/template/commit/5abb138b8facdbef67eb206af1604e8e453c2660))
* **release:** align .goreleaser.yaml with unirtm ([1af870e](https://github.com/snowdreamtech/template/commit/1af870e091f0dcb84ef3f59e30f735e912876d14))
* **release:** configure root package in config ([6d6254d](https://github.com/snowdreamtech/template/commit/6d6254dbe4df6d791e5f045ebab89def451bf089))
* **release:** deduplicate CHANGELOG headers ([639b069](https://github.com/snowdreamtech/template/commit/639b0695d7325f2d2a827301a2f3a41111fcab6d))
* **release:** set bump-patch-for-minor-pre-major to false ([1e47e29](https://github.com/snowdreamtech/template/commit/1e47e29bf8d338de6bf5cee8c1373507568c5c4c))
* **release:** synchronize lockfiles for version bump ([ad0ea63](https://github.com/snowdreamtech/template/commit/ad0ea635d0d104728210e665142eff6067d50120))
* **release:** synchronize lockfiles for version bump ([ea5dc5d](https://github.com/snowdreamtech/template/commit/ea5dc5d327df3db1db2a908b6bab573a5b111523))
* **release:** update packages to use docker prefix and add rocky support ([81f21b2](https://github.com/snowdreamtech/template/commit/81f21b2115a96934213a15e66d6937560aabaa62))
* **release:** v0.4.0 - Fix Dependabot docker-compose detection ([e91f7d8](https://github.com/snowdreamtech/template/commit/e91f7d882f3c7b23260f4da02f0e5e53d6399968))
* remove Makefile and mise.lock ([4b63962](https://github.com/snowdreamtech/template/commit/4b6396238bf431d452a02b1b9af0afe5d2b409f3))
* remove temporary token audit report ([50a73c7](https://github.com/snowdreamtech/template/commit/50a73c7f88dbcf56332220a5941f6ca00f994bcd))
* remove test script from repository ([1268d29](https://github.com/snowdreamtech/template/commit/1268d29eebd9adeb8e108b3bf1f5ae67acd78d63))
* remove unirtm.lock ([2da4f50](https://github.com/snowdreamtech/template/commit/2da4f50852d8a6b97f334b1c533dffaa08394cb5))
* remove unused package.json from project root ([7648e2b](https://github.com/snowdreamtech/template/commit/7648e2b84c8595852c07be3499747e4606ef145b))
* sync unirtm updates (v0.29.1, dependabot lock flags, lint bumps, dead code cleanup) ([6d0c3b7](https://github.com/snowdreamtech/template/commit/6d0c3b7f934327fa81c4e903ec7ab69b1c810bf2))
* **toolchain:** configure GOTOOLCHAIN to auto in unirtm environment and test tasks ([6529890](https://github.com/snowdreamtech/template/commit/6529890d2cc171fe02761235e6274517e168cb3e))
* update cd workflow configuration ([e06ee75](https://github.com/snowdreamtech/template/commit/e06ee75bbcf0dd366ef34c5230b91b81d81b1bf6))
* update UniRTM template, IDE agent rules, and disable Goreleaser snap publishing ([ff5d293](https://github.com/snowdreamtech/template/commit/ff5d2936b77dbee822169d83d5ab1e1c46ca1125))
* update zizmor configuration [skip ci] ([9b58403](https://github.com/snowdreamtech/template/commit/9b58403b65722fdf09bb39e4cd32871678c6c26d))
* upgrade actions/checkout to v7.0.0 in goreleaser workflow ([1330789](https://github.com/snowdreamtech/template/commit/1330789b6d769879e5475a835006af8e6bb52251))
* upgrade setup-unirtm action to v0.6.0 and UniRTM to v0.25.7 in workflows ([1088902](https://github.com/snowdreamtech/template/commit/10889026cbc7ce16ab41407a099d74cf6a6eb89f))

## [0.16.1](https://github.com/snowdreamtech/template/compare/v0.16.0...v0.16.1) (2026-09-29)


### 🐛 Bug Fixes

* **docs:** pin mermaid to 11.17.2 and enable legacy peer deps for vitepress build ([2a799a2](https://github.com/snowdreamtech/template/commit/2a799a2a8b476e878fc9431f785c8e58a88e20b2))

## [0.16.0](https://github.com/snowdreamtech/template/compare/v0.15.17...v0.16.0) (2026-09-29)


### 🚀 Features

* **task:** add audit:fix and fix tasks for one-click self-healing ([589e107](https://github.com/snowdreamtech/template/commit/589e107522ccdeb2fba0b8bc5c4bb2eb3440b788))


### 🐛 Bug Fixes

* **docs:** override lodash-es to 4.18.1 and fix goreleaser deprecation ([5efcc86](https://github.com/snowdreamtech/template/commit/5efcc868f0581c6dcd4b84ec208cde9d71a18b11))


### 🛠 Refactoring

* **release:** standardize release asset naming conventions ([efa63e9](https://github.com/snowdreamtech/template/commit/efa63e9cd8a4fc2d73a342772eaef34aaa12d251))


### ♻️ Miscellaneous Chores

* **deps:** bump mermaid in /docs in the all-dependencies group ([bd4189e](https://github.com/snowdreamtech/template/commit/bd4189e65620a7d63226dae2a12b494f6acb6d74))
* **deps:** bump the all-dependencies group in /docs with 2 updates ([6333878](https://github.com/snowdreamtech/template/commit/633387889e894b4fd6b02b0c4a26a44a9ffdf7e0))
* **deps:** bump the all-dependencies group in /docs with 2 updates ([485f42d](https://github.com/snowdreamtech/template/commit/485f42de0853074dee8368166426986130b6d8e0))
* **deps:** sync dependabot config and unirtm toolchain ([a7cc3ed](https://github.com/snowdreamtech/template/commit/a7cc3eda6a77ba7de712012d49ced48bd09eae59))
* **deps:** sync dependabot config and unirtm toolchain ([8c0e483](https://github.com/snowdreamtech/template/commit/8c0e483f46df93398ac92901d0406d8877527129))
* **deps:** upgrade unirtm-version to 0.33.0 ([4705424](https://github.com/snowdreamtech/template/commit/4705424ba009f34cc81151f0078fab48188c7df0))
* **git:** ignore temporary mjs timestamps and trivy cache directory ([5875d36](https://github.com/snowdreamtech/template/commit/5875d36e2dbaa136c9cc25844a5144493857309d))
* **git:** preserve pkg directory in gitignore for standard source layouts ([c0f7694](https://github.com/snowdreamtech/template/commit/c0f76946940ff88af39e0b6a3405e62f2bdc8125))
* **lint:** exclude .specify directory from editorconfig checking ([8b7aefa](https://github.com/snowdreamtech/template/commit/8b7aefa1dbe795817a82f0040d254ebcd1840466))
* **toolchain:** configure GOTOOLCHAIN to auto in unirtm environment and test tasks ([6529890](https://github.com/snowdreamtech/template/commit/6529890d2cc171fe02761235e6274517e168cb3e))

## [0.15.17](https://github.com/snowdreamtech/template/compare/v0.15.16...v0.15.17) (2026-09-12)


### ♻️ Miscellaneous Chores

* **deps:** bump mermaid in /docs in the all-dependencies group ([060979a](https://github.com/snowdreamtech/template/commit/060979a73ff38e703afcf75ab98c64d51b595e64))
* **deps:** upgrade unirtm-version to 0.31.0 ([883b51e](https://github.com/snowdreamtech/template/commit/883b51e6ca6902771f0340bd871c600317bcc22d))
* **deps:** upgrade unirtm-version to 0.31.1 ([154816a](https://github.com/snowdreamtech/template/commit/154816a94e4aaeeec926fc990bdcc6fb2d9458c4))

## [0.15.16](https://github.com/snowdreamtech/template/compare/v0.15.15...v0.15.16) (2026-09-06)


### 🐛 Bug Fixes

* **deps:** add missing windows-amd64 platform for python in unirtm.lock ([fa18c7c](https://github.com/snowdreamtech/template/commit/fa18c7cd60bf9ffec9259b3ae749fc8faef68aec))


### ♻️ Miscellaneous Chores

* **deps:** migrate unirtm.lock keys to canonical prefixed format ([16421b7](https://github.com/snowdreamtech/template/commit/16421b7ed716746da0be4e147bed5ab75f77045d))
* **deps:** sync dependabot config and unirtm toolchain ([d908c5b](https://github.com/snowdreamtech/template/commit/d908c5b7fdaf77401564dbf1af2e207a4b262752))
* **deps:** sync dependabot config and unirtm toolchain ([d7023c0](https://github.com/snowdreamtech/template/commit/d7023c0be316486305fce889c7b004b20ad7c275))
* **deps:** update unirtm toolchain version to 0.30.0 ([2334d08](https://github.com/snowdreamtech/template/commit/2334d088055136020e9a3c176d338c8185cb9ac0))
* **deps:** upgrade unirtm-version to 0.30.1 ([87148d3](https://github.com/snowdreamtech/template/commit/87148d3c7b1f17d59f660ba3b9aba1ab944f4f27))

## [0.15.15](https://github.com/snowdreamtech/template/compare/v0.15.14...v0.15.15) (2026-09-05)


### 🐛 Bug Fixes

* **ci:** ensure npm install includes devDependencies in pages workflow ([4795ca3](https://github.com/snowdreamtech/template/commit/4795ca36f2eed5b3b9f522da75e5f6fd926aea61))


### ♻️ Miscellaneous Chores

* **deps:** sync dependabot config and unirtm toolchain ([bb56138](https://github.com/snowdreamtech/template/commit/bb56138d75144c8748f145064e922dd3e6d6dc74))
* sync unirtm updates (v0.29.1, dependabot lock flags, lint bumps, dead code cleanup) ([6d0c3b7](https://github.com/snowdreamtech/template/commit/6d0c3b7f934327fa81c4e903ec7ab69b1c810bf2))

## [0.15.14](https://github.com/snowdreamtech/template/compare/v0.15.13...v0.15.14) (2026-09-04)


### 🐛 Bug Fixes

* **ci:** disable gpg signing in workflow commit steps ([43f266e](https://github.com/snowdreamtech/template/commit/43f266e0e3c9b65bfbb6da0c761caa8d4f047c20))
* **deps:** set valid golangci-lint version to v1.64.8 ([625796e](https://github.com/snowdreamtech/template/commit/625796e5e0bb7313e0b4a44ead0a0f75145e4bad))
* **unirtm:** add missing macos platform entries for editorconfig-checker@4.0.0 ([30c33f1](https://github.com/snowdreamtech/template/commit/30c33f1e527b062436491cc10c7dc24613da41be))


### ♻️ Miscellaneous Chores

* **deps:** bump the all-dependencies group in /docs with 3 updates ([3e4b847](https://github.com/snowdreamtech/template/commit/3e4b8479f8be438ffe369c01e099b35844a1d7e0))
* **deps:** sync dependabot config and unirtm toolchain ([c244660](https://github.com/snowdreamtech/template/commit/c244660fcb9c0d9a6ed9aaf2829d2964f68d987b))
* **deps:** sync dependabot config and unirtm toolchain ([886b3fa](https://github.com/snowdreamtech/template/commit/886b3fa8c417add860d17fe12e0750964ce03886))
* **deps:** update golangci-lint to v2.13.2 with /v2 module path and remove lockfile ([2199c57](https://github.com/snowdreamtech/template/commit/2199c574af594eed06aa6e121ebe6a186f943e0b))
* **deps:** update unirtm tool dependencies to latest versions ([c1606f7](https://github.com/snowdreamtech/template/commit/c1606f7653eafcd4b4d4ce730d5f1f716f589398))

## [0.15.13](https://github.com/snowdreamtech/template/compare/v0.15.12...v0.15.13) (2026-08-25)


### ♻️ Miscellaneous Chores

* **deps:** sync dependabot config and unirtm toolchain ([4f74adf](https://github.com/snowdreamtech/template/commit/4f74adfffc0e78819a8a53ed22284f2c0897e8e2))
* **deps:** update govulncheck tool version to v1.7.0 for Go 1.27 AST support ([54e84b9](https://github.com/snowdreamtech/template/commit/54e84b9edc847675b20fa7ef7262d41b95878661))
* **deps:** update unirtm toolchain version to 0.28.0 ([b24cb8e](https://github.com/snowdreamtech/template/commit/b24cb8ef46c5fd2abce6b84a0cb8354b725f9ae7))

## [0.15.12](https://github.com/snowdreamtech/template/compare/v0.15.11...v0.15.12) (2026-08-22)


### ♻️ Miscellaneous Chores

* **deps:** sync dependabot config and unirtm toolchain ([eabf483](https://github.com/snowdreamtech/template/commit/eabf483fd39cd3a00f73d7e380a8e82a8de3eb3d))
* **deps:** sync dependabot config and unirtm toolchain ([70cd8d9](https://github.com/snowdreamtech/template/commit/70cd8d91e24ff5d79ee4508b8d87a71c43f87912))
* **deps:** upgrade golang version to 1.27.0 in template ([8559102](https://github.com/snowdreamtech/template/commit/8559102441208d4d9d5150bea6705f565129a190))

## [0.15.11](https://github.com/snowdreamtech/template/compare/v0.15.10...v0.15.11) (2026-08-19)


### 🐛 Bug Fixes

* update nanoid to 3.3.18 in package-lock.json ([7411de0](https://github.com/snowdreamtech/template/commit/7411de016dbe4a384dc51712354aac7852f4e00b))


### ♻️ Miscellaneous Chores

* **deps:** bump the all-dependencies group in /docs with 3 updates ([8c8ffd9](https://github.com/snowdreamtech/template/commit/8c8ffd91c27ffc4a74cf44ea5c3eadec988ffa04))
* **deps:** bump vite in /docs in the all-dependencies group ([91cdab1](https://github.com/snowdreamtech/template/commit/91cdab13e0b1cbf7e533b1173f02661b0c4dade4))
* **release:** set bump-patch-for-minor-pre-major to false ([1e47e29](https://github.com/snowdreamtech/template/commit/1e47e29bf8d338de6bf5cee8c1373507568c5c4c))

## [0.15.10](https://github.com/snowdreamtech/template/compare/v0.15.9...v0.15.10) (2026-08-08)


### 🚀 Features

* enable remote.SSH.allowLocalServerDownload to improve connection reliability ([8a6c80d](https://github.com/snowdreamtech/template/commit/8a6c80dd26e92e1a2d37be50a2ca5ca5113f08d8))
* update vscode settings with enhanced editor, explorer, and terminal configurations ([44230bc](https://github.com/snowdreamtech/template/commit/44230bceaf3deebc247739e9f91c55a1d2721803))


### 🐛 Bug Fixes

* **docs:** resolve npm vulnerabilities by pinning exact dependency versions ([d628640](https://github.com/snowdreamtech/template/commit/d6286404ea025ee0cad3123b5b0b3bc6bd21a551))


### ♻️ Miscellaneous Chores

* **deps:** sync dependabot config and unirtm toolchain ([f561c65](https://github.com/snowdreamtech/template/commit/f561c65fd180508bba43e61ed445fba6e3898d23))
* **deps:** update go version to 1.26.5 ([91349d4](https://github.com/snowdreamtech/template/commit/91349d45d07f4928818f869a38e06042912d0710))
* **deps:** update unirtm toolchain versions ([23e763a](https://github.com/snowdreamtech/template/commit/23e763a3ea3618766e9f9103095f1aff52764652))

## [0.15.9](https://github.com/snowdreamtech/template/compare/v0.15.8...v0.15.9) (2026-08-06)


### 🐛 Bug Fixes

* **security:** resolve postcss vulnerability and fix gh issue creation label ([d1a10c0](https://github.com/snowdreamtech/template/commit/d1a10c0e4673c96c4bc05f34ec58527f4d1dead0))


### ♻️ Miscellaneous Chores

* **deps:** bump vite in /docs in the all-dependencies group ([6cccd02](https://github.com/snowdreamtech/template/commit/6cccd0239f14774c5dca746a861871855022e1cf))
* **deps:** bump vite in /docs in the all-dependencies group ([bcad411](https://github.com/snowdreamtech/template/commit/bcad411a69b84ae6eb1db8cb71e8e8a3f54f48d6))
* **deps:** sync dependabot config and unirtm toolchain ([5169535](https://github.com/snowdreamtech/template/commit/5169535295d32ab02b3705fac84c58f3295188cc))
* upgrade setup-unirtm action to v0.6.0 and UniRTM to v0.25.7 in workflows ([1088902](https://github.com/snowdreamtech/template/commit/10889026cbc7ce16ab41407a099d74cf6a6eb89f))

## [0.15.8](https://github.com/snowdreamtech/template/compare/v0.15.7...v0.15.8) (2026-07-13)


### ♻️ Miscellaneous Chores

* add egress network allowlist entries to all GitHub Actions workflows ([9616592](https://github.com/snowdreamtech/template/commit/961659274a02544704ba1a9e22327d70b11fb109))
* **deps:** bump vite in /docs in the all-dependencies group ([f3e5f8f](https://github.com/snowdreamtech/template/commit/f3e5f8fbf6c7bc524b70caccf8aa20eea3bbd4e7))

## [0.15.7](https://github.com/snowdreamtech/template/compare/v0.15.6...v0.15.7) (2026-07-06)


### ♻️ Miscellaneous Chores

* **deps:** bump vite in /docs in the all-dependencies group ([8ed895d](https://github.com/snowdreamtech/template/commit/8ed895da084eace6e4aa43ed23b11c31e00764f4))

## [0.15.6](https://github.com/snowdreamtech/template/compare/v0.15.5...v0.15.6) (2026-07-06)


### 🛠 Refactoring

* apply black formatting style to all pre-commit hook scripts ([b9fe7ff](https://github.com/snowdreamtech/template/commit/b9fe7ffb8fa098e2f9e38410c70efada552edfd0))
* **pre-commit:** clean up redundant exclude fields and optimize filtering ([d95b727](https://github.com/snowdreamtech/template/commit/d95b727b6ae1e88d7f48d301b3355b798e712348))
* **pre-commit:** optimize configuration and extract python scripts ([f712d68](https://github.com/snowdreamtech/template/commit/f712d683b3e2bc9edbe4562c123190ceb75f8c5e))


### ♻️ Miscellaneous Chores

* **pre-commit:** remove duplicate online zizmor hook ([0124b68](https://github.com/snowdreamtech/template/commit/0124b6870b360f9fa7b55c8bfc47e29e4e3596f1))

## [0.15.5](https://github.com/snowdreamtech/template/compare/v0.15.4...v0.15.5) (2026-07-05)


### 🐛 Bug Fixes

* make version regex robust against initial release in cd.yml ([f560288](https://github.com/snowdreamtech/template/commit/f5602885c3ef4ca42fe6e085a83c6077c51cc09c))


### ♻️ Miscellaneous Chores

* **release:** align .goreleaser.yaml with unirtm ([1af870e](https://github.com/snowdreamtech/template/commit/1af870e091f0dcb84ef3f59e30f735e912876d14))

## [0.15.4](https://github.com/snowdreamtech/template/compare/v0.15.3...v0.15.4) (2026-06-30)


### 🚀 Features

* add support for riscv64, ppc64le, loong64, and s390x architectures in install script ([26d48f0](https://github.com/snowdreamtech/template/commit/26d48f019620413782b0348cedc3c320412e29e4))


### ♻️ Miscellaneous Chores

* upgrade actions/checkout to v7.0.0 in goreleaser workflow ([1330789](https://github.com/snowdreamtech/template/commit/1330789b6d769879e5475a835006af8e6bb52251))

## [0.15.3](https://github.com/snowdreamtech/template/compare/v0.15.2...v0.15.3) (2026-06-28)


### ♻️ Miscellaneous Chores

* **deps:** bump unirtm version to 0.25.3 ([49f7888](https://github.com/snowdreamtech/template/commit/49f788808736ba4e1d2902e1911192ad1ad77ede))
* **deps:** regenerate unirtm.lock with v0.25.0 format ([9227ed1](https://github.com/snowdreamtech/template/commit/9227ed1faa7f52f24dea36a7de6c458d22620f9e))
* **deps:** sync dependabot config and unirtm toolchain ([b70d42e](https://github.com/snowdreamtech/template/commit/b70d42ee1c936de486631a5579fce9c88075185a))
* **deps:** sync dependabot config and unirtm toolchain ([2de6141](https://github.com/snowdreamtech/template/commit/2de614154fc5abf1b011618a96bd21161e0f846c))
* regenerate unirtm.lock with algorithm prefix ([de2b74b](https://github.com/snowdreamtech/template/commit/de2b74b0d0efbad5fa742a7324331504895e1c73))
* remove unirtm.lock ([2da4f50](https://github.com/snowdreamtech/template/commit/2da4f50852d8a6b97f334b1c533dffaa08394cb5))

## [0.15.2](https://github.com/snowdreamtech/template/compare/v0.15.1...v0.15.2) (2026-06-20)


### 🐛 Bug Fixes

* **cd:** delete remote tag before re-push to trigger downstream docker build ([be75906](https://github.com/snowdreamtech/template/commit/be759064255c0e8f8e24f45efb260d5a26466c2a))
* **cd:** disable persist-credentials to ensure WORKFLOW_SECRET PAT is used for tag push ([bedf7bf](https://github.com/snowdreamtech/template/commit/bedf7bf3bdabc083f6fd60d69d99dd2d482ea0ee))


### ♻️ Miscellaneous Chores

* release main ([76bafd6](https://github.com/snowdreamtech/template/commit/76bafd6d4eecbe14ec4b7fbe707280b4b4db9c07))
* **release:** deduplicate CHANGELOG headers ([639b069](https://github.com/snowdreamtech/template/commit/639b0695d7325f2d2a827301a2f3a41111fcab6d))

## [0.15.1](https://github.com/snowdreamtech/template/compare/v0.15.0...v0.15.1) (2026-06-19)


### 🚀 Features

* **cd:** sync release orchestration enhancements from base repo ([b00fee8](https://github.com/snowdreamtech/template/commit/b00fee866cebcb89c24604a96bdfcd8816c60467))


### ♻️ Miscellaneous Chores

* **release:** configure root package in config ([6d6254d](https://github.com/snowdreamtech/template/commit/6d6254dbe4df6d791e5f045ebab89def451bf089))
* **release:** update packages to use docker prefix and add rocky support ([81f21b2](https://github.com/snowdreamtech/template/commit/81f21b2115a96934213a15e66d6937560aabaa62))

## [0.15.0](https://github.com/snowdreamtech/template/compare/v0.14.0...v0.15.0) (2026-06-16)


### Features

* **devcontainer:** add volume cache for osv-scanner ([95891da](https://github.com/snowdreamtech/template/commit/95891daa85b4e4759ce3fe748d6107894a8f8cac))
* **devcontainer:** add volume cache for trivy ([9f931a1](https://github.com/snowdreamtech/template/commit/9f931a1d4e63544dbc34dbb795635990587f86e9))
* **devcontainer:** add vscode extension customizations for auto-installation ([efae646](https://github.com/snowdreamtech/template/commit/efae64695c1208107298d792e272f05128405b6d))
* **devcontainer:** forward common development and web ports ([35ff5f6](https://github.com/snowdreamtech/template/commit/35ff5f6256f3f2e88ccce449121826eac48fdc2b))

## [0.13.1](https://github.com/snowdreamtech/template/compare/v0.13.0...v0.13.1) (2026-04-29)


### Bug Fixes

* **ci:** disable shellcheck integration in actionlint to prevent Windows hang ([1d711d8](https://github.com/snowdreamtech/template/commit/1d711d8c1bc4c7482651f1abe228c970ba6f024c))

## [0.13.0](https://github.com/snowdreamtech/template/compare/v0.12.0...v0.13.0) (2026-04-28)


### Features

* **ci:** enable auto-merge for ALL dependabot updates including major ([9c8bae2](https://github.com/snowdreamtech/template/commit/9c8bae233e0e8834a611370dc897ac67db64057a))
* **deps:** consolidate all dependabot updates into single PR ([e753902](https://github.com/snowdreamtech/template/commit/e753902201ce2f059747de31b59681442bb149b0))


### Bug Fixes

* **deps:** correct devcontainers directory to root ([9d83806](https://github.com/snowdreamtech/template/commit/9d838067e3fb82e84c1107f0036cc4a7b7855f56))
* **deps:** exclude .devcontainer from docker ecosystem detection ([67e96c3](https://github.com/snowdreamtech/template/commit/67e96c3c1b94c72811d81af229a017f927fd3de4))

## [0.12.0](https://github.com/snowdreamtech/template/compare/v0.11.0...v0.12.0) (2026-04-27)


### Features

* **security:** add CDN and download mirror endpoints to harden runner ([3ff8a5d](https://github.com/snowdreamtech/template/commit/3ff8a5d3d073a57bb4681c619e94aa797983ef23))
* **security:** add DockerHub endpoints to harden runner ([48b6416](https://github.com/snowdreamtech/template/commit/48b6416ced65a68194a50d4ffb406c7e7257a37f))

## [0.11.0](https://github.com/snowdreamtech/template/compare/v0.10.0...v0.11.0) (2026-04-24)


### Features

* **ci:** add GitHub API rate limit info to summary reports ([8c4293a](https://github.com/snowdreamtech/template/commit/8c4293afbd82f74278af2db4ecb77abf6a9b1aab))
* **deps:** optimize dependabot configuration and grouping strategy ([900f3af](https://github.com/snowdreamtech/template/commit/900f3aff782a709643b81f9721a45da7a0d10a87))


### Bug Fixes

* **ci:** replace head -n -1 with sed for macOS compatibility ([67aaa95](https://github.com/snowdreamtech/template/commit/67aaa95afe68cdfcade622a3478fe3b0b000ccca))
* **deps:** correct indentation in test script for editorconfig compliance ([0a44088](https://github.com/snowdreamtech/template/commit/0a44088beafca6ea70111f98062e1889d21c069f))

## [0.10.0](https://github.com/snowdreamtech/template/compare/v0.9.2...v0.10.0) (2026-04-22)


### Features

* add rocket icon to performance workflow name ([e6a6146](https://github.com/snowdreamtech/template/commit/e6a61461a6315e84e993d6edfc618ef61f27003e))

## [0.9.2](https://github.com/snowdreamtech/template/compare/v0.9.1...v0.9.2) (2026-04-20)


### Bug Fixes

* **lint:** ensure pre-commit runs exactly 2 times, not 3 ([4085676](https://github.com/snowdreamtech/template/commit/40856766a964a95216a171fd5760bde2b91240c5))
* **release:** set separate-pull-requests to false for unified PR ([07054f5](https://github.com/snowdreamtech/template/commit/07054f5d69e832f976b46e1648d39779042cfb15))

## [0.9.1](https://github.com/snowdreamtech/template/compare/v0.9.0...v0.9.1) (2026-04-20)


### Bug Fixes

* **lint:** ignore CHANGELOG.md in all directories for markdownlint ([ebe338c](https://github.com/snowdreamtech/template/commit/ebe338c66126b82624c63e45b5c8a7c6bf77fcc1))

## [0.9.0](https://github.com/snowdreamtech/template/compare/v0.8.2...v0.9.0) (2026-04-19)


### Features

* **lint:** add two-pass auto-fix mechanism to make lint ([9fba0f1](https://github.com/snowdreamtech/template/commit/9fba0f1436429e3e3d161358ab1dbc8d299b7fe8))


### Bug Fixes

* **lint:** restore color output in Pass 1 auto-fix stage ([fe3d523](https://github.com/snowdreamtech/template/commit/fe3d52320f604686e0f5dededbd07da463a0f176))

## [0.8.2](https://github.com/snowdreamtech/template/compare/v0.8.1...v0.8.2) (2026-04-19)


### Bug Fixes

* **ci:** add GITHUB_TOKEN to all make commands for API rate limit prevention ([2060bca](https://github.com/snowdreamtech/template/commit/2060bca9cef56a23645775c519e8054fdf1b0261))
* **ci:** skip DCO check for snowdream user in release-please PRs ([dde607b](https://github.com/snowdreamtech/template/commit/dde607bc3c474bf8967811bb9902c672f998717b))
* **ci:** use GITHUB_TOKEN for release-please to prevent tag creation issues ([73266aa](https://github.com/snowdreamtech/template/commit/73266aa2d12b86d1cce4ba785d48141dbe817a44))


### Reverts

* **ci:** restore WORKFLOW_SECRET fallback for release-please ([4a1956b](https://github.com/snowdreamtech/template/commit/4a1956b4c14b7961932fd9c1851d5849e149107d))

## [0.8.1](https://github.com/snowdreamtech/template/compare/v0.8.0...v0.8.1) (2026-04-19)


### Bug Fixes

* **ci:** resolve Docker Buildx container restart race condition ([01a1c2d](https://github.com/snowdreamtech/template/commit/01a1c2d500ea125ed63e0091fd5a6a136fa58544))

## [0.8.0](https://github.com/snowdreamtech/template/compare/v0.7.1...v0.8.0) (2026-04-18)


### Features

* **release:** add separate-pull-requests for future manifest mode ([a543dde](https://github.com/snowdreamtech/template/commit/a543dded3032285624672de89e68d37130970bad))

## [0.7.1](https://github.com/snowdreamtech/template/compare/v0.7.0...v0.7.1) (2026-04-18)


### ⚠ BREAKING CHANGES

* **security:** mise now downloads binaries ONLY from GitHub Releases
* mise does NOT automatically detect musl

### Features

* add comprehensive performance testing and documentation infrastructure ([c1d8996](https://github.com/snowdreamtech/template/commit/c1d8996e4f44ce7222cf589812325b700e7e5f96))
* add missing performance and documentation scripts ([fe65a58](https://github.com/snowdreamtech/template/commit/fe65a58f25c3214e93d156a03079c51d169d3240))
* add VER_MISE to versions.sh for centralized version management ([b805d26](https://github.com/snowdreamtech/template/commit/b805d26395103dbea4c34e14b5c99521537dabbd))
* **ci:** add atomic tool verification for shfmt and editorconfig-checker ([dd255e5](https://github.com/snowdreamtech/template/commit/dd255e5956a3a9b96c15cc832fddc3667a3effb2))
* **ci:** add atomic verification for config/doc linting tools ([5d8de8b](https://github.com/snowdreamtech/template/commit/5d8de8bc179790eac4518f73f03d5f6e8d5c5af6))
* **ci:** add atomic verification for hadolint and dockerfile-utils ([9e5a824](https://github.com/snowdreamtech/template/commit/9e5a824b22e1b31bcf08c9e7ae265ec836077bb0))
* **ci:** add atomic verification for Node.js tools ([4a6c20f](https://github.com/snowdreamtech/template/commit/4a6c20f4756f2605971c12a7a12feabc1d56bad4))
* **ci:** add centralized Harden Runner endpoints configuration ([5389a6e](https://github.com/snowdreamtech/template/commit/5389a6eb811a6b1ecfeefd6a0a3512e9a7d8b078))
* **ci:** enable release-please for all configured branches ([bc94753](https://github.com/snowdreamtech/template/commit/bc94753270413815bb340e27fd6154f41e37d771))
* **ci:** harden stateless toolchain and remediate security audit findings ([ebab039](https://github.com/snowdreamtech/template/commit/ebab039b1f58b3a782bec8a71d23596b1c59f2ce))
* **ci:** implement universal binary-first tool verification ([5bedab1](https://github.com/snowdreamtech/template/commit/5bedab16aba4891d0395ba2e0462148810c8b2ac))
* **ci:** improve release-please configuration and remove fixed version ([e1fcd64](https://github.com/snowdreamtech/template/commit/e1fcd648d91c306f6f385eca7600b3d6d2fefc5e))
* **ci:** skip DCO check for bot commits ([b841cee](https://github.com/snowdreamtech/template/commit/b841cee3308b970f945f92692d807cf353a7b379))
* **ci:** sync Harden Runner endpoints from centralized config ([48b4221](https://github.com/snowdreamtech/template/commit/48b42213ee409890c4dd9a64f230c251dbac7b77))
* **common:** enhance mise backend dependency checks and add MISE_GITHUB_ENTERPRISE_TOKEN forwarding ([27e0f1e](https://github.com/snowdreamtech/template/commit/27e0f1e7dfd3758bfa4bdc8013410a4bdbec386e))
* **dev:** add POSIX-compatible CI simulation script ([a587a39](https://github.com/snowdreamtech/template/commit/a587a390faa640adce2d448b773222cbb373c41d))
* **devcontainer:** add comprehensive SSH and GPG permission configuration ([843180b](https://github.com/snowdreamtech/template/commit/843180b5722d20b1704e482d40b1c4a80f890fdc))
* **devcontainer:** add Docker availability check in init script ([7ca1fe4](https://github.com/snowdreamtech/template/commit/7ca1fe4c37ada1893e94e9ac28ec578952c1d99e))
* **devcontainer:** add support for local git config file ([2fb5e43](https://github.com/snowdreamtech/template/commit/2fb5e435b5038617746aff9837dec98865cd4d5c))
* **devcontainer:** enable GPG signing support ([4d88e12](https://github.com/snowdreamtech/template/commit/4d88e125ddc84966237d382d897c03b1cf73da06))
* **docker:** add docker-compose file detection for hadolint and dockerfile-utils ([836880d](https://github.com/snowdreamtech/template/commit/836880de8c86ea0e548ed9edabe589d38357903f))
* enhance PATH management for dynamically installed tools ([f307921](https://github.com/snowdreamtech/template/commit/f30792120c89c79cf2c7216b3ca5cfbe9d22dd31))
* enhanced PATH management for dynamic tool installation ([43c8ba6](https://github.com/snowdreamtech/template/commit/43c8ba6cd306cbe387593481dc6d7c28357557db))
* **hooks:** strengthen pre-commit with security & deep linting audits ([1427366](https://github.com/snowdreamtech/template/commit/14273660790f2c9f3806528114d9faec53c1f26b))
* **make:** add sync-harden-runner target for workflow endpoint management ([d24708d](https://github.com/snowdreamtech/template/commit/d24708dd86bb09946f3337dfd0747ca5fbcd51bc))
* **mise:** add yamllint to core tools in mise.toml ([406bbb3](https://github.com/snowdreamtech/template/commit/406bbb32f3a9f47bdfee72e2422b273a6cab252b))
* optimize mise shell activation with full path and official method ([77b21a6](https://github.com/snowdreamtech/template/commit/77b21a6257b5b219bfb5dc4057d28ffaeb2f0c82))
* optimize mise shell activation with full path support ([e71c33f](https://github.com/snowdreamtech/template/commit/e71c33f88abb2a2fd11561f7067b5c1e479f2b43))
* **scripts:** add cleanup script for duplicate mise activation lines ([b7020c6](https://github.com/snowdreamtech/template/commit/b7020c6ca19e167c71b776f1380c5f1dc8c20c3c))
* **scripts:** add missing performance and documentation scripts ([f8d9c61](https://github.com/snowdreamtech/template/commit/f8d9c613cfa599e503bed8190e13da66cbf928d7))
* **scripts:** add tool to remove Windows wrapper scripts ([5bfd3ef](https://github.com/snowdreamtech/template/commit/5bfd3ef8ec9241cb09eca577d58616d1c29e2987))
* **scripts:** implement Node.js JSON parser with CommonJS ([e0ffb06](https://github.com/snowdreamtech/template/commit/e0ffb06a5e8634f05d171a440aa515c881180d30))
* **security:** add sigstore wildcard endpoint to harden runner ([2e26b98](https://github.com/snowdreamtech/template/commit/2e26b98d181cc8e4c739febde72e90fcfdee99da))
* **security:** implement three-layer defense against Aqua Registry ([ef13665](https://github.com/snowdreamtech/template/commit/ef136651dc6d7d358cf4de2748a0a10a841730bf))
* **security:** refactor audit orchestration for automatic activation in local dev ([f085c71](https://github.com/snowdreamtech/template/commit/f085c711f6e3b5093b1c8ab9efff2b31e32725d1))
* use mise.jdx.dev install script with version support ([043b346](https://github.com/snowdreamtech/template/commit/043b3460ae67ae946018155cab31396770741561))
* use VER_MISE from versions.sh in common.sh ([d4c8160](https://github.com/snowdreamtech/template/commit/d4c81601aa888932a2b0b01ef3f9208f348b5a4e))


### Bug Fixes

* add pattern matching for binaries with version/platform suffixes ([9ce22d9](https://github.com/snowdreamtech/template/commit/9ce22d9e618960d62c4711bea1c9130d5d82f3df))
* add unified PATH management and CI persistence to run_mise ([19c6431](https://github.com/snowdreamtech/template/commit/19c64317dc58d31ddeb16ef4f7657795fe49ef35))
* align log_summary to use CI_STEP_SUMMARY for consistent reporting ([601ac65](https://github.com/snowdreamtech/template/commit/601ac65d390330fa51a7e2c025b2a56ac3834188))
* **base:** add version specifications to mise install calls ([71aa2fe](https://github.com/snowdreamtech/template/commit/71aa2fe0746f8fdfc8178de4971abaf002509108))
* **bootstrap:** prevent duplicate mise activation lines in shell RC files ([0f343f1](https://github.com/snowdreamtech/template/commit/0f343f1fb933646753e52afead32f0ef3d887099))
* **bootstrap:** prevent shell-specific syntax errors in POSIX sh ([cc6066d](https://github.com/snowdreamtech/template/commit/cc6066d1004c52e9ecb60892df1a2f10645a414f))
* **bootstrap:** use dynamic mise paths instead of hardcoded values ([062f35a](https://github.com/snowdreamtech/template/commit/062f35ac1900d580735f094e86f55befba2d3400))
* **cd:** add debug output and improve PATH setup for Windows ([892d860](https://github.com/snowdreamtech/template/commit/892d8608c81b7c2c27532a7cbf02b0d06792057a))
* **cd:** complete debug output alignment with CI workflow ([b52cd4f](https://github.com/snowdreamtech/template/commit/b52cd4f93ce813f0a2bea3d135ff81bfc761f4e6))
* **cd:** ensure mise shims are on PATH for all verification steps ([95687fe](https://github.com/snowdreamtech/template/commit/95687fe0f88e57b638e5d273be8b5bbd528ed760))
* centralize hardcoded provider values across shell scripts ([2a170e7](https://github.com/snowdreamtech/template/commit/2a170e7626c456e116c59e08eff7e49e324fa551))
* **check-env:** strip leading 'v' from versions for accurate comparison ([83456b3](https://github.com/snowdreamtech/template/commit/83456b3f8624aaf6cc2b3feee48c398102d16ed8))
* **check-env:** sync GITHUB_PATH to current shell in CI ([8fdde4e](https://github.com/snowdreamtech/template/commit/8fdde4e89bd198a7c5f8d78a396c27bae3abeae6))
* **check-env:** use full mise keys for version detection ([a5b1063](https://github.com/snowdreamtech/template/commit/a5b10635d40cde00554db96ec953025aeae7f5a6))
* **check-env:** version mismatch should warn not fail ([e98d7b3](https://github.com/snowdreamtech/template/commit/e98d7b3d973c69847f5f817fef3a374ab821a14c))
* **ci:** add aggressive cache refresh after uninstall in install_tool_safe ([433899c](https://github.com/snowdreamtech/template/commit/433899cd8435f737a6193f15e3189a987260e5ef))
* **ci:** add DCO signoff to dependabot-sync commits ([cfe7546](https://github.com/snowdreamtech/template/commit/cfe75468ce43c5b61c7ac8e5915eb767b0032815))
* **ci:** add DCO signoff to release-please commits ([8fd8b67](https://github.com/snowdreamtech/template/commit/8fd8b6729aa68027072f68acec9735397eea54cc))
* **ci:** add mise exec fallback for pnpm audit on Windows ([f1e93b7](https://github.com/snowdreamtech/template/commit/f1e93b73541e2a1f5c9c42c81d89e97cbf91c57d))
* **ci:** add mise.lock and versions.sh to mise cache key in pages workflow ([9d7b9d7](https://github.com/snowdreamtech/template/commit/9d7b9d75d68645afaa798a577758ea55fa94cb03))
* **ci:** add mise.lock to mise cache key in cd workflow ([d43cdf9](https://github.com/snowdreamtech/template/commit/d43cdf9ab8d2c22af779601acfbab8fe42b035be))
* **ci:** add mise.lock to mise cache key in dependabot-sync workflow ([070adf0](https://github.com/snowdreamtech/template/commit/070adf0610122d8ed3e098d72838714190ec8871))
* **ci:** add mise.lock to mise cache key in label-sync workflow ([fccb9f0](https://github.com/snowdreamtech/template/commit/fccb9f0669b118ecaeac1e88a771534a13fc8455))
* **ci:** add mise.lock to mise cache keys in ci workflow (3 jobs) ([ac8ecf6](https://github.com/snowdreamtech/template/commit/ac8ecf6adb81781556c969916c2e0a62b99f035c))
* **ci:** add missing endpoints for trivy and sigstore ([115a19d](https://github.com/snowdreamtech/template/commit/115a19de02c7cd1d274ecb0191bd035a02d273ef))
* **ci:** add node-audit special handling in CI fallback ([d82624c](https://github.com/snowdreamtech/template/commit/d82624cda69bbf48e21ef2693d5c5477c278463e))
* **ci:** add OSV-scanner and Zizmor to Tier 1 tools ([7bf9561](https://github.com/snowdreamtech/template/commit/7bf9561f2459bd68ff422d61e3e8967df5a9d65f))
* **ci:** comprehensive tool installation and execution fix ([bac4a9c](https://github.com/snowdreamtech/template/commit/bac4a9ce77e15170d3a8f3e1db970b00917e7abc))
* **ci:** correct action SHA and version tag mismatches in cd.yml ([f4d90ec](https://github.com/snowdreamtech/template/commit/f4d90ec5d3570189d0f8c5562f4eea59f70a899f))
* **ci:** detect docker-compose files in dependabot generator ([530ca75](https://github.com/snowdreamtech/template/commit/530ca7534583ea16bb876c0e8bfbf209d958a42a))
* **ci:** disable paranoid mode in CI for lockfile sync ([1b282ce](https://github.com/snowdreamtech/template/commit/1b282ce6fa3d1ecca5c18de89a4962ec7e50226b))
* **ci:** enable release-please for dev branch and fix DCO signoff ([ab8f065](https://github.com/snowdreamtech/template/commit/ab8f065dce45cc794d78aa075fc8c066eeec2bf5))
* **ci:** ensure PATH persistence after setup completes on Windows ([460dc8d](https://github.com/snowdreamtech/template/commit/460dc8d84067a89081762401269565a815ceab00))
* **ci:** ensure shfmt and handle trivy absence in CI ([fae3f46](https://github.com/snowdreamtech/template/commit/fae3f46d2c253d3c2883814d24f33169df3325b2))
* **ci:** exclude unreleased version compare links from lychee checks ([6165757](https://github.com/snowdreamtech/template/commit/6165757ebf73b2d1b7abf5c738d66f6402a06f14))
* **ci:** explicitly specify checkmake mise tool spec to avoid aqua registry lookup ([acefebb](https://github.com/snowdreamtech/template/commit/acefebb98efc3563a9011f2ea05e7cc7274f5aef))
* **ci:** extract version from TOML table syntax in install_tool_safe ([9740407](https://github.com/snowdreamtech/template/commit/9740407dd5b970e1bcecc26d58ce756f2fd36027))
* **ci:** fix PSScriptAnalyzer and yamllint configuration ([166826a](https://github.com/snowdreamtech/template/commit/166826afd22a16c5fe7ccf131ae28d6f46d48525))
* **ci:** fix yamllint truthy error in performance workflow ([7e7dfd0](https://github.com/snowdreamtech/template/commit/7e7dfd052065a8b361212d0a1611a60bc951b06b))
* **ci:** handle mise shims in verify_binary_exists ([bc0dfd9](https://github.com/snowdreamtech/template/commit/bc0dfd945090a3b63cf27ee90b9073547ff76ec5))
* **ci:** harden GITHUB_PATH persistence and Windows mise detection ([6c555db](https://github.com/snowdreamtech/template/commit/6c555dbefb0842a70ab06769935edf1df33f58a7))
* **ci:** immediately update PATH in current shell after writing to GITHUB_PATH ([6fd7c76](https://github.com/snowdreamtech/template/commit/6fd7c764c16a49fd51f180c4310ad2bf08db7401))
* **ci:** improve binary resolution fallback for GitHub tools ([53ae080](https://github.com/snowdreamtech/template/commit/53ae0802fb5eb5d618f71be3f9f0fe6d9d89232a))
* **ci:** improve post-install binary name resolution ([46ab8b0](https://github.com/snowdreamtech/template/commit/46ab8b00c8b5f65bdd1e2171964650ef46359e75))
* **ci:** make link checker non-blocking to avoid false failures ([99c2ec9](https://github.com/snowdreamtech/template/commit/99c2ec99befd980c996953bd53471ded5f6d404a))
* **ci:** make lint.sh fail when pre-commit hooks fail ([78ca50a](https://github.com/snowdreamtech/template/commit/78ca50ac3a1e670d5c11b7a0292585976384cbfd))
* **ci:** pass GITHUB_TOKEN to lychee for link checking ([dfb9fd1](https://github.com/snowdreamtech/template/commit/dfb9fd185e4f1bbe4987b4e991db85a4a03639e8))
* **ci:** pin GitHub Actions to commit SHA in performance workflow ([13623d9](https://github.com/snowdreamtech/template/commit/13623d9cf5ae7a6677a8645a8d568bb39a2752a2))
* **ci:** quote 'on' keyword in performance workflow ([4710acd](https://github.com/snowdreamtech/template/commit/4710acd942f39592bfe55f4ceb73af7ec47153c7))
* **ci:** remove --template flag from gh label list command ([27b29ea](https://github.com/snowdreamtech/template/commit/27b29ea1cabb48a35398324473ea3e8133f07ed3))
* **ci:** remove emoji from log messages to fix Windows printf errors ([f14a5f0](https://github.com/snowdreamtech/template/commit/f14a5f00870474761daa7a54a231a64cc70d668b))
* **ci:** remove MISE_OFFLINE=true from all workflow files ([4be4079](https://github.com/snowdreamtech/template/commit/4be407962334edee9c465e296d7e5d18bfc7d2ea))
* **ci:** remove SKIP_MODULES and stabilize test assertions ([241275f](https://github.com/snowdreamtech/template/commit/241275fa1ff08cb994b8c5dabdfb1a9b0ae1a538))
* **ci:** remove unsupported signoff parameter and add release-as 0.5.0 ([d01b2df](https://github.com/snowdreamtech/template/commit/d01b2dffa875d815316b5d41922b58ce9d574879))
* **ci:** remove Windows path conversion for GitHub Actions PATH persistence ([4af9416](https://github.com/snowdreamtech/template/commit/4af9416b6ea4fba25606ef2bace671895d56e921))
* **ci:** resolve actual binary names for platform-specific tools ([e6856c9](https://github.com/snowdreamtech/template/commit/e6856c9a622d12a915744b44f1542106c87034ad))
* **ci:** resolve npm-pnpm-audit hook failure on Windows ([095f3a5](https://github.com/snowdreamtech/template/commit/095f3a553e352c426e39aa727b37cd3f610b3408))
* **ci:** restore actions/cache version hash in ci workflow ([713881a](https://github.com/snowdreamtech/template/commit/713881ae0bd8929ce69c02ae89482cd26f643e99))
* **ci:** restore actions/cache version hash in dependabot-sync workflow ([e506978](https://github.com/snowdreamtech/template/commit/e5069784c2269abf3965875306a42997d358a4f5))
* **ci:** restore actions/cache version hash in pages workflow ([80a625d](https://github.com/snowdreamtech/template/commit/80a625dcbbe95259fbaae26d59cbb61fc7e2539e))
* **ci:** restrict release-please to main branch only ([0db8a91](https://github.com/snowdreamtech/template/commit/0db8a910c4bbba1426944ccfcca648a593bb097e))
* **ci:** restrict release-please to main branch only ([b97162a](https://github.com/snowdreamtech/template/commit/b97162aa0092875bb8af1820cb4db6c06d17665b))
* **ci:** revert goreleaser to use --version flag ([564d899](https://github.com/snowdreamtech/template/commit/564d899198c6f0c19872642d6b3e2968d54536ab))
* **ci:** specify bin names for shfmt and editorconfig-checker in mise.toml ([f249809](https://github.com/snowdreamtech/template/commit/f2498091f79349cfe84fe160ad78477ad28a22b5))
* **ci:** support binaries installed in root directory ([72631b4](https://github.com/snowdreamtech/template/commit/72631b4d0f2c3cd53ea50b5e42a64585a92e98fc))
* **ci:** suppress zizmor findings for performance.yml and skip flaky tests ([0616771](https://github.com/snowdreamtech/template/commit/06167717e490f73f34e49386e4a776907caa554c))
* **ci:** temporarily disable npm-pnpm-audit hook due to API compatibility ([6ed58d9](https://github.com/snowdreamtech/template/commit/6ed58d92ebd50ff746dfe5f1d630f59cc7eb4441))
* **ci:** update actions/cache version hash in ci workflow ([36520ec](https://github.com/snowdreamtech/template/commit/36520ec4b721ba79ccf6b410573d02e416a53f29))
* **ci:** update node-audit to use new npm bulk advisory endpoint ([526ca79](https://github.com/snowdreamtech/template/commit/526ca79e307d38240e54505bda3b06d75f1e8b9a))
* **ci:** update Phase 1 tools to use 4-parameter verify_tool_atomic ([5af97ed](https://github.com/snowdreamtech/template/commit/5af97ed9daa59c3f2a900f25ff22dd2f7bf634bb))
* **ci:** use correct version command for goreleaser ([b271332](https://github.com/snowdreamtech/template/commit/b271332e9b02f2f34513943f86ce8297f3c31dc4))
* **ci:** use GitHub binary providers for cross-platform security tools ([8d150f6](https://github.com/snowdreamtech/template/commit/8d150f6554d8f6a752f7c2351e62f637a1f52dc3))
* **ci:** use GITHUB_TOKEN for release-please to enable DCO signoff ([51051ba](https://github.com/snowdreamtech/template/commit/51051ba4a2e7fdca3a9ed927e09fdec94b20f77d))
* **ci:** use mise exec for shim smoke tests ([12306a9](https://github.com/snowdreamtech/template/commit/12306a9fbf8a8f4192002424aa03898223628077))
* **ci:** use npm instead of pnpm for audit to avoid API compatibility issues ([641c9f7](https://github.com/snowdreamtech/template/commit/641c9f744927c5aa15369cd56bcb7e31bb44bf3d))
* **ci:** use platform-specific binary name for editorconfig-checker ([2b38f2a](https://github.com/snowdreamtech/template/commit/2b38f2a2fbb5445b5b5118a64efa34bd56495023))
* **ci:** use valid log level for lychee verbose option ([171e721](https://github.com/snowdreamtech/template/commit/171e7218eb1e6cf00645c27f7d9d8187e5c9bf47))
* **ci:** use WORKFLOW_SECRET for release-please to enable chain-triggering ([9339b9c](https://github.com/snowdreamtech/template/commit/9339b9c343147d687e69ab362653b7df10accb82))
* **common:** correct find -maxdepth position in has_lang_files ([9866fe6](https://github.com/snowdreamtech/template/commit/9866fe68a40c64f47a3fc2d1c7abf94dd5d10022))
* **config:** remove deprecated ExperimentalScannerConfig from osv-scanner ([ce385db](https://github.com/snowdreamtech/template/commit/ce385db7ca970de93405cb85988e73e32f8f8c90))
* correct Alpine Linux Node.js installation behavior ([bbd85fa](https://github.com/snowdreamtech/template/commit/bbd85fa7048b058ee6a2d13ccf27debfac4912e7))
* **cpp:** add version specification to mise install call ([b6fbdaf](https://github.com/snowdreamtech/template/commit/b6fbdaf1f4866b77b7c1a8376e82f7d8dd5c7cd9))
* **dco:** use PR author instead of branch name to prevent bypass ([eb55adf](https://github.com/snowdreamtech/template/commit/eb55adf2ccc05f6a0bea0a1f9c37c5fb56f08e02))
* **deps:** correct toolchain provider mappings and dependabot schema ([76d515d](https://github.com/snowdreamtech/template/commit/76d515d4c3b0abe40ed6cc849b1f3ed2077887bb))
* **deps:** replace asdf pipx backend with native mise plugin to resolve Windows CI failures ([05aba02](https://github.com/snowdreamtech/template/commit/05aba026dd7348bb2fb17848076a68b15411e33f))
* **devcontainer:** add command availability checks before usage ([a0a4ce0](https://github.com/snowdreamtech/template/commit/a0a4ce0d1bed246c722270f920e79f2046a1bfe7))
* **devcontainer:** add command to keep container running ([5484045](https://github.com/snowdreamtech/template/commit/54840456dfb76e040655d49cf28b45e9b64ead1d))
* **devcontainer:** add workspace volume mount and fix configuration ([9ff708b](https://github.com/snowdreamtech/template/commit/9ff708be2aa74af62eae40012f163229bb688296))
* **devcontainer:** add YAML document start marker for yamllint ([44ccf81](https://github.com/snowdreamtech/template/commit/44ccf8108ad6ea15b92069f15bbc1ce852723ec0))
* **devcontainer:** correct updateContentCommand to use make install ([774bba2](https://github.com/snowdreamtech/template/commit/774bba245b5025973492b2cd8fb10826eae7af12))
* **devcontainer:** handle missing host directories gracefully ([9b79301](https://github.com/snowdreamtech/template/commit/9b7930189a20c8c44983a739d80ec05d8b5987f5))
* **devcontainer:** make git config cross-platform compatible ([600052a](https://github.com/snowdreamtech/template/commit/600052ae9d9067de738a875009df7e8371099625))
* **devcontainer:** use dynamic workspace folder variable ([73421d6](https://github.com/snowdreamtech/template/commit/73421d6f6724ae63613d30566103b55191d43c87))
* **devcontainer:** use find instead of ls for directory permissions ([ffeaee8](https://github.com/snowdreamtech/template/commit/ffeaee833e3a9f4ad7a88d45b906ad12ca52b62d))
* **devcontainer:** use global git config instead of local ([934bb1c](https://github.com/snowdreamtech/template/commit/934bb1c3bec475b571daab4168cdd233d10b6816))
* **docker:** add version specifications to mise install calls ([72149e4](https://github.com/snowdreamtech/template/commit/72149e4b14f49d2ad67543af54f1d654b5efcbb8))
* **docs:** ensure make docs build works correctly ([6a0df9c](https://github.com/snowdreamtech/template/commit/6a0df9ce6acf22d2d8606dda0444c48d369967bd))
* **docs:** fix broken relative links in documentation ([c13692c](https://github.com/snowdreamtech/template/commit/c13692c6ecf4fca79bf117fcda7076abef1acba1))
* **docs:** regenerate pnpm lockfile to match overrides ([b553918](https://github.com/snowdreamtech/template/commit/b553918d8c7d81bc4a7f740a756c590a06d48e2a))
* **docs:** resolve MD028 blockquote lint in snowdreamtech.init workflow ([4e9ecfa](https://github.com/snowdreamtech/template/commit/4e9ecfabb7e9bb7a2af0b3e0c73c56cb31f05262))
* **docs:** resolve vitepress from docs/node_modules/.bin ([13dc8f9](https://github.com/snowdreamtech/template/commit/13dc8f9deb1daf7c3ae60190a8b497dc4fbf0249))
* **docs:** update TPGi CCA link to GitHub releases page ([b061ca1](https://github.com/snowdreamtech/template/commit/b061ca1150e4dd23b47fd88b3f9992d0f97c1df8))
* **env:** improve mise tool resolution and register zizmor ([120db7e](https://github.com/snowdreamtech/template/commit/120db7ec0ee94004b7b06337793ac5a8c9a93b0a))
* **go:** add version specifications to mise install calls ([4b6964f](https://github.com/snowdreamtech/template/commit/4b6964fbb2e43ea3674d433058d41f6f0db80335))
* **helm:** add version specification to mise install call ([4b5f452](https://github.com/snowdreamtech/template/commit/4b5f452e8003e64639a89447d96abd16abf5ce2c))
* improve POSIX compatibility in bin-resolver.sh ([ebab76e](https://github.com/snowdreamtech/template/commit/ebab76e69041ace9d2bcbeef107044763a27a991))
* improve stat command cross-platform compatibility ([031ffce](https://github.com/snowdreamtech/template/commit/031ffceb774c785a104eb93e715e4966786dafd4))
* **install:** add atomic verification to all Phase 3 low priority tools ([631318f](https://github.com/snowdreamtech/template/commit/631318fd13a28676f6015eca24c3759a86d2c4f2))
* **install:** add atomic verification to clang-format, google-java-format, stylua, ktlint ([0b92a0d](https://github.com/snowdreamtech/template/commit/0b92a0d1e40ca2b00690a204e2c077526e6a2886))
* **install:** add atomic verification to Phase 2 remaining tools ([bb0ae96](https://github.com/snowdreamtech/template/commit/bb0ae96ddb968b00495196547fc5795f3444d8e3))
* **java:** add version specification to mise install call ([8f359a1](https://github.com/snowdreamtech/template/commit/8f359a1fef21822d9dfe733cd4a45e8bc0eaa28e))
* **lint:** add aggressive reinstall logic in lint-wrapper ([40ab04d](https://github.com/snowdreamtech/template/commit/40ab04d550adb207e6fd954afdae6fe48da7f6a3))
* **lint:** add auto-install fallback for missing tools in CI ([b293923](https://github.com/snowdreamtech/template/commit/b2939234dc31427706c716bc261d29e0635e0174))
* **lint:** add license headers to test files and fix markdown formatting ([02263cc](https://github.com/snowdreamtech/template/commit/02263ccdd8163b427643af8fce0103232b01b82c))
* **lint:** add reshim and direct execution fallback ([21be93b](https://github.com/snowdreamtech/template/commit/21be93bb2f143b16f2476a7bb5f46bb838a09961))
* **lint:** add tool spec mapping for shfmt, taplo, and editorconfig-checker ([86c47ac](https://github.com/snowdreamtech/template/commit/86c47aceaedce07dda24802869a9f024a19616df))
* **lint:** add zizmor to optional security tools list ([13b06fd](https://github.com/snowdreamtech/template/commit/13b06fdf2720ea8b493dff1301a889c461a1f589))
* **lint:** correct editorconfig-checker binary name to 'ec' ([c56679c](https://github.com/snowdreamtech/template/commit/c56679c2515de0754e593a7f295623a0e075577c))
* **lint:** exclude all markdown files from prettier formatting ([4fee420](https://github.com/snowdreamtech/template/commit/4fee420ee9f672867de2c0f0c59cf00baf8d8ad3))
* **lint:** exclude test files from shellcheck-posix and markdown from prettier ([0dfd5b2](https://github.com/snowdreamtech/template/commit/0dfd5b2eb22337c03b4c06a7879369328922e7fa))
* **lint:** fix yamllint, markdownlint, and editorconfig issues ([b7925a2](https://github.com/snowdreamtech/template/commit/b7925a2f9661b860f50134e5de1a028f172e971a))
* **lint:** prevent prettier/markdownlint emphasis format conflict ([0c38f99](https://github.com/snowdreamtech/template/commit/0c38f994d6f4592e35e02e9dbb85244722f1388c))
* **lint:** resolve spurious warning by reporting pre-commit version ([188a325](https://github.com/snowdreamtech/template/commit/188a3251cb2f76d053bbb5e9ccef5846eae4d269))
* **lint:** use mise exec as fallback when resolve_bin fails in CI ([8e52231](https://github.com/snowdreamtech/template/commit/8e5223113a198757c33ede338ebd6fc55fac84b0))
* **linux:** use -perm /111 instead of +111 for better compatibility ([512e69b](https://github.com/snowdreamtech/template/commit/512e69b504a1810c4fa126fab5b6079bfbba125d))
* **macos:** avoid -perm flag for BSD find compatibility ([79b98b0](https://github.com/snowdreamtech/template/commit/79b98b071476afe24a80e9876c7e2509022c1529))
* **macos:** use -perm +111 instead of -executable for BSD find compatibility ([911c1b4](https://github.com/snowdreamtech/template/commit/911c1b47e643bcb1d95e6400a7e6abdbfeea82fe))
* **mise:** add additional paranoid mode disable flags ([7e83141](https://github.com/snowdreamtech/template/commit/7e83141b005bb8e0e6dc930f35eec7436c1bceb1))
* **mise:** align pnpm version to 10.30.3 to fix detection failure ([c01671d](https://github.com/snowdreamtech/template/commit/c01671df9125246be64d26cb4129450684067ef6))
* **mise:** clear cache before sync-lock to prevent stale provenance verification ([027874d](https://github.com/snowdreamtech/template/commit/027874db7c3ce6b823576d2bdb3da0bf868f5209))
* **mise:** disable attestation checks in sync-lock to prevent false positives ([3f09708](https://github.com/snowdreamtech/template/commit/3f09708fefcf850b11f0ed2f7c29525f2c6c2b0d))
* **mise:** downgrade node to 22.14.0 for macOS 12 compatibility ([c5495b4](https://github.com/snowdreamtech/template/commit/c5495b491a7796d25bd2ff26fbb8cbd9fdc43aff))
* **mise:** downgrade Python from 3.14.3 to 3.13.12 ([71ae8fd](https://github.com/snowdreamtech/template/commit/71ae8fd1f1750ed0440b18be1515610063cee1e8))
* **mise:** enable GitHub proxy locally and fix checkmake version ([a0e65aa](https://github.com/snowdreamtech/template/commit/a0e65aaaa862ddc657beeac74fd598c509c54c76))
* **mise:** handle platform-specific editorconfig-checker binary names ([5ebb3ff](https://github.com/snowdreamtech/template/commit/5ebb3ff76b07f9eb31d61755fd064746512dbd69))
* **mise:** increase HTTP timeout to 300s for slow GitHub downloads ([123aa0c](https://github.com/snowdreamtech/template/commit/123aa0cd8b8f07ccc48e59758f887e778e76b316))
* **mise:** make lint ([097f32b](https://github.com/snowdreamtech/template/commit/097f32bdffbaf3ccc78eaa367ecb3e40a2935939))
* **mise:** permanently disable paranoid mode for lockfile sync ([49dbb04](https://github.com/snowdreamtech/template/commit/49dbb044f65c4c5203edd751218f3d90315214f6))
* **mise:** remove provenance fields from lockfile to prevent attestation errors ([f7790b5](https://github.com/snowdreamtech/template/commit/f7790b5803b47822c1191f28c155763a3ce43844))
* **mise:** skip Go checksum verification for Aliyun mirror ([8821f81](https://github.com/snowdreamtech/template/commit/8821f814b7bb37d56d8e45e4163cc3292624fafd))
* **mise:** synchronize multi-platform lockfile with pnpm 10.30.3 ([fc2113b](https://github.com/snowdreamtech/template/commit/fc2113b5c63b845ca4a8631cd50fde9db5e59d15))
* **mise:** update yamllint version to match versions.sh ([d9bcf61](https://github.com/snowdreamtech/template/commit/d9bcf61f7092f248186d41ceb66fcd98d3015a34))
* **mise:** workaround for GitHub attestation verification failures ([2911054](https://github.com/snowdreamtech/template/commit/29110547a86ebe51593eac637c0b4dc4c14977bc))
* **node:** add corepack resiliency and npm fallback ([d72055b](https://github.com/snowdreamtech/template/commit/d72055b2e0c3eeb97bb9103b413188fe2f21f0be))
* **node:** add version specifications to mise install calls ([afd9c04](https://github.com/snowdreamtech/template/commit/afd9c0456fea9d3a427dfe8f70913d7e745b92fb))
* **node:** auto-install bash in Alpine for npm compatibility ([0042fa2](https://github.com/snowdreamtech/template/commit/0042fa2abb6ae389277660b3d0656f54ea669643))
* **node:** configure mise for musl binaries in Alpine environments ([232bce2](https://github.com/snowdreamtech/template/commit/232bce29a4401ebe42fd529c448a47d404562abe))
* **node:** explicitly set MISE_NODE_* env vars for Alpine ([25d506d](https://github.com/snowdreamtech/template/commit/25d506d6d952fa479dca79e427d10905d37fc9b6))
* **node:** export ALPINE_VERSION for mise.toml template evaluation ([62d9344](https://github.com/snowdreamtech/template/commit/62d934444f440eec678ac2227c723ab7f1e46e8d))
* **node:** resolve install hang by skipping redundant corepack activation ([36b3d44](https://github.com/snowdreamtech/template/commit/36b3d448f4ad914621752f4504560e6d4d110975))
* **node:** use boolean false for node.compile setting ([97d5bd5](https://github.com/snowdreamtech/template/commit/97d5bd57d4dc1ffc52a777524c5aabf92a9a061d))
* **openapi:** add version specification to mise install call ([81e52b5](https://github.com/snowdreamtech/template/commit/81e52b5bcd5fa9f7a82036aabbb2fd24727783a0))
* **pre-commit:** migrate deprecated stage name ([8392cbf](https://github.com/snowdreamtech/template/commit/8392cbfe73aee175bb7732255a7f992c75078184))
* **pre-commit:** skip osv-scanner in local pre-commit hooks ([b4b82ac](https://github.com/snowdreamtech/template/commit/b4b82ac7078d197c8a4dfac85a2748cdee5f61e4))
* **protobuf:** add version specification to mise install call ([1f7938e](https://github.com/snowdreamtech/template/commit/1f7938e2cbaf3661a0387bd476ed73ce6e7d4e15))
* **python:** add version specifications to mise install calls ([b808c7e](https://github.com/snowdreamtech/template/commit/b808c7e16cafa6fdbf6c50ef8be5a8639401c9e4))
* **python:** install build dependencies for Alpine/musl environments ([3f53883](https://github.com/snowdreamtech/template/commit/3f53883e79ed5b9d74ca2369052b0014a3d4f0fc))
* re-enable refresh_mise_cache with timeout protection ([efe2b3e](https://github.com/snowdreamtech/template/commit/efe2b3e98fbf4650b3375bfb11cb0355b97e1081))
* **registry:** propagate mise install failures in CI ([582eeef](https://github.com/snowdreamtech/template/commit/582eeef44ae4d368ae59bc2d5582b49fb974064f))
* **rego:** add version specification to mise install call ([60eb8ee](https://github.com/snowdreamtech/template/commit/60eb8eecfb6c4f1b38d2ce41500c29774ee16e8c))
* replace %b with %s in printf to avoid Windows path issues ([29ba55b](https://github.com/snowdreamtech/template/commit/29ba55b82400d7ec41074c2951cbbd614eab3cb5))
* resolve devcontainer startup with docker-compose configuration ([fa788e4](https://github.com/snowdreamtech/template/commit/fa788e4f3c94e767f465eea9f17acb4ab8f4a01e))
* resolve make verify hanging and add Kiro config ([505e140](https://github.com/snowdreamtech/template/commit/505e140402edadd12c635a1b0d27f3785e0ea717))
* restore mise metadata cache initialization to resolve JIT tool detection ([9b15c4c](https://github.com/snowdreamtech/template/commit/9b15c4cd469e9af229ef73e9f6272705d176349f))
* **runner:** add version specifications to mise install calls ([bf3d5df](https://github.com/snowdreamtech/template/commit/bf3d5df78889a6e27e41f961ba38a239a5e0a8bd))
* **scripts:** add recursion lock cleanup advice to concurrency warning ([ce27ada](https://github.com/snowdreamtech/template/commit/ce27adafa7b711ba6d9ad993e4e95ef534d289b8))
* **scripts:** ensure summary table displays by default ([a0d1b69](https://github.com/snowdreamtech/template/commit/a0d1b69300d151b2f448a2f1375e0f81e97cd6b2))
* **scripts:** fix JSON output formatting issues ([7b30a64](https://github.com/snowdreamtech/template/commit/7b30a640d262c9d47bd75956f92d5d3819cd4ce8))
* **scripts:** harden gen-full-manifest with absolute paths and fix perl syntax ([41199c6](https://github.com/snowdreamtech/template/commit/41199c6493cc0ef4252975645600fe16db423296))
* **scripts:** improve mise path detection in utility scripts ([3c071d8](https://github.com/snowdreamtech/template/commit/3c071d8d4f546cae906e55092dfe9b54566e7d9f))
* **scripts:** improve path robustness and update verifier in release.sh ([000ec98](https://github.com/snowdreamtech/template/commit/000ec98593f2ef52842c6a37de0355fccfc80159))
* **scripts:** install PyYAML via pip instead of pipx in sync-harden-runner ([16285a8](https://github.com/snowdreamtech/template/commit/16285a8ec6f27dada410103a3118482e38b82875))
* **scripts:** prevent recursion lock accumulation across multiple runs ([6d41678](https://github.com/snowdreamtech/template/commit/6d4167845870c19af4f2ed39dec28f32e2096c9b))
* **scripts:** prevent sync-harden-runner from deleting workflow content ([32a4228](https://github.com/snowdreamtech/template/commit/32a4228e6e456a62cf761590491c5c56b6b24b8b))
* **scripts:** resolve infinite recursion and macOS compatibility in setup ([dbc5f9b](https://github.com/snowdreamtech/template/commit/dbc5f9b3bf417c7107641faacb51b4d5a637cfa1))
* **scripts:** resolve PSScriptAnalyzer warnings in sync-labels.ps1 ([5d72d18](https://github.com/snowdreamtech/template/commit/5d72d18de1681078f8299e92ba9dc3d62e90a290))
* **scripts:** resolve silent hang during mise tool resolution ([dec1f65](https://github.com/snowdreamtech/template/commit/dec1f65ace1e5238222771d1ef9d3861c7ea6675))
* **scripts:** standardize mise toolchain providers and fix pnpm setup ([5f8f030](https://github.com/snowdreamtech/template/commit/5f8f0309d42ac6158d865631c2c554bcc18a27d4))
* **scripts:** suppress redundant terminal execution summaries in local environment ([83776fd](https://github.com/snowdreamtech/template/commit/83776fd54d4fe6fe35c6a822c8907d2b7ed8a9d3))
* **scripts:** use absolute path prefix for gen-full-manifest in sync-lock.sh ([bb8401d](https://github.com/snowdreamtech/template/commit/bb8401df026f6389530b895a97950822431efa4a))
* **security:** add binary availability check after version match ([bec5038](https://github.com/snowdreamtech/template/commit/bec5038d8f52f187185c5c2647b38442d395ec5a))
* **security:** add dependabot cooldown config for zizmor compliance ([7394768](https://github.com/snowdreamtech/template/commit/739476828d7812d31505a3dea3d443ffec2d374f))
* **security:** add docker.yml to zizmor ignore rules ([66e35cf](https://github.com/snowdreamtech/template/commit/66e35cf2e63c97fc8b1ecbad2a13e283a16031c7))
* **security:** add strict validation for all CI security tools ([721f8ef](https://github.com/snowdreamtech/template/commit/721f8efbea838617d18cdd62408930752f627e73))
* **security:** add strict zizmor validation in CI ([b6fd596](https://github.com/snowdreamtech/template/commit/b6fd59623c1286a6db9b3b206414ece7dd91a030))
* **security:** add template-injection rule to zizmor config ([92396c1](https://github.com/snowdreamtech/template/commit/92396c15000fed537d3f4057f41dddd3bd7fe69b))
* **security:** add version specifications to mise install calls ([f58a226](https://github.com/snowdreamtech/template/commit/f58a22612304e482bf58f9c64c2614a5574ecf47))
* **security:** check setup_registry return values for critical tools ([cf91e3a](https://github.com/snowdreamtech/template/commit/cf91e3a2ec2274f8335fb6e6863a008d15ceb137))
* **security:** fix OSV-scanner and Zizmor installation in CI ([683639e](https://github.com/snowdreamtech/template/commit/683639e1424d9762128cde26e3e7fad716cbcdef))
* **setup:** add provider paths for lean, nim, racket, vala, and aptos ([c968143](https://github.com/snowdreamtech/template/commit/c968143d1199231c469ff9ad6919419b8c12aefe))
* **setup:** downgrade python to 3.12.3 and disable github proxy to prevent hangs ([4ef9873](https://github.com/snowdreamtech/template/commit/4ef98730f0f0c3f918b07657cdb92d45318cd8df))
* **setup:** ensure gitleaks installs in CI without .git directory ([9fb833d](https://github.com/snowdreamtech/template/commit/9fb833df3c5cbd2af280ebee4c3211ab16a2d858))
* **setup:** ensure yaml and toml modules are always installed locally ([7ca7026](https://github.com/snowdreamtech/template/commit/7ca7026761c0a58a939935db83e37922a872a243))
* **setup:** force reinstall non-executable tools in CI ([dee60a7](https://github.com/snowdreamtech/template/commit/dee60a74f8d22948bc55fca92a6d464eb131764d))
* **setup:** handle mise bin tools verification ([5c386fa](https://github.com/snowdreamtech/template/commit/5c386faae9715eeada52124c8315b71b7ad871de))
* **setup:** handle non-zero exit codes in smoke tests ([3fe6c05](https://github.com/snowdreamtech/template/commit/3fe6c054d4609b2263399b5df10d10f280919c2c))
* **setup:** improve network timeout reliability for large binary downloads ([432f092](https://github.com/snowdreamtech/template/commit/432f09206b8e2cad2a0aa148233c4975547a02b0))
* **setup:** normalize version strings in is_version_match to handle v prefix ([e5efefd](https://github.com/snowdreamtech/template/commit/e5efefdf81ca728f3b75703007cd475c6a2fa0f1))
* **setup:** use full provider path for checkmake installation ([1e40c13](https://github.com/snowdreamtech/template/commit/1e40c1347e7ac53de9419198323d3a7ab69d8435))
* **setup:** use full provider path for gitleaks installation ([7577489](https://github.com/snowdreamtech/template/commit/757748915a041537148f71085f9e377731a00dfa))
* **setup:** use mise which for binary verification in CI ([ded29c1](https://github.com/snowdreamtech/template/commit/ded29c17cdd851f46808a02ad086264f1038eb71))
* **setup:** verify tool executability in CI, not just mise registration ([5404189](https://github.com/snowdreamtech/template/commit/5404189d1f65c4064fdd773764c93e004af550dc))
* **shell:** add error handling for shell tool installation in CI ([967b8bf](https://github.com/snowdreamtech/template/commit/967b8bf69800365810dc023fd44db8d1ef3b9479))
* **shell:** add version specifications to mise install calls ([b576a7f](https://github.com/snowdreamtech/template/commit/b576a7f3c21726a3efeb6b001c1ec05332900aac))
* **shell:** remove duplicate log_summary line causing syntax error ([d8f75d9](https://github.com/snowdreamtech/template/commit/d8f75d9078c2a05b41a7a1762c1fc093030c5f22))
* **shell:** restore missing functions and add aggressive cache refresh ([f89f7f0](https://github.com/snowdreamtech/template/commit/f89f7f0913ecb6e165f8072d6b88f985b672dbcb))
* skip executable permission check on Windows (POSIX compliant) ([e365e6a](https://github.com/snowdreamtech/template/commit/e365e6aa58b67f08d058cc0a5853c8991e2e71ef))
* **sql:** add version specification to mise install call ([cde5de5](https://github.com/snowdreamtech/template/commit/cde5de54c3a705463cc0c01cf94e0da170ebed06))
* sync GITHUB_PATH to current shell for same-step tool availability ([e51048d](https://github.com/snowdreamtech/template/commit/e51048d1fdfeb320ad9922a4efd162d2da4c2821))
* **terraform:** add version specification to mise install call ([b99fa5a](https://github.com/snowdreamtech/template/commit/b99fa5a5be116a53300620261fcc5471b6aa092f))
* **test:** enforce mock path priority in check-env.bats ([babd8df](https://github.com/snowdreamtech/template/commit/babd8df6dfd551800ce3b1d4599e36a5af96b7c5))
* **testing:** add version specification to mise install call ([e4f4820](https://github.com/snowdreamtech/template/commit/e4f48202b510007a926776884945bac35c64b742))
* **toolchain:** extend ALF to handle full mise install with go: tools ([fec200c](https://github.com/snowdreamtech/template/commit/fec200c1b6f746507c2e7318eb88b1a88f159afb))
* **toolchain:** lazy-load mise cache and harden BATS detection ([0e2fb32](https://github.com/snowdreamtech/template/commit/0e2fb32dceae867bbdf55c4232796c0a818652a6))
* **toolchain:** migrate addlicense to github backend to support locked mode ([cf8ea8b](https://github.com/snowdreamtech/template/commit/cf8ea8b9611c39822f440ce6ebc4bcdbd18ac80d))
* **toolchain:** optimize summary logging and resolve BATS test failures ([f9639cb](https://github.com/snowdreamtech/template/commit/f9639cb97d22b9babc8c441c976ab1b802a11b55))
* **tools:** complete taplo provider migration to npm ([cdeaf76](https://github.com/snowdreamtech/template/commit/cdeaf762d62dfde4a14d90136cf298fe4c8e125d))
* **tools:** switch taplo from GitHub source to npm precompiled binary ([18de234](https://github.com/snowdreamtech/template/commit/18de2342744562645b849d24edbd94e6524259d1))
* update VER_MISE to 2026.4.0 to avoid RelativeUrlWithoutBase bug ([f93b0b3](https://github.com/snowdreamtech/template/commit/f93b0b39fd293b7e4e9eb4b97169f80eb38aa6eb))
* **versions:** update checkmake version to v0.3.2 ([6d1edd8](https://github.com/snowdreamtech/template/commit/6d1edd8a6299af947daf989f9badafe6efcf8f3e))
* **windows:** check root directory in verify_tool_atomic fallback ([9e2ace6](https://github.com/snowdreamtech/template/commit/9e2ace6e8cf960c25f159e53ec5b3a2d9cce3904))
* **windows:** convert Unix paths to Windows format for GITHUB_PATH ([de515d6](https://github.com/snowdreamtech/template/commit/de515d6aa91c1392fea55529a2c40550499a721c))
* **windows:** improve mise path detection for Git Bash environments ([d5a5337](https://github.com/snowdreamtech/template/commit/d5a5337ff038f35428034a2969842f99851c6297))
* **windows:** replace log_info with echo for mise path logging ([0bd8ee1](https://github.com/snowdreamtech/template/commit/0bd8ee1a951a0491649188430bb3c99be3067a93))
* **windows:** replace log_info with echo in PATH persistence ([7710710](https://github.com/snowdreamtech/template/commit/77107107bd15904198cef7146fdfb923192c160d))
* **windows:** skip command check for binaries without .exe extension ([a5ed6ca](https://github.com/snowdreamtech/template/commit/a5ed6caebb29aa8555d704cb1d8dabf4ea384111))
* **windows:** skip executable permission checks in lint-wrapper ([035ae54](https://github.com/snowdreamtech/template/commit/035ae54f20404a7c66a1a07459efb1d77678ab3f))
* **windows:** split executable check to avoid test evaluation on Windows ([cc76373](https://github.com/snowdreamtech/template/commit/cc763732a359bd52681a19b277854ea6bbe826e2))
* **windows:** use Unix-style paths for GITHUB_PATH in bash shell ([4eacf60](https://github.com/snowdreamtech/template/commit/4eacf6088d780d4896a533f3fe6acc864e65a56f))
* **windows:** write both Unix and Windows path formats to GITHUB_PATH ([62a0acf](https://github.com/snowdreamtech/template/commit/62a0acf12d04b0bd49d0e53d0bc45d2b261426c0))
* **workflows:** convert Windows LOCALAPPDATA path for Git Bash ([ba9192a](https://github.com/snowdreamtech/template/commit/ba9192a8013a8956d9d925227bd48b88f3703fcd))
* **zizmor:** ensure zizmor installs in CI regardless of workflow files presence ([9f6f620](https://github.com/snowdreamtech/template/commit/9f6f620ba69bc70304dbd7873ae9db2b5944ba76))
* **zizmor:** force reinstall in CI to guard against stale cache ([70597c2](https://github.com/snowdreamtech/template/commit/70597c227f45c9e7c0423768fc8d74323260f05b))
* **zizmor:** update repository from woodruffw to zizmorcore ([316a7cc](https://github.com/snowdreamtech/template/commit/316a7ccf6e3903022301ab3e3f11a4b866ed9484))


### Performance Improvements

* **infra:** implement lazy loading and unified refresh for mise cache ([f9e7aec](https://github.com/snowdreamtech/template/commit/f9e7aec490fb596525d362a79ef59726fc57bc90))
* **mise:** increase HTTP timeout to 300s for improved network reliability ([3335482](https://github.com/snowdreamtech/template/commit/3335482f99f98272149a30e831de066c11db87d2))
* **setup:** skip goreleaser installation in local dev to prevent setup hangs ([c95f801](https://github.com/snowdreamtech/template/commit/c95f80149c7440797995b872a27e3813079038bd))


### Documentation

* add comprehensive token usage audit report ([9983421](https://github.com/snowdreamtech/template/commit/9983421492acc679c2e27a2b01cdf3a6909c7ab9))
* **security:** add comprehensive asdf supply chain risk analysis ([515eea1](https://github.com/snowdreamtech/template/commit/515eea10cedc50f05f0cecd3f421129e1ce59cd4))
* **security:** add mise supply chain security analysis and mitigation ([c0c72f8](https://github.com/snowdreamtech/template/commit/c0c72f889b691ca3ed847e3b11dd3576c1586653))


### Miscellaneous Chores

* **deps:** bump mise to v2026.4.14 ([2bf29e3](https://github.com/snowdreamtech/template/commit/2bf29e3e3f8385913f9367de8a1170a151b5bd82))
* **main:** release 0.0.4 ([50f54df](https://github.com/snowdreamtech/template/commit/50f54df242ad2f1b3eb9af763359692728e38200))
* release 0.6.1 ([f6fc042](https://github.com/snowdreamtech/template/commit/f6fc042cad7d1c4991a20657655bc4b6b339d0d9))
* release 0.7.1 ([5535492](https://github.com/snowdreamtech/template/commit/5535492160f3525dff06ff9f0c6d78147467bed3))
* **release:** v0.4.0 - Fix Dependabot docker-compose detection ([e91f7d8](https://github.com/snowdreamtech/template/commit/e91f7d882f3c7b23260f4da02f0e5e53d6399968))
* remove temporary token audit report ([50a73c7](https://github.com/snowdreamtech/template/commit/50a73c7f88dbcf56332220a5941f6ca00f994bcd))


### Code Refactoring

* **ci:** standardize token usage across all workflows ([54b8445](https://github.com/snowdreamtech/template/commit/54b84456eb13b77b79cbbea32510405ec6f616b7))


### Continuous Integration

* **dependabot:** add path monitoring for mise toolchain config ([ebc7227](https://github.com/snowdreamtech/template/commit/ebc72273a85cb32f3e66b84305c726e47ce55b63))
* **deps:** remove MISE_SKIP_CHECKSUM workaround ([0a80645](https://github.com/snowdreamtech/template/commit/0a8064500cc0ecef8851af4aea31023f5809512e))

## [0.7.0](https://github.com/snowdreamtech/template/compare/v0.6.1...v0.7.0) (2026-04-18)


### Features

* **ci:** add centralized Harden Runner endpoints configuration ([5389a6e](https://github.com/snowdreamtech/template/commit/5389a6eb811a6b1ecfeefd6a0a3512e9a7d8b078))
* **ci:** sync Harden Runner endpoints from centralized config ([48b4221](https://github.com/snowdreamtech/template/commit/48b42213ee409890c4dd9a64f230c251dbac7b77))
* **docker:** add docker-compose file detection for hadolint and dockerfile-utils ([836880d](https://github.com/snowdreamtech/template/commit/836880de8c86ea0e548ed9edabe589d38357903f))
* **make:** add sync-harden-runner target for workflow endpoint management ([d24708d](https://github.com/snowdreamtech/template/commit/d24708dd86bb09946f3337dfd0747ca5fbcd51bc))
* **security:** add sigstore wildcard endpoint to harden runner ([2e26b98](https://github.com/snowdreamtech/template/commit/2e26b98d181cc8e4c739febde72e90fcfdee99da))


### Bug Fixes

* **ci:** add missing endpoints for trivy and sigstore ([115a19d](https://github.com/snowdreamtech/template/commit/115a19de02c7cd1d274ecb0191bd035a02d273ef))
* **ci:** restrict release-please to main branch only ([0db8a91](https://github.com/snowdreamtech/template/commit/0db8a910c4bbba1426944ccfcca648a593bb097e))
* **scripts:** ensure summary table displays by default ([a0d1b69](https://github.com/snowdreamtech/template/commit/a0d1b69300d151b2f448a2f1375e0f81e97cd6b2))
* **scripts:** install PyYAML via pip instead of pipx in sync-harden-runner ([16285a8](https://github.com/snowdreamtech/template/commit/16285a8ec6f27dada410103a3118482e38b82875))
* **scripts:** prevent sync-harden-runner from deleting workflow content ([32a4228](https://github.com/snowdreamtech/template/commit/32a4228e6e456a62cf761590491c5c56b6b24b8b))
* **security:** add docker.yml to zizmor ignore rules ([66e35cf](https://github.com/snowdreamtech/template/commit/66e35cf2e63c97fc8b1ecbad2a13e283a16031c7))
* **security:** add template-injection rule to zizmor config ([92396c1](https://github.com/snowdreamtech/template/commit/92396c15000fed537d3f4057f41dddd3bd7fe69b))

## [0.6.1](https://github.com/snowdreamtech/template/compare/v0.6.0...v0.6.1) (2026-04-17)


### Bug Fixes

* **mise:** disable attestation checks in sync-lock to prevent false positives ([3f09708](https://github.com/snowdreamtech/template/commit/3f09708fefcf850b11f0ed2f7c29525f2c6c2b0d))
* **mise:** remove provenance fields from lockfile to prevent attestation errors ([f7790b5](https://github.com/snowdreamtech/template/commit/f7790b5803b47822c1191f28c155763a3ce43844))


### Miscellaneous Chores

* release 0.6.1 ([f6fc042](https://github.com/snowdreamtech/template/commit/f6fc042cad7d1c4991a20657655bc4b6b339d0d9))

## [0.6.0](https://github.com/snowdreamtech/template/compare/v0.5.0...v0.6.0) (2026-04-16)


### Features

* **scripts:** add tool to remove Windows wrapper scripts ([5bfd3ef](https://github.com/snowdreamtech/template/commit/5bfd3ef8ec9241cb09eca577d58616d1c29e2987))

## [0.5.0](https://github.com/snowdreamtech/template/compare/v0.4.0...v0.5.0) (2026-04-16)


### Features

* **ci:** improve release-please configuration and remove fixed version ([e1fcd64](https://github.com/snowdreamtech/template/commit/e1fcd648d91c306f6f385eca7600b3d6d2fefc5e))


### Bug Fixes

* **ci:** detect docker-compose files in dependabot generator ([530ca75](https://github.com/snowdreamtech/template/commit/530ca7534583ea16bb876c0e8bfbf209d958a42a))
* **ci:** explicitly specify checkmake mise tool spec to avoid aqua registry lookup ([acefebb](https://github.com/snowdreamtech/template/commit/acefebb98efc3563a9011f2ea05e7cc7274f5aef))
* **ci:** remove unsupported signoff parameter and add release-as 0.5.0 ([d01b2df](https://github.com/snowdreamtech/template/commit/d01b2dffa875d815316b5d41922b58ce9d574879))
* **mise:** workaround for GitHub attestation verification failures ([2911054](https://github.com/snowdreamtech/template/commit/29110547a86ebe51593eac637c0b4dc4c14977bc))


### Documentation

* **security:** add comprehensive asdf supply chain risk analysis ([515eea1](https://github.com/snowdreamtech/template/commit/515eea10cedc50f05f0cecd3f421129e1ce59cd4))
* **security:** add mise supply chain security analysis and mitigation ([c0c72f8](https://github.com/snowdreamtech/template/commit/c0c72f889b691ca3ed847e3b11dd3576c1586653))


### Miscellaneous Chores

* **deps:** bump mise to v2026.4.14 ([2bf29e3](https://github.com/snowdreamtech/template/commit/2bf29e3e3f8385913f9367de8a1170a151b5bd82))
* **release:** v0.4.0 - Fix Dependabot docker-compose detection ([e91f7d8](https://github.com/snowdreamtech/template/commit/e91f7d882f3c7b23260f4da02f0e5e53d6399968))


### Continuous Integration

* **dependabot:** add path monitoring for mise toolchain config ([ebc7227](https://github.com/snowdreamtech/template/commit/ebc72273a85cb32f3e66b84305c726e47ce55b63))
* **deps:** remove MISE_SKIP_CHECKSUM workaround ([0a80645](https://github.com/snowdreamtech/template/commit/0a8064500cc0ecef8851af4aea31023f5809512e))

## [0.4.0](https://github.com/snowdreamtech/template/compare/v0.4.0...v0.4.0) (2026-04-16)


### Bug Fixes

* **ci:** detect docker-compose files in dependabot generator ([530ca75](https://github.com/snowdreamtech/template/commit/530ca7534583ea16bb876c0e8bfbf209d958a42a))
* **ci:** explicitly specify checkmake mise tool spec to avoid aqua registry lookup ([acefebb](https://github.com/snowdreamtech/template/commit/acefebb98efc3563a9011f2ea05e7cc7274f5aef))
* **ci:** remove unsupported signoff parameter and add release-as 0.5.0 ([d01b2df](https://github.com/snowdreamtech/template/commit/d01b2dffa875d815316b5d41922b58ce9d574879))
* **mise:** workaround for GitHub attestation verification failures ([2911054](https://github.com/snowdreamtech/template/commit/29110547a86ebe51593eac637c0b4dc4c14977bc))


### Documentation

* **security:** add comprehensive asdf supply chain risk analysis ([515eea1](https://github.com/snowdreamtech/template/commit/515eea10cedc50f05f0cecd3f421129e1ce59cd4))


### Miscellaneous Chores

* **deps:** bump mise to v2026.4.14 ([2bf29e3](https://github.com/snowdreamtech/template/commit/2bf29e3e3f8385913f9367de8a1170a151b5bd82))
* **release:** v0.4.0 - Fix Dependabot docker-compose detection ([e91f7d8](https://github.com/snowdreamtech/template/commit/e91f7d882f3c7b23260f4da02f0e5e53d6399968))


### Continuous Integration

* **dependabot:** add path monitoring for mise toolchain config ([ebc7227](https://github.com/snowdreamtech/template/commit/ebc72273a85cb32f3e66b84305c726e47ce55b63))
* **deps:** remove MISE_SKIP_CHECKSUM workaround ([0a80645](https://github.com/snowdreamtech/template/commit/0a8064500cc0ecef8851af4aea31023f5809512e))

## [0.3.0](https://github.com/snowdreamtech/template/compare/v0.2.0...v0.3.0) (2026-04-15)


### ⚠ BREAKING CHANGES

* **security:** mise now downloads binaries ONLY from GitHub Releases

### Features

* **dev:** add POSIX-compatible CI simulation script ([a587a39](https://github.com/snowdreamtech/template/commit/a587a390faa640adce2d448b773222cbb373c41d))
* **security:** implement three-layer defense against Aqua Registry ([ef13665](https://github.com/snowdreamtech/template/commit/ef136651dc6d7d358cf4de2748a0a10a841730bf))


### Bug Fixes

* **ci:** update node-audit to use new npm bulk advisory endpoint ([526ca79](https://github.com/snowdreamtech/template/commit/526ca79e307d38240e54505bda3b06d75f1e8b9a))
* **docs:** ensure make docs build works correctly ([6a0df9c](https://github.com/snowdreamtech/template/commit/6a0df9ce6acf22d2d8606dda0444c48d369967bd))

## [0.2.0](https://github.com/snowdreamtech/template/compare/v0.1.0...v0.2.0) (2026-04-14)


### Features

* **devcontainer:** add Docker availability check in init script ([7ca1fe4](https://github.com/snowdreamtech/template/commit/7ca1fe4c37ada1893e94e9ac28ec578952c1d99e))
* **mise:** add yamllint to core tools in mise.toml ([406bbb3](https://github.com/snowdreamtech/template/commit/406bbb32f3a9f47bdfee72e2422b273a6cab252b))


### Bug Fixes

* **devcontainer:** add command availability checks before usage ([a0a4ce0](https://github.com/snowdreamtech/template/commit/a0a4ce0d1bed246c722270f920e79f2046a1bfe7))
* **devcontainer:** add command to keep container running ([5484045](https://github.com/snowdreamtech/template/commit/54840456dfb76e040655d49cf28b45e9b64ead1d))
* **devcontainer:** add workspace volume mount and fix configuration ([9ff708b](https://github.com/snowdreamtech/template/commit/9ff708be2aa74af62eae40012f163229bb688296))
* **devcontainer:** add YAML document start marker for yamllint ([44ccf81](https://github.com/snowdreamtech/template/commit/44ccf8108ad6ea15b92069f15bbc1ce852723ec0))
* **devcontainer:** correct updateContentCommand to use make install ([774bba2](https://github.com/snowdreamtech/template/commit/774bba245b5025973492b2cd8fb10826eae7af12))
* **devcontainer:** handle missing host directories gracefully ([9b79301](https://github.com/snowdreamtech/template/commit/9b7930189a20c8c44983a739d80ec05d8b5987f5))
* **devcontainer:** use global git config instead of local ([934bb1c](https://github.com/snowdreamtech/template/commit/934bb1c3bec475b571daab4168cdd233d10b6816))
* **mise:** update yamllint version to match versions.sh ([d9bcf61](https://github.com/snowdreamtech/template/commit/d9bcf61f7092f248186d41ceb66fcd98d3015a34))
* resolve devcontainer startup with docker-compose configuration ([fa788e4](https://github.com/snowdreamtech/template/commit/fa788e4f3c94e767f465eea9f17acb4ab8f4a01e))
* **setup:** ensure yaml and toml modules are always installed locally ([7ca7026](https://github.com/snowdreamtech/template/commit/7ca7026761c0a58a939935db83e37922a872a243))
* **tools:** complete taplo provider migration to npm ([cdeaf76](https://github.com/snowdreamtech/template/commit/cdeaf762d62dfde4a14d90136cf298fe4c8e125d))
* **tools:** switch taplo from GitHub source to npm precompiled binary ([18de234](https://github.com/snowdreamtech/template/commit/18de2342744562645b849d24edbd94e6524259d1))

## [0.1.0](https://github.com/snowdreamtech/template/compare/v0.0.4...v0.1.0) (2026-04-14)


### Features

* **devcontainer:** add comprehensive SSH and GPG permission configuration ([843180b](https://github.com/snowdreamtech/template/commit/843180b5722d20b1704e482d40b1c4a80f890fdc))
* **devcontainer:** add support for local git config file ([2fb5e43](https://github.com/snowdreamtech/template/commit/2fb5e435b5038617746aff9837dec98865cd4d5c))
* **devcontainer:** enable GPG signing support ([4d88e12](https://github.com/snowdreamtech/template/commit/4d88e125ddc84966237d382d897c03b1cf73da06))


### Bug Fixes

* **ci:** pin GitHub Actions to commit SHA in performance workflow ([13623d9](https://github.com/snowdreamtech/template/commit/13623d9cf5ae7a6677a8645a8d568bb39a2752a2))
* **devcontainer:** make git config cross-platform compatible ([600052a](https://github.com/snowdreamtech/template/commit/600052ae9d9067de738a875009df7e8371099625))
* **devcontainer:** use dynamic workspace folder variable ([73421d6](https://github.com/snowdreamtech/template/commit/73421d6f6724ae63613d30566103b55191d43c87))
* **devcontainer:** use find instead of ls for directory permissions ([ffeaee8](https://github.com/snowdreamtech/template/commit/ffeaee833e3a9f4ad7a88d45b906ad12ca52b62d))
* **setup:** normalize version strings in is_version_match to handle v prefix ([e5efefd](https://github.com/snowdreamtech/template/commit/e5efefdf81ca728f3b75703007cd475c6a2fa0f1))

## [0.0.4](https://github.com/snowdreamtech/template/compare/v0.0.3...v0.0.4) (2026-04-12)


### Bug Fixes

* **python:** install build dependencies for Alpine/musl environments ([3f53883](https://github.com/snowdreamtech/template/commit/3f53883e79ed5b9d74ca2369052b0014a3d4f0fc))


### Miscellaneous Chores

* **main:** release 0.0.4 ([50f54df](https://github.com/snowdreamtech/template/commit/50f54df242ad2f1b3eb9af763359692728e38200))

## [0.0.3](https://github.com/snowdreamtech/template/compare/v0.0.2...v0.0.3) (2026-04-12)


### Bug Fixes

* **ci:** exclude unreleased version compare links from lychee checks ([6165757](https://github.com/snowdreamtech/template/commit/6165757ebf73b2d1b7abf5c738d66f6402a06f14))
* **ci:** make link checker non-blocking to avoid false failures ([99c2ec9](https://github.com/snowdreamtech/template/commit/99c2ec99befd980c996953bd53471ded5f6d404a))
* **ci:** pass GITHUB_TOKEN to lychee for link checking ([dfb9fd1](https://github.com/snowdreamtech/template/commit/dfb9fd185e4f1bbe4987b4e991db85a4a03639e8))
* **ci:** use valid log level for lychee verbose option ([171e721](https://github.com/snowdreamtech/template/commit/171e7218eb1e6cf00645c27f7d9d8187e5c9bf47))
* **docs:** update TPGi CCA link to GitHub releases page ([b061ca1](https://github.com/snowdreamtech/template/commit/b061ca1150e4dd23b47fd88b3f9992d0f97c1df8))

## [0.0.2](https://github.com/snowdreamtech/template/compare/v0.0.1...v0.0.2) (2026-04-12)


### Bug Fixes

* **node:** auto-install bash in Alpine for npm compatibility ([0042fa2](https://github.com/snowdreamtech/template/commit/0042fa2abb6ae389277660b3d0656f54ea669643))
* **node:** configure mise for musl binaries in Alpine environments ([232bce2](https://github.com/snowdreamtech/template/commit/232bce29a4401ebe42fd529c448a47d404562abe))
* **node:** explicitly set MISE_NODE_* env vars for Alpine ([25d506d](https://github.com/snowdreamtech/template/commit/25d506d6d952fa479dca79e427d10905d37fc9b6))
* **node:** export ALPINE_VERSION for mise.toml template evaluation ([62d9344](https://github.com/snowdreamtech/template/commit/62d934444f440eec678ac2227c723ab7f1e46e8d))
* **node:** use boolean false for node.compile setting ([97d5bd5](https://github.com/snowdreamtech/template/commit/97d5bd57d4dc1ffc52a777524c5aabf92a9a061d))

## 0.0.1 (2026-04-11)


### ⚠ BREAKING CHANGES

* mise does NOT automatically detect musl

### Features

* add comprehensive performance testing and documentation infrastructure ([c1d8996](https://github.com/snowdreamtech/template/commit/c1d8996e4f44ce7222cf589812325b700e7e5f96))
* add missing performance and documentation scripts ([fe65a58](https://github.com/snowdreamtech/template/commit/fe65a58f25c3214e93d156a03079c51d169d3240))
* add VER_MISE to versions.sh for centralized version management ([b805d26](https://github.com/snowdreamtech/template/commit/b805d26395103dbea4c34e14b5c99521537dabbd))
* **audit:** enforce mandatory version verification for Trivy ([e5bed3c](https://github.com/snowdreamtech/template/commit/e5bed3c75a8baf19f895b511dcd41329292ca0c2))
* **ci:** add atomic tool verification for shfmt and editorconfig-checker ([dd255e5](https://github.com/snowdreamtech/template/commit/dd255e5956a3a9b96c15cc832fddc3667a3effb2))
* **ci:** add atomic verification for config/doc linting tools ([5d8de8b](https://github.com/snowdreamtech/template/commit/5d8de8bc179790eac4518f73f03d5f6e8d5c5af6))
* **ci:** add atomic verification for hadolint and dockerfile-utils ([9e5a824](https://github.com/snowdreamtech/template/commit/9e5a824b22e1b31bcf08c9e7ae265ec836077bb0))
* **ci:** add atomic verification for Node.js tools ([4a6c20f](https://github.com/snowdreamtech/template/commit/4a6c20f4756f2605971c12a7a12feabc1d56bad4))
* **ci:** enable release-please for all configured branches ([bc94753](https://github.com/snowdreamtech/template/commit/bc94753270413815bb340e27fd6154f41e37d771))
* **ci:** harden cd.yml triggers, pathing, and link checking ([f33b0ec](https://github.com/snowdreamtech/template/commit/f33b0ec2e5da1f8b26ec808b24eafbf04c8d10c6))
* **ci:** harden stateless toolchain and remediate security audit findings ([ebab039](https://github.com/snowdreamtech/template/commit/ebab039b1f58b3a782bec8a71d23596b1c59f2ce))
* **ci:** implement universal binary-first tool verification ([5bedab1](https://github.com/snowdreamtech/template/commit/5bedab16aba4891d0395ba2e0462148810c8b2ac))
* **ci:** restore dev parity, fix windows path, and use relative doc links ([e348693](https://github.com/snowdreamtech/template/commit/e34869356ceb8e9b721cbe83f02e152ff07559f8))
* **ci:** skip DCO check for bot commits ([b841cee](https://github.com/snowdreamtech/template/commit/b841cee3308b970f945f92692d807cf353a7b379))
* **common:** enhance mise backend dependency checks and add MISE_GITHUB_ENTERPRISE_TOKEN forwarding ([27e0f1e](https://github.com/snowdreamtech/template/commit/27e0f1e7dfd3758bfa4bdc8013410a4bdbec386e))
* **devcontainer:** harden supply chain and eliminate insecure downloads ([6e44d86](https://github.com/snowdreamtech/template/commit/6e44d869573c265abc0f43f356f2a61e58a656e3))
* enhance PATH management for dynamically installed tools ([f307921](https://github.com/snowdreamtech/template/commit/f30792120c89c79cf2c7216b3ca5cfbe9d22dd31))
* enhanced PATH management for dynamic tool installation ([43c8ba6](https://github.com/snowdreamtech/template/commit/43c8ba6cd306cbe387593481dc6d7c28357557db))
* **hooks:** strengthen pre-commit with security & deep linting audits ([1427366](https://github.com/snowdreamtech/template/commit/14273660790f2c9f3806528114d9faec53c1f26b))
* **makefile:** add update-tools target and link to update lifecycle ([85e0381](https://github.com/snowdreamtech/template/commit/85e0381f64eb3992b2e5e47a3535b7bbe654a0da))
* **mise:** add Windows wrappers for manifest aggregator ([a851c75](https://github.com/snowdreamtech/template/commit/a851c75ffe0e11718ef34f2e81b3c2e51c689ade))
* **mise:** expand lock ritual to explicitly support alpine (musl) and debian (glibc) ([5be8bd6](https://github.com/snowdreamtech/template/commit/5be8bd674d31214765ebcd99a5445472a7859dff))
* **mise:** harden sync-lock with multi-platform support and exhaustive tool listing ([ba97b8d](https://github.com/snowdreamtech/template/commit/ba97b8de349ac803c330727e6008079b29a6612e))
* **mise:** implement ALF for go providers and revert osv-scanner for network compatibility ([546faff](https://github.com/snowdreamtech/template/commit/546faffef385d80fa6a290bb68652b7d16ed1528))
* **mise:** implement tiered tool management via lock ritual ([4c69d00](https://github.com/snowdreamtech/template/commit/4c69d00ec01fb9b98c786a4244c3956c7ca1a093))
* **mise:** implement universal tiered strategy with manifest aggregator ([73da439](https://github.com/snowdreamtech/template/commit/73da439bfea0462cf7e9369e1a0be1bafd81eae8))
* **mise:** standardize sync-lock with cmd-ps1-shell delegation pattern ([fe64c53](https://github.com/snowdreamtech/template/commit/fe64c53bbcdfcc596551b353675a413f9fb3618d))
* optimize mise shell activation with full path and official method ([77b21a6](https://github.com/snowdreamtech/template/commit/77b21a6257b5b219bfb5dc4057d28ffaeb2f0c82))
* optimize mise shell activation with full path support ([e71c33f](https://github.com/snowdreamtech/template/commit/e71c33f88abb2a2fd11561f7067b5c1e479f2b43))
* **scripts:** add cleanup script for duplicate mise activation lines ([b7020c6](https://github.com/snowdreamtech/template/commit/b7020c6ca19e167c71b776f1380c5f1dc8c20c3c))
* **scripts:** add missing performance and documentation scripts ([f8d9c61](https://github.com/snowdreamtech/template/commit/f8d9c613cfa599e503bed8190e13da66cbf928d7))
* **scripts:** exhaustive global safety hardening for all shell scripts ([86c199e](https://github.com/snowdreamtech/template/commit/86c199e77ddc95a6190fbf6e758ec640d32bc6a3))
* **scripts:** exhaustive semantic safety audit and local variable hardening ([76dc9a7](https://github.com/snowdreamtech/template/commit/76dc9a7be77ecc2cdcb7076af591da2ce5b5ae92))
* **scripts:** final project-wide audit and reinforcement of set -eu standard ([cf99842](https://github.com/snowdreamtech/template/commit/cf99842599544788770df3c55ceccd17a1e7165f))
* **scripts:** global recursive shell safety upgrade to set -eu ([d2b90e3](https://github.com/snowdreamtech/template/commit/d2b90e3232dd774d629a98dda941307e3681ea07))
* **scripts:** implement Node.js JSON parser with CommonJS ([e0ffb06](https://github.com/snowdreamtech/template/commit/e0ffb06a5e8634f05d171a440aa515c881180d30))
* **scripts:** unify all shell scripts to use set -eu for POSIX safety ([fda9d45](https://github.com/snowdreamtech/template/commit/fda9d45628b92a5a654f16ff354d37493ae65e8b))
* **security:** globally lock GitHub Actions to latest verified SHAs ([193eb0c](https://github.com/snowdreamtech/template/commit/193eb0cd997c8d19bb0d86c7f811cf99f332cde2))
* **security:** implement artifact signing with cosign and SBOM auditing ([df86f8f](https://github.com/snowdreamtech/template/commit/df86f8f092631da18eb93148674f623b59f32b99))
* **security:** implement binary artifact audit to prevent poisoning ([73cd7b3](https://github.com/snowdreamtech/template/commit/73cd7b399cd3ffd65c0134ea08f13ac587b89501))
* **security:** implement OpenSSF Scorecard for continuous security health monitoring ([8c5015a](https://github.com/snowdreamtech/template/commit/8c5015a67693d941cb3f893b555b515c533acd18))
* **security:** implement platinum-standard CI/CD supply chain hardening ([d101fe4](https://github.com/snowdreamtech/template/commit/d101fe4988cc532d5fa4efa1ae8b883da7314b0e))
* **security:** implement PR dependency review shield ([16fd84e](https://github.com/snowdreamtech/template/commit/16fd84e627d0f8bbaed92522d07bf345e3aa6dc7))
* **security:** integrate CycloneDX SBOM generation into audit script ([5e9598a](https://github.com/snowdreamtech/template/commit/5e9598a387f2f909d32605903bb1730e7e731096))
* **security:** refactor audit orchestration for automatic activation in local dev ([f085c71](https://github.com/snowdreamtech/template/commit/f085c711f6e3b5093b1c8ab9efff2b31e32725d1))
* use mise.jdx.dev install script with version support ([043b346](https://github.com/snowdreamtech/template/commit/043b3460ae67ae946018155cab31396770741561))
* use VER_MISE from versions.sh in common.sh ([d4c8160](https://github.com/snowdreamtech/template/commit/d4c81601aa888932a2b0b01ef3f9208f348b5a4e))


### Bug Fixes

* add pattern matching for binaries with version/platform suffixes ([9ce22d9](https://github.com/snowdreamtech/template/commit/9ce22d9e618960d62c4711bea1c9130d5d82f3df))
* add unified PATH management and CI persistence to run_mise ([19c6431](https://github.com/snowdreamtech/template/commit/19c64317dc58d31ddeb16ef4f7657795fe49ef35))
* align log_summary to use CI_STEP_SUMMARY for consistent reporting ([601ac65](https://github.com/snowdreamtech/template/commit/601ac65d390330fa51a7e2c025b2a56ac3834188))
* **audit:** handle missing GITHUB_TOKEN and make zizmor findings non-fatal ([28c7cc6](https://github.com/snowdreamtech/template/commit/28c7cc618a6dd109e6f27ff8fb07117aba96f409))
* **base:** add version specifications to mise install calls ([71aa2fe](https://github.com/snowdreamtech/template/commit/71aa2fe0746f8fdfc8178de4971abaf002509108))
* **bootstrap:** prevent duplicate mise activation lines in shell RC files ([0f343f1](https://github.com/snowdreamtech/template/commit/0f343f1fb933646753e52afead32f0ef3d887099))
* **bootstrap:** prevent shell-specific syntax errors in POSIX sh ([cc6066d](https://github.com/snowdreamtech/template/commit/cc6066d1004c52e9ecb60892df1a2f10645a414f))
* **bootstrap:** use dynamic mise paths instead of hardcoded values ([062f35a](https://github.com/snowdreamtech/template/commit/062f35ac1900d580735f094e86f55befba2d3400))
* **cd:** add debug output and improve PATH setup for Windows ([892d860](https://github.com/snowdreamtech/template/commit/892d8608c81b7c2c27532a7cbf02b0d06792057a))
* **cd:** align environment and checkout strategy with CI ([cf21294](https://github.com/snowdreamtech/template/commit/cf21294c59649198f7d37ceaea8a3cef60d7b4b9))
* **cd:** complete debug output alignment with CI workflow ([b52cd4f](https://github.com/snowdreamtech/template/commit/b52cd4f93ce813f0a2bea3d135ff81bfc761f4e6))
* **cd:** elevate release-please token for automation triggering ([64d63ab](https://github.com/snowdreamtech/template/commit/64d63ab6a2a2d9840009bb141d9015a6d69ed62d))
* **cd:** ensure mise shims are on PATH for all verification steps ([95687fe](https://github.com/snowdreamtech/template/commit/95687fe0f88e57b638e5d273be8b5bbd528ed760))
* **cd:** optimize release-please triggers for main branch ([1bc2e26](https://github.com/snowdreamtech/template/commit/1bc2e26d77a5e189a202f124057b3db0af2f2928))
* **cd:** split monolithic verify into explicit lint, test, audit ([049ba15](https://github.com/snowdreamtech/template/commit/049ba150dc0efdc3aaeca1a382beefe60fc8006c))
* **cd:** synchronize commit convention check from CI ([43f3752](https://github.com/snowdreamtech/template/commit/43f3752fba68ad3a3f90eb27eeebc1bb9c939b8d))
* **cd:** synchronize security audit depth with CI ([9757128](https://github.com/snowdreamtech/template/commit/9757128fe122be2acb0bed34f2e39d5892778b9b))
* centralize hardcoded provider values across shell scripts ([2a170e7](https://github.com/snowdreamtech/template/commit/2a170e7626c456e116c59e08eff7e49e324fa551))
* **check-env:** strip leading 'v' from versions for accurate comparison ([83456b3](https://github.com/snowdreamtech/template/commit/83456b3f8624aaf6cc2b3feee48c398102d16ed8))
* **check-env:** sync GITHUB_PATH to current shell in CI ([8fdde4e](https://github.com/snowdreamtech/template/commit/8fdde4e89bd198a7c5f8d78a396c27bae3abeae6))
* **check-env:** use full mise keys for version detection ([a5b1063](https://github.com/snowdreamtech/template/commit/a5b10635d40cde00554db96ec953025aeae7f5a6))
* **check-env:** version mismatch should warn not fail ([e98d7b3](https://github.com/snowdreamtech/template/commit/e98d7b3d973c69847f5f817fef3a374ab821a14c))
* **ci:** add aggressive cache refresh after uninstall in install_tool_safe ([433899c](https://github.com/snowdreamtech/template/commit/433899cd8435f737a6193f15e3189a987260e5ef))
* **ci:** add DCO signoff to dependabot-sync commits ([cfe7546](https://github.com/snowdreamtech/template/commit/cfe75468ce43c5b61c7ac8e5915eb767b0032815))
* **ci:** add DCO signoff to release-please commits ([8fd8b67](https://github.com/snowdreamtech/template/commit/8fd8b6729aa68027072f68acec9735397eea54cc))
* **ci:** add mise exec fallback for pnpm audit on Windows ([f1e93b7](https://github.com/snowdreamtech/template/commit/f1e93b73541e2a1f5c9c42c81d89e97cbf91c57d))
* **ci:** add mise setup to label-sync.yml and clean up version comments ([70397a3](https://github.com/snowdreamtech/template/commit/70397a3318f889ed66bc97b9c8aed29827f287cb))
* **ci:** add mise.lock and versions.sh to mise cache key in pages workflow ([9d7b9d7](https://github.com/snowdreamtech/template/commit/9d7b9d75d68645afaa798a577758ea55fa94cb03))
* **ci:** add mise.lock to mise cache key in cd workflow ([d43cdf9](https://github.com/snowdreamtech/template/commit/d43cdf9ab8d2c22af779601acfbab8fe42b035be))
* **ci:** add mise.lock to mise cache key in dependabot-sync workflow ([070adf0](https://github.com/snowdreamtech/template/commit/070adf0610122d8ed3e098d72838714190ec8871))
* **ci:** add mise.lock to mise cache key in label-sync workflow ([fccb9f0](https://github.com/snowdreamtech/template/commit/fccb9f0669b118ecaeac1e88a771534a13fc8455))
* **ci:** add mise.lock to mise cache keys in ci workflow (3 jobs) ([ac8ecf6](https://github.com/snowdreamtech/template/commit/ac8ecf6adb81781556c969916c2e0a62b99f035c))
* **ci:** add node-audit special handling in CI fallback ([d82624c](https://github.com/snowdreamtech/template/commit/d82624cda69bbf48e21ef2693d5c5477c278463e))
* **ci:** add OSV-scanner and Zizmor to Tier 1 tools ([7bf9561](https://github.com/snowdreamtech/template/commit/7bf9561f2459bd68ff422d61e3e8967df5a9d65f))
* **ci:** comprehensive tool installation and execution fix ([bac4a9c](https://github.com/snowdreamtech/template/commit/bac4a9ce77e15170d3a8f3e1db970b00917e7abc))
* **ci:** correct action SHA and version tag mismatches in cd.yml ([f4d90ec](https://github.com/snowdreamtech/template/commit/f4d90ec5d3570189d0f8c5562f4eea59f70a899f))
* **ci:** disable paranoid mode in CI for lockfile sync ([1b282ce](https://github.com/snowdreamtech/template/commit/1b282ce6fa3d1ecca5c18de89a4962ec7e50226b))
* **ci:** elevate GITHUB_TOKEN for rate-limit resilience ([7c2123f](https://github.com/snowdreamtech/template/commit/7c2123fe8f1dbced5332f7a16cdbb84c973b6c29))
* **ci:** enable release-please for dev branch and fix DCO signoff ([ab8f065](https://github.com/snowdreamtech/template/commit/ab8f065dce45cc794d78aa075fc8c066eeec2bf5))
* **ci:** ensure CI_STEP_SUMMARY is always defined and sourced in gen-dependabot ([e19a7ec](https://github.com/snowdreamtech/template/commit/e19a7ec5fa7c2c61f9cdccb0dae4ddc56afcbfc4))
* **ci:** ensure PATH persistence after setup completes on Windows ([460dc8d](https://github.com/snowdreamtech/template/commit/460dc8d84067a89081762401269565a815ceab00))
* **ci:** ensure project root is detected before initializing CI summary path ([341b3f8](https://github.com/snowdreamtech/template/commit/341b3f87ffbae0aee1d8bd56f294ed76a478b07c))
* **ci:** ensure shfmt and handle trivy absence in CI ([fae3f46](https://github.com/snowdreamtech/template/commit/fae3f46d2c253d3c2883814d24f33169df3325b2))
* **ci:** exhaustive project root detection to satisfy both smoke and bats tests ([efd9b07](https://github.com/snowdreamtech/template/commit/efd9b07d36a5234b3f00f8e3e49f01062225dc36))
* **ci:** extract version from TOML table syntax in install_tool_safe ([9740407](https://github.com/snowdreamtech/template/commit/9740407dd5b970e1bcecc26d58ce756f2fd36027))
* **ci:** fix PSScriptAnalyzer and yamllint configuration ([166826a](https://github.com/snowdreamtech/template/commit/166826afd22a16c5fe7ccf131ae28d6f46d48525))
* **ci:** fix yamllint truthy error in performance workflow ([7e7dfd0](https://github.com/snowdreamtech/template/commit/7e7dfd052065a8b361212d0a1611a60bc951b06b))
* **ci:** handle mise shims in verify_binary_exists ([bc0dfd9](https://github.com/snowdreamtech/template/commit/bc0dfd945090a3b63cf27ee90b9073547ff76ec5))
* **ci:** harden CI summary path with guaranteed fallback to avoid directory errors ([3d2c227](https://github.com/snowdreamtech/template/commit/3d2c2274990383a14b44ee96b96d34bb6f25757b))
* **ci:** harden GITHUB_PATH persistence and Windows mise detection ([6c555db](https://github.com/snowdreamtech/template/commit/6c555dbefb0842a70ab06769935edf1df33f58a7))
* **ci:** immediately update PATH in current shell after writing to GITHUB_PATH ([6fd7c76](https://github.com/snowdreamtech/template/commit/6fd7c764c16a49fd51f180c4310ad2bf08db7401))
* **ci:** implement robust sentinel-based project root detection ([7be109f](https://github.com/snowdreamtech/template/commit/7be109f9376961c2e4521ddd7b4997bcdaf29c2e))
* **ci:** improve binary resolution fallback for GitHub tools ([53ae080](https://github.com/snowdreamtech/template/commit/53ae0802fb5eb5d618f71be3f9f0fe6d9d89232a))
* **ci:** improve post-install binary name resolution ([46ab8b0](https://github.com/snowdreamtech/template/commit/46ab8b00c8b5f65bdd1e2171964650ef46359e75))
* **ci:** make lint.sh fail when pre-commit hooks fail ([78ca50a](https://github.com/snowdreamtech/template/commit/78ca50ac3a1e670d5c11b7a0292585976384cbfd))
* **ci:** optimize pull_request triggers for main branch ([5f5a5ca](https://github.com/snowdreamtech/template/commit/5f5a5ca742320b45f37aac09c4803c8f1d9e4fad))
* **ci:** pin CodeQL action to verified underlying commit SHA ([11cb79b](https://github.com/snowdreamtech/template/commit/11cb79b81eae47e66917c33adbf41e36bfe26983))
* **ci:** quote 'on' keyword in performance workflow ([4710acd](https://github.com/snowdreamtech/template/commit/4710acd942f39592bfe55f4ceb73af7ec47153c7))
* **ci:** remove --template flag from gh label list command ([27b29ea](https://github.com/snowdreamtech/template/commit/27b29ea1cabb48a35398324473ea3e8133f07ed3))
* **ci:** remove emoji from log messages to fix Windows printf errors ([f14a5f0](https://github.com/snowdreamtech/template/commit/f14a5f00870474761daa7a54a231a64cc70d668b))
* **ci:** remove MISE_OFFLINE=true from all workflow files ([4be4079](https://github.com/snowdreamtech/template/commit/4be407962334edee9c465e296d7e5d18bfc7d2ea))
* **ci:** remove SKIP_MODULES and stabilize test assertions ([241275f](https://github.com/snowdreamtech/template/commit/241275fa1ff08cb994b8c5dabdfb1a9b0ae1a538))
* **ci:** remove trailing space in goreleaser.yml tag pattern ([7cd8dd9](https://github.com/snowdreamtech/template/commit/7cd8dd9fbb69a81fb03ae0467538859b7effa4d8))
* **ci:** remove Windows path conversion for GitHub Actions PATH persistence ([4af9416](https://github.com/snowdreamtech/template/commit/4af9416b6ea4fba25606ef2bace671895d56e921))
* **ci:** resolve actual binary names for platform-specific tools ([e6856c9](https://github.com/snowdreamtech/template/commit/e6856c9a622d12a915744b44f1542106c87034ad))
* **ci:** resolve npm-pnpm-audit hook failure on Windows ([095f3a5](https://github.com/snowdreamtech/template/commit/095f3a553e352c426e39aa727b37cd3f610b3408))
* **ci:** restore actions/cache version hash in ci workflow ([713881a](https://github.com/snowdreamtech/template/commit/713881ae0bd8929ce69c02ae89482cd26f643e99))
* **ci:** restore actions/cache version hash in dependabot-sync workflow ([e506978](https://github.com/snowdreamtech/template/commit/e5069784c2269abf3965875306a42997d358a4f5))
* **ci:** restore actions/cache version hash in pages workflow ([80a625d](https://github.com/snowdreamtech/template/commit/80a625dcbbe95259fbaae26d59cbb61fc7e2539e))
* **ci:** restrict release-please to main branch only ([b97162a](https://github.com/snowdreamtech/template/commit/b97162aa0092875bb8af1820cb4db6c06d17665b))
* **ci:** revert goreleaser to use --version flag ([564d899](https://github.com/snowdreamtech/template/commit/564d899198c6f0c19872642d6b3e2968d54536ab))
* **ci:** specify bin names for shfmt and editorconfig-checker in mise.toml ([f249809](https://github.com/snowdreamtech/template/commit/f2498091f79349cfe84fe160ad78477ad28a22b5))
* **ci:** support binaries installed in root directory ([72631b4](https://github.com/snowdreamtech/template/commit/72631b4d0f2c3cd53ea50b5e42a64585a92e98fc))
* **ci:** suppress zizmor findings for performance.yml and skip flaky tests ([0616771](https://github.com/snowdreamtech/template/commit/06167717e490f73f34e49386e4a776907caa554c))
* **ci:** update actions/cache version hash in ci workflow ([36520ec](https://github.com/snowdreamtech/template/commit/36520ec4b721ba79ccf6b410573d02e416a53f29))
* **ci:** update Phase 1 tools to use 4-parameter verify_tool_atomic ([5af97ed](https://github.com/snowdreamtech/template/commit/5af97ed9daa59c3f2a900f25ff22dd2f7bf634bb))
* **ci:** use correct version command for goreleaser ([b271332](https://github.com/snowdreamtech/template/commit/b271332e9b02f2f34513943f86ce8297f3c31dc4))
* **ci:** use GitHub binary providers for cross-platform security tools ([8d150f6](https://github.com/snowdreamtech/template/commit/8d150f6554d8f6a752f7c2351e62f637a1f52dc3))
* **ci:** use GITHUB_TOKEN for release-please to enable DCO signoff ([51051ba](https://github.com/snowdreamtech/template/commit/51051ba4a2e7fdca3a9ed927e09fdec94b20f77d))
* **ci:** use mise exec for shim smoke tests ([12306a9](https://github.com/snowdreamtech/template/commit/12306a9fbf8a8f4192002424aa03898223628077))
* **ci:** use platform-specific binary name for editorconfig-checker ([2b38f2a](https://github.com/snowdreamtech/template/commit/2b38f2a2fbb5445b5b5118a64efa34bd56495023))
* **codeql:** optimize triggers for baseline shrinkage ([9eeca84](https://github.com/snowdreamtech/template/commit/9eeca8477fce10c5c4f8942ac7c60eb5e70efbcf))
* **codeql:** pin action to verified underlying commit SHA ([422a8c6](https://github.com/snowdreamtech/template/commit/422a8c6e9e1a3b5a095be9cd814d42c5fb33ee37))
* **common:** correct find -maxdepth position in has_lang_files ([9866fe6](https://github.com/snowdreamtech/template/commit/9866fe68a40c64f47a3fc2d1c7abf94dd5d10022))
* **config:** remove deprecated ExperimentalScannerConfig from osv-scanner ([ce385db](https://github.com/snowdreamtech/template/commit/ce385db7ca970de93405cb85988e73e32f8f8c90))
* correct Alpine Linux Node.js installation behavior ([bbd85fa](https://github.com/snowdreamtech/template/commit/bbd85fa7048b058ee6a2d13ccf27debfac4912e7))
* **cpp:** add version specification to mise install call ([b6fbdaf](https://github.com/snowdreamtech/template/commit/b6fbdaf1f4866b77b7c1a8376e82f7d8dd5c7cd9))
* **dco:** use PR author instead of branch name to prevent bypass ([eb55adf](https://github.com/snowdreamtech/template/commit/eb55adf2ccc05f6a0bea0a1f9c37c5fb56f08e02))
* **deps:** correct toolchain provider mappings and dependabot schema ([76d515d](https://github.com/snowdreamtech/template/commit/76d515d4c3b0abe40ed6cc849b1f3ed2077887bb))
* **deps:** remove invalid dependabot property and sync mise.lock ([fc00f83](https://github.com/snowdreamtech/template/commit/fc00f837c81a6e2e101144ed9d9181521903447d))
* **deps:** replace asdf pipx backend with native mise plugin to resolve Windows CI failures ([05aba02](https://github.com/snowdreamtech/template/commit/05aba026dd7348bb2fb17848076a68b15411e33f))
* **docker:** add version specifications to mise install calls ([72149e4](https://github.com/snowdreamtech/template/commit/72149e4b14f49d2ad67543af54f1d654b5efcbb8))
* **docs:** fix broken relative links in documentation ([c13692c](https://github.com/snowdreamtech/template/commit/c13692c6ecf4fca79bf117fcda7076abef1acba1))
* **docs:** regenerate pnpm lockfile to match overrides ([b553918](https://github.com/snowdreamtech/template/commit/b553918d8c7d81bc4a7f740a756c590a06d48e2a))
* **docs:** resolve MD028 blockquote lint in snowdreamtech.init workflow ([4e9ecfa](https://github.com/snowdreamtech/template/commit/4e9ecfabb7e9bb7a2af0b3e0c73c56cb31f05262))
* **docs:** resolve vitepress from docs/node_modules/.bin ([13dc8f9](https://github.com/snowdreamtech/template/commit/13dc8f9deb1daf7c3ae60190a8b497dc4fbf0249))
* **env:** improve mise tool resolution and register zizmor ([120db7e](https://github.com/snowdreamtech/template/commit/120db7ec0ee94004b7b06337793ac5a8c9a93b0a))
* **go:** add version specifications to mise install calls ([4b6964f](https://github.com/snowdreamtech/template/commit/4b6964fbb2e43ea3674d433058d41f6f0db80335))
* **goreleaser:** add MIPS architecture variants to tag triggers ([03922c4](https://github.com/snowdreamtech/template/commit/03922c4fe57d0e62e69c359c979d8f388af525be))
* **goreleaser:** expand architecture-specific tag triggers ([2d72240](https://github.com/snowdreamtech/template/commit/2d72240330308c1b7196f7ec8f86d25c93cb4125))
* **goreleaser:** expand tag compatibility for monorepos and release-prefixes ([e62a42d](https://github.com/snowdreamtech/template/commit/e62a42d866b898ac086b2588d1814390fb55c522))
* **goreleaser:** implement Absolute Architecture Coverage tag matrix ([4bcd30a](https://github.com/snowdreamtech/template/commit/4bcd30a1834db9886527ada27ab3abb5126c756f))
* **goreleaser:** implement Engineering Excellence tag matrix ([715d0db](https://github.com/snowdreamtech/template/commit/715d0db59bb93b9bcacdc435b94e07833ad94ef3))
* **goreleaser:** implement Grand Slam Tag Matrix ([1a1815f](https://github.com/snowdreamtech/template/commit/1a1815f26b277a5b8900edeaab7c936855e043bb))
* **goreleaser:** implement Universal Tag Matrix ([b9555be](https://github.com/snowdreamtech/template/commit/b9555beca2ce5ac8984695d8ddcac5edbc771bf1))
* **goreleaser:** implement Universe-Level Tag Matrix ([266e7a7](https://github.com/snowdreamtech/template/commit/266e7a7a45d6bc8523f5cf18988854c3c385c03e))
* **goreleaser:** support v, V, and numeric tag formats ([cd99ffa](https://github.com/snowdreamtech/template/commit/cd99ffacfdf6f6143c32a4f5c36f21f69cd980a1))
* **goreleaser:** ultimate expansion of tag triggers ([aa1c346](https://github.com/snowdreamtech/template/commit/aa1c3463b41ceb918fef18e134598d367e67ad0b))
* **goreleaser:** unify scoped tag triggers with top-level patterns ([b0286a7](https://github.com/snowdreamtech/template/commit/b0286a7a88ff117f3708f8802e49b3a75dfdd5e4))
* **helm:** add version specification to mise install call ([4b5f452](https://github.com/snowdreamtech/template/commit/4b5f452e8003e64639a89447d96abd16abf5ce2c))
* improve POSIX compatibility in bin-resolver.sh ([ebab76e](https://github.com/snowdreamtech/template/commit/ebab76e69041ace9d2bcbeef107044763a27a991))
* improve stat command cross-platform compatibility ([031ffce](https://github.com/snowdreamtech/template/commit/031ffceb774c785a104eb93e715e4966786dafd4))
* **install:** add atomic verification to all Phase 3 low priority tools ([631318f](https://github.com/snowdreamtech/template/commit/631318fd13a28676f6015eca24c3759a86d2c4f2))
* **install:** add atomic verification to clang-format, google-java-format, stylua, ktlint ([0b92a0d](https://github.com/snowdreamtech/template/commit/0b92a0d1e40ca2b00690a204e2c077526e6a2886))
* **install:** add atomic verification to Phase 2 remaining tools ([bb0ae96](https://github.com/snowdreamtech/template/commit/bb0ae96ddb968b00495196547fc5795f3444d8e3))
* **java:** add version specification to mise install call ([8f359a1](https://github.com/snowdreamtech/template/commit/8f359a1fef21822d9dfe733cd4a45e8bc0eaa28e))
* **lint:** add aggressive reinstall logic in lint-wrapper ([40ab04d](https://github.com/snowdreamtech/template/commit/40ab04d550adb207e6fd954afdae6fe48da7f6a3))
* **lint:** add auto-install fallback for missing tools in CI ([b293923](https://github.com/snowdreamtech/template/commit/b2939234dc31427706c716bc261d29e0635e0174))
* **lint:** add license headers to test files and fix markdown formatting ([02263cc](https://github.com/snowdreamtech/template/commit/02263ccdd8163b427643af8fce0103232b01b82c))
* **lint:** add reshim and direct execution fallback ([21be93b](https://github.com/snowdreamtech/template/commit/21be93bb2f143b16f2476a7bb5f46bb838a09961))
* **lint:** add tool spec mapping for shfmt, taplo, and editorconfig-checker ([86c47ac](https://github.com/snowdreamtech/template/commit/86c47aceaedce07dda24802869a9f024a19616df))
* **lint:** add zizmor to optional security tools list ([13b06fd](https://github.com/snowdreamtech/template/commit/13b06fdf2720ea8b493dff1301a889c461a1f589))
* **lint:** correct editorconfig-checker binary name to 'ec' ([c56679c](https://github.com/snowdreamtech/template/commit/c56679c2515de0754e593a7f295623a0e075577c))
* **lint:** exclude all markdown files from prettier formatting ([4fee420](https://github.com/snowdreamtech/template/commit/4fee420ee9f672867de2c0f0c59cf00baf8d8ad3))
* **lint:** exclude test files from shellcheck-posix and markdown from prettier ([0dfd5b2](https://github.com/snowdreamtech/template/commit/0dfd5b2eb22337c03b4c06a7879369328922e7fa))
* **lint:** fix yamllint, markdownlint, and editorconfig issues ([b7925a2](https://github.com/snowdreamtech/template/commit/b7925a2f9661b860f50134e5de1a028f172e971a))
* **lint:** prevent prettier/markdownlint emphasis format conflict ([0c38f99](https://github.com/snowdreamtech/template/commit/0c38f994d6f4592e35e02e9dbb85244722f1388c))
* **lint:** resolve spurious warning by reporting pre-commit version ([188a325](https://github.com/snowdreamtech/template/commit/188a3251cb2f76d053bbb5e9ccef5846eae4d269))
* **lint:** use mise exec as fallback when resolve_bin fails in CI ([8e52231](https://github.com/snowdreamtech/template/commit/8e5223113a198757c33ede338ebd6fc55fac84b0))
* **linux:** use -perm /111 instead of +111 for better compatibility ([512e69b](https://github.com/snowdreamtech/template/commit/512e69b504a1810c4fa126fab5b6079bfbba125d))
* **macos:** avoid -perm flag for BSD find compatibility ([79b98b0](https://github.com/snowdreamtech/template/commit/79b98b071476afe24a80e9876c7e2509022c1529))
* **macos:** use -perm +111 instead of -executable for BSD find compatibility ([911c1b4](https://github.com/snowdreamtech/template/commit/911c1b47e643bcb1d95e6400a7e6abdbfeea82fe))
* **mise:** add additional paranoid mode disable flags ([7e83141](https://github.com/snowdreamtech/template/commit/7e83141b005bb8e0e6dc930f35eec7436c1bceb1))
* **mise:** align pnpm version to 10.30.3 to fix detection failure ([c01671d](https://github.com/snowdreamtech/template/commit/c01671df9125246be64d26cb4129450684067ef6))
* **mise:** clear cache before sync-lock to prevent stale provenance verification ([027874d](https://github.com/snowdreamtech/template/commit/027874db7c3ce6b823576d2bdb3da0bf868f5209))
* **mise:** downgrade node to 22.14.0 for macOS 12 compatibility ([c5495b4](https://github.com/snowdreamtech/template/commit/c5495b491a7796d25bd2ff26fbb8cbd9fdc43aff))
* **mise:** downgrade Python from 3.14.3 to 3.13.12 ([71ae8fd](https://github.com/snowdreamtech/template/commit/71ae8fd1f1750ed0440b18be1515610063cee1e8))
* **mise:** enable GitHub proxy locally and fix checkmake version ([a0e65aa](https://github.com/snowdreamtech/template/commit/a0e65aaaa862ddc657beeac74fd598c509c54c76))
* **mise:** handle platform-specific editorconfig-checker binary names ([5ebb3ff](https://github.com/snowdreamtech/template/commit/5ebb3ff76b07f9eb31d61755fd064746512dbd69))
* **mise:** increase HTTP timeout to 300s for slow GitHub downloads ([123aa0c](https://github.com/snowdreamtech/template/commit/123aa0cd8b8f07ccc48e59758f887e778e76b316))
* **mise:** make lint ([097f32b](https://github.com/snowdreamtech/template/commit/097f32bdffbaf3ccc78eaa367ecb3e40a2935939))
* **mise:** permanently disable paranoid mode for lockfile sync ([49dbb04](https://github.com/snowdreamtech/template/commit/49dbb044f65c4c5203edd751218f3d90315214f6))
* **mise:** restore tier 1 tools and implement surgical lock ritual ([c404e7a](https://github.com/snowdreamtech/template/commit/c404e7a89ace7023f8df914ebfe7fffaa3fe2b29))
* **mise:** skip Go checksum verification for Aliyun mirror ([8821f81](https://github.com/snowdreamtech/template/commit/8821f814b7bb37d56d8e45e4163cc3292624fafd))
* **mise:** synchronize multi-platform lockfile with pnpm 10.30.3 ([fc2113b](https://github.com/snowdreamtech/template/commit/fc2113b5c63b845ca4a8631cd50fde9db5e59d15))
* **nightly:** add fetch-depth: 0 for comprehensive security audit ([8ef1a9b](https://github.com/snowdreamtech/template/commit/8ef1a9bb0390b4c5f0442219c9a7d71b38557c48))
* **nightly:** elevate tokens for security reporting ([55ddb37](https://github.com/snowdreamtech/template/commit/55ddb370027110804ea3924c88e9ea6d0fc63200))
* **node:** add corepack resiliency and npm fallback ([d72055b](https://github.com/snowdreamtech/template/commit/d72055b2e0c3eeb97bb9103b413188fe2f21f0be))
* **node:** add version specifications to mise install calls ([afd9c04](https://github.com/snowdreamtech/template/commit/afd9c0456fea9d3a427dfe8f70913d7e745b92fb))
* **node:** resolve install hang by skipping redundant corepack activation ([36b3d44](https://github.com/snowdreamtech/template/commit/36b3d448f4ad914621752f4504560e6d4d110975))
* **openapi:** add version specification to mise install call ([81e52b5](https://github.com/snowdreamtech/template/commit/81e52b5bcd5fa9f7a82036aabbb2fd24727783a0))
* **pre-commit:** migrate deprecated stage name ([8392cbf](https://github.com/snowdreamtech/template/commit/8392cbfe73aee175bb7732255a7f992c75078184))
* **pre-commit:** skip osv-scanner in local pre-commit hooks ([b4b82ac](https://github.com/snowdreamtech/template/commit/b4b82ac7078d197c8a4dfac85a2748cdee5f61e4))
* **protobuf:** add version specification to mise install call ([1f7938e](https://github.com/snowdreamtech/template/commit/1f7938e2cbaf3661a0387bd476ed73ce6e7d4e15))
* **python:** add version specifications to mise install calls ([b808c7e](https://github.com/snowdreamtech/template/commit/b808c7e16cafa6fdbf6c50ef8be5a8639401c9e4))
* re-enable refresh_mise_cache with timeout protection ([efe2b3e](https://github.com/snowdreamtech/template/commit/efe2b3e98fbf4650b3375bfb11cb0355b97e1081))
* **registry:** propagate mise install failures in CI ([582eeef](https://github.com/snowdreamtech/template/commit/582eeef44ae4d368ae59bc2d5582b49fb974064f))
* **rego:** add version specification to mise install call ([60eb8ee](https://github.com/snowdreamtech/template/commit/60eb8eecfb6c4f1b38d2ce41500c29774ee16e8c))
* replace %b with %s in printf to avoid Windows path issues ([29ba55b](https://github.com/snowdreamtech/template/commit/29ba55b82400d7ec41074c2951cbbd614eab3cb5))
* resolve make verify hanging and add Kiro config ([505e140](https://github.com/snowdreamtech/template/commit/505e140402edadd12c635a1b0d27f3785e0ea717))
* restore mise metadata cache initialization to resolve JIT tool detection ([9b15c4c](https://github.com/snowdreamtech/template/commit/9b15c4cd469e9af229ef73e9f6272705d176349f))
* **runner:** add version specifications to mise install calls ([bf3d5df](https://github.com/snowdreamtech/template/commit/bf3d5df78889a6e27e41f961ba38a239a5e0a8bd))
* **scorecard:** pin action to verified underlying commit SHA ([5f6a357](https://github.com/snowdreamtech/template/commit/5f6a357398a746b4558c8f3f82e006e8cab78372))
* **scripts:** add recursion lock cleanup advice to concurrency warning ([ce27ada](https://github.com/snowdreamtech/template/commit/ce27adafa7b711ba6d9ad993e4e95ef534d289b8))
* **scripts:** centralize GitHub token normalization ([50429be](https://github.com/snowdreamtech/template/commit/50429be4d71f62734f5a1bbceaf4d473ce008885))
* **scripts:** comprehensive set -u safety sweep for all shell scripts ([4c5ab38](https://github.com/snowdreamtech/template/commit/4c5ab38308c9cdded00c1ffa32fc6d90ee182ff6))
* **scripts:** fix JSON output formatting issues ([7b30a64](https://github.com/snowdreamtech/template/commit/7b30a640d262c9d47bd75956f92d5d3819cd4ce8))
* **scripts:** harden gen-full-manifest with absolute paths and fix perl syntax ([41199c6](https://github.com/snowdreamtech/template/commit/41199c6493cc0ef4252975645600fe16db423296))
* **scripts:** improve mise path detection in utility scripts ([3c071d8](https://github.com/snowdreamtech/template/commit/3c071d8d4f546cae906e55092dfe9b54566e7d9f))
* **scripts:** improve path robustness and update verifier in release.sh ([000ec98](https://github.com/snowdreamtech/template/commit/000ec98593f2ef52842c6a37de0355fccfc80159))
* **scripts:** integrate update-tools.sh into main update sequence ([c86fa15](https://github.com/snowdreamtech/template/commit/c86fa1561803cbbe7d0e96ec110db4d761c60225))
* **scripts:** making common.sh set -u safe ([20ce016](https://github.com/snowdreamtech/template/commit/20ce01692a416d8453fb2b3876bf5edf90aa0166))
* **scripts:** prevent recursion lock accumulation across multiple runs ([6d41678](https://github.com/snowdreamtech/template/commit/6d4167845870c19af4f2ed39dec28f32e2096c9b))
* **scripts:** resolve infinite recursion and macOS compatibility in setup ([dbc5f9b](https://github.com/snowdreamtech/template/commit/dbc5f9b3bf417c7107641faacb51b4d5a637cfa1))
* **scripts:** resolve nested unbound variable errors in common.sh ([f4de98a](https://github.com/snowdreamtech/template/commit/f4de98a4e679bc5c3c9023590b1539087e6b939c))
* **scripts:** resolve PSScriptAnalyzer warnings in sync-labels.ps1 ([5d72d18](https://github.com/snowdreamtech/template/commit/5d72d18de1681078f8299e92ba9dc3d62e90a290))
* **scripts:** resolve silent hang during mise tool resolution ([dec1f65](https://github.com/snowdreamtech/template/commit/dec1f65ace1e5238222771d1ef9d3861c7ea6675))
* **scripts:** standardize mise toolchain providers and fix pnpm setup ([5f8f030](https://github.com/snowdreamtech/template/commit/5f8f0309d42ac6158d865631c2c554bcc18a27d4))
* **scripts:** suppress redundant terminal execution summaries in local environment ([83776fd](https://github.com/snowdreamtech/template/commit/83776fd54d4fe6fe35c6a822c8907d2b7ed8a9d3))
* **scripts:** use absolute path prefix for gen-full-manifest in sync-lock.sh ([bb8401d](https://github.com/snowdreamtech/template/commit/bb8401df026f6389530b895a97950822431efa4a))
* **security:** add binary availability check after version match ([bec5038](https://github.com/snowdreamtech/template/commit/bec5038d8f52f187185c5c2647b38442d395ec5a))
* **security:** add dependabot cooldown config for zizmor compliance ([7394768](https://github.com/snowdreamtech/template/commit/739476828d7812d31505a3dea3d443ffec2d374f))
* **security:** add strict validation for all CI security tools ([721f8ef](https://github.com/snowdreamtech/template/commit/721f8efbea838617d18cdd62408930752f627e73))
* **security:** add strict zizmor validation in CI ([b6fd596](https://github.com/snowdreamtech/template/commit/b6fd59623c1286a6db9b3b206414ece7dd91a030))
* **security:** add version specifications to mise install calls ([f58a226](https://github.com/snowdreamtech/template/commit/f58a22612304e482bf58f9c64c2614a5574ecf47))
* **security:** check setup_registry return values for critical tools ([cf91e3a](https://github.com/snowdreamtech/template/commit/cf91e3a2ec2274f8335fb6e6863a008d15ceb137))
* **security:** complete universal egress sync and bootstrap hardening ([1f7aea5](https://github.com/snowdreamtech/template/commit/1f7aea5b6dfd7f998adaaabf171b0b45711cdeb0))
* **security:** extend mise.lock with Windows-x64 checksums for full cross-platform security ([8da506e](https://github.com/snowdreamtech/template/commit/8da506e9b56970578f9dd48e389b4899f7406cea))
* **security:** finalize global SHA-1 pinning for all 16 workflows ([2a14204](https://github.com/snowdreamtech/template/commit/2a1420406c5d80dcd14860dc7becc4919c50d8a7))
* **security:** fix OSV-scanner and Zizmor installation in CI ([683639e](https://github.com/snowdreamtech/template/commit/683639e1424d9762128cde26e3e7fad716cbcdef))
* **security:** formalize mise toolchain integrity standards ([fcc6026](https://github.com/snowdreamtech/template/commit/fcc602653556e39266b0b74cf9b7d45b0f4fb361))
* **security:** globally harmonize platinum-standard egress whitelists ([38f583c](https://github.com/snowdreamtech/template/commit/38f583c7e021db2df48647e54afd5b519efaecf9))
* **security:** implement fail-safe offline fallback for zizmor and fix binary scan logic ([35a0cd7](https://github.com/snowdreamtech/template/commit/35a0cd739563045365f2d6af1e5c4849b63510d5))
* **security:** implement MISE_LOCKED to prevent toolchain poisoning ([3aca5fa](https://github.com/snowdreamtech/template/commit/3aca5fa835300131470118b4e2b8c9249b9dfb11))
* **security:** implement mise.lock for cryptographic toolchain integrity ([14515fe](https://github.com/snowdreamtech/template/commit/14515fee125ed87c41b67b81a8a47af2986960a5))
* **security:** implement robust stealth binary detection in audit engine ([1c0f20d](https://github.com/snowdreamtech/template/commit/1c0f20ded821c5b44075cbd531af4dec1393b0a0))
* **security:** pin mise-action to immutable SHA-1 hash ([239ad6c](https://github.com/snowdreamtech/template/commit/239ad6c08655aa7bf8890a7f5a42fb84b38b3545))
* **security:** reach 100% universal platinum-standard egress sync ([1917d82](https://github.com/snowdreamtech/template/commit/1917d82dd69a730c948cba2b10430c14b2d5edb5))
* **security:** remediate zizmor finding and fix audit script ([b847843](https://github.com/snowdreamtech/template/commit/b8478438bc9ad2799a9071543476c7c55a12ea26))
* **security:** resolve literal newline artifact in scorecard.yml ([4b6a3af](https://github.com/snowdreamtech/template/commit/4b6a3af9738a3479c72e6b91c5471c3588f4c574))
* **security:** resolve Scorecard imposter commit error ([88e8bed](https://github.com/snowdreamtech/template/commit/88e8beded6f6fafccb39f7c5c209ad8b25a82630))
* **security:** resolve Scorecard Pinned-Dependencies and Token-Permissions warnings ([d5238a6](https://github.com/snowdreamtech/template/commit/d5238a6fd2a3a706358e323533ea08fd92839831))
* **security:** resolve syntax error in audit engine ([c222674](https://github.com/snowdreamtech/template/commit/c22267445a5a677fab2c0ee77e67af4db5057210))
* **security:** robustify zizmor token handling and binary audit logic ([2a327aa](https://github.com/snowdreamtech/template/commit/2a327aacbcd43be4c018cfc034c84a3c1810cbb5))
* **security:** universally synchronize egress whitelists with perfect formatting ([6ce96d8](https://github.com/snowdreamtech/template/commit/6ce96d8b94053b72030bddf9751035452042fff2))
* **security:** universally synchronize language repo whitelists ([e4b39ed](https://github.com/snowdreamtech/template/commit/e4b39edcc61e9853d63b1b104a9df613da441afc))
* **security:** widen egress whitelists for multi-distro linux support ([99dba63](https://github.com/snowdreamtech/template/commit/99dba63bfcb665451eba4bf694fc178c53fb2733))
* **setup:** add provider paths for lean, nim, racket, vala, and aptos ([c968143](https://github.com/snowdreamtech/template/commit/c968143d1199231c469ff9ad6919419b8c12aefe))
* **setup:** downgrade python to 3.12.3 and disable github proxy to prevent hangs ([4ef9873](https://github.com/snowdreamtech/template/commit/4ef98730f0f0c3f918b07657cdb92d45318cd8df))
* **setup:** ensure gitleaks installs in CI without .git directory ([9fb833d](https://github.com/snowdreamtech/template/commit/9fb833df3c5cbd2af280ebee4c3211ab16a2d858))
* **setup:** force reinstall non-executable tools in CI ([dee60a7](https://github.com/snowdreamtech/template/commit/dee60a74f8d22948bc55fca92a6d464eb131764d))
* **setup:** handle mise bin tools verification ([5c386fa](https://github.com/snowdreamtech/template/commit/5c386faae9715eeada52124c8315b71b7ad871de))
* **setup:** handle non-zero exit codes in smoke tests ([3fe6c05](https://github.com/snowdreamtech/template/commit/3fe6c054d4609b2263399b5df10d10f280919c2c))
* **setup:** improve network timeout reliability for large binary downloads ([432f092](https://github.com/snowdreamtech/template/commit/432f09206b8e2cad2a0aa148233c4975547a02b0))
* **setup:** resolve mise installation failure on Windows and unify pipx setup ([2ec9f9b](https://github.com/snowdreamtech/template/commit/2ec9f9bed0803737d8b194226acddc0b788569d7))
* **setup:** use full provider path for checkmake installation ([1e40c13](https://github.com/snowdreamtech/template/commit/1e40c1347e7ac53de9419198323d3a7ab69d8435))
* **setup:** use full provider path for gitleaks installation ([7577489](https://github.com/snowdreamtech/template/commit/757748915a041537148f71085f9e377731a00dfa))
* **setup:** use mise which for binary verification in CI ([ded29c1](https://github.com/snowdreamtech/template/commit/ded29c17cdd851f46808a02ad086264f1038eb71))
* **setup:** verify tool executability in CI, not just mise registration ([5404189](https://github.com/snowdreamtech/template/commit/5404189d1f65c4064fdd773764c93e004af550dc))
* **shell:** add error handling for shell tool installation in CI ([967b8bf](https://github.com/snowdreamtech/template/commit/967b8bf69800365810dc023fd44db8d1ef3b9479))
* **shell:** add version specifications to mise install calls ([b576a7f](https://github.com/snowdreamtech/template/commit/b576a7f3c21726a3efeb6b001c1ec05332900aac))
* **shell:** remove duplicate log_summary line causing syntax error ([d8f75d9](https://github.com/snowdreamtech/template/commit/d8f75d9078c2a05b41a7a1762c1fc093030c5f22))
* **shell:** restore missing functions and add aggressive cache refresh ([f89f7f0](https://github.com/snowdreamtech/template/commit/f89f7f0913ecb6e165f8072d6b88f985b672dbcb))
* skip executable permission check on Windows (POSIX compliant) ([e365e6a](https://github.com/snowdreamtech/template/commit/e365e6aa58b67f08d058cc0a5853c8991e2e71ef))
* **sql:** add version specification to mise install call ([cde5de5](https://github.com/snowdreamtech/template/commit/cde5de54c3a705463cc0c01cf94e0da170ebed06))
* sync GITHUB_PATH to current shell for same-step tool availability ([e51048d](https://github.com/snowdreamtech/template/commit/e51048d1fdfeb320ad9922a4efd162d2da4c2821))
* **terraform:** add version specification to mise install call ([b99fa5a](https://github.com/snowdreamtech/template/commit/b99fa5a5be116a53300620261fcc5471b6aa092f))
* **test:** enforce mock path priority in check-env.bats ([babd8df](https://github.com/snowdreamtech/template/commit/babd8df6dfd551800ce3b1d4599e36a5af96b7c5))
* **testing:** add version specification to mise install call ([e4f4820](https://github.com/snowdreamtech/template/commit/e4f48202b510007a926776884945bac35c64b742))
* **toolchain:** extend ALF to handle full mise install with go: tools ([fec200c](https://github.com/snowdreamtech/template/commit/fec200c1b6f746507c2e7318eb88b1a88f159afb))
* **toolchain:** lazy-load mise cache and harden BATS detection ([0e2fb32](https://github.com/snowdreamtech/template/commit/0e2fb32dceae867bbdf55c4232796c0a818652a6))
* **toolchain:** migrate addlicense to github backend to support locked mode ([cf8ea8b](https://github.com/snowdreamtech/template/commit/cf8ea8b9611c39822f440ce6ebc4bcdbd18ac80d))
* **toolchain:** optimize summary logging and resolve BATS test failures ([f9639cb](https://github.com/snowdreamtech/template/commit/f9639cb97d22b9babc8c441c976ab1b802a11b55))
* update VER_MISE to 2026.4.0 to avoid RelativeUrlWithoutBase bug ([f93b0b3](https://github.com/snowdreamtech/template/commit/f93b0b39fd293b7e4e9eb4b97169f80eb38aa6eb))
* **versions:** update checkmake version to v0.3.2 ([6d1edd8](https://github.com/snowdreamtech/template/commit/6d1edd8a6299af947daf989f9badafe6efcf8f3e))
* **windows:** check root directory in verify_tool_atomic fallback ([9e2ace6](https://github.com/snowdreamtech/template/commit/9e2ace6e8cf960c25f159e53ec5b3a2d9cce3904))
* **windows:** convert Unix paths to Windows format for GITHUB_PATH ([de515d6](https://github.com/snowdreamtech/template/commit/de515d6aa91c1392fea55529a2c40550499a721c))
* **windows:** improve mise path detection for Git Bash environments ([d5a5337](https://github.com/snowdreamtech/template/commit/d5a5337ff038f35428034a2969842f99851c6297))
* **windows:** replace log_info with echo for mise path logging ([0bd8ee1](https://github.com/snowdreamtech/template/commit/0bd8ee1a951a0491649188430bb3c99be3067a93))
* **windows:** replace log_info with echo in PATH persistence ([7710710](https://github.com/snowdreamtech/template/commit/77107107bd15904198cef7146fdfb923192c160d))
* **windows:** skip command check for binaries without .exe extension ([a5ed6ca](https://github.com/snowdreamtech/template/commit/a5ed6caebb29aa8555d704cb1d8dabf4ea384111))
* **windows:** skip executable permission checks in lint-wrapper ([035ae54](https://github.com/snowdreamtech/template/commit/035ae54f20404a7c66a1a07459efb1d77678ab3f))
* **windows:** split executable check to avoid test evaluation on Windows ([cc76373](https://github.com/snowdreamtech/template/commit/cc763732a359bd52681a19b277854ea6bbe826e2))
* **windows:** use Unix-style paths for GITHUB_PATH in bash shell ([4eacf60](https://github.com/snowdreamtech/template/commit/4eacf6088d780d4896a533f3fe6acc864e65a56f))
* **windows:** write both Unix and Windows path formats to GITHUB_PATH ([62a0acf](https://github.com/snowdreamtech/template/commit/62a0acf12d04b0bd49d0e53d0bc45d2b261426c0))
* **workflows:** comprehensive alignment with security and Makefile standards ([ee4114b](https://github.com/snowdreamtech/template/commit/ee4114b4d2b55edda9ab13b7dcb5c487cb2c5d15))
* **workflows:** convert Windows LOCALAPPDATA path for Git Bash ([ba9192a](https://github.com/snowdreamtech/template/commit/ba9192a8013a8956d9d925227bd48b88f3703fcd))
* **workflows:** standardize checkout naming and token injection ([f834d6c](https://github.com/snowdreamtech/template/commit/f834d6cac630efa7265f107c09bcf9657a667fdb))
* **zizmor:** ensure zizmor installs in CI regardless of workflow files presence ([9f6f620](https://github.com/snowdreamtech/template/commit/9f6f620ba69bc70304dbd7873ae9db2b5944ba76))
* **zizmor:** force reinstall in CI to guard against stale cache ([70597c2](https://github.com/snowdreamtech/template/commit/70597c227f45c9e7c0423768fc8d74323260f05b))
* **zizmor:** update repository from woodruffw to zizmorcore ([316a7cc](https://github.com/snowdreamtech/template/commit/316a7ccf6e3903022301ab3e3f11a4b866ed9484))


### Performance Improvements

* **infra:** implement lazy loading and unified refresh for mise cache ([f9e7aec](https://github.com/snowdreamtech/template/commit/f9e7aec490fb596525d362a79ef59726fc57bc90))
* **mise:** increase HTTP timeout to 300s for improved network reliability ([3335482](https://github.com/snowdreamtech/template/commit/3335482f99f98272149a30e831de066c11db87d2))
* **setup:** skip goreleaser installation in local dev to prevent setup hangs ([c95f801](https://github.com/snowdreamtech/template/commit/c95f80149c7440797995b872a27e3813079038bd))


### Documentation

* add comprehensive token usage audit report ([9983421](https://github.com/snowdreamtech/template/commit/9983421492acc679c2e27a2b01cdf3a6909c7ab9))


### Miscellaneous Chores

* remove temporary token audit report ([50a73c7](https://github.com/snowdreamtech/template/commit/50a73c7f88dbcf56332220a5941f6ca00f994bcd))


### Code Refactoring

* **ci:** standardize token usage across all workflows ([54b8445](https://github.com/snowdreamtech/template/commit/54b84456eb13b77b79cbbea32510405ec6f616b7))

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
