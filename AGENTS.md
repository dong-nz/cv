# Agent Guidelines — portfolio

## Project

Personal engineering portfolio — multi-page SPA built with React + TypeScript + Vite. Data-driven content from `src/data/`, styled with CSS variables supporting dark/light/system themes.

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 |
| Language | TypeScript 6 (bundler mode, `verbatimModuleSyntax`, `noEmit`) |
| Bundler | Vite 8 |
| Router | React Router v8 (`react-router` package, pinned `8.4.0`) |
| Linter | Oxlint 1 (`plugins: react, typescript, oxc`) |
| Package manager | pnpm |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Type-check (`tsc -b`) then build for production |
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
| `/engineering` | `EngineeringPage` | Engineering philosophy |
| `/contact` | `ContactPage` | Contact info |

## Theming

- `src/hooks/useTheme.tsx` — `ThemeProvider` + `useTheme` hook
- State machine: `dark` ↔ `light` ↔ `system`
- **Critical:** `cycleTheme` skips `system` when prev is `system` (goes to opposite theme instead)
- `data-theme` attribute on `<html>` set by `useEffect`
- Stored in `localStorage` key `portfolio-theme`

## Data Layer

- `src/data/profile.ts` — name, title, bio, links
- `src/data/skills.ts` — skill groups → skills
- `src/data/experience.ts` — work history entries
- `src/data/projects.ts` — project cards with categories

## Component Structure

```
src/
  components/
    layout/     — Layout.tsx, Navigation.tsx, Footer.tsx
    sections/   — Hero, About, Expertise, Experience, Projects, Contact (used in HomePage)
    ui/         — Badge, Button, Card, SectionHeading, SocialLinks, Tag
    index.ts    — barrel export
  data/         — profile, skills, experience, projects (TS modules)
  hooks/        — useTheme.tsx
  pages/        — HomePage, AboutPage, ExperiencePage, ProjectsListPage, ProjectDetailPage, EngineeringPage, ContactPage, index.ts
  types/        — shared TypeScript interfaces
```

## CSS Architecture

- `src/index.css` — CSS variables (root + `[data-theme="dark"]`), global resets
- `src/App.css` — component-level styles (Navigation, Footer, page sections)
- No CSS library — plain CSS with variables for theming
- `#main-content` in Layout has `style={{ flex: 1 }}` (parent `#root` is `display: flex; flex-direction: column`)

## Known Issues & Gotchas

1. **React Router v8 routing:** Use `<Layout><Routes>...</Routes></Layout>`, NOT `<Route element={<Layout />}>` with nested routes — the latter doesn't pass `children` correctly
2. **Import path:** All router imports use `react-router` (not `react-router-dom`) — e.g., `import { Link, useLocation } from 'react-router'`
3. **Theme cycle:** `cycleTheme` dependency array must be `[]` (empty), NOT `[setTheme]` — `setTheme` is not used inside `cycleTheme`
4. **Theme from system:** When stored theme is `'system'`, `cycleTheme` must skip to opposite theme on first click (not go to `'dark'` which resolves to same visual)
5. **Footer/Nav links:** Must use `<Link to>`, not `<a href>` for client-side navigation

## Design Specs

All specification documents are in `docs/design/`:

| File | Purpose |
|------|---------|
| `spec.md` | Main PRD — product vision, positioning, narrative, IA, acceptance criteria |
| `spec-v1.md` | v1 completion record — features implemented, known limitations, files summary |
| `spec-v2.md` | v2 index — overview, implementation order, feature list |
| `specs/ui/spec-ui-*.md` | UI specs per section (hero, about, expertise, etc.) |
| `specs/v2/spec-v2-*.md` | v2 feature specs (resume, seo, blog, analytics, testing, cicd) |

Read `spec.md` first for product context. Read `spec-v2.md` for current feature scope.

## Code Style & Linting

- TypeScript: `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Oxlint: `react/rules-of-hooks` = error, `react/only-export-components` = warn
- No framework-specific CSS library — plain CSS with CSS variables
- Data-driven: all content from TS modules, not hardcoded in JSX
