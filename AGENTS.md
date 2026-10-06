# Agent Guidelines — portfolio

## Project

A bare **React + TypeScript + Vite** application (default `create-vite` scaffold). No custom components, utilities, or business logic yet.

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 |
| Language | TypeScript 6 (bundler mode, `verbatimModuleSyntax`, `noEmit`) |
| Bundler | Vite 8 |
| Linter | Oxlint 1 (`plugins: react, typescript, oxc`) |
| Package manager | pnpm |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Type-check (`tsc -b`) then build for production |
| `pnpm lint` | Run Oxlint |
| `pnpm preview` | Preview production build locally |

## Project Structure

```
src/
  main.tsx       — Entry point; renders <App> inside StrictMode
  App.tsx        — Root component (currently Vite welcome page)
  App.css        — Component styles
  index.css      — Global styles, CSS variables, dark mode
  assets/        — Images (hero.png, react.svg, vite.svg)
public/
  favicon.svg    — Site favicon
  icons.svg      — SVG sprite sheet (icons used in App.tsx)
index.html       — HTML shell
vite.config.ts   — Vite config (react plugin only)
tsconfig.app.json — TS compiler options (bundler mode, strict linting)
.oxlintrc.json   — Oxlint rules (react hooks error, exports warn)
```

## Code Style & Linting

- TypeScript: `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Oxlint: `react/rules-of-hooks` = error, `react/only-export-components` = warn (allows constant exports)
- No framework-specific CSS library — plain CSS with CSS variables

## File Conventions

- Components: `.tsx`, single default export per file
- Styles: `.css` alongside components (co-located), global styles in `src/index.css`
- Assets: imported in `src/assets/`, static files in `public/`
