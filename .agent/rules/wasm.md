# WebAssembly (WASM) Development Guidelines

> Objective: Define standards for building, integrating, and securing WebAssembly modules.

## 1. Source Language Selection

- Choose a source language based on your use case:
  - **Rust**: Best for safety-critical, systems-level WASM. Use `wasm-pack` + `wasm-bindgen` for web targets. Excellent toolchain maturity.
  - **C/C++**: Use **Emscripten** for porting existing native libraries. Good for codecs, image processing, numeric libraries.
  - **Go**: Use `GOOS=js GOARCH=wasm` for Go-based WASM modules (note: produces larger binaries; use TinyGo for smaller output).
  - **AssemblyScript**: TypeScript-like syntax purpose-built for WASM. Good for web developers new to WASM.
- Evaluate binary size as a first-class concern. Use `wasm-opt` (Binaryen) to optimize WASM binaries with `-O4` after compilation.

## 2. JavaScript / WASM Integration

- Use **`wasm-bindgen`** (Rust) or Emscripten's generated JS glue code for the JS/WASM bridge. Never manually manage linear memory from JavaScript.
- Minimize **data copying** across the JS/WASM boundary. Pass indices, offsets, or shared `SharedArrayBuffer` references instead of serializing large data structures.
- Load WASM modules asynchronously using **`WebAssembly.instantiateStreaming()`** — it compiles the module while streaming the download. Never use `WebAssembly.instantiate()` with a pre-fetched buffer as it blocks.
- Use **WASI** (`WebAssembly System Interface`) for WASM modules that need to run in server-side/edge environments (Deno, Node.js via wasmtime, Fastly Compute, Cloudflare Workers WASM).

## 3. Performance

- Use WASM exclusively for **CPU-bound tasks**: image/video encoding, cryptography, compression, heavy parsing, physics simulation. Do not use it as a general-purpose alternative to JavaScript.
- Profile before optimizing. Use browser DevTools' WASM profiler and JavaScript performance timeline to identify actual bottlenecks.
- Enable compile-time optimizations: `--release` in Rust/Cargo, `-O3` in Emscripten.

## 4. Security

- WASM runs in the browser sandbox but can still introduce vulnerabilities when processing untrusted input.
- **Validate all input** on the JavaScript/host side before passing it across the WASM boundary.
- Avoid importing unnecessary host functions (WASI APIs, JS imports) into the WASM module — follow the principle of least privilege for host function imports.
- For server-side WASM execution, use a secure runtime (Wasmtime, WASMer) with explicit capability grants. Never grant filesystem or network access unless required.

## 5. Tooling & Build

- Use **`wasm-pack`** for Rust → WASM + NPM integration. Use `wasm-pack build --target web` for browser use, `--target node` for Node.js.
- Use **Emscripten** for C/C++ → WASM.
- Run **`wasm-opt -O4 -o output.wasm input.wasm`** as a post-build step to minimize binary size and improve performance.
- Inspect and debug WASM modules with browser DevTools or **wabt** (`wasm2wat`, `wat2wasm`). Use `wasm-bindgen-inspector` for Rust bindings.
