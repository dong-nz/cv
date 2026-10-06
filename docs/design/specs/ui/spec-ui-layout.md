# UI Spec — Layout & Theme

## Overview

Global layout structure, theme system, and page transitions.

---

## Layout Structure

```
App
├── Navigation (sticky top)
├── Main Content
│   └── Page Container
│       └── Page Content
└── Footer (bottom)
```

---

## Page Container

| Property | Value |
|---|---|
| Max-width | 1200px (wide sections), 800px (content sections) |
| Padding | 0 24px (desktop), 0 16px (mobile) |
| Margin | Auto center |

---

## Section Spacing

| Property | Value |
|---|---|
| Vertical padding | 80px (desktop), 48px (mobile) |
| Between sections | 0 (continuous flow) |

---

## Theme System

### Modes

| Mode | Description |
|---|---|
| Dark | Primary mode, near-black background |
| Light | Secondary mode, white background |
| System | Follow OS preference |

### Default

- System preference
- Persist in `localStorage`

### CSS Variables

```css
/* Dark mode (default) */
--bg-primary: #0a0a0a;
--bg-surface: #141414;
--bg-elevated: #1a1a1a;
--text-primary: #f0f0f0;
--text-secondary: #a0a0a0;
--text-muted: #666666;
--accent: #60a5fa;
--border: #2a2a2a;
--shadow: rgba(0, 0, 0, 0.3);

/* Light mode */
--bg-primary: #ffffff;
--bg-surface: #f5f5f5;
--bg-elevated: #ffffff;
--text-primary: #0a0a0a;
--text-secondary: #404040;
--text-muted: #808080;
--accent: #2563eb;
--border: #e0e0e0;
--shadow: rgba(0, 0, 0, 0.1);
```

### Single Accent Color

- Only one accent color per theme
- Avoid multi-color palette
- Use accent for: links, active states, CTAs, badges, highlights

---

## Theme Toggle

| Property | Value |
|---|---|
| Location | Navigation bar (right side) |
| Icon | Sun/Moon icon |
| Tooltip | Current mode (dark/light/system) |
| Click behavior | Cycle: dark → light → system → dark |

---

## Page Transitions

- Fade transition between routes (200ms)
- No slide, no parallax
- Respect `prefers-reduced-motion`

---

## Responsive Breakpoints

| Breakpoint | Width | Description |
|---|---|---|
| Mobile | < 768px | Single column, touch-optimized |
| Tablet | 768–1023px | Adaptive grid |
| Desktop | >= 1024px | Multi-column, wide layouts |

---

## Accessibility

- `prefers-color-scheme` media query
- `prefers-reduced-motion` media query
- Theme toggle: `aria-label` with current mode
- Focus visible: accent color outline (2px)
- Contrast ratio >= 4.5:1 for all text
- No theme flash on page load (inline script)

---

## Constraints

- Theme state in context/provider (not global store)
- Persist preference in `localStorage`
- Inline script in `<head>` to prevent flash
- CSS variables for all theme values
- No hardcoded colors in components
