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
| `pnpm build` | Type-check (`tsc -b`) then build for production |
| `pnpm build:resume` | Generate resume PDF (default EN) via Playwright |
| `pnpm build:resume-all` | Generate bilingual resume PDFs (EN + VI) |
| `pnpm lint` | Run Oxlint |
| `pnpm preview` | Preview production build locally |

## Routing

- `App.tsx` wraps `<BrowserRouter>` → `<Layout>` → `<Routes>` (NOT nested `<Route element>` — causes `children` not to pass)
- Layout: `<Navigation>` (top) → `<main id="main-content">` → `<Footer>` (bottom)
- All internal navigation MUST use `<Link>`/`<NavLink>`, never `<a href>` (causes full page reload)
- Footer internal links also use `<Link>`; external links (GitHub, LinkedIn, email) keep `<a>` with `target="_blank"`

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
- Picker, two renderings, both present at every width: the bar uses `src/components/layout/ThemePaletteMenu.tsx` — icon-only trigger (`nav-control nav-palette-trigger`, a 20px half-circle swatch: active palette's accent on the left, `--swatch-empty` on the right; no text, no chevron; the name lives in `aria-label`, the hint in `title`) opening the `#palette-menu` panel. The sheet renders its own Theme color row inside `MobileMenu.tsx` from `paletteIds` + `paletteMeta` as `.mobile-menu-swatch-option` buttons — the same segmented shape as the Mode/Language rows, options drawn as colour icons via `.nav-palette-preview`. `ThemePaletteMenu` has no `variant` prop and is never mounted in the sheet
- Bar controls share one chrome: `.nav-control` covers the language toggle, the mode toggle and the palette trigger (44px bordered box, accent border + text on hover/open, one `:focus-visible`). All four controls — language, mode, theme color, hamburger — sit in `.nav-actions` at every width, in that order; the sheet's Appearance group follows the same order (Language row, Mode row, Theme color row). `@media (max-width: 420px)` tightens the container padding and action gap so the row fits a 320px viewport

## Data Layer

- `src/data/profile.ts` — name, title, bio, links
- `src/data/skills.ts` — skill groups → skills
- `src/data/experience.ts` — work history entries; optional `variant: 'current' | 'gap'` selects the timeline decoration (live node / career break)
- `src/data/projects.ts` — project cards with categories
- `src/data/resume.ts` — resume availability, supported languages, URL generation
- `src/data/navigation.ts` — `navPaths` (bar + sheet order: Home, About, Experience, Projects, Contact, Philosophy), `footerPaths`
- `src/data/social.ts` — social tiles as `{id, href, external}`; `email` is a `mailto:` link with `external: false`, so it renders no `target`/`rel`
- `src/i18n/strings.ts` — every chrome string as `{en, vi}`; the sheet's group labels, Mode/Language options and the social `aria-label`s live in `strings.nav` / `strings.social`

## Component Structure

```
src/
  components/
    layout/     — Layout.tsx, Navigation.tsx, MobileMenu.tsx, Footer.tsx, ThemePaletteMenu.tsx
    sections/   — Hero, About, Expertise, Experience, Projects, Contact, HeroParticles, DownloadResume
    ui/         — Badge, Button, SectionHeading, SocialLinks, Tag, Typewriter, AnimatedSection, InView, RollingTextLink, BackToTop
    index.ts    — barrel export
  data/         — profile, skills, experience, projects, resume, palettes, navigation, social (TS modules)
  hooks/        — useTheme.tsx, useLanguage.tsx, useClickOutside.ts
  pages/        — HomePage, AboutPage, ExperiencePage, ProjectsListPage, ProjectDetailPage, PhilosophyPage, ContactPage, index.ts
  types/        — shared TypeScript interfaces
```

## Motion & Animation

- `motion/react` v14 — ESM-first entrypoint (NOT `framer-motion`)
- `AnimatedSection.tsx` — scroll-triggered motion animation wrapper
- `InView.tsx` — viewport intersection observer motion component
- `RollingTextLink.tsx` — animated text-scrolling navigation link
- `BackToTop.tsx` — scroll-to-top floating button with AnimatePresence
- `HeroParticles.tsx` — decorative particle background (uses AnimatePresence)
- Palette swatch rotation — `ThemePaletteMenu.tsx` renders the swatch as a `motion.span` whose `rotate` target is 90° while the `#palette-menu` submenu is open and 0° otherwise; reduced motion comes from the global `motion.config.reducedMotion = 'user'` in `main.tsx`, so no per-component branch

## External Assets

- `public/fonts/` — Source Sans 3 woff2 (Regular, Medium, Semibold, Bold); used by the resume generator only — the SPA renders `system-ui`
- `public/icons.svg` — SVG sprite for icons
- `public/resume-template.html` — HTML template for resume PDF generation
- `public/profile-photo.webp` — profile photo

## Scripts

- `scripts/generate-resume.ts` — Playwright-based PDF resume generator (bilingual en/vi)

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

## Design Specs

All specification documents are in `docs/design/`:

| File | Purpose |
|------|---------|
| `spec.md` | Main PRD — product vision, positioning, narrative, IA, acceptance criteria |
| `spec-v1.md` | v1 completion record — features implemented, known limitations, files summary |
| `spec-v2.md` | v2 index — overview, implementation order, feature list |
| `specs/ui/spec-ui-*.md` | UI specs per section (hero, about, expertise, etc.) |
| `specs/v2/spec-v2-*.md` | v2 feature specs (resume, seo, blog, analytics, testing, cicd) |
| `specs/v3/spec-v3-*.md` | v3 feature specs (theme colors, theme switch, theme palette switch, UI enhancements, mobile navigation, nav & CTA enhancements) |

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
