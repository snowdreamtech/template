# C Language Development Guidelines

> Objective: Define standards for safe, portable, and maintainable C code.

## 1. C Standard & Warnings

- Target **C11** (`-std=c11`) for new projects. Use **C99** as the minimum for maximum portability to embedded and legacy platforms.
- Use `<stdint.h>` for **fixed-width integer types** (`uint8_t`, `int32_t`, `uint64_t`). Never rely on `int` or `long` having a specific size — it varies by platform and compiler.
- Enable all warnings and treat them as errors in CI: `gcc -Wall -Wextra -Wpedantic -Werror -Wformat=2 -Wshadow -Wconversion`.

## 2. Memory Safety

- Every `malloc()` / `calloc()` call **MUST check for a `NULL` return** before using the pointer. OOM conditions are real, especially on embedded systems.
- Every allocated resource **MUST have a corresponding `free()`**. Use structured ownership: document which function owns each allocation.
- Set pointers to `NULL` after `free()` to prevent use-after-free and double-free bugs.
- Use **AddressSanitizer** (`-fsanitize=address,leak`) and **Undefined Behavior Sanitizer** (`-fsanitize=undefined`) in CI builds. Use **Valgrind** for detailed memory analysis.

## 3. Pointers & Strings

- Prefer `const T *` for pointer parameters that should not modify the pointed-to data. Functions should be as `const`-correct as possible.
- **Never use `gets()`** (removed in C11). Always use `fgets(buf, sizeof(buf), stdin)` with an explicit buffer size.
- Use `snprintf()` over `sprintf()` for safe formatted string output.
- Use `strncat()` / `strncpy()` over `strcat()` / `strcpy()`. Consider using safer alternatives (`strlcat`, `strlcpy` on BSD/macOS, or equivalent on Linux).

## 4. Macros & Preprocessor

- Use `enum` or `static const T` instead of `#define` for typed constants — they participate in type checking.
- Always wrap multi-statement macros in `do { ... } while(0)` to make them behave like a single statement.
- Protect all header files with include guards (prefer `#pragma once` for modern compilers, or the traditional `#ifndef` guard):
  ```c
  #pragma once
  /* OR */
  #ifndef MY_HEADER_H
  #define MY_HEADER_H
  /* ... */
  #endif /* MY_HEADER_H */
  ```

## 5. Build & Tooling

- Use **CMake** as the primary build system for cross-platform projects. Structure with `src/`, `include/`, `tests/` directories.
- Format with **clang-format**. Lint with **clang-tidy** and **cppcheck**. Both run in CI.
- Use **Unity** or **cmocka** for unit testing. Aim for coverage of all public API functions.
- For security-critical code parsing untrusted input, add **fuzzing** with **AFL++** or **libFuzzer**.
