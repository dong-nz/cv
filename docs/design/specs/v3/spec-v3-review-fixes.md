# Specification — v3 Review Fixes

> **Document:** `spec-v3-review-fixes.md`
> **Version:** 0.1.0
> **Date:** 2026-10-18
> **Parent:** `spec.md`, `spec-v2.md`
> **Trigger:** full-project review 2026-10-18 (build, lint, source, data, docs, deploy config)
> **Owner decision:** bundles A, B, D, E, F approved; bundle C deferred; the uncommitted `src/data/projects.ts` title translation is kept and its callers are fixed.

---

## 1. Findings this spec closes

| # | Finding | Evidence | Bundle |
|---|---|---|---|
| 1 | Contact card labels are template placeholders | `src/components/sections/Contact.tsx:82` `@yourusername`, `:111` `Your Name`; `href` values are real (`profile.githubUrl` = `github.com/dong-nz`) | A |
| 2 | Project titles bypass the bilingual resolver | `Projects.tsx:52`, `ProjectsListPage.tsx:44`, `ProjectDetailPage.tsx:67` render `project.title` raw; `titleEn` is never read by the SPA, so the uncommitted Vietnamese `title` (`projects.ts:6`) shows in English mode | A |
| 3 | `useField` / `useFieldArray` are hooks called inside `.map()` callbacks | 11 `react/rules-of-hooks` errors; `pnpm lint` exits 1; `.gitea/workflows/deploy.yml` has no lint step | B |
| 4 | No SEO surface | `index.html:7` `<title>portfolio</title>`; no description/OG/canonical; no `robots.txt`; no `sitemap.xml`; `spec-v2-seo.md:67-72` 6/6 unchecked | D |
| 5 | Dead code, dead data model, dead assets | `FeaturedAchievement` with zero data; `ProjectSection.number` never rendered; `src/components/index.ts` with zero importers; `.animate-in`; `.download-resume-desktop` / `.download-resume-mobile`; `public/profile-photo.webp~` (1.2 MB, served 200); `public/icons.svg` unreferenced; `src/assets/*` unreferenced | E |
| 6 | Reduced motion and layout-shift gaps | `Typewriter.tsx` cycles text with plain React state (no `useReducedMotion`); `BackToTop.tsx:19` `behavior: "smooth"`; `Hero.tsx:136-140` `<img>` without intrinsic size (photo is 1200×1600 VP8X, 898 kB); single 458.58 kB JS chunk for 7 routes | F |
| 7 | Chrome strings hardcoded | `Navigation.tsx:60` `aria-label="Main navigation"`, `:146-147` theme toggle strings, `BackToTop.tsx:27` `aria-label="Scroll to top"` | F |

Recorded, not fixed here: the 7 `SectionHeading` call sites that pass `tag === title` (`About.tsx:24`, `Expertise.tsx:24`, `Experience.tsx:24`, `Projects.tsx:30`, `ProjectsListPage.tsx:29`, `PhilosophyPage.tsx:23`, `AboutPage.tsx:27-30` — regression introduced by `docs/feedback/i18n.md` §1). It is a visual decision, not a defect fix, and needs its own design pass.

---

## 2. Implementation details

### Bundle A — content and title i18n

1. `src/types/index.ts` — `Profile` gains `githubHandle: string` and `linkedinHandle: string`.
2. `src/data/profile.ts` — `githubHandle: "dong-nz"`, `linkedinHandle: "dong-nz"` (both accounts share the handle).
3. `src/components/sections/Contact.tsx` — `:82` `@yourusername` → `@{profile.githubHandle}`; `:111` `Your Name` → `@{profile.linkedinHandle}`.
4. `src/pages/ContactPage.tsx` — `:61` and `:81` already read `@dong-nz` but hardcoded in JSX → same `profile.*Handle` lookup, restoring the data-driven rule.
5. `src/components/sections/Projects.tsx:52`, `src/pages/ProjectsListPage.tsx:44`, `src/pages/ProjectDetailPage.tsx:67` — `project.title` → `field(lang, project.title, project.titleEn)` (helper from Bundle B).
6. `src/data/projects.ts` — delete `githubUrl: "https://github.com/yourusername"` (`:17`); `src/types/index.ts` — delete `Project.githubUrl` / `Project.demoUrl` (`:26-27`), which no surface renders.

Edge cases: a project without `titleEn` still resolves to `title`; `field` returns the VI value for `lang === 'vi'` and `valueEn ?? value` otherwise, matching the previous `useField` semantics exactly.

### Bundle B — pure field helpers

1. `src/i18n/useField.ts` → replaced by `src/i18n/field.ts`, exporting one plain function `field<T>(lang, value, valueEn): T` returning `lang === 'vi' ? value : (valueEn ?? value)`. No `fieldArray`: every call site, scalar or array, needs the same lockstep rule, so one function covers both and there is no second convention to keep in sync.
2. Every component reads `const { lang } = useLanguage()` once at the top level and calls `field(...)` inside `.map()` callbacks. Call sites updated: `Hero.tsx`, `About.tsx`, `Expertise.tsx`, `Experience.tsx`, `Projects.tsx`, `AboutPage.tsx`, `ExperiencePage.tsx`, `ProjectsListPage.tsx`, `ProjectDetailPage.tsx`.
3. `ProjectDetailPage.tsx` — the `if (!project) return …` early exit at `:27-44` no longer straddles a hook, so hook order is stable across a valid ↔ invalid `:id` navigation.
4. `src/hooks/useTheme.tsx:45-47` — delete `resolveTheme()`, an identity helper left from the removed `system` variant; `resolvedTheme` becomes `theme` directly.

Gate: `pnpm lint` reports 0 `react/rules-of-hooks` errors.

### Bundle D — SEO

1. `index.html` — real `<title>`, `meta description`, `meta robots`, Open Graph (`og:title`, `og:description`, `og:type=website`, `og:image=/profile-photo.webp`, `og:image:alt`, `og:locale=en_US`, `og:locale:alternate=vi_VN`), `twitter:card=summary_large_image`, `link rel=canonical`, `<meta name=theme-color>` for both themes, and `og:site_name`.
2. `src/data/site.ts` (new) — `siteUrl = 'https://cv.vugado.com'`, `siteName`. Route lists stay where they already live (`navPaths` in `src/data/navigation.ts`, the project list in `src/data/projects.ts`); the sitemap script reads them instead of a duplicated array.
3. `public/robots.txt` (new) — allow all, `Sitemap:` line pointing at the canonical origin.
4. `scripts/generate-sitemap.ts` (new) + `pnpm sitemap` script — writes `dist/sitemap.xml` from `src/data/site.ts`, `navPaths` and `src/data/projects.ts`: one entry per static route plus one per `/projects/{id}`. `pnpm build` chains it (`tsc -b && vite build && pnpm tsx scripts/generate-sitemap.ts`), so `dist/` is complete before anything uploads it and `.gitea/workflows/deploy.yml` needs no new step.
5. JSON-LD `Person` block in `index.html` (`name`, `jobTitle`, `email`, `url`, `sameAs` GitHub/LinkedIn) — static, no prerender needed.

Edge cases: the script fails loudly if `dist/` is missing, and fails if `dist/index.html` no longer contains `siteUrl` — `index.html` cannot import TypeScript, so the canonical origin is written twice by hand and that assertion is what turns a silent drift between the two into a build failure. Re-running overwrites the file.

### Bundle E — dead code and assets

1. Delete `public/profile-photo.webp~` (1.2 MB tracked, served 200 — verified by HTTP probe), `public/icons.svg` (no reference in any file), `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg` (no import anywhere), `src/components/index.ts` (14 exports, 0 importers).
2. `src/index.css` — delete `@keyframes fadeInUp` and `.animate-in` (`:354-369`); motion owns all entrance animation.
3. `src/App.css` — delete the `.download-resume-desktop` and `.download-resume-mobile` selectors, keeping the `.hero-download-desktop` / `.hero-download-mobile` rules that `Hero.tsx:108,112` actually uses.
4. `src/i18n/strings.ts` — delete `hero.downloadResume`, `philosophy.categories`, `philosophy.comingSoon`, `common.backTo` (no reference; `resumeLanguageLabels` in `src/data/resume.ts` is the live label source).
5. `src/types/index.ts` — delete `FeaturedAchievement` (`:57-69`) and `ExperienceEntry.achievements` (`:53`); `scripts/generate-resume.ts:100-115` — delete the achievements render block. No data uses either: `achievements` appears zero times in `src/data/`.
6. `src/types/index.ts` — delete `ProjectSection.number` (`:32`) and the 16 `number:` entries in `src/data/projects.ts`; nothing renders them, and their values already skip 3 and 6.
7. `src/types/index.ts` — delete `Profile.resumeUrl` (`:99`); resume URLs come from `resumeUrlFor()` in `src/data/resume.ts`.

### Bundle F — accessibility and performance

1. `src/components/ui/Typewriter.tsx` — `useReducedMotion()` from `motion/react`; when reduced motion is on, render the first role statically with no typing loop and no timer. Cursor `<span>` becomes `aria-hidden="true"`, and the animated text is wrapped so screen readers see the full role list instead of one keystroke at a time.
2. `src/components/ui/BackToTop.tsx` — `behavior: reducedMotion ? 'auto' : 'smooth'`; `aria-label` from `strings.common.backToTop`.
3. `src/components/sections/Hero.tsx` — `width="1200" height="1600"` on the hero `<img>` (VP8X canvas measured from `public/profile-photo.webp`); `.hero-photo { max-width: 60%; height: auto }` keeps the box, the attributes reserve the 3:4 ratio before the 898 kB image decodes.
4. `src/App.tsx` — `HomePage` stays eagerly imported (it is the landing route and owns the LCP; lazy-loading it would add a chunk round-trip before first paint). The other six pages move to `React.lazy` inside one `<Suspense fallback={null}>` boundary in `Layout`. Pages export named components, so each factory maps the named export to `default`: `import('@/pages/XPage').then((m) => ({ default: m.XPage }))`. `fallback={null}` because the shell (nav, footer) is already painted and a placeholder box would shift the page when the chunk lands.
5. `src/i18n/strings.ts` — new `strings.nav.mainNav`, `strings.nav.themeSwitch` (the action), `strings.nav.themeMode` (the current value label), `strings.common.backToTop`; `Navigation.tsx:60,146,147` and `BackToTop.tsx:31` use them.

### Fixes found while implementing

1. `src/components/sections/About.tsx:44,45` and `src/pages/AboutPage.tsx:51,52` — the philosophy cards read `point.title` / `point.description` straight through, bypassing the resolver like the project titles did; now `field(lang, point.title, point.titleEn)` and `field(lang, point.description, point.descriptionEn)`.
2. `src/pages/ContactPage.tsx:61,81` — the standalone Contact page hardcoded `@dong-nz` in JSX where the homepage section already interpolated it; both now read `profile.githubHandle` / `profile.linkedinHandle`.
3. `src/pages/index.ts` — deleted. `App.tsx` was its only importer, and the lazy factories import each page module directly, so the barrel would have kept every page in the entry chunk.

---

## 3. Affected files

| File | Action |
|---|---|
| `src/types/index.ts` | edit: `+Profile.githubHandle/linkedinHandle`; `−Project.githubUrl/demoUrl`, `−ProjectSection.number`, `−FeaturedAchievement`, `−ExperienceEntry.achievements`, `−Profile.resumeUrl` |
| `src/data/profile.ts` | edit: `+githubHandle`, `+linkedinHandle` |
| `src/data/projects.ts` | edit: `−githubUrl`, `−number` × 16 |
| `src/data/site.ts` | new: `siteUrl`, `siteName` |
| `src/i18n/field.ts` | new: `field` |
| `src/i18n/useField.ts` | delete |
| `src/i18n/strings.ts` | edit: `+nav.mainNav/themeSwitch/themeMode`, `+common.backToTop`; `−hero.downloadResume`, `−philosophy.categories`, `−philosophy.comingSoon`, `−common.backTo` |
| `src/components/sections/Contact.tsx` | edit `:82,111` |
| `src/components/sections/Projects.tsx` | edit `:52,57` |
| `src/components/sections/Hero.tsx` | edit `:74,91`, `:136-140` |
| `src/components/sections/About.tsx` | edit: helper import/call |
| `src/components/sections/Expertise.tsx` | edit `:37` |
| `src/components/sections/Experience.tsx` | edit `:39,50` |
| `src/components/layout/Navigation.tsx` | edit `:60,146,147` |
| `src/components/ui/BackToTop.tsx` | edit `:19,27` |
| `src/components/ui/Typewriter.tsx` | edit: reduced-motion branch |
| `src/components/index.ts` | delete |
| `src/pages/AboutPage.tsx` | edit `:33,51,52` |
| `src/pages/ContactPage.tsx` | edit `:61,81` |
| `src/pages/ExperiencePage.tsx` | edit `:37,45` |
| `src/pages/ProjectDetailPage.tsx` | edit `:67,78,143,144` |
| `src/pages/ProjectsListPage.tsx` | edit `:44,49` |
| `src/hooks/useTheme.tsx` | edit: `−resolveTheme` |
| `src/App.tsx` | edit: lazy routes + Suspense |
| `src/App.css` | edit: `−.download-resume-desktop`, `−.download-resume-mobile` |
| `src/index.css` | edit `:354-369` (`−fadeInUp`, `−.animate-in`), `+.sr-only` after `.section` |
| `index.html` | edit: SEO head + JSON-LD |
| `public/robots.txt` | new |
| `scripts/generate-sitemap.ts` | new |
| `scripts/generate-resume.ts` | edit: `−:100-115` |
| `package.json` | edit: `+sitemap` script, `build` chains it |
| `.gitea/workflows/deploy.yml` | unchanged — the sitemap is already inside the `dist/` artifact the workflow uploads |
| `public/profile-photo.webp~`, `public/icons.svg`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/pages/index.ts` | delete |
| `AGENTS.md` | edit: drop the barrel from Component Structure, add the v3 spec row, add `site.ts` to the data layer list |
| `docs/design/specs/v2/spec-v2-seo.md` | edit: acceptance checkboxes |

---

## 4. Out of scope, recorded

| Item | State | Note |
|---|---|---|
| Bundle C — `location = /resume.pdf { try_files $uri =404; }` | Deferred by owner decision | Measured on the current build: `GET /resume.pdf` → `200 text/html 1223 bytes` on `vite preview`; `nginx.conf:11-13` `try_files … /index.html` reproduces it in production. `resumeAvailable` is `true` while `pnpm build` produces no PDF |
| `tag === title` in 7 `SectionHeading` call sites | Needs its own design pass | Visual decision, not a defect |
| `skills.ts` titles untranslated (6/6 identical), `projects.ts` titles 19/20 identical, `role` / `technologies` / `metrics` / `duration` / `company` without a second language | Content work | The plumbing is correct; the data is missing |
| Zero tests, CI with no lint or test step | Open | `spec-v2-testing.md` unimplemented |
| `README.md:1-31` Vite template text and the public VPS host + SSH port (`:56,62`) | Open | Repo hygiene / exposure decision for the owner |
| `docker-compose.yaml` has no `ports:` | Open | Contradicts AGENTS.md "local nginx deployment" |
| `spec-v2.md:27` reference to the non-existent `spec-v2-hero-carousel.md` | CLOSED 2026-10-18 | Marked in place: the spec file was never written and the feature was not built |
| `spec-v2.md:41` listing i18n as out of scope, and blank status cells for the Playwright PDF and SEO rows | CLOSED 2026-10-18 | `spec-v2.md` now points at `spec-v3-i18n.md` for i18n, marks the Playwright generator shipped (with bundle C recorded as the open serving gap) and marks SEO partial |

---

## 5. Progress tracking

| Item | Status |
|---|---|
| Spec written with Implementation Details / Affected Files / Progress Tracking | DONE 2026-10-18 |
| Bundle A — profile handles, Contact + ContactPage labels, title through `field`, placeholder removal | DONE 2026-10-18 |
| Bundle B — `field` helper, 14 call sites, `resolveTheme` removal | DONE 2026-10-18 |
| Bundle D — SEO head, `robots.txt`, sitemap script chained into `pnpm build` | DONE 2026-10-18 |
| Bundle E — dead code, dead data model, dead assets | DONE 2026-10-18 |
| Bundle F — reduced motion, intrinsic image size, lazy routes, chrome strings | DONE 2026-10-18 |
| `pnpm lint` | DONE — 0 errors |
| `pnpm build` (typecheck + bundle + sitemap) | DONE — see §5.1 |
| Owner browser pass (repo rule §5) | TODO |
| Commit decision (repo rule §6) | DONE 2026-10-18 — six per-bundle commits, see §5.2; push not authorised |

### 5.1 Gate results

| Gate | Result |
|---|---|
| `pnpm lint` before | exit 1 — 11 errors (`react/rules-of-hooks` in the `useField` call sites) + 4 warnings |
| `pnpm lint` after | exit 0 — 0 errors, 4 warnings |
| Remaining warnings | `src/hooks/useLanguage.tsx:57:17` and `src/hooks/useTheme.tsx:84:17` (`only-export-components`: each provider file exports its hook alongside its component); `src/components/layout/Footer.tsx:9:16` (`purity`: `new Date().getFullYear()` evaluated during render); `src/components/ui/Typewriter.tsx:31:7` (`set-state-in-effect`: the typing loop advances state from inside its own effect). All four pre-date this spec except the Typewriter one, which is the loop's existing shape — left as-is rather than rewriting the animation and changing its observable timing. |
| `pnpm build` | pass — 543 modules transformed, 125 ms, `sitemap.xml generated at … (10 urls)` |
| Entry JS chunk | 458.58 kB → 447.34 kB (gzip 142.57 → 142.12 kB) |
| New route chunks | `PhilosophyPage` 0.92, `ProjectsListPage` 1.37, `ExperiencePage` 1.73, `AboutPage` 2.29, `ProjectDetailPage` 3.02, `ContactPage` 3.52 kB |
| Honest read | the entry chunk is still dominated by `motion` plus the six homepage sections that `HomePage` imports eagerly. Route splitting moved the six secondary routes out; it did not shrink the first paint. A real entry-chunk reduction needs a separate decision about `motion`, not another lazy import. |
| CSS | `dist/assets/index-*.css` 33.55 kB (gzip 6.75 kB) |
| `dist/sitemap.xml` | 1148 bytes, 10 `<loc>` — 6 `navPaths` + 4 `/projects/{id}`, each with `lastmod` |
| HTTP probe (`vite preview`) | `/robots.txt` 200 `text/plain`; `/sitemap.xml` 200 `text/xml`, body starts `https://cv.vugado.com/` with `<lastmod>2026-10-18</lastmod>`; `/` serves `<title>Nguyễn Đông — Senior Software Engineer</title>`, `og:title`, `rel=canonical`, `application/ld+json`, `theme-color` |
| `dist/` listing | `index.html`, `assets/`, `fonts/`, `favicon.svg`, `profile-photo.webp`, `resume-template.html`, `robots.txt`, `sitemap.xml` — no `profile-photo.webp~`, no `icons.svg` |
| `field()` precedence | `field('en', 'Tích hợp hệ thống IoT-DWS', 'IoT-DWS Integration System')` → English title; `field('vi', …)` → Vietnamese; `field('en', vi, undefined)` → Vietnamese fallback. `'number' in project` is `false` for all four projects |
| Not verified here | anything a real browser must judge (repo rule §5): hero photo box and LCP, reduced-motion typewriter, back-to-top label and scroll behaviour, contact handles on screen, EN/VI project titles |

### 5.2 Commit record

Owner chose per-bundle commits. Six commits, ordered so each one builds on its own: a type field, the data that fills it and the script that reads it must vanish in the same commit (`src/types/index.ts` ↔ `src/data/projects.ts` ↔ `scripts/generate-resume.ts`), a string key travels with its consumers, and `src/i18n/field.ts` travels with every former `useField` importer — otherwise that commit references a module it no longer contains.

| Commit | Bundle | Contents |
|---|---|---|
| `29a884f fix(i18n): resolve bilingual data through a pure field() helper` | B | `+field.ts`, `−useField.ts`, the 9 former hook call sites, `resolveTheme` removal |
| `58e45bb fix(contact): drive social handles and project titles from data` | A | `profile.ts` handles, `Contact.tsx`, `ContactPage.tsx`, title resolver, `−githubUrl` placeholder plus `Project.githubUrl`/`demoUrl` |
| `a5a7eb6 chore: delete dead code, dead data model and unused assets` | E | 5 files deleted, `ProjectSection.number` (type + 16 data entries), `FeaturedAchievement` / `achievements` + the resume-script block, `Profile.resumeUrl`, dead CSS, 4 dead string keys |
| `0c4aea3 feat(seo): real metadata, JSON-LD, robots.txt and a build-time sitemap` | D | `index.html` head + JSON-LD, `site.ts`, `robots.txt`, `generate-sitemap.ts`, `package.json` |
| `63afc1b fix(a11y): reduced motion, screen-reader text and route-level splitting` | F | `Typewriter`, `BackToTop`, `Navigation`, `App.tsx` + `Suspense`, hero intrinsic size, `+.sr-only`, 4 new string keys, `−src/pages/index.ts` |
| docs commit | — | this spec, `AGENTS.md`, `spec-v2.md`, `spec-v2-seo.md` |

Five files carry changes for two bundles, so they were split by hunk rather than assigned whole: `Hero.tsx` (helper swap in B, intrinsic image size in F), `src/data/projects.ts` (title + `githubUrl` in A, the 16 `number` entries in E), `src/types/index.ts` (URL pair in A, `number` / `FeaturedAchievement` / `resumeUrl` in E), `src/i18n/strings.ts` (4 dead keys in E, 4 new keys in F), `src/index.css` (dead keyframes in E, `.sr-only` in F).
