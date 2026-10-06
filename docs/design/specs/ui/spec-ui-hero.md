# UI Spec — Hero Section

## Overview

Section đầu tiên của homepage. Truyền tải identity, positioning, CTA chính.

---

## Structure

```
Hero
├── ContentBlock
│   ├── Name (H1, large display)
│   ├── Title (H2, "Senior Software Engineer")
│   ├── Tagline (3-line description)
│   ├── CTA Group
│   │   ├── Primary CTA ("View Projects")
│   │   └── Secondary CTA ("Contact Me")
│   └── Social Links
│       ├── GitHub
│       ├── LinkedIn
│       └── Email
└── VisualBlock
    └── Engineering visual (SVG/Canvas/abstract graphic)
```

---

## Content

| Element | Content |
|---|---|
| **Name** | _[TBD — name]_ |
| **Title** | Senior Software Engineer |
| **Tagline** | Building scalable software systems, intelligent logistics solutions, and practical AI applications. |
| **Primary CTA** | View Projects → /projects |
| **Secondary CTA** | Contact Me → /contact |
| **Social** | GitHub, LinkedIn, Email |

---

## Layout

### Desktop

- 2-column: content trái (60%), visual phải (40%)
- Content: vertically centered
- Name: 64px, bold
- Title: 24px, muted color
- Tagline: 18px, 3 lines max
- CTA buttons: row, gap 16px
- Social links: row below CTA, icon-only, muted → accent on hover

### Mobile

- Single column, stacked
- Visual block ẩn hoặc thu nhỏ
- Name: 40px
- Content: vertically centered, padding rộng
- CTA buttons: full-width, stacked vertically
- Social links: row, centered

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Name (H1) | 64px desktop / 40px mobile | 700 |
| Title (H2) | 24px | 400 |
| Tagline | 18px | 400 |
| CTA text | 16px | 500 |
| Social label | 14px | 400 |

---

## Visual Block

- Không stock photo
- Engineering-inspired abstract graphic
- Options: system diagram, data-flow visual, animated nodes
- Subtle animation: nodes connect, lines draw
- Không distracting, không blocking content
- fallback: static SVG nếu animation phức tạp

---

## Buttons

### Primary CTA

- Background: accent color
- Text: near-white
- Padding: 12px 24px
- Border-radius: 6px
- Hover: lighter accent
- Active: darker accent

### Secondary CTA

- Background: transparent
- Border: 1px solid border color
- Text: accent color
- Hover: accent background, white text

---

## Accessibility

- H1 duy nhất trên trang
- CTA buttons: semantic `<a>` styled as button
- Social links: `aria-label` với platform name
- Visual block: `role="presentation"`, `aria-hidden="true"`
- Contrast ratio >= 4.5:1 cho text
- Focus visible trên tất cả interactive elements

---

## Animation

- Fade-in content từ dưới (subtle, 300ms)
- Visual block: nodes connect animation (nếu dùng)
- Hover trên buttons: scale 1.02
- Không parallax, không continuous animation

---

## State

| State | Description |
|---|---|
| Default | Normal render |
| Hover | Button hovers, social link hovers |
| Focus | Keyboard navigation |
| Reduced motion | Disable all animations |

---

## Constraints

- Không hard-code content trong JSX — data-driven từ `profile.ts`
- Social links có thể empty → không render link đó
- CTA chỉ render khi URL có sẵn
