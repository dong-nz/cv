# Specification — v3 Theme Switch Fix

> **Document:** `spec-v3-theme-switch.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2.md`
> **Priority:** P1
> **Estimate:** ~1 hour

---

## Problem

### 1. Unintuitive Cycle Order

Current cycle: `dark → light → system → (system opposite) → ...`

When user clicks theme toggle:
- `dark` → `light` (expected)
- `light` → `system` (unexpected — user expects `dark`)
- `system` → opposite of system (e.g., if OS is dark → `light`)

The `system` state is confusing because:
- It doesn't cycle to a fixed next state
- It behaves differently depending on the OS theme
- Users don't understand why clicking once from `light` goes to `system` instead of back to `dark`

**Expected cycle:** `dark → light → dark → light ...`

### 2. Initial Load Behavior

Current: When no stored theme exists, defaults to `'system'` (stored as `'system'` in localStorage).

**Expected:**
1. Check for stored theme in localStorage
2. If stored theme exists → use it
3. If no stored theme → detect system theme (`prefers-color-scheme`)
4. If system theme detection available → use it
5. If system theme detection unavailable (older browser) → fallback to `dark`
6. Store the resolved theme (`dark` or `light`) on first load — do NOT store `'system'`

**Why remove `'system'` from cycle?**
- The portfolio is a personal engineering showcase, not a utility app
- Users who care about system preference can set their OS theme
- Explicit `dark`/`light` choices are clearer and more predictable
- Reduces cognitive load: 2 states instead of 3

---

## Goal

1. Fix cycle to simple `dark → light → dark` (remove `system` state)
2. Improve initial load: detect system theme, fallback to dark
3. Store resolved theme (not `'system'`) on first visit

---

## Current Implementation

**File:** `src/hooks/useTheme.tsx`

```typescript
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'portfolio-theme'

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return 'system'
}

function resolveTheme(theme: Theme): 'dark' | 'light' {
  return theme === 'system' ? getSystemTheme() : theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  const resolvedTheme = resolveTheme(theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage unavailable
    }
  }, [resolvedTheme, theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'system') {
        return getSystemTheme() === 'dark' ? 'light' : 'dark'
      }
      if (prev === 'dark') return 'light'
      if (prev === 'light') return 'system'
      return 'dark'
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

---

## Implementation

### Step 1: Change Theme Type

**Before:**
```typescript
type Theme = 'dark' | 'light' | 'system'
```

**After:**
```typescript
type Theme = 'dark' | 'light'
```

### Step 2: Replace getStoredTheme with getInitialTheme

**Before:**
```typescript
function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return 'system'
}
```

**After:**
```typescript
function getInitialTheme(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
  return prefersLight ? 'light' : 'dark'
}
```

**Behavior:**
- If localStorage has `'dark'` or `'light'` → use it
- If localStorage has `'system'` (legacy) → treat as no stored value, fall through
- If localStorage unavailable or empty → detect system theme
- If system detection available → use it (`dark` or `light`)
- If system detection unavailable → fallback to `'dark'`

### Step 3: Remove getSystemTheme and simplify resolveTheme

**Before:**
```typescript
function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'dark' | 'light' {
  return theme === 'system' ? getSystemTheme() : theme
}
```

**After:**
```typescript
// getSystemTheme removed — no longer needed
function resolveTheme(theme: Theme): 'dark' | 'light' {
  return theme
}
```

### Step 4: Update ThemeProvider

**Before:**
```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const resolvedTheme = resolveTheme(theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage unavailable
    }
  }, [resolvedTheme, theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'system') {
        return getSystemTheme() === 'dark' ? 'light' : 'dark'
      }
      if (prev === 'dark') return 'light'
      if (prev === 'light') return 'system'
      return 'dark'
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

**After:**
```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const resolvedTheme = resolveTheme(theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage unavailable
    }
  }, [resolvedTheme, theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

### Step 5: Verify No Other Consumers Need Changes

Check all files that import `useTheme` or reference `Theme` type. Current consumers:
- `src/App.tsx` — uses `useTheme().theme`, `useTheme().resolvedTheme`, `useTheme().cycleTheme`, `useTheme().setTheme`
- `src/components/layout/Navigation.tsx` — uses `useTheme().theme`, `useTheme().cycleTheme`
- `src/components/layout/Footer.tsx` — uses `useTheme().theme`, `useTheme().cycleTheme`

All consumers only read `theme` and `resolvedTheme` values (`'dark' | 'light'`), no pattern matching on `'system'`. No changes needed.

---

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useTheme.tsx` | Remove `system` from type, replace `getStoredTheme` with `getInitialTheme`, simplify `resolveTheme`, remove `getSystemTheme`, fix `cycleTheme` |

---

## Acceptance

- [ ] Theme type is `'dark' | 'light'` (no `'system'`)
- [ ] Cycle order: `dark → light → dark → light ...`
- [ ] First load with no stored theme → uses system theme (dark or light)
- [ ] First load with no system detection → falls back to `dark`
- [ ] Stored theme is always `'dark'` or `'light'` (never `'system'`)
- [ ] Existing stored `'system'` values handled gracefully (treated as no stored value)
- [ ] Theme toggle UI shows only 2 states
- [ ] No other files need changes (consumers verified)
- [ ] Linter (`pnpm lint`) passes
- [ ] Build (`pnpm build`) passes

---

## Open Questions

1. **Migration:** Should we migrate existing `'system'` stored values to the detected system theme, or just treat them as "no stored value"?
   - **Decision:** Treat as "no stored value" (Option A) — user's next toggle will set explicit choice.
2. **System sync:** If we remove `system` state, will users miss the ability to auto-follow OS theme changes?
   - **Decision:** No (Option A) — portfolio is a personal showcase, 2-state cycle is sufficient. Users can set OS theme and clear localStorage if they want auto-follow.
