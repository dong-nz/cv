# Specification — v3 Mobile Navigation Menu (social links + modern sheet)

> **Document:** `spec-v3-mobile-navigation.md`
> **Version:** 0.8.0 (seven owner decisions + three review answers resolved 2026-10-17, then six post-build follow-ups Q11–Q16 and one owner-reported defect — the sheet rolled the Home link on open; the review pass re-measured §3.3, corrected the Escape/focus/`inert` rules, moved the social aria strings, pinned the nav order at Language → Mode → Theme (Q16), and moved the sheet's focus target onto the panel itself)
> **Parents:** `specs/ui/spec-ui-layout.md` (navigation layout), `spec-v3-i18n.md` (translated chrome), `spec-v3-theme-palette-switch.md` (palette row, contrast table at `:145-159`), `spec-v3-typography.md` (type tokens, chrome band)
> **Priority:** P1
> **Estimate:** ~2.5 hours including the social-links cutover
> **Status:** DECISIONS CLOSED — §10 records the seven owner answers, the three review answers (Q8–Q10) and the six post-build follow-ups (Q11–Q16). §3.2's contrast measurement was reproduced independently and stands. §3.3's height arithmetic was wrong — drafted 596px, actually 736px as drafted, 643px with the Step 8 tightenings, 647px after Q13 — and is rewritten. Steps 1–9 plus Q12–Q16 are built and gated (§12), as is the 2026-10-17 focus defect fix (the sheet no longer rolls the Home link on open); the five criteria that can only be observed live all wait on the owner's browser pass (§11)

---

## 1. Request

1. **Add social links to the end of the mobile navigation menu.**
2. **Modern menu UI with an elegant effect.**

Everything below is the concrete shape of those two sentences in this codebase, plus the defects found in the current mobile menu while reading it (§2.2). The defects are in scope because "a modern menu" that is keyboard-broken and announces itself as a dialog it does not implement is not modern.

---

## 2. Current state (verified against the code, 2026-10-17)

### 2.1 Facts

| Fact | Evidence |
|---|---|
| The sheet is a plain `div` with `role="dialog"`, always mounted, hidden by CSS | `src/components/layout/Navigation.tsx:106`, `src/App.css:125-141` |
| Open/close is a `display: block` toggle plus a one-shot `slideIn` keyframe (`translateX(20px)` → 0, 200ms). There is **no exit animation** | `src/App.css:138-152` |
| Sheet geometry: `position: fixed; top: 64px; left/right/bottom: 0`, `padding: 32px 24px`, `overflow-y: auto`, `z-index: 999` (bar is 1000) | `src/App.css:125-136`, `:2-10,16` |
| Rows: `font-size: 20px` literal, `padding: 12px 0`, colour-only active state, no `aria-current` | `src/App.css:161-174`, `Navigation.tsx:115` |
| Breakpoint: the link list hides and the hamburger appears at **1024px** | `src/App.css:176-188` |
| The sheet already contains the palette picker (`variant="sheet"`), remounted closed on navigation via `key` | `Navigation.tsx:125` |
| Scroll lock exists: `document.body.style.overflow = 'hidden'` in an effect | `Navigation.tsx:15-24` |
| Closing on navigation is written **twice**: a route-change effect *and* `onClick` on every link | `Navigation.tsx:26-28`, `:116` |
| The hamburger swaps two hard-coded SVGs (three bars ↔ X) with no transition | `Navigation.tsx:92-100` |
| Theme state is already a context with `setTheme('dark' \| 'light')` and `resolvedTheme` | `src/hooks/useTheme.tsx:9-10,69-75` |
| Social links exist in **three separate copies**: array + inline SVG in `Hero.tsx:31-65` fed to `SocialLinks`, hand-rolled block in `Footer.tsx:32-65`, nothing in the sheet | grep `social-link` in `src/**/*.tsx` |
| `SocialLinks` renders icon-only `motion.a` tiles, takes `links` as a prop, hard-codes `target="_blank"` for every link including `mailto:` | `src/components/ui/SocialLinks.tsx:15-33` |
| `.social-link` is a 48×48 bordered tile; `.social-link span { display: none }` matches nothing today | `src/App.css:533-559` |
| `.social-links { justify-content: center }` at ≤768px is a **hero** fix from v3 UI enhancements | `src/App.css:823-825`, `spec-v3-ui-enhancements.md:915-921,1042` |
| Light-mode tile overrides use `!important` (`color` at ≤768px, `border-color` at all widths) | `src/App.css:840-843`, `:852-854` |
| No `env(safe-area-inset-*)` anywhere in `src/` | grep `safe-area` → 0 matches |
| `motion/react` v14; `AnimatePresence` already used once (`BackToTop`), `useReducedMotion` once (`RollingTextLink`), `motion.config.reducedMotion = 'user'` set at `main.tsx:9` | `BackToTop.tsx:23-32`, `RollingTextLink.tsx:2,28`, `main.tsx:7-9` |
| Nav chrome labels are hard-coded English: `Switch theme (currently …)`, `Switch language`, `Open menu` / `Close menu` | `Navigation.tsx:61,81,89` |
| `Link` forwards refs: `ForwardRefExoticComponent<LinkProps & RefAttributes<HTMLAnchorElement>>` | `node_modules/react-router/dist/development/lib/dom/lib.d.ts:974` |
| `strings.common.socialAriaLabels` already holds the three translated social aria names (`src/i18n/strings.ts:106-110`) and is consumed by nothing — grep `socialAriaLabels` in `src/` returns the definition only |
| `.nav-palette-sheet` carries its own separator today: `margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border)` (`src/App.css:337-342`); its trigger is `min-height: 44px` (`:344-349`) and its panel is `position: static` (`:357-363`) |
| `Layout.tsx:17` renders `<BackToTop />` as a sibling of `#main-content` and `.footer`; `.back-to-top` is `position: fixed; bottom/right: 24px; z-index: 100` (`src/App.css:1820-1837`) |
| `.mobile-menu-btn` is `display: none` above 1024px (`src/App.css:109-110`) — restoring focus into it at desktop width fails silently |
| `:root` sets `line-height: 1.6` (`src/index.css:50`), so a 15px chrome `span` occupies a 24px line box unless `line-height` is pinned |

### 2.2 Defects in the current mobile menu

| # | Defect | Why it matters |
|---|---|---|
| D1 | `role="dialog"` with no `aria-modal`, no focus move on open, no focus restore on close, no `Escape` | A screen reader announces a modal that behaves like inline content; keyboard focus stays in the page behind the sheet. `Navigation.tsx:106` |
| D2 | Active route signalled by colour only | WCAG 1.4.1 — the bar has an underline (`.nav-link.active::after`, `src/App.css:69-78`), the sheet has none |
| D3 | Closing on navigation duplicated (effect + per-link `onClick`) | `Navigation.tsx:27` is **one of two** `react(set-state-in-effect)` warnings oxlint reports in `src/` — the other is `Typewriter.tsx:27:7`; the `onClick` already covers every sheet link, so the effect is the removable one |
| D4 | No exit animation; the closed sheet's links stay in the DOM (only `display:none` keeps them out of the tab order) | Closing feels abrupt; any future change from `display` to `opacity` would make a hidden menu tabbable |
| D5 | No safe-area padding, no `overscroll-behavior` | On a notched phone the last row sits under the home indicator; scrolling the sheet chains to the page behind |
| D6 | Three copies of the same three social links; `SocialLinks` forces `target="_blank"` on `mailto:` | A URL change must be made in two files; `mailto:` in a new tab is wrong behaviour |
| D7 | `.social-link span { display: none }` matches nothing in the current markup | Dead CSS (`src/App.css:557-559`) |

---

## 3. Design — the sheet

### 3.1 Anatomy

```
┌ bar (64px, four icon controls at every width — Q12–Q16) ──┐
│ {CV}                                   VI  ☼  ◐  ✕         │
├ sheet (fixed, top:64px → bottom:0, glass panel) ───────────┤
│ MENU                                    ← group label      │
│ Home            ▌ 2px accent bar + accent text + aria-current
│ ─ hairline                                                 │
│ About / Experience / Projects / Contact / Philosophy       │
├ ───────────────────────────────────────────────────────────┤
│ APPEARANCE                                                 │
│ Language         [ English | Tiếng Việt ]  ← segmented row │
│ Mode             [ Dark | Light ]   ← segmented row        │
│ Theme            [ ●  ● ]  ← colour icons per palette      │
├ ───────────────────────────────────────────────────────────┤
│ CONNECT                                                    │
│ [⌁] [⌁] [✉]        ← the same 48×48 tiles as the footer   │
└ padding-bottom: calc(24px + env(safe-area-inset-bottom)) ─┘
```

Three labelled groups instead of one unlabelled list. Labels are chrome (`--text-meta`, mono, uppercase, `--text-muted`) — the same voice as `.section-tag` (`src/App.css:517-525`), as a new class `.mobile-menu-heading`.

Content is capped at `max-width: var(--max-content)` (800px, `src/index.css:32`) and centred, so a 1024px-wide sheet does not stretch 48px rows across 976px.

### 3.2 Sheet background: glass, at 94% — measured

The owner chose a translucent panel. The naive version (copy `.nav`'s `color-mix(in srgb, var(--bg-surface) 85%, transparent)` + `blur(12px)`, `src/App.css:6-8`) is not usable: the sheet carries text, and the effective background then depends on what is behind it.

Method: composite `0.92–0.96 × --bg-surface + (1 − k) × behind` channel-wise in sRGB (that is exactly what `color-mix` + alpha compositing does), then WCAG contrast against the text the sheet actually renders. `behind` is bounded by the lightest and darkest **large-area** colour the page can put under the sheet: `--bg-elevated` and `--bg-primary`/`--code-bg`, plus `--accent` (buttons, badges, the active nav underline scroll under a sticky bar). Text glyph pixels are excluded — they are too small an area to move a blurred composite.

| Panel opacity | Worst measured pair, all four palettes | Verdict |
|---|---|---|
| 85% (the bar's value) | red-light muted **4.01**, secondary 4.03; blue-light accent 4.09 | unusable for text |
| 92% | red-light secondary **4.47**, muted **4.45** (accent region behind) | **fails AA** |
| **94%** | red-light muted **4.58**, secondary 4.60; red-dark muted 4.92; blue-dark muted 4.80; blue-light accent 4.65 | **passes AA** |
| 96% | red-light muted 4.73; blue-light muted 4.99 | passes with more headroom |

**Build rule:** `background: color-mix(in srgb, var(--bg-surface) 94%, transparent); backdrop-filter: blur(12px);` — 94%, not 92%, because 92% measured below 4.5 in red-light. This is the one place the measurement overrode the shape of the option the owner picked; the owner's choice (translucent + blur) is honoured.

Worst case per palette at 94% (composite hex, then contrast):

| Palette | Behind | Composite | secondary | muted | accent | primary |
|---|---|---|---|---|---|---|
| red-dark | `#f87171` (accent) | `#2d2928` | 6.56 | 4.92 | 5.20 | 13.20 |
| red-dark | `#151914` (bg-primary) | `#1f2322` | 7.24 | 5.43 | 5.74 | 14.57 |
| red-light | `#b04138` (accent) | `#f6efec` | 4.60 | 4.58 | 5.05 | 15.64 |
| red-light | `#ffffff` (elevated) | `#fbfaf8` | 5.02 | 4.99 | 5.50 | 17.05 |
| blue-dark | `#60a5fa` (accent) | `#1a212f` | 6.11 | 4.80 | 6.34 | 13.38 |
| blue-dark | `#0f1117` (bg-primary) | `#161921` | 6.65 | 5.23 | 6.91 | 14.58 |
| blue-light | `#2563eb` (accent) | `#eef3fd` | 6.79 | 4.86 | 4.65 | 15.94 |
| blue-light | `#ffffff` (elevated) | `#fbfcfe` | 7.36 | 5.27 | 5.03 | 17.28 |

Opaque baselines for comparison: `spec-v3-theme-palette-switch.md:151-156`.

### 3.3 Row metrics and the overflow arithmetic — re-measured

The drafted 596px was wrong. It counted a 15px label as a 15px line box (`:root` sets `line-height: 1.6`, `src/index.css:50` → 24px), and it never counted the group spacing the new CSS introduces or the separator `.nav-palette-sheet` already carries.

**As drafted in v0.3.0** (16px group padding/margin, inherited line-height, `.nav-palette-sheet` untouched):

| Block | Height |
|---|---|
| 6 nav rows × 48 | 288 |
| 3 group labels (24px line box + 8 margin) | 96 |
| Palette trigger row (closed — `min-height: 44px`, `src/App.css:344-349`) | 44 |
| `.nav-palette-sheet` own spacing (`margin-top` 16 + `padding-top` 16 + `border-top` 1, `src/App.css:337-342`) | 33 |
| Appearance segmented row (Dark / Light) | 48 |
| Language segmented row (English / Tiếng Việt) | 48 |
| Connect tiles row (48×48, one row) | 48 |
| Group `padding-bottom` 16 × 3 + `margin-bottom` 16 × 2 | 80 |
| Group separators (2 × 1px) | 2 |
| Padding 24 + 24 | 48 |
| **Total** | **736** |

**With the Step 8 tightenings** (`line-height: 1` on the heading, group `padding-bottom`/`margin-bottom` 12px with `padding-bottom: 0` on `:last-child`, `.nav-palette-sheet` separator removed — that whole variant was later deleted by Q13, which is why the palette row is 48px and not 44px):

| Block | Height |
|---|---|
| 6 nav rows × 48 | 288 |
| 3 group labels (15 + 8) | 69 |
| Theme color segmented row (swatch options, Q13) | 48 |
| Mode + Language segmented rows (48 each) | 96 |
| Connect tiles row | 48 |
| Group spacing (12 padding × 2 + 12 margin × 2) | 48 |
| Group separators (2 × 1px) | 2 |
| Padding 24 + 24 | 48 |
| **Total** | **647** |

| Device | Available (viewport − 64px bar) | 647px sheet | Result |
|---|---|---|---|
| iPhone SE 375×667 (no bottom inset) | 603 | 647 | scrolls 44px |
| iPhone SE with a 34px bottom inset | 569 | 681 | scrolls 112px |
| iPhone 14 390×844 | 780 | 647 | fits, 133px spare |
| Landscape phone 844×390 | 326 | 647 | scrolls |
| Tablet 900×700 | 636 | 647 | scrolls 11px |

**The sheet does not fit on a 375×667 phone carrying three labelled groups, six nav rows, three segmented rows and a tile row.** It was never going to: the fixed part is 578px before a single group label is drawn. `overflow-y: auto` plus `overscroll-behavior: contain` make that a normal scroll, not a clipped menu — and that is now the *reason* Q3 (single column) stands, replacing the false "596 fits" claim. If a no-scroll sheet at 375×667 is wanted, the only levers are dropping the "Menu" group label (624px) or reversing Q6 and keeping language in the bar only (599px). Both are §10 decisions, not build-time improvisation.

### 3.4 Single column at every width

Per the owner's answer, no 2-column grid. The sheet's only width handling is the 800px content cap (§3.1). The bar gets one guard, at ≤420px (`src/App.css:303-313`: container padding 16px, action gap 12px), because four controls — logo, language, mode, palette, hamburger — share one 64px row at every width since Q14 (order per Q16): at 320px that is ~70 + 44×4 + 12×3 = 262px inside 288px of content. The cost of the single column is the 44px overflow on a 375×667 phone (§3.3), which the sheet handles by scrolling.

### 3.5 Social block: the same tiles as the footer

Per the owner's answer, the sheet reuses the footer's icon-only 48×48 tiles (`src/App.css:533-543`). Consequences that must be handled in the build:

- The tile's accessible name comes from `aria-label`, which becomes translated: "GitHub" → `strings.social.aria.github[lang]` etc. Icon-only links are legal as long as the name is in the accessible name, which it is.
- `.social-links { justify-content: center }` at ≤768px (`src/App.css:823-825`) is a hero fix; if it stays global it also centres the sheet's tiles. It is scoped to `.hero .social-links, .footer .social-links` so the hero and footer look exactly as today and the sheet's tiles stay left-aligned.
- The `!important` tile overrides (`src/App.css:840-843`, `:852-854`) stay **global**: they set tile colour/border in light mode for hero, footer and sheet alike. Legibility holds for whichever role the tile actually renders — `--text-secondary` measures 5.02 (red-light) / 7.36 (blue-light) over `--bg-elevated`, and at ≤768px the tiles render `--text-primary` (`src/App.css:826-828`), which measures 17.05 / 17.28. Scoping them was considered and dropped: it would silently change the footer's light-mode borders, which nobody asked for.
- No `rows` variant, no `handle` field, no `label`/`aria` fields: `src/data/social.ts` carries `id`, `href`, `external` only. Names are chrome strings and live in `strings.social` (§6 Step 4).

---

## 4. Motion & effects

| Effect | Implementation | Cost / risk |
|---|---|---|
| Sheet enter **and** exit | `AnimatePresence` + `motion.div`, `opacity 0→1`, `y -12→0`, 220ms, `ease [0.25, 0.1, 0.25, 1]` (declared inline at `MobileMenu.tsx:38`) | Replaces `@keyframes slideIn` (`src/App.css:143-152`), deleted. Conditional mount also fixes D4 |
| Staggered rows | each nav row is a `motion.li` with `opacity 0→1`, `y 8→0`, `delay 0.05 + index * 0.04` | 6 rows finish at 0.33s. `motion.config.reducedMotion = 'user'` (`main.tsx:9`) strips transforms for reduce-users; `useReducedMotion()` zeroes the delays |
| Group blocks | the Appearance and Connect groups fade with the panel, no separate stagger | Deliberate: staggering 3 groups too would push the total reveal past 0.5s |
| Row press feedback | CSS only: `:hover` / `:active` → `background: var(--bg-elevated)` | No JS, no per-row motion cost |
| Active route | 2px left bar in `var(--accent)` + `aria-current="page"` + accent text | Fixes D2; mirrors `.nav-link.active::after` (`src/App.css:69-78`) |
| Hamburger morph | `AnimatePresence mode="wait"` between the two existing SVG paths, `rotate 90°` + opacity, 180ms | Same "trigger rotates when open" idiom as `.nav-palette-trigger .chevron` / `.open .chevron` (`src/App.css:235-240`) |
| Segmented rows (Dark/Light, English/Tiếng Việt) | CSS `background` + `aria-pressed`; no motion | Both settings are context state (`useTheme.tsx:9-10,69-75`, `useLanguage.tsx:7,42-48`), so bar and sheet update in the same render |

Total perceived open time: 220ms panel + 330ms last row ≈ 0.55s. Nothing loops; nothing animates while closed.

---

## 5. Behaviour & accessibility

| Behaviour | Rule |
|---|---|
| Open | hamburger, with `aria-expanded` (already) plus new `aria-controls="mobile-menu"` |
| Close | hamburger, any nav link click, `Escape` — handled on `document` while the sheet is open (see the Escape row below) |
| Navigation | every sheet link carries `onClick={close}` (already the case, `Navigation.tsx:116`); the redundant route effect (D3) is **deleted**, and with it the `key={location.pathname}` reset on the palette instance — conditional mount resets it |
| Focus | open → **the panel itself**: `tabIndex={-1}` + `ref={sheetRef}` on the panel, focused in `onAnimationComplete` (~220ms after the click, no effect, no lint finding; the callback also fires for the exit animation, where the ref is already null — the optional chain covers it). The drafted version focused the first sheet link, and that was a defect: `RollingTextLink` rolls its text on `onFocus`, so every open rolled "Home" whatever the route. A focusable container is also the standard dialog target, and Tab from it still reaches the Home link first. Close → `triggerRef.current?.focus()`, mirroring `ThemePaletteMenu`'s Escape handler (`ThemePaletteMenu.tsx:22-26`), **but only when the trigger is rendered**: `.mobile-menu-btn` is `display: none` above 1024px (`src/App.css:109-110`), so a close caused by the media-query subscription must skip the restore (`if (triggerRef.current?.offsetParent)`) rather than fail silently and drop focus to `<body>` mid-navigation |
| Background | the existing scroll-lock effect (`Navigation.tsx:15-24`) also sets `inert` on `#main-content`, `.footer` **and `.back-to-top`** while open and clears all three on close. `Layout.tsx:17` renders `<BackToTop />` as a sibling of the other two, and `.back-to-top` is `position: fixed; bottom/right: 24px; z-index: 100` (`src/App.css:1820-1837`) — painted under the sheet (z 999) yet Tab-reachable unless it is inert. Imperative DOM work in the effect that already does imperative DOM work, so no new context and no new provider |
| Bar while open | stays operable on purpose: the hamburger is the sheet's own close control. A focus trap would have to trap the bar too — more code, known source of stuck-focus bugs |
| Semantics | sheet: `role="dialog" aria-modal="true" aria-label={translated}`; bar keeps `role="navigation" aria-label="Main navigation"` |
| Theme row vs bar toggle | both read `resolvedTheme` and write through `setTheme` / `cycleTheme` on the same context (`useTheme.tsx:9-10,69-75`) → they cannot diverge, and neither holds local state |
| Language row vs bar toggle | both read `lang` and write through `setLang` / `toggleLang` on the same context (`useLanguage.tsx:7,42-48`) → cannot diverge, no local state. Switching language inside the sheet relabels the sheet in place (every sheet label comes from `strings`) and leaves the sheet open |
| Escape | bound on `document` inside the existing open/close effect, **not** on the sheet. A panel `onKeyDown` only fires while focus is inside the sheet, and two reachable states put focus outside it: the bar is deliberately operable while open (row above), and focus only lands inside ~220ms after open. With `aria-modal="true"` and no close control inside the sheet (Q1), Escape is the only AT-accessible close path, so it cannot depend on focus position. Layering: the palette submenu keeps its own handler and gains `event.stopPropagation()` (`ThemePaletteMenu.tsx:22-26`, bound at `:29`). Verified against the installed `react-dom@19.3.0` (`react-dom-client.development.js:3576`): the synthetic `stopPropagation()` calls `nativeEvent.stopPropagation()`, and React's delegated listener sits on the root container — upstream of `document` — so the document listener never sees an Escape the submenu already handled. Submenu unwinds first; a second Escape closes the sheet |
| Scroll | `body` overflow lock (kept) + `overscroll-behavior: contain` on the sheet |
| Reduced motion | `motion.config.reducedMotion = 'user'`, `useReducedMotion()` zeroes stagger delays, `src/index.css:340-349` flattens every CSS transition |
| Breakpoints | 1024px unchanged for show/hide (`src/App.css:176-188`); no tablet grid |

---

## 6. Implementation details

### Step 1 — route lists become data

New `src/data/navigation.ts`:

```ts
export const navPaths = ['/', '/about', '/experience', '/projects', '/contact', '/philosophy'] as const

export const footerPaths = ['/', '/about', '/projects', '/contact'] as const
```
Order is the one the app renders today (`Navigation.tsx:8`): Projects → Contact → Philosophy. The data module copies it verbatim — moving `/philosophy` ahead of `/contact` would silently reorder both the desktop bar and the sheet (Q8). AGENTS.md's Pages table lists Philosophy before Contact; that drift is a documentation fix, recorded in §13, not a code change.

Why a data module instead of `export const navPaths` from `Navigation.tsx`: a probe file (`export const probePaths = ['/', '/about'] as const` next to a component export) reported `warning react(only-export-components)` under the repo's `.oxlintrc.json` — `allowConstantExport: true` does not cover an array literal — so exporting the list from a component file would add a lint finding. `AGENTS.md` also says content is data-driven, and `MobileMenu` and `Footer` both consume the list; a second copy of the literal is a second convention.

`Navigation.tsx:8` and `Footer.tsx:5` lose their local arrays.

### Step 2 — one source for social links

New `src/data/social.ts`:

```ts
import { profile } from '@/data/profile'
import type { SocialId } from '@/types'

export const socialLinks: {
  id: SocialId
  href: string
  external: boolean
}[] = [
  { id: 'github',   href: profile.githubUrl, external: true },
  { id: 'linkedin', href: profile.linkedinUrl, external: true },
  { id: 'email',    href: `mailto:${profile.email}`, external: false },
]
```
No `label` and no `aria` fields: those are chrome strings, and the repo's convention puts chrome strings in `src/i18n/strings.ts`. `strings.common.socialAriaLabels` (`strings.ts:106-110`) already carries the three translated names and is consumed by nothing — Step 4 moves them into `strings.social` and deletes the old block, so the values exist once (Q9). Division of responsibility: `social.ts` owns **which** links exist and how they open; `strings.social` owns **what they are called**.

`src/types/index.ts` gains, next to `Palette` (`:3`):

```ts
export type SocialId = 'github' | 'linkedin' | 'email';
```

`external` exists because `SocialLinks` hard-codes `target="_blank"` for all three today, including `mailto:` (`SocialLinks.tsx:22-23`).

### Step 3 — `SocialLinks` becomes the single social renderer

Rewrite `src/components/ui/SocialLinks.tsx` (keeps its name and its barrel export, `src/components/index.ts:5`). The 48×48 geometry, icons and colours are unchanged; what changes is the data source, `target`/`rel`, the accessible names, and the footer's hover transform (see the consequences below).

```tsx
import { motion } from 'motion/react'
import { socialLinks } from '@/data/social'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import type { SocialId } from '@/types'

const icons: Record<SocialId, React.ReactNode> = {
  github:   (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="…existing github path…" /></svg>),
  linkedin: (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="…existing linkedin path…" /></svg>),
  email:    (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4l-10 8L2 4" /></svg>),
}

export function SocialLinks() {
  const { lang } = useLanguage()
  return (
    <div className="social-links">
      {socialLinks.map((link) => (
        <motion.a
          key={link.id}
          href={link.href}
          target={link.external ? '_blank' : undefined}
          rel={link.external ? 'noopener noreferrer' : undefined}
          className="social-link"
          aria-label={strings.social.aria[link.id][lang]}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {icons[link.id]}
        </motion.a>
      ))}
    </div>
  )
}
```

The `links` prop and the `SocialLink` interface (`SocialLinks.tsx:3-13`) disappear. Consequences:

- `Hero.tsx:31-65` (35 lines of duplicated array + inline SVG) is deleted; `:148` becomes `<SocialLinks />`.
- `Footer.tsx:32-65` (34 lines of hand-rolled anchors) becomes `<SocialLinks />`. `profile` stays imported in `Footer.tsx` for `profile.name` at `:15`.
- The footer changes in two ways the drafted "unchanged" wording hid: its tiles go from plain `<a>` (`Footer.tsx:33-64`) to `motion.a` with `whileHover`/`whileTap`, and motion writes `transform` inline, which overrides `.social-link:hover { transform: translateY(-3px) }` (`src/App.css:544-548`) — the footer tiles scale instead of lifting; and their accessible names go from "GitHub" / "LinkedIn" / "Email" to "View GitHub profile" / "View LinkedIn profile" / "Send email". Both are intended, neither is invisible, and §11 states them as changes.
- `.social-link span { display: none }` (`src/App.css:557-559`) is deleted — dead rule (D7).
- `.social-links { justify-content: center }` at ≤768px (`src/App.css:823-825`) is scoped to `.hero .social-links, .footer .social-links` so the sheet's tiles stay left-aligned and hero/footer are unchanged.
- The `!important` overrides (`src/App.css:840-843`, `:852-854`) stay global (§3.5).

### Step 4 — new strings

Into `strings.nav` (`src/i18n/strings.ts:2-11`):

```ts
menuAria:        {en: 'Site menu', vi: 'Menu trang'},
openMenu:        {en: 'Open menu', vi: 'Mở menu'},
closeMenu:       {en: 'Close menu', vi: 'Đóng menu'},
groupMenu:       {en: 'Menu', vi: 'Menu'},
groupAppearance: {en: 'Appearance', vi: 'Giao diện'},
themeGroup:      {en: 'Mode', vi: 'Chế độ'},
themeDark:       {en: 'Dark', vi: 'Tối'},
themeLight:      {en: 'Light', vi: 'Sáng'},
langGroup:       {en: 'Language', vi: 'Ngôn ngữ'},
langEn:          {en: 'English', vi: 'English'},
langVi:          {en: 'Tiếng Việt', vi: 'Tiếng Việt'},
```

`langEn` / `langVi` carry the same value in both locales on purpose: a language option is named in its own language, so a reader who cannot read English can still find "Tiếng Việt". The bar keeps the short `VI` / `EN` codes (`Navigation.tsx:84`); the sheet uses full names because it has the width. **Superseded 2026-10-17:** both renderings are icons now — the bar shows the target language's globe/flag, the sheet's Language row shows both — and the own-language names moved into `aria-label` / `title`. See `spec-v3-i18n.md` §Language Control.

New block, replacing `strings.common.socialAriaLabels` (`strings.ts:106-110`), which is **deleted** — it already holds these three values and is consumed by nothing today:

```ts
social: {
    heading: {en: 'Connect', vi: 'Kết nối'},
    aria: {
        github:   {en: 'View GitHub profile',   vi: 'Xem hồ sơ GitHub'},
        linkedin: {en: 'View LinkedIn profile', vi: 'Xem hồ sơ LinkedIn'},
        email:    {en: 'Send email',            vi: 'Gửi email'},
    },
},
```

`strings.social.heading` is the label the Connect group renders. There is no `strings.nav.groupConnect`: the drafted pair carried the same label twice and the second copy was never read.

`openMenu` / `closeMenu` replace the hard-coded English at `Navigation.tsx:89`. The theme/lang labels at `:61` and `:81` are the same class of bug and are listed in §13 rather than fixed silently.

### Step 5 — new `MobileMenu` component

New `src/components/layout/MobileMenu.tsx` (~100 lines). `Navigation.tsx` is 129 lines today; adding three groups, socials, two segmented rows, focus management and motion to it would make it the largest component in `src/` and mix two surfaces in one file.

```tsx
import { useRef } from 'react'
import { useLocation } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { navPaths } from '@/data/navigation'
import { paletteIds, paletteMeta } from '@/data/palettes'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { RollingTextLink } from '@/components/ui/RollingTextLink'
import { SocialLinks } from '@/components/ui/SocialLinks'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { lang, setLang } = useLanguage()
  const { resolvedTheme, setTheme, palette, setPalette } = useTheme()
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const sheetRef = useRef<HTMLDivElement>(null)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={sheetRef}
          id="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-label={strings.nav.menuAria[lang]}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          onAnimationComplete={() => sheetRef.current?.focus()}
        >
          <div className="mobile-menu-inner">
            <nav className="mobile-menu-group" aria-label={strings.nav.groupMenu[lang]}>
              <span className="mobile-menu-heading">{strings.nav.groupMenu[lang]}</span>
              <ul className="mobile-menu-list">
                {navPaths.map((path, index) => {
                  const navKey = path === '/' ? 'home' : path.replace('/', '') as keyof typeof strings.nav
                  const active = path === location.pathname
                  return (
                    <motion.li
                      key={path}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: reduceMotion ? 0 : 0.05 + index * 0.04 }}
                    >
                      <RollingTextLink
                        to={path}
                        ariaCurrent={active ? 'page' : undefined}
                        className={active ? 'mobile-menu-link active' : 'mobile-menu-link'}
                        onClick={onClose}
                      >
                        {strings.nav[navKey][lang]}
                      </RollingTextLink>
                    </motion.li>
                  )
                })}
              </ul>
            </nav>

            <div className="mobile-menu-group">
              <span className="mobile-menu-heading">{strings.nav.groupAppearance[lang]}</span>
              <div className="mobile-menu-segment">
                <span className="mobile-menu-segment-label">{strings.nav.themeGroup[lang]}</span>
                <div className="mobile-menu-segment-options" role="group" aria-label={strings.nav.themeGroup[lang]}>
                  <button
                    type="button"
                    className={resolvedTheme === 'dark' ? 'mobile-menu-segment-option active' : 'mobile-menu-segment-option'}
                    aria-pressed={resolvedTheme === 'dark'}
                    onClick={() => setTheme('dark')}
                  >
                    {strings.nav.themeDark[lang]}
                  </button>
                  <button
                    type="button"
                    className={resolvedTheme === 'light' ? 'mobile-menu-segment-option active' : 'mobile-menu-segment-option'}
                    aria-pressed={resolvedTheme === 'light'}
                    onClick={() => setTheme('light')}
                  >
                    {strings.nav.themeLight[lang]}
                  </button>
                </div>
              </div>
              <div className="mobile-menu-segment">
                <span className="mobile-menu-segment-label">{strings.nav.langGroup[lang]}</span>
                <div className="mobile-menu-segment-options" role="group" aria-label={strings.nav.langGroup[lang]}>
                  <button
                    type="button"
                    className={lang === 'en' ? 'mobile-menu-segment-option active' : 'mobile-menu-segment-option'}
                    aria-pressed={lang === 'en'}
                    onClick={() => setLang('en')}
                  >
                    {strings.nav.langEn[lang]}
                  </button>
                  <button
                    type="button"
                    className={lang === 'vi' ? 'mobile-menu-segment-option active' : 'mobile-menu-segment-option'}
                    aria-pressed={lang === 'vi'}
                    onClick={() => setLang('vi')}
                  >
                    {strings.nav.langVi[lang]}
                  </button>
                </div>
              </div>
              <div className="mobile-menu-segment">
                <span className="mobile-menu-segment-label">{strings.nav.palette[lang]}</span>
                <div className="mobile-menu-segment-options" role="group" aria-label={strings.nav.palette[lang]}>
                  {paletteIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={palette === id ? 'mobile-menu-swatch-option active' : 'mobile-menu-swatch-option'}
                      aria-pressed={palette === id}
                      aria-label={paletteMeta[id].label[lang]}
                      title={paletteMeta[id].hint[lang]}
                      onClick={() => setPalette(id)}
                    >
                      <span className="nav-palette-preview" data-preview={id} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mobile-menu-group">
              <span className="mobile-menu-heading">{strings.social.heading[lang]}</span>
              <SocialLinks />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

Notes:

- Focus target: the panel carries `tabIndex={-1}` and `ref={sheetRef}`, focused from `onAnimationComplete`. The drafted version instead passed `ref={index === 0 ? firstLinkRef : undefined}` to the first `RollingTextLink` (workable — `Link` forwards refs to its `<a>`, `lib.d.ts:974`, and React 19 takes `ref` as an ordinary prop). It shipped and was **reverted 2026-10-17**: focusing a link fires that link's own `onFocus`, and `RollingTextLink` maps focus to its rolling-text animation, so opening the sheet rolled "Home" whatever the current route. `tabIndex={-1}` makes the panel programmatically focusable without making it a tab stop, so the first Tab from it still lands on the Home link; `.mobile-menu:focus { outline: none }` (`src/App.css:157-163`) stops the panel drawing a ring around the whole viewport.
- The group label is both visible text and the `aria-label` of the group landmark: "6 links, in a navigation named Menu".
- `role="group"` + `aria-label` on the segmented pair keeps the two buttons announceable as one control.
- No key handler here: Escape is owned by the document-level listener in `Navigation`'s open/close effect (Step 7), which closes the sheet from any focus position. Since Q13 the sheet carries no submenu at all — the palette is a segmented row — so nothing inside the sheet can intercept Escape. The bar's palette control keeps its own handler with `stopPropagation()`, which now matters only when focus sits on the bar trigger while the sheet is open: Escape closes the submenu and leaves the sheet open. A panel `onKeyDown` would only fire once focus had moved inside — which is exactly the guarantee this design cannot make.

### Step 6 — `RollingTextLink` gains `aria-current` (and later loses the `ref`)

`src/components/ui/RollingTextLink.tsx:20-25` — `RollingTextLinkProps` gains `ariaCurrent?: 'page'`; the returned `<Link>` (`:73-76`) takes `aria-current={ariaCurrent}`. Both callers benefit: the desktop bar's active link also lacks `aria-current` today (`Navigation.tsx:46-51`). The `ref?: React.Ref<HTMLAnchorElement>` prop Step 5 consumed was **deleted 2026-10-17** — nothing focuses a sheet link any more, so it was removed rather than left unused.

### Step 7 — `Navigation.tsx` changes

| Line | Change |
|---|---|
| `:8` | local `navPaths` removed → `import { navPaths } from '@/data/navigation'` (still used by the desktop list at `:40-55`) |
| `:12-14` | keep `mobileOpen`, `location` |
| `:15-24` | extend the existing effect. While open: set `inert` on `document.getElementById('main-content')`, `document.querySelector('.footer')` and `document.querySelector('.back-to-top')`, and `document.addEventListener('keydown', …)` whose branch is `if (event.key === 'Escape') closeMenu()`. The cleanup removes all three `inert` attributes and the listener. `closeMenu` is referenced from the effect, so it is a `useCallback` and the effect lists it as a dependency — a listener callback is not a synchronous setState in an effect body, so no `set-state-in-effect` finding |
| `:26-28` | **delete** the route-change `setMobileOpen(false)` effect (D3) |
| new | `const triggerRef = useRef<HTMLButtonElement>(null)`; `const closeMenu = useCallback(() => { setMobileOpen(false); if (triggerRef.current?.offsetParent) triggerRef.current.focus() }, [])` — the `offsetParent` guard is what stops a desktop-width close (media-query subscription) from calling `focus()` on a `display: none` button and leaving focus on `<body>` |
| new | a `matchMedia('(max-width: 1024px)')` subscription in its own effect: on `change`, if the query no longer matches, `setMobileOpen(false)`. Updating from the media-query **event** is the form the `set-state-in-effect` rule blesses; a synchronous call in the effect body is not |
| `:86-101` | hamburger keeps its two SVG paths but wraps them in `AnimatePresence mode="wait"` with `rotate 90°` + opacity; add `ref={triggerRef}`, `aria-controls="mobile-menu"`, translated `aria-label` |
| `:106-126` | the inline sheet is replaced by `<MobileMenu open={mobileOpen} onClose={closeMenu} />` |
| `:116` | `onClick={onClose}` moves into `MobileMenu` |

`navPaths` stays imported in `Navigation.tsx` for the desktop list; `MobileMenu` imports it independently.

### Step 8 — CSS

`src/App.css` — replace `:124-174` (`.mobile-menu`, `.mobile-menu.open`, `@keyframes slideIn`, `.mobile-menu-list`, `.mobile-menu-link` and its hover/active rules), neutralise `.nav-palette-sheet`'s own separator (`:337-342`), and extend the 1024px block (`:176-188`). No hex, no `rgba()`, no new `!important`, type sizes from tokens. **Q13 restates the palette part:** the sheet no longer hosts a submenu, so `.nav-palette-sheet` and the bar's `.nav-palette-group` label are deleted outright rather than neutralised, and `.mobile-menu-swatch-option` is added to the sheet block.

```css
/* Mobile menu sheet */
.mobile-menu {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: color-mix(in srgb, var(--bg-surface) 94%, transparent);
  backdrop-filter: blur(12px);
  padding: 24px 24px calc(24px + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior: contain;
}

.mobile-menu-inner {
  max-width: var(--max-content);
  margin: 0 auto;
}

.mobile-menu-group {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.mobile-menu-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.mobile-menu-heading {
  display: block;
  font-family: var(--mono);
  font-size: var(--text-meta);
  line-height: 1;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
}

/* The palette options take the Mode/Language segmented row's shape — same 44px target, border
   and radius — drawn as colour icons from the existing .nav-palette-preview dot (Q13). In the
   shipped file these rules sit after `.mobile-menu-segment-option:focus-visible`
   (`src/App.css:250-278`); the `.nav-palette-sheet` variant and `.nav-palette-group` are gone. */
.mobile-menu-swatch-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  min-height: 44px;
  padding: 0;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: none;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.mobile-menu-swatch-option:hover {
  background: var(--bg-elevated);
}

.mobile-menu-swatch-option.active {
  border-color: var(--accent);
  background: var(--bg-elevated);
}

.mobile-menu-swatch-option:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.mobile-menu-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}

.mobile-menu-link {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 0 12px 0 10px;
  border-left: 2px solid transparent;
  font-size: var(--text-lede);
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.mobile-menu-link:hover,
.mobile-menu-link:active {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.mobile-menu-link.active {
  border-left-color: var(--accent);
  color: var(--accent);
}

.mobile-menu-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.mobile-menu-segment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
}

.mobile-menu-segment-label {
  font-size: var(--text-body);
  color: var(--text-secondary);
}

.mobile-menu-segment-options {
  display: flex;
  gap: 8px;
}

.mobile-menu-segment-option {
  min-height: 44px;
  padding: 8px 16px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.mobile-menu-segment-option.active {
  background: var(--bg-elevated);
  border-color: var(--accent);
  color: var(--text-primary);
}

.mobile-menu-segment-option:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (max-width: 1024px) {
  .nav-menu { display: none; }
  .mobile-menu-btn { display: flex; }
  .nav-palette-nav { display: none; }
}

@media (min-width: 1025px) {
  .mobile-menu { display: none; }
}
```

Social block changes in the existing `/* ===== Social Links ===== */` block (`src/App.css:527-559`): delete `.social-link span { display: none }` (`:557-559`), and in the ≤768px media query change `.social-links { justify-content: center }` (`:823-825`) to `.hero .social-links, .footer .social-links { justify-content: center }`. No new tile rules — the sheet reuses `.social-link` as-is.

`src/index.css` needs no change: `--text-lede` / `--text-meta` / `--text-body` (`:34-36`), `--max-content` (`:32`), `--bg-elevated` (`:5` dark, `:63` light), `--border` / `--border-strong` (`:16-17` dark, `:74-75` light), `--radius-md` (`:42`), `--transition-fast` (`:45-47`) already exist.

### Step 9 — removals (clean cutover, no shims)

| Remove | Where |
|---|---|
| `@keyframes slideIn` and `.mobile-menu.open` | `src/App.css:138-152` |
| `.social-link span { display: none }` | `src/App.css:557-559` |
| `SocialLinks`'s `links` prop and `SocialLink` interface | `src/components/ui/SocialLinks.tsx:3-13` |
| Hero's `socialLinks` array | `src/components/sections/Hero.tsx:31-65` |
| Footer's inline social block | `src/components/layout/Footer.tsx:32-65` |
| Route-change close effect | `src/components/layout/Navigation.tsx:26-28` |
| `key={location.pathname}` on the palette sheet instance | `src/components/layout/Navigation.tsx:125` |
| Local `navPaths` / `footerPaths` literals | `Navigation.tsx:8`, `Footer.tsx:5` |
| `strings.common.socialAriaLabels` | `src/i18n/strings.ts:106-110` (moved to `strings.social.aria`) |
| `.nav-palette-sheet`'s `margin-top` / `padding-top` / `border-top` | `src/App.css:337-342` — superseded by Q13, which deletes the whole `.nav-palette-sheet` variant and `.nav-palette-group` (34 lines) instead of trimming them |

Nothing deprecated or aliased: `SocialLinks` keeps its name and barrel export; its API changes.

---

## 7. Edge cases

| Case | Behaviour |
|---|---|
| Route changes while the sheet is open | The link's own `onClick` closes it; no route effect exists to duplicate it. `MobileMenu` reads `useLocation()` for the active row, so it re-renders correctly while mounted |
| Palette submenu open in the bar while the sheet is open, then a nav link is clicked | The bar is deliberately not `inert` while the sheet is open (§5), so its submenu can be open at the same time. Clicking a sheet link closes the sheet; `ThemePaletteMenu` lives in the bar and stays mounted, so its `open` state is simply retained — no stale state, because the component that owns it never unmounts |
| Palette submenu opened from the bar while the sheet is open | Since Q14 the bar control exists at every width, so this is the ordinary phone case, not an edge case: `.nav-palette-panel` is `position: absolute; top: calc(100% + 4px); right: 0` with `min-width: 220px` (`src/App.css:342-355`), `z-index: 100` inside `.nav`'s `z-index: 1000` context, so it paints over the sheet's top edge instead of reflowing it. Sheet height arithmetic is untouched — the submenu is not a sheet row, and the 731px "submenu inside the sheet" case no longer exists |
| Viewport crosses 1024px upward while the sheet is open | The media-query subscription closes it (`matchMedia` `change` event), and `closeMenu` skips the focus restore because the trigger is `display: none` there — focus stays where it is rather than dropping to `<body>`. CSS `@media (min-width: 1025px) { .mobile-menu { display: none } }` is the belt; the JS is what keeps `aria-expanded` honest |
| `Escape` while the bar's palette submenu is open and the sheet is open | `ThemePaletteMenu`'s wrapper handler (`ThemePaletteMenu.tsx:18-25`) closes the submenu and refocuses its trigger, and its `stopPropagation()` fires **only while the submenu is open**, so the document listener does not see that keypress; a second Escape reaches the document handler and closes the sheet. Escape from the sheet's rows, from the bar, or from anywhere else reaches the document handler directly. Since Q13 nothing inside the sheet can intercept Escape at all |
| Both theme controls **and** both palette controls on screen | Same context state: the bar toggle calls `cycleTheme`, the sheet row calls `setTheme('dark' \| 'light')`; the bar's palette dropdown and the sheet's Theme row both call `setPalette(id)`. No local state in any of them, so no divergence and no sync effect. Q14 deliberately keeps the palette control in the bar at ≤1024px even though the sheet also carries the row |
| Very short landscape viewport (326px available) | Sheet scrolls; `overscroll-behavior: contain` keeps the page still |
| iOS Safari | The sheet is `position: fixed` with explicit `top/bottom`, so it depends on no viewport unit |
| `mailto:` tile | No `target`, no `rel` — driven by `external: false` |
| Reduced motion | `motion.config.reducedMotion = 'user'` strips transform animations, `useReducedMotion()` zeroes stagger delays, `src/index.css:340-349` flattens CSS transitions; the sheet is still focusable and closable |
| Glass panel over a saturated element | Measured worst case is an `--accent` button or badge directly behind the panel: minimum 4.58 (§3.2) |
| `Escape` with focus on the bar | Closes the sheet: the handler is on `document`, not on the sheet, so it does not depend on focus position (§5) |
| `BackToTop` while the sheet is open | `inert` on `.back-to-top` — otherwise a fixed button at `z-index: 100` sits under the sheet's panel yet stays in the tab order (`Layout.tsx:17`, `src/App.css:1820-1837`) |
| Sheet taller than the viewport (375×667, landscape, 34px bottom inset) | `overflow-y: auto` scrolls the sheet; `overscroll-behavior: contain` stops the chain to the page (§3.3) |

---

## 8. Affected files

| File | Action |
|---|---|
| `src/data/navigation.ts` | **new** — `navPaths`, `footerPaths` |
| `src/data/social.ts` | **new** — one social-link table: `id`, `href`, `external` |
| `src/types/index.ts` | edit — `export type SocialId = 'github' \| 'linkedin' \| 'email';` next to `Palette` (`:3`) |
| `src/i18n/strings.ts` | edit — 11 keys into `strings.nav` (`:2-11`), new `strings.social` block (`heading` + `aria`), **delete** `common.socialAriaLabels` (`:106-110`) |
| `src/index.css` | edit — **Q14**: `--swatch-empty: #ffffff` joins the fixed-identity `:root` block (`:146-152`) so the palette icon's empty half is constant in both themes; `.lang-toggle` and its `:hover` **move to `src/App.css`** (file 368 → 351 lines) |
| `src/components/ui/SocialLinks.tsx` | rewrite — data-driven, per-link `target`/`rel`, accessible names from `strings.social.aria[link.id][lang]` |
| `src/components/layout/MobileMenu.tsx` | **new** — the sheet, its three groups, the Dark/Light, English/Tiếng Việt and Theme color (swatch) segmented rows (`paletteIds` × `paletteMeta`, Q13) |
| `src/components/layout/Navigation.tsx` | edit — `:8`, extend `:15-24` (three `inert` targets + the document `keydown` Escape listener), delete `:26-28`, `:86-101`, replace `:106-126`, add `triggerRef` + `closeMenu`, add the media-query subscription; **Q14**: `nav-control` joins `theme-toggle` (`:85`) and `lang-toggle` (`:103`) so the three controls share one chrome |
| `src/components/ui/RollingTextLink.tsx` | edit — `ariaCurrent` (`:20-25`, `:73-76`); the `ref` prop Step 5 used for focus is **deleted** 2026-10-17 (§7 Focus row) |
| `src/components/sections/Hero.tsx` | edit — delete `:31-65`; `:148` becomes `<SocialLinks />` |
| `src/components/layout/Footer.tsx` | edit — delete `:32-65`, use `<SocialLinks />`, drop local `footerPaths` (`:5`) |
| `src/components/layout/ThemePaletteMenu.tsx` | edit — `event.stopPropagation()` in the Escape branch (handler bound on the wrapper); **Q13**: bar-only, `variant` prop and the sheet variant removed, panel `id="palette-menu"`; **Q14**: trigger is `nav-control nav-palette-trigger` and renders **only** the 20px half-circle swatch — the chevron svg is deleted |
| `src/App.css` | edit — `.nav` background `:6` (85% → 94%), replace `:124-174`, add the 1025px sheet guard, delete `:557-559`, scope `:823-825` to `.hero`/`.footer`; **Q13**: `.mobile-menu-swatch-option` block added, `.nav-palette-group` and the whole `.nav-palette-sheet` variant deleted; **Q14**: `.nav-control` + hover/open + focus + `.lang-toggle` typography at `:89-123` (replacing the `.theme-toggle` rules), `.lang-toggle` imported from `index.css`, `.nav-palette-swatch` becomes the half-circle at `:331-340`, the trigger's own chrome rules and both `.chevron` rules deleted, the ≤1024px `.nav-palette` hide rule deleted (the control is now meant to show on phones), `@media (max-width: 420px)` bar guard at `:303-313` — file 1923 → 1908 lines |
| `src/components/index.ts` | **no change** — the barrel is partial by convention (`AGENTS.md`) and `Navigation` imports its children by path |
| `docs/design/specs/ui/spec-ui-layout.md` | edit — §13 drift: theme cycle still documented as `dark → light → system`, mobile breakpoint still `<768px` |
| `AGENTS.md` | edit — Pages table route order (Philosophy/Contact) corrected to match the rendered order, per Q8 |

---

## 9. Verification plan

| Gate | Command / check | Expected |
|---|---|---|
| Types | `pnpm exec tsc -b` | exit 0 |
| Build | `pnpm exec vite build --outDir dist-verify` then `Remove-Item -Recurse -Force dist-verify` (PowerShell — this is a win32 box; `rm -rf` is not available) | green |
| Lint | `pnpm exec oxlint -c .oxlintrc.json src 2>&1 \| grep -cE " (error\|warning) "` | **19** finding lines = 11 errors / **8** warnings. Measured baseline today is 20 = 11 errors / 9 warnings, and `Navigation.tsx:27` is the one being deleted; `Typewriter.tsx:27:7` is the other `set-state-in-effect` warning and stays. 20 means something new crept in |
| Hex gate | `grep -cE '#[0-9a-fA-F]{3,8}\b\|rgba?\(' src/App.css` | 0 |
| Inline-type gate | `grep -rE 'style=\{\{[^}]*(fontSize\|lineHeight\|fontWeight\|color\|maxWidth)' src` | 0 |
| Dead-rule gate | `grep -n 'slideIn' src/App.css` | 0 matches |
| Glass contrast gate | composite `0.94 × --bg-surface + 0.06 × {--accent, --bg-elevated, --bg-primary, --code-bg}` per palette, then WCAG ratio for `--text-secondary`, `--text-muted`, `--accent`, `--text-primary` | minimum ≥ 4.5 in all four palettes; measured floor **4.58** (red-light, muted over accent). Independently reproduced 2026-10-17 across all 4 palettes × 4 behind colours × 4 text roles. The headroom is **0.08**, and `--text-muted` is the role the sheet heading and the palette trigger use (`src/App.css:202`) — pin the numbers in a CSS comment so a token tweak cannot break the gate silently |
| Bar contrast gate | same composite method at 94% for the bar's own text: `--text-muted` nav links (`src/App.css:54`), `--accent` active link (`:66`), `--text-primary` logo (`:25`) | minimum ≥ 4.5 in all four palettes; measured floor **4.58** (red-light muted over an accent element behind the bar) versus **4.01** at today's 85% |
| SSR smoke | throwaway `vite.ssrLoadModule` + `react-dom/server` render of `<ThemeProvider><LanguageProvider><Navigation /></LanguageProvider></ThemeProvider>` with the sheet force-opened. Four prerequisites the drafted gate hid: the providers throw without their wrappers (`useTheme.tsx:90-92`, `useLanguage.tsx:59-61`); both write `document.documentElement.setAttribute` during render outside any `try/catch` (`useTheme.tsx:56-57`, `useLanguage.tsx:32`), so the script must stub `globalThis.document` before loading the module; `motion` v14 mounts a projection node **during render**, so a `documentElement.setAttribute`-only stub dies with `target.addEventListener is not a function` — the stub also needs `document.addEventListener`/`removeEventListener` and a `window` with `addEventListener`, `removeEventListener`, `matchMedia`, `requestAnimationFrame`/`cancelAnimationFrame` and `localStorage`; and `Navigation`/`Button` render `<Link>`, so the render must be wrapped in `MemoryRouter` (`react-router`) or `useContext(NavigationContext)` is null | 6 nav rows, 3 group labels, 2 theme buttons and 2 language buttons with exactly one `aria-pressed="true"` in each pair, 3 social tiles, `aria-modal="true"`, `aria-current="page"` on exactly one row, `mailto:` tile with no `target`; since Q13 also — one swatch option per palette with exactly one `aria-pressed="true"`, and the Theme color row is the Appearance group's last child again (Q16); since Q14 also — the palette trigger renders no text node while keeping `aria-label="Theme: Red"`, `title="Switch theme color"`, `aria-expanded` and the swatch, with no chevron; since Q16 also — the bar's controls appear in the order language → mode → theme color → hamburger; then delete the script |
| Resume | `pnpm build:resume-all` | unchanged — the generator and template reference no nav or theme token |
| Browser | owner's pass (repo rule §5) | 320 / 375 / 768 / 900 / 1024 / 1100px × {dark, light} × {red, blue}; 375px scrolled to the bottom; keyboard-only open / Escape / tab-through |

---

## 10. Decision record — resolved 2026-10-17

| # | Question | Owner's answer | What it changed in this spec |
|---|---|---|---|
| Q1 | Sheet shape | **Panel full-bleed under the bar** | `top: 64px → bottom: 0` kept; no new close affordance; no change to the `.nav` 1000 / sheet 999 stacking |
| Q2 | Duplicate theme / language controls inside the sheet | **Yes — Dark/Light row in the Appearance group** | New segmented row (`setTheme`, `aria-pressed`), 3 new strings, `.mobile-menu-segment*` rules, +48px of sheet height. Language stays in the bar (the answer named theme only); flag it if language was meant too |
| Q3 | 2-column nav grid at 768–1024px | **No — single column everywhere** | Tablet grid rule dropped. The drafted justification ("548px total, fits 603px on iPhone SE") was arithmetically wrong — the sheet is 643px with the Step 8 tightenings and does not fit 375×667 (§3.3). The decision stands on the honest reason: the sheet scrolls, and `overscroll-behavior: contain` makes that a normal scroll |
| Q4 | Social row style | **Tiles, icon-only, like the footer** | `rows` variant and the `handle` field dropped from the data model; `.social-links` centring rule scoped to `.hero`/`.footer`; `!important` tile overrides left global |
| Q5 | Panel background | **Translucent + `backdrop-filter`** | Accepted, but at **94%** opacity rather than the drafted 92%: 92% measured 4.47 / 4.45 (red-light secondary / muted, accent region behind) which fails AA; 94% measures 4.58 minimum. Numbers in §3.2 |
| Q6 | Language control inside the sheet | **Yes — English / Tiếng Việt row in the Appearance group** | Second segmented row (+48px, sheet total 643px — the reason 375×667 overflows), `setLang` from `useLanguage.tsx:7,42-48`, 3 more strings, `.mobile-menu-segment` reused rather than a new class family |
| Q7 | The pre-existing 85% bar finding (§13) | **Fix it in this batch** | `.nav` background `src/App.css:6` moves 85% → 94%: measured floor rises from 4.01 to 4.58 for nav text. Same value as the sheet, so one opacity number governs both glass surfaces |
| Q8 | `navPaths` order in the new data module | **Keep the order the app renders today** (Projects → Contact → Philosophy) | Step 1's `navPaths` rewritten to match `Navigation.tsx:8`; the drafted version would have reordered both the bar and the sheet. §13's nav-order row becomes a documentation fix for AGENTS.md, not a code change |
| Q9 | Where the translated social aria names live | **New `strings.social` block; `common.socialAriaLabels` deleted** | `src/data/social.ts` loses its `label`/`aria` fields; `strings.social.aria[id][lang]` becomes the single source; the unused `common.socialAriaLabels` (`strings.ts:106-110`) is removed in Step 9 |
| Q10 | Sheet overflow on a 375×667 phone | **Accepted — the sheet scrolls** | §3.3 rewritten with the measured 643px and the device table; `overflow-y: auto` + `overscroll-behavior: contain` are the answer. The two no-scroll levers (drop the "Menu" label → 620px; reverse Q6 → 595px) stay open as future decisions |
| Q11 | Order of the controls inside the Appearance group | **Theme first, then Theme color** — Mode row, Theme color row, Language row | Step 5's group markup and §3.1 anatomy swapped; the `.nav-palette-sheet` comment in Step 8 reworded. Sheet height unchanged (44 + 48 + 48 = same 643px closed); the palette submenu expanded inline above the Language row (§7). **Row order superseded by Q12 below; the "Theme before Theme color" intent survives — Language was inserted between them** |
| Q12 | Same order question, raised again after the build | **Theme color moves after Language — in the bar as well as the sheet** | Supersedes Q11's row order. Bar `.nav-actions`: theme toggle → language toggle → `ThemePaletteMenu variant="nav"` → hamburger. Sheet Appearance group: Mode → Language → Theme color. §3.1, Step 5, the Step 8 comment, §7 and §11 updated. Closed height unchanged (643px); the submenu now expands inline at the end of the group, so opening it no longer pushes the Language row down. **Row order superseded by Q15 below, which puts Language back last** |
| Q13 | Post-build: how the palette control should be drawn | **Bar: icon-only dropdown** (swatch + chevron, no text). **Sheet: the Mode/Language segmented-row style, options listed as colour icons — one per colour schema** | `ThemePaletteMenu` becomes bar-only: `variant` prop and the `nav-palette-{nav,sheet}` class pair removed, trigger renders the 16px swatch + chevron only, panel `id="palette-menu"`. `MobileMenu` renders the palette row itself from `paletteIds` × `paletteMeta` using `.mobile-menu-swatch-option` (44px, same border/radius/transition as `.mobile-menu-segment-option`) with the existing `.nav-palette-preview` dot as the colour icon, `aria-pressed` + translated `aria-label` + `title` hint. `.nav-palette-sheet` (5 rules) and `.nav-palette-group` are deleted, `.nav-palette-swatch` 14 → 16px. Closed sheet 643 → 647px (§3.3); the "submenu inside the sheet" edge case is replaced by "submenu from the bar while the sheet is open" (§7) |
| Q14 | Post-build: what the bar looks like at ≤1024px | **Keep the palette control in the bar at every width, and give the three bar controls one shared chrome** | `ThemePaletteMenu`'s trigger becomes `nav-control nav-palette-trigger` and the chevron svg is deleted; `theme-toggle` and `lang-toggle` join `.nav-control` (`src/App.css:91-116`) — bordered 44px box, accent border + text on hover/open, one `:focus-visible` — leaving `.lang-toggle` only its 13px/600 glyph step (`:119-123`), which moved out of `src/index.css`. `.nav-palette-swatch` becomes a 20px half-circle: active palette's accent on the left, `--swatch-empty: #ffffff` on the right (`src/index.css:151`), so the icon reads in both themes. The ≤1024px `.nav-palette` hide rule added while wiring Q13 is deleted, and `@media (max-width: 420px)` (`src/App.css:305-313`) keeps logo + 4×44 + 3×12 = 262px inside 288px of content at 320px (§3.4). §3.1, §3.4, §7, §8, §9 and §11 updated |
| Q15 | Post-build, a third time: the order of the three appearance controls | **Mode, Theme, Language — Language moves to the end in the bar *and* in the sheet** | Supersedes Q12. Bar `.nav-actions`: mode toggle → `ThemePaletteMenu` → language toggle → hamburger (`Navigation.tsx:84-111`). Sheet Appearance group: Mode row → Theme color row → Language row (`MobileMenu.tsx:71-132`). §3.1 anatomy, §3.4, §11, `spec-ui-layout.md` and `AGENTS.md` updated. Height arithmetic unchanged — the same three 48px segments in a new order, so the 647px total and the §3.3 device table still hold. **Superseded by Q16 below** |
| Q16 | Order, a fourth time: which control leads | **Language first** — Language → Mode → Theme in the bar *and* in the sheet; the hamburger stays last in the bar | Supersedes Q15. Bar `.nav-actions`: language toggle → mode toggle → `ThemePaletteMenu` → hamburger (`Navigation.tsx:84-111`). Sheet Appearance group: Language row (`:71-91`) → Mode row (`:93-113`) → Theme color row (`:115-132`) in `MobileMenu.tsx`. §3.1 anatomy, §3.4, §9's smoke row, §11, `spec-ui-layout.md`, `AGENTS.md` and `spec-v3-theme-palette-switch.md` updated. Markup-only again — no CSS rule keys off child order (`.nav-actions` is a flex row with a gap, the segments are block rows), so the 320px arithmetic and the 647px sheet height are unchanged |
| Q17 | Post-build, a fifth time — raised in `spec-v3-nav-swatch-and-hamburger.md` §1, 2026-10-17 | **The hamburger moves to the LEFT of the bar.** The owner is left-handed and reaches the left end of a handheld bar more easily | Supersedes only the "the hamburger stays last in the bar" half of Q16; the language → mode → theme color order survives unchanged. `Navigation.tsx:59-102` now opens `.nav-container` with a `.nav-brand` group — hamburger then logo — and `.nav-actions` (`:122-151`) holds exactly the three appearance controls. `src/App.css:32-39` adds `.nav-brand` (flex, 12px gap; 8px at ≤420px). DOM order == visual order == Tab order, which is why a `display: contents` + `order: -1` CSS-only variant was rejected. Row arithmetic re-measured: 40 + 12 + 70 + 44×3 + 12×2 = 278px inside 288px at 320px (14px slack with the 8px brand gap); the "262px / 26px slack" comment in `src/App.css` was arithmetically wrong and is corrected. The sheet, its group order and its 647px height are untouched |

---

## 11. Acceptance criteria

- [x] The sheet ends with a Connect group holding GitHub, LinkedIn and Email as the same 48×48 tiles as the footer, translated accessible names, `mailto:` without `target="_blank"`.
- [ ] The sheet animates in **and** out; `@keyframes slideIn` no longer exists.
- [x] Active route identifiable without colour: 2px left bar + `aria-current="page"`.
- [ ] `role="dialog"` is honest: `aria-modal="true"`, focus into the sheet on open **on the panel itself (`tabIndex={-1}`) — never on a link, because `RollingTextLink` turns a focus event into its rolling-text animation**, back to the hamburger on close **when the hamburger is rendered**, `Escape` closes from any focus position (document-level listener), and `#main-content`, `.footer` **and `.back-to-top`** are `inert` while open.
- [x] Appearance group renders in this order (Q16): the English/Tiếng Việt segmented control, then the Dark/Light segmented control, then the Theme color row — a segmented row of colour-icon buttons (`paletteIds`, one per schema, since Q13); the bar carries the same order with the palette as an icon-only trigger — language toggle, mode toggle, palette icon, then the hamburger. Changing any one of them updates its twin, and no control holds local state.
- [x] The bar carries the palette control at every width, in the order language → mode → theme color → hamburger (Q16), with the three controls sharing one `.nav-control` chrome (44px bordered box, accent border + text on hover/open, a single `:focus-visible` rule); the trigger is the 20px half-circle swatch — no text, no chevron — named by `aria-label` ("Theme: Red") with `title` ("Switch theme color"). `@media (max-width: 420px)` keeps that row inside 320px. Proven by the §9 SSR bar assertions
- [x] Bar anatomy since Q17 (`specs/v3/spec-v3-nav-swatch-and-hamburger.md`): `.nav-brand` opens the bar with the hamburger at the left edge and the `{CV}` brand immediately right of it; `.nav-actions` carries language → mode → theme color at the right end, and `#palette-menu` still anchors `right: 0` under its trigger. Tab order matches visual order. Proven by that spec's §9 SSR bar-order assertions — **supersedes the hamburger-last clause of the Q16 row above**
- [x] Brand since 2026-10-17: the bar's left cluster is the hamburger then a 24px **home icon** in a 44px `.nav-logo` target — still `<Link to="/">` with the translated Home label as `aria-label` and the svg `aria-hidden`; the `{CV}` wordmark and its `.logo-bracket` / `.logo-text` spans are gone. The 320px row improves to 40 + 12 + 44 + 44×3 + 12×2 = **252px** inside 288px, so the ≤420px block no longer tightens the brand gap. Record: `spec-v3-nav-swatch-and-hamburger.md` §11
- [x] Panel is `color-mix(in srgb, var(--bg-surface) 94%, transparent)` + `backdrop-filter: blur(12px)`, and the §9 glass contrast gate passes in all four palettes.
- [x] `.nav` background is `color-mix(in srgb, var(--bg-surface) 94%, transparent)` (was 85%, `src/App.css:6`), and the §9 bar contrast gate passes in all four palettes.
- [x] Closing on navigation happens in exactly one place; oxlint drops from 20 to 19 finding lines (11 errors / 8 warnings).
- [x] One source for social links (`src/data/social.ts`) and one source for their names (`strings.social.aria`); `Hero.tsx` and `Footer.tsx` contain no social SVG paths of their own; `common.socialAriaLabels` is gone. Hero tiles are unchanged; footer tiles keep their geometry, icons and colours but scale on hover instead of lifting, and their accessible names change — that is a stated change, not an unnoticed one.
- [x] Sheet has `padding-bottom: calc(24px + env(safe-area-inset-bottom))`, `overscroll-behavior: contain`, and content capped at `var(--max-content)`.
- [x] Crossing 1024px upward while open closes the sheet via a `matchMedia` `change` subscription.
- [x] `navPaths` renders in today's order — Home, About, Experience, Projects, Contact, Philosophy — in both the bar and the sheet (Q8).
- [x] No duplicated hairline: each group draws exactly one separator and the palette row draws none of its own — since Q13 the `.nav-palette-sheet` variant that carried `margin-top` / `padding-top` / `border-top` no longer exists.
- [ ] Sheet measures 647px (Step 8 tightenings + Q13's 48px palette row); on 375×667 and on landscape it scrolls cleanly rather than clipping content (`overflow-y: auto` + `overscroll-behavior: contain`).
- [x] `tsc -b` exit 0; `vite build` green; hex gate 0; inline-type gate 0; no new `!important`.
- [ ] Reduced motion: no stagger delay, no transform animation, sheet still keyboard-reachable and closable.
- [x] `pnpm build:resume-all` unchanged.
- [ ] Owner's browser pass at 320 / 375 / 768 / 900 / 1024 / 1100px × {dark, light} × {red, blue}.

Eleven criteria are proven by the automated checks in §12 and three more (the 2px active bar + `aria-current`, the Appearance order with no local state, the `matchMedia` subscription) by construction — the artifacts are present in the CSS and in the rendered markup, and the controls share one context with no local state. Five still need the owner's browser run because they are only observable live: animation in **and** out, the live focus/`inert` behaviour, the 647px measurement against a real viewport, reduced motion, and the multi-viewport pass.

---

## 12. Progress tracking

| Item | Status |
|---|---|
| §2 current-state audit and defect list | DONE — 16 facts re-verified against the files 2026-10-17, 5 more added, D3's wording corrected (there are two `set-state-in-effect` warnings, not one) |
| §3.2 glass composite measurement (92% fails, 94% chosen) | DONE — computed from `src/index.css:2-141` and reproduced independently across 4 palettes × 4 behind colours × 4 text roles; floor 4.58 confirmed |
| Owner decisions Q1–Q7 | DONE — recorded in §10 |
| Spec v0.2.0 / v0.3.0 rewritten around those decisions | DONE |
| Review pass on v0.3.0 | DONE — 7 corrections applied: §3.3 arithmetic re-measured (596 → 736 as drafted, 643 tightened), `.nav-palette-sheet` separator brought into scope, Escape moved to `document`, focus-restore guard, `BackToTop` added to the `inert` set, social aria strings single-sourced, nav order pinned |
| Owner decisions Q8–Q10 | DONE — recorded in §10 |
| Owner follow-up Q11 — Appearance row order | DONE — §3.1, Step 5, Step 8 comment, §7, §11 updated |
| Spec rewritten to v0.4.0 | DONE |
| Owner review of v0.4.0 | DONE — approved with Q11; build started 2026-10-17 |
| Step 1 `src/data/navigation.ts` | DONE — `navPaths` in today's bar order (Q8), `footerPaths`; 3 lines |
| Step 2 `src/data/social.ts` + `SocialId` | DONE — `id/href/external` only (12 lines); `SocialId` at `src/types/index.ts:5` |
| Step 3 `SocialLinks` rewrite + Hero/Footer cutover | DONE — 51-line prop-less component, icons keyed by `SocialId`, `target`/`rel` only for `external`; Hero's 35-line inline array deleted (Hero 138 lines), Footer 37 lines; the `SocialLink` interface is gone |
| Step 4 strings | DONE — 11 keys at `src/i18n/strings.ts:11-21`, `strings.social` at `:23-30`, `common.socialAriaLabels` deleted |
| Step 5 `MobileMenu.tsx` | DONE — no key handler anywhere; Appearance order Mode → Language → Theme color (Q12) verified in the rendered markup — **superseded by Q15, then Q16**; Q13 renders the palette row inline from `paletteIds.map` (swatch buttons, `aria-pressed`, `nav-palette-preview`) instead of mounting `ThemePaletteMenu`; 2026-10-17 focus target moved to the panel (`sheetRef` + `tabIndex={-1}`), first-link ref removed — 145 lines |
| Step 6 `RollingTextLink` `aria-current` + `ref` | DONE — `ariaCurrent` forwarded to `<Link>`; the `ref` half was **deleted 2026-10-17** when the sheet stopped focusing a link (126 → 124 lines) |
| Step 7 `Navigation.tsx` rewiring | DONE — 154 lines: `navPaths` import, `triggerRef` + `closeMenu` with the `offsetParent` guard, one effect doing body-lock + `inert` ×3 + document `Escape`, a `matchMedia('(max-width: 1024px)')` effect, `AnimatePresence mode="wait"` icon morph, `aria-controls="mobile-menu"`, translated hamburger label, route-change effect deleted, inline sheet replaced; `.nav-actions` order is theme toggle → language toggle → palette → hamburger (`:84-112`) — **superseded by Q15, then Q16** |
| Step 8 CSS | DONE — `src/App.css` 1919 lines at Q13, 1908 after Q14: `.nav` 94% with the contrast comment at `:2-4`; sheet block written from Step 8 (48px rows, `--text-lede` links, `--text-meta` heading with `line-height: 1`, 12px group padding/margin with one hairline per group and `:last-child` cleared, `padding: 24px 24px calc(24px + env(safe-area-inset-bottom))`, `.mobile-menu-inner` capped at `var(--max-content)`), the `@media (min-width: 1025px)` guard, `.mobile-menu.open` + `@keyframes slideIn` deleted; Q13 adds `.mobile-menu-swatch-option` and a ≤1024px `.nav-palette` hide rule; Q14 adds `.nav-control` (`:91-116`), `.lang-toggle` (`:119-123`) and the `@media (max-width: 420px)` bar guard (`:305-313`), and deletes that hide rule. Line numbers in this row are Q13-era; current positions are sheet block `:140-291`, 1025px guard `:315-319`, palette block `:321-340`. `vite build` green — CSS 33.39 kB at Q13, 32.84 kB after Q14 |
| Step 9 removals | DONE — `.nav-palette-sheet` was trimmed **in place** at `src/App.css:419-421` (`display: block` only) rather than overridden earlier in the file, where the same-specificity rule downstream wins the cascade; `.social-link span { display: none }` deleted; `≤768px` centering scoped to `.hero .social-links, .footer .social-links`; `ThemePaletteMenu.tsx` Escape calls `stopPropagation()` **only while the submenu is open**, because React's synthetic `stopPropagation()` also stops the native event and would otherwise swallow the sheet's Escape when the submenu is closed. Q13 then deletes `.nav-palette-sheet` and `.nav-palette-group` outright (34 lines) |
| §9 verification gates | DONE — `tsc -b` exit 0; oxlint **19** findings (11 errors / 8 warnings, down from 20); hex/rgba in `App.css` **0**; `slideIn` **0**; inline `fontSize`/`lineHeight`/`color` **0**; dead-class gate (`nav-palette-sheet`, `nav-palette-group`, `nav-palette-current` in `src/App.css` and `src/components/layout/`) **0**; SSR smoke **15/15** assertions (closed sheet renders nothing, dialog semantics, 3 group headings, 6 rows, one `aria-current="page"`, 4 text + 2 swatch options with exactly 3 `aria-pressed="true"`, Mode→Language→Theme color order, palette row as last child, icon-only bar trigger with its accessible name intact, 6 social tiles, `mailto:` without `target`/`rel`); `vite build` 544 modules; `pnpm build:resume-all` unchanged (`dist/resume.pdf`, `dist/resume-vi.pdf`) — re-run after Q14 in the row below |
| `pnpm build` into `dist/` | BLOCKED — environmental, not this change: `tsc -b` passes and all 544 modules transform, then `vite:prepare-out-dir` throws `EPERM` emptying `dist/assets` (files dated 2026-10-11, held by a process outside this session). Re-attempted 2026-10-17 after Q14 with the same result — `dist/assets/index-DDuKIRi6.css` and `index-NP6sYlub.js` are still the 2026-10-11 pair. `vite build --outDir dist-verify` completes the identical build (544 modules, CSS 32.84 kB) and was deleted afterwards. Needs the owner to stop whatever is serving `dist/` |
| §11 acceptance-criteria audit | DONE — 14 of 19 closed. Static evidence: bar `height: 64px` (`src/App.css:19`) matches the sheet's `top: 64px` and §3.3's "viewport − 64px"; the 647px total reproduces from the implemented values (6×48 `:184` + 3×(15+8) `:167-172` + 3×48 segmented rows `:215` + 48 `:613` + 48 group spacing `:150-162` + 2 hairlines + 48 padding `:140`); `!important` count unchanged 9 → 9; `inert` selectors all resolve to real DOM (`#main-content` `Layout.tsx:13`, `.footer` `Footer.tsx:13`, `.back-to-top` `src/components/ui/BackToTop.tsx:26` — it renders only after a scroll, and the code handles `null`); `MobileMenu.tsx` holds no `useState`/`useEffect` for any control — `useRef` only, so no control holds local state; the sheet's `aria-controls="mobile-menu"` resolves to the `id="mobile-menu"` on the panel; the footer's lift is superseded by motion's inline `transform: scale(1.1)` (`SocialLinks.tsx:43`), which wins over `.social-link:hover { transform: translateY(-3px) }` (`src/App.css:622`) — kept per Step 9, which does not list that rule |
| Owner follow-up Q12 — Theme color after Language, in bar and sheet | DONE — `Navigation.tsx:102-111` and `MobileMenu.tsx:113-115` moved; §3.1, Step 5, Step 8 comment, §7, §10 Q12, §11 and the layout spec updated; re-verified by `tsc -b`, oxlint, `vite build` and the SSR order assertions |
| Owner follow-up Q13 — icon-only bar control, swatch row in the sheet | DONE — `ThemePaletteMenu.tsx` (76 lines, bar-only, no `variant`), `Navigation.tsx:111`, `MobileMenu.tsx:5,19,115-132`, `src/App.css` (`:250-278` added, `:338-339` swatch 16px, 39 lines of `.nav-palette-sheet` / `.nav-palette-group` removed); §3.1, §3.3 (643 → 647 + device table), Step 5, Step 8, Step 9, §7, §8, §9, §10, §11 updated, plus `spec-ui-layout.md` and `AGENTS.md`; re-verified by `tsc -b`, oxlint 19, hex gate 0, dead-class gate 0, SSR smoke 15/15, `vite build` 544 modules |
| Cascade defect found while wiring Q13 | DONE (found by static review, not by the browser pass) — the pre-Q13 rule `.nav-palette-nav { display: none }` (`src/App.css:289`) never applied: the wrapper carried both classes and `.nav-palette { display: flex }` sat **later** in the file at the same specificity (0,1,0), so the bar's palette control was visible at ≤1024px beside the hamburger, duplicating the sheet's Theme color row. The dead selector was deleted and the hide rule moved after the `.nav-palette` block. **Q14 then deleted that hide rule too** — the bar control is meant to render on phones — so no `.nav-palette` display rule exists inside the ≤1024px block today (verified: the block holds only `.nav-menu` and `.mobile-menu-btn`, `src/App.css:293-301`) |
| Owner follow-up Q14 — palette control in the bar at every width, one shared `.nav-control` chrome | DONE — `ThemePaletteMenu.tsx:29-40` (trigger `nav-control nav-palette-trigger`, chevron svg deleted, one 20px half-circle swatch, name in `aria-label`, hint in `title`), `Navigation.tsx:85,103` (`nav-control` on the mode and language controls), `src/App.css:91-116` shared chrome + hover/open + focus, `:119-123` `.lang-toggle` glyph step imported from `src/index.css` (file 368 → 351 lines), `:305-313` ≤420px guard, `:331-340` half-circle swatch using `--swatch-empty` (`src/index.css:146-152`), ≤1024px `.nav-palette` hide rule deleted; §3.1, §3.4, §7, §8, §9, §10 and §11 updated here, and `spec-ui-layout.md:103-104` + `AGENTS.md` Theming corrected |
| §9 gates re-run after Q14 (2026-10-17) | DONE — `tsc -b` exit 0; oxlint **19** finding lines (11 errors / 8 warnings); hex/`rgba(` in `src/App.css` **0**; `slideIn` **0**; dead-class gate **0**; inline `fontSize`/`lineHeight`/`color` **0**; SSR smoke **16/16** — the 15 Q13-era assertions plus two new bar assertions (control order mode → language → theme color → hamburger; trigger renders no text node but keeps `aria-label="Theme: Red"` + `title="Switch theme color"` + `aria-expanded` + the swatch, no chevron); `vite build --outDir dist-verify` 544 modules, CSS 32.84 kB, deleted after |
| Owner follow-up Q15 — Mode → Theme → Language, in the bar and in the sheet | DONE 2026-10-17 — `Navigation.tsx:102-111` (palette control moved ahead of the language button) and `MobileMenu.tsx:93-132` (Theme color segment moved ahead of the Language segment); §3.1 anatomy, §3.4, §10 Q15, §11 criteria, `spec-ui-layout.md:103,106,115` and `AGENTS.md` Theming corrected. Re-verified: `tsc -b` exit 0; oxlint **19** finding lines; hex/`rgba(` in `src/App.css` **0**; throwaway SSR smoke **8/8**; `vite build --outDir dist-verify` green then deleted. **Superseded the same day by Q16 below** |
| Owner follow-up Q16 — Language first: Language → Mode → Theme | DONE 2026-10-17 — `Navigation.tsx:84-111` (language button first, mode toggle second, `<ThemePaletteMenu />` third at `:111`) and `MobileMenu.tsx:71-132` (Language segment `:71-91`, Mode `:93-113`, Theme color `:115-132`); §3.1 anatomy, §3.4, §9's smoke row, §10 (Q15 note + Q16), §11 criteria, `spec-ui-layout.md:103,106,115`, `AGENTS.md` Theming and `spec-v3-theme-palette-switch.md:242,244,466` corrected. Re-verified: `tsc -b` exit 0; oxlint **19** finding lines; hex/`rgba(` in `src/App.css` **0**; inline `fontSize`/`lineHeight`/`color` **0**; throwaway SSR smoke **8/8** — bar order lang-toggle (2425) < theme-toggle (2534) < palette-trigger (2974) < hamburger (3729), sheet segment labels `Language \| Mode \| Theme` with the swatch row last, three `aria-pressed="true"` groups intact, 6 nav links with one `aria-current="page"`; `vite build --outDir dist-verify` green then deleted; script deleted after the run. Markup-only: no CSS rule keys off child order, so the 647px sheet total and the 320px bar arithmetic still hold |
| Defect — the sheet rolled "Home" on every open | DONE 2026-10-17 — owner-reported. Cause: `MobileMenu.tsx` focused the **first sheet link** in `onAnimationComplete`, and `RollingTextLink` maps `onFocus` → its rolling-text animation, so Home's text rolled on every route (and stayed rolled while focused). Fix: `sheetRef` + `tabIndex={-1}` on the panel (`MobileMenu.tsx:22,28,33,39`; file 144 → 145 lines), the link `ref` prop deleted from `RollingTextLink` (126 → 124 lines, no caller left), `.mobile-menu:focus { outline: none }` (`src/App.css:157-163`) so the panel draws no viewport-sized ring. §7 Focus row, the Step 5 listing + its note, Step 6, §8, §11 and `spec-ui-layout.md:116` updated. Verified: throwaway SSR smoke **6/6** — the panel carries `role="dialog" aria-modal="true" tabindex="-1"`, all 6 sheet links carry no `tabindex`, exactly one `aria-current="page"` and it sits on the row matching the route (`/projects`), the appearance order and the three `aria-pressed` groups intact, bar order intact; `tsc -b` exit 0; oxlint **19**; hex gate **0**; `vite build --outDir dist-verify` green then deleted; script deleted after the run. The visible "no roll on open" is the owner's browser check (repo rule §5) |
| Owner browser pass | TODO |
| Owner follow-up Q17 — hamburger to the left of the bar | DONE 2026-10-17 — `Navigation.tsx:59-102` (`.nav-brand` group: trigger then logo), `src/App.css:32-39` (`.nav-brand` rule) and `:319-334` (≤420px guard gains `.nav-brand { gap: 8px }` plus the corrected arithmetic comment); `AGENTS.md:61` and `spec-ui-layout.md:103,106,114` corrected. Full record in `specs/v3/spec-v3-nav-swatch-and-hamburger.md` §11 |
| Owner follow-up — the brand becomes a home icon | DONE 2026-10-17 — `Navigation.tsx:97-106`, `src/App.css:25-36`, `:47-55`, `:319-330`. The `{CV}` in the §3.1 ASCII anatomy above now reads as a house glyph; the wordmark's two spans and their CSS are deleted. Full record in `spec-v3-nav-swatch-and-hamburger.md` §11 |

---

## 13. Findings outside this scope (each needs its own decision)

| File | Finding |
|---|---|
| `src/App.css:6` | The sticky bar was `color-mix(in srgb, var(--bg-surface) 85%, transparent)` — 15% see-through. With an `--accent` element scrolled under it, measured contrast drops to **4.01** (red-light `--text-muted` nav links), 4.08 (blue-dark muted), 4.09 (blue-light accent). **Resolved into this batch by the owner's Q7 answer** — Step 8 sets 94%, which measures 4.58 minimum. Kept here because it was a pre-existing AA defect, not something this feature introduced |
| `docs/design/specs/ui/spec-ui-layout.md:93-97` | Documents the theme control as "Cycle: dark → light → system → dark"; `system` was removed (`spec-v3-theme-switch.md`, `useTheme.tsx:4-5`) and the palette menu is undocumented there |
| `docs/design/specs/ui/spec-ui-layout.md:112-115` | "Mobile < 768px" as the navigation breakpoint; the nav collapses at 1024px (`src/App.css:176-188`) |
| `src/components/layout/Navigation.tsx:61,81` | `aria-label` "Switch theme (currently …)" and "Switch language" are English-only while every other nav label is translated |
| `src/App.css:840-843`, `:852-854` | `!important` tile overrides left over from the v2/v3 hero overlay work (`spec-v3-ui-enhancements.md:915-921`); `.hero` has no dark overlay today (`src/App.css:583-590`), so these rules may now be dead weight |
| `AGENTS.md` Pages table | Lists Philosophy before Contact; the app renders Projects → Contact → Philosophy (`Navigation.tsx:8`). **Resolved by Q8**: the code order is authoritative and `navPaths` copies it, so the fix is to AGENTS.md's table, not to the routes |
| `src/components/ui/Typewriter.tsx:27` | The second `react(set-state-in-effect)` warning in `src/`; out of scope here (this spec removes only the `Navigation.tsx:27` one) and needs its own decision |
| `src/hooks/useLanguage.tsx:3` | Redefines `type Language = 'en' \| 'vi'` locally while `src/types/index.ts:1` already exports it — two definitions of the same union; harmless today, worth collapsing when the i18n surface next changes |
