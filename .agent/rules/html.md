# HTML Development Guidelines

> Objective: Define standards for writing clean, accessible, and semantic HTML.

## 1. Document Structure

- Always include a proper `<!DOCTYPE html>` declaration.
- Specify the language attribute: `<html lang="en">` (or appropriate locale).
- Define `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">` in every `<head>`.
- Every page MUST have a unique, descriptive `<title>` tag.

## 2. Semantic HTML

- Use semantic elements over generic `<div>` and `<span>`: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`.
- Use heading tags (`<h1>`–`<h6>`) in a logical, hierarchical order. Only one `<h1>` per page.
- Use `<button>` for interactive controls, not `<div>` or `<span>` with click handlers.
- Use `<a href="...">` for navigation links and `<button>` for actions within the page.

## 3. Accessibility (a11y)

- All `<img>` elements MUST have a descriptive `alt` attribute. Use `alt=""` for purely decorative images.
- Form inputs MUST be associated with a `<label>` using `for`/`id` attributes.
- Use ARIA roles and attributes (`aria-label`, `aria-describedby`, `role`) only when semantic HTML is insufficient.
- Ensure sufficient color contrast between foreground and background (WCAG AA minimum: 4.5:1 ratio).
- All interactive elements must be keyboard-navigable and have a visible focus indicator.

## 4. Code Quality

- Keep HTML focused on structure; delegate all styling to CSS and behavior to JavaScript.
- Avoid inline styles (`style="..."`) and inline event handlers (`onclick="..."`).
- Use lowercase for all tag names and attribute names.
- Always quote attribute values using double quotes.
- Self-close void elements consistently: `<br>`, `<hr>`, `<input>`, `<img>`, `<meta>`, `<link>`.
