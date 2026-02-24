# C++ Development Guidelines

> Objective: Define standards for safe, performant, and maintainable modern C++ code.

## 1. Modern C++ Standards

- Target **C++20** for new projects. Use at minimum **C++17** for existing codebases. Leverage modern features: smart pointers, structured bindings, `std::optional`, `std::variant`, `std::string_view`, concepts, and ranges.
- Avoid raw C-style patterns in modern C++: prefer `std::string` over `char*`, `std::vector` over raw arrays, `std::span` (C++20) over pointer+length pairs, and `std::format` (C++20) over `sprintf`.
- Follow the **C++ Core Guidelines** (by Bjarne Stroustrup and Herb Sutter). Use the GSL (Guidelines Support Library) for `gsl::not_null<T>`, `gsl::span`, etc.

## 2. Memory Management

- **Never use raw `new`/`delete`**. Apply RAII (Resource Acquisition Is Initialization) and smart pointers:
  - `std::unique_ptr<T>`: exclusive ownership (preferred default).
  - `std::shared_ptr<T>`: shared ownership.
  - `std::make_unique<T>()` / `std::make_shared<T>()`: always use factory functions.
- Prefer **stack allocation** over heap allocation. Only heap-allocate when the object's lifetime must extend beyond its lexical scope.
- Use **AddressSanitizer** (`-fsanitize=address`) and **UBSan** (`-fsanitize=undefined`) during development and in CI.

## 3. Safety & Undefined Behavior

- Enable and enforce compiler warnings in CI: `-Wall -Wextra -Werror -Wshadow -Wconversion` (GCC/Clang).
- Use `std::array::at()` or `std::vector::at()` for bounds-checked access in debug/test builds (throws `std::out_of_range` on violation). Use `operator[]` only in hot paths where bounds are guaranteed.
- Avoid `reinterpret_cast` and `const_cast`. If unavoidable, add a comment documenting precisely why it is safe.
- Never use `std::memcpy` on non-trivially-copyable types.

## 4. Build System & Dependencies

- Use **CMake** (3.20+) as the primary build system. Use `target_compile_features(my_target PUBLIC cxx_std_20)` to enforce the standard.
- Use **vcpkg** or **Conan** for dependency management. Do not vendor dependencies by manually copying source code into the repository.
- Format with **clang-format** (commit `.clang-format` to the repository). Lint with **clang-tidy** (commit `.clang-tidy`). Enforce both in CI to prevent style debates.

## 5. Testing & Fuzzing

- Use **Catch2** (modern, header-optional) or **Google Test (gtest)** for unit tests.
- Run all tests in CI with sanitizers enabled: `cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined"`.
- For security-critical code parsing untrusted input (file formats, network protocols), add **fuzzing** with **libFuzzer** or **AFL++**.
- Use **Valgrind memcheck** for detailed memory error analysis on Linux builds.
