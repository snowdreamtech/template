# C / C++ Development Guidelines

> Objective: Define standards for safe, performant, and maintainable C and C++ code.

## 1. Modern C++ Standards

- Target **C++17** or **C++20** for new projects. Use modern features: smart pointers, range-based for loops, structured bindings, `std::optional`, `std::variant`, and concepts (C++20).
- Avoid raw C-style code in modern C++ projects: prefer `std::string` over `char*`, `std::vector` over raw arrays, and smart pointers over raw `new`/`delete`.

## 2. Memory Management

- **Never use raw `new`/`delete`**. Use RAII and smart pointers: `std::unique_ptr` (exclusive ownership), `std::shared_ptr` (shared ownership).
- Prefer stack allocation over heap allocation. Only allocate on the heap when the lifetime must outlast the scope.
- Use **Valgrind** or **AddressSanitizer** (`-fsanitize=address`) during development to detect memory leaks and undefined behavior.

## 3. Safety & Undefined Behavior

- Enable compiler warnings and treat them as errors in CI: `-Wall -Wextra -Werror` (GCC/Clang).
- Use **`-fsanitize=undefined`** (UBSan) to catch undefined behavior at runtime during testing.
- Avoid `reinterpret_cast` and `const_cast` unless absolutely necessary with a clear comment explaining why.
- Use `at()` instead of `operator[]` for bounds-checked container access in debug/test builds.

## 4. Build System & Tooling

- Use **CMake** as the build system. Structure projects with clearly separated `src/`, `include/`, and `tests/` directories.
- Use **vcpkg** or **Conan** for dependency management. Do not vendor dependencies by copying source code.
- Format with **clang-format** and lint with **clang-tidy**. Enforce both in CI.

## 5. Testing

- Use **Catch2** or **Google Test (gtest)** for unit tests.
- Run tests with sanitizers enabled in CI (`-fsanitize=address,undefined`).
- Use **fuzzing** (libFuzzer, AFL++) for security-critical code that handles untrusted input.
