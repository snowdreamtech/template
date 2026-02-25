# WebAssembly (WASM) Development Guidelines

> Objective: Define standards for building, integrating, optimizing, and securing WebAssembly modules, covering language selection, JS/WASM interop, performance, security, tooling, and deployment.

## 1. Source Language Selection & Trade-offs

- Choose a source language based on your use case, team expertise, and target environment:

  | Language | Toolchain | Best For | Binary Size |
  |---|---|---|---|
  | **Rust** | `wasm-pack` + `wasm-bindgen` | Safety-critical, high-perf, new projects | Small (with `opt-level = "z"`) |
  | **C/C++** | Emscripten | Porting existing native libraries | Medium |
  | **Go** | `GOOS=js GOARCH=wasm` | Full Go programs in browser | Large (2MB+) |
  | **TinyGo** | TinyGo compiler | Go for constrained/embedded WASM | Small |
  | **AssemblyScript** | `asc` compiler | TypeScript devs, web-focused WASM | Small |
  | **Zig** | Zig's WASM target | Low-level, minimal runtime | Very small |

- Evaluate **binary size** as a first-class criterion. Use `wasm-opt` (Binaryen) to optimize after compilation. Target:
  - Browser-delivered modules: < 500KB uncompressed, < 200KB gzip/brotli
  - Server-side/Edge modules: < 5MB (less constrained by download time)
- For **Rust**, configure `Cargo.toml` for optimal WASM output:

  ```toml
  [profile.release]
  opt-level = "s"      # "z" for even smaller size, "3" for raw speed
  lto = true
  codegen-units = 1
  panic = "abort"      # removes panic unwinding machinery (~30% size reduction)
  strip = true
  ```

- Use **WASI (WebAssembly System Interface)** for WASM modules intended for server-side or edge environments (Cloudflare Workers, Deno, Node.js via wasmtime/Wasmer, Fastly Compute). WASI provides a standardized capability-based interface to OS primitives.
- Regularly review whether WASM is still the right tool as JS engines improve. WASM advantages over JS: predictable performance (no JIT deoptimization), direct memory control, small deterministic startup time.

## 2. JavaScript/WASM Integration & Interop

- Use **`wasm-bindgen`** (Rust) or Emscripten's generated glue code for the JS/WASM boundary. Never manually manage linear memory offsets from JavaScript for complex data types.
- Load WASM modules **asynchronously with streaming compilation** — do not preload and then instantiate:

  ```js
  // ✅ Streaming (compiles while downloading)
  const { instance, module } = await WebAssembly.instantiateStreaming(fetch("/app.wasm"), importObject);

  // ❌ Non-streaming (waits for full download before compiling)
  const buffer = await fetch("/app.wasm").then((r) => r.arrayBuffer());
  const { instance } = await WebAssembly.instantiate(buffer, importObject);
  ```

- **Minimize data copying** across the JS/WASM boundary — it is expensive. Prefer:
  - Passing integer IDs and indices instead of serialized objects
  - Using `SharedArrayBuffer` for zero-copy buffer sharing (requires COOP/COEP headers)
  - Operating on data in WASM linear memory directly via typed arrays (`Uint8Array`, `Float32Array`)
- For string passing, use `TextEncoder`/`TextDecoder` efficiently. Pre-allocate WASM linear memory for string data to avoid repeated allocation:

  ```js
  // Pass a string to WASM (Rust wasm-bindgen handles this automatically)
  const encoded = new TextEncoder().encode(str);
  const ptr = exports.allocate(encoded.length);
  new Uint8Array(exports.memory.buffer, ptr, encoded.length).set(encoded);
  exports.process_string(ptr, encoded.length);
  exports.deallocate(ptr, encoded.length);
  ```

- Enable **`SharedArrayBuffer`** for zero-copy sharing between JS and WASM threads. This requires:

  ```http
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  ```

## 3. Performance Optimization

- Use WASM for **CPU-bound tasks** only: image/video encoding, cryptography, compression, heavy parsing, physics simulation, ML inference, WebXR. For I/O-bound operations or simple DOM manipulation, plain JavaScript is faster due to lower bridge overhead.
- **Profile before optimizing.** Use browser DevTools WASM profiler (Firefox has excellent support), Instruments on Safari, or `perf` with DWARF debug info for native simulation:

  ```bash
  cargo build --target wasm32-unknown-unknown --release
  twiggy top -n 20 target/wasm32-unknown-unknown/release/my_module.wasm
  ```

- After compilation, always run `wasm-opt` as a mandatory post-build step:

  ```bash
  wasm-opt -O4 --enable-simd -o output.wasm input.wasm
  # Or for size optimization:
  wasm-opt -Oz -o output.wasm input.wasm
  ```

  This typically reduces binary size by 15–30% and improves runtime performance.
- Use **SIMD** (`--enable-simd`) for vectorizable workloads (image processing, audio, ML). Rust: use `std::arch::wasm32`, AssemblyScript: native SIMD types. Check browser support first.
- Use **multi-threading** via Web Workers + `SharedArrayBuffer` + Atomics. The WASM module must be compiled with threading support (`--enable-threads` in `wasm-opt`, Rust `target-feature = "+atomics,+bulk-memory"`). Design the threading model explicitly from the start.
- Use **streaming compilation** and **module caching** to reduce subsequent load times:

  ```js
  // Cache the compiled module in IndexedDB for subsequent page loads
  const module = await WebAssembly.compileStreaming(fetch("/app.wasm"));
  // Store module in IndexedDB, retrieve on next visit
  ```

## 4. Security & Sandboxing

- WASM runs in the browser sandbox but can introduce vulnerabilities when processing **untrusted input** (file parsing, protocol deserialization, HTML/XML processing). Memory safety bugs in C/C++ WASM are still exploitable within the sandbox.
- **Validate all input** on the JavaScript/host side before passing across the WASM boundary. Validate outputs too — never trust that WASM-processed data is safe for use in a security-sensitive context.
- Apply the **Principle of Least Capability** for WASM imports. Import only the host functions the module actually needs. Avoid granting filesystem or network access unless strictly required:

  ```js
  const importObject = {
    env: {
      // Only provide the minimal set of imports needed
      log: (ptr, len) => console.log(readString(memory, ptr, len)),
    },
    // Do NOT import `fs`, `net`, or `process` unless needed
  };
  ```

- For **server-side WASM** (Wasmtime, WASMer, Deno), use capability-based sandboxing: grant only the specific WASI capabilities required (e.g., read-only access to a specific path, no network access). Never grant `inherit_stdio` + full filesystem access in production.
- Set a **Content Security Policy** that allows WASM compilation without enabling unsafe script execution:

  ```http
  Content-Security-Policy: script-src 'self' 'wasm-unsafe-eval'; default-src 'self';
  ```

  `'wasm-unsafe-eval'` allows `WebAssembly.instantiate()` while blocking `eval()` and inline scripts.
- Audit WASM module imports and exports regularly. Tools: `wasm-objdump` (wabt), `twiggy`, `wasm-bindgen-inspector`. Ensure no unexpected host capabilities are exposed.

## 5. Tooling, Build Pipeline & Deployment

### Build & Development

- Use **`wasm-pack`** for Rust → WASM + npm integration:

  ```bash
  wasm-pack build --target web      # For direct browser `<script type="module">` usage
  wasm-pack build --target bundler  # For Webpack/Vite/Rollup (recommended)
  wasm-pack build --target node     # For Node.js
  wasm-pack build --target deno     # For Deno
  ```

- Version-lock all WASM toolchain components in CI for reproducible builds:

  ```bash
  # In CI
  cargo install wasm-pack --version 0.12.1
  cargo install wasm-bindgen-cli --version 0.2.92
  pip install binaryen==117  # for wasm-opt
  ```

- Inspect and debug WASM with the **wabt** toolkit: `wasm2wat` (binary → text format), `wasm-validate` (validate module), `wasm-objdump` (inspect sections, imports, exports).
- For Rust, use the LLVM source map support for DWARF debugging in browser DevTools:

  ```bash
  RUSTFLAGS=-g cargo build --target wasm32-unknown-unknown
  ```

### Integration with Bundlers (Vite/Webpack)

- In Vite, use the `vite-plugin-wasm` plugin for proper WASM integration:

  ```js
  // vite.config.ts
  import wasm from "vite-plugin-wasm";
  export default { plugins: [wasm()] };
  ```

- In Webpack 5, WASM support is enabled by default. Set `experiments.asyncWebAssembly: true` for modern async instantiation. Use `import()` for lazy WASM loading.
- Use **dynamic `import()`** for WASM modules to enable code splitting and lazy loading — only load the WASM module when the user actually needs the feature it provides.

### Monitoring & Deployment

- Serve WASM files with `Content-Type: application/wasm` to enable streaming compilation in all browsers.
- Serve WASM with Brotli compression — WASM binary format compresses exceptionally well (typically 60–70% reduction). Configure Nginx/Caddy to pre-compress `.wasm` files.
- Monitor WASM initialization time, memory usage (WASM linear memory growth), and crash rates (uncaught exceptions from WASM) in production.
- Set `wasm-pack test` or equivalent in CI to verify that WASM modules pass unit tests in the target environment (headless browser or Node.js).
