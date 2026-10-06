# UI Spec — Footer

## Overview

Footer đơn giản ở cuối mỗi trang. Chứa copyright, social links, nav links.

---

## Structure

```
Footer
├── Container (max-width, centered)
├── FooterContent
│   ├── Copyright
│   ├── NavLinks
│   │   ├── Home
│   │   ├── About
│   │   ├── Projects
│   │   └── Contact
│   └── SocialLinks
│       ├── GitHub
│       ├── LinkedIn
│       └── Email
└── BackToTop (optional)
```

---

## Content

| Element | Value |
|---|---|
| **Copyright** | `© {year} {name}. All rights reserved.` |
| **Nav links** | Home, About, Projects, Contact |
| **Social links** | GitHub, LinkedIn, Email |

---

## Layout

### Desktop

- Single row or 2-row layout
- Copyright left, links center, social right
- Or: centered single row

### Mobile

- Centered, stacked
- Social links: row

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Copyright | 14px | 400 |
| Nav link | 14px | 400 |
| Social label | 14px | 400 |

---

## Accessibility

- `role="contentinfo"`
- Semantic `<footer>` element
- Links: `aria-label` với platform name
- Back to top: `aria-label="Back to top"`

---

## State

| State | Description |
|---|---|
| Default | Normal render |
| Hover | Link color change |
| Focus | Visible outline |

---

## Constraints

- Minimal, non-distracting
- Not more prominent than main content
- Copyright year auto-update
