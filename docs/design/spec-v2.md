# Specification — v2 Features

> **Document:** `spec-v2.md`
> **Version:** 0.1.0
> **Status:** Draft — awaiting review
> **Branch:** `dev_v2`
> **Parent branch:** `dev` (v0.0.1)

---


## Prerequisites (Completed)

| File | Feature | Status |
|------|---------|--------|
| `specs/v2/spec-v2-router.md` | React Router v6 → v7 | ✅ Done |
| `specs/v2/spec-v2-router-v8.md` | React Router v7 → v8 | ✅ Done |
## Overview

v2 bao gồm 7 tính năng, mỗi tính năng có spec riêng trong `specs/`:

| File | Feature | Priority | Est. | Status |
|------|---------|----------|------|--------|
| `specs/v2/spec-v2-resume.md` | Resume download (UI) | P1 | ~15 min | ✅ Done |
| `specs/v2/pdf-resume/spec-v2-resume-playwright.md` | Resume PDF (Playwright) | P1 | ~4 hours | ✅ Chosen and shipped — `pnpm build:resume` / `build:resume-all`, CI `generate-resume` job. Serving the PDF from the site is open: `specs/v3/spec-v3-review-fixes.md` §4, bundle C (declined) |
| `specs/v2/pdf-resume/spec-v2-resume-puppeteer.md` | Resume PDF (Puppeteer) | P1 | ~4 hours | |
| `specs/v2/spec-v2-hero-carousel.md` | Hero visual carousel | P1 | ~1 hour | ❌ Spec file was never written; the feature was not built |
| `specs/v2/spec-v2-seo.md` | SEO (metadata, OG, sitemap) | P1 | ~1 hour | 🟡 Partial — head, JSON-LD, `robots.txt`, build-time `sitemap.xml` shipped via `specs/v3/spec-v3-review-fixes.md` Bundle D; per-route metadata open |
| `specs/v2/spec-v2-blog.md` | Blog (MDX, articles, syntax highlight) | P1 | ~4 hours | |
| `specs/v2/spec-v2-analytics.md` | Analytics (Plausible) | P2 | ~30 min | |
| `specs/v2/spec-v2-testing.md` | Testing (Vitest + E2E) | P5 | ~3 hours | |
| `specs/v2/spec-v2-cicd.md` | CI/CD (GitHub Actions) | P5 | ~1 hour | |

**Implementation order:** ~~Resume~~ → ~~Resume PDF (choose one)~~ → Hero Carousel → SEO → Blog → Analytics → Testing → CI/CD

---

## Out of Scope (v2)

- CMS integration (Phase 5+)
- Multi-language / i18n — shipped in v3 instead of Phase 5 (`specs/v3/spec-v3-i18n.md`): chrome strings in `src/i18n/strings.ts`, bilingual data through `src/i18n/field.ts`, EN/VI resume output
- Interactive diagrams / simulations (Phase 5+)
- Search functionality (Phase 5+)
- Contact form with backend (Phase 5+)

---

## Approval

- [ ] All requirements reviewed and confirmed
- [ ] Implementation order agreed
- [ ] Ready to start coding
