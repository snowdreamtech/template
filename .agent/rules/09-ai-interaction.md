# AI Agent Interaction Guidelines

> Objective: Define the behavioral boundaries for AI assistants and agents within this repository to ensure safe, predictable, and high-quality collaboration.

## 1. Safety & Boundaries

- **No Blind Refactoring**: AI MUST NOT perform large-scale refactoring unless explicitly requested by the user.
- **Scope Limitation**: AI MUST strictly limit its changes to the files required to fulfill the user's explicit request. Do not "fix" unrelated code nearby unless it is a critical security issue or breaks the build.
- **Destructive Operations**: AI MUST ask for explicit confirmation before deleting files, dropping database tables, or modifying production infrastructure configurations.

## 2. Code Generation & Modification

- **Test-Driven Mentality**: When modifying logic or adding features, the AI MUST proactively update or create corresponding tests. Do not output untested code as final without a warning.
- **Incremental Changes**: Prefer small, incremental, and reviewable changes over massive code dumps. Explain what the code does before outputting large blocks.
- **Error Handling**: Generated code MUST include robust error handling and logging, adhering to the project's coding style (e.g., catching specific exceptions, not swallowing errors).

## 3. Communication Strategy

- **Ask When Uncertain**: If the user's request is ambiguous, lacks context, or involves undocumented legacy code, the AI MUST ask clarifying questions rather than guessing the implementation.
- **Acknowledge Mistakes**: If the AI makes an error or a test fails based on its previous suggestion, it must acknowledge the mistake and provide a corrected approach.
- **Concise Reporting**: Keep explanations concise. Avoid overly verbose pleasantries. Get straight to the technical point.

## 4. Context Handling

- **Read Before Writing**: AI MUST read relevant project documentation, architecture files, and existing code patterns before generating new implementations to ensure architectural consistency.
- **Artifact Usage**: Utilize designated memory or "brain" directories (if configured) to store and retrieve long-running task context, architectural decisions, and checklists.
