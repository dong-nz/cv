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
| `/philosophy` | `PhilosophyPage` | Engineering philosophy |
| `/contact` | `ContactPage` | Contact info |

## Theming

- `src/hooks/useTheme.tsx` — `ThemeProvider` + `useTheme` hook
- Simple toggle: `'dark'` ↔ `'light'` (no `system` variant)
- `resolvedTheme` — runtime resolved value (always `'dark'` or `'light'`)
- `data-theme` attribute set on `<html>` during render (before paint)
- Stored in `localStorage` key `portfolio-theme`

## Data Layer

- `src/data/profile.ts` — name, title, bio, links
- `src/data/skills.ts` — skill groups → skills
- `src/data/experience.ts` — work history entries
- `src/data/projects.ts` — project cards with categories
- `src/data/resume.ts` — resume availability, supported languages, URL generation

## Component Structure

```
src/
  components/
    layout/     — Layout.tsx, Navigation.tsx, Footer.tsx
    sections/   — Hero, About, Expertise, Experience, Projects, Contact, HeroParticles, DownloadResume
    ui/         — Badge, Button, Card, SectionHeading, SocialLinks, Tag, Typewriter, AnimatedSection, InView, RollingTextLink, BackToTop
    index.ts    — barrel export
  data/         — profile, skills, experience, projects, resume (TS modules)
  hooks/        — useTheme.tsx, useClickOutside.ts
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

## External Assets

- `public/fonts/` — Inter font (Regular, Medium, SemiBold, Bold) in woff2
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

- `src/index.css` — CSS variables (root + `[data-theme="dark"]`), global resets
- `src/App.css` — component-level styles (Navigation, Footer, page sections)
- No CSS library — plain CSS with variables for theming
- `#main-content` in Layout has `style={{ flex: 1 }}` (parent `#root` is `display: flex; flex-direction: column`)

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
| `specs/v3/spec-v3-*.md` | v3 feature specs (theme colors, theme switch, UI enhancements) |

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
