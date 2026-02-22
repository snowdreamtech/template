# UI/UX & Frontend Guidelines

> Objective: Define standards for frontend development, styling, componentization, and user experience.

## 1. Styling & CSS

- **Framework**: Use the project's designated styling framework (e.g., Tailwind CSS, styled-components, or vanilla CSS modules). Avoid mixing inline styles with utility classes unless absolutely necessary for dynamic values.
- **Variables**: Rely on CSS variables or design system tokens for colors, spacing, and typography to maintain consistency.
- **Responsive Design**: Follow a mobile-first approach. Ensure UI components adapt gracefully across mobile, tablet, and desktop breakpoints.

## 2. Componentization

- **Reusability**: Build modular, reusable components (e.g., generic buttons, inputs, modals) rather than duplicating UI elements.
- **Separation of Concerns**: Keep presentation components (dumb/pure) separate from container components (smart/stateful) where applicable.
- **Props**: Define clear, typed props for components (using TypeScript interfaces/types or PropTypes).

## 3. Accessibility (a11y)

- **Semantic HTML**: Use semantic HTML tags (`<nav>`, `<main>`, `<article>`, `<button>`) instead of generic `<div>` tags.
- **ARIA Attributes**: Use ARIA roles and labels (`aria-label`, `aria-hidden`) where semantic HTML is insufficient, especially for complex interactive custom components.
- **Keyboard Navigation**: Ensure all interactive elements (links, buttons, form fields) are fully accessible via keyboard navigation (`tabindex`, visible focus states).

## 4. Performance & UX

- **Feedback**: Provide immediate visual feedback for user actions (loading spinners, success toasts, error messages, hover states).
- **Optimization**: Optimize images (use modern formats like WebP), lazy load non-critical components or images, and minimize layout shifts (Core Web Vitals).
