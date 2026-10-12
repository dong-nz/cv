# Specification - v3 UI Enhancements

  firstName: "Dong",
  lastName: "Nguyen",
  name: "Dong Nguyen",
> **Parent:** `spec-v2-homepage-enhancements.md`
> **Status:** Draft — not yet implemented

---

## Overview

Enhance the portfolio UI with visual effects inspired by modern developer portfolios. All features use existing dependencies (`motion`/`framer-motion`, CSS) — no new packages required.

## Implementation Progress

| # | Feature | Status | File(s) |
|---|---------|--------|---------|
| 0 | Prerequisites: types + data | ✅ Done | `types/index.ts`, `data/profile.ts`, `SectionHeading.tsx`, `App.css` |
| 1 | Section headers (numbered tags) | ✅ Done | `SectionHeading.tsx`, `App.css`, pages/sections |
| 2 | Hero: greeting + animated dot | ✅ Done | `Hero.tsx`, `App.css` |
| 3 | Hero: gradient name highlight | ✅ Done | `Hero.tsx`, `App.css` |
| 4 | Hero: background grid | ✅ Done | `Hero.tsx`, `App.css` |
| 5 | Hero: typewriter effect | ✅ Done | `Typewriter.tsx`, `Hero.tsx`, `App.css` |
| 6 | Hero: floating particles | ✅ Done | `HeroParticles.tsx`, `Hero.tsx`, `App.css` |
| 7 | Hero: scroll indicator | ✅ Done | `Hero.tsx`, `App.css` |
| 8 | Button: gradient + outline + icon slide | ✅ Done | `Button.tsx`, `App.css` |
| 9 | Scroll animations: AnimatedSection | ✅ Done | `AnimatedSection.tsx`, `AboutPage.tsx` |
| 10 | Logo: bracket format | ✅ Done | `Navigation.tsx`, `App.css` |
| 11 | Build + verify | ✅ Done | type-check + lint pass (build locked by dev server) |
| 12 | Download resume: click outside to close | ✅ Done | `DownloadResume.tsx`, `Hero.tsx`, `App.css`, `hooks/useClickOutside.ts` |
| 13 | Download resume: FontAwesome-style icon | ✅ Done | `DownloadResume.tsx`, `Hero.tsx` |
| 14 | Mobile: hero section responsive fixes | ✅ Done | `App.css` |
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
export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  titleEn?: string;
  tagline: string;
  taglineEn?: string;
  bio: string;
  bioEn?: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl?: string;
  currentInterests: string[];
  roles: string[];
  philosophy: PhilosophyPoint[];
}

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
| Section | Tag | Component | Current Pattern | Change |
|---------|-----|-----------|----------------|--------|
| About | `"01 — About"` | `AboutPage.tsx`, `About.tsx` | `SectionHeading` | Add `tag` prop |
| Expertise | `"02 — Expertise"` | `Expertise.tsx`, AboutPage.tsx | `SectionHeading` | Add `tag` prop |
| Experience | `"03 — Experience"` | `ExperiencePage.tsx`, `Experience.tsx` | `<h2>` inline | Replace with `SectionHeading` |
| Projects | `"04 — Projects"` | `ProjectsListPage.tsx`, `Projects.tsx` | No heading / `<h2>` inline | Add `SectionHeading` |
| Engineering | `"05 — Engineering"` | `EngineeringPage.tsx` | `<h2>` inline | Replace with `SectionHeading` |
| Contact | `"06 — Contact"` | `ContactPage.tsx`, `Contact.tsx` | `SectionHeading` | Add `tag` prop |

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
- `src/components/ui/SectionHeading.tsx` (add `tag` prop)
- `src/App.css` (add `.section-tag` styles)
- `src/pages/AboutPage.tsx` (add `tag` to 2x `SectionHeading`)
- `src/components/sections/About.tsx` (add `tag` to `SectionHeading`)
- `src/components/sections/Expertise.tsx` (add `tag` to `SectionHeading`)
- `src/pages/ExperiencePage.tsx` (replace `<h2>` with `SectionHeading`)
- `src/components/sections/Experience.tsx` (replace `<h2>` with `SectionHeading`)
- `src/pages/ProjectsListPage.tsx` (add `SectionHeading` before grid)
- `src/components/sections/Projects.tsx` (replace `<h2>` with `SectionHeading`)
- `src/pages/EngineeringPage.tsx` (replace `<h2>` with `SectionHeading`)
- `src/pages/ContactPage.tsx` (add `tag` to `SectionHeading`)
- `src/components/sections/Contact.tsx` (add `tag` to `SectionHeading`)

---

---

## 4. Scroll Animations

### 4.1 Unified Animation Wrapper

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



## 5. Footer Enhancements

### 5.1 Back to Top Button

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

## 6. Logo Enhancement

### 6.1 Bracket Logo

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
## 7. Download Resume Dropdown — Click Outside to Close

### 7.1 Controlled Dropdown with Outside Click Close

**Effect:** Replace HTML `<details>` toggle with controlled React state. Click outside the dropdown to close (instead of clicking the button again).

**Current state:**
- `DownloadDropdown` (Contact page) and `HeroDownloadDropdown` (Hero section) use `<details>` element
- Toggles open/close on summary click
- Native `<details>` behavior — no external click handling

**Implementation:**
- Replace `<details>` with controlled `<div>` + React state
- Add `mousedown` + `touchstart` listener on `document` when dropdown is open
- Click outside the dropdown ref → `setOpen(false)`
- Replace `<summary>` with `<button>` (proper accessibility)
- Add `.open` class to options container when open (CSS controls visibility)
- Add `.open` class to summary for chevron rotation

**DownloadResume.tsx changes:**
```tsx
import { useState, useRef, useEffect } from 'react'

function DownloadDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const listener = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [open])

  return (
    <div ref={ref} className="download-resume-dropdown">
      <button
        className="download-resume-summary"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {/* icon + label + chevron */}
      </button>
      <div className={`download-resume-options ${open ? 'open' : ''}`}>
        {/* language options */}
      </div>
    </div>
  )
}
```

**Hero.tsx changes:** Same pattern for `HeroDownloadDropdown`.

**CSS changes (App.css):**
```css
/* Hide options by default, show when .open class present */
.download-resume-dropdown .download-resume-options {
  display: none;
}
.download-resume-dropdown .download-resume-options.open {
  display: block;
}

/* Rotate chevron when summary has .open class */
.download-resume-dropdown .download-resume-summary.open .chevron {
  transform: rotate(180deg);
}
```

**Removed:** `.download-resume-dropdown[open]` pseudo-class selectors (no longer needed).

**Files:**
- `src/components/sections/DownloadResume.tsx` (controlled dropdown)
- `src/components/sections/Hero.tsx` (controlled dropdown)
- `src/App.css` (CSS for `.open` class visibility)
- `src/hooks/useClickOutside.ts` (reusable hook, created but logic inlined)
## 8. Mobile Responsive Fixes

### 8.1 Download Resume Icon — FontAwesome Style

**Effect:** Replace Material Design download icon with FontAwesome-style outline icon (document + arrow).

**Implementation:**
- Update SVG path in `DownloadResume.tsx` and `Hero.tsx`
- New icon: FontAwesome download style with document outline and downward arrow

**Files:**
- `src/components/sections/DownloadResume.tsx`
- `src/components/sections/Hero.tsx`

### 8.2 Hero Section — Mobile Layout

**Issues fixed:**
1. Hero height using `100vh` on mobile includes browser UI (address bar), causing content to be clipped
2. Scroll indicator positioned outside visible viewport due to overflow clipping
3. Social links not centered on mobile
4. Hero text (greeting, title, tagline, social links) invisible in light mode on dark overlay

**Implementation:**

**Hero height:**
```css
@media (max-width: 768px) {
  .hero {
    min-height: 100dvh;  /* Changed from 100vh */
    overflow: hidden;
  }
}
```

**Scroll indicator positioning:**
```css
@media (max-width: 768px) {
  .scroll-indicator {
    position: absolute;
    bottom: 20px;       /* Changed from 40px */
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;        /* Above hero-content (z-index: 1) */
    color: #ffffff;     /* White text on dark overlay */
  }
  .scroll-mouse {
    border-color: rgba(255, 255, 255, 0.5);
  }
  .hero .scroll-indicator span {
    display: block !important;
    color: #ffffff !important;
    opacity: 1 !important;
  }
}
```

**Social links centering:**
```css
@media (max-width: 768px) {
  .social-links {
    justify-content: center;
  }
  .social-link {
    color: #ffffff;  /* White on dark overlay */
  }
}
```

**Hero text colors (light/dark mode consistency):**
```css
@media (max-width: 768px) {
  .hero-name {
    color: #ffffff;
  }
  .hero-title,
  .hero-tagline,
  .hero-greeting {
    color: #e0e0e0;  /* Same color for title, tagline, greeting */
  }
}
```

**Files:**
- `src/App.css` (mobile media query overrides)


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
| 9 | Scroll animations: AnimatedSection | — | 20m |
| 10 | Logo: bracket format | Step 0 | 5m |
| 11 | Build + verify | All | 10m |
| 12 | Download resume: click outside to close | — | 15m |
| 13 | Download resume: FontAwesome-style icon | — | 5m |
| 14 | Mobile: hero section responsive fixes | — | 15m |

**Total:** ~4h 35m


---

## Dependencies

- `motion` (already installed via `framer-motion`)
- No new packages required

---

## Acceptance Criteria

1. [ ] Typewriter cycles through `profile.roles` with cursor blink
2. [ ] Greeting dot pulses continuously
3. [ ] Background grid visible on hero, faded at edges
4. [ ] Particles float upward, 30 desktop / 15 mobile
5. [ ] Scroll indicator with mouse animation at hero bottom
6. [ ] Name uses gradient text fill (lastName only)
7. [ ] Primary buttons: gradient bg, glow shadow, pill shape, lift on hover
8. [ ] Secondary buttons: outline style, glow on hover, lift
9. [ ] Button icons slide right on hover
10. [ ] Section headers have numbered tags
11. [ ] All sections animate in on scroll with direction control
12. [ ] Logo: `{FirstName LastName}` bracket format
13. [ ] Download resume dropdown: click outside to close (instead of toggle on button click)
14. [ ] No new dependencies added
15. [ ] All features work in dark/light themes
16. [ ] No breaking changes to existing layout
17. [ ] `pnpm build` passes (type-check + build)
18. [ ] `pnpm lint` passes
19. [ ] Download resume icon uses FontAwesome-style SVG
20. [ ] Hero section uses `100dvh` on mobile (no clipping)
21. [ ] Scroll indicator visible and centered on mobile
22. [ ] Social links centered on mobile
23. [ ] All hero text (greeting, title, tagline, social links) visible in both dark/light modes on mobile
