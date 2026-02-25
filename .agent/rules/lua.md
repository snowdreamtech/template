# Lua Development Guidelines

> Objective: Define standards for clean, performant, and maintainable Lua scripting across embedding environments (OpenResty/nginx, Redis, game engines), covering scoping, idioms, OOP, error handling, performance, and testing.

## 1. Scope, Variables & Module Pattern

- **Always declare variables as `local`**. Global variables in Lua pollute the shared environment (`_G`) and are a primary source of bugs, especially in embedded environments (OpenResty/nginx, Redis scripting, game engines, embedded firmware):

  ```lua
  -- ❌ Bad: pollutes _G
  count = 0
  function process() ... end

  -- ✅ Good: local scope
  local count = 0
  local function process() ... end
  ```

- Use the **module pattern** to encapsulate all functions and data, returning only the public API. Never modify `_G` to export symbols:

  ```lua
  -- my_module.lua
  local M = {}

  -- Private — not exported
  local function validate(value)
    return type(value) == "string" and #value > 0
  end

  -- Public API
  function M.process(input)
    assert(validate(input), "input must be a non-empty string")
    return input:upper()
  end

  function M.version()
    return "1.2.0"
  end

  return M
  ```

- The `local M = {}` pattern makes the module table the only global, which is then returned to the `require()` caller. Consumers use `local mod = require("my_module"); mod.process(...)`.
- Use `local` at every scope level: inside `if` blocks, `for` loops, `while` loops, and nested functions. Narrower scope reduces bugs and improves garbage collection efficiency.
- Avoid `require()` inside functions or loops — it is called at the top of the file. `require()` results are cached in `package.loaded`; re-requiring is cheap, but calling it in hot loops adds table lookup overhead.

## 2. Idiomatic Lua

- Use `~=` for "not equal" (not `!=` — Lua has no `!=`), `and`/`or`/`not` for boolean operators (not `&&`/`||`/`!`).
- Table indices are **1-based** by convention. All standard library functions (`table.insert`, `ipairs`, `string.sub`) use 1-based indexing. Follow this consistently to interoperate with the standard library.
- Use `#` for sequence length, but be aware of its undefined behavior with **sparse tables** (tables with `nil` holes): `local count = #arr`. For sparse tables or hash tables, track length explicitly with a counter variable.
- Use `and`/`or` idiom for defaults, with the important caveat:

  ```lua
  -- ✅ Works for non-boolean values
  local name = config.name or "default"

  -- ❌ Bug: if `value` is `false`, this returns "default" incorrectly
  local enabled = config.enabled or true  -- Bug! false or true = true

  -- ✅ Correct for booleans
  local enabled = config.enabled ~= nil and config.enabled or true
  -- Or more clearly:
  local enabled = (config.enabled ~= nil) and config.enabled or true
  ```

- Prefer `table.concat()` for building strings in loops — concatenation with `..` inside a loop creates O(n²) intermediate strings:

  ```lua
  -- ❌ O(n²) allocations
  local result = ""
  for i = 1, 1000 do result = result .. items[i] end

  -- ✅ O(n) with table.concat
  local parts = {}
  for i = 1, 1000 do parts[#parts + 1] = items[i] end
  local result = table.concat(parts, ", ")
  ```

- Use `tostring()` and `tonumber()` explicitly for type conversions. Lua auto-coerces between strings and numbers in arithmetic, but explicit conversion is clearer and avoids surprises.
- Use `string.format()` for formatted output: `local msg = string.format("value: %d, name: %s", count, name)`.

## 3. Tables & Object-Oriented Programming

- Tables are Lua's **only** composite data structure — they serve as arrays, dictionaries, namespaces, objects, modules, and classes. Master them.
- For OOP, use **metatables** and the `__index` metamethod for prototypal inheritance:

  ```lua
  local Animal = {}
  Animal.__index = Animal

  function Animal.new(name, sound)
    local self = setmetatable({}, Animal)
    self.name = name
    self.sound = sound
    return self
  end

  function Animal:speak()
    return string.format("%s says %s", self.name, self.sound)
  end

  -- Inheritance
  local Dog = setmetatable({}, { __index = Animal })
  Dog.__index = Dog

  function Dog.new(name)
    local self = Animal.new(name, "Woof")
    return setmetatable(self, Dog)
  end

  function Dog:fetch(item)
    return string.format("%s fetches the %s!", self.name, item)
  end

  -- Usage
  local d = Dog.new("Rex")
  print(d:speak())    -- Rex says Woof
  print(d:fetch("ball")) -- Rex fetches the ball!
  ```

- Use `self.field` (dot) for data access and `self:method()` (colon) for method calls. The colon syntax is syntactic sugar for `self.method(self, ...)`.
- Prefer array-style tables (`{1, 2, 3}`) for ordered sequences. Use hash-style tables (`{name = "Alice", age = 30}`) for records. Do not mix styles unless there is a clear design reason.
- Use `pairs()` to iterate hash tables (arbitrary order), `ipairs()` to iterate arrays (in-order, stops at first nil).

## 4. Error Handling

- Use **`pcall(func, ...)`** to call functions in protected mode, capturing errors without crashing the Lua VM:

  ```lua
  local ok, result = pcall(function()
    return parse_config(filename)
  end)
  if not ok then
    -- result contains the error message
    log.error("config parse failed: " .. tostring(result))
    return nil, "configuration error"
  end
  return result
  ```

- Use **`xpcall(func, handler, ...)`** when you want to run a custom error handler (e.g., to add stack trace information):

  ```lua
  local function error_handler(err)
    return debug.traceback(err, 2)
  end

  local ok, result = xpcall(risky_operation, error_handler)
  ```

- Return errors as a second value for **expected failure conditions** — this is the idiomatic Lua convention:

  ```lua
  -- ✅ Idiomatic: return nil + error message
  local function read_file(path)
    local f, err = io.open(path, "r")
    if not f then
      return nil, string.format("failed to open '%s': %s", path, err)
    end
    local content = f:read("*a")
    f:close()
    return content
  end

  -- Caller checks result
  local content, err = read_file("/etc/config.json")
  if not content then
    log.error(err)
    return
  end
  ```

- In **OpenResty/nginx** Lua contexts:
  - Use `ngx.log(ngx.ERR, "error: ", msg)` for logging
  - Use `ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)` to terminate the request with an error
  - Use `ngx.ctx` (request-scoped table) to pass values across phases

## 5. Performance, Testing & Tooling

### Performance

- Cache frequently accessed standard library functions and table fields in `local` variables at the top of performance-critical files or hot functions. Local variable access is ~2-3× faster than global table lookup in standard Lua:

  ```lua
  -- At the top of the module or function
  local pairs, ipairs, type, tostring = pairs, ipairs, type, tostring
  local str_format, str_sub, str_len = string.format, string.sub, string.len
  local tbl_insert, tbl_concat = table.insert, table.concat
  local math_floor, math_max = math.floor, math.max
  ```

- Avoid creating large numbers of short-lived tables or closures in hot loops. Lua's GC (generational in Lua 5.4) handles this, but frequent micro-allocation still impacts throughput. Pre-allocate and reuse tables:

  ```lua
  -- Reuse a scratch table instead of creating a new one each iteration
  local scratch = {}
  for i = 1, 1000000 do
    scratch.x, scratch.y = compute(i)
    process(scratch)
  end
  ```

- Use **LuaJIT** where performance is critical and the runtime supports it. LuaJIT can be 10–100× faster than standard Lua on x86_64 for numerical and loop-heavy code. LuaJIT supports `ffi.cdecl` for calling C functions with near-zero overhead.
- Use `table.move()` (Lua 5.3+) for bulk table operations instead of manual loops:

  ```lua
  -- Copy array elements [1..n] from src to dst starting at dst[1]
  table.move(src, 1, #src, 1, dst)
  ```

- Profile with `jit.p` (LuaJIT profiler), `lprof`, or timing wrappers before optimizing. Premature micro-optimization harms readability without measurable benefit.

### Testing

- Use **`busted`** (BDD-style) for unit and integration testing Lua modules:

  ```lua
  -- spec/my_module_spec.lua
  local M = require("my_module")

  describe("my_module.process", function()
    it("converts string to uppercase", function()
      assert.are.equal("HELLO", M.process("hello"))
    end)

    it("errors on empty string", function()
      assert.has_error(function() M.process("") end)
    end)
  end)
  ```

  Run with: `busted --coverage spec/`

- Use **`luacheck`** for static analysis and linting. Commit `.luacheckrc` to enforce project rules:

  ```lua
  -- .luacheckrc
  std = "lua54"
  globals = { "ngx", "jit" }          -- allow OpenResty/LuaJIT globals
  max_line_length = 120
  ignore = { "212" }                   -- unused argument (when intentional)
  ```

  Integrate `luacheck` into CI as a hard gate: `luacheck . --no-cache`.
- For **OpenResty/nginx** projects, use the `lua-resty-*` ecosystem for Redis, MySQL, HTTP clients. Test with:
  - `Test::Nginx` (Perl-based integration tests for nginx Lua code)
  - `resty` CLI for quick function testing
  - Docker-based nginx test environments for full integration testing
- Use **`lua-coverage`** or `busted --coverage` to measure test coverage. Aim for ≥ 80% coverage on all exported module functions.

### Tooling & Environment

- Pin the Lua version in CI (`lua5.4`, `luajit2.1`). Use `hererocks` or `luaenv` for version management.
- Use **LuaRocks** as the package manager. Pin package versions in a `rockspec` file committed to the repository. Use a local rockspec for project-specific dependencies.
- Document all public module functions with `---` (LuaDoc/EmmyLua) style annotations for IDE support (VSCode Lua extension, IntelliJ EmmyLua):

  ```lua
  --- Processes the given input string.
  --- @param input string The input to process (must be non-empty)
  --- @return string The processed output in uppercase
  function M.process(input)
    ...
  end
  ```
