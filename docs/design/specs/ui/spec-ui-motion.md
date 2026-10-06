# UI Spec - Motion Animations (Homepage)

## Overview

Thêm animations cho toàn bộ homepage sử dụng **motion** library (`motion/react`). Tất cả animations dùng motion API, không CSS keyframes.

---

## Dependency

```bash
pnpm add motion
```

```tsx
import { motion } from "motion/react"
```

---

## Animation Categories

### 1. Enter Animations (Page Load)

| Component | Prop | Values | Transition |
|---|---|---|---|
| Hero container | `initial` → `animate` | `opacity: 0, x: -30` → `opacity: 1, x: 0` | `duration: 0.6, delay: 0.2` |
| Hero name | `initial` → `animate` | `opacity: 0, y: 20` → `opacity: 1, y: 0` | `duration: 0.5, delay: 0.3` |
| Hero title | `initial` → `animate` | `opacity: 0, y: 20` → `opacity: 1, y: 0` | `duration: 0.5, delay: 0.4` |
| Hero tagline | `initial` → `animate` | `opacity: 0, y: 20` → `opacity: 1, y: 0` | `duration: 0.5, delay: 0.5` |
| Hero CTA buttons | `initial` → `animate` | `opacity: 0, y: 20` → `opacity: 1, y: 0` | `duration: 0.5, delay: 0.6` |
| Hero visual (photo) | `initial` → `animate` | `opacity: 0, x: 30` → `opacity: 1, x: 0` | `duration: 0.6, delay: 0.4` |
| OpenToWorkBadge | `initial` → `animate` | `opacity: 0, y: -20` → `opacity: 1, y: 0` | `duration: 0.5, delay: 0.3` |

### 2. Gesture Animations (Hover/Tap)

| Component | Prop | Values |
|---|---|---|
| CTA buttons | `whileHover` | `scale: 1.05` |
| CTA buttons | `whileTap` | `scale: 0.95` |
| Project cards | `whileHover` | `scale: 1.02, y: -4` |
| Project cards | `whileTap` | `scale: 0.98` |
| Social links | `whileHover` | `scale: 1.1` |
| Social links | `whileTap` | `scale: 0.9` |
| Skill items | `whileHover` | `scale: 1.05, y: -2` |
| Skill items | `whileTap` | `scale: 0.98` |

### 3. Scroll Animations (whileInView)

| Component | Prop | Values |
|---|---|---|
| Section titles | `initial` → `whileInView` | `opacity: 0, y: 30` → `opacity: 1, y: 0` |
| Expertise cards | `initial` → `whileInView` | `opacity: 0, y: 30` → `opacity: 1, y: 0` |
| Experience entries | `initial` → `whileInView` | `opacity: 0, y: 30` → `opacity: 1, y: 0` |
| Project cards | `initial` → `whileInView` | `opacity: 0, y: 30` → `opacity: 1, y: 0` |
| Contact section | `initial` → `whileInView` | `opacity: 0, y: 30` → `opacity: 1, y: 0` |

**Viewport config:**
```tsx
viewport={{ once: true, amount: 0.1 }}
transition={{ duration: 0.5 }}
```

---

## Reusable Components

### `src/components/ui/InView.tsx`

Wrapper component cho scroll animations.

```tsx
import { motion, type MotionProps } from "motion/react"
import { ReactNode } from "react"

interface InViewProps extends Omit<MotionProps, "children"> {
  children: ReactNode
  delay?: number
  threshold?: number
  className?: string
}

export function InView({
  children,
  delay = 0,
  threshold = 0.1,
  className,
  ...props
}: InViewProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
```

**Usage:**
```tsx
<InView delay={0.1}>
  <h2>Section Title</h2>
</InView>
```

### `src/components/ui/GestureButton.tsx`

Wrapper cho hover/tap animations.

```tsx
import { motion, type MotionProps } from "motion/react"
import { ComponentPropsWithRef, ElementType } from "react"

interface GestureButtonProps extends MotionProps {
  as?: ElementType
  className?: string
  children: React.ReactNode
}

export function GestureButton({ as: Tag = "button", className, ...props }: GestureButtonProps) {
  const MotionTag = motion(Tag as any)
  return (
    <MotionTag
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    />
  )
}
```

---

## Component Updates

### `src/components/sections/Hero.tsx`

Wrap các phần tử với motion:

```tsx
import { motion } from "motion/react"

export function Hero() {
  return (
    <motion.section
      className="hero container-wide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      aria-labelledby="hero-heading"
    >
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.h1
          id="hero-heading"
          className="hero-name"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {profile.name}
        </motion.h1>
        <motion.p
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {profile.title}
        </motion.p>
        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {profile.tagline}
        </motion.p>
        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button href="/projects" variant="primary">
            View Projects
          </Button>
          {resumeAvailable && (
            <Button href="/resume.pdf" variant="secondary" download>
              Download Resume
            </Button>
          )}
          <Button href="/contact" variant="secondary">
            Contact Me
          </Button>
        </motion.div>
        <SocialLinks links={socialLinks} />
      </motion.div>
      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <img src="/profile-photo.webp" alt="Profile photo" className="hero-photo" />
        <OpenToWorkBadge />
      </motion.div>
    </motion.section>
  )
}
```

### `src/components/ui/Button.tsx`

Thêm hover/tap animation:

```tsx
import { motion } from "motion/react"

// Thay thế <button> bằng:
<motion.button
  className={`btn btn-${variant}`}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ scale: 1.05 }}
  {...buttonProps}
>
  {children}
</motion.button>
```

### `src/components/sections/ExpertiseSection.tsx`

Wrap section và stagger children:

```tsx
import { motion } from "motion/react"

export function ExpertiseSection() {
  return (
    <InView>
      <motion.section
        className="expertise-section container-wide"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        <motion.h2 className="section-title" variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
        }}>
          Core Expertise
        </motion.h2>
        <div className="expertise-grid">
          {expertiseGroups.map((group, i) => (
            <motion.div
              key={group.title}
              className="expertise-card"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3>{group.title}</h3>
              <ul>
                {group.skills.map(skill => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </InView>
  )
}
```

### `src/components/sections/ExperienceSection.tsx`

```tsx
<InView>
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    }}
  >
    <motion.h2 variants={titleVariants}>Experience</motion.h2>
    {experience.map((exp, i) => (
      <motion.div
        key={exp.company}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.15 } }
        }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Experience content */}
      </motion.div>
    ))}
  </motion.section>
</InView>
```

### `src/components/sections/ProjectsSection.tsx`

```tsx
<InView>
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }}
  >
    <motion.h2 variants={titleVariants}>Featured Projects</motion.h2>
    <div className="projects-grid">
      {projects.map((project, i) => (
        <motion.div
          key={project.title}
          className="project-card"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }
          }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Project content */}
        </motion.div>
      ))}
    </div>
  </motion.section>
</InView>
```

### `src/components/sections/ContactSection.tsx`

```tsx
<InView>
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.5 } }
    }}
  >
    <motion.h2 variants={titleVariants}>Get In Touch</motion.h2>
    {/* Contact content */}
  </motion.section>
</InView>
```

---

## Reduced Motion

Motion library auto-handles `prefers-reduced-motion` khi config:

```tsx
// Trong main.tsx hoặc app root
import { motion, domMax } from "motion/react"

// Option 1: Global config
motion.config.reducedMotion = "user"

// Option 2: Per-component
<motion.div
  animate={{ x: 100 }}
  transition={{ type: "spring" }}
  reducedMotionConfig={{ type: "tween", duration: 0.3 }}
/>
```

**Effect:**
- Enter animations: skip, hiển thị ngay
- Scroll animations: hiển thị ngay khi in view
- Gesture animations: vẫn hoạt động (hover/tap state)
- Infinite animations (swaying): dừng lại

---

## CSS Changes

### Removed:
- CSS `@keyframes` cho animations (nếu có)
- CSS `animation` properties
- CSS `prefers-reduced-motion` media queries (motion auto-handled)

### Added:
- Chỉ layout/styling CSS (position, color, font, spacing)
- Không có animation CSS

---

## Files Summary

| File | Action | Changes |
|---|---|---|
| `package.json` | Modify | Add `motion` dependency |
| `src/components/sections/Hero.tsx` | Modify | motion enter animations |
| `src/components/ui/Button.tsx` | Modify | motion hover/tap |
| `src/components/ui/InView.tsx` | **New** | Reusable scroll wrapper |
| `src/components/sections/Expertise.tsx` | Modify | motion scroll + hover |
| `src/components/sections/Experience.tsx` | Modify | motion scroll + hover |
| `src/components/sections/Projects.tsx` | Modify | motion scroll + hover |
| `src/components/sections/Contact.tsx` | Modify | motion scroll |
| `src/main.tsx` | Modify | Set `motion.config.reducedMotion` |
| `src/App.css` | Modify | Remove animation CSS, keep layout |

---

## Animation Timing Summary

| Element | Delay | Duration | Type |
|---|---|---|---|
| Hero container | 0s | 0.3s | fade |
| Hero content | 0.2s | 0.6s | slide-left |
| Hero name | 0.3s | 0.5s | slide-up |
| Hero title | 0.4s | 0.5s | slide-up |
| Hero tagline | 0.5s | 0.5s | slide-up |
| Hero CTA | 0.6s | 0.5s | slide-up |
| Hero visual | 0.4s | 0.6s | slide-right |
| OTW badge | 0.3s | 0.5s | slide-down + fade |
| Section titles | scroll | 0.5s | slide-up |
| Cards/entries | scroll | 0.5s | slide-up + stagger |
| Buttons/cards | hover | 0.2s | scale |
