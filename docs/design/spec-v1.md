# Specification — v1 (Foundation + Core Portfolio)

> **Document:** `spec_v1.md`
> **Version:** 1.0.0
> **Status:** Completed
> **Branch:** `dev` (merged from `dev_v1`)
> **Tag:** `v0.0.1`
> **Commit:** `7e42bd8` (feat) + `59951a7` (docs)

---

## Overview

v1 implements **Phase 1 (Foundation)** and **Phase 2 (Core Portfolio)** from `spec.md`. All pages, components, theming, and responsive layout are complete.

---

## Completed Features

### 1. Foundation

| Feature | Status | Details |
|---------|--------|---------|
| Vite 8 + React 19 + TypeScript 6 | Done | Bundler mode, strict linting |
| Oxlint 1 | Done | `react/rules-of-hooks` error, `react/only-export-components` warn |
| React Router v6 | Done | Pin `6.30.6`, 7 routes defined |
| CSS Variables + Theming | Done | `data-theme` attribute, dark/light/system |
| Responsive Design | Done | Mobile menu, fluid containers, touch-friendly |

### 2. Routing & Pages

| Route | Page | Component | Status |
|-------|------|-----------|--------|
| `/` | Home | `HomePage` | Done |
| `/about` | About | `AboutPage` | Done |
| `/experience` | Experience | `ExperiencePage` | Done |
| `/projects` | Projects List | `ProjectsListPage` | Done |
| `/projects/:id` | Project Detail | `ProjectDetailPage` | Done |
| `/philosophy` | Engineering | `PhilosophyPage` | Done (placeholder content) |
| `/contact` | Contact | `ContactPage` | Done |

### 3. Layout Components

| Component | File | Status |
|-----------|------|--------|
| `Layout` | `src/components/layout/Layout.tsx` | Done — wraps Navigation + main + Footer |
| `Navigation` | `src/components/layout/Navigation.tsx` | Done — desktop menu, mobile drawer, theme toggle |
| `Footer` | `src/components/layout/Footer.tsx` | Done — copyright, nav links, social links |

### 4. Page Sections (HomePage)

| Section | Component | Status |
|---------|-----------|--------|
| Hero | `src/components/sections/Hero.tsx` | Done — name, title, tagline, CTA, social links |
| About | `src/components/sections/About.tsx` | Done — bio, engineering philosophy, current interests |
| Expertise | `src/components/sections/Expertise.tsx` | Done — skill groups grid |
| Experience | `src/components/sections/Experience.tsx` | Done — timeline with responsibilities |
| Projects | `src/components/sections/Projects.tsx` | Done — featured projects grid |
| Contact | `src/components/sections/Contact.tsx` | Done — email, GitHub, LinkedIn links |

### 5. UI Components

| Component | File | Props/Features | Status |
|-----------|------|----------------|--------|
| `Button` | `src/components/ui/Button.tsx` | `variant`, `size`, `disabled` | Done |
| `Badge` | `src/components/ui/Badge.tsx` | `variant: accent | outline | muted` | Done |
| `Tag` | `src/components/ui/Tag.tsx` | `accent` | Done |
| `Card` | `src/components/ui/Card.tsx` | `as`, children | Done |
| `SectionHeading` | `src/components/ui/SectionHeading.tsx` | `title`, `subtitle` | Done |
| `SocialLinks` | `src/components/ui/SocialLinks.tsx` | `links`, `variant` | Done |

### 6. Theming

| Feature | Status | Details |
|---------|--------|---------|
| `ThemeProvider` | Done | Context provider, `data-theme` on `<html>` |
| `useTheme()` hook | Done | Returns `{ theme, resolvedTheme, setTheme, cycleTheme }` |
| Theme cycle | Done | `dark` ↔ `light` ↔ `system` (system skips to opposite) |
| localStorage persistence | Done | Key: `portfolio-theme` |
| System preference detection | Done | `prefers-color-scheme: dark` |
| CSS variables for both themes | Done | `src/index.css` root + `[data-theme="dark"]` |

### 7. Data Layer

| Module | File | Content | Status |
|--------|------|---------|--------|
| Profile | `src/data/profile.ts` | Name, title, tagline, bio, links, interests, philosophy | Done |
| Skills | `src/data/skills.ts` | 6 skill groups × 5-6 skills each | Done |
| Experience | `src/data/experience.ts` | 1 entry with 3 featured achievements | Done |
| Projects | `src/data/projects.ts` | 4 projects with sections, metrics, tech stacks | Done |

### 8. Types

| Interface | File | Fields | Status |
|-----------|------|--------|--------|
| `Profile` | `src/types/index.ts` | name, title, tagline, bio, email, links, interests, philosophy | Done |
| `SkillGroup` | `src/types/index.ts` | title, skills[] | Done |
| `ExperienceEntry` | `src/types/index.ts` | id, title, company, duration, location, responsibilities, achievements | Done |
| `FeaturedAchievement` | `src/types/index.ts` | id, title, context, technicalWork, impact, metrics, technologies, featured | Done |
| `Project` | `src/types/index.ts` | id, title, summary, category, role, technologies, metrics, featured, urls | Done |
| `ProjectDetail` | `src/types/index.ts` | extends Project + sections[] | Done |
| `ProjectSection` | `src/types/index.ts` | id, number, title, content, type | Done |
| `PhilosophyPoint` | `src/types/index.ts` | title, description, keywords[] | Done |
| `ProjectCategory` | `src/types/index.ts` | 6 union types | Done |

---

## Architecture

```
App.tsx
  └── ThemeProvider
       └── BrowserRouter
            └── Layout
                 ├── Navigation (top bar + mobile drawer)
                 ├── <Routes>
                 │    ├── HomePage (Hero + About + Expertise + Experience + Projects + Contact)
                 │    ├── AboutPage
                 │    ├── ExperiencePage
                 │    ├── ProjectsListPage
                 │    ├── ProjectDetailPage
                 │    ├── PhilosophyPage
                 │    └── ContactPage
                 └── Footer
```

**Data flow:** All content comes from `src/data/*.ts` modules. Components are presentational — no hardcoded text except labels/CTAs.

**CSS:** Global variables in `src/index.css`, component styles in `src/App.css`. No CSS library.

---

## Known Limitations

| # | Limitation | Impact | v2 Plan |
|---|------------|--------|---------|
| 1 | No Blog system | Cannot publish articles | Phase 4: MDX-based blog |
| 2 | No SEO metadata | No `<title>`, `<meta>`, OG tags per page | Phase 5: react-helmet-async |
| 3 | No Analytics | No page view tracking | Phase 5: Plausible |
| 4 | No Testing | No unit/E2E tests | Phase 5: Vitest + Playwright |
| 5 | No CI/CD | Manual builds only | Phase 5: GitHub Actions |
| 6 | No Resume download | No PDF resume | v2: Add link/button |
| 7 | Engineering page placeholder | "Coming soon" text | v2: Populate with real content |
| 8 | Projects use `<a href>` not `<Link>` | Client-side nav broken on projects page | v2: Fix to `<Link>` |
| 9 | No i18n | Vietnamese-only | Future: English support |
| 10 | No CMS | Content in TS files | Future: headless CMS or MDX |

---

## Files Summary

| Category | Count | Path |
|----------|-------|------|
| Pages | 7 | `src/pages/*.tsx` |
| Layout components | 3 | `src/components/layout/*.tsx` |
| Section components | 6 | `src/components/sections/*.tsx` |
| UI components | 6 | `src/components/ui/*.tsx` |
| Data modules | 4 | `src/data/*.ts` |
| Hooks | 1 | `src/hooks/useTheme.tsx` |
| Types | 1 | `src/types/index.ts` |
| CSS | 2 | `src/index.css`, `src/App.css` |
| **Total source files** | **30** | |

---

## Approval

- [x] All Phase 1 + Phase 2 requirements implemented
- [x] TypeScript compiles without errors
- [x] Oxlint passes
- [x] Build succeeds
- [x] Responsive on mobile/desktop
- [x] Tagged `v0.0.1` on branch `dev`
- [x] AGENTS.md updated with project context
