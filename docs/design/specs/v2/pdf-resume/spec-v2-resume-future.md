# Specification — v2 Resume PDF (Future Enhancements)

> **Document:** `spec-v2-resume-future.md`
> **Version:** 0.3.0
> **Parent:** `spec-v2-resume-playwright.md`
> **Status:** ✅ Fully implemented

---

## Overview

All enhancements in this spec are fully implemented.

See [spec-v2-resume-playwright.md](./spec-v2-resume-playwright.md) for current implementation.

---

## 1. Version Stamping

**Status:** ✅ Implemented

Add footer "Last updated: YYYY-MM-DD" to each PDF page.

**Implementation:**
- Script (dòng 62-63): `new Date().toISOString().slice(0, 10)` → `updatedDate`
- Template (dòng 295-298): `<div class="pdf-footer">Last updated: {{UPDATED_DATE}}</div>`
- CSS (dòng 248-257): `.pdf-footer` — center, 8pt, `#999`, border-top, `page-break-inside: avoid`
- Replace (dòng 151): `.replace('{{UPDATED_DATE}}', updatedDate)`

**Output:** Footer "Last updated: 2026-10-12" xuất hiện ở cuối mỗi PDF.

---

## 2. Multiple Language Versions

**Status:** ✅ Implemented

Support PDF in English + Vietnamese.

**Implementation:**
- **Type:** `Language = 'en' | 'vi'` trong `src/types/index.ts`
- **Data fields:** Optional `*En` fields trên Profile, ExperienceEntry, FeaturedAchievement, SkillGroup, Project, ProjectSection
- **Resolver:** `resolveField<T>(en?: T, vi?: T)` — chọn `en` khi `lang='en'`, ngược lại chọn `vi` (fallback về `en`)
- **Labels:** `Experience/Kinh nghiệm`, `Skills/Kỹ năng`, `Projects/Dự án`
- **CLI arg:** `--lang=en` (default), `--lang=vi`
- **Output:** `resume.pdf` (EN), `resume-vi.pdf` (VI)
- **CI:** Chạy 2 lần, upload 2 artifacts, deploy cả 2
- **Local script:** `build:resume-all` chạy cả 2 ngôn ngữ

**Data bilingual coverage:**

| Module | Fields bilingual |
|--------|-----------------|
| `profile.ts` | `titleEn`, `taglineEn`, `bioEn`, `philosophy[].titleEn`, `philosophy[].descriptionEn` |
| `experience.ts` | `titleEn`, `responsibilitiesEn`, `achievements[].titleEn`, `contextEn`, `impactEn` |
| `projects.ts` | `titleEn`, `summaryEn`, `sections[].titleEn`, `sections[].contentEn` |
| `skills.ts` | `titleEn` (optional — đã English rồi nên không cần) |
