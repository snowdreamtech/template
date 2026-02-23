# WebAssembly (WASM) Development Guidelines

> Objective: Define standards for building, integrating, and securing WebAssembly modules.

## 1. Source Language Selection

- Choose a source language that compiles well to WASM for your use case:
  - **Rust**: Best for safety-critical, systems-level WASM (use `wasm-pack` or `wasm-bindgen`).
  - **C/C++**: Use Emscripten for porting existing native libraries to the web.
  - **Go**: Use `GOOS=js GOARCH=wasm` for Go-based WASM modules.
  - **AssemblyScript**: TypeScript-like syntax, purpose-built for WASM (good for web developers).

## 2. JavaScript / WASM Integration

- Use **`wasm-bindgen`** (Rust) or Emscripten's JS glue code to manage the bridge between WASM and JavaScript. Avoid manually writing low-level memory management glue.
- Minimize data copying across the JS/WASM boundary. Pass pointers/indices, not large data structures, where possible.
- Load WASM modules asynchronously using `WebAssembly.instantiateStreaming()` — never `WebAssembly.instantiate()` with a pre-fetched buffer, as it blocks.

## 3. Performance

- Use WASM for **CPU-bound tasks** (image processing, codecs, parsing, cryptography). Do not use it as a general-purpose replacement for JavaScript.
- Profile before optimizing. Use browser DevTools' WASM profiling to identify actual bottlenecks.
- Enable WASM optimizations at compile time (e.g., `--release` in Rust, `-O3` in Emscripten).

## 4. Security

- WASM runs in the browser sandbox but can still introduce vulnerabilities if it processes untrusted input.
- Validate all input passed to WASM modules on the JavaScript side before passing it across the boundary.
- Avoid importing unnecessary host functions (WASI or JS APIs) into the WASM module — follow least-privilege principles.

## 5. Tooling

- Use **wasm-pack** for Rust → WASM workflows.
- Use **Emscripten** for C/C++ → WASM.
- Inspect and debug WASM modules with browser DevTools or **wabt** (`wasm2wat`).
