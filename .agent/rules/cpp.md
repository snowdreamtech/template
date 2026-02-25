# C++ Development Guidelines

> Objective: Define standards for safe, performant, and maintainable modern C++ code.

## 1. Modern C++ Standards

- Target **C++20** for new projects. Use at minimum **C++17** for existing codebases. Leverage modern features: smart pointers, structured bindings, `std::optional`, `std::variant`, `std::string_view`, concepts, ranges, and coroutines.
- Avoid raw C-style patterns in modern C++: prefer `std::string` over `char*`, `std::vector` over raw arrays, `std::span` (C++20) over pointer+length pairs, and `std::format` (C++20) over `sprintf`.
- Follow the **C++ Core Guidelines** (by Bjarne Stroustrup and Herb Sutter). Use the GSL (Guidelines Support Library) for `gsl::not_null<T>`, `gsl::span`, etc.
- Enable and enforce compiler warnings in CI: `-Wall -Wextra -Werror -Wshadow -Wconversion -Wundef` (GCC/Clang). Compile with both GCC and Clang in CI to catch compiler-specific issues.
- Use **C++20 Modules** (`import std;`, `import mylib;`) for new large-scale projects to replace `#include` headers, reduce compilation times, and eliminate macro pollution. Ensure the build system (CMake 3.28+) supports modules.

## 2. Memory Management

- **Never use raw `new`/`delete`**. Apply RAII (Resource Acquisition Is Initialization) and smart pointers:
  - `std::unique_ptr<T>`: exclusive ownership (preferred default).
  - `std::shared_ptr<T>`: shared ownership with reference counting.
  - `std::make_unique<T>()` / `std::make_shared<T>()`: always use factory functions (exception-safe, no raw `new`).
- Prefer **stack allocation** over heap allocation. Only heap-allocate when the object's lifetime must extend beyond its lexical scope or when size is dynamic.
- Use **AddressSanitizer** (`-fsanitize=address`) and **UBSan** (`-fsanitize=undefined`) during development and in CI builds.
- Avoid cyclic `shared_ptr` references — break cycles with `std::weak_ptr`.

## 3. Safety & Undefined Behavior

- Use `std::array::at()` or `std::vector::at()` for bounds-checked access in debug/test builds (throws `std::out_of_range` on violation). Use `operator[]` only in hot paths where bounds are provably guaranteed.
- Avoid `reinterpret_cast` and `const_cast`. If unavoidable, add a comment precisely explaining why the cast is safe.
- Never use `std::memcpy` on non-trivially-copyable types. Check `std::is_trivially_copyable_v<T>` if in doubt.
- Use `[[nodiscard]]` on functions returning error codes or resource handles to prevent callers from silently ignoring return values.
- Prefer `std::optional<T>` over nullable raw pointers for optional return values.
- Use **`std::expected<T, E>`** (C++23) for error-propagating functions that need a typed error alongside the result, as a cleaner alternative to exceptions or `std::pair<T, Error>`.

## 4. Build System & Dependencies

- Use **CMake** (3.20+) as the primary build system. Use `target_compile_features(my_target PUBLIC cxx_std_20)` to enforce the C++ standard. Use `target_compile_options` for per-target warning flags.
- Use **vcpkg** or **Conan** for dependency management. Do not vendor dependencies by manually copying source code into the repository.
- Format with **clang-format** (commit `.clang-format` to the repository). Lint with **clang-tidy** (commit `.clang-tidy`). Enforce both in CI.
- Generate `compile_commands.json` (`-DCMAKE_EXPORT_COMPILE_COMMANDS=ON`) for accurate IDE analysis and clang-tidy integration.

## 5. Testing & Fuzzing

- Use **Catch2** (modern, header-optional) or **Google Test (gtest)** for unit tests. Structure tests to mirror the source directory layout.
- Run all tests in CI with sanitizers enabled: `cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined"`.
- Use **`std::ranges`** and algorithms instead of raw loops wherever possible — they are safer, more expressive, and easier to test in isolation.
- For security-critical code parsing untrusted input (file formats, network protocols), add **fuzzing** with **libFuzzer** or **AFL++**.
- Use **Valgrind memcheck** for detailed memory error analysis on Linux builds. Use **DrMemory** on Windows.
