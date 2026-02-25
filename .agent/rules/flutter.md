# Flutter / Dart Development Guidelines

> Objective: Define standards for building high-quality, cross-platform Flutter applications.

## 1. Dart Language

- Use `const` constructors wherever possible to enable compile-time optimization and widget-level caching. `const` widgets are never rebuilt unless their configuration changes.
- Use `final` for all variables that are not intended to be reassigned. Avoid `var` for class-level fields — prefer explicit types.
- Enable and embrace **Dart null safety**. Avoid the `!` (bang) null assertion operator. Prefer null checks (`if (x != null)`), conditional access (`?.`), or the null coalescing operator (`??`).
- Use named parameters for functions and constructors with more than two arguments. Use the `required` keyword for mandatory named parameters.
- Use Dart's collection operators: `spread` (`...`), `if` in collection literals, and `for` in collection literals for clean, declarative data construction.

## 2. Widget Architecture

- Keep widgets small and focused. Extract reusable UI pieces into separate `StatelessWidget` or `StatefulWidget` classes. A single widget file should ideally do one thing.
- Prefer **`StatelessWidget`** wherever possible. Use `StatefulWidget` only when local mutable state that affects the UI is necessary.
- Prefer composition over inheritance for building complex UI.
- Place business logic and data access in dedicated classes — not in `build()` methods. Widgets should be pure visual representations of state.
- Use `RepaintBoundary` to isolate frequently repainted subtrees (e.g., animations, progress indicators) from the rest of the widget tree.

## 3. State Management

- Choose and consistently apply **one** state management solution across the project. Recommended options:
  - **Riverpod** (2.x) — for most apps. Compile-safe, testable, tree-independent. Preferred.
  - **Bloc/Cubit** — for complex, event-driven state with strict unidirectional data flow.
  - **Provider** — for small apps or when migrating from Provider to Riverpod.
- Keep business logic out of widgets. Delegate to `AsyncNotifier`, `Cubit`, or equivalent.
- Use `ConsumerStatefulWidget` / `HookConsumerWidget` with Riverpod to integrate state into the widget tree.
- Use `ref.watch()` for reactive reads and `ref.read()` for one-shot reads in event handlers. Never use `ref.read()` during the build phase.

## 4. Performance

- Use the **Flutter DevTools** Profiler (CPU, memory, widget rebuilds) before and after optimization. Never optimize based on guesses.
- Avoid rebuilding the entire widget tree unnecessarily. Use `const` widgets, `RepaintBoundary`, `ValueListenableBuilder`, or Riverpod's `select()` to limit rebuild scope.
- Use `ListView.builder` / `GridView.builder` / `SliverList.builder` for all lists of dynamic or unknown size — never `ListView(children: [...])` for more than a dozen items.
- Use `cached_network_image` for image caching and proper placeholder/error states. Use `flutter_svg` for SVG icons.

## 5. Testing & Build

- Use **`flutter_test`** for unit and widget tests. Use `mockito` or `mocktail` for mocking dependencies.
- Use **`integration_test`** for end-to-end tests on a real device or emulator in CI.
- Use **`golden_toolkit`** (or `alchemist`) for visual regression testing with golden files. Update golden files deliberately.
- Run in CI: `flutter analyze --fatal-warnings` (linting), `flutter test --coverage` (unit/widget tests), `dart run build_runner build` (code generation with `freezed`, `json_serializable`, etc.).
- Use **`flutter build` with `--obfuscate --split-debug-info=./debug_info`** for production release builds. Upload `*.symbols` files to Sentry or Firebase Crashlytics for de-obfuscation of crash stacks.
