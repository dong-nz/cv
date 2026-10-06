# Specification - Rolling Text Navigation Links

> **Document:** `spec-v2-nav-rolling-text.md`
> **Version:** 0.1.0
> **Parent:** `spec-ui-navigation.md`
> **Priority:** P2
> **Estimate:** ~45 minutes

---

## Requirement

Apply the rolling text button animation pattern (from `docs/sample-code/rolling-text-button.md`) to navigation menu links in `Navigation.tsx`. On hover/focus, the link text slides out downward while an identical copy slides in from below.

---

## Animation Design

### Pattern

Based on the sample code's dual-span approach:

| Element | Variant | Initial | Hover/Focus |
|---|---|---|---|
| Outgoing `<motion.span>` | `rest` → `active` | `translateY(0%)` | `translateY(100%)` |
| Incoming `<motion.span>` | `rest` → `active` | `translateY(-100%)` | `translateY(0%)` |

### Timing

| Property | Value |
|---|---|
| Duration | `0.3s` |
| Easing | `[0.338, 0.015, 0.395, 0.959]` (custom cubic-bezier, snappy ease-out) |
| Trigger | `onHoverStart`/`onHoverEnd` + `onFocus`/`onBlur` |

### Accessibility

- `useReducedMotion` from `motion/react` disables animation when user prefers reduced motion
- When reduced motion is active, text swaps instantly with no animation
- `aria-hidden="true"` on the animated label spans (text is still read by screen reader via parent `<a>`)

---

## Component Architecture

### `RollingTextLink` — new component

Extracted as a reusable component in `src/components/ui/RollingTextLink.tsx`:

```tsx
import { motion, useReducedMotion } from "motion/react"
import { useRef, useState } from "react"

interface RollingTextLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  isActive?: boolean
}

const outgoingVariants = {
  rest: { transform: "translateY(0%)" },
  active: { transform: "translateY(100%)" },
}

const incomingVariants = {
  rest: { transform: "translateY(-100%)" },
  active: { transform: "translateY(0%)" },
}

const transition = {
  duration: 0.3,
  ease: [0.338, 0.015, 0.395, 0.959] as const,
}

export function RollingTextLink({ to, children, className, isActive }: RollingTextLinkProps) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(false)
  const activeRef = useRef(false)
  const animating = useRef(false)
  const pendingRequest = useRef<boolean | null>(null)
  const hovered = useRef(false)
  const focused = useRef(false)

  const updateActive = (next: boolean) => {
    activeRef.current = next
    setActive(next)
  }

  const requestActive = (next: boolean) => {
    if (reduceMotion) return

    if (next === activeRef.current) {
      pendingRequest.current = null
      return
    }

    if (animating.current) {
      pendingRequest.current = next
      return
    }

    animating.current = true
    updateActive(next)
  }

  const completeAnimation = () => {
    if (!animating.current) return
    animating.current = false

    if (pendingRequest.current !== null && pendingRequest.current !== activeRef.current) {
      const next = pendingRequest.current
      pendingRequest.current = null
      animating.current = true
      updateActive(next)
    } else {
      pendingRequest.current = null
    }
  }

  return (
    <a
      href={to}
      className={className}
      aria-label={typeof children === 'string' ? children : undefined}
      onHoverStart={() => {
        hovered.current = true
        requestActive(true)
      }}
      onHoverEnd={() => {
        hovered.current = false
        requestActive(focused.current)
      }}
      onFocus={() => {
        focused.current = true
        requestActive(true)
      }}
      onBlur={() => {
        focused.current = false
        requestActive(hovered.current)
      }}
    >
      <span style={{ position: "relative", display: "inline-block", overflow: "hidden" }}>
        <motion.span
          style={{ display: "block", whiteSpace: "nowrap" }}
          variants={outgoingVariants}
          initial="rest"
          animate={active ? "active" : "rest"}
          onAnimationComplete={completeAnimation}
          transition={transition}
        >
          {children}
        </motion.span>
        <motion.span
          style={{
            display: "block",
            whiteSpace: "nowrap",
            position: "absolute",
            inset: 0,
          }}
          variants={incomingVariants}
          initial="rest"
          animate={active ? "active" : "rest"}
          transition={transition}
        >
          {children}
        </motion.span>
      </span>
    </a>
  )
}
```

---

## Integration Points

### Desktop nav links (`<NavLink>` → `<RollingTextLink>`)

Replace in `src/components/layout/Navigation.tsx`:

```tsx
// Before
<NavLink to={item.path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
  {item.label}
</NavLink>

// After
<RollingTextLink
  to={item.path}
  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
>
  {item.label}
</RollingTextLink>
```

### Mobile nav links

Same replacement in the mobile menu section:

```tsx
// Before
<NavLink
  to={item.path}
  className={({ isActive }) => isActive ? 'mobile-menu-link active' : 'mobile-menu-link'}
  onClick={() => setMobileOpen(false)}
>
  {item.label}
</NavLink>

// After
<RollingTextLink
  to={item.path}
  className={({ isActive }) => isActive ? 'mobile-menu-link active' : 'mobile-menu-link'}
  onClick={() => setMobileOpen(false)}
>
  {item.label}
</RollingTextLink>
```

### CSS — no changes required

The rolling text uses inline styles for the animation container. Existing `.nav-link` and `.mobile-menu-link` classes remain unchanged — color, hover color, active state, and underline all apply to the parent `<a>` as before.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Rapid hover enter/leave | `pendingRequest` queue ensures animation completes current frame before starting next |
| `prefers-reduced-motion` | Animation disabled; text swaps instantly |
| Active link (current page) | Text still rolls on hover; `active` class preserved |
| Mobile menu open | Touch triggers `onHoverStart`/`onHoverEnd` equivalents via `onFocus`/`onBlur` |
| Screen reader | Parent `<a>` still contains text node; motion spans have `aria-hidden` |

---

## Acceptance

- [ ] `RollingTextLink` component created in `src/components/ui/RollingTextLink.tsx`
- [ ] Desktop nav links use `RollingTextLink` wrapping label text
- [ ] Mobile nav links use `RollingTextLink` wrapping label text
- [ ] Text slides out downward on hover, new text slides in from below
- [ ] Transition: 0.3s, cubic-bezier `[0.338, 0.015, 0.395, 0.959]`
- [ ] `useReducedMotion` respected — no animation when preferred
- [ ] Rapid hover transitions handled without jank (queue system)
- [ ] Active link state preserved (color + underline)
- [ ] Hover color transition still works (parent `<a>` handles `color`)
- [ ] Builds clean (`pnpm build`) with no type errors
- [ ] Existing `.nav-link` / `.mobile-menu-link` CSS classes unchanged
