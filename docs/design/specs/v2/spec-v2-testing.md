# Specification — v2 Testing

> **Document:** `spec-v2-testing.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2.md`
> **Priority:** P5
> **Estimate:** ~3 hours

---

## Requirement

Unit tests cho components và hooks. E2E tests cho critical paths.

---

## Stack

- **Vitest** — unit/integration tests
- **@testing-library/react** — component tests
- **@testing-library/jest-dom** — assertions
- **Playwright** — E2E tests

---

## Test Structure

```
src/
  __tests__/
    hooks/
      useTheme.test.tsx
    components/
      Navigation.test.tsx
      Footer.test.tsx
      Badge.test.tsx
    pages/
      HomePage.test.tsx
  e2e/
    navigation.spec.ts
    theme.spec.ts
    responsive.spec.ts
```

---

## Critical Tests

### useTheme

```tsx
test('cycles through themes correctly', () => {
  const { result } = renderHook(() => useTheme())
  act(() => { result.current.cycleTheme() })
  expect(result.current.theme).toBe('light')
})

test('persists theme to localStorage', () => {
  renderHook(() => useTheme())
  expect(localStorage.getItem('portfolio-theme')).toBe('dark')
})
```

### Navigation

```tsx
test('renders all nav items', () => {
  render(<Navigation />)
  navItems.forEach(item => {
    expect(screen.getByText(item.label)).toBeInTheDocument()
  })
})

test('NavLink highlights active route', () => {
  render(<MemoryRouter initialEntries={['/about']}> <Navigation /> </MemoryRouter>)
  expect(screen.getByText('About')).toHaveClass('active')
})
```

### HomePage

```tsx
test('renders hero section', () => {
  render(<HomePage />)
  expect(screen.getByRole('heading', { name: profile.name })).toBeInTheDocument()
})
```

---

## Acceptance

- [ ] useTheme tests pass
- [ ] Navigation tests pass
- [ ] HomePage tests pass
- [ ] E2E: navigation works
- [ ] E2E: theme toggle works
- [ ] E2E: responsive layout correct
- [ ] Test coverage > 70%
