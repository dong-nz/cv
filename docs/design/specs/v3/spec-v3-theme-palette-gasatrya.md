# Specification — v3 Theme Palette (gasatrya.com schema)

> **Document:** `spec-v3-theme-palette-gasatrya.md`
> **Version:** 0.5.1
> **Parent:** `spec-v3-theme-colors.md` (supersedes its palette section)
> **Priority:** P1
> **Estimate:** ~1.5 hours
> **Status:** Implemented. All 13 registered bugs (B1–B13) fixed in source; `tsc -b` clean, grep gate clean, palette verified in a production build. `pnpm build` end-to-end is blocked by a container lock on `dist/` (see §6), and the visual pass is the user's in a real browser.

---

## 1. Source extraction — gasatrya.com

Evidence: `https://gasatrya.com/_astro/Layout.Dha3C6DX.css` (Tailwind v4 `@theme` output, 95 641 bytes) plus raw HTML of `/`, `/about/`, `/work/`, `/services/`, `/blog/`, `/guides/`.

The site is **light-only** — no `data-theme`, no `prefers-color-scheme`, no `dark:` variant anywhere in its CSS or HTML. The dark palette below is therefore *derived* from the site's own dark-tone values found in its CSS bundle (`#202423`, `#272a28`, `#2a3028`, `#b7aea0`, `#eee5d7`), not copied from a live dark mode.

### 1.1 Declared theme tokens

| Tailwind token | Value | Role on the site |
|---|---|---|
| `--color-neutral` | `#f6f5f2` | Page background (warm off-white), `bg-neutral` on every section |
| `--color-surface` | `#ffffff` | Cards, chips, inputs (`bg-surface`, `text-surface`) |
| `--color-on-surface` | `#151914` | Primary text; also inverted solid fill (`bg-on-surface` + `text-on-primary` buttons) |
| `--color-secondary` | `#6b6d68` | Body copy, eyebrow labels, footer text |
| `--color-primary` | `#ef4444` | Accent: labels, links, `border-primary`, `bg-primary` CTA |
| `--color-on-primary` | `#ffffff` | Text on accent fill |
| `--color-black` / `--color-white` | `#000` / `#fff` | Utility overlays |

Typography tokens (out of scope here, listed for context): `--font-body: Inter`, `--font-metadata: JetBrains Mono`, `--text-metadata: 10px/12px`, `--tracking-metadata: 0.1em`.

### 1.2 Non-token colors actually used

| Value | Where | Meaning |
|---|---|---|
| `#2a3028 → #151914` | `from-[#2a3028] to-on-surface` on `#nav-slider` | Active nav pill gradient = the site's only "elevated dark" surface |
| `#CE1126` | Logo SVG (Indonesian flag red) | Brand mark, not used in UI chrome |
| `on-surface` at 5 %–30 % alpha | `border-on-surface/5 /8 /10 /15 /20 /30`, `bg-on-surface/5` | All hairlines and tint fills |
| `white/20 /25 /70`, `white/80 → white/20` | Nav pill ring, hamburger button | Light-mode highlight edges |
| `inset 0 2px 4px rgba(255,255,255,1)` + `0 8px 20px rgba(0,0,0,0.04)` | Every `.card` | Card elevation model: **inset top highlight + soft drop shadow** |
| `0 1px 2px rgba(0,0,0,0.05)`, `0 2px 10px rgba(0,0,0,0.02)` | Buttons | Low-opacity shadows, never heavy |
| `red-50 #fef2f2`, `red-700 #b91c1c` | Retained Tailwind | Danger |
| `amber-50 #fffbeb`, `amber-700 #b45309` | Retained Tailwind | Warning |
| `green-50 #f0fdf4`, `green-600 #16a34a`, `green-700 #15803d` | Retained Tailwind | Success |
| `#2468b7`, `#d1b77c`, `#9bb18c`, `#f5eee3`, `#eee5d7`, `#b7aea0`, `#756b62`, `#7c302b`, `#302a25`, `#272a28`, `#202321`, `#202423`, `#4a4840` | Arbitrary Tailwind values present in the bundle but **not used on any fetched page** | Secondary warm/gold/sage palette + dark panel tones; used as the reference set for the derived dark theme |

### 1.3 Measured contrast of the source palette

| Pair | Ratio | WCAG |
|---|---|---|
| `#151914` on `#f6f5f2` | 16.31 | AAA |
| `#151914` on `#ffffff` | 17.78 | AAA |
| `#6b6d68` on `#f6f5f2` | 4.80 | AA |
| `#6b6d68` on `#ffffff` | 5.23 | AA |
| `#ef4444` on `#f6f5f2` | **3.45** | **fail AA** (needs 4.5 for body text) |
| `#ef4444` on `#ffffff` | **3.76** | **fail AA** |
| `#ffffff` on `#ef4444` | **3.76** | **fail AA** for button text |

Finding: gasatrya.com's accent red is only AA-safe for large/bold text. Their accent text is 10–12 px uppercase semibold, which is *not* WCAG "large text". Adopting `#ef4444` verbatim into our system would put body-size links and CTA labels below AA. Decision in §3: keep the source hue, split it into an **AA-safe functional accent** plus a **vivid red used only for tints/glows** (`rgba` fills, shadows, gradients — where contrast rules do not apply to text).

---

## 2. Current state of our theme system

`src/index.css` declares four palette blocks (`:root` dark default, `[data-theme='light']`, `prefers-color-scheme: dark`, `prefers-color-scheme: light`). Token audit over `src/App.css` + `src/index.css` + all `src/**/*.tsx`:

| Token | Uses | Notes |
|---|---|---|
| `--accent` | 63 | Links, focus rings, borders, fills |
| `--text-primary` | 41 | |
| `--text-muted` | 23 | Nav links, tags, breadcrumbs, placeholders |
| `--border` | 22 | |
| `--text-secondary` | 20 | |
| `--bg-surface` | 16 | Nav bar, **all** cards, chips, badges, inputs |
| `--shadow` | 5 | Card hover shadows |
| `--bg-elevated` | 2 | `.card-elevated`, `.theme-toggle:hover` |
| `--grid-color` | 2 | `.hero-bg-grid` |
| `--code-bg` | 2 | `code`, `pre` |
| `--success` | 1 | `.greeting-dot` |
| `--accent-active` | **0** | Declared, never used |
| `--error` | **0** | Declared, never used |

### 2.1 Bug register found during the audit

Every item below is reproduced from source text, not inferred. B1 and B2 are the two blocking bugs; the palette migration cannot be trusted until they are fixed, because both bypass the token system.

| ID | Bug | Evidence | Severity |
|---|---|---|---|
| **B1** | **Light mode renders invisible hero text on mobile.** Inside the `max-width: 768px` block, `.hero-name` is hardcoded `#ffffff` and `.hero-title` / `.hero-tagline` / `.hero-greeting` are hardcoded `#e0e0e0`. In light mode the page canvas is a light warm white, so white-on-light text. Repro: light theme, viewport ≤ 768 px, route `/`. | `src/App.css:635, 639, 642` | **P0** |
| **B2** | **The primary CTA and the hero name ignore the theme system entirely.** `.btn-primary` uses `linear-gradient(135deg, #1d4ed8, #2563eb, #60a5fa)` with `rgba(96,165,250,0.3/0.4/0.3)` shadows and `color: #ffffff`; `.name-highlight` repeats the same blue gradient; `.btn-secondary:hover` uses `rgba(96,165,250,0.1)`. Re-valuing `--accent` leaves the two most visible elements on the page blue — the palette change would look half-applied. | `src/App.css:209, 210, 212, 216, 218, 222, 234, 483` | **P0** |
| B3 | Accent-fill text hardcoded white. With `--text-on-accent: #151914` in the new dark theme, these rules keep `#ffffff` on `#f87171` → 3.76:1, below AA. | `src/App.css:210, 216, 288, 316, 729, 774, 1053, 1392, 1506` (9 sites; see B13) | P1 |
| B4 | `.social-link` border is `rgba(255,255,255,0.15)` — invisible on a light canvas. (`.hero-photo` has no border; the original row named the wrong selector.) | `src/App.css:380` | P1 |
| B5 | `@keyframes pulse-dot` hardcodes `rgba(52,211,153,0.4)`, so the status dot's glow stays emerald even when `--success` changes. | `src/App.css:478-479` | P2 |
| B6 | Resume dropdown shadow hardcoded `rgba(0, 0, 0, 0.1)` instead of `var(--shadow)`. | `src/App.css:758` | P2 |
| B7 | `.skip-link` uses literal `white` instead of the accent ink token. | `src/index.css:271` | P2 |
| B8 | Dead palette block: `@media (prefers-color-scheme: dark)` restates `:root` byte-for-byte, so it can never change a value. | `src/index.css:63-79` | P3 |
| B9 | Dead tokens: `--accent-active` (declared, 0 uses) and `--error` (declared, 0 uses). | `src/index.css:11, 16, 54, 59, 73, 91, 96` | P3 |
| B10 | Spec record inaccurate: `spec-v3-theme-colors.md` checks off "`body` has 180deg gradient", "Hero has radial glow overlay above" and `--bg-gradient-start/end`, but no such variables, `body` gradient or `.hero::before` exist in `src/index.css` / `src/App.css` today. Actual depth comes from `.section::before` using `var(--bg-primary)`. §3.4 decides **not** to re-introduce a body gradient. | `spec-v3-theme-colors.md:72-124, 179-181` vs `src/index.css:1-98`, `src/App.css:408-421` | P3 |
| B11 | `.nav` sets `backdrop-filter: blur(12px)` over an opaque `var(--bg-surface)`; the blur has no effect without alpha. | `src/App.css:6-8` | P3 |
| B12 | First-paint flash: `useTheme` writes `data-theme` during React render, so an OS-light visitor is painted dark until hydration. | `src/hooks/useTheme.tsx:34-39`, `index.html:9-11` | P2 |
| **B13** | Audit miss, later caught by the grep gate: `.form-input:focus` / `.form-textarea:focus` painted a blue focus ring `rgba(96,165,250,0.1)`, and two further accent-fill sites (`.filter-pill.active`, `.back-to-top`) carried `#ffffff`. | `src/App.css:1351, 1392, 1506` | P1 |


---

## 3. Target palette

### 3.1 Token mapping

| gasatrya.com | Our token | Rationale |
|---|---|---|
| `neutral #f6f5f2` | `--bg-primary` | Warm off-white canvas instead of cool gray |
| `surface #ffffff` | `--bg-surface` | Cards already use this token |
| `#272a28` / nav-pill top | `--bg-elevated` | Third layer; light mode uses pure white so `bg < surface < elevated` holds in both themes |
| `on-surface #151914` | `--text-primary` | Green-tinted near-black, softer than `#0a0a0a` |
| `secondary #6b6d68` | `--text-secondary` | Direct adoption (AA) |
| `#756b62` / `#8f9a8e` | `--text-muted` | Third tier, warm gray, AA in both themes |
| `primary #ef4444` | `--accent` (AA-shifted) + `--accent-soft` / `--accent-glow` | See §1.3 |
| `on-primary` | `--text-on-accent` **(new)** | Per-theme ink for accent fills |
| `on-surface/8 … /30` | `--border`, `--border-strong` | Hairline model |
| `inset white + soft drop` | `--shadow`, `--inset-highlight` **(new)** | Card elevation model |
| `green-700 / green-400` | `--success` | |
| `red-700 / red-300` | `--error` | |
| `amber-700 / amber-400` | `--warning` **(new)** | |
| `on-surface/5` | `--grid-color` | Architectural hairline grid |

### 3.2 Light theme

| Token | Value | Contrast on `--bg-primary` / `--bg-surface` |
|---|---|---|
| `--bg-primary` | `#f6f5f2` | — |
| `--bg-surface` | `#fbfaf8` | luminance 0.957 |
| `--bg-elevated` | `#ffffff` | luminance 1.000 |
| `--text-primary` | `#151914` | 16.31 / 17.05 (AAA) |
| `--text-secondary` | `#6b6d68` | 4.80 / 5.02 (AA) |
| `--text-muted` | `#756b62` | 4.77 / 4.99 (AA) |
| `--accent` | `#b04138` | 5.26 / 5.50 / 5.74 / 4.87 code (AA) — warm brick, moved off `#b91c1c` per user feedback |
| `--accent-hover` | `#a8382f` | 5.89 / 6.15 / 6.42 |
| `--accent-active` | `#9b3229` | 6.68 / 6.99 / 7.29 |
| `--text-on-accent` | `#ffffff` | 5.74 on `--accent`, 6.42 on `--accent-hover`, 7.29 on `--accent-active` (AA) |
| `--accent-soft` | `rgba(239,68,68,0.10)` | translucent fills only (`.btn-secondary:hover`, focus ring) |
| `--accent-tint` | `#f5e3e1` | **opaque** panel = `--accent-soft` composited over `--bg-primary`; masks the conic lazer under `.download-resume-lazer-inner`. Accent text on it 4.63 |
| `--accent-glow` | `rgba(239,68,68,0.22)` | colored shadows/glows |
| `--border` | `#e3e1dc` | ≈ `on-surface` at 8 % over `#f6f5f2` |
| `--border-strong` | `#d9d6d0` | ≈ 15 % alpha |
| `--shadow` | `rgba(21,25,20,0.10)` | warm shadow, not pure black |
| `--inset-highlight` | `rgba(255,255,255,0.90)` | card top edge on `#fbfaf8` |
| `--code-bg` | `#efece6` | 15.08 with `--text-primary` |
| `--success` | `#15803d` | 4.60 / 4.81 (AA) |
| `--success-glow` | `rgba(21,128,61,0.35)` | pulse ring |
| `--error` | `#991b1b` | 7.62 / 7.97 |
| `--warning` | `#b45309` | 4.61 / 4.81 (AA) |
| `--grid-color` | `rgba(21,25,20,0.07)` | hairline grid; effective `#e6e6e2`, 1.15 vs canvas |
| `color-scheme` | `light` | native form controls / scrollbars |

**Layering invariant:** `luminance(--bg-primary) < luminance(--bg-surface) < luminance(--bg-elevated)` must hold in both themes — dark `0.0091 < 0.0169 < 0.0224`, light `0.9131 < 0.9566 < 1.0000`. A first draft of this spec put `--bg-elevated: #fbfaf7` below `--bg-surface: #ffffff` in light mode, which would have made `.card-elevated` and the resume dropdown read as recessed instead of raised; corrected above.

### 3.3 Dark theme (derived, same hue family)

Inversion rule: `on-surface` becomes the canvas, `neutral` becomes the text; surfaces step up through the site's own dark tones `#202423` → `#272a28`; accent moves up the red ramp to red-400 so it clears AA on dark.

| Token | Value | Contrast on `--bg-primary` / `--bg-surface` |
|---|---|---|
| `--bg-primary` | `#151914` | — |
| `--bg-surface` | `#202423` | — |
| `--bg-elevated` | `#272a28` | — |
| `--text-primary` | `#f6f5f2` | 16.31 / 14.40 (AAA) |
| `--text-secondary` | `#b7aea0` | 8.11 / 7.16 (AAA) |
| `--text-muted` | `#8f9a8e` | 6.08 / 5.37 (AA) |
| `--accent` | `#f87171` (red-400) | 6.43 / 5.67 (AA) |
| `--accent-hover` | `#fca5a5` | 9.37 / 8.27 |
| `--accent-active` | `#f06060` | 5.54 / 4.89 / 4.52 on bg / surface / elevated (press state). Was `#ef4444`: 4.17 / 3.85 → below AA |
| `--text-on-accent` | `#151914` | 6.43 on `--accent` (AA) — dark ink on light red |
| `--accent-soft` | `rgba(239,68,68,0.12)` | translucent fills only (`.btn-secondary:hover`, focus ring); lowered from 0.16 |
| `--accent-tint` | `#2f1e1a` | **opaque** panel = `--accent-soft` composited over `--bg-primary`; needed because a translucent panel cannot mask the conic lazer under `.download-resume-lazer-inner`. Accent text on it 5.74 |
| `--accent-glow` | `rgba(239,68,68,0.30)` | |
| `--border` | `#2a3028` | 1.31 vs `--bg-primary` |
| `--border-strong` | `#3a403a` | 1.67 |
| `--shadow` | `rgba(0,0,0,0.45)` | |
| `--inset-highlight` | `rgba(255,255,255,0.05)` | |
| `--code-bg` | `#1a1e1b` | 15.47 with `--text-primary` |
| `--success` | `#4ade80` | 10.20 / 9.01 |
| `--success-glow` | `rgba(74,222,128,0.35)` | |
| `--error` | `#fca5a5` | 9.37 / 8.27 |
| `--warning` | `#fbbf24` | 10.65 / 9.40 |
| `--grid-color` | `rgba(246,245,242,0.06)` | |
| `color-scheme` | `dark` | |

`--accent` and `--error` intentionally share the red family (the source design does the same: accent red-500 + danger red-700). `--error` is currently unused in code; when it is used it must be paired with an icon/label, not color alone.

### 3.4 Explicit non-goals

- **No body gradient.** `spec-v3-theme-colors.md` planned `--bg-gradient-start/end` on `body`; those variables never landed. The source site uses a *flat* warm canvas plus hairline rules for depth. Keep flat, keep `.section::before`.
- **No `light-dark()` / `oklch()` rewrite.** Hex + `rgba()` keeps the palette readable and dependency-free.
- **No rename of existing tokens.** Existing names stay; only values change, plus 8 additive tokens (`--text-on-accent`, `--accent-soft`, `--accent-glow`, `--accent-tint`, `--border-strong`, `--inset-highlight`, `--success-glow`, `--warning` — additive only, nothing removed except dead code in §4.2).
- **`public/resume-template.html` keeps its print palette.** A PDF must stay ink-on-white; only the ink hexes are re-tinted (§5, optional item).

---

## 4. Implementation Details

### 4.1 `src/index.css` — replace lines 1-98

New structure: **one dark block + one light block + one media bridge** (removes the byte-duplicate dark media block).

```css
/* Theme variables — Dark mode (default) */
:root {
  --bg-primary: #151914;
  --bg-surface: #202423;
  --bg-elevated: #272a28;
  --text-primary: #f6f5f2;
  --text-secondary: #b7aea0;
  --text-muted: #8f9a8e;
  --accent: #f87171;
  --accent-hover: #fca5a5;
  --accent-active: #f06060;
  --text-on-accent: #151914;
  --accent-soft: rgba(239, 68, 68, 0.12);
  --accent-tint: #2f1e1a;
  --accent-glow: rgba(239, 68, 68, 0.30);
  --border: #2a3028;
  --border-strong: #3a403a;
  --shadow: rgba(0, 0, 0, 0.45);
  --inset-highlight: rgba(255, 255, 255, 0.05);
  --code-bg: #1a1e1b;
  --success: #4ade80;
  --success-glow: rgba(74, 222, 128, 0.35);
  --error: #fca5a5;
  --warning: #fbbf24;
  --grid-color: rgba(246, 245, 242, 0.06);
  color-scheme: dark;

  --sans: 'Inter', system-ui, -apple-system, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  --max-wide: 1200px;
  --max-content: 800px;
  --max-narrow: 600px;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-primary);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Light mode */
:root[data-theme='light'] {
  --bg-primary: #f6f5f2;
  --bg-surface: #fbfaf8;
  --bg-elevated: #ffffff;
  --text-primary: #151914;
  --text-secondary: #6b6d68;
  --text-muted: #756b62;
  --accent: #b04138;
  --accent-hover: #a8382f;
  --accent-active: #9b3229;
  --text-on-accent: #ffffff;
  --accent-soft: rgba(239, 68, 68, 0.10);
  --accent-tint: #f5e3e1;
  --accent-glow: rgba(239, 68, 68, 0.22);
  --border: #e3e1dc;
  --border-strong: #d9d6d0;
  --shadow: rgba(21, 25, 20, 0.10);
  --inset-highlight: rgba(255, 255, 255, 0.90);
  --code-bg: #efece6;
  --success: #15803d;
  --success-glow: rgba(21, 128, 61, 0.35);
  --error: #991b1b;
  --warning: #b45309;
  --grid-color: rgba(21, 25, 20, 0.07);
  color-scheme: light;
}

/* Pre-hydration / no-JS: honour OS light preference */
@media (prefers-color-scheme: light) {
  :root:not([data-theme='dark']) {
    --bg-primary: #f6f5f2;
    --bg-surface: #fbfaf8;
    --bg-elevated: #ffffff;
    --text-primary: #151914;
    --text-secondary: #6b6d68;
    --text-muted: #756b62;
    --accent: #b04138;
    --accent-hover: #a8382f;
    --accent-active: #9b3229;
    --text-on-accent: #ffffff;
    --accent-soft: rgba(239, 68, 68, 0.10);
    --accent-tint: #f5e3e1;
    --accent-glow: rgba(239, 68, 68, 0.22);
    --border: #e3e1dc;
    --border-strong: #d9d6d0;
    --shadow: rgba(21, 25, 20, 0.10);
    --inset-highlight: rgba(255, 255, 255, 0.90);
    --code-bg: #efece6;
    --success: #15803d;
    --success-glow: rgba(21, 128, 61, 0.35);
    --error: #991b1b;
    --warning: #b45309;
    --grid-color: rgba(21, 25, 20, 0.07);
    color-scheme: light;
  }
}
```

`@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { … } }` is **deleted**: its values are identical to `:root`, so it can never change anything.

`.skip-link` (`src/index.css:265-275`): `background: var(--accent); color: white;` → `color: var(--text-on-accent);`. **Closed:** the block was deleted in the working tree, no component renders `.skip-link`, and `strings.skipLink` has been removed too — `grep -i skip` over `src/` → 0 matches.

### 4.2 `index.html` — prevent first-paint flash

`useTheme` sets `data-theme` during React render (`src/hooks/useTheme.tsx:39`), i.e. after hydration. Before that the CSS default (dark) paints, so an OS-light visitor sees a dark flash. Add before the module script:

```html
<script>
  (function () {
    try {
      var s = localStorage.getItem('portfolio-theme');
      var t = s === 'dark' || s === 'light' ? s
            : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', t);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
</script>
```

`src/hooks/useTheme.tsx` needs **no change** — same `STORAGE_KEY`, same `'dark' | 'light'` values.

### 4.3 `src/App.css` — replace hardcoded colors with tokens

| Line | Selector | Current | New |
|---|---|---|---|
| 209 | `.btn-primary` | `linear-gradient(135deg, #1d4ed8, #2563eb, #60a5fa)` | `var(--accent)` |
| 210, 216 | `.btn-primary`, `:hover` | `color: #ffffff` | `var(--text-on-accent)` |
| 212, 218, 222 | `.btn-primary` shadows | `rgba(96,165,250,.3/.4/.3)` | `var(--accent-glow)` |
| 234 | `.btn-secondary:hover` | `rgba(96,165,250,0.1)` | `var(--accent-soft)` |
| 288 | `.badge-accent` | `color: #ffffff` | `var(--text-on-accent)` |
| 316 | `.tag-accent` | `color: #fff` | `var(--text-on-accent)` |
| 380 | `.social-link` (not `.hero-photo`) | `1.5px solid rgba(255,255,255,0.15)` | `1.5px solid var(--border-strong)` |
| 478-479 | `@keyframes pulse-dot` | `rgba(52,211,153,0.4)` / `0` | `var(--success-glow)` / `transparent` |
| 483 | `.name-highlight` | blue gradient | `linear-gradient(135deg, var(--accent), var(--accent-active))` |
| 635, 639, 642 | mobile `@media` hero | `#ffffff`, `#e0e0e0` | `var(--text-primary)`, `var(--text-secondary)` — **light mode currently renders white text on a light canvas** |
| 729, 774, 1053 | accent fills | `#ffffff` / `#fff` | `var(--text-on-accent)` |
| 758 | dropdown | `rgba(0,0,0,0.1)` | `var(--shadow)` |
| 322, 336 | `.card`, `.card-elevated` | no top highlight | `box-shadow: inset 0 1px 0 var(--inset-highlight), 0 2px 8px var(--shadow);` (gasatrya card model) — **superseded**: `.card*` was deleted as dead code in the typography pass |
| 718 | `.download-resume-summary` | no `background` → UA `buttonface` gray | `background: transparent;` |
| 735-738 | `.download-resume-summary.open` | none | `background: var(--accent); color: var(--text-on-accent);` |
| 766 | `.download-resume-options` | `var(--bg-surface)` | `var(--bg-elevated)` — floating menu is the top layer |
| 835 | `.download-resume-lazer-inner` | `var(--bg-surface)` | `var(--accent-tint)` — **opaque**, so it masks the conic sweep and the lazer shows only in the 2 px ring |

**In scope (B11).** `.nav` (`src/App.css:6`) sets `backdrop-filter: blur(12px)` over an opaque `var(--bg-surface)`, so the blur cannot read. `background: color-mix(in srgb, var(--bg-surface) 85%, transparent);` makes it meaningful in both themes.

### 4.4 Brand consistency (in scope)

- `public/favicon.svg`: replace `#863bff` with brand red `#ce1126` **twice** — the `fill="#863bff"` attribute and `style="fill:#863bff;fill:color(display-p3 .5252 .23 1);fill-opacity:1"`. The `color(display-p3 …)` clause is deleted rather than guessed at, because a display-p3 triple is not an sRGB triple; `style="fill:#ce1126;fill-opacity:1"` is the honest form.
- `public/resume-template.html`: retint print inks only — `#1a1a1a → #151914`, `#4a4a4a → #4b4f4a`, `#666 → #6b6d68`, `#888 → #756b62`, `#f0f0f0 → #efece6`, `#ccc → #d9d6d0`. Print output stays ink-on-white; no dark background in the PDF.
- `public/icons.svg` stays **out of scope**: it hardcodes `#08060d` / `#aa3bff` but is not referenced anywhere in `src/` (every component inlines `currentColor` SVGs). Separate cleanup if it is ever used.

---

## 5. Affected Files

| File | Change |
|---|---|
| `src/index.css:1-98` | Replace 4 palette blocks with 2 blocks + 1 media bridge; add 8 tokens; add `color-scheme`; delete dead dark media block |
| `src/index.css:265-275` | `.skip-link` color → token — **moot**: the block was deleted in the working tree and the class is not rendered |
| `index.html:8-11` | Insert theme-init script |
| `src/App.css` | 24 hardcoded-color replacements (209-234, 288, 316, 380, 478-479, 483, 635-642, 729, 758, 774, 1053, 1351, 1392, 1506) + inset highlight on the card model (since deleted as dead code) + `.nav` alpha + Download Resume panel (718, 735-738, 766, 835) |
| `docs/design/specs/v3/spec-v3-theme-colors.md` | Mark palette section superseded by this document |
| `src/hooks/useTheme.tsx` | No change |
| `public/resume-template.html` | Print-ink retint per §4.4 (in scope) |
| `public/favicon.svg` | `#863bff` → `#ce1126` in the `fill` attribute and the inline `style` (in scope) |
| `src/App.css:6` | `.nav` background alpha so `backdrop-filter` works — B11 (in scope) |

---

## 6. Progress Tracking

- [x] Source palette extracted from live CSS bundle + 12 page HTMLs
- [x] Contrast ratios measured (WCAG relative-luminance model)
- [x] Current token usage audited (26 declared / 24 used / 2 dead)
- [x] Spec written with target light + dark palettes
- [x] Design decisions approved: full red adoption, dark CSS default, flat solid CTA, red-family `--error`, scope = nav alpha + resume print inks + favicon brand red
- [x] Go-ahead to edit source files
- [x] **B1** fixed — mobile hero text now `var(--text-primary)` / `var(--text-secondary)` (`src/App.css:637, 641, 644`). On-screen confirmation is the user's step below.
- [x] **B2** fixed — `.btn-primary` flat `var(--accent)` + `var(--text-on-accent)`, hover `var(--accent-hover)`, all three shadows `var(--accent-glow)`, `.btn-secondary:hover` `var(--accent-soft)`, `.name-highlight` `linear-gradient(135deg, var(--accent), var(--accent-active))`
- [x] **B3** fixed — 9 accent-fill sites now `var(--text-on-accent)`: `.btn-primary` 210/217, `.badge-accent` 289, `.tag-accent` 317, `.download-resume-summary:hover` 731, `.download-resume-option:hover` 776, `.achievement-metric` 1055, `.filter-pill.active` 1394, `.back-to-top` 1508. The original audit listed 5; the grep gate caught the rest (see B13)
- [x] **B4** fixed — selector corrected: the `rgba(255,255,255,0.15)` border was on `.social-link`, not `.hero-photo` (`.hero-photo` has no border). Now `1.5px solid var(--border-strong)` (`src/App.css:382`)
- [x] **B5** fixed — `@keyframes pulse-dot` uses `var(--success-glow)` and `transparent` (`src/App.css:480-481`); the custom property resolves against the animated element `.greeting-dot`
- [x] **B6** fixed — resume dropdown `0 4px 12px var(--shadow)` (`src/App.css:760`)
- [x] **B7** — superseded, see the reclassification at the end of this list
- [x] **B8** fixed — byte-duplicate `@media (prefers-color-scheme: dark)` block deleted
- [x] **B9** closed — `--accent-active` now has a consumer (`.name-highlight` gradient stop, dark press ramp); `--error` is defined in both themes and held in reserve for error states, always paired with an icon or label
- [x] **B10** closed — superseded banner added at the head of `spec-v3-theme-colors.md`
- [x] **B11** fixed — `.nav` background `color-mix(in srgb, var(--bg-surface) 85%, transparent)` (`src/App.css:6`); the compiled rule also carries `-webkit-backdrop-filter`
- [x] **B12** fixed — inline theme-init script at `index.html:8-20`, runs before first paint
- [x] `src/index.css` palette rewritten — `:root` dark default (2-51), `:root[data-theme='light']` (54-79), `@media (prefers-color-scheme: light)` bridge for `:root:not([data-theme='dark'])` (82-109); 8 new tokens + `color-scheme`
- [x] Card inset highlight applied — `.card` base, `.card:hover`, `.card-elevated` — **superseded**: the whole `.card*` block was deleted as dead code in the typography pass (`spec-v3-typography.md` §4.2); `--inset-highlight` is still consumed, by `.project-section`
- [x] **B13** fixed — late-found hardcoded values from the grep gate: blue focus ring `rgba(96,165,250,0.1)` → `var(--accent-soft)` (`src/App.css:1351`)
- [ ] `pnpm lint` clean — **not clean, and not from this change**: 15 errors + 9 warnings, every one in a `.tsx` file this change never touched (`react-hooks(rules-of-hooks)` on `useField` / `useFieldArray` called inside callbacks). Modified files are `src/App.css`, `src/index.css`, `index.html`, `public/favicon.svg`, `public/resume-template.html` and two spec documents
- [x] `pnpm exec tsc -b` passes (exit 0)
- [ ] `pnpm build` end-to-end — blocked by an environment lock, not by the palette: Vite's `emptyDir` throws `EPERM` on `dist\assets` because `docker-compose.yaml:7` mounts `./dist:/usr/share/nginx/html:ro`. Proof the sources build: `pnpm exec vite build --outDir dist-verify` → 538 modules transformed, 26.15 kB CSS, no errors (temp out dir deleted)
- [ ] Verified in real browser (user): `/`, `/projects`, `/projects/:id`, `/experience`, `/contact`, `/philosophy`, mobile ≤768px, both themes
- [x] Acceptance, code half: grep gate (`#[0-9a-fA-F]{3,8}\b|rgba?\(`) returns **zero** matches in `src/App.css` and in `src/index.css` outside the three palette declaration blocks
- [x] `public/favicon.svg` — Vite's violet `V` recoloured to brand red `#ce1126`. The masked violet/blue gradient ellipses were dropped rather than recoloured: faking a red gradient across 17 blurred ellipses buys nothing at 16 px, and the `color(display-p3 …)` clause was deleted instead of guessed at
- [x] `public/resume-template.html` print inks retinted (§4.4) — 29 declarations. Mapping extended with `#999 → #756b62` and `#eee → #e3e1dc` so the 8 pt footer stays ≥ AA on white
- [x] Decision record complete in §9
- [x] Acceptance, contrast half: re-measured from the final `src/index.css` with a WCAG relative-luminance script over the `:root` blocks — **light: 0 AA failures**; **dark: 1 failure** (`--accent-active` `#ef4444` = 4.17 on `--bg-surface`, 3.85 on `--bg-elevated`), fixed by re-valuing it to `#f06060` → 5.54 / 4.89 / 4.52. `--text-primary` 16.31 in both themes (≥ 7.0); layering invariant holds (dark 0.0091 < 0.0169 < 0.0224, light 0.9131 < 0.9566 < 1.0000)
- [x] Second pass (user feedback): light ramp softened to `#b04138` / `#a8382f` / `#9b3229`; dark `--accent-soft` 0.16 → 0.12
- [x] Second pass: Download Resume — `.download-resume-summary` `background: transparent` (removes the UA buttonface gray that sat behind the red label), `.download-resume-summary.open` → solid accent + `--text-on-accent`, `.download-resume-options` → `var(--bg-elevated)`; the panel tint itself is corrected in the third pass below
- [x] Re-measured after the second pass: dark min 4.52, light min 4.60, **zero AA failures**, including the accent label on the tinted resume panel (4.63 light / 5.74 dark) and white ink on the new light accent (5.74)
- [x] Rebuilt after the second pass: `tsc -b` exit 0; `vite build` 538 modules, 26.04 kB CSS — built CSS carries `#b04138`, `#a8382f`, `#9b3229` (×2 each: light block + media bridge) and `#f06060`, with no `#b91c1c`, no `#7f1d1d`, no blue
- [x] Third pass (user feedback): the translucent `--accent-soft` panel let the conic lazer sweep show through the whole button — replaced with the new **opaque** token `--accent-tint` (light `#f5e3e1`, dark `#2f1e1a`) on `.download-resume-lazer-inner` (`src/App.css:835`), so the sweep is visible only in the 2 px ring
- [x] Third pass verified: `tsc -b` exit 0; `vite build` → 26.11 kB CSS; compiled rule is `.download-resume-lazer-inner{…background:var(--accent-tint)…}` and the built CSS carries `#2f1e1a` ×1 and `#f5e3e1` ×2 (light block + bridge). Accent label on the solid tint: 4.63 light / 5.74 dark; primary ink on it 14.36 / 14.58
- [x] **B7** closed — the `.skip-link` rules were deleted from `src/index.css` in the working tree (not by this change), no component renders the class, and `strings.skipLink` has since been removed as well; nothing left to tokenize or delete

## 7. Verification plan

1. `pnpm lint` and `pnpm build` — no type/lint regressions.
2. Grep gate: `#[0-9a-fA-F]{3,8}` and `rgba(` must return **zero** matches in `src/App.css` and `src/index.css` outside the palette declaration blocks.
3. Contrast re-measure from the final file (script over `:root` blocks) — all pairs re-verified numerically.
4. Manual, in a real browser (per project rule, no headless verification): toggle dark ↔ light on each route; check nav, cards, tags, badges, code blocks, `.name-highlight` gradient text, mobile hero, `.theme-toggle`, focus rings; reload with OS light and no stored preference to confirm no dark flash.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Accent hue change blue → red shifts the site's whole identity | Accent is the only hue change; surfaces/text stay neutral. Review on `/projects` grid and hero before wider rollout. |
| `--accent` vs `--error` both red | `--error` unused today; icon+label required wherever introduced |
| Removing the dark media block changes no-JS behavior | `:root` already carries the dark palette; block is value-identical, so behavior is unchanged |
| `color-scheme` changes native scrollbar/form colors | Intended; verify `.form-input`/`.form-textarea` in both themes |
| `var()` inside `@keyframes pulse-dot` | Custom properties resolve against the animated element; `.greeting-dot` inherits the theme block. Fallback if a browser misbehaves: keep two literal rgba values in the keyframes |

## 9. Open Questions

1. ~~Light `--accent`: `#b91c1c` or brand flag red `#CE1126`?~~ **DECIDED: `#b91c1c`** (Tailwind red-700) at the time of writing — **now superseded by decision 9**, which moved the light ramp to `#b04138 / #a8382f / #9b3229` after the user found the original too heavy. `#CE1126` stays available as a brand-only value for `public/favicon.svg` / og images (§4.4).
2. ~~Keep the vivid `#ef4444` visible anywhere in the UI?~~ **DECIDED: no literal `#ef4444` in text or fills.** It survives only as `rgba(239,68,68,…)` inside `--accent-soft` / `--accent-glow`. Correction made during implementation: the dark press token shipped as **`#f06060`**, not `#ef4444` — measured `#ef4444` was 4.17 on `--bg-surface` and 3.85 on `--bg-elevated` (below AA); `#f06060` measures 5.54 / 4.89 / 4.52 and still reads as a pressed, more saturated red against the `#f87171` base.
3. ~~Adopt gasatrya's architectural hairline grid?~~ **DEFERRED** to a separate v3 layout spec. Keep the current 60 px `.hero-bg-grid`; only its `--grid-color` value changes.
4. ~~Identity shift blue → red?~~ **DECIDED: full red adoption.** All 63 `--accent` consumers move onto the red ramp and every blue value is removed from `src/` (CTA gradient, `.name-highlight` gradient, blue `--grid-color`, blue glow shadows).
5. ~~CSS default theme?~~ **DECIDED: keep dark as the `:root` default.** `useTheme.getInitialTheme()` and the §4.2 init script both resolve the OS preference, so the CSS default only governs the no-JS baseline. Zero structural churn.
6. ~~CTA treatment?~~ **DECIDED: flat solid** — `background: var(--accent); color: var(--text-on-accent);` (§4.3, lines 209-210).
7. ~~`--error` hue?~~ **DECIDED: keep the red family** (light `#991b1b`, dark `#fca5a5`), mirroring the source's accent-red-500 / danger-red-700 split. Rule attached: `--error` must always ship with an icon or label, never color alone.
8. **Scope confirmed for this pass:** B11 nav translucency, `public/resume-template.html` print-ink retint, `public/favicon.svg` → brand red `#CE1126`. Hairline grid (item 3) deferred.
9. ~~Light accent / hover / active too strong?~~ **DECIDED (second pass, user feedback): the light ramp moved one step lighter** — `#b91c1c / #991b1b / #7f1d1d` → **`#b04138 / #a8382f / #9b3229`** (L 0.133 / 0.114 / 0.094, hue 4°, saturation ~45% — a warm brick instead of maroon). Ratios 5.26 / 5.50 / 5.74 on canvas / surface / elevated, 4.87 on `--code-bg`, white ink on the accent 5.74. **Ceiling recorded:** on a `#f6f5f2` canvas AA caps accent luminance at L ≤ 0.164, so the lightest usable red is ≈`#c4453c` (4.52 on canvas but 4.17 on `--code-bg` → rejected). Anything lighter than ≈`#bf4a41` fails AA as *text*; the source `#ef4444` is 3.45. A lighter look must therefore come as fill + ink, not as text.
10. **Download Resume panel (second + third pass).** `.download-resume-summary` is a `<button>` with no `background` declaration, so the UA `buttonface` gray painted behind the red label → `background: transparent` (`src/App.css:718`). The panel behind it was first set to `var(--accent-soft)`, which the user correctly rejected: **a translucent background cannot mask the spinning conic lazer** (`.download-resume-lazer-border` / `-glow` are `inset: -200%` siblings under the panel), so the sweep showed across the whole button instead of only the 2 px ring. Final state: a new **opaque** token `--accent-tint` (light `#f5e3e1`, dark `#2f1e1a` — the exact composite of `--accent-soft` over `--bg-primary`) on `.download-resume-lazer-inner` (`:835`), which masks the sweep and leaves the ring. Open state fills solid `var(--accent)` with `--text-on-accent` (`:735-738`); the floating menu `.download-resume-options` → `var(--bg-elevated)` (`:766`). Dark `--accent-soft` 0.16 → 0.12 (`.btn-secondary:hover`, focus ring only now). Accent text on the tint: 4.63 light / 5.74 dark.

---

## 10. Implementation record (shipped, 2026-10-16)

### 10.1 Files changed

| File | Lines | Change |
|---|---|---|
| `src/index.css` | 292 | Palette rewritten: `:root` dark default (2-51), `:root[data-theme='light']` (54-79), `@media (prefers-color-scheme: light)` bridge on `:root:not([data-theme='dark'])` (82-109). Value-identical `@media (prefers-color-scheme: dark)` block deleted; `color-scheme: dark` / `light` added; 8 additive tokens; every surface, ink, accent, border, shadow, code, status and grid value now matches §3 |
| `src/App.css` | 1533 | 24 hardcoded colors replaced by tokens (209-234, 288, 316, 380, 478-479, 483, 635-642, 729, 758, 774, 1053, 1351, 1392, 1506); `.nav` background `color-mix(in srgb, var(--bg-surface) 85%, transparent)` so `backdrop-filter` reads (B11); inset highlight added to the card model (that `.card*` block was later deleted as dead code in the typography pass, and `--inset-highlight` now backs `.project-section`); `@keyframes pulse-dot` → `var(--success-glow)` / `transparent`; `.name-highlight` gradient `var(--accent) → var(--accent-active)`; mobile hero inks → text tokens; Download Resume panel (718, 735-738, 766, 835) |
| `index.html` | 8-20 | Inline theme-init script: `localStorage['portfolio-theme']` → `matchMedia('(prefers-color-scheme: light)')` → `'dark'`, sets `data-theme` before first paint (B12) |
| `public/favicon.svg` | 485 B | Rewritten to the V monogram in brand red `#ce1126`; Vite's masked ellipses and the `color(display-p3 …)` clause removed |
| `public/resume-template.html` | 29 declarations | Print inks retinted: `#1a1a1a→#151914`, `#4a4a4a→#4b4f4a`, `#666→#6b6d68`, `#888/#999→#756b62`, `#f0f0f0→#efece6`, `#ccc→#d9d6d0`, `#eee→#e3e1dc`. Stays ink-on-white for print |
| `docs/design/specs/v3/spec-v3-theme-colors.md` | 8 | `⚠ SUPERSEDED (palette section)` banner pointing here |
| `src/hooks/useTheme.tsx` | — | No change |
| `public/icons.svg` | — | Out of scope: hardcodes `#08060d` / `#aa3bff` but is referenced from no file in `src/` |

### 10.2 Review passes

| Pass | Trigger | Outcome |
|---|---|---|
| 1 | Self-audit after the first rewrite | Contrast script found one AA failure: dark `--accent-active` `#ef4444` = 4.17 on `--bg-surface`, 3.85 on `--bg-elevated` → re-valued to `#f06060` (5.54 / 4.89 / 4.52) |
| 2 | User: light accent too strong | Light ramp `#b91c1c / #991b1b / #7f1d1d` → `#b04138 / #a8382f / #9b3229`; dark `--accent-soft` 0.16 → 0.12; UA `buttonface` gray under the Download Resume label killed with `background: transparent` (`src/App.css:718`); `.download-resume-summary.open` given a solid accent fill; `.download-resume-options` → `var(--bg-elevated)` |
| 3 | User: the transparent button let the lazer show across the whole button | Root cause: the masking panel had the **translucent** `var(--accent-soft)`, so the `inset: -200%` conic sweep under it painted through the entire surface. New **opaque** token `--accent-tint` (`#f5e3e1` / `#2f1e1a` = `--accent-soft` composited over `--bg-primary`) on `.download-resume-lazer-inner` (`src/App.css:835`); the sweep is now visible only in the 2 px ring of `.download-resume-lazer-wrapper` |

### 10.3 Verification log (final run)

- `pnpm exec tsc -b` → exit 0.
- `pnpm exec vite build --outDir dist-verify` → 538 modules, `index.css` 26.11 kB (gzip 5.46 kB), built in 137 ms, no errors; temp out dir deleted after every run. `pnpm build` itself is still blocked by the `dist/` mount in `docker-compose.yaml:7`.
- Built-CSS hex census: `#b04138`, `#a8382f`, `#9b3229`, `#f5e3e1`, `#e3e1dc`, `#d9d6d0`, `#f6f5f2`, `#fbfaf8`, `#efece6`, `#991b1b`, `#b45309`, `#15803d`, `#ffffff` all ×2 (light block + bridge); `#2f1e1a`, `#f87171`, `#fca5a5`, `#f06060`, `#b7aea0`, `#8f9a8e`, `#4ade80`, `#fbbf24`, `#3a403a`, `#2a3028`, `#272a28`, `#202423`, `#1a1e1b`, `#151914` (×4: dark ink + dark `--text-on-accent` + shadow composites) once per dark block. Alpha composites appear as 8-digit hex (`#ef44441f` = `--accent-soft` dark, `#ef444438` = `--accent-glow`, `#15191412` = light `--shadow`, `#00000073` = dark `--shadow`, `#ffffffe6` = light `--inset-highlight`). No `#b91c1c`, no `#7f1d1d`, no `#96 165 250`-family blue. The only remaining literal `#fff` / `#000` pairs belong to `src/assets/vite.svg`'s own `<style>` block, not to the theme.
- Compiled rule check: `.download-resume-lazer-inner{z-index:1;background:var(--accent-tint);border-radius:var(--radius-md);width:100%;position:relative}`.
- Grep gate `#[0-9a-fA-F]{3,8}\b|rgba?\(|:\s*(white|black)\s*;`: `src/App.css` 0 matches; `src/index.css` matches only inside 2-109; `src/index.css:110-292` 0 matches.
- Contrast (WCAG relative-luminance script over the final `:root` blocks): **light min 4.60, dark min 4.52, zero AA failures**. `--text-primary` 16.31 both themes. Accent on the opaque tint 4.63 (light) / 5.74 (dark); primary ink on the tint 14.36 / 14.58; white ink on light `--accent` 5.74; dark ink on dark `--accent` 6.43.
- Layering invariant `luminance(bg-primary) < luminance(bg-surface) < luminance(bg-elevated)`: dark 0.0091 < 0.0169 < 0.0224; light 0.9131 < 0.9566 < 1.0000.

### 10.4 Open items

- Manual browser pass (§7 item 4) is the user's; the palette has not been verified headlessly, per project rule.
- `pnpm build` end-to-end blocked by the nginx `dist/` mount — needs `docker compose stop` before a real production build, or a different out dir.
- `pnpm lint` dirty at baseline (15 errors + 9 warnings, all `react-hooks(rules-of-hooks)` in `.tsx` files this change never touched).
- ~~`.skip-link` orphan decision (§6, B7)~~ — closed: no markup, no CSS, no string (`grep -i skip` over `src/` → 0 matches). Restoring it would be a new feature, not a cleanup.
- Hairline grid adoption deferred (§9 item 3).
