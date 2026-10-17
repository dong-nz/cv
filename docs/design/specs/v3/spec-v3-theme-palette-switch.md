# Specification — v3 Theme Palette Switch (Red / Blue)

> **Document:** `spec-v3-theme-palette-switch.md`
> **Version:** 0.4.0 (implementation applied 2026-10-17 — §6 and §7 now show the shipped code, §11–§12 and §14 carry the verification evidence; 0.4.0 adds the `--accent-solid` family that `spec-v3-nav-cta-enhancements.md` introduced into the palette blocks)
> **Parents:** `spec-v3-theme-palette-gasatrya.md` (the shipped token set), `spec-v3-theme-switch.md` (the dark/light control)
> **Priority:** P1
> **Estimate:** ~3 hours including contrast verification and browser pass
> **Status:** IMPLEMENTED 2026-10-17 — Steps 1–8 are on disk, §6–§7 show the shipped code, §14 records the verification. Open: the owner's browser pass (4 combinations × ≤1024px) and the commit decision.

---

## 1. Problem

The site has one brand color. `src/index.css` defines three palette blocks (`:root` dark default, `:root[data-theme='light']`, and the `prefers-color-scheme: light` bridge) and all three carry the same red accent family (`#f87171` dark, `#b04138` light). A visitor can change *lightness* (sun/moon button in the nav) but has no way to see the site in the blue identity that `spec-v3-theme-colors.md` once described — that palette was never implemented and the document is marked superseded.

Concretely today:

| Control | Exists? | Where |
|---|---|---|
| Dark ↔ light | ✅ | `.theme-toggle` button, `src/components/layout/Navigation.tsx:57-73` |
| Red ↔ blue | ❌ | nothing — the accent family is hard-coded in the three `src/index.css` blocks |
| Persisted choice | ✅ theme only | `localStorage` key `portfolio-theme`, `src/hooks/useTheme.tsx:14` |
| No-flash on reload | ✅ theme only | init script `index.html:8-20` sets `data-theme` before paint |

There is also a naming trap this spec has to settle: the code already calls dark/light **theme** (`type Theme = 'dark' | 'light'`, `src/hooks/useTheme.tsx:4`). The new choice is a *color* axis. Reusing the word "theme" for both would make `theme: 'red'` collide with `data-theme="light"`. This spec therefore names the new axis **palette** in code (`Palette`, `data-palette`, `portfolio-palette`) and labels it **"Theme color" / "Màu giao diện"** in the UI — the house spelling is US "color" (`spec.md` §26 "Color System", `spec-v3-theme-colors.md` "Theme Colors").

---

## 2. Goal

1. Two palettes — **Red** (current, default) and **Blue** (new) — each with a dark and a light variant: 4 verified combinations.
2. A menu in the navigation to pick the palette, working on desktop **and** on mobile.
3. Choice persists across reloads and routes, and applies **before first paint** (no red flash for a blue user).
4. Dark/light and Red/Blue are independent: switching one never changes the other.
5. Every combination passes WCAG AA (≥ 4.5:1 for text, ≥ 3.0 for meaningful UI edges) — measured, not asserted.
6. No layout change, no new dependency, no new type scale, no hard-coded hex outside the palette declaration blocks.

Non-goals: a third palette, per-page palettes, a system-following palette, and any change to the resume PDF (its print inks are fixed in `public/resume-template.html`, retinted for red in `spec-v3-theme-palette-gasatrya.md` §4.4).

---

## 3. Current state (verified)

| Fact | Evidence |
|---|---|
| `Theme = 'dark' \| 'light'`, no `'system'`; `data-theme` set **during render**, not in an effect | `src/hooks/useTheme.tsx:3`, `:39` |
| `resolvedTheme` exists only for API compatibility — `resolveTheme` is the identity function | `src/hooks/useTheme.tsx:29-31` |
| Storage: single key `portfolio-theme`, written in an effect wrapped in try/catch | `src/hooks/useTheme.tsx:14`, `:41-47` |
| Pre-paint script reads storage, falls back to `prefers-color-scheme`, else `dark` | `index.html:8-20` |
| Nav bar is `position: sticky; z-index: 1000`, height 64px | `src/App.css:2-20` |
| Mobile menu is a full-screen sheet, `top: 64px`, `z-index: 999` (below the nav) | `src/App.css:125-141` |
| Nav actions row: theme toggle, language toggle, hamburger | `src/components/layout/Navigation.tsx:56-99` |
| Hamburger appears at ≤1024px; `.mobile-menu-btn` is `display: none` above it | `src/App.css:109-122`, `:176-184` |
| Existing dropdown idiom: absolute panel under a trigger — `--bg-elevated`, `1px solid --border`, radius 8, `0 4px 12px --shadow`, `z-index: 100`, option hover = accent fill + `--text-on-accent` | `src/App.css:732-757` |
| A click-outside hook already exists and is the pattern to reuse | `src/hooks/useClickOutside.ts:3-16` |
| Nav strings live in `strings.nav` | `src/i18n/strings.ts:2-9` |
| The footer has **no** theme control | `src/components/layout/Footer.tsx` (no `useTheme` import) — `spec-v3-theme-switch.md` §Step 5 claims it does; that claim is stale |
| `--accent-soft` / `--accent-glow` **were** `rgba(239, 68, 68, …)` = `#ef4444` while `--accent` is `#f87171` (dark) / `#b04138` (light) | `src/index.css:13,15,71,73` — **resolved 2026-10-16**, re-derived from the accent in force; see §5 "Red, re-derived" |

---

## 4. Model

Two orthogonal axes, both attributes on `<html>`:

| Axis | Type | Values | Attribute | Storage key | Default |
|---|---|---|---|---|---|
| lightness | `Theme` (existing) | `'dark' \| 'light'` | `data-theme` | `portfolio-theme` | system, else `dark` |
| color | `Palette` (new) | `'red' \| 'blue'` | `data-palette` | `portfolio-palette` | `'red'` |

4 reachable combinations: red-dark (the shipped default), red-light, blue-dark, blue-light.

### Attribute → block matrix and specificity

| `data-theme` | `data-palette` | Block that wins | Specificity |
|---|---|---|---|
| absent | absent | `:root` (dark red) → then the `prefers-color-scheme: light` bridge may repaint to light red | 0,1,0 / 0,2,0 |
| `dark` | absent | `:root` | 0,1,0 |
| `light` | absent | `:root[data-theme='light']` | 0,2,0 |
| `dark` | `blue` | `:root[data-theme='dark'][data-palette='blue']` | **0,3,0** |
| `light` | `blue` | `:root[data-theme='light'][data-palette='blue']` | **0,3,0** |

Two-attribute selectors beat both base blocks, so block order no longer decides the winner — the only ordering requirement is readability. **No blue variant is needed inside the `prefers-color-scheme` bridge**: `data-palette` is written by the init script, and that same script always writes `data-theme`, so a request that reaches the bridge (script blocked / no-JS) is by definition also a request with no stored palette → red. If the script is blocked, the site is red in the OS-preferred lightness: an acceptable, documented degradation.

---

## 5. Palettes

Red's neutrals, accents, borders, tints and shadows stay byte-identical to what is shipped (`src/index.css:2-57`, `:60-85`); only its two derived alphas were re-derived from the accent in force — see "Red, re-derived" below. Blue is new. Blue's neutrals are retinted cool — the same move the red palette makes warm (`#151914`, `#202423`, `#2a3028` all carry a green cast); a blue accent sitting on a green-cast neutral reads as a mismatch, not as a theme.

### Blue, dark

```css
--bg-primary: #0f1117;   --bg-surface: #161922;   --bg-elevated: #1c2030;
--text-primary: #e8eaed; --text-secondary: #9aa0a6; --text-muted: #828d9e;
--accent: #60a5fa;       --accent-hover: #93c5fd;  --accent-active: #3b82f6;
--text-on-accent: #0f1117;
--accent-solid: #1d4ed8;  --accent-solid-hover: #1e40af; --accent-solid-active: #1c3f9e;
--text-on-accent-solid: #e8eaed;
--accent-soft: rgba(96, 165, 250, 0.12);
--accent-tint: #182338;
--accent-glow: rgba(96, 165, 250, 0.30);
--border: #2a3040;       --border-strong: #39415a;
--shadow: rgba(0, 0, 0, 0.45);
--inset-highlight: rgba(255, 255, 255, 0.05);
--code-bg: #1a1e2e;
--success: #34d399;      --success-glow: rgba(52, 211, 153, 0.35);
--error: #f87171;        --warning: #fbbf24;
--grid-color: rgba(232, 234, 237, 0.06);
color-scheme: dark;
```

### Blue, light

```css
--bg-primary: #f4f6f9;   --bg-surface: #fbfcfe;   --bg-elevated: #ffffff;
--text-primary: #111827; --text-secondary: #4b5563; --text-muted: #5c6b82;
--accent: #2563eb;       --accent-hover: #1d4ed8;  --accent-active: #1e40af;
--text-on-accent: #ffffff;
--accent-solid: #2563eb;  --accent-solid-hover: #1d4ed8; --accent-solid-active: #1e40af;
--text-on-accent-solid: #ffffff;
--accent-soft: rgba(37, 99, 235, 0.10);
--accent-tint: #eef3fc;
--accent-glow: rgba(37, 99, 235, 0.22);
--border: #dfe3ea;       --border-strong: #d3d8e1;
--shadow: rgba(17, 24, 39, 0.10);
--inset-highlight: rgba(255, 255, 255, 0.9);
--code-bg: #eceff5;
--success: #15803d;      --success-glow: rgba(21, 128, 61, 0.35);
--error: #991b1b;        --warning: #b45309;
--grid-color: rgba(17, 24, 39, 0.07);
color-scheme: light;
```

Three values were **not** copied from the old blue draft (`spec-v3-theme-colors.md`) because that document predates the current token set and never measured anything:

| Token | Old blue draft | This spec | Why |
|---|---|---|---|
| `--text-muted` dark | `#6b7280` | `#828d9e` | `#6b7280` measures 3.90 on `#0f1117` and 3.63 on `#161922` — AA fail. `#828d9e` measures 5.62 / 5.23 / 4.81 (primary / surface / elevated) |
| `--text-muted` light | `#64748b` | `#5c6b82` | `#64748b` measures 4.40 on `#f4f6f9` — AA fail. `#5c6b82` measures 5.00 / 5.27 / 5.41 |
| `--accent-tint` light | — | `#eef3fc` | with `#e2eaf8` the accent reads 4.27 on the tint (fail, and the tint is a real background: `src/App.css:809`); `#eef3fc` gives 4.64 |

`--accent-soft` and `--accent-glow` are derived from the accent actually in force (96,165,250 / 37,99,235), which the red palette does not do today (see §3, last row) — see §10 for the cleanup decision.

### Measured contrast (WCAG relative luminance, all four combinations)

Text pairs, need ≥ 4.5:

| Pair | red-dark | red-light | blue-dark | blue-light |
|---|---|---|---|---|
| text-primary / bg-primary | 16.31 | 16.31 | 15.66 | 16.39 |
| text-primary / bg-surface | 14.40 | 17.05 | 14.56 | 17.28 |
| text-primary / bg-elevated | 13.30 | 17.78 | 13.42 | 17.74 |
| text-secondary / bg-primary | 8.11 | 4.80 | 7.15 | 6.98 |
| text-secondary / bg-surface | 7.16 | 5.02 | 6.65 | 7.36 |
| text-muted / bg-primary | 6.08 | 4.77 | 5.62 | 5.00 |
| text-muted / bg-surface | 5.37 | 4.99 | 5.23 | 5.27 |
| text-muted / bg-elevated | 4.96 | 5.20 | 4.81 | 5.41 |
| accent / bg-primary | 6.43 | 5.26 | 7.42 | 4.77 |
| accent / bg-surface | 5.67 | 5.50 | 6.90 | 5.03 |
| accent / bg-elevated | 5.24 | 5.74 | 6.36 | 5.17 |
| accent-hover / bg-surface | 8.27 | 6.15 | 9.73 | 6.53 |
| text-on-accent / accent | 6.43 | 5.74 | 7.42 | 5.17 |
| text-on-accent / accent-hover | 9.37 | 6.42 | 10.46 | 6.70 |
| text-on-accent / accent-active | 5.54 | 7.29 | 5.13 | 8.72 |
| text-on-accent-solid / accent-solid | 5.26 | 5.74 | 5.56 | 5.17 |
| text-on-accent-solid / accent-solid-hover | 6.00 | 6.42 | 7.24 | 6.70 |
| text-on-accent-solid / accent-solid-active | 6.68 | 7.29 | 7.73 | 8.72 |
| accent / accent-tint | 5.74 | 4.63 | 6.18 | 4.64 |
| text-primary / accent-tint | 14.58 | 14.36 | 13.04 | 15.93 |
| text-primary / code-bg | 15.47 | 15.08 | 13.73 | 15.40 |
| text-secondary / code-bg | 7.69 | 4.44 † | 6.27 | 6.56 |
| text-muted / code-bg | 5.77 | 4.41 † | 4.93 | 4.70 |
| success / bg-surface | 9.01 | 4.81 | 9.13 | 4.89 |
| error / bg-surface | 8.27 | 7.97 | 6.35 | 8.10 |
| warning / bg-surface | 9.40 | 4.81 | 10.52 | 4.89 |
| **minimum (pairs the design renders)** | **4.96** | **4.63** | **4.81** | **4.64** |

Zero AA failures in the pairs the design renders. `--code-bg` is consumed only by `code` / `pre` — `grep -n "code-bg" src/index.css src/App.css` returns exactly two uses, `src/index.css:265` and `:273`, and neither rule declares a `color`, so code text inherits `--text-primary` (13.30–17.78). The two `†` cells are secondary/muted text placed on `--code-bg`, a pairing no rule in `src/` produces; they are recorded so that introducing one later is visibly a fail, not an oversight.

Layering invariant `luminance(bg-primary) < luminance(bg-surface) < luminance(bg-elevated)`:

| red-dark | red-light | blue-dark | blue-light |
|---|---|---|---|
| 0.0091 < 0.0169 < 0.0224 ✅ | 0.9131 < 0.9566 < 1.0000 ✅ | 0.0056 < 0.0098 < 0.0149 ✅ | 0.9198 < 0.9729 < 1.0000 ✅ |

Hairline borders are deliberately **outside** the text gate: `--border` / `--border-strong` measure 1.19–1.74 against their backgrounds in every palette, red included. They are separators and panel outlines, not state-bearing component boundaries (WCAG 1.4.11 applies to boundaries needed to identify a control), and the shipped design already uses this hairline model (`spec-v3-theme-palette-gasatrya.md` §3.2). Blue keeps the same relative step as red: `border ≈ bg + 0x15`, `border-strong ≈ border + 0x10`.

### Red, re-derived (applied 2026-10-16)

`--accent-soft` and `--accent-glow` now use the accent **in force**, not a third red that happens to sit between the two accents:

| Block | Before | After |
|---|---|---|
| dark — `src/index.css:13`, `:15` | `rgba(239, 68, 68, 0.12)` / `rgba(239, 68, 68, 0.3)` | `rgba(248, 113, 113, 0.12)` / `rgba(248, 113, 113, 0.3)` |
| light — `src/index.css:71`, `:73` | `rgba(239, 68, 68, 0.1)` / `rgba(239, 68, 68, 0.22)` | `rgba(176, 65, 56, 0.1)` / `rgba(176, 65, 56, 0.22)` |
| bridge — `src/index.css:100`, `:102` | same as light | same as light |

Only the hue source moved; every alpha is the value `spec-v3-theme-palette-gasatrya.md` signed off.

`--accent-soft` is the one derived token that carries text: `.btn-secondary` sets `color: var(--accent)` (`src/App.css:228`) and `:hover` paints `background: var(--accent-soft)` (`src/App.css:235`). Every other use is a halo, ring or shadow and is decorative: `.btn-primary` shadows (`src/App.css:212`, `:219`, `:223`), the timeline pulse keyframes (`:1020`, `:1027`), the first-entry marker ring (`:975`), the TLDR diamond ring (`:1105`), the responsibility bullet dot (`:1199`). `--accent-glow` never carries text.

Wash composites and the resulting accent-on-wash ratios:

| Background | old wash | accent on old wash | new wash | accent on new wash | wash vs background |
|---|---|---|---|---|---|
| dark `#151914` | `#2f1b1b` | 5.87 | `#302020` | 5.61 ✅ | 1.10 → 1.15 |
| dark `#202423` | `#392424` | 5.23 | `#3a2a2a` | 4.92 ✅ | 1.09 → 1.15 |
| dark `#272a28` | `#3f2a2a` | 4.82 | `#403030` | 4.51 ✅ | 1.09 → 1.16 |
| light `#f6f5f2` | `#f5e4e4` | 4.67 | `#efe4e3` | 4.61 ✅ | 1.13 → 1.14 |
| light `#fbfaf8` | `#fae9e9` | 4.89 | `#f4e8e8` | 4.80 ✅ | 1.12 → 1.15 |
| light `#ffffff` | `#fdecec` | 5.02 | `#f7eceb` | 4.96 ✅ | 1.14 → 1.16 |

No AA regression — the worst pair is 4.51 (dark accent text on a soft wash over `--bg-elevated`), and the wash became slightly more visible against its background in every case. Verified against the emitted bundle: `--accent-soft:#f871711f`, `--accent-glow:#f871714d`, `--accent-soft:#b041381a` (×2, light block + bridge), `--accent-glow:#b0413838` (×2) — hex-alpha form, 0x1f = 0.12, 0x4d = 0.30, 0x1a = 0.10, 0x38 = 0.22.

The resume PDF is independent of this: `scripts/generate-resume.ts` and `public/resume-template.html` reference no theme token (`grep 'accent|--bg|--text'` → 0 matches), and both regenerated PDFs still render the five entries with no `undefined`.

### Solid accent family (added 2026-10-17)

`spec-v3-nav-cta-enhancements.md` §4.3 adds a fourth accent tier so an accent-filled surface can carry **light** text in dark mode. `--accent` / `--accent-hover` / `--accent-active` keep their job — signal colour (links, underlines, borders, glows) and the fill of the accent surfaces the new family does not cover. `--accent-solid` / `-hover` / `-active` plus `--text-on-accent-solid` are the fill and text of `.btn-primary` and `.badge-accent`, declared after each block's `--text-on-accent` line in `src/index.css`.

| Block | `--accent-solid` | `-hover` | `-active` | `--text-on-accent-solid` | text on solid |
|---|---|---|---|---|---|
| dark red (`:root`) | `#b04138` | `#a33a32` | `#9b3229` | `#f6f5f2` | 5.26 |
| light red (`[data-theme='light']`) | `#b04138` | `#a8382f` | `#9b3229` | `#ffffff` | 5.74 |
| dark blue (`[data-theme='dark'][data-palette='blue']`) | `#1d4ed8` | `#1e40af` | `#1c3f9e` | `#e8eaed` | 5.56 |
| light blue (`[data-theme='light'][data-palette='blue']`) | `#2563eb` | `#1d4ed8` | `#1e40af` | `#ffffff` | 5.17 |
| `prefers-color-scheme: light` bridge | `#b04138` | `#a8382f` | `#9b3229` | `#ffffff` | 5.74 |

Three facts to keep: the two light blocks duplicate `--accent` / `--accent-hover` / `--accent-active` / `--text-on-accent` verbatim, so light mode does not move by a pixel; blue-dark cannot start at the light-mode blue accent `#2563eb` because `#e8eaed` on it measures **4.29**, one step under the text floor; and in dark mode the solid fill alone sits at 3.10 (red) / 2.82 (blue) against `--bg-primary` — under the 3.0 UI-boundary line — which is why `.btn-primary` carries `border: 1px solid var(--accent)` at 6.43 / 7.42.

---

## 6. UI — the menu

### Placement

One component, two placements, chosen by media query. No floating sheet that can collide with the mobile menu sheet.

| Width | Trigger | Options |
|---|---|---|
| > 1024px | in `.nav-actions`, after the mode toggle — last of the three appearance controls | absolute panel under the trigger, right-aligned to it |
| ≤ 1024px | a block at the bottom of `.mobile-menu`, after the nav links — 44px tap targets | the options are **inline in the mobile sheet**, not a second overlay |
> **Superseded 2026-10-17 by Q13–Q16 of `spec-v3-mobile-navigation.md`:** the `variant` split described below is gone. One bar-only trigger renders at **every** width (no ≤1024px hide rule, Q14), the sheet draws its own Theme color row from `paletteIds` (Q13), and the bar order is language → mode → theme color → hamburger (Q16). §7 shows the shipped component; `AGENTS.md` Theming and `specs/ui/spec-ui-layout.md:103-106` carry the current wording.

**Why 1024px, not 768px.** `.nav-menu` is hidden and `.mobile-menu-btn` appears at `@media (max-width: 1024px)` (`src/App.css:176-184`). Using the same breakpoint means *whatever collapses into the sheet collapses together*. A 768px palette breakpoint would leave a 769–1024px band where the page links hide behind a hamburger while a color menu sits in the bar — two navigation idioms at the same time. Cost of the choice: at 800px the palette costs two taps instead of one. Alternative if the owner wants one tap: keep 768px and hide the label (`.nav-palette-current { display: none }`) down to 1024px — the bar fits comfortably there; crowding is only a risk *below* 1024px, which is where the hamburger already lives. Not taken: the shipped build collapses at 1024 with the links.

Consequence on phones and tablets: `.nav-actions` keeps exactly three controls (theme, language, hamburger) — unchanged from today, so the 320px bar cannot overflow. The two instances are the same component rendered twice with a `variant` prop, one hidden per breakpoint (`display: none` removes it from the accessibility tree).

### Component

New file `src/components/layout/ThemePaletteMenu.tsx`:

```tsx
interface ThemePaletteMenuProps {
  variant: 'nav' | 'sheet'
}
```

Wiring, then markup (rendered identically for both variants):

```tsx
const close = useCallback(() => setOpen(false), [])
useClickOutside(containerRef, close)

const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (event.key !== 'Escape') return
  close()
  triggerRef.current?.focus()          // keep the screen-reader position on Escape
}
```

```tsx
<div ref={containerRef} className={`nav-palette nav-palette-${variant}`} onKeyDown={handleKeyDown}>
  <button
    ref={triggerRef}
    type="button"
    className={`nav-palette-trigger ${open ? 'open' : ''}`}
    aria-expanded={open}
    aria-controls={`palette-menu-${variant}`}
    aria-label={`${strings.nav.palette[lang]}: ${paletteMeta[palette].label[lang]}`}
    title={strings.nav.paletteAria[lang]}
    onClick={() => setOpen((prev) => !prev)}
  >
    <span className="nav-palette-swatch" aria-hidden="true" />
    <span className="nav-palette-group">{strings.nav.palette[lang]}</span>
    <span className="nav-palette-current">{paletteMeta[palette].label[lang]}</span>
    <svg className="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  <div id={`palette-menu-${variant}`} className={`nav-palette-panel ${open ? 'open' : ''}`}>
    {paletteIds.map((id) => (
      <button
        key={id}
        type="button"
        className={`nav-palette-option ${id === palette ? 'active' : ''}`}
        aria-current={id === palette ? 'true' : undefined}
        onClick={() => { setPalette(id); setOpen(false) }}
      >
        <span className="nav-palette-preview" data-preview={id} aria-hidden="true" />
        <span className="nav-palette-name">{paletteMeta[id].label[lang]}</span>
        <span className="nav-palette-hint">{paletteMeta[id].hint[lang]}</span>
      </button>
    ))}
  </div>
</div>
```

The `id` is derived from `variant`. Both instances are mounted at the same time (one hidden by CSS), so a hard-coded id would appear twice in the document — invalid HTML and a broken `aria-controls`.

`paletteIds` and `paletteMeta` live in `src/data/palettes.ts`, shaped like `src/data/resume.ts:6-9` (`Record<Language, string>`, not `{ en, vi }` object literals) so adding a third language fails at compile time instead of silently rendering `undefined`. `paletteMeta` is keyed by `Palette` rather than an array of `{ id, … }` rows: the component indexes `paletteMeta[id].label[lang]` inline, which removes the need for a `paletteLabel(id, lang)` lookup helper — a one-expression wrapper the project's `ts-no-tiny-functions` rule rejects. The type `Palette` lives in `src/types/index.ts` next to `Language`, because the data module and the hook both consume it.

### The swatch problem, and how it is solved

A picker must show the colour of the option, not of the current palette: while Red is active, the Blue row has to look blue. `var(--accent)` cannot do that — it resolves to the active palette. Solution: palette-independent *preview* tokens declared once in `src/index.css` inside a declaration block (so the no-literal-hex gate in `spec-v3-theme-palette-gasatrya.md` §Acceptance still holds, because the literals sit in a declaration block and never in a rule):

```css
/* Picker previews: fixed identity colors so a row previews its own palette,
   not the one currently active. Never referenced outside .nav-palette-preview. */
:root {
  --preview-red-accent: #b04138;
  --preview-red-bg: #f6f5f2;
  --preview-blue-accent: #2563eb;
  --preview-blue-bg: #f4f6f9;
}
```

```css
.nav-palette-preview[data-preview='red']  { background: var(--preview-red-accent);  border-color: var(--preview-red-bg); }
.nav-palette-preview[data-preview='blue'] { background: var(--preview-blue-accent); border-color: var(--preview-blue-bg); }
```

No inline `style`, no hex in `src/App.css`, no dependence on which palette is active.

> **Superseded 2026-10-17 by `spec-v3-nav-swatch-and-hamburger.md` §4.1–§4.2.** The *palette*-independence above was right; the *theme*-independence was the defect. `#b04138` and `#2563eb` are the light-mode accents, so in dark mode a dot disagreed with the bar swatch's `var(--accent)` half by 2.07× (red) and 2.03× (blue) in luminance and sat at 2.53 / 3.13 against its own panel — under the 4.5 floor this project gates on. The tokens are now declared per theme: `:root` carries `#f87171` / `#60a5fa`, `:root[data-theme='light']` carries `#b04138` / `#2563eb`, and the `prefers-color-scheme` bridge repeats the light pair. `--preview-red-bg` and `--preview-blue-bg` are deleted — their light values drew a 13.30–16.21 near-white halo in dark mode — and every chip now carries the same 1px `--border-strong` hairline the swatch uses. The two `[data-palette='blue']` blocks declare no preview token at all: a preview names its own palette through `data-preview`, so it never needs the active palette's values.

### States

| State | Style |
|---|---|
| Trigger, closed | same chrome as `.theme-toggle`: transparent background, `--text-muted`, `padding: 8px`, `border-radius: var(--radius-md)` (`src/App.css:86-97`) |
| Trigger, open | `background: var(--bg-elevated)`, `color: var(--text-primary)`, chevron `rotate(180deg)` — mirrors `.download-resume-summary.open` (`src/App.css:728-730`) |
| Trigger, focus-visible | `outline: 2px solid var(--accent); outline-offset: 2px` (`src/App.css:104-107`) |
| Panel | `position: absolute; top: calc(100% + 4px); right: 0` inside `.nav-palette { position: relative }`; `--bg-elevated`, `1px solid var(--border)`, `border-radius: var(--radius-lg)`, `box-shadow: 0 4px 12px var(--shadow)`, `z-index: 100`. **`right: 0`, never `left: 0`**: the trigger sits at the right edge of `.nav-container` (`padding: 0 24px`, `src/App.css:12-20`), so a left-anchored ~220px panel would run off the viewport on a narrow desktop window. Stacking is safe: `.nav` is `position: sticky; z-index: 1000` (`src/App.css:2-10`) and creates the stacking context, so the panel paints above page content and above the `z-index: 999` mobile sheet |
| Option | `color: var(--text-primary)`, 14px name + 12px `--text-muted` hint (`spec-v3-typography.md` reserves the 12–14px band for chrome like tags and pills), min-height 44px |
| Option, active | `border-left: 2px solid var(--accent)` + a `✓` glyph; label `--text-primary` |
| Option, hover | `background: var(--accent)`, `color: var(--text-on-accent)` — the established hover idiom (`src/App.css:754-757`); hint switches to `var(--text-on-accent)` with opacity 0.75 |
| Option, focus-visible | `outline: 2px solid var(--accent); outline-offset: -2px` |
| Sheet variant | a block after `</ul>` inside `.mobile-menu` (`src/App.css:125-141` — already `overflow-y: auto`, so the extra row cannot break the layout on a short screen), `padding: 12px 0`, min-height 44px, label at `var(--text-body)`, group name at `var(--text-meta)`, preview chip 18px, panel `position: static; width: 100%` so the options expand inline. `.mobile-menu` is `display: none` unless `.open` (`src/App.css:126`, `:138-141`), so the row is untabbable while the sheet is closed |
| Reduced motion | `main.tsx` sets `reducedMotion: 'user'` and `src/index.css:275-284` flattens `transition-duration` for `*`, `*::before`, `*::after`. The only motion in this component is the chevron's `transform` transition and the trigger/option color transitions — all covered by that rule, nothing to opt out of |

### Behaviour

- Open: click the trigger. Close: selecting an option, `Escape`, or a click/tap outside — `useClickOutside(ref, close)` from `src/hooks/useClickOutside.ts`, with a `useCallback`-stable handler because the hook's dependency array is `[ref, handler]`.
- **No close-on-navigate effect.** The nav variant is already closed by the click that navigated: a nav link is outside `ref`, so the click-outside listener fires. The sheet variant is mounted as `<ThemePaletteMenu key={location.pathname} variant="sheet" />`, so navigation remounts it and its local state resets. Copying `Navigation.tsx:25-27` (`useEffect(() => setOpen(false), [pathname])`) would add a 10th `react(set-state-in-effect)` warning and break the lint budget in §11.
- Keyboard: the panel is `display: none` when closed, so its options are out of the tab order; when open, `Tab` reaches both option buttons and `Enter` / `Space` activates one (`<button>` semantics, no extra code). `Escape` closes and returns focus to the trigger via `onKeyDown` on the wrapper. No arrow keys, no roving `tabIndex`.
- Semantics: **disclosure, not an ARIA menu.** `aria-expanded` + `aria-controls` on the trigger, the panel is a plain container, the selected option carries `aria-current="true"`. Deliberate: `role="menu"` + `role="menuitemradio"` is only correct together with arrow-key navigation and focus management (WAI-ARIA authoring practice); announcing a menu whose arrow keys do nothing is worse than not claiming a menu at all. Two options make the disclosure form the cheaper correct one.
- The preview chip is `aria-hidden`: color is the redundant channel, the name is the primary one.
- Changing the palette never navigates and never scrolls. Changing dark/light keeps the palette; changing the palette keeps dark/light.

### Repo idioms this component reuses

| Idiom | Source | How it is reused |
|---|---|---|
| Trigger chrome: transparent, `--text-muted`, `padding: 8px`, `--radius-md`, hover `--bg-elevated` + `--text-primary`, `focus-visible` accent outline | `.theme-toggle` `src/App.css:86-107` | `.nav-palette-trigger` |
| Chevron: 16×16 `polyline 6 9 12 15 18 9`, rotates 180° when the trigger is open | `.download-resume-summary .chevron` `src/App.css:714-717`, `:728-730` | same class name `chevron`, own scoped rule — do **not** invent `.nav-palette-chevron` |
| Panel hidden by CSS class, kept in the DOM | `.download-resume-dropdown .download-resume-options` `src/App.css:720-726` | `.nav-palette-panel` / `.nav-palette-panel.open` |
| Panel chrome: `--bg-elevated`, `1px solid --border`, radius 8, `0 4px 12px --shadow`, `z-index: 100` | `.download-resume-options` `src/App.css:732-743` | `.nav-palette-panel` |
| Option hover: accent fill + `--text-on-accent` | `.download-resume-option:hover` `src/App.css:754-757` | `.nav-palette-option:hover` |
| Option list built from a data module with `Record<Language, string>` labels | `src/data/resume.ts:5-9` | `src/data/palettes.ts` |
| Shared click-outside hook | `src/hooks/useClickOutside.ts` | used deliberately: `DownloadResume.tsx:18-31` re-implements it inline, which is the duplication the hook exists to avoid |
| Trigger `aria-label` naming the current value | `Navigation.tsx:60` — `Switch theme (currently ${resolvedTheme})` | same shape, but routed through `strings` so it is translated |

The existing dropdown has no `aria-expanded`, no `aria-controls` and no keyboard support. The new menu is more accessible than it; that is an improvement in behaviour, not a second styling convention.

---

## 7. Implementation details

### Step 1 — type and data

`src/types/index.ts:3`, directly under `export type Language = 'en' | 'vi';`:

```ts
export type Palette = 'red' | 'blue';
```

New `src/data/palettes.ts`:

```ts
import type { Language, Palette } from '@/types'

export const paletteIds: Palette[] = ['red', 'blue']

export const paletteMeta: Record<Palette, { label: Record<Language, string>; hint: Record<Language, string> }> = {
  red:  { label: { en: 'Red',  vi: 'Đỏ' },         hint: { en: 'warm neutral', vi: 'trung tính ấm' } },
  blue: { label: { en: 'Blue', vi: 'Xanh dương' }, hint: { en: 'cool neutral', vi: 'trung tính lạnh' } },
}
```

`Record<Language, string>` follows `src/data/resume.ts:6-9`. `Theme` stays local to `useTheme.tsx` (unchanged) while `Palette` is exported from `src/types/index.ts`: the asymmetry is deliberate — `Palette` is consumed by a data module, `Theme` is not.

### Step 2 — `src/hooks/useTheme.tsx`

Add alongside the existing theme state (do not rename `Theme`, do not touch `resolvedTheme`):

```ts
import type { Palette } from '@/types'

const PALETTE_STORAGE_KEY = 'portfolio-palette'

function getInitialPalette(): Palette {
  try {
    const stored = localStorage.getItem(PALETTE_STORAGE_KEY)
    if (stored === 'red' || stored === 'blue') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return 'red'
}
```

- `const [palette, setPaletteState] = useState<Palette>(getInitialPalette)` (`useTheme.tsx:51`)
- `document.documentElement.setAttribute('data-palette', palette)` **during render**, on the line after the existing `data-theme` write (`useTheme.tsx:56-57`) — same reason: it must be on the element before paint
- Persist in the existing `useEffect`: second `setItem` + `[theme, palette]` dependency array (`useTheme.tsx:59-66`)
- `const setPalette = useCallback((next: Palette) => { setPaletteState(next) }, [])` (`useTheme.tsx:77-79`)
- `ThemeContextValue` extended with `palette: Palette` and `setPalette: (palette: Palette) => void` (`useTheme.tsx:11-12`); provider value at `:82`. No `cyclePalette`: the UI is a menu that names its options, and a cycle hides which value is which
- Consumers after the change (`grep -rn useTheme src`): `Navigation.tsx:10` (`cycleTheme`, `resolvedTheme`) and `ThemePaletteMenu.tsx:13` (`palette`, `setPalette`); `App.tsx:3` only mounts the provider

### Step 3 — `index.html` init script

Extend the existing IIFE (`index.html:8-20`) so both attributes land before paint:

```js
var storedPalette = localStorage.getItem('portfolio-palette')
document.documentElement.setAttribute(
  'data-palette',
  storedPalette === 'blue' ? 'blue' : 'red'
)
```

Inside the same `try` / `catch`; the `catch` branch sets `data-theme = 'dark'` and `data-palette = 'red'`.

### Step 4 — `src/i18n/strings.ts`

Into `strings.nav` (after `contact`, `strings.ts:8`):

```ts
palette: {en: 'Theme color', vi: 'Màu giao diện'},
paletteAria: {en: 'Switch theme color', vi: 'Đổi màu giao diện'},
```

Shipped at `src/i18n/strings.ts:9-10`, matching the file's existing `{en: …, vi: …}` formatting.

The option names and hints come from `src/data/palettes.ts` (content stays data-driven, per `AGENTS.md`).

### Step 5 — `src/components/layout/ThemePaletteMenu.tsx`

Shipped as specified in §6: `variant: 'nav' | 'sheet'`, local `open` state, `containerRef` + `triggerRef`, `useClickOutside(containerRef, close)` with a `useCallback`-stable `close`, `onKeyDown` on the wrapper for `Escape` (close + refocus the trigger), panel visibility by class (`nav-palette-panel` / `.open`) rather than the `hidden` attribute, so `aria-controls` always resolves and the options are untabbable while closed. No arrow-key handler, no `role="menu"`.

### Step 6 — `src/components/layout/Navigation.tsx`

- Nav variant after the mode toggle: `Navigation.tsx:111`, inside `.nav-actions`, the last of the three appearance controls ahead of the hamburger — the order was re-pinned by Q16 of `spec-v3-mobile-navigation.md` (language → mode → theme color → hamburger).
- Sheet variant after `</ul>` inside `.mobile-menu`: `Navigation.tsx:125`, mounted as `<ThemePaletteMenu key={location.pathname} variant="sheet" />` so navigation remounts it closed.
- No new state in `Navigation`; the menu owns its own open state.

### Step 7 — `src/index.css`

1. Added the two blue blocks **after** `:root[data-theme='light']` (`src/index.css:60-85`) and **before** the media bridge (`src/index.css:152-180`): `src/index.css:87-114` dark, `:116-141` light. Order is not what makes them win — the two-attribute selectors are 0,3,0 against 0,1,0 and 0,2,0 — but keeping them adjacent to their lightness parents is what makes the file readable.
2. Added the preview declaration block from §6: `src/index.css:143-150`.
3. Left the three existing blocks and the bridge untouched: no blue variant is needed in the bridge, because the init script always writes `data-palette`, so anything reaching the bridge has no stored palette and resolves to red.

### Step 8 — `src/App.css`

Shipped: `.nav-palette-nav { display: none }` was added to the **existing** `@media (max-width: 1024px)` nav block (`src/App.css:176-188`) rather than inventing a second media block, and the menu block is `src/App.css:190-367`: `.nav-palette`, `.nav-palette-trigger` (+ `:hover`/`.open`, `:focus-visible`), `.nav-palette-swatch`, `.nav-palette-group`, `.nav-palette-trigger .chevron` (+ rotate), `.nav-palette-panel` (+ `.open`), `.nav-palette-option` (+ `.active`, `::after` glyph, `:hover`, `:focus-visible`), `.nav-palette-preview[data-preview=…]`, `.nav-palette-name`, `.nav-palette-hint`, then the `.nav-palette-sheet` overrides. Rules use tokens only — no hex, no `rgba()`, type sizes only inside the 12–14px chrome band, sheet text at `var(--text-body)` / `var(--text-meta)`, and no `fontSize`/`lineHeight` in TSX.

### Step 9 — cutover

- No deprecated paths: `Palette` is new, `Theme` is unchanged, no aliases, no shim.
- Existing visitors keep red: an absent `portfolio-palette` resolves to `'red'`, so behaviour for every current user is byte-identical to today.
- `spec-v3-theme-switch.md` §Step 5 must be corrected: the footer has no theme control (verified against `src/components/layout/Footer.tsx`).

---

## 8. Edge cases

| Case | Behaviour |
|---|---|
| `localStorage` throws (private mode, blocked) | try/catch already in place: theme falls back to system/`dark`, palette falls back to `'red'`; the attribute is still set during render, only persistence is skipped |
| JS disabled / script blocked | `data-theme` absent → the `prefers-color-scheme` bridge paints light-red or dark-red; no blue. Documented degradation, no broken layout |
| Reload with `blue` stored | init script sets `data-palette='blue'` before paint → no red flash |
| Palette menu open, then hamburger opened | impossible by construction at ≤1024px: the options are inside the sheet, so there is only one open surface at a time |
| Palette menu open, then route change | nav variant: the click that navigated is outside `ref`, so `useClickOutside` already closed it. Sheet variant: `key={location.pathname}` remounts it. No effect, no new lint finding |
| `data-theme` absent **and** `data-palette='blue'` | unreachable: both attributes are written by the same init script (`index.html:8-20`) and by the provider during render (`useTheme.tsx:39`), always together. If the script is blocked, `data-palette` is absent too → red, and the `prefers-color-scheme` bridge decides lightness |
| Context value identity changes | `setPalette` produces a new provider value object → `Navigation` re-renders. It is the only `useTheme()` consumer, so the cost is one subtree |
| Very narrow viewport (320px) | the nav variant is hidden at ≤1024px, so the bar keeps three controls; the sheet row carries the full label |
| Print | the palette follows the screen attributes; the resume PDF is generated from `public/resume-template.html` with its own print inks and is unaffected |
| `color-scheme` | stays `dark` / `light` per lightness block; blue blocks re-declare the same value as their lightness parent so form controls do not flip |

---

## 9. Affected files

| File | Action |
|---|---|
| `src/types/index.ts` | +1 line: `export type Palette = 'red' \| 'blue';` |
| `src/data/palettes.ts` | **new** — palette id + `Record<Language, string>` label and hint, same shape as `src/data/resume.ts` |
| `src/hooks/useTheme.tsx` | +`palette` state, `getInitialPalette`, `data-palette` set during render, `setPalette`, context value extended (~18 lines) |
| `index.html` | init script extended to set `data-palette` before paint (+4 lines) |
| `src/i18n/strings.ts` | +2 keys in `strings.nav` |
| `src/components/layout/ThemePaletteMenu.tsx` | **new** component |
| `src/components/layout/Navigation.tsx` | +2 insertions (nav variant, sheet variant) |
| `src/index.css` | +2 blue palette blocks, +1 preview declaration block |
| `src/App.css` | +1 nav-palette block, +1 mobile override |
| `docs/design/specs/v3/spec-v3-theme-palette-switch.md` | this document |
| `docs/design/specs/v3/spec-v3-theme-switch.md` | correct the stale Footer claim in §Step 5 |
| `AGENTS.md` | Theming section: add the palette axis, `data-palette`, `portfolio-palette` |
| `src/components/index.ts` | **no change** — the barrel is partial (it omits `RollingTextLink`, `DownloadResume`, `BackToTop`) and `Navigation.tsx` imports its children by path |

Not touched: `src/components/layout/Footer.tsx`, `scripts/generate-resume.ts`, `public/resume-template.html`, `nginx.conf`, `docker-compose.yaml`, any data module other than the new `palettes.ts`.

---

## 10. Decision record (settled by the owner, 2026-10-16)

| # | Question | Decision | Consequence |
|---|---|---|---|
| 1 | Leave red's `--accent-soft` / `--accent-glow` on `#ef4444`, or re-derive them from the accent in force? | **Re-derive** | Applied in `src/index.css` (6 lines across the dark block, the light block and the bridge); re-measured, no AA regression — §5 "Red, re-derived" |
| 2 | One menu carrying both axes, or two separate controls? | **Two separate menus** | The sun/moon dark↔light button stays exactly as is (`Navigation.tsx:57-73`); the new Red↔Blue menu is a second, independent control. `.nav-actions` therefore keeps three controls on mobile because the palette options live inside the mobile sheet (§6) |
| 3 | Vietnamese label | **`Xanh dương`** | `src/data/palettes.ts` as written in §7 Step 1 |
| 4 | Default palette | **`red`** | An absent `portfolio-palette` resolves to `'red'`: existing visitors see no change |

---

## 11. Acceptance criteria

- [ ] `data-palette` is present on `<html>` before first paint on every load (verified by reading the served HTML with JS disabled and with `portfolio-palette=blue` pre-set).
- [ ] `:root[data-theme='dark'][data-palette='blue']` and `:root[data-theme='light'][data-palette='blue']` beat both base blocks (verified by computed style in the browser, not by reasoning).
- [ ] All four combinations render without a flash, without a layout shift, and with the same geometry as today (measure: nav height 64px, container widths, timeline gutter 36/28 unchanged).
- [x] Contrast script over the four blocks reports **zero** text pairs below 4.5 and the layering invariant holds. **DONE 2026-10-17** — 21 required pairs × 4 palettes, minima 4.96 / 4.63 / 4.81 / 4.64, layering holds in all four (§5).
- [ ] Menu opens/closes by click, `Escape`, outside click, and on navigation; options reachable by `Tab` when the panel is open and out of the tab order when it is closed; `aria-expanded` + `aria-controls` on the trigger, `aria-current="true"` on the selected option.
- [ ] Desktop (>1024px): menu sits in `.nav-actions`, panel right-aligned to the trigger and fully inside the viewport. ≤1024px: palette options appear inside the mobile menu sheet, each ≥44px tall; `.nav-actions` still holds exactly theme + language + hamburger.
- [ ] Palette choice survives a reload and a route change; theme choice survives a palette change and vice versa.
- [x] `pnpm exec tsc -b` exit 0. **DONE** — exit 0, no diagnostics.
- [x] `pnpm exec vite build --outDir dist-verify` green, then `rm -rf dist-verify`. **DONE** — `✓ built in 148ms`, CSS 31.80 kB (gzip 6.54), JS 450.14 kB (gzip 140.55); `dist-verify` removed.
- [x] `pnpm exec oxlint -c .oxlintrc.json src` stays at **11 errors / 9 warnings**. **DONE** — `grep -cE " (error|warning) "` prints 20 finding lines, identical to the pre-feature baseline; the 11 errors are still the `react-hooks(rules-of-hooks)` findings on `useField` / `useFieldArray`.
- [x] Grep gate `#[0-9a-fA-F]{3,8}\b|rgba?\(` over `src/App.css` returns zero matches. **DONE** — 0 matches; the new block is token-only, and the new literals in `src/index.css` are confined to `:87-150`.
- [x] Grep gate `style=\{\{[^}]*(fontSize|lineHeight|fontWeight|color|maxWidth)` over `src/` still returns zero. **DONE** — 0 matches.
- [x] `pnpm build:resume-all` unchanged. **DONE, with a caveat** — both PDFs regenerate at the same sizes as before the feature (1,987,582 EN / 1,990,541 VI bytes) and `scripts/generate-resume.ts` + `public/resume-template.html` are untouched in `git status`; `pdftotext` is not installed here, so no text-level diff was run.
- [ ] Browser pass by the owner: `/`, `/experience`, `/projects/:id`, `/philosophy` × {dark, light} × {red, blue}, plus ≤1024px with the mobile sheet open and the palette block visible.
- [x] Red's re-derived `--accent-soft` wash keeps `--accent` text ≥ 4.5 over every background it is used on, and the wash stays visible against its background (≥ 1.10). **DONE** — §5, worst pair 4.51.
- [x] After the re-derivation: `tsc -b` exit 0, `vite build` green, `src/App.css` literal-hex gate 0 matches, oxlint unchanged, both resume PDFs regenerate with the five entries and no `undefined`. **DONE** — emitted CSS carries `#f871711f`, `#f871714d`, `#b041381a`, `#b0413838`.
- [x] No duplicate element ids. **DONE** — an SSR render of both variants side by side (`vite.ssrLoadModule` + `react-dom/server`, throwaway script, since removed) produced exactly one `id="palette-menu-nav"` and one `id="palette-menu-sheet"`, each matched by its own `aria-controls`.
- [x] Closing the menu on navigation adds **no** `react(set-state-in-effect)` finding. **DONE** — the oxlint finding count is unchanged after `key={location.pathname}` was added.

---

## 12. Progress tracking

| Item | Status |
|---|---|
| §4 model, §5 token values, §6 UI design, §7 steps | DONE (this document) |
| Contrast verification for blue dark + blue light | DONE — measured, §5 |
| Red `--accent-soft` / `--accent-glow` re-derived + re-measured (decision 1) | DONE — applied at `src/index.css:13,15,71,73,100,102`; measured table in §5; worst pair 4.51 |
| Owner decisions §10 | DONE — settled 2026-10-16 |
| §6–§7 review pass against the shipped code (2026-10-17) | DONE — 9 corrections, recorded in §13 |
| Doc corrections listed in §13 | DONE — all four applied 2026-10-17, evidence in the §13 table |
| Step 1 type + `src/data/palettes.ts` | DONE — `src/types/index.ts:3`, `src/data/palettes.ts` (`paletteIds` + `paletteMeta`, 8 lines) |
| Step 2 hook | DONE — `src/hooks/useTheme.tsx:2,11-12,18,33-43,51,57,59-66,77-79,82` |
| Step 3 init script | DONE — `index.html:15-17,20` |
| Step 4 strings | DONE — `src/i18n/strings.ts:9-10` |
| Step 5 component | DONE — `src/components/layout/ThemePaletteMenu.tsx` (79 lines) |
| Step 6 navigation | DONE — `src/components/layout/Navigation.tsx:7,76,125` |
| Step 7 `src/index.css` blocks | DONE — `src/index.css:87-141` (blue dark + light), `:143-150` (preview tokens) |
| Step 8 `src/App.css` menu styles | DONE — `src/App.css:176-188` (media rule added), `:190-367` (menu block) |
| Step 9 doc corrections (`spec-v3-theme-switch.md`, `AGENTS.md`) | DONE |
| Owner browser pass, 4 combinations × mobile | TODO — repo rule §5: the owner verifies in a real browser |

---

## 13. Review pass against the shipped code (2026-10-17)

Every claim below was checked against the files, not carried over from the v0.1.0 draft.

| # | What was wrong or missing in v0.1.0 | Correction | Evidence |
|---|---|---|---|
| 1 | Hard-coded `id="palette-menu-nav"` | id derived from `variant` | both instances mount simultaneously, one hidden by CSS → duplicate ids, broken `aria-controls` |
| 2 | `role="menu"` + `menuitemradio` + arrow keys with no focus management | disclosure semantics + `aria-current="true"` | menu semantics without arrow keys / roving tabindex is a known anti-pattern |
| 3 | Close-on-navigate written as an effect | `key={location.pathname}` on the sheet instance + click-outside for the nav instance | `Navigation.tsx:25-27` is exactly the pattern oxlint reports as `set-state-in-effect` (1 warning already at `:26`); an effect here would make it 10 |
| 4 | `hidden={!open}` on the panel | `open` class + `display: none` | repo idiom `src/App.css:720-726` |
| 5 | Invented `.nav-palette-chevron` | reuse the `chevron` class | `src/App.css:714-717`, `:728-730` |
| 6 | Panel anchored `left: 0` (copied from the download dropdown) | `right: 0` inside `.nav-palette { position: relative }` | the trigger is at the right edge of `.nav-container` (`src/App.css:12-20`) |
| 7 | 768px palette breakpoint | 1024px | `.nav-menu` / `.mobile-menu-btn` collapse at 1024 (`src/App.css:176-184`) |
| 8 | `palettes.ts` with `{ en, vi }` literals | `Record<Language, string>` | `src/data/resume.ts:6-9` |
| 9 | "three consumers depend on `resolvedTheme`" | one consumer | `useTheme(` has exactly one call site: `Navigation.tsx:9` |
| 10 | `palettes` array + a `paletteLabel(id, lang)` lookup helper | `paletteIds` + `paletteMeta` keyed by `Palette`, indexed inline | the project rule `ts-no-tiny-functions` rejects a one-expression wrapper; the keyed map also drops the `find` and the `entry ? … : id` fallback, which could only ever hide a type error |
| 11 | A `@media (max-width: 1024px)` block invented for the palette | `.nav-palette-nav { display: none }` added to the **existing** nav media block (`src/App.css:176-188`) | one breakpoint, one block — the palette collapses with the links |
| 12 | Trigger markup with no group label | `.nav-palette-group` added: hidden in the bar, shown in the sheet | the sheet row must name the setting on its own; the bar trigger is already named by its `aria-label` |
| 13 | UI label "Theme colour" | "Theme color" | house spelling is US (`spec.md` §26 "Color System", `spec-v3-theme-colors.md` "Theme Colors"); a UI label is not prose |
| 14 | `Escape` only closes the panel | `Escape` closes **and** returns focus to `triggerRef` | closing hides the element that had focus, which would otherwise drop focus to `<body>` |

Confirmed by the review, no work needed:

- No hex or `rgba()` literal outside palette declaration blocks anywhere in `src/`. The `data-theme`-keyed rules at `src/App.css:649-671` reference tokens only, so they apply unchanged in blue-light.
- `.mobile-menu` is `display: none` unless `.open` and already `overflow-y: auto` (`src/App.css:125-141`) → the sheet row cannot be tabbable while closed and cannot overflow a short screen.
- `index.html` has no `theme-color` meta to keep in sync.
- `ThemeProvider` wraps `Layout` (`src/App.tsx:19-21`) → `useTheme` and `useLanguage` are both available inside `Navigation`.
- `scripts/generate-resume.ts` and `public/resume-template.html` reference no theme token → the PDFs are unaffected by palette work.

### Doc corrections owed elsewhere

| File | Correction |
|---|---|
| `spec-v3-theme-colors.md:71` | **APPLIED 2026-10-17** — claimed `#6b7280` on `#0f1117` is "~4.8:1 (AA pass)"; measured **3.90:1**, an AA fail. The line is now marked as a fail with a pointer to §5 of this spec as the measured blue replacement |
| `spec-v3-theme-palette-gasatrya.md` | **APPLIED 2026-10-17** — the four token-table rows and the three code snippets that recorded `rgba(239, 68, 68, …)` now carry the re-derived values (`rgba(248,113,113,0.12)` / `0.30` dark, `rgba(176,65,56,0.10)` / `0.22` light), with a dated note explaining that the hue source is the accent in force |
| `spec-v3-theme-switch.md` §Step 5 | **APPLIED 2026-10-17** — the `Footer.tsx` consumer claim removed; the verified consumer list replaces it |
| `AGENTS.md` Theming section | **APPLIED 2026-10-17** — palette axis, `data-palette`, `portfolio-palette`, the selector form and the two menu placements recorded; `ThemePaletteMenu.tsx` and `palettes.ts` added to the structure block |

---

## 14. Implementation record (2026-10-17)

Steps 1–8 applied on `feature/new-theme-color`. Nothing committed — the owner decides.

| Check | Result |
|---|---|
| `pnpm exec tsc -b` | exit 0, no output |
| `pnpm exec vite build --outDir dist-verify` | `✓ built in 148ms`; CSS 31.80 kB (gzip 6.54), JS 450.14 kB (gzip 140.55); `dist-verify` removed afterwards |
| Emitted CSS, selector order | `:root[data-theme=light]{` … then `:root[data-theme=dark][data-palette=blue]{`, then `:root[data-theme=light][data-palette=blue]{` — the blue blocks land after both base blocks, and win by specificity regardless of order |
| Emitted CSS, menu rules | `.nav-palette-panel{…display:none…}` + `.nav-palette-panel.open{display:block}` + `.nav-palette-sheet .nav-palette-panel{…position:static}`; the minified media block reads `@media (width<=1024px){.nav-menu{display:none}.mobile-menu-btn{display:flex}.nav-palette-nav{display:none}}` |
| Preview tokens in the bundle | `--preview-red-accent:#b04138`, `--preview-red-bg:#f6f5f2`, `--preview-blue-accent:#2563eb`, `--preview-blue-bg:#f4f6f9` — one declaration each |
| Preview tokens — **superseded 2026-10-17** | Now four `--preview-*-accent` declarations and no `--preview-*-bg`: dark pair `#f87171` / `#60a5fa` in `:root`, light pair `#b04138` / `#2563eb` in `:root[data-theme='light']` and in the bridge. Re-verified in `spec-v3-nav-swatch-and-hamburger.md` §11 |
| SSR render, both variants at once | `id="palette-menu-nav"` ×1, `id="palette-menu-sheet"` ×1, `aria-controls` ×2 matching those ids, `aria-expanded="false"` ×2, `aria-current="true"` ×1 per instance, 4 preview chips, both panels without `.open`; trigger label `Theme color: Red` on the default palette with the default language `en` |
| Contrast | minima 4.96 / 4.63 / 4.81 / 4.64; zero required pairs < 4.5; layering invariant holds in all four |
| oxlint | 20 finding lines = 11 errors / 9 warnings, identical to the baseline before the feature |
| Grep gates | `src/App.css` hex/`rgba()` 0 matches; inline `fontSize`/`lineHeight`/`fontWeight`/`color`/`maxWidth` in TSX 0 matches |
| Resume PDFs | regenerated at the pre-feature byte sizes; generator and template untouched |

Deliberately **not** verified here (owner's browser pass, repo rule §5): computed style of the two-attribute selectors, the panel staying inside the viewport at narrow desktop widths, the ≤1024px sheet layout with 44px options, and the visual sweep over all four combinations.
