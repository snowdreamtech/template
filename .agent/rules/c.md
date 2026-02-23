# C Language Development Guidelines

> Objective: Define standards for safe, portable, and maintainable C code.

## 1. C Standard

- Target **C11** (`-std=c11`) for new projects. Use `C99` as the minimum for maximum portability.
- Include `<stdint.h>` for fixed-width integer types (`uint8_t`, `int32_t`, `uint64_t`). Never rely on `int` or `long` having a specific size.
- Enable all warnings and treat them as errors in CI: `gcc -Wall -Wextra -Wpedantic -Werror`.

## 2. Memory Safety

- Every `malloc()` / `calloc()` call MUST check for a `NULL` return before using the pointer.
- Every allocated resource MUST have a corresponding `free()`. Use structured ownership patterns to track who is responsible for freeing memory.
- Set pointers to `NULL` after freeing them to prevent use-after-free bugs.
- Use **Valgrind** and **AddressSanitizer** (`-fsanitize=address`) in CI to detect memory errors.

## 3. Pointers & Strings

- Prefer `const T *` for pointers that should not modify the pointed-to data.
- Never use `gets()` (removed in C11). Always use `fgets()` with an explicit buffer size.
- Always null-terminate strings explicitly. Prefer `snprintf()` over `sprintf()` for safe formatted output.
- Use `strncat()` / `strncpy()` over `strcat()` / `strcpy()`.

## 4. Macros & Preprocessor

- Use `enum` or `static const` instead of `#define` for typed constants.
- Always wrap multi-statement macros in `do { ... } while(0)`.
- Protect header files with include guards:
  ```c
  #ifndef MY_HEADER_H
  #define MY_HEADER_H
  /* ... */
  #endif /* MY_HEADER_H */
  ```

## 5. Build & Tooling

- Use **CMake** or **Makefile** as the build system.
- Format with **clang-format**. Lint with **clang-tidy** or **cppcheck**.
- Use **Unity** or **cmocka** for unit testing.
