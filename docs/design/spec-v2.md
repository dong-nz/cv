# Specification — v2 Features

> **Document:** `spec-v2.md`
> **Version:** 0.1.0
> **Status:** Draft — awaiting review
> **Branch:** `dev_v2`
> **Parent branch:** `dev` (v0.0.1)

---

## Overview

Phase 1 (Foundation) + Phase 2 (Core Portfolio) đã hoàn thành trong v0.0.1. v2 tập trung vào:

1. **Resume download** (P1)
2. **Blog system** — MDX-based articles (P1)
3. **SEO** — metadata, Open Graph, sitemap (P1)
4. **Analytics** — privacy-friendly page view tracking (P2)
5. **Testing** — Vitest + Testing Library (P5)
6. **CI/CD pipeline** (P5)

---

## 1. Resume Download

### Requirement

- Nút "Download Resume" trong nav hoặc Contact page
- Link đến file PDF (placeholder ban đầu)
- Khi chưa có PDF → ẩn nút, hoặc hiển thị "Coming soon"
- PDF sẽ upload vào `public/resume.pdf`

### Implementation

```tsx
// Navigation.tsx
{resumeAvailable && (
  <Link to="/resume" className="nav-link">Resume</Link>
)}

// OR ContactPage.tsx
<a href="/resume.pdf" download className="btn-primary">Download Resume</a>
```

### Data

- `public/resume.pdf` — PDF file (user tự upload)
- Không cần data module

### Acceptance

- [ ] Nút Resume hiển thị trong nav
- [ ] Click → download PDF
- [ ] Khi chưa có PDF → nút ẩn hoặc disabled
- [ ] Responsive trên mobile

---

## 2. Blog System

### Requirement

Blog cho phép viết technical articles bằng Markdown/MDX, render trên client.

### Architecture

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

### Features

#### 2.1. Frontmatter

Mỗi article có frontmatter:

```yaml
---
title: "Building High-Performance Event Simulation with Go"
date: "2024-06-15"
tags: ["engineering", "golang", "simulation"]
summary: "Discrete event simulation for logistics facilities"
---
```

#### 2.2. Blog List Page (`/blog`)

- Hiển thị danh sách articles
- Sort theo date (newest first)
- Filter theo tags (pill buttons)
- Mỗi article card: title, date, tags, summary

#### 2.3. Article Page (`/blog/:slug`)

- Render MDX content
- Code blocks với syntax highlighting
- TOC (table of contents) sidebar (desktop)
- Reading time estimate
- Breadcrumb navigation

#### 2.4. Code Highlighting

- Dùng `rehype-prism-plus` hoặc `rehype-raw` + `prismjs`
- Không dùng library nặng như `react-syntax-highlighter`
- Theme: dark/light compatible với CSS variables

#### 2.5. MDX Processing

- Dùng `@mdx-js/react` + `@mdx-js/rollup` (Vite plugin)
- Build-time compilation (không runtime)
- Frontmatter extracted tại build time

### Vite Config Changes

```ts
// vite.config.ts
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

### Acceptance

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

---

## 3. SEO

### Requirement

Mỗi page có metadata riêng cho SEO và social sharing.

### Implementation

#### 3.1. Dynamic Metadata

Dùng `react-helmet-async` (hoặc `@remix-run/react` helmet nếu cần SSR sau này).

```tsx
import { Helmet } from 'react-helmet-async'

// HomePage.tsx
<Helmet>
  <title>{profile.name} — Senior Software Engineer</title>
  <meta name="description" content={profile.bio} />
  <link rel="canonical" href={siteUrl} />
</Helmet>
```

#### 3.2. Open Graph

Mỗi page có OG tags:

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="/og-image.png" />
<meta property="og:url" content="..." />
<meta property="og:type" content="website" />
```

#### 3.3. Sitemap

- Generate `sitemap.xml` tại build time
- Dùng `vite-plugin-sitemap` hoặc tự viết script
- Include tất cả public pages

#### 3.4. Robots.txt

- `public/robots.txt`
- Allow all (trừ `/admin` nếu có sau này)

#### 3.5. Structured Data (JSON-LD)

- `Person` schema cho homepage
- `Article` schema cho blog posts
- `BreadcrumbList` cho nested pages

### Acceptance

- [ ] Mỗi page có `<title>` và `<meta description>` riêng
- [ ] OG tags đúng trên mỗi page
- [ ] `sitemap.xml` generated tại build
- [ ] `robots.txt` có trong `public/`
- [ ] JSON-LD structured data
- [ ] Canonical URL đúng

---

## 4. Analytics

### Requirement

Privacy-friendly analytics — không dùng Google Analytics.

### Options

**Option A: Plausible Analytics** (recommended)
- Lightweight, privacy-first
- No cookie banner needed
- Simple script integration

**Option B: Umami**
- Self-hosted option
- Open source
- Similar to Plausible

**Option C: Custom minimal tracking**
- Track page views only
- Store in localStorage
- Batch send to endpoint (optional)

### Implementation (Plausible)

```tsx
// main.tsx
<script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.outbound-links.js"
/>
```

Hoặc dùng `react-use-plausible`:

```tsx
import { usePlausible } from 'react-use-plausible'

const plausible = usePlausible()
// Auto pageview tracking
```

### Acceptance

- [ ] Page view tracking hoạt động
- [ ] Không cookie banner
- [ ] Không ảnh hưởng performance
- [ ] Configurable via env var (ENABLE_ANALYTICS)

---

## 5. Testing

### Requirement

Unit tests cho components và hooks. E2E tests cho critical paths.

### Stack

- **Vitest** — unit/integration tests
- **@testing-library/react** — component tests
- **@testing-library/jest-dom** — assertions
- **Playwright** — E2E tests

### Test Structure

```
src/
  __tests__/
    hooks/
      useTheme.test.tsx
    components/
      Navigation.test.tsx
      Footer.test.tsx
      Badge.test.tsx
    pages/
      HomePage.test.tsx
  e2e/
    navigation.spec.ts
    theme.spec.ts
    responsive.spec.ts
```

### Critical Tests

#### useTheme

```tsx
test('cycles through themes correctly', () => {
  const { result } = renderHook(() => useTheme())
  act(() => { result.current.cycleTheme() })
  expect(result.current.theme).toBe('light') // or 'dark'
})

test('persists theme to localStorage', () => {
  renderHook(() => useTheme())
  expect(localStorage.getItem('portfolio-theme')).toBe('dark')
})
```

#### Navigation

```tsx
test('renders all nav items', () => {
  render(<Navigation />)
  navItems.forEach(item => {
    expect(screen.getByText(item.label)).toBeInTheDocument()
  })
})

test('NavLink highlights active route', () => {
  render(<MemoryRouter initialEntries={['/about']}> <Navigation /> </MemoryRouter>)
  expect(screen.getByText('About')).toHaveClass('active')
})
```

#### HomePage

```tsx
test('renders hero section', () => {
  render(<HomePage />)
  expect(screen.getByRole('heading', { name: profile.name })).toBeInTheDocument()
})
```

### Acceptance

- [ ] useTheme tests pass
- [ ] Navigation tests pass
- [ ] HomePage tests pass
- [ ] E2E: navigation works
- [ ] E2E: theme toggle works
- [ ] E2E: responsive layout correct
- [ ] Test coverage > 70%

---

## 6. CI/CD Pipeline

### Requirement

GitHub Actions pipeline:

1. **Lint** — oxlint
2. **Type check** — tsc -b
3. **Test** — vitest
4. **Build** — vite build
5. **Deploy** — to Vercel (on main branch push)

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
```

### Vercel Integration

- Connect GitHub repo
- Auto deploy on `dev` → preview
- Auto deploy on `main` → production
- Environment variables: `SITE_URL`, `PLAUSIBLE_DOMAIN` (optional)

### Acceptance

- [ ] CI pass trên push vào dev
- [ ] Lint pass
- [ ] Build pass
- [ ] Tests pass
- [ ] Preview deploy trên Vercel
- [ ] Production deploy khi merge vào main

---

## Implementation Order

Ưu tiên thực hiện:

1. **Resume download** (5 phút, trivial)
2. **SEO** (metadata, OG, sitemap) — cần làm trước khi deploy
3. **Blog system** (MDX + articles) — P1, substantial work
4. **Analytics** (Plausible) — quick win
5. **Testing** (Vitest + E2E) — P5, important but can iterate
6. **CI/CD** (GitHub Actions) — P5, automate after features done

---

## Out of Scope (v2)

- CMS integration (Phase 5+)
- Multi-language / i18n (Phase 5+)
- Interactive diagrams / simulations (Phase 5+)
- Search functionality (Phase 5+)
- Contact form with backend (Phase 5+)
- Resume PDF generation (user uploads manually)

---

## Approval

- [ ] All requirements reviewed and confirmed
- [ ] Implementation order agreed
- [ ] Ready to start coding
