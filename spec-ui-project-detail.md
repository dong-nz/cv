# UI Spec — Project Detail Page

## Overview

Trang chi tiết từng featured project. Tuân theo storytelling template.

---

## Structure

```
ProjectDetailPage
├── PageHeader
│   ├── Breadcrumb (Projects → Project title)
│   ├── Title (H1)
│   ├── Meta
│   │   ├── Category badge
│   │   ├── Role
│   │   └── Technologies (tags)
│   └── Links (GitHub, Demo — optional)
├── StoryBlock (×9 sections)
│   ├── 01 — Context
│   ├── 02 — Problem
│   ├── 03 — Constraints
│   ├── 04 — Solution
│   ├── 05 — Architecture
│   │   └── ArchitectureDiagram (SVG/interactive)
│   ├── 06 — Implementation
│   ├── 07 — Challenges
│   ├── 08 — Result
│   │   └── Metrics (highlight boxes)
│   └── 09 — Lessons Learned
└── Navigation
    ├── Previous project
    └── Next project
```

---

## Content Model

```ts
interface ProjectDetail {
  id: string;
  title: string;
  summary: string;
  category: ProjectCategory;
  role: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;

  sections: ProjectSection[];
}

interface ProjectSection {
  id: string;
  number: number; // 01–09
  title: string;
  content: string; // markdown or HTML
  type: 'text' | 'diagram' | 'metrics' | 'code';
  images?: string[];
}
```

---

## Layout

### Desktop

- Single column, max-width 800px
- Page header: centered, large title
- Story blocks: sequential, each separated by divider
- Architecture diagram: full-width within content area
- Metrics: grid of highlight boxes
- Previous/Next nav: row at bottom

### Mobile

- Single column
- Page header: stacked, smaller title
- Diagram: scrollable horizontally hoặc fit-width
- Metrics: stack vertically
- Previous/Next: stacked buttons

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Page title (H1) | 40px / 32px mobile | 600 |
| Section number | 14px | 400 |
| Section title (H3) | 24px | 500 |
| Section content | 16px | 400 |
| Meta info | 14px | 400 |
| Tech tag | 12px | 400 |
| Metric | 16px | 600 |

---

## Architecture Diagram

| Variant | Style |
|---|---|
| Static SVG | Rendered SVG, zoom/pan if needed |
| Interactive (future) | Clickable nodes, zoom, pan, tooltips |

---

## Metrics

- Accent background, white text
- Grid layout (2 columns desktop, 1 column mobile)
- Each metric: number (large) + label (small)

---

## Accessibility

- H1 page title, H3 section titles
- Semantic `<article>` cho project
- Breadcrumb: `aria-label="Breadcrumb"`
- Diagram: `alt` text, `aria-label`
- Links: `aria-label` với URL description
- Focus visible trên tất cả elements
- Content: semantic headings hierarchy

---

## Animation

- Story blocks fade-in khi scroll
- Diagram: fade-in
- Metrics: counter animation (optional, subtle)

---

## State

| State | Description |
|---|---|
| Default | Normal render |
| Loading | Skeleton for content |
| Error | 404 or not-found state |
| Reduced motion | Disable animations |

---

## Constraints

- Data-driven từ `projects.ts`
- Sections có thể partial (không phải project có đủ 9 sections)
- Missing images → graceful degradation
- Missing URLs → hide link buttons
- Diagram: static fallback if interactive unavailable
