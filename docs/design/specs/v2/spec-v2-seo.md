# Specification — v2 SEO

> **Document:** `spec-v2-seo.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2.md`
> **Priority:** P1
> **Estimate:** ~1 hour

---

## Requirement

Mỗi page có metadata riêng cho SEO và social sharing.

---

## Implementation

### Dynamic Metadata

Dùng `react-helmet-async`.

```tsx
import { Helmet } from 'react-helmet-async'

// HomePage.tsx
<Helmet>
  <title>{profile.name} — Senior Software Engineer</title>
  <meta name="description" content={profile.bio} />
  <link rel="canonical" href={siteUrl} />
</Helmet>
```

### Open Graph

Mỗi page có OG tags:

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="/og-image.png" />
<meta property="og:url" content="..." />
<meta property="og:type" content="website" />
```

### Sitemap

- Generate `sitemap.xml` tại build time
- Dùng `vite-plugin-sitemap` hoặc tự viết script
- Include tất cả public pages

### Robots.txt

- `public/robots.txt`
- Allow all

### Structured Data (JSON-LD)

- `Person` schema cho homepage
- `Article` schema cho blog posts (sau này)
- `BreadcrumbList` cho nested pages

---

## Acceptance

- [ ] Mỗi page có `<title>` và `<meta description>` riêng
- [ ] OG tags đúng trên mỗi page
- [ ] `sitemap.xml` generated tại build
- [ ] `robots.txt` có trong `public/`
- [ ] JSON-LD structured data
- [ ] Canonical URL đúng
