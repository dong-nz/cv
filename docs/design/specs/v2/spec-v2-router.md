# Specification — v2 React Router v6 → v7 Migration

> **Document:** `spec-v2-router.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2.md`
> **Priority:** P0 (prerequisite for v2)
> **Estimate:** ~30 minutes

---

## Background

React Router v7 consolidates `react-router-dom` into `react-router`. The upgrade is non-breaking if future flags are enabled. This app uses the simple `<BrowserRouter>` + `<Routes>` pattern (no data router, no forms, no splat routes).

**Current state:**
- `react-router-dom` pinned at `6.30.6` (exact, no `^`)
- 4 files import from `react-router-dom`
- No splat routes, no forms, no data router APIs

---

## Analysis

### Applicable flags

| Flag | Applicable? | Notes |
|------|-------------|-------|
| `v7_relativeSplatPath` | No | No splat routes (`*`) in app |
| `v7_startTransition` | **Yes** | Must enable on `<BrowserRouter>` |
| `v7_fetcherPersist` | No | No `<RouterProvider>` / data router |
| `v7_normalizeFormMethod` | No | No forms in app |
| `v7_partialHydration` | No | No `<RouterProvider>` / data router |
| `v7_skipActionErrorRevalidation` | No | No data router |

### Files affected

| File | Current import | Change needed |
|------|---------------|---------------|
| `src/App.tsx` | `react-router-dom` | → `react-router` + enable flag |
| `src/components/layout/Navigation.tsx` | `react-router-dom` | → `react-router` |
| `src/components/layout/Footer.tsx` | `react-router-dom` | → `react-router` |
| `src/pages/ProjectDetailPage.tsx` | `react-router-dom` | → `react-router` |

---

## Implementation Steps

### Step 1: Verify no future flags needed

In v7, `v7_startTransition` and other future flags are enabled by default. No `future` prop needed on `<BrowserRouter>`.

### Step 2: Update package.json


```diff
- "react-router-dom": "6.30.6"
+ "react-router": "7.18.4"
```

Also remove `@types/react-router-dom` if present (v7 types are bundled).

### Step 3: Update imports

All files: replace `from 'react-router-dom'` → `from 'react-router'`

```
src/App.tsx
src/components/layout/Navigation.tsx
src/components/layout/Footer.tsx
src/pages/ProjectDetailPage.tsx
```

### Step 4: Install and verify

```bash
pnpm install
pnpm build
```

---

## Acceptance

- [x] `package.json` has `react-router` (not `react-router-dom`)
- [x] All 4 files import from `react-router`
- [x] `pnpm build` succeeds without errors
- [x] Dev server runs without console warnings
- [x] All routes work correctly (/ → /about → /projects → /projects/:id → /engineering → /contact)
- [x] Navigation highlighting works (NavLink active state)
- [x] Mobile menu still works

---

## Notes

- v7 upgrade is non-breaking for this app (simple `<BrowserRouter>` pattern)
- No code logic changes needed — only imports + package name
- v7 enables all future flags by default; no `future` prop needed
