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
| `specs/v2/pdf-resume/spec-v2-resume-playwright.md` | Resume PDF (Playwright) | P1 | ~4 hours | |
| `specs/v2/pdf-resume/spec-v2-resume-puppeteer.md` | Resume PDF (Puppeteer) | P1 | ~4 hours | |
| `specs/v2/spec-v2-hero-carousel.md` | Hero visual carousel | P1 | ~1 hour | |
| `specs/v2/spec-v2-seo.md` | SEO (metadata, OG, sitemap) | P1 | ~1 hour | |
| `specs/v2/spec-v2-blog.md` | Blog (MDX, articles, syntax highlight) | P1 | ~4 hours | |
| `specs/v2/spec-v2-analytics.md` | Analytics (Plausible) | P2 | ~30 min | |
| `specs/v2/spec-v2-testing.md` | Testing (Vitest + E2E) | P5 | ~3 hours | |
| `specs/v2/spec-v2-cicd.md` | CI/CD (GitHub Actions) | P5 | ~1 hour | |

**Implementation order:** ~~Resume~~ → ~~Resume PDF (choose one)~~ → Hero Carousel → SEO → Blog → Analytics → Testing → CI/CD

---

## Out of Scope (v2)

- CMS integration (Phase 5+)
- Multi-language / i18n (Phase 5+)
- Interactive diagrams / simulations (Phase 5+)
- Search functionality (Phase 5+)
- Contact form with backend (Phase 5+)

---

## Approval

- [ ] All requirements reviewed and confirmed
- [ ] Implementation order agreed
- [ ] Ready to start coding
