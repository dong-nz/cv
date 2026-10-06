# UI Spec — Blog Section

## Overview

Trang danh sách và chi tiết các bài viết kỹ thuật.

---

## Structure

### Blog List Page

```
BlogListPage
├── PageHeader
│   └── Title (H1)
└── ArticleList (×N)
    └── ArticleCard (×N)
        ├── Date
        ├── Title
        ├── Summary (1–2 lines)
        ├── Tags
        └── Read time
```

### Blog Detail Page

```
BlogDetailPage
├── PageHeader
│   ├── Back link
│   ├── Title (H1)
│   ├── Meta
│   │   ├── Date
│   │   ├── Read time
│   │   └── Tags
└── ArticleContent
    └── Markdown rendered content
        ├── Headings (H2, H3)
        ├── Paragraphs
        ├── Code blocks (syntax highlighted)
        ├── Images
        ├── Lists
        └── Blockquotes
```

---

## Content Model

```ts
interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO date
  readTime: number; // minutes
  tags: string[];
  coverImage?: string;
}
```

---

## Layout

### Desktop

- Blog list: max-width 800px, single column
- Article cards: bordered, padding, hover shadow
- Blog detail: max-width 700px, prose width
- Code blocks: full-width within content, dark bg
- Sidebar (optional): table of contents, sticky

### Mobile

- Blog list: single column, full-width cards
- Blog detail: full-width content, smaller code blocks
- No sidebar

---

## ArticleCard

| Variant | Style |
|---|---|
| Default | Border, padding, flex column |
| Hover | Shadow, lift 2px |

---

## Code Block

| Variant | Style |
|---|---|
| Default | Dark background, monospace font, syntax highlighting |
| Line numbers | Optional, muted color |
| Copy button | Top-right corner, icon-only |

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Page title (H1) | 40px / 32px mobile | 600 |
| Article title (H2) | 24px | 600 |
| Article summary | 14px | 400 |
| Article meta | 14px | 400 |
| Tag | 12px | 400 |
| Body text | 16px | 400 |
| Code | 14px | 400 |
| Code block | 14px | 400 |

---

## Accessibility

- H1 page title, H2 article titles, H3/H4 in content
- Semantic `<article>` for each post
- Code blocks: `<pre><code>` semantic
- Table of contents: `nav` with `aria-label="Table of contents"`
- Syntax highlighted code: not critical for accessibility
- Focus visible on all interactive elements

---

## Animation

- Article cards fade-in stagger (80ms delay)
- Code block copy button: feedback animation (200ms)

---

## State

| State | Description |
|---|---|
| Default | Normal render |
| Hover | Card lift + shadow |
| Loading | Skeleton cards |
| Reduced motion | Disable animations |

---

## Constraints

- Content from markdown/MDX files
- Slug-based routing (`/blog/:slug`)
- SEO metadata per article
- Code highlighting via library (e.g., shiki)
