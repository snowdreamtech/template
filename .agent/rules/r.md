# R Development Guidelines

> Objective: Define standards for reproducible, clean, and collaborative R code (data science and statistics).

## 1. Project Structure

- Use the **`{renv}`** package for dependency management to ensure reproducibility. Commit `renv.lock`.
- Organize projects using the **`{targets}`** pipeline framework or a clear directory structure:
  ```
  R/           # Scripts and functions
  data/raw/    # Original, immutable raw data
  data/processed/  # Transformed data
  output/      # Figures, tables, reports
  reports/     # R Markdown / Quarto documents
  ```
- Never modify raw data files. All transformations must be scripted.

## 2. Code Style

- Follow the **tidyverse style guide**. Use `snake_case` for all variable and function names.
- Use the **pipe operator** (`|>` native pipe or `%>%` from magrittr) for readable data transformation chains.
- Limit line length to 80 characters.
- Lint with **`{lintr}`** in CI.

## 3. Functions

- Write small, single-purpose functions. Document all exported functions with **`{roxygen2}`** (`#'` comments).
- Use `stopifnot()` or `{checkmate}` for input validation at the start of functions.
- Avoid using `<<-` (global assignment from within a function) as it creates hidden side effects.

## 4. Reproducibility

- Set a random seed (`set.seed()`) at the start of any script involving randomness.
- Use **R Markdown** or **Quarto** for all reports that combine code, output, and narrative.
- Run scripts with `Rscript` in CI to validate the full pipeline end-to-end.

## 5. Data Handling

- Use **`{dplyr}`** and **`{tidyr}`** for data manipulation.
- Never hard-code file paths. Use `here::here()` to construct paths relative to the project root.
- Prefer `readr::read_csv()` over `read.csv()` for consistent parsing behavior and faster speeds.
