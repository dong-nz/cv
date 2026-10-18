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

- [~] Homepage `<title>` + `<meta description>` are real (Bundle D of `specs/v3/spec-v3-review-fixes.md`). Per-route titles/descriptions are still open: the SPA serves one head for every route, so `/about` and `/projects/{id}` report the homepage metadata. Closing this needs head management in React or build-time prerender
- [~] OG tags are correct for the homepage URL, including `og:image` with explicit 1200×1600 and alt text. Per-page `og:title` / `og:url` are not emitted, for the same reason
- [x] `sitemap.xml` generated at build — `scripts/generate-sitemap.ts`, chained into `pnpm build`, 10 urls (6 `navPaths` + 4 `/projects/{id}`), each with `lastmod`
- [x] `robots.txt` in `public/` — allow-all plus the `Sitemap:` pointer to the canonical origin
- [x] JSON-LD structured data — `Person` on the homepage with `sameAs` GitHub/LinkedIn and a `PostalAddress`. `BreadcrumbList` and the blog `Article` schema remain open
- [x] Canonical URL correct — `https://cv.vugado.com/` in `index.html`; `src/data/site.ts` is the single source the sitemap derives from, and the generator fails the build if `dist/index.html` no longer contains it

Measurements and HTTP probes: `specs/v3/spec-v3-review-fixes.md` §5.1.
