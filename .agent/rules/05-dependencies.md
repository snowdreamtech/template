# Dependency & Release Guidelines

> Objective: Ensure dependencies are reproducible and auditable, and define the release process.

## 1. Locking & Versioning

- Lock files (`package-lock.json` / `poetry.lock` / `Pipfile.lock`, etc.) MUST be committed.
- Prefer exact versions for dependencies (do not use broad `^`/`~` fuzzy strategies unless there is a clear reason).

## 2. Dependency Sources

- Prioritize official registries. Use internal proxies/caches (e.g., Nexus, Artifactory) when necessary.
- Downloading external resources requires a retry mechanism and verification (checksum/signature).

## 3. Release Process

- Clearly define the release branch strategy (e.g., main=production, develop=pre-release).
- Releases MUST pass CI testing and approval (at least one code reviewer).

## 4. Dependency Review

- Regularly review critical dependencies. Introducing unreviewed runtime code is prohibited (wheel and prebuilt binaries must have verified sources).
