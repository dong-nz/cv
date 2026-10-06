# UI Spec — Projects Section

## Overview

Homepage section hiển thị 3–4 featured projects dạng grid cards.

---

## Structure

```
ProjectsSection
├── SectionHeading ("Featured Projects")
├── ProjectGrid (×3–4)
│   └── ProjectCard (×N)
│       ├── CategoryBadge
│       ├── Title
│       ├── Summary (1–2 lines)
│       ├── TechStack (tags)
│       ├── Metrics (optional)
│       └── CTA ("View Details")
└── ViewAllLink → /projects
```

---

## Content Model

```ts
interface Project {
  id: string;
  title: string;
  summary: string;
  category: ProjectCategory;
  role: string;
  technologies: string[];
  metrics?: string[];
  featured: boolean;
  githubUrl?: string;
  demoUrl?: string;
  images?: string[];
}

type ProjectCategory =
  | "software-engineering"
  | "logistics"
  | "ai-ml"
  | "computer-vision"
  | "architecture"
  | "experiment";
```

---

## Layout

### Desktop

- Grid: 2 columns (2x2)
- Cards: equal height, flex layout
- Category badge: top-left corner
- Title: H3, accent color
- Summary: 2 lines max, truncate
- Tech stack: row of small pills
- Metrics: accent highlight box
- CTA: link/button dưới cùng

### Mobile

- Single column stack
- Cards full-width
- Summary: 1 line max
- Tech stack: wrap pills
- CTA: full-width button

### Tablet

- Grid: 1 column (or 2 if cards small)

---

## ProjectCard

| Variant | Style |
|---|---|
| Default | Border, padding, flex column |
| Hover | Shadow, border accent, lift 2px |
| Featured | Accent top border (4px) |

---

## CategoryBadge

| Category | Color |
|---|---|
| software-engineering | accent color |
| logistics | accent color |
| ai-ml | accent color |
| computer-vision | accent color |
| architecture | accent color |
| experiment | accent color |

_Only one accent color — use different icon/symbol per category if needed._

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Section heading (H2) | 40px / 32px mobile | 600 |
| Card title (H3) | 20px | 600 |
| Summary | 14px | 400 |
| Tech tag | 12px | 400 |
| Metric | 14px | 600 |
| CTA | 14px | 500 |

---

## Accessibility

- H2 section, H3 card titles
- Cards: `<article>` semantic
- Links: `aria-label` với project name
- Category badge: `aria-label` với category
- Focus visible trên CTA
- Contrast >= 4.5:1

---

## Animation

- Cards fade-in stagger (100ms delay)
- Hover: lift + shadow transition 200ms
- CTA: color transition 150ms

---

## State

| State | Description |
|---|---|
| Default | Normal render |
| Hover | Lift, shadow, border accent |
| Focus | Visible outline |
| Scroll reveal | Fade-in + slide-up |
| Reduced motion | Disable animations |

---

## Constraints

- Data-driven từ `projects.ts`
- Chỉ render featured projects trên homepage
- Filterable by category (future phase)
- CTA navigate to `/projects/:projectId`
