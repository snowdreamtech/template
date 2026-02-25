# HTML Development Guidelines

> Objective: Define standards for writing clean, accessible, and semantic HTML.

## 1. Document Structure

- Always include `<!DOCTYPE html>` as the very first line of every HTML document.
- Specify the language attribute on the root element: `<html lang="en">` (or the appropriate BCP 47 locale code).
- Include in every `<head>`: `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- Every page MUST have a unique, descriptive `<title>` tag (≤ 60 characters) and a `<meta name="description">` (≤ 155 characters) for SEO.
- Use Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:type`) for pages shared on social media.

## 2. Semantic HTML

- Use semantic elements over generic `<div>` / `<span>`: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`, `<time>`, `<figure>`, `<figcaption>`.
- Use heading tags (`<h1>`–`<h6>`) in a logical, hierarchical order. Use **exactly one `<h1>`** per page — it is the document's primary heading.
- Use `<button>` for interactive controls (actions), `<a href>` for navigation (links). Never use `<div>` or `<span>` with click handlers as substitutes.
- Use `<ul>` / `<ol>` for lists, `<table>` for tabular data (with `<thead>`, `<tbody>`, `<th scope="col/row">`), `<form>` for forms.
- Use `<details>` and `<summary>` for disclosure widgets (accordions) instead of JavaScript-only implementations.

## 3. Accessibility (a11y)

- All `<img>` elements MUST have an `alt` attribute. Use descriptive text for meaningful images; use `alt=""` for purely decorative images.
- Every form input MUST be associated with a `<label>` using `for`/`id` attributes or wrapping the input inside the label.
- Use ARIA roles and attributes (`aria-label`, `aria-describedby`, `aria-expanded`, `role`) **only when semantic HTML is insufficient**. The first rule of ARIA: don't use ARIA when native semantics work.
- All interactive elements must be **keyboard-navigable** (Tab, Shift+Tab, Enter, Space) and have a visible focus indicator. Never use `outline: none` without providing an alternative.
- Ensure sufficient color contrast: WCAG AA requires ≥ 4.5:1 for normal text, ≥ 3:1 for large text (18pt or 14pt bold).

## 4. Code Quality

- Separate concerns: HTML = structure, CSS = presentation, JavaScript = behavior. Avoid inline styles (`style="..."`) and inline event handlers (`onclick="..."`).
- Use lowercase for all tag names and attribute names. Always quote attribute values with double quotes.
- Validate HTML using the [W3C Validator](https://validator.w3.org/) or HTMLHint in CI.
- Avoid deprecated HTML elements (`<font>`, `<center>`, `<marquee>`, `<b>` for styling — use `<strong>` for semantic importance).

## 5. Performance & SEO

- Lazy-load below-the-fold images: `<img loading="lazy">`. Eager-load hero/above-the-fold images: `<img loading="eager" fetchpriority="high">`.
- Use `<link rel="preload">` for critical resources (fonts, key CSS, LCP images) and `<link rel="preconnect">` for third-party origins.
- Minimize the DOM size. Aim for < 1,500 total DOM nodes for optimal rendering performance.
- Use `<link rel="canonical">` on every page to prevent duplicate content SEO issues.
- Add `<meta name="robots">`, `rel="noindex"`, or `<link rel="canonical">` appropriately for pagination, filter, and user-generated content pages.
