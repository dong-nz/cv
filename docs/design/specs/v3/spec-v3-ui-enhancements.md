# Specification - v3 UI Enhancements

> **Document:** `spec-v3-ui-enhancements.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2-homepage-enhancements.md`
> **Status:** Draft — not yet implemented

---

## Overview

Enhance the portfolio UI with visual effects inspired by modern developer portfolios. All features use existing dependencies (`motion`/`framer-motion`, CSS) — no new packages required.

## Implementation Progress

| # | Feature | Status | File(s) |
|---|---------|--------|---------|
| 1 | Section headers (numbered tags) | ⬜ Pending | `SectionHeading.tsx`, `index.css`, `data/*.ts` |
| 2 | Hero: greeting + animated dot | ⬜ Pending | `Hero.tsx`, `App.css` |
| 3 | Hero: gradient name highlight | ⬜ Pending | `Hero.tsx`, `App.css` |
| 4 | Hero: background grid | ⬜ Pending | `Hero.tsx`, `App.css` |
| 5 | Hero: typewriter effect | ⬜ Pending | `Typewriter.tsx`, `Hero.tsx`, `profile.ts`, `index.css` |
| 6 | Hero: floating particles | ⬜ Pending | `HeroParticles.tsx`, `Hero.tsx`, `index.css` |
| 7 | Hero: scroll indicator | ⬜ Pending | `Hero.tsx`, `App.css` |
| 8 | Button: gradient + outline + icon slide | ⬜ Pending | `App.css` |
| 9 | Social links: circular + glow | ⬜ Pending | `SocialLinks.tsx`, `Footer.tsx`, `App.css` |
| 10 | Scroll animations: AnimatedSection | ⬜ Pending | `AnimatedSection.tsx`, `About.tsx`, `Hero.tsx` |
| 11 | Custom cursor | ⬜ Pending | `CustomCursor.tsx`, `Layout.tsx`, `App.css` |
| 12 | Projects: overlay + gradients | ⬜ Pending | `Projects.tsx`, `App.css` |
| 13 | Footer: back to top | ⬜ Pending | `Footer.tsx`, `App.css` |
| 14 | Logo: bracket format | ⬜ Pending | `Navigation.tsx`, `App.css` |

---

## Prerequisites (Type/Data Changes)

Before implementing UI features, update types and data modules:

### 1. Profile Type — Add `firstName`, `lastName`, `roles`

**File:** `src/types/index.ts`

```ts
export interface Profile {
  name: string
  firstName: string      // NEW
  lastName: string       // NEW
  title: string
  titleEn?: string
  tagline: string
  taglineEn?: string
  bio: string
  bioEn?: string
  email: string
  githubUrl: string
  linkedinUrl: string
  resumeUrl?: string
  currentInterests: string[]
  philosophy: PhilosophyPoint[]
}
```

### 2. Profile Data — Fill `firstName`, `lastName`, `roles`

**File:** `src/data/profile.ts`

```ts
export const profile: Profile = {
  name: "Dong Nguyen",
  firstName: "Dong",       // NEW
  lastName: "Nguyen",      // NEW
  title: "Senior Software Engineer",
  // ... existing fields unchanged
  roles: [                  // NEW
    "Full-Stack Developer",
    "System Architect",
    "AI/ML Engineer",
    "Open Source Contributor",
  ],
}
```

### 3. SectionHeading Type — Add `tag` prop

**File:** `src/components/ui/SectionHeading.tsx`

```tsx
interface SectionHeadingProps {
  title: string
  subtitle?: string
  tag?: string           // NEW — e.g. "01 — About"
  id?: string
}
```

---

## 1. Hero Section Enhancements

### 1.1 Typewriter Effect

**Effect:** Role titles cycle with typewriter animation (type → pause → delete → next).

**Implementation:**
- New component: `src/components/ui/Typewriter.tsx`
- Uses `useState` + `useEffect` for character cycling
- Cursor blink via CSS `@keyframes`
- Configurable from `profile.roles`

**Props:**
```tsx
interface TypewriterProps {
  texts: string[]
  typeSpeed?: number      // ms per character (default 80)
  deleteSpeed?: number    // ms per character (default 40)
  pauseDuration?: number  // ms pause at end (default 2000)
}
```

**CSS — cursor blink:**
```css
.typewriter-cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: var(--accent);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

**Files:**
- `src/components/ui/Typewriter.tsx` (new)
- `src/data/profile.ts` (add `roles`)
- `src/types/index.ts` (add `roles` to `Profile`)
- `src/index.css` (cursor blink animation)

---

### 1.2 Greeting with Animated Dot

**Effect:** "Hi, I'm" with a pulsing green dot before the name.

**Implementation:**
- Add `<span className="hero-greeting">` before hero name
- Green dot: `width: 10px; height: 10px; background: var(--success); border-radius: 50%;`
- Pulse animation: `box-shadow` expands from 0 to 8px and fades

**CSS:**
```css
.hero-greeting {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 1.1rem;
  color: var(--text-secondary);
}
.greeting-dot {
  width: 10px;
  height: 10px;
  background: var(--success);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
}
```

**Hero.tsx JSX:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.15 }}
>
  <span className="hero-greeting">
    <span className="greeting-dot" />
    Hi, I'm
  </span>
</motion.div>
```

**Files:**
- `src/components/sections/Hero.tsx`
- `src/index.css`

---

### 1.3 Background Grid Pattern

**Effect:** Subtle grid overlay on hero background, faded at edges via radial mask.

**Implementation:**
- Add `<div className="hero-bg-grid" />` as first child of hero section (after `InView`)
- CSS grid pattern with `linear-gradient`, 60px spacing
- Mask: `radial-gradient(ellipse at center, black 30%, transparent 70%)`
- Color: `rgba(96, 165, 250, 0.03)` (uses `--accent`)

**CSS:**
```css
.hero-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  pointer-events: none;
}
```

**Files:**
- `src/components/sections/Hero.tsx`
- `src/App.css`

---

### 1.4 Floating Particles

**Effect:** Small dots floating upward in the hero background (30 desktop, 15 mobile).

**Implementation:**
- New component: `src/components/sections/HeroParticles.tsx`
- Creates `div.hero-particle` elements via `useMemo` (stable, no re-renders)
- Each particle has random: `left` position, `animationDuration` (8–18s), `animationDelay` (0–10s), `width` (2–5px)
- Animation: `float-particle` keyframes (translateY 100vh → -100px, scale 0 → 1)
- Color: `var(--accent)`

**CSS:**
```css
.hero-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.hero-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--accent);
  border-radius: 50%;
  opacity: 0.3;
  animation: float-particle linear infinite;
}
@keyframes float-particle {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 0.3; }
  90% { opacity: 0.3; }
  100% { transform: translateY(-100px) scale(1); opacity: 0; }
}
```

**HeroParticles.tsx:**
```tsx
export function HeroParticles() {
  const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 15 : 30
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 10 + 8}s`,
      delay: `${Math.random() * 10}s`,
      size: `${Math.random() * 3 + 2}px`,
    })),
    [count]
  )

  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="hero-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
```

**Files:**
- `src/components/sections/HeroParticles.tsx` (new)
- `src/components/sections/Hero.tsx`
- `src/index.css`

---

### 1.5 Scroll Indicator

**Effect:** Mouse icon with scrolling wheel animation at bottom of hero, "Scroll" label.

**Implementation:**
- Add `<div className="scroll-indicator">` at bottom of hero section
- Mouse outline: `24px × 38px`, border radius `12px`
- Wheel: `3px × 8px`, animated `translateY` up and down
- Float animation on entire indicator
- Centered at `bottom: 40px; left: 50%; transform: translateX(-50%)`

**CSS:**
```css
.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  animation: float 3s ease-in-out infinite;
  text-decoration: none;
  pointer-events: none;
}
.scroll-mouse {
  width: 24px;
  height: 38px;
  border: 2px solid var(--border);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}
.scroll-wheel {
  width: 3px;
  height: 8px;
  background: var(--accent);
  border-radius: 2px;
  animation: scroll-wheel 2s ease-in-out infinite;
}
@keyframes scroll-wheel {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(8px); opacity: 0.3; }
}
@keyframes float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}
```

**Hero.tsx JSX:**
```tsx
<div className="scroll-indicator" aria-hidden="true">
  <div className="scroll-mouse">
    <div className="scroll-wheel" />
  </div>
  <span>Scroll</span>
</div>
```

**Files:**
- `src/components/sections/Hero.tsx`
- `src/App.css`

---

### 1.6 Gradient Name Highlight

**Effect:** Last word of name uses gradient text fill instead of solid color.

**Implementation:**
- Use `profile.firstName` + `profile.lastName` (added in prerequisite step)
- Wrap `lastName` in `<span className="name-highlight">`
- CSS: `background: linear-gradient(135deg, var(--accent), #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`

**CSS:**
```css
.name-highlight {
  background: linear-gradient(135deg, var(--accent), #8b5cf6, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Hero.tsx JSX:**
```tsx
<motion.h1 ...>
  {profile.firstName}{" "}
  <span className="name-highlight">{profile.lastName}</span>
</motion.h1>
```

**Files:**
- `src/components/sections/Hero.tsx`
- `src/App.css`
- `src/types/index.ts` (add `firstName`, `lastName`)
- `src/data/profile.ts` (set `firstName`, `lastName`)

---

## 2. Button Enhancements

### 2.1 Gradient Primary Button

**Effect:** Primary buttons use gradient background with glow shadow.

**Implementation:**
- Update `.btn-primary` in `App.css`:
  - Background: `linear-gradient(135deg, var(--accent), #8b5cf6, #a855f7)`
  - Box-shadow: `0 4px 20px rgba(96, 165, 250, 0.3)` (uses `--accent` color)
  - Hover: `transform: translateY(-2px)`, stronger shadow
  - Border radius: `9999px` (pill shape)

**CSS:**
```css
.btn-primary {
  background: linear-gradient(135deg, var(--accent), #8b5cf6, #a855f7);
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(96, 165, 250, 0.3);
  border-radius: 9999px;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(96, 165, 250, 0.4);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(96, 165, 250, 0.3);
}
```

**Files:**
- `src/App.css`

### 2.2 Secondary Outline Button

**Effect:** Secondary buttons become outline style with glow on hover.

**Implementation:**
- Update `.btn-secondary`:
  - Background: `transparent`
  - Border: `1.5px solid var(--border)`
  - Border radius: `9999px` (pill shape)
  - Hover: `border-color: var(--accent)`, `background: rgba(96, 165, 250, 0.1)`, `transform: translateY(-2px)`

**CSS:**
```css
.btn-secondary {
  background: transparent;
  color: var(--accent);
  border: 1.5px solid var(--border);
  border-radius: 9999px;
}
.btn-secondary:hover {
  border-color: var(--accent);
  background: rgba(96, 165, 250, 0.1);
  transform: translateY(-2px);
}
.btn-secondary:active {
  transform: translateY(0);
}
```

**Files:**
- `src/App.css`

### 2.3 Icon Slide on Hover

**Effect:** Button icons slide right on hover (primary buttons with icons).

**Implementation:**
- Add `icon` prop to `Button` component (optional `ReactNode`)
- Wrap icon in `<span className="btn-icon">` when present
- CSS: `transition: transform var(--transition-fast)`
- Hover: `transform: translateX(4px)`

**Button.tsx changes:**
```tsx
interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode  // NEW
  href?: string
  download?: boolean
  target?: string
}
```

**CSS:**
```css
.btn-icon {
  display: inline-flex;
  margin-left: 6px;
  transition: transform var(--transition-fast);
}
.btn-primary:hover .btn-icon,
.btn-secondary:hover .btn-icon {
  transform: translateX(4px);
}
```

**Files:**
- `src/components/ui/Button.tsx`
- `src/App.css`

---

## 3. Section Headers

### 3.1 Numbered Tags

**Effect:** Each section has a numbered tag (e.g., "01 — About", "02 — Expertise").

**Implementation:**
- Add `tag` prop to `SectionHeading` component
- Render `<span className="section-tag">01 — About</span>` before section title
- Style: monospace font, accent color, uppercase, letter-spacing

**SectionHeading.tsx:**
```tsx
interface SectionHeadingProps {
  title: string
  subtitle?: string
  tag?: string   // NEW
  id?: string
}

export function SectionHeading({ title, subtitle, tag, id }: SectionHeadingProps) {
  return (
    <div className="section-heading" id={id}>
      {tag && <span className="section-tag">{tag}</span>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}
```

**Usage per section:**
| Section | Tag | Component |
|---------|-----|-----------|
| About | `"01 — About"` | `AboutPage.tsx` |
| Expertise | `"02 — Expertise"` | `Expertise.tsx` |
| Experience | `"03 — Experience"` | `ExperiencePage.tsx` |
| Projects | `"04 — Projects"` | `ProjectsListPage.tsx` |
| Engineering | `"05 — Engineering"` | `EngineeringPage.tsx` |
| Contact | `"06 — Contact"` | `ContactPage.tsx` |

**CSS:**
```css
.section-tag {
  display: block;
  font-family: var(--mono);
  font-size: 0.85rem;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
}
```

**Files:**
- `src/components/ui/SectionHeading.tsx`
- `src/App.css`
- `src/pages/AboutPage.tsx` (add tag)
- `src/components/sections/Expertise.tsx` (add tag)
- `src/pages/ExperiencePage.tsx` (add tag)
- `src/pages/ProjectsListPage.tsx` (add tag)
- `src/pages/EngineeringPage.tsx` (add tag)
- `src/pages/ContactPage.tsx` (add tag)

---

## 4. Social Links

### 4.1 Circular Social Links

**Effect:** Social icons become circular with border, glow on hover.

**Implementation:**
- Update `.social-link` in both `SocialLinks.tsx` and `Footer.tsx`:
  - Width/height: `48px`
  - Border: `1.5px solid rgba(255, 255, 255, 0.15)`
  - Border radius: `50%`
  - Remove `<span>` label text (icons only)
  - Hover: `border-color: var(--accent)`, `color: var(--accent)`, `transform: translateY(-3px)`, `box-shadow: 0 0 30px rgba(96, 165, 250, 0.15)`

**CSS:**
```css
.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: var(--text-secondary);
  transition: color var(--transition-fast), border-color var(--transition-fast),
              transform var(--transition-fast), box-shadow var(--transition-fast);
}
.social-link:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(96, 165, 250, 0.15);
}
.social-link svg {
  width: 20px;
  height: 20px;
}
/* Hide label text */
.social-link span {
  display: none;
}
```

**SocialLinks.tsx changes:** Remove `<span>{link.label}</span>` from JSX.

**Files:**
- `src/components/ui/SocialLinks.tsx`
- `src/components/layout/Footer.tsx`
- `src/App.css`

---

## 5. Scroll Animations

### 5.1 Unified Animation Wrapper

**Effect:** Sections animate in on scroll with configurable direction and delay.

**Current state:**
- Expertise, Experience, Projects, Contact: `whileInView` fade-in + slide-up (via `motion.section`)
- Hero: `InView` + initial fade-in (no scroll trigger for entrance)
- About: no animation

**Implementation:**
- New component: `src/components/ui/AnimatedSection.tsx`
- Wraps children in `motion.div` with `whileInView` animation
- Accepts `direction` prop: `'up' | 'right' | 'left'`
- Accepts `delay` prop for staggered children
- Uses `InView` for scroll-triggered rendering

**Props:**
```tsx
interface AnimatedSectionProps {
  direction?: 'up' | 'right' | 'left'
  delay?: number
  children: ReactNode
}
```

**AnimatedSection.tsx:**
```tsx
import { motion } from "motion/react"
import { InView } from "@/components/ui/InView"

const directions = {
  up: { y: [40, 0], opacity: [0, 1] },
  right: { x: [-40, 0], opacity: [0, 1] },
  left: { x: [40, 0], opacity: [0, 1] },
}

export function AnimatedSection({
  direction = 'up',
  delay = 0,
  children,
}: AnimatedSectionProps) {
  const { y, opacity } = directions[direction]
  return (
    <InView>
      <motion.div
        initial={{ y, opacity }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -50px 0px" }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </InView>
  )
}
```

**Usage:**
```tsx
// AboutPage.tsx
<AnimatedSection>
  <section className="section container-content" ...>
    {/* content */}
  </section>
</AnimatedSection>

// Expertise.tsx (replace existing motion.section)
<AnimatedSection direction="up" delay={0.1}>
  <section className="section container-wide" ...>
    {/* content */}
  </section>
</AnimatedSection>
```

**Files:**
- `src/components/ui/AnimatedSection.tsx` (new)
- `src/pages/AboutPage.tsx` (wrap with AnimatedSection)
- `src/components/sections/Expertise.tsx` (replace motion.section)
- `src/pages/ExperiencePage.tsx` (replace motion.section)
- `src/pages/ProjectsListPage.tsx` (replace motion.section)
- `src/pages/ContactPage.tsx` (replace motion.section)

---

## 6. Custom Cursor (Desktop Only)

### 6.1 Dot + Follower Cursor

**Effect:** Small dot follows mouse exactly; larger circle follows with lag. Both expand on hover over interactive elements. Disabled on mobile.

**Implementation:**
- New component: `src/components/ui/CustomCursor.tsx`
- Two `div` elements: `.cursor` (8px dot) and `.cursor-follower` (40px circle)
- Mouse move listener updates dot position immediately
- `requestAnimationFrame` loop interpolates follower position (lerp factor 0.1)
- Hover detection on `a, button, .project-card, .skill-tag, .filter-btn, .social-link`
- Active state: scale dot to 3x, reduce follower opacity to 0.5
- `mix-blend-mode: difference` for dot
- Hidden on `≤768px` via CSS media query
- Rendered once in `Layout.tsx` (NOT in App.tsx — ensures single instance across routes)

**CSS:**
```css
.cursor {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  transition: transform 0.1s ease, opacity 0.1s ease;
  mix-blend-mode: difference;
}
.cursor-follower {
  width: 40px;
  height: 40px;
  border: 1.5px solid var(--accent);
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease, height 0.3s ease;
  transform: translate(-50%, -50%);
}
.cursor.active {
  transform: scale(3);
  opacity: 0.5;
}
.cursor-follower.active {
  width: 60px;
  height: 60px;
  opacity: 0.5;
}
@media (max-width: 768px) {
  .cursor, .cursor-follower { display: none !important; }
}
```

**CustomCursor.tsx:**
```tsx
import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const mouseX = useRef(0)
  const mouseY = useRef(0)
  const followerX = useRef(0)
  const followerY = useRef(0)
  const rafId = useRef<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth <= 768) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX
      mouseY.current = e.clientY
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
    }

    const animate = () => {
      followerX.current += (mouseX.current - followerX.current) * 0.1
      followerY.current += (mouseY.current - followerY.current) * 0.1
      if (followerRef.current) {
        followerRef.current.style.left = followerX.current + 'px'
        followerRef.current.style.top = followerY.current + 'px'
      }
      rafId.current = requestAnimationFrame(animate)
    }

    const interactiveSelectors = 'a, button, .project-card, .skill-tag, .filter-btn, .social-link'
    const handleMouseEnter = () => {
      cursorRef.current?.classList.add('active')
      followerRef.current?.classList.add('active')
    }
    const handleMouseLeave = () => {
      cursorRef.current?.classList.remove('active')
      followerRef.current?.classList.remove('active')
    }

    document.addEventListener('mousemove', handleMouseMove)
    rafId.current = requestAnimationFrame(animate)
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)

    return () => {
      cancelAnimationFrame(rafId.current)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="cursor" aria-hidden="true" />
      <div ref={followerRef} className="cursor-follower" aria-hidden="true" />
    </>
  )
}
```

**Layout.tsx changes:** Add `<CustomCursor />` after `<main>`:
```tsx
<main id="main-content">
  <Routes>...</Routes>
</main>
<CustomCursor />
```

**Files:**
- `src/components/ui/CustomCursor.tsx` (new)
- `src/components/layout/Layout.tsx`
- `src/App.css`

---

## 7. Projects Enhancements

### 7.1 Project Card Overlay

**Effect:** On hover, project cards show overlay with live demo / source code links.

**Implementation:**
- Add `<div className="project-overlay">` inside each project card
- Overlay: full coverage, semi-transparent background, center-aligned links
- Links: circular icons for GitHub and external link
- Overlay fades in on card hover: `opacity: 0 → 1`
- Link icons slide up from bottom: `transform: translateY(10px) → 0`

**CSS:**
```css
.project-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
  border-radius: inherit;
}
.project-card:hover .project-overlay {
  opacity: 1;
}
.project-links {
  display: flex;
  gap: 16px;
}
.project-link {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  border-radius: 50%;
  color: white;
  transform: translateY(10px);
  transition: transform var(--transition-base), background var(--transition-fast);
  text-decoration: none;
}
.project-card:hover .project-link {
  transform: translateY(0);
}
.project-link:hover {
  background: var(--accent-hover);
}
```

**Projects.tsx changes:** Wrap card content with overlay:
```tsx
<div className="project-card">
  {/* existing card content (image, title, summary, tags) */}
  <div className="project-overlay">
    <div className="project-links">
      {project.demoUrl && (
        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-link" aria-label="Live Demo">
          <svg>...</svg>
        </a>
      )}
      {project.githubUrl && (
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link" aria-label="Source Code">
          <svg>...</svg>
        </a>
      )}
    </div>
  </div>
</div>
```

**Files:**
- `src/components/sections/Projects.tsx`
- `src/App.css`

### 7.2 Gradient Card Placeholders

**Effect:** Project cards without images use unique gradient backgrounds.

**Implementation:**
- Use CSS `nth-child` selectors with different gradient pairs
- Each gradient uses `--accent`-family colors for theme consistency

**Gradients:**
| Card | Dark Theme | Light Theme |
|------|-----------|-------------|
| 1 | `linear-gradient(135deg, #60a5fa, #818cf8)` | `linear-gradient(135deg, #2563eb, #4f46e5)` |
| 2 | `linear-gradient(135deg, #ec4899, #f43f5e)` | `linear-gradient(135deg, #db2777, #e11d48)` |
| 3 | `linear-gradient(135deg, #06b6d4, #3b82f6)` | `linear-gradient(135deg, #0891b2, #2563eb)` |
| 4 | `linear-gradient(135deg, #f59e0b, #ef4444)` | `linear-gradient(135deg, #d97706, #dc2626)` |
| 5 | `linear-gradient(135deg, #10b981, #059669)` | `linear-gradient(135deg, #059669, #047857)` |
| 6 | `linear-gradient(135deg, #8b5cf6, #60a5fa)` | `linear-gradient(135deg, #7c3aed, #2563eb)` |

**CSS:**
```css
.project-card:nth-child(1) { background: linear-gradient(135deg, #60a5fa, #818cf8); }
.project-card:nth-child(2) { background: linear-gradient(135deg, #ec4899, #f43f5e); }
.project-card:nth-child(3) { background: linear-gradient(135deg, #06b6d4, #3b82f6); }
.project-card:nth-child(4) { background: linear-gradient(135deg, #f59e0b, #ef4444); }
.project-card:nth-child(5) { background: linear-gradient(135deg, #10b981, #059669); }
.project-card:nth-child(6) { background: linear-gradient(135deg, #8b5cf6, #60a5fa); }
```

**Files:**
- `src/App.css`

---

## 8. Footer Enhancements

### 8.1 Back to Top Button

**Effect:** Floating button appears after scrolling, smoothly scrolls to top.

**Implementation:**
- Add `scrollY` state in `Footer.tsx` via `useEffect` + `window.addEventListener('scroll', ...)`
- Visible when `scrollY > 400px`
- Position: `fixed`, `bottom: 24px`, `right: 24px`
- Icon: upward arrow SVG
- Click: `window.scrollTo({ top: 0, behavior: 'smooth' })`

**CSS:**
```css
.back-to-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--transition-base), transform var(--transition-base), background var(--transition-fast);
  z-index: 100;
  pointer-events: none;
}
.back-to-top.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.back-to-top:hover {
  background: var(--accent-hover);
}
.back-to-top svg {
  width: 20px;
  height: 20px;
}
```

**Footer.tsx changes:**
```tsx
export function Footer() {
  const year = new Date().getFullYear()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <footer className="footer" role="contentinfo">
        {/* existing footer content */}
      </footer>
      <button
        className={`back-to-top ${visible ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </>
  )
}
```

**Files:**
- `src/components/layout/Footer.tsx`
- `src/App.css`

---

## 9. Logo Enhancement

### 9.1 Bracket Logo

**Effect:** Navigation logo uses `{Name}` format with bracket styling.

**Implementation:**
- Update logo in `Navigation.tsx`:
  - `<span className="logo-bracket">{</span>`
  - `<span className="logo-text">{profile.firstName} {profile.lastName}</span>`
  - `<span className="logo-bracket">}</span>`
- Bracket: accent color, monospace font
- Text: white, bold

**CSS:**
```css
.logo-bracket {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 1.2rem;
  font-weight: 700;
}
.logo-text {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.1rem;
}
```

**Navigation.tsx changes:**
```tsx
<Link to="/" className="nav-logo">
  <span className="logo-bracket">{</span>
  <span className="logo-text">
    {profile.firstName} {profile.lastName}
  </span>
  <span className="logo-bracket">}</span>
</Link>
```

**Files:**
- `src/components/layout/Navigation.tsx`
- `src/App.css`
- `src/data/profile.ts` (import `profile`)

---

## Implementation Order

| Step | Feature | Dependencies | Est. Time |
|------|---------|-------------|-----------|
| 0 | Prerequisites: types + data | — | 10m |
| 1 | Section headers (numbered tags) | Step 0 | 15m |
| 2 | Hero: greeting + animated dot | — | 10m |
| 3 | Hero: gradient name highlight | Step 0 | 5m |
| 4 | Hero: background grid | — | 10m |
| 5 | Hero: typewriter effect | Step 0 | 20m |
| 6 | Hero: floating particles | — | 15m |
| 7 | Hero: scroll indicator | — | 10m |
| 8 | Button: gradient + outline + icon slide | — | 10m |
| 9 | Social links: circular + glow | — | 10m |
| 10 | Scroll animations: AnimatedSection | — | 20m |
| 11 | Custom cursor | — | 20m |
| 12 | Projects: overlay + gradients | — | 15m |
| 13 | Footer: back to top | — | 10m |
| 14 | Logo: bracket format | Step 0 | 5m |
| 15 | Build + verify | All | 10m |

**Total:** ~4h 10m

---

## Dependencies

- `motion` (already installed via `framer-motion`)
- No new packages required

---

## Acceptance Criteria

1. [ ] Typewriter cycles through `profile.roles` with cursor blink
2. [ ] Greeting dot pulses continuously
3. [ ] Background grid visible on hero, faded at edges
3. [ ] Particles float upward, 30 desktop / 15 mobile
4. [ ] Scroll indicator with mouse animation at hero bottom
5. [ ] Name uses gradient text fill (lastName only)
6. [ ] Primary buttons: gradient bg, glow shadow, pill shape, lift on hover
7. [ ] Secondary buttons: outline style, glow on hover, lift
8. [ ] Button icons slide right on hover
9. [ ] Section headers have numbered tags
10. [ ] Social links: circular, glow on hover, no text labels
11. [ ] All sections animate in on scroll with direction control
12. [ ] Custom cursor: dot + follower, expands on interactive hover, hidden on mobile
13. [ ] Project cards: overlay on hover with links, gradient placeholders
14. [ ] Back to top button: appears after scroll, smooth scroll to top
15. [ ] Logo: `{FirstName LastName}` bracket format
16. [ ] No new dependencies added
17. [ ] All features work in dark/light themes
18. [ ] No breaking changes to existing layout
19. [ ] `pnpm build` passes (type-check + build)
20. [ ] `pnpm lint` passes
