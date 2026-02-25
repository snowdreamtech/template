# LLM Prompt Engineering Guidelines

> Objective: Define standards for writing, versioning, testing, and managing LLM prompts to ensure reliability and reproducibility.

## 1. Prompt Structure

- **System Prompts**: Define the AI's role, persona, output format, constraints, and behavioral guardrails. Keep it precise and unambiguous. Overly long system prompts dilute focus.
- **User Prompts**: Provide clear context, explicit instructions, and one or more **few-shot examples** for complex tasks. Use delimiters to separate sections clearly.
- Use a consistent, documented template format for each prompt type:

  ```text
  ROLE: You are a ...
  TASK: Your task is to ...
  FORMAT: Return a JSON object with keys: ...
  CONSTRAINTS: Do not ...
  EXAMPLES:
    Input: ...
    Output: ...
  ```

- **Chain of Thought (CoT)**: For complex reasoning tasks, include `"Think step by step before answering."` in the prompt. This significantly improves accuracy on multi-step problems.

## 2. Version Control

- Treat prompts as code. Store all prompts in version-controlled files (e.g., `prompts/` directory). One file per prompt, with a clear naming convention: `{task}-{version}.md`.
- Use semantic versioning for prompt files: `summarize-v1.2.md`. Include the model name and parameter defaults the prompt was designed for in the file header.
- Maintain a **changelog** for prompt files: what changed, why it changed, and which model it was tested against. This is essential for root-cause analysis when quality regressions occur.

## 3. Safety & Security

- **Prompt Injection Defense**: Always sanitize and clearly delimit user-provided input before inserting it into a prompt. Use XML tags, JSON wrapping, or explicit separators:

  ```text
  <user_input>
  {{user_content}}
  </user_input>
  ```

- **Output Validation**: Never trust LLM output as safe or correct. Validate structured output (JSON, YAML) with a strict schema parser (Zod, Pydantic) before using it. Sanitize free-text output before rendering in a UI to prevent XSS.
- Never include API keys, PII, system architecture details, or internal hostnames in prompts sent to third-party LLM providers.
- Implement **output filtering** for harmful content when the application could be exposed to adversarial inputs.

## 4. Reproducibility & Parameter Control

- Log the model name, version, `temperature`, `top_p`, `max_tokens`, and seed alongside every prompt input/output pair for debugging and auditing.
- Use `temperature=0` (or the lowest supported value) for **deterministic tasks**: data extraction, classification, code generation. Use higher `temperature` for creative tasks.
- Pin the **model version** in production (e.g., `gpt-4o-2024-08-06`, not `gpt-4o`). Model aliases can change behavior silently with provider updates.
- Set explicit `max_tokens` limits to prevent runaway costs. Define per-call timeout budgets and implement hard cancellation.

## 5. Evaluation & Monitoring

- Define **measurable success criteria** before deploying any prompt. Examples: "JSON extraction accuracy ≥ 95%", "output always parseable as JSON", "PII leakage rate = 0%".
- Build an **evaluation dataset (golden set)** of representative input/expected-output pairs. Run regression tests against it whenever the prompt or model changes.
- Use systematic prompt evaluation tools: **PromptFoo**, **LangSmith**, or **Weights & Biases Prompts** for A/B testing and version comparison.
- Monitor production LLM calls for: **cost** (token consumption), **latency** (P50/P99), **error rate** (API failures, timeout), and **quality drift** (output format violations, embedding distance from expected output). Alert on unexpected changes.
- Implement **fallback strategies** for model outages: cached responses for common queries, graceful degradation to deterministic alternatives.
