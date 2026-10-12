# Specification — v2 Resume PDF (Future Enhancements)

> **Document:** `spec-v2-resume-future.md`
> **Version:** 0.2.0
> **Parent:** `spec-v2-resume-playwright.md`
> **Status:** Partial — 2/4 items implemented

---

## Overview

This spec covers deferred enhancements for the Resume PDF generation system.
Implemented items are marked `✅`. Deferred items remain for future work.

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

---

## 3. PDF Metadata

**Status:** DEFERRED

Set metadata in `page.pdf()` options:

```typescript
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' },
});
```

In practice, Playwright PDF does **not support** `title`/`author` directly. Alternatives:
- Inject `<meta>` tags in HTML (visible only in browser print dialog)
- Use `pdf-lib` after generation to set metadata (adds dependency)

**Recommendation:** Skip metadata — resume PDF does not need professional metadata.

---

## 4. Conditional Content

**Status:** DEFERRED

Hide contact info if using placeholder values (before publishing real data):

```typescript
if (profile.email === 'your.email@example.com') {
  console.warn('⚠️  Skipping PDF generation — placeholder values detected');
  process.exit(0);
}
```

---

## 5. Project Sections

**Status:** DEFERRED (only title/summary/tech/metrics rendered)

Render `ProjectSection[]` details in PDF (currently only renders title/summary/tech/metrics).

Each `ProjectSection` has a `type`: `"text" | "diagram" | "metrics" | "code"`:

```typescript
function renderProjectSections(sections: ProjectSection[]): string {
  return sections.map(s => {
    switch (s.type) {
      case 'text':
        return `<div class="project-section-text">${s.content}</div>`;
      case 'diagram':
        return `<div class="project-section-diagram">${s.content}</div>`;
      case 'metrics':
        return `<div class="project-section-metrics">${s.content}</div>`;
      case 'code':
        return `<pre class="project-section-code">${s.content}</pre>`;
    }
  }).join('');
}
```

---

## 6. Download Resume UI

**Status:** DEFERRED

Single download button with dropdown on desktop, 2 separate buttons on mobile.

**Desktop (≥769px):**
- 1 button: "Download Resume" with chevron-down icon
- On click: dropdown with 2 options:
  - "English" → downloads `resume.pdf`
  - "Tiếng Việt" → downloads `resume-vi.pdf`
- Dropdown uses native `<details>` element (no JS state)

```html
<details class="download-resume-dropdown">
  <summary>Download Resume ▾</summary>
  <div class="dropdown-options">
    <a href="/resume.pdf" download class="dropdown-option">English</a>
    <a href="/resume-vi.pdf" download class="dropdown-option">Tiếng Việt</a>
  </div>
</details>
```

**Mobile (<769px):**
- 2 separate buttons (current layout):
  - "Download Resume (EN)" → `resume.pdf`
  - "Download Resume (VI)" → `resume-vi.pdf`
- No dropdown, direct download links

**Implementation Notes:**
- Use native `<details>`/`<summary>` for dropdown — no React state needed
- `download` attribute on `<a>` triggers browser download
- Dropdown should close when an option is clicked (native `<details>` behavior)
- Mobile: keep existing 2-button layout in `DownloadResume.tsx` using `resumeLanguages.map()`
- Desktop: wrap in `<details>` dropdown, render only "Download Resume" as summary
