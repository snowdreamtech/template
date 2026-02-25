# 🚨 CRITICAL SYSTEM INSTRUCTION 🚨

Before answering ANY prompt or executing ANY code in this repository,
you **MUST** first read and strictly adhere to ALL the rules defined
in the following directory:

## Step 1: Read ALL Core Rule Files

📁 `.agent/rules/` — Read in numerical order:

1. `.agent/rules/01-general.md` — Language, communication, idempotency, cross-platform, network, security & audit
2. `.agent/rules/02-coding-style.md` — Commit messages, code quality, error handling, documentation, naming conventions
3. `.agent/rules/03-architecture.md` — Project structure, AI IDE integration, design principles
4. `.agent/rules/04-security.md` — Credentials, access control, encryption, scanning, incident response
5. `.agent/rules/05-dependencies.md` — Locking, integrity, auditing, release process, changelog
6. `.agent/rules/06-ci-testing.md` — Test types, CI pipeline, test data, fast feedback, quality gates
7. `.agent/rules/07-git.md` — Commits, branching, pull requests, code review, history hygiene
8. `.agent/rules/08-dev-env.md` — Environment consistency, dev container, scripts, pre-commit hooks, debugging
9. `.agent/rules/09-ai-interaction.md` — Safety boundaries, code generation, communication, context handling, quality
10. `.agent/rules/10-ui-ux.md` — Styling, componentization, accessibility, performance, i18n (frontend projects only)
11. `.agent/rules/11-deployment.md` — Containerization, secrets, deployment pipeline, IaC, observability & DR

## Step 2: Read Relevant Language & Framework Rule Files

After reading the core rules, **inspect the project's file structure and configuration files** (e.g., `package.json`, `go.mod`, `Cargo.toml`, `pom.xml`, `pyproject.toml`, `*.csproj`) to identify the languages and frameworks in use.

Then read the corresponding rule files from `.agent/rules/`:

### Languages

| Detected | Rule File |
| ---------- | ----------- |
| JavaScript | `.agent/rules/javascript.md` |
| TypeScript | `.agent/rules/typescript.md` |
| Python | `.agent/rules/python.md` |
| Go | `.agent/rules/go.md` |
| Rust | `.agent/rules/rust.md` |
| Java | `.agent/rules/java.md` |
| Kotlin | `.agent/rules/kotlin.md` |
| C# | `.agent/rules/csharp.md` |
| Swift | `.agent/rules/swift.md` |
| PHP | `.agent/rules/php.md` |
| Ruby | `.agent/rules/ruby.md` |
| Scala | `.agent/rules/scala.md` |
| Elixir | `.agent/rules/elixir.md` |
| Lua | `.agent/rules/lua.md` |
| R | `.agent/rules/r.md` |
| C | `.agent/rules/c.md` |
| C++ | `.agent/rules/cpp.md` |
| Shell/Bash | `.agent/rules/shell.md` |
| HTML | `.agent/rules/html.md` |
| CSS | `.agent/rules/css.md` |
| SQL | `.agent/rules/sql.md` |
| GraphQL | `.agent/rules/graphql.md` |

### Frameworks & Libraries

| Detected | Rule File |
| ---------- | ----------- |
| Node.js | `.agent/rules/node.md` |
| Bun | `.agent/rules/bun.md` |
| Deno | `.agent/rules/deno.md` |
| React | `.agent/rules/react.md` |
| Next.js | `.agent/rules/nextjs.md` |
| Vue | `.agent/rules/vue.md` |
| Nuxt | `.agent/rules/nuxt.md` |
| Angular | `.agent/rules/angular.md` |
| Svelte | `.agent/rules/svelte.md` |
| Astro | `.agent/rules/astro.md` |
| Remix | `.agent/rules/remix.md` |
| Express | `.agent/rules/express.md` |
| NestJS | `.agent/rules/nestjs.md` |
| Hono | `.agent/rules/hono.md` |
| tRPC | `.agent/rules/trpc.md` |
| FastAPI | `.agent/rules/fastapi.md` |
| Django | `.agent/rules/django.md` |
| Flask | `.agent/rules/flask.md` |
| Rails | `.agent/rules/rails.md` |
| Laravel | `.agent/rules/laravel.md` |
| Spring / Spring Boot | `.agent/rules/spring.md` |
| Gin | `.agent/rules/gin.md` |
| Echo | `.agent/rules/echo.md` |
| Fiber | `.agent/rules/fiber.md` |
| Chi | `.agent/rules/chi.md` |
| Beego | `.agent/rules/beego.md` |
| go-zero | `.agent/rules/go-zero.md` |
| Kratos | `.agent/rules/kratos.md` |
| Actix-web | `.agent/rules/actix-web.md` |
| Axum | `.agent/rules/axum.md` |
| Flutter | `.agent/rules/flutter.md` |
| Prisma | `.agent/rules/prisma.md` |
| GORM | `.agent/rules/gorm.md` |
| SQLAlchemy | `.agent/rules/sqlalchemy.md` |
| gRPC | `.agent/rules/grpc.md` |
| WebAssembly | `.agent/rules/wasm.md` |

### Infrastructure & Data

| Detected | Rule File |
| ---------- | ----------- |
| Docker | `.agent/rules/docker.md` |
| Kubernetes | `.agent/rules/kubernetes.md` |
| Terraform | `.agent/rules/terraform.md` |
| Ansible | `.agent/rules/ansible.md` |
| GitHub Actions | `.agent/rules/github-actions.md` |
| PostgreSQL | `.agent/rules/postgresql.md` |
| MySQL | `.agent/rules/mysql.md` |
| MongoDB | `.agent/rules/mongodb.md` |
| Redis | `.agent/rules/redis.md` |
| Elasticsearch | `.agent/rules/elasticsearch.md` |
| Data Engineering | `.agent/rules/data-engineering.md` |
| Monitoring (Prometheus/Grafana) | `.agent/rules/monitoring.md` |

### Additional Topics

| Topic | Rule File |
| ------- | ----------- |
| API Design (REST/HTTP) | `.agent/rules/api-design.md` |
| Accessibility (a11y) | `.agent/rules/accessibility.md` |
| LLM Prompt Engineering | `.agent/rules/llm-prompt.md` |

## Why This File Exists

This project uses a **unified rule system** to ensure consistent AI behavior
across all AI-powered IDEs and tools (Cursor, Windsurf, GitHub Copilot,
Cline, Claude, Gemini, Trae, Roo Code, Augment, Amazon Q, Kiro,
Continue, Junie, etc.). This file is a redirect entry point —
the actual rules live in `.agent/rules/` as the Single Source of Truth.

> **Failure to follow the rules inside `.agent/rules/` is completely unacceptable.**
