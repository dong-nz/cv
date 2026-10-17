# Specification — v3 Palette Preview Parity & Hamburger Side

> **Document:** `spec-v3-nav-swatch-and-hamburger.md`
> **Version:** 0.2.0 (drafted 2026-10-17; the owner answered Q1–Q5 the same day and the change was built)
> **Parents:** `specs/v3/spec-v3-theme-palette-switch.md` (preview tokens, §Step 8), `specs/v3/spec-v3-nav-cta-enhancements.md` (the swatch gradient, §4.2), `specs/v3/spec-v3-mobile-navigation.md` (bar anatomy, Q13–Q16), `specs/ui/spec-ui-layout.md` (bar table)
> **Priority:** P1 (item 1 is a colour defect, item 2 is an ergonomics request)
> **Estimate:** ~35 minutes including the gate re-run
> **Status:** BUILT 2026-10-17 — Steps 1–6 on disk, §11.1 records the gate run. Open: the owner's browser pass (§8, repo rule §5) and the commit decision.

---

## 1. Request

1. **The red/blue colours in the palette submenus do not match the red/blue in the navigation bar's theme icon (`.nav-palette-swatch`).** The owner suspects the gradient.
2. **Move the mobile menu button (`.mobile-menu-btn`) to the left of the bar** — the owner is left-handed and reaches the left side of a handheld bar more easily.

Both items live in the navigation bar, so they are specified as one change set.

---

## 2. Current state (verified against the code, 2026-10-17)

### 2.1 Facts

| Fact | Evidence |
|---|---|
| The bar swatch paints its left half with the **live** accent: `linear-gradient(to right, var(--accent) 0 50%, var(--swatch-empty) 50% 100%)`, 20×20, `border: 1px solid var(--border-strong)` | `src/App.css:340-347`; trigger markup `ThemePaletteMenu.tsx:44-49` |
| `--accent` changes with **both** axes: dark red `#f87171`, light red `#b04138`, dark blue `#60a5fa`, light blue `#2563eb` | `src/index.css:9`, `:75`, `:110`, `:143` |
| The submenu dots paint with **fixed constants**: `--preview-red-accent: #b04138`, `--preview-blue-accent: #2563eb`, declared once in a `:root` block that has no theme or palette axis | `src/index.css:171-177` |
| Those two constants are exactly the **light-mode** accent values | `#b04138` = `src/index.css:75`, `#2563eb` = `src/index.css:143` |
| The dots' 2px ring uses `--preview-red-bg: #f6f5f2` / `--preview-blue-bg: #f4f6f9` — the **light-mode** `--bg-primary` of each palette | `src/index.css:173`, `:175`, `:69`, `:137`; consumed at `src/App.css:419-427` |
| Both submenu renderings share the same dot element, so both carry the same defect: the desktop `#palette-menu` panel and the sheet's Theme color row | `ThemePaletteMenu.tsx:64`, `MobileMenu.tsx:129` |
| The documented intent of these tokens is *palette independence*, not theme independence: "a picker row previews its own palette rather than the active one" | `src/index.css:168-170`; restated in `spec-v3-theme-palette-switch.md:321-334` |
| The active swatch option's border is the live accent, its dot is the constant | `src/App.css:290-293` + `:419-427` |
| The hamburger is the **last** child of `.nav-actions` at every width, and appears at ≤1024px | `Navigation.tsx:113-146`, `src/App.css:300-308` |
| `.nav-container` is `display: flex; justify-content: space-between` with three children: logo, `.nav-menu`, `.nav-actions` | `src/App.css:15-23`, `Navigation.tsx:58-147` |
| `.mobile-menu-btn` is **not** a `.nav-control`: no border, `padding: 8px` around a 24px icon → 40px wide | `src/App.css:125-133`, `Navigation.tsx:123-143` |
| Closing restores focus into the trigger only when it is rendered: `if (triggerRef.current?.offsetParent)` | `Navigation.tsx:19-23` |
| The palette panel is anchored `right: 0` to its trigger, so its placement depends on the palette control staying near the bar's right end | `src/App.css:349-362` |
| No CSS rule depends on `.mobile-menu-btn` being a descendant of `.nav-actions` | `grep 'mobile-menu-btn' src/App.css` → `:125`, `:135`, `:305` only |

### 2.2 The measurement that decides item 1

sRGB relative luminance, WCAG 2.x contrast ratios and CIE76 ΔE, computed 2026-10-17 from the hexes above.

**Swatch accent half vs the submenu dot of the same palette:**

| Theme | Palette | Swatch | Dot | Ratio | ΔE76 |
|---|---|---|---|---|---|
| dark | red | `#f87171` | `#b04138` | **2.07** | **22.4** |
| dark | blue | `#60a5fa` | `#2563eb` | **2.03** | **42.5** |
| light | red | `#b04138` | `#b04138` | 1.00 | 0.0 |
| light | blue | `#2563eb` | `#2563eb` | 1.00 | 0.0 |

The mismatch is **dark-mode only**, and it is large: a factor >2 in luminance, and ΔE76 42.5 for blue — far past the ~2.3 just-noticeable threshold.

**Dot legibility against the surface it sits on** (`--bg-elevated` for the panel, `--bg-surface` for the sheet):

| Surface | Today | After parity |
|---|---|---|
| dark red panel `#272a28` | **2.53** | **5.24** |
| dark blue panel `#1c2030` | **3.13** | **6.36** |
| dark red sheet `#202423` | **2.73** | **5.67** |
| dark blue sheet `#161922` | **3.40** | **6.90** |
| light red panel `#ffffff` | 5.74 | 5.74 |
| light blue panel `#ffffff` | 5.17 | 5.17 |

In dark mode today the dots sit **below the 4.5 floor** this project uses for its contrast gates (`spec-v3-mobile-navigation.md` §9, `spec-v3-nav-cta-enhancements.md` §8). Parity lifts every dark case above it.

**Ring colour against the same surfaces:**

| Surface | Today (`--preview-*-bg`) | `--border-strong` | palette `--bg-primary` |
|---|---|---|---|
| dark red panel `#272a28` | **13.30** | 1.36 | 1.23 |
| dark blue panel `#1c2030` | **14.94** | 1.60 | 1.17 |
| dark red sheet `#202423` | **14.40** | 1.48 | 1.13 |
| dark blue sheet `#161922` | **16.21** | 1.74 | 1.07 |
| light red panel `#ffffff` | 1.09 | 1.45 | 1.09 |
| light blue panel `#ffffff` | 1.08 | 1.43 | 1.09 |

The ring is a near-white halo in dark mode (13–16) and an almost invisible hairline in light mode (1.08–1.09). `--border-strong` — the token the bar swatch already uses — gives 1.36–1.74 dark and 1.43–1.45 light: the same *kind* of ring in both themes.

**Active-state inconsistency, dark mode:** `.mobile-menu-swatch-option.active` draws a live-accent border around a constant dot — 2.07 (red) and 2.03 (blue) between the ring and the fill it surrounds.

### 2.3 Is the gradient the cause? Partly.

- **Not the cause of the hue difference.** The dots are flat `background` fills; the swatch's accent half is `var(--accent)`. The hue diverges because the dot reads a **constant pinned to the light-mode values** while the swatch reads a **live per-theme value**. In light mode the two constants happen to equal `--accent`, which is why the defect is invisible there.
- **The gradient *is* the reason the two read as different objects.** The swatch is a half-disc (accent | `--swatch-empty` white) with a 1px hairline; the dot is a full disc with a 2px ring that eats 2px from each side, leaving a 14px fill against the swatch's 20px. Even with identical hexes, an 18px 14px-core disc and a 20px half-disc read differently. Shape parity is a separate decision (Q3).

---

## 3. Root causes

| # | Cause | Where |
|---|---|---|
| C1 | The preview accent constants were written from the light-mode accent values and never given a dark-mode counterpart. | `src/index.css:171-177` |
| C2 | The preview ring constants were written from the light-mode `--bg-primary` values, same omission. | `src/index.css:173`, `:175` |
| C3 | Two colour sources for one identity: the swatch uses the theme-resolved `--accent` family, the dots use a parallel constant family. Nothing keeps them equal, so they drift. | `src/App.css:346` vs `src/App.css:420`, `:425` |
| C4 | The hamburger's position is a markup decision, frozen by Q16 ("the hamburger stays last in the bar"). The request supersedes that half of Q16. | `Navigation.tsx:113-146`, `spec-v3-mobile-navigation.md:795`, `:806`, `spec-ui-layout.md:106`, `AGENTS.md:61` |

---

## 4. Design — item 1: preview parity

### 4.1 Token strategy (Q1)

| Option | Shape | Cost | Verdict |
|---|---|---|---|
| **A — theme-aware preview tokens** | Declare `--preview-red-accent` / `--preview-blue-accent` inside the theme blocks, mirroring that block's `--accent`. 6 new declarations across 3 blocks. | Small; touches only `src/index.css`; keeps the documented palette-independent contract intact | **Recommended** |
| B — structural dedup: name each palette's accent once (`--accent-red`, `--accent-blue`) and let `--accent` alias it | Parity becomes impossible to break; zero duplicated hexes | Re-plumbs the accent declaration chain in 4 blocks, re-documents the token contract in `spec-v3-theme-colors.md`, `spec-v3-nav-cta-enhancements.md` §4.3 and `AGENTS.md:59`, and leaves the `-hover`/`-active`/`-solid`/`-glow` family palette-scoped — a half-renamed system | Rejected: larger blast radius than the defect warrants |
| C — Option A plus an equality gate | A throwaway check asserting each `--preview-*-accent` equals the matching block's `--accent` | ~10 lines, deleted after the run | **Adopted alongside A** — it is what stops the duplication from drifting again |

The palette axis needs **no** override, and that is the invariant that makes Option A small: a preview is chosen by `data-preview='red'|'blue'`, so its token is keyed by palette name, never by the active palette. `:root[data-theme='dark'][data-palette='blue']` and `:root[data-theme='light'][data-palette='blue']` therefore declare nothing — the dark pair from `:root` and the light pair from `:root[data-theme='light']` are already the right values for both palettes.

### 4.2 Ring treatment (Q2)

| Option | Result | Verdict |
|---|---|---|
| **A — shared hairline**: `border: 1px solid var(--border-strong)`, delete `--preview-red-bg` and `--preview-blue-bg` | One ring style everywhere (the swatch already uses this token at `src/App.css:345`); 1.36–1.74 dark, 1.43–1.45 light; two tokens removed; the fill gains 2px of diameter (14 → 16 core) | **Recommended** |
| B — theme-aware ring values (each palette's own `--bg-primary` per theme) | Keeps the "the ring is that palette's world" idea; 1.07–1.23 dark, 1.08–1.09 light — nearly invisible in both; 4 more declarations to maintain | Rejected: four tokens for a ring the eye cannot separate |
| C — keep today's constants | 13.30–16.21 halo in dark, 1.08 in light — the inconsistency the owner is seeing is partly this | Rejected |

### 4.3 Shape parity (Q3)

| Option | Result | Verdict |
|---|---|---|
| **A — keep the full disc** | The dot stays a clean colour chip; only the colours change. The row stays legible at 18px | **Recommended** |
| B — make the previews half-circles like the bar icon (`linear-gradient(... var(--preview-*-accent) 0 50%, var(--swatch-empty) 50% 100%)`) | Literal identity with `.nav-palette-swatch`, and `--preview-*-bg` becomes unnecessary | Rejected for now: half of every option renders white, which weakens the colour signal at 18px and makes the two options look half-coloured |

---

## 5. Design — item 2: hamburger on the left

### 5.1 Placement (Q4)

| Option | Bar at ≤1024px | Verdict |
|---|---|---|
| **A — brand group on the left**: wrap the hamburger and the logo in `.nav-brand` as the first child of `.nav-container`; `.nav-actions` keeps language → mode → theme color | `☰ {CV}` … `VI ☀ ◕` | **Recommended** |
| B — hamburger as a bare first child, logo left to `space-between` | `☰` … `{CV}` … controls — the brand drifts to the centre of the bar | Rejected: the logo loses its fixed anchor and the row's centre becomes variable |
| C — keep the hamburger in `.nav-actions` and move the whole cluster to the left | controls on the left, brand on the right | Rejected: the brand leaves the left edge, and the palette panel's `right: 0` anchor (`src/App.css:353`) would then hang off the bar's left side |
| D — CSS only: `.nav-actions { display: contents }` + `.mobile-menu-btn { order: -1 }` | visual order `☰ VI ☀ ◕`, DOM order `VI ☀ ◕ ☰` | Rejected: Tab order no longer matches visual order (WCAG 2.4.3), and `display: contents` discards the box whose `gap` the layout depends on — `.nav-actions { gap }` at `src/App.css:86` and `:317-319` would both stop applying |

Option A keeps **DOM order = visual order = Tab order**, which is why it is chosen over every CSS-only variant.

### 5.2 Consequences that must hold

| Concern | Outcome |
|---|---|
| Desktop (>1024px) | Unchanged. `.mobile-menu-btn` is `display: none` (`src/App.css:126`), so `.nav-brand` renders as the logo alone, and `.nav-container`'s three children are still brand / `.nav-menu` / `.nav-actions` under the same `space-between`. |
| Palette submenu position | Unchanged. The palette trigger remains the last control in `.nav-actions`, so `#palette-menu`'s `right: 0` anchor still opens it inside the viewport. |
| Close-focus guard | Still correct. `offsetParent` is null when the element itself is `display: none`, regardless of the new wrapper, so `Navigation.tsx:22` keeps skipping the restore above 1024px. |
| Sheet, `inert` targets, Escape, scroll lock | Untouched. |
| Row fit at 320px | **Tighter — this is the one real cost.** Measured 2026-10-17: today the intrinsic widths are logo ~70 + 44×3 + hamburger 40 + 3×12 gaps = **242px**, and `space-between` distributes the remaining **46px** between brand and controls. After the move the brand group's 12px gap becomes fixed: 40 + 12 + 70 + 44×3 + 2×12 = **278px**, leaving **10px** of slack inside 288px. Mitigation: `.nav-brand { gap: 8px }` at ≤420px → 274px, 14px slack. |
| Stale arithmetic in the code comment | `src/App.css:310-311` claims `~70 + 44×4 + 12×3 = 262px` with "26px of slack". The same row measures 242px intrinsic / 46px distributed today; 262 matches neither. The comment is corrected as part of this change. |

---

## 6. Implementation Details

### Step 1 — preview accents become theme-aware (`src/index.css`)

Delete the fixed-identity block at `:168-177` and move its surviving tokens into the theme blocks.

`src/index.css:2-27` (`:root`, dark red) — after `--accent-glow` (`:23`):

```css
  /* Picker previews: each row previews its own palette, never the active one — the token is
     keyed by palette name, not by --accent. Values mirror this block's --accent so a dot and
     the bar's swatch half are the same colour in the same theme. */
  --preview-red-accent: #f87171;
  --preview-blue-accent: #60a5fa;
  --swatch-empty: #ffffff;
```

`src/index.css:68-92` (`:root[data-theme='light']`) — after `--accent-glow` (`:87`):

```css
  --preview-red-accent: #b04138;
  --preview-blue-accent: #2563eb;
```

`src/index.css:180-212` (the `prefers-color-scheme: light` bridge) — after `--accent-glow` (`:199`):

```css
    --preview-red-accent: #b04138;
    --preview-blue-accent: #2563eb;
```

`src/index.css:103-127` and `:136-166` (the two `[data-palette='blue']` blocks) — **no change**, per §4.1.

Cascade check: `:root` = 0,1,0; `:root[data-theme='light']` = 0,2,0; `:root:not([data-theme='dark'])` = 0,2,0 and sits later, so a pre-hydration light page gets the light pair, and a light page with `data-theme='light'` set gets the same values from either selector. `--swatch-empty` stays a single constant declaration in `:root`, as documented at `src/index.css:168-170` and `AGENTS.md:60`.

### Step 2 — one ring everywhere (`src/App.css:411-427`)

```css
.nav-palette-preview {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
}

.nav-palette-preview[data-preview='red'] {
  background: var(--preview-red-accent);
}

.nav-palette-preview[data-preview='blue'] {
  background: var(--preview-blue-accent);
}
```

`border: 2px solid` + two `border-color` overrides → one 1px hairline using the token the swatch already uses (`src/App.css:345`). `--preview-red-bg` and `--preview-blue-bg` lose their last consumer and are **not** carried into Step 1.

### Step 3 — swatch comment (`src/App.css:338-339`)

Restate the pairing so the next reader knows the two are meant to agree: the swatch's left half is the live `--accent`; the submenu dots read `--preview-*-accent`, which mirror the same per-theme accent values. No selector change.

### Step 4 — brand group (`src/components/layout/Navigation.tsx`)

Move the whole hamburger button block (`:113-146`) out of `.nav-actions` (`:83-147`) and place it before the logo, wrapping both:

```tsx
<div className="nav-container">
  <div className="nav-brand">
    <button
      ref={triggerRef}
      className="mobile-menu-btn"
      onClick={() => setMobileOpen((prev) => !prev)}
      aria-label={mobileOpen ? strings.nav.closeMenu[lang] : strings.nav.openMenu[lang]}
      aria-expanded={mobileOpen}
      aria-controls="mobile-menu"
    >
      {/* AnimatePresence + the two motion.svg icons unchanged */}
    </button>
    <Link to="/" className="nav-logo">
      <span className="logo-bracket">&#123;</span>
      <span className="logo-text">CV</span>
      <span className="logo-bracket">&#125;</span>
    </Link>
  </div>

  <ul className="nav-menu">{/* unchanged */}</ul>

  <div className="nav-actions">
    {/* lang-toggle, theme-toggle, <ThemePaletteMenu /> — unchanged order */}
  </div>
</div>
```

`closeMenu` (`:19-23`), both effects (`:25-53`), the icon morph and every `aria-*` attribute are unchanged. File length stays 154 lines: one wrapper `<div>` opens, one closes.

### Step 5 — brand group CSS (`src/App.css`)

Add after `.nav-logo` (`:25-30`):

```css
/* The hamburger and the brand travel together on the left of the bar so the sheet's trigger
   sits where a left-handed thumb reaches it. Above 1024px the button is display:none, so this
   group is just the logo. */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
```

Extend the ≤420px guard (`:312-320`) and correct its arithmetic comment:

```css
/* Four controls share the bar at <=1024px. At 320px: hamburger 40 + 12 + {CV} (~70) + 44x3
   controls + 12x2 gaps = 278px inside 288px of content, so the row keeps 10px of slack; the
   brand gap tightens to 8px for 14px. */
@media (max-width: 420px) {
  .nav-container { padding: 0 16px; }
  .nav-brand { gap: 8px; }
  .nav-actions { gap: 12px; }
}
```

`@media (max-width: 1024px)` (`:300-308`) is unchanged: `.nav-menu { display: none }` + `.mobile-menu-btn { display: flex }`.

### Step 6 — removals (clean cutover, no shims)

| Remove | Where |
|---|---|
| The fixed-identity `:root` preview block | `src/index.css:168-177` |
| `--preview-red-bg`, `--preview-blue-bg` | `src/index.css:173`, `:175` — no declaration, no consumer |
| The two `border-color` overrides on `.nav-palette-preview[data-preview=…]` | `src/App.css:421`, `:426` |
| The hamburger's membership of `.nav-actions` | `Navigation.tsx:113-146` moves; `.nav-actions` keeps exactly three controls |
| The wrong arithmetic comment | `src/App.css:310-311` |

`AGENTS.md:61` ("All four controls — language, mode, theme color, hamburger — sit in `.nav-actions` at every width, in that order") and `AGENTS.md:60` (swatch/preview description) are corrected; `spec-ui-layout.md:103`, `:106`, `:114` and `spec-v3-mobile-navigation.md:795`, `:806`, `:844`, `:853` get a supersession note pointing here; `spec-v3-theme-palette-switch.md:321-334` and its bundle gate at `:634` are marked superseded by this spec.

---

## 7. Affected Files

| File | Action |
|---|---|
| `src/index.css` | edit — delete `:168-177`; add 3 preview tokens in `:root`, 2 in `:root[data-theme='light']`, 2 in the bridge (`:180-212`); the two `[data-palette='blue']` blocks untouched |
| `src/App.css` | edit — `.nav-palette-preview` `:411-427`; swatch comment `:338-339`; new `.nav-brand` after `:30`; `@media (max-width: 420px)` `:310-320` |
| `src/components/layout/Navigation.tsx` | edit — `:58-147`: hamburger `:113-146` moves into a new `.nav-brand` wrapper ahead of the logo |
| `AGENTS.md` | edit — `:60-61` |
| `docs/design/specs/ui/spec-ui-layout.md` | edit — `:103`, `:106`, `:114` |
| `docs/design/specs/v3/spec-v3-mobile-navigation.md` | edit — supersession notes at `:795`, `:806`, `:844`, `:853` |
| `docs/design/specs/v3/spec-v3-theme-palette-switch.md` | edit — `:321-334` and `:634` marked superseded |
| `src/components/layout/MobileMenu.tsx`, `ThemePaletteMenu.tsx`, `src/i18n/strings.ts`, `src/data/palettes.ts`, `src/hooks/*` | **not touched** |

No new dependency, no new component, no new CSS class other than `.nav-brand`.

---

## 8. Acceptance criteria

- [x] In **dark** mode the bar swatch's accent half and the same palette's submenu dot are the same colour — equality gate: dark red `#f87171` = dot `#f87171`, dark blue `#60a5fa` = dot `#60a5fa`, ratio 1.00.
- [x] In **light** mode the parity that already holds still holds; nothing moved (`#b04138` / `#2563eb`).
- [x] Each preview still previews **its own** palette — the two `[data-palette='blue']` blocks declare no preview token, a chip is selected by `data-preview`, and the gate resolves the pair per theme × palette.
- [x] Every preview dot sits at ≥ 4.5 contrast against the panel and the sheet surface in all four palettes — 5.24 / 6.36 / 5.67 / 6.90 dark, 5.74 / 5.17 / 5.50 / 5.03 light.
- [x] The preview ring is the same 1px `--border-strong` hairline in both themes; `--preview-*-bg` has no declaration and no consumer left.
- [x] No hex or `rgba(` in `src/App.css` (0 matches); the preview colours live only in `src/index.css`.
- [x] At ≤1024px the hamburger is the first control in the bar, immediately left of the `{CV}` brand; `.nav-actions` keeps language → mode → theme color at the right end — SSR smoke 8/8.
- [x] Tab order matches visual order: DOM index hamburger < logo < lang < mode < palette.
- [x] `aria-controls="mobile-menu"`, `aria-expanded`, the translated label, the three `.nav-control` chips and both `data-preview` chips render as before — SSR smoke.
- [x] The row fits 320px: 278px with the 12px brand gap, 274px with 8px, inside 288px; the corrected arithmetic is in the CSS comment.
- [ ] Above 1024px the bar is visually unchanged and `#palette-menu` still opens right-aligned under its trigger. Static reasoning holds — `.mobile-menu-btn` is `display: none`, the palette control is still `.nav-actions`' last child, the panel's `right: 0` is untouched — but the visual confirmation is the owner's browser pass.
- [ ] Escape, click-outside, the body scroll lock, the three `inert` targets and the close-focus guard behave as before. No code path in them changed; the interactive confirmation is the owner's browser pass.
- [ ] The owner's browser pass covers 320 / 375 / 768 / 900 / 1024 / 1100px × {dark, light} × {red, blue}.

---

## 9. Verification gates

| Gate | Command / check | Baseline (measured 2026-10-17) |
|---|---|---|
| Type-check + build | `pnpm build` | exit 0, 543 modules |
| Lint | `pnpm lint` | **15** finding lines = 11 errors / 4 warnings (all 11 are the pre-existing `react-hooks/rules-of-hooks` findings; this change must not add any) |
| Hex gate | `grep -n '#[0-9a-fA-F]{3,8}\|rgba(' src/App.css` | 0 matches |
| Dead-token gate | `grep -rn 'preview-red-bg\|preview-blue-bg' src/` | 0 matches after the cutover |
| Equality gate (new) | throwaway script: assert `--preview-red-accent` equals the `--accent` of the dark-red and light-red blocks, and `--preview-blue-accent` equals those of the dark-blue and light-blue blocks | passes; script deleted after the run |
| Contrast gate | luminance script over the six surfaces in §2.2 | all six ≥ 4.5 after the change |
| Bar order smoke | throwaway SSR render: DOM index hamburger < logo < `lang-toggle` < `theme-toggle` < `nav-palette-trigger`; one `aria-controls="mobile-menu"`, `aria-expanded="false"`, three `.nav-actions` children | passes; script deleted after the run |
| Emitted CSS | `vite build` to a scratch outDir, then delete it | `.nav-brand` present; `.nav-palette-preview` carries one `border` declaration |
| Resume generator | `pnpm build:resume-all` | unchanged — the generator references no preview or bar token |
| Browser | owner's pass (repo rule §5) | owner reports |

---

## 10. Owner decisions (answered 2026-10-17)

| # | Question | Owner's answer | What was built |
|---|---|---|---|
| Q1 | Colour parity: theme-aware preview tokens, or restructure the accent chain (`--accent-red` / `--accent-blue` with `--accent` aliasing)? | **A** — theme-aware preview tokens | `src/index.css` dark / light / bridge declarations; the §11.1 equality gate is the drift guard. Option B not taken |
| Q2 | Preview ring: the shared `--border-strong` hairline, or theme-aware per-palette background rings? | **A** — shared hairline | `src/App.css:428-445`; `--preview-red-bg` and `--preview-blue-bg` deleted |
| Q3 | Shape: keep the full colour disc, or make the previews half-circles like the bar icon? | **A** — keep the disc | Chip geometry unchanged apart from the 2px → 1px ring |
| Q4 | Hamburger placement: brand group `☰ {CV}` on the left, or the hamburger alone with the brand drifting to the centre? | **A** — `.nav-brand` | `Navigation.tsx:59-102`, `src/App.css:32-39` |
| Q5 | Move at every width where the hamburger appears (≤1024px), or only ≤768px? | **Every width it appears** | Placement is markup, so one `@media (max-width: 1024px)` rule still governs visibility; no breakpoint-split placement |

---

## 11. Progress Tracking

| Item | Status |
|---|---|
| Investigation, colour measurement, arithmetic re-measure | DONE 2026-10-17 |
| Spec drafted | DONE 2026-10-17 |
| Q1–Q5 answered | DONE 2026-10-17 — all five took the recommendation |
| Step 1 preview tokens | DONE — `src/index.css:24-30` (dark pair + `--swatch-empty` + the pairing comment), `:95-96` (light pair), `:198-199` (bridge); the fixed-identity block is gone; the two `[data-palette='blue']` blocks declare nothing |
| Step 2 preview ring | DONE — `src/App.css:428-445`; `--preview-*-bg` gone |
| Step 3 swatch comment | DONE — `src/App.css:352-356` |
| Step 4 `Navigation.tsx` brand group | DONE — `:59-102`; `.nav-actions` (`:122-151`) holds exactly the three appearance controls; file 154 → 158 lines |
| Step 5 `.nav-brand` CSS + ≤420px guard | DONE — `src/App.css:32-39` and `:319-334` (guard gains `.nav-brand { gap: 8px }` and the corrected arithmetic) |
| Step 6 removals + doc supersessions | DONE — `AGENTS.md:60-62`; `spec-ui-layout.md:106,114`; `spec-v3-mobile-navigation.md` Q17 row, a new §11 bullet and a §12 progress row; `spec-v3-theme-palette-switch.md` supersession note after "The swatch problem" plus a superseded gate row |
| §9 gates re-run | DONE 2026-10-17 — results below |
| Throwaway scripts removed | DONE — `scripts/verify-nav-smoke.tsx` deleted after the run; no scratch outDir left |
| Owner follow-up — the brand becomes a home icon | DONE 2026-10-17 — `Navigation.tsx:97-106` replaces the `{CV}` wordmark with a 24px stroke house inside a 44px `.nav-logo` target: `aria-label={strings.nav.home[lang]}`, svg `aria-hidden="true"`, and the click target is the same `<Link to="/">` as before. `src/App.css:25-36` restyles `.nav-logo` (flex-centred, 44px, `--radius-md`), `:47-55` keeps `:hover { color: var(--accent) }` and adds `:focus-visible` (an icon-only link has no text to underline), `.logo-bracket` / `.logo-text` deleted, and the ≤420px block (`:319-330`) drops `.nav-brand { gap: 8px }` — the row now measures 252px inside 288px. Docs updated: `AGENTS.md:62`, `spec-ui-layout.md:114`, `spec-ui-navigation.md:5`, `spec-v3-ui-enhancements.md` §logo supersession note |
| Owner browser pass | TODO (repo rule §5) |
| Commit decision | TODO — owner approval required (repo rule §6) |

### 11.1 Gate results (2026-10-17, after the build)

| Gate | Result |
|---|---|
| `pnpm build` (`tsc -b && vite build`) | exit 0 — 543 modules, CSS 33.78 kB (gzip 6.82), JS 457.32 kB (gzip 142.27) |
| `pnpm lint` | **15** finding lines = 11 errors / 4 warnings, identical to the pre-change baseline; `rules-of-hooks` findings **11** before and after |
| Hex gate | `#[0-9a-fA-F]{3,8}` / `rgba(` in `src/App.css`: **0** |
| Dead-token gate | `--preview-*-bg` declarations **0**, `var()` consumers **0** |
| Equality gate (cascade-resolved) | **9/9** — dark red `#f87171` = dark-red `--accent`; dark blue `#60a5fa` = dark-blue `--accent`; light red `#b04138`; light blue `#2563eb`; bridge red = bridge `--accent`, bridge blue = light-blue `--accent`; both blue blocks declare no preview token; `--swatch-empty` `#ffffff` declared once |
| Contrast gate | **8/8** surfaces ≥ 4.5 — 5.24 / 6.36 (panels), 5.67 / 6.90 (sheets), 5.74 / 5.17 (light panels), 5.50 / 5.03 (light sheets) |
| Swatch half == dot, same theme | **4/4** at ratio 1.00 |
| Bar order smoke | **8/8** — `.nav-brand` present; hamburger < logo; hamburger < logo < lang < mode < palette; `.nav-actions` opens after the brand group and holds exactly 3 controls with no hamburger; `aria-controls="mobile-menu"` + `aria-expanded="false"` + `aria-label="Open menu"`; both `data-preview` chips; no `preview-*-bg` string |
| Emitted CSS | `.nav-brand{align-items:center;gap:12px;display:flex}` and `.nav-brand{gap:8px}` in the ≤420px block; `.nav-palette-preview{border:1px solid var(--border-strong);border-radius:50%;flex:none;width:18px;height:18px}`; four `--preview-*-accent` declarations (`#f87171`, `#60a5fa`, `#b04138`, `#2563eb`); `preview-red-bg` **0** |
| Row arithmetic | 40 + 12 + 70 + 44×3 + 12×2 = **278px** (10px slack); 40 + 8 + 70 + 44×3 + 12×2 = **274px** (14px slack), inside 288px |

---

## 12. Out of scope, recorded

| Item | State | Note |
|---|---|---|
| `src/App.css` arithmetic comment was wrong before this change (claimed 262px / 26px slack; the row measured 242px intrinsic + 46px distributed) | FIXED 2026-10-17 — the comment at `:319-321` now carries the post-move arithmetic, and both totals were re-measured by the gate | — |
| 11 pre-existing `react-hooks/rules-of-hooks` errors (`useField` / `useFieldArray` called inside `.map()` callbacks) | Out of scope | Measured **11** on HEAD and **11** in the current tree; this change adds none. Needs its own spec |
| `--accent` chain refactor (Option B, Q1) | Deferred | Only worth doing if a third consumer of per-palette accents appears |
| Sheet row order (Language → Mode → Theme color, Q16) | Unchanged | This spec supersedes only Q16's "the hamburger stays last in the bar" |
| `.nav-brand { gap: 8px }` at ≤420px — the mitigation for the 10px slack the brand group created | REMOVED 2026-10-17 | The wordmark (~70px) became a 44px icon, so the row is 252px inside 288px and the tightening buys nothing; the bar keeps one 12px brand gap at every width |
