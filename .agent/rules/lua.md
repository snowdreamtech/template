# Lua Development Guidelines

> Objective: Define standards for clean, performant, and maintainable Lua scripting.

## 1. Scope & Variables

- **Always declare variables as `local`**. Global variables in Lua pollute the shared environment and are a major source of bugs. There should be no global state unless absolutely required.
- Use `local M = {}; return M` (module pattern) to encapsulate related functions and avoid polluting globals.

## 2. Idiomatic Lua

- Use `~=` for "not equal" (not `!=`).
- Table indices are **1-based** by convention. Follow this for all sequences.
- Use the `#` operator for sequence length, but be aware it is undefined for tables with `nil` holes. For sparse tables, use explicit length tracking.
- Use `and`/`or` for short-circuit logic: `local x = value or default` is idiomatic for defaults.

## 3. Tables as Everything

- Tables are Lua's only data structure. Use them as arrays, dictionaries, objects, and modules consistently.
- Prefer array-style tables (`{1, 2, 3}`) for ordered data and hash-style tables (`{key = value}`) for named data. Do not mix in one table without good reason.

## 4. Error Handling

- Use `pcall(func, ...)` or `xpcall(func, handler, ...)` to catch runtime errors without crashing.
- Return errors as a second value (`return nil, "error message"`) rather than throwing them for expected failure conditions.

## 5. Performance

- Cache frequently accessed global functions in local variables at the top of functions or files (e.g., `local pairs = pairs`) — local variable access is significantly faster in Lua.
- Avoid creating large numbers of short-lived tables in hot loops; prefer reusing pre-allocated tables.
- Use **LuaJIT** where performance is critical and the runtime allows it.
