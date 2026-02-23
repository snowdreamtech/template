# Flutter / Dart Development Guidelines

> Objective: Define standards for building high-quality, cross-platform Flutter applications.

## 1. Dart Language

- Use `const` constructors wherever possible to enable compile-time optimization and widget caching.
- Use `final` for all variables that are not reassigned. Avoid `var` for class-level fields.
- Use **null safety**. Avoid the `!` (bang) operator; use proper null checks, conditional access (`?.`), or late initialization (`late`).
- Use named parameters for functions and constructors with more than two arguments for readability.

## 2. Widget Architecture

- Keep widgets small and focused. Extract reusable UI pieces into separate `StatelessWidget` or `StatefulWidget` classes.
- Prefer **`StatelessWidget`** wherever possible. Use `StatefulWidget` only when local mutable state is necessary.
- Prefer composition over inheritance for building complex UI.

## 3. State Management

- Choose and consistently apply one state management solution (e.g., **Riverpod**, **Bloc/Cubit**, or **Provider**).
- Do not mix state management patterns in the same project.
- Keep business logic out of widgets. Delegate to ViewModels, Notifiers, or Blocs.

## 4. Performance

- Avoid rebuilding the entire widget tree unnecessarily. Use `const` widgets, `RepaintBoundary`, or `ValueListenableBuilder` to limit rebuilds.
- Use `ListView.builder` / `GridView.builder` for long lists — never `ListView(children: [...])` for dynamic data.
- Profile with Flutter DevTools (CPU, memory, widget rebuilds) before optimizing.

## 5. Testing

- Use `flutter_test` for widget and unit tests.
- Use `integration_test` for end-to-end tests on device.
- Run `flutter analyze` and `flutter test` in CI.
