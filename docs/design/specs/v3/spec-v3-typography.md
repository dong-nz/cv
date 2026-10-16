# Specification — v3 Typography scale and readability

> **Document:** `spec-v3-typography.md`
> **Version:** 1.0.0
> **Parent:** `spec.md` (IA/content readability), sibling of `spec-v3-theme-palette-gasatrya.md`
> **Priority:** P1
> **Status:** Implemented. TSX sweep done, `Card` deleted, `tsc -b` and the production build are green; the visual pass is the user's in a real browser (project rule: no headless verification).

---

## 1. Problem

Reported: the Philosophy page reads small and hard to follow. Measured, the cause is four things at once, and the same drift exists on every page.

| # | Finding | Evidence |
|---|---|---|
| P1 | Philosophy body copy is the smallest in the app: **16px / 1.7**, while About's bio and the project-detail summary — the same "lead paragraph" role — are 18px | `PhilosophyPage.tsx:17` (no `font-size`, falls back to `:root { font-size: 16px }`) vs `AboutPage.tsx:22` and `ProjectDetailPage.tsx:37` inline `18px` |
| P2 | **No space between paragraphs.** `* , ::before, ::after { margin: 0 }` resets `p`, and nothing re-adds it, so the three paragraphs of a quote render as one block | `index.css` reset, `strings.ts:82-87` (three `<p>` blocks per quote) |
| P3 | **Measure too wide**: `.container-content` = 800px − 48px padding = 752px of text; Philosophy has no narrower cap (About caps itself at 700px inline) | `index.css` `.container-content`, `AboutPage.tsx:21` |
| P4 | Markup bug: the quote HTML already contains `<p>…</p>` and was injected **inside** a `<p>` (nested paragraphs). `aria-labelledby="engineering-heading"` pointed at an id no element had (`SectionHeading` only takes `id` as a prop) | `PhilosophyPage.tsx:9,17`, `SectionHeading.tsx:5,10` |
| P5 | **No `@font-face` anywhere in the app.** `--sans` named `Inter`, which is neither shipped nor linked, so the SPA always rendered `system-ui` (Segoe UI on Windows). The four woff2 files in `public/fonts/` are Source Sans 3 and are read only by `scripts/generate-resume.ts:21-24,43-57` | repo-wide grep for `@font-face` → 0 hits in `src/`, `index.html` |
| P6 | Same role, many sizes: body copy 16 / 18 / 14px; sub-headings 24 (global `h3`) / 20 / 18 / 16 / 14px; `h4-h6` had no size at all and fell back to 16px | audit table, §2 |
| P7 | `line-height` drift: `p` got 1.7, every `div`/`li`/`a` inherited 1.6 from `:root`, and `.project-card-summary` was explicitly set to 1.6 while the same 14px `.philosophy-card p` inherited 1.7 | `App.css` `.project-card-summary`, `.philosophy-card p` |
| P8 | ~20 inline `style` objects in TSX carried the type decisions, and **no `@media` block anywhere changes `font-size` or `line-height`** | `PhilosophyPage.tsx:13,17`, `AboutPage.tsx:21,22,26,43`, `About.tsx:14,15,19,36`, `ProjectDetailPage.tsx:28,37,43,55,60,70,73,74`, `ExperiencePage.tsx:33,37`, `Experience.tsx:28,78`, `ContactPage.tsx:18,19,27,28,36,37`, `Contact.tsx:25,45,48,70,73,95,98`, `Projects.tsx:36`, `DownloadResume.tsx:96` |

## 2. Measurements

Method: `fontTools` over the shipped `public/fonts/SourceSans3-Regular.woff2` and the font that actually renders today (`C:/Windows/Fonts/segoeui.ttf`), summing glyph advances of one 221-character English sample from the Philosophy text. No browser involved.

| Font | x-height | cap height | avg advance | 16px | 18px |
|---|---|---|---|---|---|
| Segoe UI (what renders today) | 0.500 em | 0.700 em | 0.4273 em | 6.84 px/char | 7.69 px/char |
| Source Sans 3 (shipped, resume-only) | 0.486 em | 0.660 em | 0.3996 em | 6.39 px/char | 7.19 px/char |

Characters per line at each candidate measure:

| Measure @ size | Segoe UI | Source Sans 3 |
|---|---|---|
| 752px @16px — **before** | 110 | 118 |
| 700px @16px — About's own cap | 102 | 110 |
| **600px @18px — after** | **78** | **83** |
| 560px @18px — stricter editorial band | 73 | 78 |

Reading bands used: 45-75 characters (Bringhurst), 38-80 (Butterick). Before: 110-118. After: 78-83.

## 3. Decisions

1. **Font: admit `system-ui`.** `--sans` becomes `system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`. No webfont is loaded; the Source Sans 3 woff2 files stay in `public/fonts/` because `scripts/generate-resume.ts` reads them from disk for the PDF. (User's call: keep the current look rather than restyle the whole site.)
2. **Scale tokens** in `:root`: `--text-body: 18px`, `--text-lede: 20px`, `--text-meta: 15px`, `--leading-body: 1.65`, `--measure-prose: 600px`, `--measure-page: 680px` (added in the second pass, §3.10). They live in `:root` only — sizes do not differ between dark and light, so they are not duplicated in the light block or the media bridge.
3. **Reuse `.prose`** (`App.css`, previously defined and never rendered by any component) as the prose system instead of inventing a second convention.
4. **Role sizes.** Body copy 18px/1.65 everywhere a paragraph is the main content; lead paragraphs 20px/1.55; dense secondary copy (timeline bullets, achievement context and impact, expertise skill lists, card summaries, contact sub-labels) 15px/1.65. Literal 12-14px stays reserved for chrome: `.tag`, `.badge`, `.achievement-metric`, `.footer-text`, `.footer-link`, `.timeline-duration`, `.project-card-cta`, `.lang-toggle`, `pre`.
5. **Heading sizes**: `h3` 24 → **21px**, and `h4` 18 / `h5` 16 / `h6` 15 made explicit (they previously fell back to 16px). `h1`/`h2` clamps and the global `h1-h6 { line-height: 1.2 }` are untouched.
6. **Paragraph rhythm lives only inside `.prose`** (`.prose p { margin-bottom: 1em }`, `:last-child` 0). The global `p` keeps `margin: 0` from the reset, so hero, cards, section subtitles and contact tiles are unaffected.
7. **Headings carry their own top margin** (`.subheading { margin-top: 32px }`, `.prose h3 { margin-top: 1.5em }`, `.philosophy-quote h3 { margin-top: 0 }`); lead paragraphs carry no bottom margin. Sibling margins collapse, so each gap is a single value rather than a sum.
8. **No inline `fontSize` / `lineHeight` / `fontWeight` / text `color` in components.** Layout-only inline styles (`flex`, `gap`, motion `style={{y}}`) are allowed.
9. **Delete dead CSS and the unused `Card` component** rather than leaving unstyled scaffolding behind (list in §4.2).
10. **Second pass (user feedback, 2026-10-16): two measures instead of one.** 600px read too small on `/philosophy`, and on `/about` the 600px lede sat above a wider grid — the ragged right edge looked like a defect rather than a measure. `--measure-page: 680px` now governs page columns (`.page-body`, `.prose-wide`, `.lede-wide`); `--measure-prose: 600px` stays for long-form narrative (`.prose` on `/projects/:id`). A wider column is paid for with a larger body, not a longer line: `.prose-wide p` uses `--text-lede` 20px / 1.6 → 79 characters per line (still inside the 45-80 band), where 680px at 18px would be 88.
11. **`/about` §1 and the homepage About section move to `container-wide`** with `.philosophy-grid` at `repeat(3, 1fr)` — the same column model as `.expertise-grid` (3 → 2 at ≤1024px → 1 at ≤768px) — so both halves of `/about` carry equal weight. The `.page-body` wrapper is gone from both (the bio, subheadings and grids are direct children of the section); the bio uses `.prose-lede lede-wide` and stays at 680px. `profile.philosophy` has 5 cards → rows of 3 + 2.

## 4. Implementation details

### 4.1 `src/index.css`

- `:root` token block: `--max-narrow` deleted; the scale tokens added after `--max-content` (five in the first pass, `--measure-page` in the second).
- `--sans` → system stack (finding P5). `--mono` unchanged (it already ends in `ui-monospace, monospace`, so it resolves without a download).
- `h3 { font-size: 21px }`; new `h4 { 18px }`, `h5 { 16px }`, `h6 { 15px }`.
- `p { font-size: var(--text-body); line-height: var(--leading-body); color: var(--text-secondary); }` — was implicit 16px / 1.7.
- `.container-narrow` deleted (no consumer), including its two leftover entries in the responsive padding selector lists.

### 4.2 `src/App.css`

Prose system (rewritten in place of the dead `.prose` block):

```
.prose { max-width: var(--measure-prose); }
.prose h2 { margin: 48px 0 16px; font-size: 28px; }
.prose h3 { margin: 1.5em 0 0.65em; }              /* 21px inherited */
.prose h4 { margin: 1.25em 0 8px; font-size: 16px; line-height: 1.3; }
.prose p { margin-bottom: 1em; }   .prose p:last-child { margin-bottom: 0; }
.prose ul, .prose ol { margin-bottom: 16px; padding-left: 24px; }
.prose li { margin-bottom: 8px; color: var(--text-secondary); font-size: var(--text-body); line-height: var(--leading-body); }
.prose blockquote { …unchanged… }
.prose-lede { max-width: var(--measure-prose); font-size: var(--text-lede); line-height: 1.55; }
.prose-wide { max-width: var(--measure-page); }   .prose-wide p { font-size: var(--text-lede); line-height: 1.6; }
.lede-wide { max-width: var(--measure-page); }    .page-body { max-width: var(--measure-page); }
.subheading { margin: 32px 0 12px; }
.philosophy-quote + .philosophy-quote { margin-top: 48px; }
.philosophy-quote p { text-align: justify; }
.philosophy-quote h3 { margin-top: 0; }
.project-section { background/border/radius/padding 16px; margin-bottom: 16px; inset highlight; }
.project-section h4 { margin-top: 0; }   .project-section p { font-size: var(--text-meta); line-height: var(--leading-body); }
.back-link, .section-cta { font-size: var(--text-meta); font-weight: 500; color: var(--accent); }
.link-label { font-weight: 500; color: var(--text-primary); }
.contact-link-sub { font-size: var(--text-meta); line-height: 1.5; color: var(--text-muted); }
.achievement-impact { font-size: var(--text-meta); line-height: var(--leading-body); color: var(--text-secondary); margin-bottom: 8px; }
.achievement-metrics { margin-bottom: 8px; }
.download-resume-button { justify-content: center; padding 12px 20px; color text-primary; }   /* variant of .contact-link; replaces the DownloadButton inline style */
```

Existing rules retuned to the scale:

| Selector | Was | Now |
|---|---|---|
| `.expertise-skill` | 14px, inherited 1.6 | `var(--text-meta)` / `var(--leading-body)` |
| `.timeline-title` | 20px, inherited 1.6 | 20px + `line-height: 1.3` |
| `.timeline-company` | 16px, inherited 1.6 | 16px + `line-height: 1.4` |
| `.timeline-responsibilities li` | 14px / 1.6 | `--text-meta` / `--leading-body` |
| `.achievement-title` | 18px / 1.6 | 18px + `line-height: 1.3` |
| `.achievement-context` | 14px / 1.6 | `--text-meta` / `--leading-body` |
| `.project-card-summary` | 14px / 1.6 | `--text-meta` / `--leading-body` |
| `.philosophy-card h3` | 18px / 1.6 | 18px + `line-height: 1.25` |
| `.philosophy-card p` | 14px / 1.7 (inherited) | `--text-meta` / `--leading-body` |
| `.contact-link` | 16px / 1.6 | 16px + `line-height: 1.4` |

Deleted as dead (no component rendered any of them; verified by grepping every class name against `src/**/*.tsx`): `.card`, `.card:hover`, `.card-elevated`, `.card-featured` (and `src/components/ui/Card.tsx` plus its barrel export), `.page-header`, `.breadcrumb*`, `.form-group/label/input/textarea`, `.filter-bar`, `.filter-pill*`, `.article-card`, `.article-meta`, `.engineering-tabs`, `.engineering-tab*`, `.container-narrow`, `--max-narrow`.

### 4.3 TSX

| File | Change |
|---|---|
| `src/pages/PhilosophyPage.tsx` | whole body: `aria-labelledby="philosophy-heading"` matched by `<SectionHeading id="philosophy-heading">`; quotes wrapped in `<div className="prose prose-wide">` → `<div className="philosophy-quote">` → plain `<h3>` + `<div dangerouslySetInnerHTML>` (no outer `<p>`, so the injected `<p>` blocks are no longer nested); inline styles and the stale "Placeholder for expanded content" comment removed |
| `src/pages/AboutPage.tsx`, `src/components/sections/About.tsx` | `maxWidth:'700px'` div → `.page-body` (first pass) → wrapper removed entirely (second pass): bio, `.subheading` titles and both grids are direct children of the section; bio → `.prose-lede lede-wide`; `/about` §1 section `container-content` → `container-wide` |
| `src/pages/ProjectDetailPage.tsx` | back link → `.back-link`; summary → `.prose-lede`; narrative wrapped in `.prose`; four `marginBottom:'32px'` block wrappers unwound (rhythm now comes from `.prose h3`); four `<h3 style>` → plain `<h3>`; section cards → `.project-section` with plain `<h4>` / `<p>` |
| `src/pages/ExperiencePage.tsx`, `src/components/sections/Experience.tsx` | impact div → `.achievement-impact`; metrics wrapper → `.achievement-metrics`; `maxWidth:'700px'` → `.page-body` |
| `src/pages/ContactPage.tsx`, `src/components/sections/Contact.tsx` | label divs → `.link-label`; sub-labels → `.contact-link-sub`; `maxWidth:'700px'` → `.page-body` |
| `src/components/sections/Projects.tsx` | "view all" link → `.section-cta` |
| `src/components/sections/DownloadResume.tsx` | option label → `.link-label`; `DownloadButton` inline layout + `color` → `className="contact-link download-resume-button"` |
| `src/components/ui/Card.tsx` | deleted; export removed from `src/components/index.ts` |

## 5. Affected files

| File | Change |
|---|---|
| `src/index.css` | token block (`--max-narrow` deleted, six scale tokens), `--sans`, `h3`-`h6`, `p`, `.container-narrow` deleted |
| `src/App.css` | prose system added/rewritten, 10 selectors retuned, `.download-resume-button` added, `.philosophy-grid` 2 → 3 columns + a new ≤1024px breakpoint, ~170 lines of dead CSS deleted |
| 8 page/section TSX files | inline type styles → classes (see §4.3) |
| `src/components/ui/Card.tsx` | deleted |
| `src/components/index.ts` | `Card` export removed |
| `AGENTS.md` | `External Assets` font line corrected to Source Sans 3 (resume-only), `CSS Architecture` line corrected to the real theme blocks, new `Typography` section |
| `docs/design/specs/v3/spec-v3-theme-palette-gasatrya.md` | card inset-highlight row now moot (`.card*` deleted) |

## 6. Progress tracking

- [x] Audit: every `font-size` / `line-height` in `src/index.css` + `src/App.css` and every inline type style in TSX, with anchors
- [x] Line-length measured from real glyph metrics (Segoe UI as rendered, Source Sans 3 as shipped)
- [x] `@font-face` absence confirmed; decision recorded: keep `system-ui`, keep woff2 for the resume generator only
- [x] Scale tokens added to `src/index.css`
- [x] `.prose` turned into the live prose system; `.prose-lede`, `.page-body`, `.subheading`, `.project-section`, `.back-link`, `.section-cta`, `.link-label`, `.contact-link-sub`, `.achievement-impact`, `.achievement-metrics` added
- [x] 10 existing selectors retuned to the scale
- [x] Dead CSS deleted, `Card` component deleted
- [x] Philosophy page: prose column, paragraph spacing, no nested `<p>`, ARIA id wired
- [x] Inline type styles removed from the 8 TSX files — gate `style=\{\{[^}]*(fontSize|lineHeight|fontWeight|color|maxWidth)` over `src/` → 0 matches
- [x] `tsc -b` + `vite build` green after the TSX sweep
- [x] Second pass: `--measure-page: 680px`, `.prose-wide`, `.lede-wide`, `.page-body` switched to the token
- [x] `/philosophy` column 600 → 680px with body 20px/1.6 (79 chars/line, was 78 at 600px/18px)
- [x] `/about` §1 → `container-wide`; `.philosophy-grid` 3 columns matching `.expertise-grid`; `.page-body` wrapper removed from About + AboutPage; bio → `.prose-lede lede-wide`
- [x] Re-verified: `tsc -b` exit 0, `vite build` green; built CSS carries `.philosophy-grid{grid-template-columns:repeat(3,1fr)}`, the `@media (width<=1024px)` 2-column rule, and `.lede-wide,.page-body{max-width:var(--measure-page)}`
- [x] Third pass (user feedback): quote paragraphs justified — `.philosophy-quote p { text-align: justify }` — so the 680px column reads flush on both edges. Column width and measure are unchanged (680px @ 20px = 79 characters per line); only the line-breaking rule changed. `<html lang>` is kept in sync by `useLanguage`, so screen readers and hyphenation follow the active language.
- [ ] Manual browser pass (§7) on `/`, `/about`, `/experience`, `/projects`, `/projects/:id`, `/philosophy`, `/contact`, dark and light

## 7. Verification plan

1. `pnpm exec tsc -b` → exit 0 (the `Card` deletion must not leave an import behind).
2. `pnpm exec vite build --outDir dist-verify` → module count and CSS size; grep the built CSS for `--text-body`, `--measure-prose`, `.prose-lede`, and for the absence of `.card{`, `.form-input`, `.filter-pill`, `.article-card`, `.engineering-tab`, `.breadcrumb`, `.page-header`, `.container-narrow`.
3. Grep gate: `style=\{\{[^}]*(fontSize|lineHeight|fontWeight|color|maxWidth)` over `src/**/*.tsx` → zero matches; `grep "Card"` over `src/` → zero matches.
   Result: 538 modules, CSS 24.8 KB (5.37 KB gzip). Built CSS contains `--text-body`, `--measure-prose`, `.prose-lede`, `.prose`, `.page-body`, `.subheading`, `.project-section`, `.back-link`, `.section-cta`, `.link-label`, `.contact-link-sub`, `.achievement-impact`, `.achievement-metrics`, `.philosophy-quote`, `.download-resume-button`; zero hits for `.card{`, `card-elevated`, `card-featured`, `form-*`, `filter-*`, `article-*`, `engineering-tab*`, `breadcrumb*`, `page-header`, `container-narrow`, `--max-narrow`. `grep "Card"` over `src/` → 0 matches.

   oxlint against HEAD and against the working tree produce identical diagnostics (15 errors / 9 warnings): every one is pre-existing — oxlint treats the `useField` / `useFieldArray` helpers in `src/i18n/useField.ts` as hooks, plus `Navigation.tsx:26` `set-state-in-effect`. Out of scope here.
4. Manual, real browser (no headless, per project rule):
   - `/philosophy`: three paragraphs visibly separated, 680px column, 20px body, justified right edge (watch for rivers/loose word spacing), quote title 21px, no wall of text.
   - `/about`: §1 and §2 the same width (1152px); bio 20px at a 680px column; philosophy cards 3 columns (~368px) matching the expertise cards — 5 cards render 3 + 2.
   - `/projects/:id`: narrative capped at 600px, section cards keep their box, h4 16px over 15px body.
   - `/experience`: bullets and impact 15px/1.65, achievement title 18px/1.3.
   - `/contact`: sub-labels 15px, tile labels 500 weight.
   - Both themes, mobile ≤768px: prose column narrows to the viewport, ~40-60 characters per line.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Body copy 16 → 18px makes every page taller | Only role-defined body copy moved; chrome (tags, badges, pills, footer, timeline meta) kept at 12-14px. Review `/experience` and `/projects` heights. |
| Deleting `.form-*`, `.filter-*`, `.article-*`, `.engineering-tabs*`, `.breadcrumb*`, `.page-header`, `.card*` removes scaffolding that `spec-v2-blog.md` and `spec-v3-ui-enhancements.md` plan to use | Those specs keep the design intent; the CSS is re-written when the feature actually ships, together with its markup. Nothing in `src/` referenced them. |
| A 680px page column inside a 752px / 1152px container leaves whitespace on the right | Intentional: the measure band is 45-80 characters per line, and 680px @ 20px is 79. Widening the text further would need 22px body copy, which flattens the 21px heading scale. Grids and cards use the full container; text does not. On `/philosophy` the visible ragged edge is resolved by justifying the paragraphs instead of widening the column — the cost is looser word spacing / possible rivers on short lines, checked in the manual pass. |
| No responsive type scale | Unchanged from before (there was none). 18px on a 320-375px viewport yields 40-50 characters per line, which is comfortable; revisit only if the manual pass says otherwise. |
| `.prose li` at body size could look large in dense lists | Only `.prose` lists are affected; `.expertise-skills` and `.timeline-responsibilities` are outside `.prose` and stay at 15px. |

## 9. Open questions

1. **Wire Source Sans 3 later?** It is already shipped and used by the PDF, and gasatrya uses it. Cost: four `@font-face` rules, ~75 KB per weight, and its x-height is 0.486 em vs Segoe UI's 0.500 — the scale would need +1px to read the same. Deferred by user decision.
2. ~~**`.skip-link` orphan**~~ — closed. `strings.skipLink` no longer exists either: `grep -i skip` over `src/` → 0 matches, so there is no orphan left in either direction.
3. **`--leading-body` 1.65 vs the old 1.7** — 1.7 was applied only to `p`; 1.65 is now applied to body copy in every element role. Whether 1.6 or 1.7 reads better at 18px is a call for the manual pass.
