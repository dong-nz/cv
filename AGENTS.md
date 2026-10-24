# Agent Guidelines — portfolio

## Project

Personal engineering portfolio — multi-page SPA built with React + TypeScript + Vite. Data-driven content from JSON structure documents (`src/data/*.json`) and per-language dictionaries (`src/i18n/locales/`), styled with CSS variables supporting dark/light themes. Motion animations via `motion/react`. Bilingual resume generation (EN/VI).

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 |
| Language | TypeScript 6 (bundler mode, `verbatimModuleSyntax`, `noEmit`) |
| Bundler | Vite 8 |
| Router | React Router v8 (`react-router` package, pinned `8.4.0`) |
| Animation | motion ^14.0.0 (`motion/react` ESM entrypoint) |
| Linter | Oxlint 1 (`plugins: react, typescript, oxc`) |
| Resume generation | playwright ^1.64.0, tsx ^4.23.15 |
| Package manager | pnpm |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Type-check (`tsc -b`), build for production (the site-identity plugin fills `%SITE_URL%` / `%SITE_NAME%` in `index.html`), then generate `dist/sitemap.xml` + `dist/robots.txt` |
| `pnpm build:resume` | Generate resume PDF (default EN) via Playwright |
| `pnpm build:resume-all` | Generate bilingual resume PDFs (EN + VI) |
| `pnpm lint` | Run Oxlint |
| `pnpm validate:content` | Validate the content dictionaries against the structure documents and the page manifests (also run by the loader at module load) |
| `pnpm generate:ids` | Regenerate `src/types/content-ids.ts` from the structure documents (also run by `predev` / `prebuild` / `prepare`) |
| `pnpm sitemap` | Regenerate `dist/sitemap.xml` + `dist/robots.txt` on its own (also run by `pnpm build`) |
| `pnpm preview` | Preview production build locally |

## Routing

- `App.tsx` wraps `<BrowserRouter>` → `<Layout>` → `<Routes>` (NOT nested `<Route element>` — causes `children` not to pass)
- Layout: `<Navigation>` (top) → `<main id="main-content">` → `<Footer>` (bottom)
- All internal navigation MUST use `<Link>`/`<NavLink>`, never `<a href>` (causes full page reload)
- Footer internal links also use `<Link>`; external links (GitHub, LinkedIn, email) keep `<a>` with `target="_blank"`
- Route-level splitting: `HomePage` is imported eagerly because it owns the LCP; the other six pages load through `React.lazy` inside one `<Suspense fallback={null}>` boundary in `App.tsx`. Pages export named components, so each factory maps the named export to `default`

## Pages

| Route | Component | Section |
|-------|-----------|---------|
| `/` | `HomePage` | Hero + About + Expertise + Experience + Projects + Contact |
| `/about` | `AboutPage` | Full about section |
| `/experience` | `ExperiencePage` | Timeline |
| `/projects` | `ProjectsListPage` | All projects grid |
| `/projects/:id` | `ProjectDetailPage` | Single project |
| `/contact` | `ContactPage` | Contact info |
| `/philosophy` | `PhilosophyPage` | Engineering philosophy |

## Theming

- Two independent axes on `<html>`: lightness (`Theme`) and color (`Palette`), both written during render before paint
- `src/hooks/useTheme.tsx` — `ThemeProvider` + `useTheme` hook, carries both axes
- Simple toggle: `'dark'` ↔ `'light'` (no `system` variant); `resolvedTheme` — runtime resolved value (always `'dark'` or `'light'`)
- `data-theme` attribute + `localStorage` key `portfolio-theme`
- `type Palette = 'red' | 'blue'` (`src/types/index.ts`), labels/hints in `src/data/palettes.ts` (`paletteIds`, `paletteMeta`); default `red`
- `data-palette` attribute + `localStorage` key `portfolio-palette`; `index.html`'s init script writes both attributes before paint
- Palette overrides in `src/index.css` are `:root[data-theme='dark'][data-palette='blue']` / `:root[data-theme='light'][data-palette='blue']` (specificity 0,3,0 — they beat the base blocks regardless of order); no blue variant exists in the `prefers-color-scheme` bridge, because the init script always writes `data-palette`
- Accent has two tiers: `--accent` / `--accent-hover` / `--accent-active` are the bright signal colours (links, underlines, borders, glows) and the fill of the pale accent surfaces (palette-option hover, `.tag-accent`, `.back-to-top`, resume summary bar); `--accent-solid` / `-hover` / `-active` plus `--text-on-accent-solid` are the deeper fill and light text used by `.btn-primary` and `.badge-accent`, which is what lets a dark-mode button carry light text. The solid family is declared in all five blocks of `src/index.css` (dark red, light red, dark blue, light blue, the `prefers-color-scheme` bridge); the two light blocks duplicate the plain accent values verbatim, so light mode does not move. Spec: `docs/design/specs/v3/spec-v3-nav-cta-enhancements.md`
- Picker, two renderings, both present at every width: the bar uses `src/components/layout/ThemePaletteMenu.tsx` — icon-only trigger (`nav-control nav-palette-trigger`, a 20px half-circle swatch: active palette's accent on the left, `--swatch-empty` on the right; no text, no chevron; the name lives in `aria-label`, the hint in `title`) opening the `#palette-menu` panel. The sheet renders its own Theme color row inside `MobileMenu.tsx` from `paletteIds` + `paletteMeta` as `.mobile-menu-icon-option` buttons — the 44px icon-only square the Language row shares; the Mode row renders the same squares with the bar's own mode line art — `MoonIcon` for dark, `SunIcon` for light, both from `src/components/ui/icons.tsx` and shared with the bar's theme control — each option naming its mode in `aria-label`/`title`. `ThemePaletteMenu` has no `variant` prop and is never mounted in the sheet
- Preview chips are theme-aware: `--preview-red-accent` / `--preview-blue-accent` are declared per theme — `:root` dark pair, `:root[data-theme='light']` light pair, repeated in the `prefers-color-scheme` bridge — and mirror that block's `--accent`, so a submenu dot and the bar swatch's accent half are the same colour in the same theme. Each chip names its own palette through `data-preview`, so the two `[data-palette='blue']` blocks declare no preview token; `--swatch-empty` stays one constant. Spec: `docs/design/specs/v3/spec-v3-nav-swatch-and-hamburger.md`
- Bar controls share one chrome: `.nav-control` covers the language toggle, the mode toggle and the palette trigger (44px bordered box, accent border + icon on hover/open, one `:focus-visible`). The hamburger leads the bar at every width it appears: `.nav-brand` (`display: flex; gap: 4px` — its icons carry no borders, so the spacing reads between glyphs: 4px between 44px targets is 24px between the 24px glyphs, a tight brand cluster while hover fills and 2px-offset focus rings stay clear) holds it first and the brand home icon right after, at the bar's left edge — `.nav-logo` is a 24px stroke house in a 44px target, a `<Link to="/">` named by the translated `nav.home` label (UI dictionary, via `useI18n()`) with the svg `aria-hidden`, so it carries its own `:focus-visible` ring. Third in the brand group is the resume entry — `src/components/layout/ResumeNavButton.tsx`, a `nav-control nav-resume-trigger` 44px target that **carries no border** (`border-color: transparent` at rest, on hover and while open, because it sits beside the borderless home icon; the hover fill and the `:focus-visible` ring stay; its glyph is `--accent` at every state — rest, hover, open — so the entry always carries the active theme's signal colour and follows the palette switch), holding `ResumeIcon size={24}` — the same 24px the home glyph beside it uses, so the two brand icons share a size inside their 44px targets — the resume document glyph, the owner's 30-grid CV artwork adapted to the bar's 24-grid (spec follow-up 19), inlined in `src/components/ui/icons.tsx` because the bar icon must inherit the control's colour — an `<img>` resolves `currentColor` to black and cannot follow the theme: a page outline split on the left edge by a visible dash (`M14 2 H6 a2 2 0 0 0 -2 2 V6` + `M4 10 V12` + `M4 16 v4 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 V8 L14 2`; 4px endpoint gaps stay open under 2px round caps), a folded corner (`M14 2 v4 a2 2 0 0 0 2 2 h4`), and stroked CV lettering replacing the content lines (`M9.5 12 A3 3 0 0 0 9.5 18` + `M12.5 12 L15 18 L17.5 12`), in the bar's 2px stroke language; at 1:1 the strokes are exactly 2px and the lettering reads clearly in both themes. Named by the UI dictionary's `nav.resume`, `aria-haspopup="dialog"` on its own `#resume-modal-nav`; `.nav-resume` is the wrapper that ties trigger to dialog and is what `useClickOutside` watches. `.nav-actions` then carries the three appearance controls in that order (language, mode, theme color) at the right end, their bordered boxes keeping the 16px gap. The sheet's Appearance group follows the same order (Language row, Mode row, Theme color row). Six controls now share the bar at ≤1024px: `@media (max-width: 420px)` keeps 16px padding and drops only the action gap to 8px — the brand group stays at 4px at every width — `@media (max-width: 360px)` drops the padding to 12px — 40 + 44×5 = 260px of controls plus 2×4px brand gaps plus 2×8px action gaps = 284px inside 296px, and every target stays 44px
- Language control is icon-only in both renderings — `src/components/ui/LanguageIcon.tsx` draws both languages as line art in the bar's stroke language (`currentColor`, no fills): English a 20px globe (circle r=10 + equator + meridian ellipse, 2px round joins, so it follows the control's hover accent), Tiếng Việt a flag outline (21×17.5 band `rx=2` at 1.5/3.25 — drawn 23×19.5 against the globe's 22×22; width is already at the limit, so the size step came from height, which drags the constitutional 2:3 to 1.2 — with a centred five-point mullet at r=3.6, deliberately smaller than the flag's own 0.6 × height construction, stroked 1.5px round joins so its interior stays open). The bar's `nav-control lang-toggle` shows the language it switches TO (`lang === 'en' ? 'vi' : 'en'`): translated action in `aria-label`, the target's own-language name in `title`. `.lang-toggle` now carries no CSS rules of its own — it marks the button in the DOM and nothing else. The sheet's Language row uses `.mobile-menu-icon-option` squares with `aria-pressed` and the own-language `aria-label` / `title`. Spec: `docs/design/specs/v3/spec-v3-i18n.md`

## Data Layer

Content is split once, at authoring time, into language-neutral **structure documents**, per-language **text/UI dictionaries** — one file per entity (`content/{entity}.json`) and per feature group (`ui/{group}.json`) — and per-route **field manifests** (`src/data/pages/`), joined once at load (spec: `docs/design/specs/v4/spec-v4-live-edit.md` + `spec-v4-data-organization.md`).

- `src/data/profile.json` + `profile.ts` loader — links, social handles (`githubHandle`, `linkedinHandle`, `telegramHandle`), messaging URLs (`telegramUrl`), `firstName`/`lastName`, the ordered philosophy id list — the Contact cards render `@{c.profile.githubHandle}`, never a literal; name / title / tagline / bio / about-subtitle / career TL;DR / interests / roles / philosophy quotes + keywords are text, so they live in the content dictionaries
- `src/data/skills.json` + `skills.ts` loader — skill groups: `{id, skills}`; group titles are text
- `src/data/experience.json` + `experience.ts` loader — work history: id / location / logo / optional `variant: 'current' | 'gap'` (timeline decoration: live node / career break); company, duration, titles and responsibilities are text — the VI document carries localized dates ("11/2026 – nay") and company labels, en overrides with the originals, proper nouns identical per language
- `src/data/projects.json` + `projects.ts` loader — cards: category / technologies / featured / `sections[].{id, type}`; titles, summaries, role, metrics and section prose are text (role follows the owner's EN title convention; metrics are localized)
- `src/i18n/locales/{vi,en}/content/{profile,skills,experience,projects}.json` — all content text, one file per entity, keyed by the structure ids; the `profile` record is fixed-keyed (`name`, `title`, `bio`, `subtitle`, `tldr`, `tagline`, `currentInterests`, `roles`, `philosophyQuotes`, `philosophy.<id>.{title, description, keywords}`); `src/i18n/locales/{vi,en}/ui/{group}.json` — 14 chrome groups (`navigation`, `footer`, `social`, `hero`, `about`, `expertise`, `experience`, `projects`, `projectDetail`, `contact`, `philosophy`, `resume`, `edit`, `common`), in each language (nav group labels, Mode options, language names `langEn` / `langVi`, action labels, social `aria-label`s, the resume's section labels, edit-mode labels) — person text never lives here; `src/i18n/index.ts` merges both trees back into the same `UI`/`CONTENT` records and asserts the merge against the group lists — a group dropped in the split is a load-time error, never a silent omission
- Content ids and the category values a project uses are **generated**, never hand-maintained (spec: `docs/design/specs/v5/spec-v5-generated-content-ids.md`): `scripts/generate-content-types.ts` reads the four structure documents and writes `src/types/content-ids.ts` (gitignored) under `predev` / `prebuild` / `prepare`; `src/types/index.ts` re-exports those unions type-only and keeps only the code-owned ones (`Language`, `Palette`, `SocialId`, `PageId`, manifest types). A content add or delete touches JSON only — a text entry left behind by a deleted record is a `tsc` error (`TS2741`), never a stale union member — and a category with no label in either language is a validator error naming both `ui/projects.json` files (rule 7)
- `src/data/pages/{home,about,experience,projects,project-detail,contact,philosophy,resume}.json` + `pages.ts` loader — per-route manifests: which entity fields the page renders (`fields[]`; `*` = every field the record id owns) and which UI groups it reads; `src/types/index.ts` carries `PageId` / `PageManifestClaim` / `PageManifest`. The validator enforces: no unknown entity, no unknown UI group, no unresolvable field path, **no orphan text field** (every text leaf in the content documents is claimed by at least one manifest), no missing manifest for a route in `src/data/navigation.ts` plus `/projects/:id`
- `src/i18n/index.ts` — load + validate + join ONCE at module load; exports `UI` and `CONTENT` as `Record<Language, Resolved…>`; `src/i18n/dict-types.ts` carries the document types; `src/i18n/validate.ts` + `scripts/validate-content.ts` enforce the cross-document rules (orphan or missing keys, HTML markup in text values, the manifest rules above) — a malformed document fails `pnpm build`, CI, and the browser load, never a silent half-render
- `src/i18n/provider.tsx` — `I18nProvider` wraps the app; components consume `const { ui: s, content: c } = useI18n()`: `s` is the chrome of the current language, `c` the joined records (`c.profile`, `c.skillGroups`, `c.experiences`, `c.projects`). There is no `field()` and no `*En` field pair anymore
- Translation is a JSON edit, never a component edit; a new language is a new locale directory plus one `Language` union member
- `src/data/resume.ts` — resume availability, supported languages, URL generation, and `resumeQr` (the `{id, file, label}` descriptors the resume header renders as QR codes)
- `src/data/navigation.ts` — `navPaths` (bar + sheet order: Home, About, Experience, Projects, Contact, Philosophy), `footerPaths`
- `src/data/social.ts` — social tiles as `{id, href, external}` (github, linkedin, email, telegram); `email` is a `mailto:` link with `external: false`, so it renders no `target`/`rel`
- `src/data/palettes.ts`, `src/data/site.ts` — code config, not content: `siteUrl` (the canonical origin) and `siteName` are read from the environment (`SITE_URL` / `SITE_NAME` — CI variables in production, the uncommitted local `.env` in development; unset → the build fails with an error naming the variable); every absolute URL the site publishes — canonical, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml` — derives from it

## Live Edit Mode (`?edit`, v4)

- Entry: any route with `?edit` — `MaybeEditMode` in `App.tsx` lazy-mounts `EditModeShell` (its own chunk; visitors never load edit code). The shell authenticates, fetches the live master documents through the proxy, and re-wraps the tree in an `I18nProvider` override — the seven routes ARE the preview
- Target branch (spec D10): `?edit=<branch>` reads (`?ref=`) and writes (`branch` in the PUT body) that branch; a bare `?edit` resumes the session's last branch, default `master`. Names are validated against git ref rules in `src/i18n/edit-mode.ts` before any request (illegal → exit like a failed auth); the branch is stored beside the session flag. The target branch must already exist — Contents API updates never create branches. Only `master` deploys, so the EditBar shows a merge hint on other branches
- Auth: HTTP Basic at the nginx `/api/content/` proxy is the security boundary; `src/i18n/edit-mode.ts` probes it through a hidden iframe, keeps the session flag `portfolio-edit` in sessionStorage, and strips `?edit` when the probe fails (401 or cancelled prompt → normal visitor site)
- `src/i18n/draft.ts` — `DraftStore`: baselines (`data` + blob `sha`) of the 12 writable documents (4 structure + 8 text), copy-on-write draft, leaf-path diff, cross-document validation on every accepted edit, three-way rebase on save conflicts (Gitea 28 reports a blob-sha mismatch as 422 with a "does not match" message; older deployments answered 412 — both are handled; origin / base / working kept separate), draft persisted to sessionStorage `portfolio-draft`, sequential-PUT save (one commit per touched document, resume from the first unwritten one on failure). Edit mode writes JSON only: the id-union leg was deleted when spec-v5 made the unions generated, and the store is handed the branch's category labels (read-only `ui/projects.json` fetches) for rule 7 — `null` when they cannot be read, in which case the rule is skipped and the EditBar says so
- `src/components/ui/EditableText.tsx` — the site's own element (`as` = the tag or motion component it renders today) becomes the inline editor only in edit mode; commit on blur only (Vietnamese IME-safe), Esc cancels, Enter commits single-line fields, paste is plain-text, empty required values are rejected at commit; without an `EditContext` provider it renders byte-identical markup to the plain element
- `src/components/layout/EditBar.tsx` — fixed save bar: per-path diff with revert and "appears on" page annotations (computed from the page manifests via `manifestsClaiming`, never from component code), conflict resolution (rebase / take-theirs / per-field keep-mine–keep-theirs), per-document save status, partial-save resume, exit confirm
- Editable surface: content text inline (pencil-triggered, click never edits) **and** structure — chip-level tag editors for every tag array (`technologies`, `metrics`, `skills`, `interests`, `roles`, `keywords`, `responsibilities`, quote details, tagline segments), ghost add/delete/move on every record surface, per-record settings popover (`featured`, the project `category` picker, project section list + type picker, `variant`, location, logo), ids auto-generated from title slugs, social links handle-only with URLs derived in the loaders. Implemented 2026-10-23 (`spec-v4-inline-editing.md` + `spec-v4-data-organization.md`); the JSON panel is deleted. UI documents stay read-only in v4. `category` is a single structure value, not a chip list: the picker offers exactly the label map of `ui/projects.json` — the vocabulary rule 7 checks a project against — so a category with no label in both languages cannot be chosen from the UI; a brand-new category means adding its labels in the repository first. Field provenance: hovering any pencil shows `document → pointer` (`describeField()` names the per-entity file automatically); the EditBar diff line and a `validate:content` error for the same field read identically
- Dev parity: `vite.config.ts` builds the `/api/content/` dev proxy from the same `GITEA_CONTENTS_API` value production nginx renders — run `pnpm dev` with `GITEA_TOKEN` + `GITEA_CONTENTS_API` set (local `.env`); without them edit mode falls to the offline state (bundled content, save disabled)
- Spec: `docs/design/specs/v4/spec-v4-live-edit.md` §5–§6

## Component Structure

```
src/
  components/
    layout/     — Layout.tsx, Navigation.tsx, MobileMenu.tsx, Footer.tsx, ThemePaletteMenu.tsx, ResumeNavButton.tsx, EditModeShell.tsx, EditBar.tsx
    sections/   — Hero, About, Expertise, Experience, Projects, Contact, HeroParticles, DownloadResume (the hero lazer CTA; it gates itself on `resumeAvailable`)
    ui/         — Badge, Button, ContactLinks, LanguageIcon, ResumeDialog, SectionHeading, SocialLinks, Tag, Typewriter, InView, RollingTextLink, BackToTop, EditableText, TagListEditor, RecordControls, RecordSettings, icons
  data/         — profile, skills, experience, projects (JSON documents + typed loaders), pages (manifest JSON + pages.ts loader), resume, palettes, navigation, social, site (TS modules)
  i18n/         — index.ts (loader), dict-types.ts, validate.ts, provider.tsx, draft.ts (DraftStore + save pipeline), edit-mode.ts (session/auth), locales/{vi,en}/content/{profile,skills,experience,projects}.json + ui/{group}.json (14 chrome groups)
  hooks/        — useTheme.tsx, useLanguage.tsx, useClickOutside.ts, useResumeDialog.ts, useEdit.ts (edit context)
  pages/        — HomePage, AboutPage, ExperiencePage, ProjectsListPage, ProjectDetailPage, PhilosophyPage, ContactPage
  types/        — shared TypeScript interfaces; content-ids.ts (generated id unions, gitignored)
```

## Motion & Animation

- `motion/react` v14 — ESM-first entrypoint (NOT `framer-motion`)
- Section entrance recipe — every section (`Hero`, `About`, `Expertise`, `Experience`, `Projects`, `Contact`) and every standalone page: `InView` wrapping a `motion.section` with `initial="hidden" whileInView="visible"`, `viewport={{ once: true, amount: 0.1 }}` and `variants` `hidden: { opacity: 0 }` / `visible: { opacity: 1, transition: { duration: 0.5 } }`
- Item recipe (timeline entries, philosophy/expertise/project cards, hero content blocks, contact links, project-detail blocks): `motion.*` with `initial={{ opacity: 0, y: 24 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, amount: 0.2 }}`, `transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}`
- Hover/press recipe — motion owns the transform, CSS `:hover` only colour/border/shadow: cards and links (`.project-card`, `.expertise-card`, `.philosophy-card`, `.contact-link`) use `whileHover={{ scale: 1.02, y: -4 }}` + `whileTap={{ scale: 0.98 }}`; `Button` uses `whileHover={{ y: -2 }}` + `whileTap={{ scale: 0.95 }}`; `.social-link` tiles use `scale: 1.1` / `0.9`. A motion-animated element never carries a CSS `transform` or `transition: all`
- `InView.tsx` — viewport intersection observer motion component
- `RollingTextLink.tsx` — animated text-scrolling navigation link
- `BackToTop.tsx` — scroll-to-top floating button with AnimatePresence
- `HeroParticles.tsx` — decorative particle background (uses AnimatePresence)
- Palette swatch rotation — `ThemePaletteMenu.tsx` renders the swatch as a `motion.span` whose `rotate` target is 90° while the `#palette-menu` submenu is open and 0° otherwise; reduced motion comes from the global `motion.config.reducedMotion = 'user'` in `main.tsx`, so no per-component branch

## External Assets

- `public/fonts/` — Source Sans 3 woff2 (Regular, Medium, Semibold, Bold); used by the resume generator only — the SPA renders `system-ui`
- `public/resume-template.html` — HTML template for resume PDF generation
- `public/resume-logos/` — official company logo SVGs (Lazada, SAP from Wikimedia Commons), embedded in the resume timeline via `ExperienceEntry.logo`
- `public/resume-qr/` — owner-supplied QR images (`telegram.jpg`, `zalo.jpg`) embedded in the resume header via `resumeQr` in `src/data/resume.ts`; committed like the other resume assets, so CI renders the QR block too — a missing file prints a warning and that QR is skipped
- `public/profile-photo.webp` — profile photo
- `robots.txt` is generated, not committed: `scripts/generate-sitemap.ts` writes `dist/robots.txt` (allow-all + the `Sitemap:` pointer) from the same `SITE_URL` the sitemap uses — no `public/robots.txt` exists anymore

## Scripts

- `scripts/generate-resume.ts` — Playwright-based PDF resume generator (bilingual en/vi)
- `scripts/generate-content-types.ts` — writes `src/types/content-ids.ts` from the four structure documents (`pnpm generate:ids`, wired as `predev` / `prebuild` / `prepare`): the id unions and the project category values in document order, `never` for an emptied document, a duplicate id refused with the file named
- `scripts/smoke-draft.ts` — regression check of the draft-store semantics (`pnpm tsx scripts/smoke-draft.ts`): accept/reject paths, empty-required rejection, orphan-free record delete, template creation, id re-sluging on rename, snapshot round-trip, conflict detection, clean rebase, the category-label rule
- `scripts/smoke-generated-ids.ts` — regression check of the generator (`pnpm tsx scripts/smoke-generated-ids.ts`): the shipped module equals the shipped documents, byte-stable output, `never` for emptied documents, malformed documents refused with the file named

## Deployment

- Site deployment is triggered automatically by gitea workflow `.gitea/workflows/deploy.yml` (push to `master`); infra redeployment by `.gitea/workflows/deploy-infra.yml` — triggered ONLY by changes to `nginx.conf` / `compose.yaml` / `deploy/htpasswd`, plus `workflow_dispatch` (the token-rotation runbook): test-before-touch (`nginx -t` in a throwaway container with placeholder values), then `docker compose up -d --force-recreate` + health probe (spec: `docs/design/specs/v4/spec-v4-deploy-infra.md`)
- Site identity is deployment-time configuration, not a repo literal: `SITE_URL` / `SITE_NAME` are Gitea Actions **variables** (`vars.` context — public values, not secrets) passed as job env to `build` and `generate-resume`; locally they live in the uncommitted `.env` (template `.env.example`). A production build without them fails with an error naming the variable
- Three jobs: `build` (`pnpm build` → `dist/` artifact) → `generate-resume` (`pnpm tsx scripts/generate-resume.ts --lang=en`, then `--lang=vi`) → `deploy` rsyncs `dist/`, both PDFs included, to `/opt/stacks/dong-site/dist/`
- `nginx.conf` — production Nginx SPA routing + caching config + the `/api/content/` location: auth_basic (`deploy/htpasswd`) in front of a proxied Gitea Contents API; the upstream URL and the write token are `${GITEA_CONTENTS_API}` / `${GITEA_TOKEN}` substituted by the image's envsubst step at container start — the token and the Gitea host never enter the SPA bundle or the repository
- `compose.yaml` — the stack definition for local AND VPS use (repo copy == stack copy): runtime values live in `secrets/site_config` (gitignored file in the stack directory, two lines `GITEA_TOKEN=` / `GITEA_CONTENTS_API=`, chmod 600), sourced by an entrypoint override (`set -a` + inline `nginx -g 'daemon off;'` — a compose entrypoint override drops the image's CMD) before the official entrypoint renders the template; the stack directory has no `.env`. On the VPS the same stack is managed by **Dockge** (upstream; stacks dir `/opt/stacks`, stack file `/opt/stacks/dong-site/compose.yaml`) — the repository is the single source of truth for `nginx.conf` / `compose.yaml` / `deploy/htpasswd`
- `compose.override.yaml` — local-only, auto-merged by `docker compose`, never rsynced by the pipeline: publishes the container on `127.0.0.1:8081` so the production stack can be browsed locally; the VPS stack is unaffected

```
.gitea/
└── workflows/
    ├── deploy.yml
    └── deploy-infra.yml
nginx.conf
compose.yaml
compose.override.yaml
```

## CSS Architecture

- `src/index.css` — CSS variables (`:root` dark default, `[data-theme="light"]`, plus a `prefers-color-scheme: light` bridge), global resets, typography scale
- `src/App.css` — component-level styles (Navigation, Footer, page sections)
- No CSS library — plain CSS with variables for theming
- `#main-content` in Layout has `style={{ flex: 1 }}` (parent `#root` is `display: flex; flex-direction: column`)

## Typography

- Scale tokens in `src/index.css`: `--text-body: 18px`, `--text-lede: 20px`, `--text-meta: 15px`, `--leading-body: 1.65`, `--measure-prose: 600px`, `--measure-page: 680px`
- Global: `p` = `--text-body` / `--leading-body`; `h3` 21px, `h4` 18px, `h5` 16px, `h6` 15px
- Two measures: `.prose` (600px) for long-form narrative, `.prose-wide` (680px, body steps up to `--text-lede`) for page-length prose. A lead paragraph uses `.prose-lede` (600px), or `.prose-lede lede-wide` (680px) when it sits next to a full-width grid. Non-prose columns use `.page-body` (`--measure-page`); titles inside a column use `.subheading`
- Cards and grids take the full container width; text columns do not. `/about` and the homepage About section use `container-wide` with `.philosophy-grid` at 3 columns (2 at ≤1024px, 1 at ≤768px), the same model as `.expertise-grid`
- Body copy sizes come from the tokens; 12-14px literals are reserved for chrome (tags, badges, pills, footer, duration labels)
- Components MUST NOT set `fontSize` / `lineHeight` inline — use the classes above
- Font stack is `system-ui`: no webfont is loaded by the SPA. The Source Sans 3 woff2 files in `public/fonts/` are consumed only by `scripts/generate-resume.ts`
- Spec: `docs/design/specs/v3/spec-v3-typography.md`

## Known Issues & Gotchas

1. **React Router v8 routing:** Use `<Layout><Routes>...</Routes></Layout>`, NOT `<Route element={<Layout />}>` with nested routes — the latter doesn't pass `children` correctly
2. **Import path:** All router imports use `react-router` (not `react-router-dom`) — e.g., `import { Link, useLocation } from 'react-router'`
3. **Animation imports:** Use `motion/react` (v14 ESM), NOT `framer-motion` — e.g., `import { motion, AnimatePresence } from 'motion/react'`
4. **Footer/Nav links:** Must use `<Link to>`, not `<a href>` for client-side navigation
5. **Content text lives only in the locale dictionaries:** components read joined records through `useI18n()`; a missing EN field falls back to VI per field at load (arrays are atomic). Most EN content is still the VI original — translating means adding JSON, never touching components
6. **`lazy()` needs a default export:** pages export named components, so each factory must map `{ default: m.XPage }` — a bare `import('@/pages/XPage')` fails `tsc` with `TS2322: Property 'default' is missing`. There is no `src/pages/index.ts` barrel: importing it would pull every route back into the entry chunk
7. **A locked `dist/resume*.pdf` blocks the build:** while a generated PDF is open in a viewer, `pnpm build:resume-all` fails with `EBUSY` on that file and `pnpm build` fails too (vite `emptyDir` → `EPERM`). Close the viewer first
8. **`src/types/content-ids.ts` is generated, not committed:** a fresh checkout has no id unions until a script writes them. `pnpm install` (`prepare`) or `pnpm dev` (`predev`) creates it; before that the IDE reports `Cannot find module './content-ids'`, and `pnpm generate:ids` is the one-off fix. Editing it by hand is pointless — the next `prebuild` overwrites it

## Design Specs

All specification documents are in `docs/design/`:

| File | Purpose |
|------|---------|
| `spec.md` | Main PRD — product vision, positioning, narrative, IA, acceptance criteria |
| `spec-v1.md` | v1 completion record — features implemented, known limitations, files summary |
| `spec-v2.md` | v2 index — overview, implementation order, feature list |
| `specs/ui/spec-ui-*.md` | UI specs per section (hero, about, expertise, etc.) |
| `specs/v2/spec-v2-*.md` | v2 feature specs (resume, seo, blog, analytics, testing, cicd) |
| `specs/v3/spec-v3-*.md` | v3 feature specs (theme colors, theme switch, theme palette switch, palette reference, UI enhancements, mobile navigation, nav & CTA enhancements, nav swatch & hamburger, typography, i18n, resume improvements, resume redesign, review fixes) |
| `specs/v4/spec-v4-*.md` | v4 feature specs (i18n locale overlay, git-backed live edit with preview, authenticated Contents-API write path; supersedes v3-i18n Phase 2). `spec-v4-data-organization.md`: per-entity content files, per-page field-level manifests, per-feature-group UI — implemented 2026-10-23 (automated checks pass; browser walkthrough pending). `spec-v4-inline-editing.md`: edit everything on the page (pencil-icon triggers, tag chips, record add/delete/move, settings popover), JSON panel deleted — implemented 2026-10-23; it supersedes live-edit §5.1/§5.4 panel scope. `spec-v4-deploy-infra.md`: pipeline redeploy of the VPS nginx container, Dockge-managed stack (paths-filtered `deploy-infra.yml`, test-before-touch, repo-as-source-of-truth, token-safety rules) + externalizing site identity — `SITE_URL` / `SITE_NAME` as CI Actions variables, `GITEA_TOKEN` + `GITEA_CONTENTS_API` in the stack's single config file `secrets/site_config` — repo side implemented 2026-10-23 (`deploy-infra.yml`, `compose.yaml` secret + entrypoint override, env-driven identity); owner-side variables/config file + first verified run pending |
| `specs/v5/spec-v5-*.md` | v5 feature specs. `spec-v5-generated-content-ids.md`: the content id unions and the project category values are generated from the structure documents (`scripts/generate-content-types.ts`, run by `predev` / `prebuild` / `prepare`), edit mode writes JSON only, validator rule 7 requires a label for every used category in both languages — implemented 2026-10-24; it supersedes the id-union legs of `spec-v4-live-edit.md` §3.1 |

Read `spec.md` first for product context. Read `spec-v2.md` for current feature scope.

### Specification Rules

When proposing or implementing changes, always include these 3 sections:

**1. Implementation Details**
- Describe every code step: what to write, edit, or delete
- List new imports, functions, props, state, CSS classes
- Identify edge cases and error handling

**2. Affected Files**
- File + line range to edit: `src/foo.ts:42-57`
- New file to create: `src/bar.ts`
- File to delete: `src/dead.ts`

**3. Progress Tracking**
- Update relevant spec with status: `TODO` / `IN_PROGRESS` / `DONE`
- Record which acceptance criteria were verified
- Format: checklist in spec or inline code comments

## Code Style & Linting

- TypeScript: `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Oxlint: `react/rules-of-hooks` = error, `react/only-export-components` = warn
- No framework-specific CSS library — plain CSS with CSS variables
- Data-driven: all content from JSON documents and locale dictionaries, not hardcoded in JSX
