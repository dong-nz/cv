# Specification — v2 Resume PDF (Future Enhancements)

> **Document:** `spec-v2-resume-future.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2-resume-playwright.md`
> **Status:** Deferred — not yet implemented

---

## Overview

This spec covers deferred enhancements for the Resume PDF generation system.
All items in `spec-v2-resume-playwright.md` (Phase 1 + Phase 2) are fully implemented.

See [spec-v2-resume-playwright.md](./spec-v2-resume-playwright.md) for current implementation.

---

## 1. Version Stamping

**Status:** DEFERRED

Add footer "Last updated: YYYY-MM-DD" to each PDF page.

**Implementation:**
- Script injects footer into HTML template: `{{UPDATED_DATE}}`
- Or use JavaScript in the page to inject dynamic date:

```typescript
await page.evaluate((date: string) => {
  const footer = document.createElement('div');
  footer.className = 'pdf-footer';
  footer.textContent = `Last updated: ${date}`;
  document.body.appendChild(footer);
}, new Date().toISOString().slice(0, 10));
```

**CSS:**
```css
.pdf-footer {
  page-break-inside: avoid;
  text-align: center;
  font-size: 8pt;
  color: #999;
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px solid #eee;
}
```

---

## 2. Multiple Language Versions

**Status:** DEFERRED (English only)

Support PDF in English + Vietnamese. Currently English only.

**Approach:**
- Duplicate template: `resume-template-en.html`, `resume-template-vi.html`
- Script runs twice, outputting `resume-en.pdf`, `resume-vi.pdf`
- Data modules export both languages: `profile.nameEn`, `profile.nameVi`
