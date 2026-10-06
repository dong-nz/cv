# UI Spec — Projects List Page (/projects)

## Overview

Trang danh sách tất cả projects, với filter theo category.

---

## Structure

```
ProjectsListPage
├── PageHeader
│   └── Title (H1)
├── FilterBar
│   └── CategoryFilter (pills)
│       ├── All
│       ├── Software Engineering
│       ├── Logistics
│       ├── AI / ML
│       ├── Computer Vision
│       ├── Architecture
│       └── Experiment
└── ProjectGrid (×N)
    └── ProjectCard (same as homepage card)
```

---

## Layout

### Desktop

- Page header: centered, H1
- Filter bar: row of pills, centered
- Grid: 2 columns
- Active filter: accent background

### Mobile

- Page header: stacked
- Filter bar: horizontal scroll pills
- Grid: 1 column
- Active filter: accent fill

---

## FilterBar

| Variant | Style |
|---|---|
| Default | Transparent bg, muted border, muted text |
| Active | Accent bg, white text |
| Hover | Accent border |

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Page title (H1) | 40px / 32px mobile | 600 |
| Filter pill | 14px | 500 |

---

## Accessibility

- H1 page title
- Filter pills: `role="listbox"`, active item `aria-selected="true"`
- Keyboard navigate filters (arrow keys)
- Project cards: `<article>` semantic

---

## State

| State | Description |
|---|---|
| Default (All) | Show all projects |
| Filtered | Show only selected category |
| Empty | No projects in category → show message |

---

## Constraints

- Data-driven từ `projects.ts`
- Filter state trong URL query param (`?category=ai-ml`)
- URL state shareable
- ProjectCard reuse từ homepage component
