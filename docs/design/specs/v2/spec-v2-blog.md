# Specification — v2 Blog System

> **Document:** `spec-v2-blog.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2.md`
> **Priority:** P1
> **Estimate:** ~4 hours

---

## Requirement

Blog cho phép viết technical articles bằng Markdown/MDX, render trên client.

---

## Architecture

```
src/
  content/
    blog/
      post-1.mdx
      post-2.mdx
  components/
    blog/
      BlogListPage.tsx
      BlogPostPage.tsx
      ArticleCard.tsx
      CodeBlock.tsx
```

---

## Features

### Frontmatter

Mỗi article có frontmatter:

```yaml
---
title: "Building High-Performance Event Simulation with Go"
date: "2024-06-15"
tags: ["engineering", "golang", "simulation"]
summary: "Discrete event simulation for logistics facilities"
---
```

### Blog List Page (`/blog`)

- Hiển thị danh sách articles
- Sort theo date (newest first)
- Filter theo tags (pill buttons)
- Mỗi article card: title, date, tags, summary

### Article Page (`/blog/:slug`)

- Render MDX content
- Code blocks với syntax highlighting
- TOC (table of contents) sidebar (desktop)
- Reading time estimate
- Breadcrumb navigation

### Code Highlighting

- Dùng `rehype-prism-plus` hoặc `rehype-raw` + `prismjs`
- Không dùng library nặng như `react-syntax-highlighter`
- Theme: dark/light compatible với CSS variables

### MDX Processing

- Dùng `@mdx-js/react` + `@mdx-js/rollup` (Vite plugin)
- Build-time compilation (không runtime)
- Frontmatter extracted tại build time

### Vite Config Changes

```ts
import mdx from '@mdx-js/rollup'

export default defineConfig({
  plugins: [
    react(),
    mdx({
      providerImportSource: '@mdx-js/react',
    }),
  ],
})
```

---

## Acceptance

- [ ] `/blog` hiển thị danh sách articles
- [ ] Article card có title, date, tags, summary
- [ ] Click article → navigate đến `/blog/:slug`
- [ ] MDX content render đúng
- [ ] Code blocks có syntax highlighting
- [ ] Tags filter hoạt động
- [ ] TOC sidebar (desktop only)
- [ ] Reading time hiển thị
- [ ] Responsive
- [ ] Không crash khi missing article
