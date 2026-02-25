# Flutter / Dart Development Guidelines

> Objective: Define standards for building high-quality, cross-platform Flutter applications, covering Dart language features, widget architecture, state management, performance, testing, and build configuration.

## 1. Dart Language

### Type Safety & Style

- Use **`const` constructors** wherever possible to enable compile-time optimization and widget-level caching. Const widgets are instantiated once and are never rebuilt unless configuration actually changes:

  ```dart
  // ✅ const — created once, shared and reused
  const SizedBox(height: 16);
  const Padding(padding: EdgeInsets.all(16.0), child: MyWidget());

  // ❌ Not const — allocates new object every rebuild
  Padding(padding: EdgeInsets.all(16.0), child: MyWidget());
  ```

- Use **`final`** for all variables that are not reassigned. Avoid `var` for class-level fields — prefer explicit types for documentation and type safety:

  ```dart
  // ✅ Explicit and final
  final String userId;
  final List<Order> orders;

  // ❌ var for fields — loses documentation value
  var userId;
  ```

- Enable and embrace **Dart null safety**. Avoid the `!` (bang) null assertion operator — it can throw `Null check operator used on a null value` at runtime:

  ```dart
  // ❌ Can crash at runtime
  final name = user!.displayName!.trim();

  // ✅ Safe null handling
  final name = user?.displayName?.trim() ?? 'Anonymous';
  ```

- Use **named parameters** with `required` for functions and constructors with more than two arguments. This makes call sites self-documenting:
  ```dart
  // ✅ Named params — readable and enforced
  UserCard(
    userId:   user.id,
    name:     user.displayName,
    onTap:    () => navigatorTo(user),
    trailing: buildTrailingWidget(user),
  )
  ```

### Modern Dart Features

- Use **Dart Records** (Dart 3+) for lightweight, immutable value objects:

  ```dart
  // Named record fields — more readable
  typedef UserSummary = ({String name, String email, UserRole role});

  UserSummary summary = (name: 'Alice', email: 'alice@example.com', role: UserRole.viewer);
  print(summary.name);
  ```

- Use **Pattern Matching** and sealed classes (Dart 3+) for exhaustive state handling:

  ```dart
  sealed class AuthState {}
  class Authenticated   extends AuthState { final User user; Authenticated(this.user); }
  class Unauthenticated extends AuthState {}
  class Loading         extends AuthState {}

  // Compiler verifies exhaustiveness
  Widget build(BuildContext context) {
    return switch(authState) {
      Authenticated(:final user) => HomePage(user: user),
      Unauthenticated()          => LoginPage(),
      Loading()                  => const LoadingSpinner(),
    };
  }
  ```

- Use Dart collection operators: **spread** (`...`), **if** in collection literals, and **for** in collection literals:
  ```dart
  final items = [
    ...baseItems,
    if (isAdmin) adminMenuItem,
    for (final tag in tags) TagChip(tag: tag),
  ];
  ```

## 2. Widget Architecture

### Component Design

- Keep widgets **small and focused**. Extract reusable UI pieces into separate widget classes. A single widget file should ideally do one thing:

  ```dart
  // ✅ Small, composable widget
  class UserAvatarStack extends StatelessWidget {
    const UserAvatarStack({required this.users, this.maxVisible = 3, super.key});

    final List<User> users;
    final int maxVisible;

    @override
    Widget build(BuildContext context) { ... }
  }
  ```

- Prefer **`StatelessWidget`** wherever possible. Use `StatefulWidget` only when local mutable state (that affects the UI, is ephemeral, and does not need to survive navigation) is required.
- Place business logic and data access in dedicated classes — never in `build()` methods. Widgets should be pure visual representations of state.
- Use **`RepaintBoundary`** to isolate frequently repainted subtrees (animations, progress indicators, video players) from the rest of the widget tree:
  ```dart
  RepaintBoundary(child: AnimatedProgressRing(progress: value))
  ```
- Use **`freezed`** + **`json_serializable`** for immutable data models with copyWith, serialization, and pattern matching:

  ```dart
  @freezed
  class User with _$User {
    const factory User({ required String id, required String name, required String email, UserRole role = UserRole.viewer }) = _User;

    factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  }
  ```

## 3. State Management

### Tool Selection

- Choose and consistently apply **one** state management solution. Recommended options by use case:
  - **Riverpod 2.x** — for most apps. Compile-safe, testable, widget-tree-independent. Preferred default.
  - **Bloc/Cubit** — for complex, event-driven state with strict unidirectional data flow requirements.
  - **Provider** — for small apps, or when migrating incrementally from Provider to Riverpod.

### Riverpod Patterns

- Keep business logic out of widgets — delegate to `AsyncNotifier`, `Notifier`, or `StateNotifier`:

  ```dart
  @riverpod
  class UserProfileNotifier extends _$UserProfileNotifier {
    @override
    Future<User?> build(String userId) async {
      return ref.watch(userRepositoryProvider).findById(userId);
    }

    Future<void> updateName(String name) async {
      state = const AsyncValue.loading();
      state = await AsyncValue.guard(() =>
        ref.read(userRepositoryProvider).updateName(userId: arg, name: name)
      );
    }
  }
  ```

- Use `ref.watch()` for reactive reads in `build()`. Use `ref.read()` only in event handlers and callbacks — never during build:

  ```dart
  // In build — reactive (auto-rebuilds on change):
  final user = ref.watch(userProfileProvider(userId));

  // In onTap handler — one-shot read:
  onTap: () => ref.read(userProfileNotifierProvider(userId).notifier).updateName(name),
  ```

- Use `select()` to minimize rebuilds when only a subset of state changes:
  ```dart
  final name = ref.watch(userProvider.select((user) => user.name));
  ```
- Use **`flutter_hooks`** (`HookWidget`, `HookConsumerWidget`) to encapsulate stateful widget logic into composable hook functions.

## 4. Performance

### Build Optimization

- Use **Flutter DevTools** Profiler (CPU, memory, widget rebuild tracking) before and after optimizations. Never optimize based on assumptions.
- Use `ListView.builder`, `GridView.builder`, `SliverList.builder` for all dynamic-size lists — never `ListView(children: [...])` for more than a dozen items.
- Use `cached_network_image` for remote image caching with placeholder and error states. Use `flutter_svg` for SVG rendering.
- Use **`compute()`** to offload heavy computation to a background isolate, keeping the UI thread smooth:
  ```dart
  final parsedData = await compute(parseHeavyJson, rawJsonString);
  ```
- Use **`dart:isolate`** or `IsolateNameServer` for long-running, CPU-intensive background operations.

## 5. Testing & Build

### Testing

- Use **`flutter_test`** for unit and widget tests. Use `mocktail` (preferred) or `mockito` for mocking:
  ```dart
  testWidgets('UserCard shows user name', (tester) async {
    await tester.pumpWidget(
      MaterialApp(home: UserCard(user: fakeUser)),
    );
    expect(find.text('Alice'), findsOneWidget);
    expect(find.byIcon(Icons.verified), findsNothing);
  });
  ```
- Use **`integration_test`** for end-to-end tests on real device or emulator in CI.
- Use **`golden_toolkit`** or **`alchemist`** for visual regression testing with golden image snapshots. Update golden files deliberately and version-control them.

### CI & Production Builds

- Run in CI:
  ```bash
  flutter analyze --fatal-warnings     # linting
  flutter test --coverage               # unit + widget tests
  dart run build_runner build --delete-conflicting-outputs  # code gen (freezed, json_serializable)
  flutter test integration_test/        # E2E (requires emulator)
  ```
- Use production release builds with obfuscation and debug symbol splitting:
  ```bash
  flutter build apk --release --obfuscate --split-debug-info=./debug_info
  flutter build ios --release --obfuscate --split-debug-info=./debug_info
  ```
  Upload `*.symbols` files and `app.dSYM` to **Sentry** or **Firebase Crashlytics** for crash stack de-obfuscation in production.
- Use **Shorebird** for OTA (Over-the-Air) code push to update Flutter apps without going through the app store review process.
