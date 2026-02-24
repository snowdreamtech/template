# Flutter / Dart Development Guidelines

> Objective: Define standards for building high-quality, cross-platform Flutter applications.

## 1. Dart Language

- Use `const` constructors wherever possible to enable compile-time optimization and widget-level caching. `const` widgets are never rebuilt unless their configuration changes.
- Use `final` for all variables that are not intended to be reassigned. Avoid `var` for class-level fields — prefer explicit types.
- Enable and embrace **Dart null safety**. Avoid the `!` (bang) null assertion operator. Prefer null checks (`if (x != null)`), conditional access (`?.`), or the null coalescing operator (`??`).
- Use named parameters for functions and constructors with more than two arguments. Use `required` keyword for mandatory named parameters.

## 2. Widget Architecture

- Keep widgets small and focused. Extract reusable UI pieces into separate `StatelessWidget` or `StatefulWidget` classes.
- Prefer **`StatelessWidget`** wherever possible. Use `StatefulWidget` only when local mutable state that affects the UI is necessary.
- Prefer composition over inheritance for building complex UI.
- Place business logic and data access in dedicated classes — not in `build()` methods. Widgets should be pure visual representations of state.

## 3. State Management

- Choose and consistently apply **one** state management solution across the project. Recommended options:
  - **Riverpod** (2.x) — for most apps. Compile-safe, testable, tree-independent.
  - **Bloc/Cubit** — for complex, event-driven state with strict unidirectional data flow.
  - **Provider** — for small apps or when migrating from Provider to Riverpod.
- Keep business logic out of widgets. Delegate to `AsyncNotifier`, `Cubit`, or equivalent.
- Use `ConsumerStatefulWidget` / `HookConsumerWidget` with Riverpod to integrate state into the widget tree.

## 4. Performance

- Use the **Flutter DevTools** Profiler (CPU, memory, widget rebuilds) before and after optimization. Never optimize guesses.
- Avoid rebuilding the entire widget tree unnecessarily. Use `const` widgets, `RepaintBoundary`, `ValueListenableBuilder`, or `select()` (Riverpod) to limit rebuilds.
- Use `ListView.builder` / `GridView.builder` for all lists of dynamic or unknown size — never `ListView(children: [...])` for more than a dozen items.
- Use `cached_network_image` for image caching. Use `flutter_svg` for SVG — never bundle large, high-res PNGs for icons.

## 5. Testing & Build

- Use **`flutter_test`** for unit and widget tests. Use `mockito` or `mocktail` for mocking dependencies.
- Use **`integration_test`** for end-to-end tests on a real device or emulator.
- Use **`golden_toolkit`** (or `alchemist`) for visual regression testing with golden files.
- Run in CI: `flutter analyze --fatal-warnings` (linting), `flutter test --coverage` (unit/widget tests), `dart run build_runner build` (code generation).
- Use **`flutter build` with `--obfuscate --split-debug-info`** flags for production release builds to reduce APK/IPA size and protect code.
