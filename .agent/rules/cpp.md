# C++ Development Guidelines

> Objective: Define standards for safe, performant, and maintainable modern C++ code, covering language standards, memory management, safety, build systems, and testing.

## 1. Modern C++ Standards

### Version Selection

- Target **C++20** for new projects. Require at minimum **C++17** for existing codebases. Use modern features:
  - **Smart pointers**: `std::unique_ptr`, `std::shared_ptr`, `std::weak_ptr`
  - **Structured bindings**: `auto [key, value] = *it;`
  - **`std::optional<T>`**: for optional return values (replaces nullable pointers)
  - **`std::variant<Ts...>`**: type-safe discriminated unions
  - **`std::string_view`**: non-owning string reference (avoids copies)
  - **Concepts** (C++20): constrain template parameters expressively
  - **Ranges** (C++20): composable algorithm pipelines
  - **Coroutines** (C++20): stackless async operations
  - **`std::format`** (C++20): type-safe string formatting over `sprintf`
- Avoid C-style patterns in modern C++:
  - `char*` → `std::string` or `std::string_view`
  - Raw arrays → `std::array<T, N>` or `std::vector<T>`
  - Pointer+length pairs → `std::span<T>` (C++20)
  - `sprintf` → `std::format` or `std::snprintf`
- Follow the **C++ Core Guidelines** by Bjarne Stroustrup and Herb Sutter. Use the **GSL** (Guidelines Support Library) for `gsl::not_null<T>`, `gsl::span`.

### Compiler Warnings

- Enable and enforce comprehensive warnings in CI:

  ```cmake
  target_compile_options(mylib PRIVATE
    -Wall -Wextra -Wpedantic -Werror
    -Wshadow -Wconversion -Wundef -Wnull-dereference
    $<$<CXX_COMPILER_ID:Clang>:-Wweak-vtables -Wold-style-cast>
  )
  ```

- Compile with **both GCC and Clang** in CI. They catch different issues.
- Use **C++20 Modules** for new large-scale projects to reduce compilation times and eliminate macro pollution. Requires CMake 3.28+ with module support.

## 2. Memory Management & RAII

### Smart Pointers (Never Use `new`/`delete` Directly)

- Apply **RAII (Resource Acquisition Is Initialization)** uniformly. Use smart pointers — never raw `new`/`delete`:

  ```cpp
  // ❌ Raw new/delete — error-prone
  Widget* w = new Widget(args);
  if (error) { delete w; return; }  // easy to forget on error paths
  delete w;

  // ✅ unique_ptr — single owner, automatic cleanup
  auto w = std::make_unique<Widget>(args);  // no raw new
  // w is automatically destroyed on scope exit, RAII-safe

  // ✅ shared_ptr — shared ownership with reference counting
  auto shared = std::make_shared<HeavyResource>();
  auto copy   = shared;  // reference count = 2
  ```

- **Always use factory functions** `std::make_unique<T>()` and `std::make_shared<T>()` — they are exception-safe and prevent resource leaks in combined expressions.
- Avoid cyclic `shared_ptr` references — break cycles with **`std::weak_ptr`**:

  ```cpp
  struct Node {
    std::shared_ptr<Node> next;    // owns next
    std::weak_ptr<Node>   parent;  // observes parent — no cycle
  };
  ```

### Stack vs Heap

- Prefer **stack allocation** over heap allocation. Only heap-allocate when the object's lifetime must extend beyond its lexical scope, when the size is dynamic, or when polymorphism requires it.
- Use `std::array<T, N>` for fixed-size arrays on the stack. Use `std::vector<T>` for dynamically-sized contiguous storage on the heap.

### Memory Sanitizers

- Run CI tests with **AddressSanitizer** and **Undefined Behavior Sanitizer**:

  ```cmake
  if(CMAKE_BUILD_TYPE STREQUAL "Sanitize")
    add_compile_options(-fsanitize=address,undefined -fno-omit-frame-pointer -g -O1)
    add_link_options(-fsanitize=address,undefined)
  endif()
  ```

- Use **Valgrind memcheck** on Linux builds for detailed memory error analysis. Use **ThreadSanitizer** (`-fsanitize=thread`) to detect data races.

## 3. Safety & Undefined Behavior

- Use **`std::vector::at()`** or **`std::array::at()`** for bounds-checked access in debug/test builds (throws `std::out_of_range`). Use `operator[]` only in hot paths where bounds are provably known.
- Avoid **`reinterpret_cast`**, **`const_cast`**, and C-style casts. If unavoidable, add a comment precisely explaining the invariants that make the cast safe:

  ```cpp
  // SAFETY: `bytes` is a `struct Packet` serialized via `memcpy` — trivially copyable
  const Packet* pkt = reinterpret_cast<const Packet*>(bytes.data());
  ```

- Use **`[[nodiscard]]`** on functions returning error codes or resource handles to prevent silent ignore:

  ```cpp
  [[nodiscard]] std::expected<Config, ParseError> parse_config(std::string_view path);

  // Compiler warns if result is not used:
  parse_config("config.json");  // ⚠️ warning: ignoring return value of [[nodiscard]]
  ```

- Use **`std::optional<T>`** for optional return values instead of nullable raw pointers. Use **`std::expected<T, E>`** (C++23) for error-propagating functions with typed errors.
- Never use `std::memcpy` on non-trivially-copyable types — verify with `std::is_trivially_copyable_v<T>`.

## 4. Build System & Dependencies

### CMake

- Use **CMake** (≥ 3.20) as the primary build system. Use modern target-based CMake:

  ```cmake
  cmake_minimum_required(VERSION 3.20)
  project(MyLib VERSION 1.0.0 LANGUAGES CXX)

  # Library target
  add_library(mylib STATIC src/mylib.cpp)
  target_include_directories(mylib PUBLIC include)
  target_compile_features(mylib PUBLIC cxx_std_20)
  target_compile_options(mylib PRIVATE -Wall -Wextra -Werror)

  # Executable target
  add_executable(myapp cmd/main.cpp)
  target_link_libraries(myapp PRIVATE mylib)

  # Tests
  find_package(Catch2 REQUIRED)
  add_executable(mylib_test tests/test_mylib.cpp)
  target_link_libraries(mylib_test PRIVATE mylib Catch2::Catch2WithMain)
  enable_testing()
  add_test(NAME unit COMMAND mylib_test)
  ```

- Set `-DCMAKE_EXPORT_COMPILE_COMMANDS=ON` for `compile_commands.json`, enabling IDE analysis and clang-tidy integration.

### Dependency Management

- Use **vcpkg** or **Conan** for dependency management. Never manually copy source code into the repository.
- Format with **clang-format** (commit `.clang-format`). Lint with **clang-tidy** (commit `.clang-tidy`). Enforce in CI:

  ```bash
  clang-format --dry-run --Werror $(find src include -name "*.cpp" -o -name "*.hpp")
  clang-tidy $(find src -name "*.cpp") -- -std=c++20 -Iinclude
  ```

## 5. Testing & Fuzzing

### Unit Testing

- Use **Catch2** (header-optional, expressive macros) or **Google Test (gtest)** for unit tests:

  ```cpp
  // With Catch2
  TEST_CASE("UserParser — valid JSON", "[parser]") {
    SECTION("parses name and email") {
      auto result = parseUser(R"({"name":"Alice","email":"alice@example.com"})");
      REQUIRE(result.has_value());
      CHECK(result->name == "Alice");
    }
    SECTION("returns error for invalid JSON") {
      auto result = parseUser("not json");
      REQUIRE_FALSE(result.has_value());
    }
  }
  ```

- Run all tests in CI with sanitizers enabled:

  ```bash
  cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined" -DCMAKE_BUILD_TYPE=Debug ..
  ctest --output-on-failure
  ```

- Use **`std::ranges`** and algorithm pipelines over raw loops where possible — they are more expressive, composable, and testable:

  ```cpp
  // ✅ Range pipeline — explicit intent, no loop variable
  auto admins = users

    | std::views::filter([](const User& u) { return u.role == Role::Admin; })
    | std::views::transform(&User::email)
    | std::ranges::to<std::vector>();

  ```

### Fuzzing

- For security-critical code parsing untrusted input (file formats, network protocols, config parsers), add **fuzzing** with **libFuzzer**:

  ```cpp
  extern "C" int LLVMFuzzerTestOneInput(const uint8_t* data, size_t size) {
    std::string input(reinterpret_cast<const char*>(data), size);
    auto result = parsePacket(input);
    (void)result;  // Sanitizers catch crashes/UB
    return 0;
  }
  ```

  ```bash
  clang++ -fsanitize=fuzzer,address src/parser.cpp tests/fuzz_parser.cpp -o fuzz_parser
  ./fuzz_parser -timeout=60 -max_total_time=3600 corpus/
  ```
