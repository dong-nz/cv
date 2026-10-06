# UI Spec — About Section

## Overview

Section giới thiệu bản thân, engineering philosophy, và current interests.

---

## Structure

```
AboutSection
├── SectionHeading ("About Me")
├── ProfileBlock
│   ├── Name/Title
│   └── Bio (paragraph)
├── PhilosophyBlock
│   ├── Title ("How I Think About Engineering")
│   └── Philosophy points
│       ├── Build for the real problem
│       ├── Think in systems
│       ├── Measure impact
│       └── Keep learning
├── CurrentInterests
│   └── List of current explorations
└── CTA ("Read more") → /about (optional)
```

---

## Content

| Element | Content |
|---|---|
| **Section title** | About Me |
| **Bio** | _[TBD — bio paragraph]_ |
| **Philosophy title** | How I Think About Engineering |
| **Philosophy points** | Build for real problem, Think in systems, Measure impact, Keep learning |
| **Current interests** | AI in logistics, Digital twins, Simulation, LLM, Computer Vision, High-performance systems |

---

## Layout

### Desktop

- Single column, max-width 800px
- Bio: left-aligned, body font size
- Philosophy: 4 cards hoặc 4 subsections, grid 2x2
- Current interests: tag-style pills hoặc bullet list
- Spacing: section padding 80px vertical

### Mobile

- Single column, stacked
- Philosophy cards: single column stack
- Tags: wrap, full-width
- Spacing: section padding 48px vertical

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Section heading (H2) | 40px desktop / 32px mobile | 600 |
| Bio | 16–18px | 400 |
| Philosophy title (H3) | 24px | 500 |
| Philosophy point | 16px | 400 |
| Interest tag | 14px | 400 |

---

## Philosophy Cards

| Variant | Content |
|---|---|
| Build for the real problem | Không bắt đầu bằng technology. Bắt đầu bằng problem. |
| Think in systems | Architecture, Integration, Scalability, Reliability, Observability |
| Measure impact | Performance, Reliability, Cost, Operational efficiency, Business impact |
| Keep learning | AI/ML, Computer Vision, LLM, Distributed systems, Performance engineering |

---

## Current Interests

- Render as tag pills
- Accent color border, transparent background
- Hover: accent background, white text
- No click behavior (informational)

---

## Accessibility

- H2 cho section heading
- H3 cho philosophy subsections
- Semantic HTML: `<article>` cho philosophy cards
- Contrast >= 4.5:1
- Focus visible trên tags khi hover

---

## Animation

- Fade-in khi scroll vào viewport
- Cards stagger (100ms delay each)
- Subtle, 300ms duration

---

## State

| State | Description |
|---|---|
| Default | Normal render |
| Hover | Tags fill with accent |
| Scroll reveal | Fade-in + slide-up |
| Reduced motion | Disable all animations |

---

## Constraints

- Bio data-driven từ `profile.ts`
- Philosophy points có thể extend — component phải handle dynamic content
- Không hard-code philosophy count
