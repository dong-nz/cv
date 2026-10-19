# Agent Guidelines — portfolio

## Project

Personal engineering portfolio — multi-page SPA built with React + TypeScript + Vite. Data-driven content from `src/data/`, styled with CSS variables supporting dark/light themes. Motion animations via `motion/react`. Bilingual resume generation (EN/VI).

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
| `pnpm build` | Type-check (`tsc -b`), build for production, then generate `dist/sitemap.xml` |
| `pnpm build:resume` | Generate resume PDF (default EN) via Playwright |
| `pnpm build:resume-all` | Generate bilingual resume PDFs (EN + VI) |
| `pnpm lint` | Run Oxlint |
| `pnpm sitemap` | Regenerate `dist/sitemap.xml` on its own (also run by `pnpm build`) |
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
- Picker, two renderings, both present at every width: the bar uses `src/components/layout/ThemePaletteMenu.tsx` — icon-only trigger (`nav-control nav-palette-trigger`, a 20px half-circle swatch: active palette's accent on the left, `--swatch-empty` on the right; no text, no chevron; the name lives in `aria-label`, the hint in `title`) opening the `#palette-menu` panel. The sheet renders its own Theme color row inside `MobileMenu.tsx` from `paletteIds` + `paletteMeta` as `.mobile-menu-icon-option` buttons — the 44px icon-only square the Language row shares; the Mode row keeps `.mobile-menu-segment-option`, because its options are words. `ThemePaletteMenu` has no `variant` prop and is never mounted in the sheet
- Preview chips are theme-aware: `--preview-red-accent` / `--preview-blue-accent` are declared per theme — `:root` dark pair, `:root[data-theme='light']` light pair, repeated in the `prefers-color-scheme` bridge — and mirror that block's `--accent`, so a submenu dot and the bar swatch's accent half are the same colour in the same theme. Each chip names its own palette through `data-preview`, so the two `[data-palette='blue']` blocks declare no preview token; `--swatch-empty` stays one constant. Spec: `docs/design/specs/v3/spec-v3-nav-swatch-and-hamburger.md`
- Bar controls share one chrome: `.nav-control` covers the language toggle, the mode toggle and the palette trigger (44px bordered box, accent border + icon on hover/open, one `:focus-visible`). The hamburger leads the bar at every width it appears: `.nav-brand` (`display: flex; gap: 12px`) holds it first and the brand home icon right after, at the bar's left edge — `.nav-logo` is a 24px stroke house in a 44px target, a `<Link to="/">` named by the translated `strings.nav.home` label with the svg `aria-hidden`, so it carries its own `:focus-visible` ring. `.nav-actions` then carries the three appearance controls in that order (language, mode, theme color) at the right end. The sheet's Appearance group follows the same order (Language row, Mode row, Theme color row). `@media (max-width: 420px)` tightens the container padding and the action gap so the row fits a 320px viewport (40 + 12 + 44 + 44×3 + 12×2 = 252px inside 288px)
- Language control is icon-only in both renderings — `src/components/ui/LanguageIcon.tsx` draws both languages as line art in the bar's stroke language (`currentColor`, no fills): English a 20px globe (circle r=10 + equator + meridian ellipse, 2px round joins, so it follows the control's hover accent), Tiếng Việt a flag outline (21×17.5 band `rx=2` at 1.5/3.25 — drawn 23×19.5 against the globe's 22×22; width is already at the limit, so the size step came from height, which drags the constitutional 2:3 to 1.2 — with a centred five-point mullet at r=3.6, deliberately smaller than the flag's own 0.6 × height construction, stroked 1.5px round joins so its interior stays open). The bar's `nav-control lang-toggle` shows the language it switches TO (`lang === 'en' ? 'vi' : 'en'`): translated action in `aria-label`, the target's own-language name in `title`. `.lang-toggle` now carries no CSS rules of its own — it marks the button in the DOM and nothing else. The sheet's Language row uses `.mobile-menu-icon-option` squares with `aria-pressed` and the own-language `aria-label` / `title`. Spec: `docs/design/specs/v3/spec-v3-i18n.md`

## Data Layer

- `src/data/profile.ts` — name, title, bio, links, social handles (`githubHandle`, `linkedinHandle`, `telegramHandle`), messaging URLs (`telegramUrl`, `zaloUrl`) — the Contact cards render `@{profile.githubHandle}`, never a literal
- `src/data/skills.ts` — skill groups → skills
- `src/data/experience.ts` — work history entries; optional `variant: 'current' | 'gap'` selects the timeline decoration (live node / career break)
- `src/data/projects.ts` — project cards with categories
- `src/data/resume.ts` — resume availability, supported languages, URL generation
- `src/data/navigation.ts` — `navPaths` (bar + sheet order: Home, About, Experience, Projects, Contact, Philosophy), `footerPaths`
- `src/data/social.ts` — social tiles as `{id, href, external}` (github, linkedin, email, telegram, zalo); `email` is a `mailto:` link with `external: false`, so it renders no `target`/`rel`
- `src/i18n/strings.ts` — every chrome string as `{en, vi}`; the sheet's group labels, the Mode options, the language names (`langEn` / `langVi`, each named in its own language) and the language action labels (`langSwitch`, `switchTo`) live in `strings.nav`, the social `aria-label`s in `strings.social`
- `src/data/site.ts` — `siteUrl` (the canonical origin) and `siteName`; every absolute URL the site publishes — canonical, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml` — derives from it
- `src/i18n/field.ts` — `field(lang, value, valueEn)` is a plain function, not a hook: `lang` is read once at component top level with `useLanguage()`, so bilingual selection is legal inside `.map()` callbacks. Convention: `value` is Vietnamese, `valueEn` English

## Component Structure

```
src/
  components/
    layout/     — Layout.tsx, Navigation.tsx, MobileMenu.tsx, Footer.tsx, ThemePaletteMenu.tsx
    sections/   — Hero, About, Expertise, Experience, Projects, Contact, HeroParticles, DownloadResume
    ui/         — Badge, Button, ContactLinks, LanguageIcon, SectionHeading, SocialLinks, Tag, Typewriter, InView, RollingTextLink, BackToTop, icons
  data/         — profile, skills, experience, projects, resume, palettes, navigation, social, site (TS modules)
  hooks/        — useTheme.tsx, useLanguage.tsx, useClickOutside.ts
  pages/        — HomePage, AboutPage, ExperiencePage, ProjectsListPage, ProjectDetailPage, PhilosophyPage, ContactPage
  types/        — shared TypeScript interfaces
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
- `public/resume-qr/` — owner-supplied QR images (`telegram.png`, `zalo.png`) embedded in the resume header via `resumeQr` in `src/data/resume.ts`; private assets, NOT committed — a missing file prints a warning and the QR is skipped
- `public/profile-photo.webp` — profile photo
- `public/robots.txt` — allow-all crawler rules plus the `Sitemap:` pointer to the canonical origin

## Scripts

- `scripts/generate-resume.ts` — Playwright-based PDF resume generator (bilingual en/vi)
- `scripts/generate-sitemap.ts` — writes `dist/sitemap.xml` from `src/data/site.ts`, `navPaths` and the project list; fails if `dist/` is missing or if `dist/index.html` no longer contains `siteUrl`

## Deployment

- Deployment is triggered automatically by gitea workflow `.gitea/workflows/deploy.yml`
- `nginx.conf` — production Nginx SPA routing + caching config
- `docker-compose.yaml` — Docker service for local nginx deployment

```
.gitea/
└── workflows/
    └── deploy.yml
nginx.conf
docker-compose.yaml
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
5. **Bilingual plumbing is done, the content is not:** `field(lang, value, valueEn)` resolves correctly, but most content has no second language — `skills.ts` group titles are identical in both languages, `projects.ts` titles differ for 1 of 4 projects, and `role` / `technologies` / `metrics` / `duration` / `company` in `experience.ts` have no `*En` variants at all. Translating means adding data, never changing a component
6. **`lazy()` needs a default export:** pages export named components, so each factory must map `{ default: m.XPage }` — a bare `import('@/pages/XPage')` fails `tsc` with `TS2322: Property 'default' is missing`. There is no `src/pages/index.ts` barrel: importing it would pull every route back into the entry chunk

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
- Data-driven: all content from TS modules, not hardcoded in JSX
