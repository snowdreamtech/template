# LLM Prompt Engineering Guidelines

> Objective: Define standards for writing, versioning, and managing LLM prompts to ensure reliability and reproducibility.

## 1. Prompt Structure

- **System Prompts**: Define the AI's role, persona, constraints, and output format in the system prompt. Keep it concise and unambiguous.
- **User Prompts**: Provide clear context, examples (few-shot), and explicit instructions for the desired output.
- Use a consistent, documented template format for each prompt type (e.g., `ROLE:`, `TASK:`, `FORMAT:`, `CONSTRAINTS:`).

## 2. Version Control

- Treat prompts as code. Store all prompts in version-controlled files (e.g., `.prompts/` directory).
- Use semantic versioning for prompt files (e.g., `summarize-v1.2.md`).
- Document changes to prompts in a changelog. Note the model version the prompt was tested against.

## 3. Safety & Security

- **Prompt Injection**: Sanitize and delimit user-provided input before inserting it into a prompt (use XML tags, JSON wrapping, or clear delimiters like `---`).
- **Output Validation**: Never trust LLM output as safe. Validate structured output (JSON) with a schema parser. Sanitize free-text output before rendering in a UI.
- Do not include API keys, PII, or sensitive system information in prompts.

## 4. Reproducibility

- Log the model name, version, temperature, and all parameters alongside prompt inputs/outputs for debugging.
- Set `temperature=0` (or the lowest value) for deterministic tasks (e.g., classification, data extraction). Use higher values for creative tasks.

## 5. Evaluation

- Define measurable success criteria for each prompt before deploying it.
- Build an evaluation dataset (golden set) and run regression tests against it when a prompt or model changes.
