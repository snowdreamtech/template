# HTML Development Guidelines

> Objective: Define standards for writing clean, semantic, accessible, performant, and SEO-optimized HTML that serves as a solid foundation for all web projects.

## 1. Document Structure & Head

- Always include `<!DOCTYPE html>` as the very first line of every HTML document. This ensures standards mode (not quirks mode) in all browsers.
- Specify the primary language of the document: `<html lang="en">` (use the appropriate [BCP 47 language tag](https://www.w3.org/International/articles/language-tags/) for the page's content language, e.g., `zh-CN`, `ja`, `ar`).
- Every `<head>` MUST include at minimum:

  ```html
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title — Brand Name</title>
  <meta name="description" content="Concise description under 155 characters." />
  ```

- **Title tags**: must be unique per page, descriptive, and ≤ 60 characters. Format: `Page Purpose — Brand Name`.
- **Meta description**: unique per page, ≤ 155 characters, written in natural language to summarize the page's content for search results.
- Include **Open Graph** and **Twitter Card** meta tags for pages shared on social media:

  ```html
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Page description." />
  <meta property="og:image" content="https://example.com/social-image.jpg" />
  <meta property="og:image:alt" content="Description of the social image" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://example.com/page" />
  <meta name="twitter:card" content="summary_large_image" />
  ```

- Use `<link rel="canonical" href="https://example.com/page">` on every page to prevent duplicate content penalties in search engines (especially critical for pages accessible at multiple URLs).

## 2. Semantic HTML

- Use **semantic elements** instead of generic `<div>` or `<span>`. Semantic HTML communicates meaning to browsers, assistive technologies, and search engines:

  | Element | Purpose |
  |---|---|
  | `<header>` | Page or section header (logo, nav, search) |
  | `<nav>` | Navigation links |
  | `<main>` | Primary content (one per page) |
  | `<article>` | Self-contained, distributable content (blog post, product card) |
  | `<section>` | Thematic content grouping with a heading |
  | `<aside>` | Tangentially related content (sidebar, callouts) |
  | `<footer>` | Page or section footer |
  | `<time datetime="2024-01-15">` | Dates and times (machine-readable) |
  | `<figure>` + `<figcaption>` | Images, diagrams, code with caption |
  | `<details>` + `<summary>` | Disclosure widget (accordion, collapsible) |

- Use **heading tags** (`<h1>`–`<h6>`) in a strict, logical hierarchy. Use **exactly one `<h1>`** per page — it is the document's primary heading. Never skip heading levels (do not jump from `<h2>` to `<h4>`).
- Use `<button>` for interactive controls (actions, form submissions), `<a href>` for navigation (links to other pages or locations). **Never** use `<div>` or `<span>` with click handlers as substitutes — they lack native keyboard focus and semantic meaning.
- Use `<ul>` / `<ol>` for lists, `<dl>` for definition/description lists. Use `<table>` with proper `<thead>`, `<tbody>`, `<th scope="col/row">` for tabular data only (not layout).
- Use `<form>` with `method` and `action` attributes. Form inputs must have explicit `type` attributes. Use `<fieldset>` and `<legend>` to group related form controls.

## 3. Accessibility (a11y)

- All `<img>` elements MUST have an `alt` attribute:
  - Meaningful: `alt="Line chart showing 30% revenue growth from Q1 to Q4 2024"`
  - Decorative: `alt=""` (empty string — tells screen readers to skip it)
  - Never omit `alt` entirely — this causes screen readers to announce the image filename
- Every form input MUST be associated with a `<label>`. Use `for`/`id` attributes or wrap the input inside the label:

  ```html
  <label for="email">Email address</label> <input type="email" id="email" name="email" autocomplete="email" required />
  ```

- Use ARIA roles and attributes **only when semantic HTML is insufficient**. The first rule of ARIA: if you can use a native HTML element, use it. ARIA supplements semantics — it does not add behavior:

  ```html
  <!-- ❌ Don't -->
  <div role="button" onclick="...">Click me</div>

  <!-- ✅ Do -->
  <button type="button">Click me</button>
  ```

- All interactive elements MUST be **keyboard-navigable** with Tab/Shift+Tab, and operable with Enter/Space. Never remove the browser's default focus indicator without providing a clearly visible custom alternative:

  ```css
  :focus-visible {
    outline: 3px solid hsl(210, 80%, 55%);
    outline-offset: 2px;
  }
  ```

- Ensure sufficient color contrast. WCAG 2.2 AA requirements:
  - Normal text (< 18pt): ≥ 4.5:1 contrast ratio
  - Large text (≥ 18pt or 14pt bold): ≥ 3:1 contrast ratio
  - UI components and icons: ≥ 3:1 contrast ratio against adjacent colors
- Add `aria-label`, `aria-describedby`, `aria-live`, `aria-expanded`, `aria-controls` where necessary for dynamic content and custom interactive widgets (menus, dialogs, tabs, accordions).
- Test critical flows with screen readers: **VoiceOver** (macOS/iOS), **NVDA** (Windows), **TalkBack** (Android). Run automated a11y checks with `axe-core` or `@axe-core/playwright` in CI.

## 4. Code Quality & Security

- **Separate concerns**: HTML = structure, CSS = presentation, JavaScript = behavior.
  - Avoid inline styles (`style="..."`) except for dynamically computed values
  - Avoid inline event handlers (`onclick="..."`, `onsubmit="..."`) — attach events programmatically
- Use lowercase for all tag names and attribute names. Always quote attribute values with double quotes. Self-close void elements consistently: `<img>`, `<input>`, `<br>`, `<hr>`, `<meta>`, `<link>`.
- Avoid deprecated or obsolete HTML elements: `<font>`, `<center>`, `<marquee>`, `<blink>`, `<frameset>`. Use `<strong>` for semantic importance, `<b>` only for stylistic bold without semantic weight.
- Validate HTML in CI using `html-validate` or the W3C Validator API. Fix all errors; treat warnings as potential issues.
- Implement a **Content Security Policy (CSP)** via HTTP header (preferred) or meta tag:

  ```html
  <!-- Restrictive CSP — adjust per project needs -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'nonce-{server-generated-nonce}'; style-src 'self'; img-src 'self' data: https:" />
  ```

  Prefer nonce-based CSP over `'unsafe-inline'` for scripts. Generate a new nonce per request server-side.
- Add `rel="noopener noreferrer"` to `<a target="_blank">` links to prevent reverse tabnapping: `<a href="..." target="_blank" rel="noopener noreferrer">`.
- Sanitize user-generated content server-side (DOMPurify, bleach) before rendering it in HTML. Never use `innerHTML` with unvalidated user input.

## 5. Performance & SEO

### Resource Loading

- Load **critical CSS** in `<head>` (inline or `<link rel="stylesheet">`). Defer non-critical CSS with `media="print" onload` pattern or via JavaScript.
- Use `<link rel="preload">` for critical resources that are discovered late (LCP image, key font, JSON data):

  ```html
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin /> <link rel="preload" href="/images/hero.webp" as="image" />
  ```

- Use `<link rel="preconnect">` for third-party origins to warm up connections:

  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" /> <link rel="preconnect" href="https://analytics.example.com" crossorigin />
  ```

- Place `<script>` tags at the end of `<body>`, or use `defer` / `async` on scripts in `<head>`:
  - `defer`: execute after parsing, in document order — use for application scripts
  - `async`: execute as soon as downloaded, out of order — use for independent scripts (analytics)
  - Avoid render-blocking synchronous scripts in `<head>`

### Images

- Specify `width` and `height` attributes on all `<img>` elements to reserve layout space and prevent Cumulative Layout Shift (CLS):

  ```html
  <img src="hero.webp" alt="..." width="1200" height="600" />
  ```

- Use `srcset` and `sizes` for responsive images:

  ```html
  <img src="image-800.webp" srcset="image-400.webp 400w, image-800.webp 800w, image-1600.webp 1600w" sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1600px" alt="Descriptive alt text" loading="lazy" decoding="async" />
  ```

- Lazy-load below-the-fold images: `loading="lazy"`. Eager-load LCP hero images: `loading="eager" fetchpriority="high"`.
- Use the `<picture>` element to serve modern image formats (WebP, AVIF) with `<img>` fallback:

  ```html
  <picture>
    <source srcset="image.avif" type="image/avif" />
    <source srcset="image.webp" type="image/webp" />
    <img src="image.jpg" alt="..." width="800" height="450" />
  </picture>
  ```

### SEO & Structured Data

- Implement **Schema.org structured data** (JSON-LD format, preferred over microdata) for content that benefits from rich search results: articles, products, events, FAQs, breadcrumbs:

  ```html
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Article Title",
      "author": { "@type": "Person", "name": "Author Name" },
      "datePublished": "2024-01-15"
    }
  </script>
  ```

- Use `<link rel="alternate" hreflang="zh-CN" href="https://example.com/zh/page">` for multilingual pages to help search engines serve the correct language version.
- Keep the DOM size manageable. Aim for < 1,500 total DOM nodes. Deep DOM trees slow rendering, increase memory usage, and degrade accessibility tree traversal.
- Minimize render-blocking resources. Target First Contentful Paint (FCP) < 1.8s and Largest Contentful Paint (LCP) < 2.5s measured by Lighthouse on mobile (simulated 4G).
