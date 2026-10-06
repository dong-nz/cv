# Specification — v2 React Router v7 → v8 Migration

> **Document:** `spec-v2-router-v8.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2.md`
> **Priority:** P0 (prerequisite for v2)
> **Estimate:** ~15 minutes

---

## Background

React Router v8 consolidates DOM APIs into `react-router/dom` and removes the `react-router-dom` re-export package. This app uses only the declarative mode (`<BrowserRouter>` + `<Routes>` + `<Route>`) — no data router, no loaders, no actions, no meta functions, no splat routes.

**Current state:**
- `react-router` pinned at `7.18.4`
- 4 files import from `react-router`
- No `react-router-dom` (already removed in v7 migration)
- No `meta` functions, no `useMatches().data`, no data router APIs
- React `^19.2.8` (≥ 19.2.7 ✅)
- Vite `^8.3.0` (≥ 7 ✅)

---

## Analysis

### Future flags

All 5 future flags are framework/data mode only. **Not applicable** to this app:

| Flag | Applicable? | Notes |
|------|-------------|-------|
| `v8_middleware` | No | No data router / framework mode |
| `v8_splitRouteModules` | No | No `<RouterProvider>` / data router |
| `v8_viteEnvironmentApi` | No | No SSR / custom server config |
| `v8_passThroughRequests` | No | No loaders/actions |
| `v8_trailingSlashAwareDataRequests` | No | No `.data` request handling |

### Breaking changes

| Change | Applicable? | Notes |
|--------|-------------|-------|
| `meta`/`matches` `.data` → `loaderData` | No | No meta functions |
| `react-router-dom` removal | No | Already removed in v7 migration |
| Cloudflare plugin | No | Not using Cloudflare |
| `@react-router/architect` | No | Not using adapters |

### Minimum versions

| Requirement | Current | Required | Status |
|-------------|---------|----------|--------|
| `react` | `^19.2.8` | `≥19.2.7` | ✅ |
| `react-dom` | `^19.2.8` | `≥19.2.7` | ✅ |
| `vite` | `^8.3.0` | `≥7` | ✅ |

---

## Implementation Steps

### Step 1: Update package.json

```diff
- "react-router": "7.18.4"
+ "react-router": "8.4.0"
```

### Step 2: Install and verify

```sh
pnpm install
pnpm build
pnpm lint
```

---

## Acceptance

- [x] `package.json` has `react-router@8.4.0`
- [x] `pnpm build` succeeds without errors
- [x] Dev server runs without console warnings
- [x] All routes work correctly (/ → /about → /projects → /projects/:id → /engineering → /contact)
- [x] Navigation highlighting works (NavLink active state)
- [x] Mobile menu still works
- [x] Project detail page works (useParams + Link)

---

## Notes

- v8 upgrade is non-breaking for this app (pure declarative `<BrowserRouter>` pattern)
- No code changes needed — only package version bump
- `react-router-dom` already removed in v7 migration
- All future flags are framework/data mode only, not applicable to this app
