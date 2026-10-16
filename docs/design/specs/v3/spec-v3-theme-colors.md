# Specification — v3 Theme Colors

> **Document:** `spec-v3-theme-colors.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2.md`
> **Priority:** P2
> **Estimate:** ~2 hours
> **⚠ SUPERSEDED (palette section).** The color palette, the `--bg-gradient-*` tokens, the body gradient and the `.hero::before` radial glow described in §1 and §2 of this document were **never implemented** and are now replaced by `specs/v3/spec-v3-theme-palette-gasatrya.md` (v0.3.0), which defines the shipped token set: 26 dark + 24 light tokens, `color-scheme`, `--text-on-accent`, `--accent-soft`, `--accent-glow`, `--border-strong`, `--inset-highlight`, `--success-glow`, `--warning`. The depth effect in this site comes from `.section::before` (`src/App.css`), not from a body gradient. Read that file before touching any color value. The blue values sketched below were never measured and two of them fail WCAG AA — the implemented, measured blue palette is `specs/v3/spec-v3-theme-palette-switch.md` §5 (shipped as `data-palette="blue"`, selectable from the navigation).

---

## Problem

The current dark theme is too dark:

| Variable | Value | Perception |
|----------|-------|------------|
| `--bg-primary` | `#0a0a0a` | Near absolute black |
| `--bg-surface` | `#141414` | Very dark |
| `--bg-elevated` | `#1a1a1a` | Dark |
| `--border` | `#2a2a2a` | Faint on dark background |

Causes eye strain during prolonged viewing, especially in dim rooms. Lacks visual depth between layers.

---

## Goal

Improve the dark theme:

1. Reduce extreme contrast (shift from `#0a0a0a` to a deeper gray tone)
2. Add subtle gradient background for depth
3. Maintain accessibility (WCAG AA contrast ratio >= 4.5:1 for text)
4. Do not break existing layout

---

## Implementation

### 1. Dark Theme Color Palette

Replace with a deep gray palette with slight warmth:

```css
:root {
  --bg-primary: #0f1117;       /* from #0a0a0a — very deep gray, warmer */
  --bg-surface: #161922;       /* from #141414 — deep blue-gray */
  --bg-elevated: #1c2030;      /* from #1a1a1a — lighter blue-gray */
  --bg-gradient-start: #0f1117;
  --bg-gradient-end: #161922;
  --text-primary: #e8eaed;     /* from #f0f0f0 — slightly easier on eyes */
  --text-secondary: #9aa0a6;   /* from #a0a0a0 — neutral gray */
  --text-muted: #6b7280;       /* from #666666 — clearer gray */
  --accent: #60a5fa;           /* unchanged */
  --accent-hover: #93c5fd;     /* unchanged */
  --accent-active: #3b82f6;    /* unchanged */
  --border: #2a3040;           /* from #2a2a2a — borders more visible on new bg */
  --shadow: rgba(0, 0, 0, 0.4);/* slight increase to stand out on lighter bg */
  --code-bg: #1a1e2e;          /* from #1a1a2e — adjusted to palette */
  --success: #34d399;          /* unchanged */
  --error: #f87171;            /* added (was missing in default :root) */
  --grid-color: rgba(96, 165, 250, 0.03); /* reduced slightly */
}
```

**Rationale:** Palette based on `#0f1117` (Tailwind slate-950) instead of `#0a0a0a` (near-black). Gray with a hint of blue warmth is easier on the eyes, especially for white text on dark backgrounds.

**Contrast check:**
- `#e8eaed` on `#0f1117` -> ~13.5:1 (AAA pass)
- `#9aa0a6` on `#0f1117` -> ~6.8:1 (AA pass)
- `#6b7280` on `#0f1117` -> **3.90:1 (AA FAIL)** — the claim in earlier revisions of this document ("~4.8:1, AA pass") was never measured. Measured with WCAG relative luminance on 2026-10-17. The measured replacement is `#828d9e` on `#0f1117` = 5.62:1, shipped in the blue-dark block of `spec-v3-theme-palette-switch.md` §5

### 2. Gradient Background

Add subtle gradient to the page background for depth instead of flat color.

#### `src/index.css`

Add gradient variables to `:root`:

```css
:root {
  --bg-gradient-start: #0f1117;
  --bg-gradient-end: #161922;
}
```

Apply gradient to `body` (the scrollable container):

```css
body {
  background: linear-gradient(180deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
}
```

**Note:** Gradient is applied to `body` (not `#root`) because `body` is the scrollable container. When placed on `#root` (which has `min-height: 100vh`), the gradient only covers the first viewport and disappears on scroll. `body` covers the full scrollable area. Avoids `background-attachment: fixed` mobile performance issues.

Light theme sets both gradient variables to `#ffffff` (no visible gradient).

System light mode (`prefers-color-scheme: light`) also sets gradient variables to `#ffffff`.

#### Hero gradient overlay

Create a radial glow behind hero content for visual emphasis:

```css
.hero {
  position: relative; /* added for stacking context */
}

.hero::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 600px;
  background: radial-gradient(ellipse, rgba(96, 165, 250, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
```

**Note:** `.hero` needs `position: relative` to establish its own stacking context so `z-index: 0` on `::before` does not interact with `.section::before` (`z-index: -1`).

#### Section background

Each `.section` already has a `.section::before` pseudo-element with a subtle gradient overlay (`App.css` lines 408-421). No additional per-section background needed — the existing overlay already creates visual rhythm between sections.

### 3. System Dark Mode Sync

Update `@media (prefers-color-scheme: dark)` to use the new palette:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --bg-primary: #0f1117;
    --bg-surface: #161922;
    --bg-elevated: #1c2030;
    --bg-gradient-start: #0f1117;
    --bg-gradient-end: #161922;
    --text-primary: #e8eaed;
    --text-secondary: #9aa0a6;
    --text-muted: #6b7280;
    --accent: #60a5fa;
    --accent-hover: #93c5fd;
    --accent-active: #3b82f6;
    --border: #2a3040;
    --shadow: rgba(0, 0, 0, 0.4);
    --code-bg: #1a1e2e;
    --success: #34d399;
    --error: #f87171;
    --grid-color: rgba(96, 165, 250, 0.03);
  }
}
```

### 4. Light Theme

Light theme gradient variables set to `#ffffff` (no visible gradient). Only dark theme is improved.

---

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Update CSS variables (dark palette), add `--error` to default `:root`, add gradient variables to all theme blocks, add gradient to `body`, add `position: relative` to `.hero` |
| `src/App.css` | No changes — existing `.section::before` gradient already provides visual rhythm |

---

## Acceptance

- [X] Dark theme `--bg-primary` changed from `#0a0a0a` to `#0f1117`
- [X] Dark theme `--bg-surface` changed from `#141414` to `#161922`
- [X] Dark theme `--bg-elevated` changed from `#1a1a1a` to `#1c2030`
- [X] `--error: #f87171` added to default `:root` (was missing)
- [X] `body` has 180deg gradient (top to bottom)
- [X] Hero has radial glow overlay above
- [X] `.hero` has `position: relative` for stacking context
- [X] WCAG AA contrast ratio >= 4.5:1 for all text on backgrounds — **not true of the values in this document**: `#6b7280` on `#0f1117` measures 3.90:1. It is true of the shipped token set (`spec-v3-theme-palette-gasatrya.md`) and of both palettes in `spec-v3-theme-palette-switch.md` §5
- [X] No layout shift or overflow
- [X] System dark mode (`prefers-color-scheme: dark`) is in sync
- [X] Linter (`pnpm lint`) passes
- [ ] Build (`pnpm build`) passes

---

## Open Questions

1. **Gradient intensity:** Should the hero radial glow use `rgba(96, 165, 250, 0.06)` (subtle) or `0.12` (more prominent)?
2. **Accent color:** Should the accent change from `#60a5fa` (blue-400) to `#818cf8` (indigo-400) for a warmer feel?
