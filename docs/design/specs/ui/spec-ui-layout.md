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
| Location | Navigation bar (right side); the mobile sheet carries a Dark/Light segmented control instead |
| Icon | Sun/Moon icon |
| Tooltip | Current mode (dark/light) |
| Click behavior | Toggle: dark ↔ light — the `system` variant was removed (`src/hooks/useTheme.tsx:4`) |

### Theme Palette

| Property | Value |
|---|---|
| Location | Navigation bar (right side, the last of the three appearance controls — after the mode toggle) at **every** width — the control is not hidden at ≤1024px (Q14) — plus the Theme color row, the last of three rows in the mobile sheet's Appearance group (Language → Mode → Theme color), while the sheet is open |
| Control | Bar: `ThemePaletteMenu` (`src/components/layout/ThemePaletteMenu.tsx`), icon-only trigger — a 20px half-circle swatch (active palette's accent left, `--swatch-empty` right), no text and no chevron, name in `aria-label`, hint in `title` — opening the `#palette-menu` panel. Sheet: rendered by `MobileMenu.tsx` from `paletteIds` + `paletteMeta` as `.mobile-menu-swatch-option` buttons — the Mode/Language segmented-row shape, options drawn as colour icons |
| Options | `red` (default) / `blue` — `src/data/palettes.ts` (`paletteIds`, `paletteMeta.label`/`hint`), written to `data-palette` on `<html>`; the sheet lists both, one colour icon each |
| Chrome | The bar's three controls share `.nav-control` (44px bordered box, accent border + text on hover/open, one `:focus-visible`); `.nav-actions` order is language → mode → theme color → hamburger at every width (Q16 of `specs/v3/spec-v3-mobile-navigation.md`), with a `@media (max-width: 420px)` guard so the row fits 320px |

Spec: `specs/v3/spec-v3-theme-palette-switch.md`.

### Mobile Menu Sheet

| Property | Value |
|---|---|
| Trigger | Hamburger button in the bar, ≤1024px |
| Groups | Menu (6 routes) → Appearance (Language, Mode, Theme color) → Connect (GitHub, LinkedIn, email) |
| Behaviour | `role="dialog"` + `aria-modal="true"`, Escape closes from any focus position, `#main-content` / `.footer` / `.back-to-top` are `inert` while open, body scroll locked |

Spec: `specs/v3/spec-v3-mobile-navigation.md`.

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

The navigation bar collapses to the hamburger + sheet at **≤1024px** (`src/App.css` `@media (max-width: 1024px)`), not at 768px. 768px governs single-column content layouts only.

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
