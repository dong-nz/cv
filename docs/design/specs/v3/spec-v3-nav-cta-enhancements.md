# Specification — v3 Nav Bar & CTA Enhancements

> **Document:** `spec-v3-nav-cta-enhancements.md`
> **Version:** 0.2.0 (drafted 2026-10-17 after the owner answered Q1–Q8; built the same day)
> **Parents:** `specs/ui/spec-ui-layout.md` (bar controls), `spec-v3-theme-palette-switch.md` (palette blocks, `--accent` family), `spec-v3-typography.md` (chrome band), `spec-v3-mobile-navigation.md` (§13 findings this spec closes one of)
> **Priority:** P2
> **Estimate:** ~40 minutes including the gate re-run
> **Status:** BUILT 2026-10-17 — Steps 1–5 on disk, §9.1 records the gate run and the SSR smoke. Open: the owner's browser pass (A1, A3, A4, A5, A6, A7, A9) and the commit decision.

---

## 1. Request

1. **Replace the language control's `EN`/`VI` text with an icon** — the owner asked which icon suits the two languages.
2. **Add motion to the theme-colour control**: clicking rotates the circle 90°; it rotates back after a colour is selected or the control loses focus.
3. **The text inside the buttons looks too dark in dark mode** — make it lighter, similar to light mode.

Request 3 is not a navigation-bar item. The buttons in question are `.btn-primary` in the hero CTA cluster (`src/components/sections/Hero.tsx:93-98`, `:24`), styled at `src/App.css:455-471`. The spec covers both surfaces because they were requested as one change set.

---

## 2. Current state (verified against the code, 2026-10-17)

### 2.1 Facts

| Fact | Evidence |
|---|---|
| The language control is a text glyph: `{lang === 'en' ? 'VI' : 'EN'}` inside `nav-control lang-toggle` | `src/components/layout/Navigation.tsx:102-109` |
| `.lang-toggle` sets `font-size: 13px; font-weight: 600; letter-spacing: 0.5px` | `src/App.css:119-123` |
| The bar's other two controls are icon-only (inline sun/moon SVG; the half-circle swatch), so the language control is the only text control in the bar | `Navigation.tsx:84-100`, `:111`, `src/App.css:331-340` |
| `public/icons.svg` holds social symbols only (`github-icon`, `x-icon`, …); every bar icon is inline SVG | `grep id= public/icons.svg` |
| The palette trigger is `<span className="nav-palette-swatch" aria-hidden="true" />` — a plain span, no motion, **no `transition` declared** | `ThemePaletteMenu.tsx:39`, `src/App.css:333-340` |
| The swatch is `linear-gradient(to right, var(--accent) 0 50%, var(--swatch-empty) 50% 100%)`, 20×20, `border-radius: 50%` | `src/App.css:333-340` |
| The trigger carries `.open` while the submenu is open; `.open` clears on selection, on Escape, and on pointer-down outside | `ThemePaletteMenu.tsx:32`, `:49-51`, `:18-25`, `src/hooks/useClickOutside.ts:10-11` |
| `useClickOutside` listens to `mousedown`/`touchstart` only — **blur does not close the submenu** | `src/hooks/useClickOutside.ts:10-11` |
| `motion.config.reducedMotion = 'user'` is set once at boot | `src/main.tsx:7-9` |
| `.btn-primary` = `background: var(--accent)` + `color: var(--text-on-accent)` + `border: 1px solid transparent` + `box-shadow: var(--accent-glow)`; hover uses `--accent-hover` | `src/App.css:455-471` |
| `.badge-accent` uses the same `--accent` / `--text-on-accent` pair, 12px text | `src/App.css:534-537` |
| `.btn-primary` has exactly three live call sites, all in the hero: two `<Button variant="primary">` and one raw anchor | `Hero.tsx:93,96,24`; `Button.tsx:20` |
| `.badge-accent` has **no live call site** — `Badge variant="accent"` is mapped but never used | `Badge.tsx:8`; grep `<Badge` returns `variant="outline"` only |
| `--text-on-accent` is referenced 11 times across accent-filled surfaces — 3 in scope here (`.btn-primary` ×2, `.badge-accent`), 8 out of scope | `src/App.css:390,395,457,464,536,564,950,955,1000,1449,1889` |
| Light-mode accent values are already the "deep" reds/blues; dark-mode accents are the pale ones | `src/index.css:9-12`, `:67-70`, `:96-99`, `:123-126` |

### 2.2 The measurement that decides request 3

sRGB relative luminance, WCAG 2.x ratios, measured 2026-10-17.

**Today's CTA text is *not* below AA in either theme:**

| Theme | Fill | Text | Ratio |
|---|---|---|---|
| dark / red | `--accent #f87171` | `--text-on-accent #151914` | **6.43** |
| dark / blue | `--accent #60a5fa` | `--text-on-accent #0f1117` | **7.42** |
| light / red | `--accent #b04138` | `--text-on-accent #ffffff` | **5.74** |
| light / blue | `--accent #2563eb` | `--text-on-accent #ffffff` | **5.17** |

**Light text on the current dark accent is impossible:**

| Pair | Ratio |
|---|---|
| `#f6f5f2` on `#f87171` (dark red, current fill) | **2.54** |
| `#e8eaed` on `#60a5fa` (dark blue, current fill) | **2.33** |

So the complaint is real but the fix cannot be a colour swap on the text alone: a `#f87171` fill cannot carry light text. The fill has to move to a deeper accent. Measured candidates (light text `#f6f5f2`, page `#151914`):

| Fill | Text ratio | Fill vs page |
|---|---|---|
| `#c04a40` | 4.48 | 3.64 |
| `#b04138` | 5.26 | 3.10 |
| `#a33a32` | 6.00 | 2.72 |
| `#9b3229` | 6.68 | 2.44 |

Blue-dark equivalent (light text `#e8eaed`, page `#0f1117`): `#3b82f6` 3.05 · `#2563eb` **4.29** · `#1d4ed8` 5.56 · `#1e40af` 7.24 · `#1c3f9e` 7.73. Note `#2563eb` — the *light-mode* blue accent — fails 4.5 against the dark-blue text token, so the dark-blue solid starts one step deeper than the dark-red one.

---

## 3. Owner decisions (2026-10-17)

| # | Question | Answer |
|---|---|---|
| Q1 | Which icon replaces `EN`/`VI`? | **None — keep the `EN`/`VI` text.** Request 1 is closed as a no-change decision; the candidate list (§4.1) is recorded so it is not re-litigated. |
| Q2 | Which buttons read too dark in dark mode? | **The hero CTA cluster** — `.btn-primary`. |
| Q3 | How to make that text light? | **Deeper accent fill via a new token** (not an outline button, not a global `--text-secondary` change). |
| Q4 | Border on the primary button? | **1px `var(--accent)`.** |
| Q5 | Hover / active in dark mode? | **Go deeper**, not lighter. |
| Q6 | Scope | **All `.btn-primary` + `.badge-accent`.** |
| Q7 | What drives the swatch rotation? | **`motion.span` animate**, not a CSS class rule. |
| Q8 | Angle and target? | **90° on the swatch** (not the whole 44px button). |

---

## 4. Design

### 4.1 Language control — no change (decision record)

The options put on the table, and why each was set aside:

| Option | Argument | Verdict |
|---|---|---|
| Glyph pair `A` ↔ `Ạ` | State-visible like the mode toggle's sun/moon; monochrome; no new SVG; keeps "the control names the language you switch to" | offered, not taken |
| Translate glyph (speech bubbles, `A` + `文`) | Reads as "switch language" instantly, but identical in both states — the target language survives only in `aria-label`/`title` | offered, not taken |
| Globe | Most common idiom; ambiguous (i18n / web / international) and state-invariant | offered, not taken |
| Flag pair | Vietnamese flag red/yellow collides with the red palette; a flag is not a language; the bar's icon language is `currentColor` monochrome | rejected on the merits |
| **Keep `EN`/`VI`** | Two-letter codes are unambiguous, already 13px chrome, and the sheet already spells both languages in full (`MobileMenu.tsx:94-110`) | **chosen** |

Consequence: `Navigation.tsx:102-109` and `src/App.css:119-123` are untouched, and no `strings.nav.langToEn` / `langToVi` keys are added. The English-only `aria-label`s at `Navigation.tsx:87,105` stay open in `spec-v3-mobile-navigation.md` §13.

### 4.2 Swatch rotation

`ThemePaletteMenu.tsx:39` becomes a `motion.span` whose `rotate` target follows the existing `open` state:

- `open` flips true on trigger click → `rotate: 90` (clockwise, 150ms, matching `--transition-fast`).
- `open` flips false on selection (`:49-51`), on Escape (`:18-25`), or on pointer-down outside (`useClickOutside`) → `rotate: 0`.

That covers "selected" and "clicked away". It does **not** cover keyboard blur: `useClickOutside` never sees focus, so tabbing away leaves the submenu open and the swatch rotated. The owner chose the motion route and did not ask for a close-on-blur behaviour change, so this spec keeps the existing close semantics and records the gap in §10.

Visual consequence of 90°: the swatch's split is currently left/right (accent left, `--swatch-empty` right); after the rotation it is top/bottom (accent top). That is the intended "menu open" cue.

Reduced motion: `rotate` is a transform, and `motion.config.reducedMotion = 'user'` (`src/main.tsx:7-9`) strips transform animations — reduced-motion users see the swatch snap between 0° and 90° with no code path of its own.

No CSS transition is added to `.nav-palette-swatch`: motion writes an inline `transform`, and a CSS `transition` on the same property would compete with it.

### 4.3 Solid-accent token set

Four new tokens per theme/palette block, named after the existing `--accent` family:

| Token | Role |
|---|---|
| `--accent-solid` | fill of an accent-filled surface that carries text |
| `--accent-solid-hover` | its hover fill |
| `--accent-solid-active` | its active/pressed fill |
| `--text-on-accent-solid` | text on those fills |

Values (chosen so every text pair clears 4.5 and light mode is byte-identical to what `.btn-primary` resolves today):

| Block | `--accent-solid` | `-hover` | `-active` | `--text-on-accent-solid` |
|---|---|---|---|---|
| `:root` (dark red) `src/index.css:9-12` | `#b04138` | `#a33a32` | `#9b3229` | `#f6f5f2` |
| `:root[data-theme='light']` `:67-70` | `#b04138` | `#a8382f` | `#9b3229` | `#ffffff` |
| `[data-theme='dark'][data-palette='blue']` `:96-99` | `#1d4ed8` | `#1e40af` | `#1c3f9e` | `#e8eaed` |
| `[data-theme='light'][data-palette='blue']` `:123-126` | `#2563eb` | `#1d4ed8` | `#1e40af` | `#ffffff` |
| `prefers-color-scheme: light` bridge `:163-166` | `#b04138` | `#a8382f` | `#9b3229` | `#ffffff` |

The light blocks duplicate `--accent` / `--accent-hover` / `--accent-active` / `--text-on-accent` verbatim. That is deliberate: it keeps one rule set in `App.css` with no theme-conditional selectors, and it means the light-mode CTA does not move by a single pixel.

`--accent`, `--accent-hover` and `--accent-active` are **not** redefined. They keep their current job as the bright signal colour (links, underlines, borders, glows, `.name-highlight` gradient) and as the fill of the eight out-of-scope accent-filled surfaces (§10).

### 4.4 Contrast verification for the new set

| Palette | text on solid | text on hover | text on active | fill vs page | 1px `--accent` border vs page |
|---|---|---|---|---|---|
| dark / red | **5.26** | 6.00 | 6.68 | 3.10 | **6.43** |
| dark / blue | **5.56** | 7.24 | 7.73 | 2.82 | **7.42** |
| light / red | **5.74** | 6.42 | 7.29 | 5.26 | 5.26 (border = fill) |
| light / blue | **5.17** | 6.70 | 8.72 | 4.77 | 4.77 (border = fill) |

All four clear WCAG AA 4.5 for normal text, including the 12px `.badge-accent` label. In dark mode the fill alone sits at 3.10 / 2.82 against the page — the 1px `--accent` border (Q4) is what carries WCAG 1.4.11 for the control boundary, at 6.43 / 7.42. In light mode the border is the same colour as the fill and is therefore invisible: no visual change, and the box metrics are unchanged because the rule already declared `border: 1px solid transparent` (`src/App.css:458`).

---

## 5. Implementation Details

### Step 1 — tokens (`src/index.css`)

Insert four declarations after each block's existing `--text-on-accent` line, in all five blocks:

| Anchor | Insert |
|---|---|
| `src/index.css:12` (dark red `:root`) | `--accent-solid: #b04138; --accent-solid-hover: #a33a32; --accent-solid-active: #9b3229; --text-on-accent-solid: #f6f5f2;` |
| `src/index.css:70` (light red) | `… #b04138 / #a8382f / #9b3229 / #ffffff` |
| `src/index.css:99` (dark blue) | `… #1d4ed8 / #1e40af / #1c3f9e / #e8eaed` |
| `src/index.css:126` (light blue) | `… #2563eb / #1d4ed8 / #1e40af / #ffffff` |
| `src/index.css:166` (no-JS light bridge) | `… #b04138 / #a8382f / #9b3229 / #ffffff` |

Add one comment above the dark-red group, reused verbatim in the other blocks: *solid accent = the fill that carries text; bright `--accent` stays the signal colour.* The bridge block gets the red values only, matching the existing rule that no blue variant exists there (`src/index.css:143-152` comment).

### Step 2 — `.btn-primary` (`src/App.css:455-471`)

```css
.btn-primary {
  background: var(--accent-solid);
  color: var(--text-on-accent-solid);
  border: 1px solid var(--accent);          /* was: 1px solid transparent */
  box-shadow: 0 4px 20px var(--accent-glow);
}

.btn-primary:hover {
  background: var(--accent-solid-hover);    /* was: var(--accent-hover) */
  color: var(--text-on-accent-solid);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px var(--accent-glow);
}

.btn-primary:active {
  background: var(--accent-solid-active);   /* was: inherited from :hover chain */
  transform: translateY(0);
  box-shadow: 0 2px 10px var(--accent-glow);
}
```

`.btn-primary:active` today declares only `transform` and `box-shadow` (`src/App.css:468-471`); adding the deeper fill is the "go deeper on interaction" rule from Q5. `translateY(-2px)` lift and the glow shadow stay. `.btn:focus-visible` outline (`:450-453`) is untouched.

### Step 3 — `.badge-accent` (`src/App.css:534-537`)

```css
.badge-accent {
  background: var(--accent-solid);
  color: var(--text-on-accent-solid);
}
```

No live call site today (§2.1); the change keeps the two accent-filled variants the owner named consistent, and it is the reason the token pair exists rather than a one-off rule on `.btn-primary`.

### Step 4 — swatch rotation (`src/components/layout/ThemePaletteMenu.tsx`)

Add `import { motion } from 'motion/react'` above the existing imports (`:1-6`), and replace line 39:

```tsx
<motion.span
  className="nav-palette-swatch"
  aria-hidden="true"
  animate={{ rotate: open ? 90 : 0 }}
  transition={{ duration: 0.15, ease: 'easeOut' }}
/>
```

No new state, no new handler, no `initial` prop (the component mounts closed, so the first paint is `rotate: 0`). `aria-hidden="true"` and `className` are preserved, so the accessible name still comes only from the trigger's `aria-label` (`:35`) and `.nav-palette-swatch` still matches the same CSS rule.

### Step 5 — nothing else

`Navigation.tsx`, `MobileMenu.tsx`, `strings.ts`, `useClickOutside.ts`, `palettes.ts` and the language control are not touched. No CSS class is added or removed; `.lang-toggle` (`src/App.css:119-123`) stays live.

---

## 6. Affected Files

| File | Change |
|---|---|
| `src/index.css` | 4 new tokens × 5 blocks (20 declarations + 1 comment), inserted at `:12`, `:70`, `:99`, `:126`, `:166` |
| `src/App.css` | `.btn-primary` `:455-471` (3 rules), `.badge-accent` `:534-537` (1 rule) |
| `src/components/layout/ThemePaletteMenu.tsx` | `:1-6` import, `:39` span → `motion.span` |
| `docs/design/specs/v3/spec-v3-nav-cta-enhancements.md` | this document |
| `docs/design/specs/v3/spec-v3-theme-palette-switch.md` | append the four tokens to its token table (the palette documentation must list every token a block defines) |
| `AGENTS.md` | Theming bullet: name the solid-accent token family |

No file is deleted. No call site changes: `Button.tsx`, `Badge.tsx`, `Hero.tsx` keep their current markup.

---

## 7. Acceptance criteria

| # | Criterion | How it is proven |
|---|---|---|
| A1 | Hero CTAs in dark mode carry light text on a deep-red fill with a bright accent edge | owner's browser pass |
| A2 | Dark-mode text ratio ≥ 4.5: 5.26 (red), 5.56 (blue) | §4.4 arithmetic |
| A3 | Hover and active go deeper than the resting fill in every palette | §4.4 arithmetic + browser pass |
| A4 | Light mode is visually unchanged, including hover and active | §4.3 value table + browser pass |
| A5 | Clicking the palette control rotates the swatch 90° over 150ms | browser pass |
| A6 | The rotation returns to 0° on selection, on Escape, and on click-away | browser pass |
| A7 | With the OS reduced-motion setting on, the swatch changes angle without animating | browser pass |
| A8 | The language control still renders `VI` / `EN` and keeps its current `aria-label`/`title` | code inspection |
| A9 | Blue palette behaves identically to red for both items | browser pass |
| A10 | No new oxlint finding, no type error, no hex/rgba literal added to `App.css` | §8 gates |

---

## 8. Verification gates

| Gate | Command | Baseline |
|---|---|---|
| Types | `pnpm exec tsc -b` | exit 0 |
| Lint | `pnpm exec oxlint -c .oxlintrc.json src` | 19 finding lines (11 errors / 8 warnings) — must stay 19 |
| Hex lives in tokens only | `grep -cE '#[0-9a-fA-F]{3,8}\b\|rgba?\(' src/App.css` | 0 |
| No inline type properties | `grep -cE 'style=\{\{[^}]*(fontSize\|lineHeight\|color)' src` | 0 |
| Build | `pnpm exec vite build --outDir dist-verify` then delete `dist-verify` | green |

`pnpm build` into `dist/` remains blocked by the `EPERM` on `dist/assets` recorded in `spec-v3-mobile-navigation.md` §12; the owner frees those files.

---

## 9. Progress Tracking

- [x] DONE Step 1 — solid-accent tokens in the five blocks of `src/index.css`: 20 declarations at `:17-20` (dark red), `:81-84` (light red), `:116-119` (dark blue), `:148-151` (light blue), `:193-196` (bridge)
- [x] DONE Step 2 — `.btn-primary` fill / text / border / hover / active, now `src/App.css:455-472`
- [x] DONE Step 3 — `.badge-accent` fill / text, now `src/App.css:535-538`
- [x] DONE Step 4 — `motion.span` rotation in `ThemePaletteMenu.tsx`: import `:1`, element `:44-49`
- [x] DONE Step 5 — nothing else moved: `git status --porcelain` lists exactly `AGENTS.md`, `spec-v3-theme-palette-switch.md`, `src/App.css`, `src/index.css`, `ThemePaletteMenu.tsx` plus this new file; `Navigation.tsx` is absent, which is A8
- [x] DONE Gate run — §9.1
- [x] DONE `spec-v3-theme-palette-switch.md` → 0.4.0: solid family added to both blue listings (`:98-99`, `:120-121`), three text rows in its contrast table (`:166-168`), new §5 subsection "Solid accent family (added 2026-10-17)" (`:218-229`)
- [x] DONE `AGENTS.md`: accent-tier bullet in Theming (`:59`), rotation bullet in Motion & Animation (`:97`), v3 spec index row (`:160`)
- [ ] TODO Owner browser pass — A1, A3, A4, A5, A6, A7, A9 (dark/light × red/blue, 320px and 1100px)
- [ ] TODO Commit decision — owner approval required

### 9.1 Gate results (2026-10-17, after the build)

| Gate | Result |
|---|---|
| `pnpm exec tsc -b` | exit 0 |
| `pnpm exec oxlint -c .oxlintrc.json src` | 19 finding lines — baseline held, no new finding |
| hex / rgba literals in `src/App.css` | 0 |
| inline `fontSize` / `lineHeight` / `color` in `style={{…}}` | 0 |
| `pnpm exec vite build --outDir dist-verify` | green; CSS 33.48 kB (was 32.84 kB); `dist-verify` deleted after the check |
| Built CSS carries the change | `.btn-primary{background:var(--accent-solid);color:var(--text-on-accent-solid);border:1px solid var(--accent);box-shadow:…}`, `.badge-accent{background:var(--accent-solid);color:var(--text-on-accent-solid)}`, `--accent-solid` emitted in three distinct values (`#b04138`, `#1d4ed8`, `#2563eb`) |
| SSR smoke (throwaway `scripts/smoke-cta-rotation.ts`, deleted after the run) | 7/7 — the swatch renders as `<span class="nav-palette-swatch" aria-hidden="true">` with no inline transform at rest, the trigger keeps `aria-expanded="false"` and its `aria-label`, `btn btn-primary` / `badge badge-accent` intact, no inline type properties |

Line numbers in §2 and §5 are the pre-build positions; §9 and §9.1 carry the post-build ones.

---

## 10. Out of scope, recorded

| Item | State | Note |
|---|---|---|
| Eight other accent-filled surfaces keep `background: var(--accent)` + `color: var(--text-on-accent)` | unchanged, AA-passing today (6.43 red / 7.42 blue in dark) | `.nav-palette-option:hover` `src/App.css:389-395`, `.tag-accent` `:563-564`, `.download-resume-summary` `:949-955`, `:999-1000`, `:1448-1449`, `.back-to-top` `:1888-1907`. Dark mode now has two accent-fill idioms — deep fill + light text on buttons/badges, pale fill + dark text on these. Moving them onto `--accent-solid` is a one-line-per-rule follow-up, but it restyles Back-to-Top, the resume summary bar and the palette hover, so it needs its own owner decision. |
| Keyboard blur does not close the palette submenu | unchanged | `useClickOutside.ts:10-11` listens to pointer events only. Tabbing away from the trigger leaves the panel open **and the swatch rotated 90°** until Escape or a click elsewhere. A subtree `onBlur` close handler would fix both; not in scope per Q7. |
| English-only `aria-label`s at `Navigation.tsx:87,105` | unchanged | still open in `spec-v3-mobile-navigation.md` §13; closing it needs `strings.nav.themeAria` plus `langToEn`/`langToVi`, which Q1 declined to introduce. |
| `.badge-accent` has no call site | unchanged | the rule is updated for consistency only; no visible effect until a `variant="accent"` badge is used. |
| `--accent-hover` / `--accent-active` keep their pale dark values | unchanged | they remain the bright signal colours and the fill of the eight surfaces above; only the new `-solid-` family deepens. |
