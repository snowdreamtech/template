# WebAssembly (WASM) Development Guidelines

> Objective: Define standards for building, integrating, and securing WebAssembly modules.

## 1. Source Language Selection

- Choose a source language based on your use case:
  - **Rust**: Best for safety-critical, systems-level WASM. Use `wasm-pack` + `wasm-bindgen` for browser targets. Mature toolchain and excellent performance.
  - **C/C++**: Use **Emscripten** for porting existing native libraries (codecs, image processing, numeric libraries). Best when a large existing codebase is involved.
  - **Go**: Use `GOOS=js GOARCH=wasm` for Go-based WASM modules. Note: produces large binaries (~2MB+). Use **TinyGo** for smaller output in constrained environments.
  - **AssemblyScript**: TypeScript-like syntax purpose-built for WASM. Good for web developers new to WASM who want a familiar type system.
- Evaluate **binary size** as a first-class concern. Use `wasm-opt` (Binaryen) to optimize WASM binaries with `-O4` after compilation. Aim for < 500KB for web-delivered modules.

## 2. JavaScript / WASM Integration

- Use **`wasm-bindgen`** (Rust) or Emscripten's generated JS glue code for the JS/WASM bridge. Never manually manage linear memory offsets from JavaScript for complex data types.
- Minimize **data copying** across the JS/WASM boundary. Pass indices, offsets, or shared `SharedArrayBuffer` references instead of serializing large data structures by value.
- Load WASM modules asynchronously with **`WebAssembly.instantiateStreaming()`** — it compiles the module while streaming the download, reducing cold start time. Never use `WebAssembly.instantiate()` with a pre-fetched buffer as it requires the entire download to complete first.
- Use **WASI** (`WebAssembly System Interface`) for WASM modules that need to run in server-side or edge environments (Deno, Node.js via wasmtime, Cloudflare Workers, Fastly Compute).
- Use **`SharedArrayBuffer`** for zero-copy data sharing between JS and WASM (requires `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers).

## 3. Performance

- Use WASM exclusively for **CPU-bound tasks**: image/video encoding, cryptography, compression, heavy parsing, physics simulation, ML inference. Do not use it as a general-purpose alternative to JavaScript for I/O-bound or simple operations.
- Profile before optimizing. Use browser DevTools' WASM profiler and the Instruments/flame graph tooling to identify actual hot paths.
- Enable compile-time optimizations: `--release` in Rust/Cargo (enables `opt-level = 3`), `-O3` or `-Os` in Emscripten for size vs. speed trade-off.
- Use multi-threading via **Web Workers + SharedArrayBuffer + Atomics** for parallel WASM workloads. Ensure the threading model is explicitly designed — WASM modules are single-threaded by default.

## 4. Security

- WASM runs in the browser sandbox but can still introduce vulnerabilities when processing untrusted input (parsing, deserialization).
- **Validate all input** on the JavaScript/host side before passing it across the WASM boundary. Treat WASM modules as untrusted compute — validate outputs too.
- Avoid importing unnecessary host functions (WASI APIs, JS imports) into the WASM module — follow the principle of least privilege for capability grants.
- For server-side WASM execution, use a secure runtime (Wasmtime, WASMer) with explicit capability grants. Never grant filesystem or network access unless strictly required.
- Keep WASM binary CORs policies tight — only serve from trusted origins. Use `Content-Security-Policy: script-src 'wasm-unsafe-eval'` to allow WASM compilation while banning inline JS.

## 5. Tooling & Build

- Use **`wasm-pack`** for Rust → WASM + NPM publishing integration. Use `wasm-pack build --target web` for browser use, `--target bundler` for bundlers (Webpack/Vite), `--target node` for Node.js.
- Run **`wasm-opt -O4 -o output.wasm input.wasm`** as a mandatory post-build step to minimize binary size and improve runtime performance (often 10–30% improvement).
- Inspect and debug WASM modules with browser DevTools WASM debugger or **wabt** (`wasm2wat`, `wat2wasm`, `wasm-validate`). Use `wasm-bindgen-inspector` for Rust bindings inspection.
- Version-lock WASM toolchain components (`wasm-pack`, `emcc`, `binaryen`) in CI to ensure reproducible builds. Use `.cargo/config.toml` wasm targets for Rust projects.
