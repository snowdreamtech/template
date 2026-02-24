# LLM Prompt Engineering Guidelines

> Objective: Define standards for writing, versioning, testing, and managing LLM prompts to ensure reliability and reproducibility.

## 1. Prompt Structure

- **System Prompts**: Define the AI's role, persona, output format, constraints, and behavioral guardrails. Keep it precise and unambiguous. Overly long system prompts dilute focus.
- **User Prompts**: Provide clear context, explicit instructions, and one or more **few-shot examples** for complex tasks. Use delimiters to separate sections clearly.
- Use a consistent, documented template format for each prompt type:
  ```
  ROLE: You are a ...
  TASK: Your task is to ...
  FORMAT: Return a JSON object with keys: ...
  CONSTRAINTS: Do not ...
  EXAMPLES:
    Input: ...
    Output: ...
  ```

## 2. Version Control

- Treat prompts as code. Store all prompts in version-controlled files (e.g., `.prompts/` or `prompts/` directory).
- Use semantic versioning for prompt files: `summarize-v1.2.md`. Include the model and parameters the prompt was designed for.
- Maintain a **changelog** for prompt files. Record: what changed, why it changed, and which model version it was tested against.

## 3. Safety & Security

- **Prompt Injection Defense**: Sanitize and clearly delimit user-provided input before inserting it into a prompt. Use XML tags, JSON wrapping, or explicit separators:
  ```
  <user_input>
  {{user_content}}
  </user_input>
  ```
- **Output Validation**: Never trust LLM output as safe or correct. Validate structured output (JSON) with a strict schema parser (Zod, Pydantic). Sanitize free-text output before rendering in a UI.
- Never include API keys, PII, system architecture details, or other sensitive information in prompts.

## 4. Reproducibility & Parameter Control

- Log the model name, version, temperature, `top_p`, `max_tokens`, and seed alongside every prompt input/output for debugging and auditing.
- Use `temperature=0` (or the lowest value) for **deterministic tasks**: data extraction, classification, code generation. Use higher values for creative tasks.
- Pin the **model version** in production (e.g., `gpt-4o-2024-08-06`, not `gpt-4o`). Model aliases can change behavior silently with provider updates.

## 5. Evaluation & Testing

- Define **measurable success criteria** for every prompt before deploying it. Examples: "extraction accuracy ≥ 95%", "output format always parseable as JSON".
- Build an **evaluation dataset (golden set)** of input/expected-output pairs. Run regression tests against it whenever the prompt or model changes.
- Track evaluation metrics over time. Use tools like **PromptFoo**, **LangSmith**, or **W&B Prompts** for systematic prompt evaluation and A/B testing.
- Monitor production LLM calls for cost, latency, error rate, and output quality drift. Alert on unexpected changes.
