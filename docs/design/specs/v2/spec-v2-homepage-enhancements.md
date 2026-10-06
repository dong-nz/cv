# Homepage Enhancements — Section Improvements

## Overview

Enhance all homepage sections with three improvements:
1. Proper mobile padding (text not too close to edges)
2. Smooth scroll transitions between sections
3. Unified container width for consistent alignment

---

## 1. Mobile Padding Fix

### Problem

On small screens (≤768px), text content is too close to the left/right edges due to fixed `padding: 0 24px`.

### Current

```css
/* src/index.css */
.container-wide,
.container-content,
.container-narrow {
  padding: 0 24px; /* fixed, all screen sizes */
}

.section {
  padding: 80px 0;
}

@media (max-width: 768px) {
  .section {
    padding: 48px 0; /* vertical only */
  }
}
```

### Proposed

**src/index.css** — Add two media queries for container padding:

```css
/* Mobile: ≤768px */
@media (max-width: 768px) {
  .section {
    padding: 48px 0;
  }
  .container-wide,
  .container-content,
  .container-narrow {
    padding-left: 32px;
    padding-right: 32px;
  }
}

/* Medium: 769px–1200px */
@media (min-width: 769px) and (max-width: 1200px) {
  .container-wide,
  .container-content,
  .container-narrow {
    padding-left: 40px;
    padding-right: 40px;
  }
}
```

**src/App.css** — Add hero-content padding for medium screens:

```css
/* Medium: 769px–1200px */
@media (min-width: 769px) and (max-width: 1200px) {
  .hero-content {
    padding-left: 16px;
    padding-right: 16px;
  }
}
```

### Breakpoints

| Screen size | Container padding | Hero-content padding |
|---|---|---|
| ≤768px (mobile) | 32px | 24px (already set) |
| 769px–1200px (tablet/laptop) | 40px | 16px (new) |
| >1200px (desktop) | 24px | 0 |

### Files

- `src/index.css`
- `src/App.css`
---

## 2. Smooth Scroll Transitions

### Problem

- `Hero` and `About` have no scroll animations
- No scroll-driven parallax effects
- Section transitions feel abrupt

### Current State

| Section | Animation |
|---|---|
| Hero | Fade-in (opacity only, no scroll trigger) |
| About | No animation |
| Expertise | `whileInView` fade-in + slide-up |
| Experience | `whileInView` fade-in + slide-up |
| Projects | `whileInView` fade-in + slide-up |
| Contact | `whileInView` fade-in + slide-up |

### Proposed Changes

#### 2.1 Add `InView` Wrapper for Hero + About

**Hero.tsx:** Wrap section with `InView` to trigger scroll animation:

```tsx
import { InView } from "@/components/ui/InView"

export function Hero() {
  return (
    <InView>
      <motion.section
        className="hero container-wide"
        // ... existing motion props
      >
        {/* content */}
      </motion.section>
    </InView>
  )
}
```

**About.tsx:** Wrap section with `InView`:

```tsx
import { InView } from "@/components/ui/InView"

export function About() {
  return (
    <InView>
      <section className="section container-content" aria-labelledby="about-heading">
        {/* content */}
      </section>
    </InView>
  )
}
```

#### 2.2 Hero Parallax Effect

Add scroll-driven parallax: hero photo moves on scroll, hero content fades out.

```tsx
import { motion, useScroll, useTransform } from "motion/react"

export function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, -80])
  const opacity = useTransform(scrollY, [0, 200], [1, 0.3])

  return (
    <motion.section className="hero container-wide">
      <motion.div className="hero-content" style={{ opacity }}>
        {/* content */}
      </motion.div>
      <motion.div className="hero-visual" style={{ y }}>
        <img src="/profile-photo.webp" alt="Profile photo" className="hero-photo" />
      </motion.div>
    </motion.section>
  )
}
```

**Effect:** Hero photo moves up 80px as user scrolls 300px (parallax). Hero content fades to 30% opacity over first 200px scroll.

#### 2.3 Section Background Gradient

Add subtle gradient transition between sections for smooth visual flow:

```css
/* src/App.css */
.section {
  position: relative;
}

.section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--bg-primary) 10%,
    var(--bg-primary) 90%,
    transparent 100%
  );
  pointer-events: none;
  z-index: -1;
}
```

**Effect:** Creates a smooth fade from section content to background at top/bottom edges (10% gradient zone).

### Files

- `src/components/sections/Hero.tsx`
- `src/components/sections/About.tsx`
- `src/App.css`

---

## 3. Container Width Alignment

### Problem

Sections alternate between two container widths (1200px ↔ 800px) → titles zigzag, hard to follow vertically.

### Solution

Unify all sections to use `container-wide` (1200px) for consistent title alignment. Text-heavy content gets inner `maxWidth: '700px'` wrapper for readability.

### Changes

**About.tsx:**
```tsx
// Before
<section className="section container-content">
// After
<section className="section container-wide">
```

**Experience.tsx:**
```tsx
// Before
<motion.section className="section container-content">
// After
<motion.section className="section container-wide">
  {/* Added wrapper */}
  <div style={{ maxWidth: '700px' }}>
    <div className="timeline">...</div>
  </div>
</motion.section>
```

**Contact.tsx:**
```tsx
// Before
<motion.section className="section container-content">
// After
<motion.section className="section container-wide">
  {/* Added wrapper */}
  <div style={{ maxWidth: '700px' }}>
    <div className="contact-links">...</div>
  </div>
</motion.section>
```

### Result

| Section | Container | Content Width |
|---|---|---|
| Hero | `container-wide` | N/A (grid layout) |
| About | `container-wide` | 700px (inner div) |
| Expertise | `container-wide` | N/A (grid layout) |
| Experience | `container-wide` | 700px (inner div) |
| Projects | `container-wide` | N/A (grid layout) |
| Contact | `container-wide` | 700px (inner div) |

All titles now align at the same left position. Grid sections use full width. Text sections constrained to 700px for readability.

### Files

- `src/components/sections/About.tsx`
- `src/components/sections/Experience.tsx`
- `src/components/sections/Contact.tsx`

---

## Implementation Order

| Step | Task | Files | Est. Time |
|---|---|---|---|
| 1 | Mobile padding fix | `src/index.css` | 5m |
| 2 | Add InView to Hero + About | `Hero.tsx`, `About.tsx` | 10m |
| 3 | Hero parallax effect | `Hero.tsx` | 15m |
| 4 | Section background gradient | `src/App.css` | 10m |
| 5 | Build + verify | — | 5m |

**Total:** ~45m

---

## Dependencies

- `motion` (already installed)
- No new dependencies

---

## Acceptance Criteria

1. [ ] On mobile (≤768px), text has 32px padding on both sides (not 24px)
2. [ ] Hero has scroll animation (fadeInUp on viewport entry)
3. [ ] About has scroll animation (fadeInUp on viewport entry)
4. [ ] Hero photo has parallax effect on scroll
5. [ ] All sections have scroll reveal animation (fade-in + slide-up)
6. [ ] Build passes (`tsc -b && vite build`)
7. [ ] No breaking changes to desktop layout
