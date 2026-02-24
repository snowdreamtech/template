# Lua Development Guidelines

> Objective: Define standards for clean, performant, and maintainable Lua scripting.

## 1. Scope & Variables

- **Always declare variables as `local`**. Global variables in Lua pollute the shared environment and are a major source of bugs in large scripts and embedded environments (nginx/OpenResty, Redis scripting, game engines).
- Use the **module pattern** to encapsulate functions and return a public API — avoid modifying `_G` (the global table):

  ```lua
  local M = {}

  function M.public_func() ... end
  local function private_func() ... end  -- not exported

  return M
  ```

## 2. Idiomatic Lua

- Use `~=` for "not equal" (not `!=`).
- Table indices are **1-based** by convention. Follow this for all sequences.
- Use the `#` length operator for sequences, but be aware: it is **undefined for tables with `nil` holes** (sparse tables). For sparse tables, track length explicitly.
- Use `and`/`or` for short-circuit defaults: `local x = value or default` is idiomatic. Be aware: if `value` is `false`, this returns `default` unexpectedly — use an explicit `if` check for boolean values.

## 3. Tables & OOP

- Tables are Lua's only composite data structure. Use them consistently as arrays, dictionaries, namespaces, and objects.
- For OOP, use metatables and `__index` to implement class-like behavior. Prefer simple prototypal inheritance over complex class hierarchies.
- Prefer array-style tables (`{1, 2, 3}`) for ordered data and hash-style tables for named data. Do not mix in one table without good reason.

## 4. Error Handling

- Use **`pcall(func, ...)`** or **`xpcall(func, handler, ...)`** to catch runtime errors without crashing the Lua VM.
- Return errors as a second return value (`return nil, "error message"`) for expected failure conditions. This is idiomatic Lua (not exception-style).
- In OpenResty/nginx Lua contexts, use `ngx.log(ngx.ERR, msg)` for logging and `ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)` for error responses.

## 5. Performance

- Cache frequently accessed standard library functions in local variables at the top of performance-sensitive files: `local pairs, ipairs, tostring = pairs, ipairs, tostring`. Local variable access is significantly faster than global table lookups in Lua.
- Avoid creating large numbers of short-lived tables in hot loops — Lua's GC has overhead. Pre-allocate and reuse tables where possible.
- Use **LuaJIT** where performance is critical and the runtime allows it (LuaJIT can be 10-100x faster than standard Lua 5.x for numerical code).
