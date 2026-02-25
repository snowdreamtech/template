# C Language Development Guidelines

> Objective: Define standards for safe, portable, and maintainable C code, covering C standards, memory safety, pointer discipline, build systems, and security tooling.

## 1. C Standard, Compiler Configuration & Portability

### Standard Selection

- Target **C11** (`-std=c11`) for new projects — use `_Static_assert`, anonymous structs/unions, and improved Unicode/threading support.
- Use **C99** as the minimum for maximum portability to embedded and legacy platforms where C11 compilers are unavailable.
- Use **`<stdint.h>`** for fixed-width integer types: `uint8_t`, `int16_t`, `uint32_t`, `int64_t`. Never rely on `int`, `long`, or `short` having a specific size — these vary by platform, data model (LP64, ILP64, LLP64), and compiler:

  ```c
  // ❌ Platform-dependent size
  int  counter = 0;       // 16, 32, or 64 bits depending on platform
  long offset  = 0L;      // 32 or 64 bits

  // ✅ Explicit, portable sizes
  uint32_t counter = 0;
  int64_t  offset  = 0;
  size_t   length  = 0;   // for sizes/counts — always unsigned
  ptrdiff_t diff   = 0;   // for pointer differences — always signed
  ```

### Compiler Warnings as Errors

- Enable comprehensive warnings and treat them as errors in CI:

  ```makefile
  CFLAGS = -std=c11 -Wall -Wextra -Wpedantic -Werror \
           -Wformat=2 -Wshadow -Wconversion -Wundef \
           -Wstrict-prototypes -Wmissing-prototypes \
           -Wwrite-strings -Wuninitialized
  ```

- Compile with **both GCC and Clang** in CI to catch compiler-specific bugs and maximize portability (`CC=gcc make && CC=clang make`).
- Use `_Static_assert(sizeof(int) >= 4, "int must be at least 32 bits")` for compile-time invariant checks.

## 2. Memory Safety

### Allocation & Ownership

- Every **`malloc()`/`calloc()`/`realloc()`** call MUST check for `NULL` before use. OOM conditions are real on embedded systems and under memory pressure:

  ```c
  // ✅ Always check allocation result
  uint8_t *buf = malloc(n * sizeof(uint8_t));
  if (buf == NULL) {
      perror("malloc");
      return ERR_NOMEM;
  }

  // Prefer calloc() for zero-initialized arrays
  int *arr = calloc(count, sizeof(int));
  if (arr == NULL) { return ERR_NOMEM; }
  ```

- Document **ownership** clearly in comments: which function or struct owns each allocation and is responsible for freeing it. Use a consistent naming pattern (e.g., `*_create()` allocs, `*_destroy()` frees):

  ```c
  // Caller owns the returned Connection — must call connection_destroy()
  Connection *connection_create(const char *host, uint16_t port);
  void connection_destroy(Connection *conn);
  ```

- Set pointers to `NULL` immediately after `free()` to prevent use-after-free and double-free bugs:

  ```c
  free(buf);
  buf = NULL;  // prevents accidental use-after-free
  ```

- Prefer **stack allocation** for small, fixed-size objects. Heap-allocate only when the object lifetime must outlive its lexical scope, or when size is dynamic/large.

### Memory Error Detection

- Always run CI tests with **AddressSanitizer** (`-fsanitize=address,leak`) and **Undefined Behavior Sanitizer** (`-fsanitize=undefined`):

  ```makefile
  sanitize:
   $(CC) $(CFLAGS) -fsanitize=address,leak,undefined -g -O1 src/*.c -o bin/sanitized_test
   ./bin/sanitized_test
  ```

- Use **Valgrind** (`valgrind --leak-check=full --error-exitcode=1 ./test`) for detailed memory analysis on Linux.
- Use **`-fsanitize=thread`** (ThreadSanitizer) to detect data races in multithreaded code.

## 3. Pointers & Strings

### Const Correctness

- Apply **`const`** to pointer parameters that must not modify the pointed-to data. This is documentation and enables compiler optimizations:

  ```c
  // ✅ const-correct — caller knows str won't be modified
  size_t count_chars(const char *str, char target);

  // ✅ Both levels: pointer immutable, and data immutable
  int process_config(const Config * const cfg);
  ```

### Safe String Operations

- **Never use `gets()`** — it was removed in C11 for a reason (buffer overflow). Use `fgets(buf, sizeof(buf), stdin)` with explicit buffer size.
- Use **`snprintf()`** over `sprintf()` for all formatted string output:

  ```c
  // ❌ Buffer overflow
  char msg[64];
  sprintf(msg, "User: %s", username);

  // ✅ Bounded — cannot overflow
  char msg[64];
  snprintf(msg, sizeof(msg), "User: %s", username);
  ```

- Use `strncpy()` with size limit, or implement an explicit-length copy. Note: `strncpy()` may not null-terminate — always set the last byte: `buf[sizeof(buf) - 1] = '\0'`.
- Avoid pointer arithmetic beyond array bounds. Never dereference a pointer more than `(array + length)`.

## 4. Macros & Preprocessor

- Use **`enum`** or **`static const T`** instead of `#define` for typed constants — they participate in type checking, scope, and are visible to debuggers:

  ```c
  // ❌ No type, no scope
  #define MAX_CONNECTIONS 1024

  // ✅ Typed, scoped constant
  static const uint32_t MAX_CONNECTIONS = 1024;

  // ✅ Enum for related constants
  typedef enum { HTTP_OK = 200, HTTP_NOT_FOUND = 404, HTTP_ERROR = 500 } HttpStatus;
  ```

- Wrap multi-statement macros in **`do { ... } while(0)`** to make them work correctly in `if`/`else` chains:

  ```c
  // ❌ Breaks with if/else
  #define LOG_ERROR(msg) fprintf(stderr, msg); error_count++;

  // ✅ Safe in all contexts
  #define LOG_ERROR(msg) do { fprintf(stderr, "%s\n", msg); error_count++; } while(0)
  ```

- Protect all header files from double inclusion:

  ```c
  #pragma once          // preferred on modern compilers
  /* OR traditional guard: */
  #ifndef MY_HEADER_H
  #define MY_HEADER_H
  /* ... */
  #endif /* MY_HEADER_H */
  ```

- Minimize macro usage. Prefer `inline` functions for type safety and debuggability. Use macros only for functionality that genuinely cannot be expressed as a function (stringification, token pasting, X-macros).

## 5. Build, Testing & Security

### Build System

- Use **CMake** (≥ 3.20) as the primary build system for cross-platform projects:

  ```cmake
  cmake_minimum_required(VERSION 3.20)
  project(mylib VERSION 1.0.0 LANGUAGES C)

  add_library(mylib STATIC src/mylib.c)
  target_include_directories(mylib PUBLIC include)
  target_compile_features(mylib PRIVATE c_std_11)
  target_compile_options(mylib PRIVATE
    -Wall -Wextra -Wpedantic -Werror
    $<$<CONFIG:Debug>:-fsanitize=address,undefined>
  )

  add_executable(mylib_test tests/test_mylib.c)
  target_link_libraries(mylib_test PRIVATE mylib)
  enable_testing()
  add_test(NAME unit_test COMMAND mylib_test)
  ```

- Set `-DCMAKE_EXPORT_COMPILE_COMMANDS=ON` to generate `compile_commands.json` for IDE analysis and clang-tidy integration.
- Format with **clang-format** (commit `.clang-format`). Lint with **clang-tidy** (commit `.clang-tidy`). Enforce both in CI:

  ```bash
  clang-format --dry-run --Werror src/**/*.c include/**/*.h
  clang-tidy src/*.c -- -std=c11 -Iinclude
  ```

### Testing

- Use **Unity** (embedded-friendly) or **cmocka** (mock support) for unit testing. Test all public API functions. Run tests with sanitizers enabled.
- For security-critical code parsing untrusted input (file formats, network protocols, config parsers), add **fuzzing** with **AFL++** or **libFuzzer**:

  ```bash
  # LibFuzzer target
  clang -fsanitize=fuzzer,address src/parser.c tests/fuzz_parser.c -o fuzz_parser
  ./fuzz_parser -timeout=60 -max_total_time=3600 corpus/
  ```

- Use **`cppcheck`** for additional static analysis: `cppcheck --enable=all --error-exitcode=1 src/`.
- Run `nm -u` on your objects to audit external symbol dependencies. Use `size` to measure code/data section sizes for embedded targets.

### Portability & Cross-Platform Considerations

- Write portable C by avoiding compiler-specific extensions unless explicitly required. Guard extensions with macros:

  ```c
  /* Compiler-agnostic branch prediction hints */
  #ifdef __GNUC__
  #  define LIKELY(x)   __builtin_expect(!!(x), 1)
  #  define UNLIKELY(x) __builtin_expect(!!(x), 0)
  #else
  #  define LIKELY(x)   (x)
  #  define UNLIKELY(x) (x)
  #endif
  ```

- Handle **endianness** explicitly for network protocols and binary file formats. Never cast `int*` to read multi-byte network data:

  ```c
  #include <stdint.h>

  /* Read a big-endian 32-bit integer portably */
  uint32_t read_be32(const uint8_t *buf) {
      return ((uint32_t)buf[0] << 24)
           | ((uint32_t)buf[1] << 16)
           | ((uint32_t)buf[2] <<  8)
           |  (uint32_t)buf[3];
  }
  ```

- Use `<stdint.h>` fixed-width types for protocol fields and data-structure layouts. Use `size_t` for sizes and array indices, `ptrdiff_t` for pointer differences, and `intptr_t` / `uintptr_t` for pointer-to-integer conversions.
- CI MUST build on at least **two distinct target platforms** (e.g., x86-64 Linux and ARM64 Linux) and with at least two compilers (GCC and Clang) to catch platform-specific bugs early.
