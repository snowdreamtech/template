# Accessibility (a11y) Guidelines

> Objective: Define standards for building universally accessible digital products that meet or exceed WCAG 2.2 AA compliance, covering semantic HTML, color, keyboard navigation, ARIA, and testing workflows.

## 1. Semantic Structure & HTML

- Use the **correct semantic HTML element** for its intended purpose. Semantic elements carry implicit ARIA roles, keyboard behavior, and state management at zero cost:
  - `<button>` for click actions (not `<div onclick>`)
  - `<a href="...">` for navigation (not `<span onclick>`)
  - `<h1>`–`<h6>` for heading hierarchy
  - `<nav>` for navigation landmark
  - `<main>` for primary page content
  - `<header>`, `<footer>`, `<aside>`, `<section>`, `<article>` for document structure
  - `<ul>`/`<ol>` for lists, `<dl>` for definition lists
  - `<table>`, `<thead>`, `<tbody>`, `<th scope="col/row">` for tabular data
- Each page MUST have **exactly one `<h1>`**. Heading levels must not be skipped — never jump from `<h1>` directly to `<h3>`. Headings communicate document outline to screen reader users.
- **Never use `<div>` or `<span>` for interactive controls.** If you need a click target, `<button>` is always the right element. Adding `onclick` to a `<div>` loses keyboard accessibility, focus management, and ARIA roles.
- Use **`<label for="inputId">`** or `aria-labelledby` to associate all form controls with their labels:

  ```html
  <!-- ✅ Explicit association -->
  <label for="email">Email address</label>
  <input type="email" id="email" name="email" autocomplete="email" required />

  <!-- ❌ Placeholder-only label — disappears on focus -->
  <input type="email" placeholder="Email address" />
  ```

  Never use placeholder text as the only label — placeholders disappear when the user types, leaving users without context.

- Use **`<fieldset>` and `<legend>`** to group related form controls (radio buttons, checkboxes, address fields).
- Ensure every `<img>` has an `alt` attribute:
  - Meaningful images: describe the content (`alt="User profile photo"`)
  - Decorative images: empty alt (`alt=""`) — screen reader skips them
  - Images conveying data: use long descriptions or adjacent text
- Use **landmark roles** to structure the page — this enables screen reader users to jump between major sections:

  ```html
  <header role="banner">...</header>
  <!-- or just <header> at top level -->
  <nav aria-label="Main navigation">...</nav>
  <main id="main-content">...</main>
  <aside aria-label="Related articles">...</aside>
  <footer role="contentinfo">...</footer>
  ```

## 2. Color & Visual Design

### Contrast Requirements

- Text and interactive elements MUST meet **WCAG 2.2 AA** minimum contrast ratios (as measured against adjacent background):

  | Text Size | Minimum Ratio | AA | AAA |
  |---|---|---|---|
  | Normal text (< 18pt / 14pt bold) | **4.5:1** | ✓ required | 7:1 target |
  | Large text (≥ 18pt or ≥ 14pt bold) | **3:1** | ✓ required | 4.5:1 target |
  | UI components (borders, focus rings, icons) | **3:1** | ✓ required | — |

- Use contrast checkers to verify: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/), [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) (desktop app, picks screen colors).
- **Dark mode** MUST maintain the same contrast ratios as light mode. Verify both themes in CI and during manual review.

### Color Independence

- **Never convey information through color alone.** A color-blind user (8% of males) may not perceive the difference. Always pair color with:
  - Text labels or descriptions
  - Icons or symbols
  - Patterns or shapes (for charts)

  ```html
  <!-- ❌ Color-only error indicator -->
  <input class="error-red" ... />

  <!-- ✅ Color + icon + text -->
  <input aria-invalid="true" aria-describedby="email-error" ... />
  <span id="email-error" role="alert">
    <svg aria-hidden="true"><!-- error icon --></svg>
    Please enter a valid email address.
  </span>
  ```

- Use color tokens from a design system that have accessible-by-default definitions. Document which palette values meet which contrast ratios.

## 3. Keyboard Navigation

- Every interactive element (links, buttons, form inputs, custom dropdowns, date pickers, modals, tabs) MUST be **fully operable via keyboard** using standard patterns:
  - `Tab` / `Shift+Tab`: move focus forward/backward
  - `Enter`: activate links and buttons
  - `Space`: activate buttons, checkboxes
  - `Escape`: close modals, dismissible elements
  - Arrow keys: navigate within compound widgets (menus, listboxes, radio groups)
- **Tab order** must follow a logical, predictable reading order matching the visual layout. Never use `tabindex > 0` — it creates non-intuitive focus sequences that disorient keyboard users.
- Provide a **visible focus indicator** using `:focus-visible` CSS:

  ```css
  /* ❌ Don't remove focus styles entirely */
  :focus {
    outline: none;
  }

  /* ✅ Highly visible focus indicator */
  :focus-visible {
    outline: 3px solid #2563eb;
    outline-offset: 2px;
    border-radius: 2px;
  }
  ```

  The focus indicator must have a **3:1 contrast ratio** between focused and unfocused states.

- Implement **focus trapping** inside modal dialogs using `inert` attribute or focus trap libraries:

  ```javascript
  // When modal opens:
  // 1. Set `inert` on the background content
  // 2. Move focus to the first focusable element in the modal
  // When modal closes:
  // 1. Remove `inert` from background content
  // 2. Return focus to the trigger element (the button that opened the modal)
  ```

- Provide a **"Skip to main content"** link as the first focusable element on every page:

  ```html
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <main id="main-content">...</main>
  ```

  Style the skip link to become visible on focus (commonly positioned off-screen by default):

  ```css
  .skip-link {
    position: absolute;
    top: -100vh;
  }
  .skip-link:focus {
    top: 1rem;
    left: 1rem;
    z-index: 9999;
  }
  ```

## 4. ARIA

### Rule 1: Prefer Native HTML

- The **first rule of ARIA**: if you can use a native HTML element or attribute to achieve the semantics and behavior, do that instead of ARIA. Native elements have better browser/AT support.

### When ARIA Is Required

- When building custom interactive components with no native HTML equivalent (carousel, combobox, tab panel, disclosure), implement the correct **ARIA design pattern** from the [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/).
- Common ARIA patterns and required attributes:

  ```html
  <!-- Modal dialog -->
  <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <h2 id="dialog-title">Confirm Delete</h2>
    ...
  </div>

  <!-- Disclosure (accordion) -->
  <button aria-expanded="false" aria-controls="section-1">What is this?</button>
  <div id="section-1" hidden>Answer here</div>

  <!-- Navigation tabs -->
  <div role="tablist" aria-label="Settings sections">
    <button role="tab" aria-selected="true" aria-controls="panel-1">General</button>
    <button role="tab" aria-selected="false" aria-controls="panel-2">Privacy</button>
  </div>
  <div role="tabpanel" id="panel-1">...</div>
  ```

- Use `aria-live` for dynamic content:
  - `aria-live="polite"` — announces non-critical updates (search results, filters applied) after the user finishes what they are doing
  - `aria-live="assertive"` — interrupts the screen reader immediately; use only for critical errors or urgent messages
  - Prefer using `role="status"` (polite) and `role="alert"` (assertive) instead.
- Avoid **ARIA anti-patterns**:
  - `aria-label` on non-interactive elements (use `aria-labelledby` for headings)
  - Redundant ARIA (`<button role="button">`)
  - Hiding content with `aria-hidden="true"` that is still keyboard-focusable
  - Using `tabindex="-1"` on non-programmatically-focused elements

## 5. Testing & Compliance

### Automated Testing

- Run **axe-core** accessibility scans in CI — they catch 30-40% of WCAG issues automatically:

  ```typescript
  // Playwright with axe
  import AxeBuilder from "@axe-core/playwright";

  test("homepage has no WCAG violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toHaveLength(0);
  });
  ```

- Use **`eslint-plugin-jsx-a11y`** for React/JSX projects. Run in CI and treat violations as errors.
- Use **Lighthouse** CI integration (`lhci`) to track accessibility scores across deployments.

### Manual Testing Protocol

- **Keyboard-only testing** (do before every release): Walk through every interactive flow without a mouse. Verify focus order, visible indicators, modal trapping, and dialog return focus.
- **Screen reader testing matrix** (test monthly or before major releases):

  | Screen Reader | Browser | Priority |
  |---|---|---|
  | NVDA | Firefox | High (Windows, most used) |
  | JAWS | Chrome | High (Windows, enterprise) |
  | VoiceOver | Safari | High (macOS/iOS) |
  | TalkBack | Chrome Mobile | Medium (Android) |

- **Zoom testing**: Test at 200% and 400% browser zoom. No content should be cut off, overlap unintentionally, or require horizontal scrolling.

### Compliance Documentation

- Target **WCAG 2.2 Level AA** as the minimum compliance standard for all user-facing products.
- Maintain an **Accessibility Conformance Report (ACR)** or VPAT (Voluntary Product Accessibility Template) that documents conformance level per criterion.
- Document all known accessibility exceptions with: WCAG criterion, severity, remediation plan, and target fix date. Review quarterly.
- Include accessibility in the **Definition of Done** for all user-facing features: automated scan passes, keyboard tested, and a screen reader smoke test performed.
