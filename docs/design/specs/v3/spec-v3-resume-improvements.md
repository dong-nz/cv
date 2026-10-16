# Specification — v3 Resume PDF Improvements

> **Document:** `spec-v3-resume-improvements.md`
> **Version:** 0.3.0 (adds section reordering: Projects → Skills)
> **Parent:** `spec-v2-resume-playwright.md`
> **Priority:** P2
> **Estimate:** ~1 hour

---

## Problem

### 1. Missing Professional Summary in Resume

The resume PDF lacks a professional summary section. Currently it goes directly from header to experience, which is less informative for recruiters who scan the top of a resume first.

The `{{BIO}}` placeholder is resolved in `scripts/generate-resume.ts` (line 145) but never rendered in the HTML template — dead code.

### 2. Inter Font Poor Vietnamese Support

Current font **Inter** does not render Vietnamese diacritics well in PDF output. Characters like `ơ`, `ư`, `đ`, `ê`, `ô` may appear broken or misaligned.

**Decision:** Replace Inter with **Source Sans 3** (Adobe open-source) — excellent Vietnamese support, professional style, similar to Inter's clean aesthetic.

### 3. No HTML Preview Mode for Debugging

When debugging PDF layout, the only option is to generate the full PDF and open it. This requires:
- Running Playwright (slow)
- Waiting for Chromium to launch
- Generating PDF (2-3s)
- Opening PDF viewer

Layout iteration takes 5-10 seconds per cycle. Adding a preview mode that opens HTML directly in the browser would reduce iteration to <1 second.

---

## Goal

1. Add "About me" section with bio content after header, before Experience
2. Add `--preview` flag to open rendered HTML in browser (no PDF generation)
3. Add `build:resume-preview` npm script for convenience
4. Replace Inter font with Source Sans 3 for better Vietnamese support
---

## Current Implementation

### Script: `scripts/generate-resume.ts`

Bio resolved but not rendered:
```typescript
// Line 145 — resolves bio but template has no {{BIO}} placeholder
.replace('{{BIO}}', resolveField(profile.bioEn, profile.bio))
```

PDF generation (lines 160-178):
```typescript
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);

const langSuffix = lang === 'en' ? '' : `-${lang}`;
const outputPath = join(ROOT, `dist/resume${langSuffix}.pdf`);
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  title: `Resume - ${profile.name} (${lang === 'en' ? 'English' : 'Vietnamese'})`,
  author: profile.name,
});

await browser.close();
console.log(`resume${langSuffix}.pdf generated at ${outputPath} [${lang}]`);
```

### Template: `public/resume-template.html`

Structure (lines 259-298):
```html
<body>
  <!-- Header -->
  <div class="header">...</div>

  <!-- About me -->
  <div class="section">...</div>

  <!-- Experience -->
  <div class="section">...</div>

  <!-- Projects -->
  <div class="section">...</div>

  <!-- Skills -->
  <div class="section">...</div>

  <!-- Version stamp footer -->
  <div class="pdf-footer">Last updated: {{UPDATED_DATE}}</div>
</body>
```

No `{{BIO}}` placeholder exists in the template.

### Package.json Scripts

```json
{
  "scripts": {
    "build:resume": "pnpm tsx scripts/generate-resume.ts",
    "build:resume-all": "pnpm tsx scripts/generate-resume.ts --lang=en && pnpm tsx scripts/generate-resume.ts --lang=vi"
  }
}
```

---

## Implementation

### Font Change: Inter → Source Sans 3

**Files affected:**
- `public/fonts/` — replace `Inter-*.woff2` with `SourceSans3-*.woff2`
- `scripts/generate-resume.ts` — update font file names and weight mapping
- `public/resume-template.html` — update `@font-face` font-family name

**Source Sans 3 weights needed:**
- Regular (400) → `SourceSans3-Regular.ttf.woff2`
- Medium (500) → `SourceSans3-Medium.ttf.woff2`
- Semibold (600) → `SourceSans3-Semibold.ttf.woff2`
- Bold (700) → `SourceSans3-Bold.ttf.woff2`

**Script changes:**
1. Replace font file names in the validation loop and font loading loop
2. Update `@font-face` CSS to use `font-family: 'Source Sans 3'`
3. Update `body { font-family: 'Inter', ... }` → `font-family: 'Source Sans 3', ...`

**Note:** Download fonts from [Adobe Fonts / Google Fonts](https://fonts.google.com/specimen/Source+Sans+3). Extract `.woff2` files from the TTF/OTF originals using a converter if needed.

### Section Reordering: Projects → Skills

**Current order:** Header → About me → Experience → Skills → Projects
**New order:** Header → About me → Experience → Projects → Skills

**Rationale:** Skills are more generic/less impactful than Projects. Placing Projects before Skills gives recruiters a clearer view of concrete work experience before technical skills.

**Change:** Swap the Projects and Skills `<div class="section">` blocks in `public/resume-template.html` (around lines 280-292).

### Step 1: Add CSS for About me Section

**File:** `public/resume-template.html:56-60`

Add after `.header-info .contact` style block:

```css
    /* About me */
    .about-summary {
      font-size: 9.5pt;
      color: #4a4a4a;
      line-height: 1.6;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
```


### Step 2: Add About me Section to Template

**File:** `public/resume-template.html:272-273`

Insert between header `</div>` and Experience `<div class="section">`:

```html
  <!-- About me -->
  <div class="section">
    <div class="section-title">{{ABOUT_ME_LABEL}}</div>
    <div class="about-summary">{{BIO}}</div>
  </div>

  <!-- Experience -->
  <div class="section">...</div>

  <!-- Projects -->
  <div class="section">...</div>

  <!-- Skills -->
  <div class="section">...</div>
```

**Note:** The section uses `.section` class which has `page-break-before: always` for subsequent sections. Since About me comes right after header (first section), it will NOT trigger a page break — it flows naturally after the header on the same page.


### Step 3: Reorder Sections (Projects → Skills)

**File:** `public/resume-template.html:280-292`

Swap the Projects and Skills `<div class="section">` blocks:

```html
  <!-- Experience -->
  <div class="section">...</div>

  <!-- Projects -->
  <div class="section">...</div>

  <!-- Skills -->
  <div class="section">...</div>
```
### Step 4: Add --preview Flag to Script

**File:** `scripts/generate-resume.ts`

Add preview mode detection after language parsing (around line 15):

```typescript
// --- CLI args ---
const args = process.argv.slice(2);
const langArg = (args.find(a => a.startsWith('--lang=')) || '').replace('--lang=', '') as Language;
const lang: Language = (langArg === 'en' || langArg === 'vi') ? langArg : 'en';
const previewMode = args.includes('--preview');
```

Add `ABOUT_ME` to labels object (around line 66):

```typescript
const labels: Record<Language, Record<string, string>> = {
  en: {
    EXPERIENCE: 'Experience',
    SKILLS: 'Skills',
    PROJECTS: 'Projects',
    ABOUT_ME: 'About me',
  },
  vi: {
    EXPERIENCE: 'Kinh nghiệm',
    SKILLS: 'Kỹ năng',
    PROJECTS: 'Dự án',
    ABOUT_ME: 'Về tôi',
  },
};
```

Replace PDF generation block (lines 160-178) with conditional:

```typescript
// --- Generate output ---
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);

if (previewMode) {
  await page.bringToFront();
  console.log(`Preview opened in browser [${lang}] — close manually to exit`);
  await new Promise(() => {}); // Keep browser open indefinitely
} else {
  const langSuffix = lang === 'en' ? '' : `-${lang}`;
  const outputPath = join(ROOT, `dist/resume${langSuffix}.pdf`);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    title: `Resume - ${profile.name} (${lang === 'en' ? 'English' : 'Vietnamese'})`,
    author: profile.name,
  });

  await browser.close();
  console.log(`resume${langSuffix}.pdf generated at ${outputPath} [${lang}]`);
}
```

**Behavior:**
- `--preview` opens browser with rendered HTML, waits for user to close manually
- No PDF generated, no file saved
- User can inspect layout, test CSS changes, then re-run with `pnpm build:resume` to generate PDF
- `await new Promise(() => {})` — empty promise that never resolves, keeps process alive until user closes browser

**Edge cases:**
- `--preview` with `--lang=vi` works correctly
- `--preview` cannot be combined with normal output (no PDF + preview at same time) — not a use case
- Ctrl+C still terminates the process (Node.js signal handling)


### Step 5: Add build:resume-preview Script

**File:** `package.json`

Add after `build:resume-all`:

```json
{
  "scripts": {
    "build:resume": "pnpm tsx scripts/generate-resume.ts",
    "build:resume-all": "pnpm tsx scripts/generate-resume.ts --lang=en && pnpm tsx scripts/generate-resume.ts --lang=vi",
    "build:resume-preview": "pnpm tsx scripts/generate-resume.ts --preview"
  }
}
```

### Step 6: Remove Dead {{TAGLINE}} Replace

**File:** `scripts/generate-resume.ts:144`

Remove the dead replace since `{{TAGLINE}}` is also not in the template:

```diff
-  .replace('{{TAGLINE}}', resolveField(profile.taglineEn, profile.tagline))
```

---

## Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 1 | "About me" section appears after header, before Experience | ✅ |
| 2 | Bio content uses `resolveField` for bilingual support | ✅ |
| 3 | About me section title is bilingual (EN: "About me", VI: "Về tôi") | ✅ |
| 4 | About me section has page-break-inside: avoid | ✅ |
| 5 | About me flows on same page as header (no forced page break) | ✅ |
| 7 | `{{TAGLINE}}` dead code removed | ✅ |
| 8 | `build:resume-all` still generates both EN and VI PDFs | ✅ |
| 9 | `{{BIO}}` placeholder now rendered in template (no longer dead code) | ✅ |
| 10 | Source Sans 3 replaces Inter — Vietnamese diacritics render correctly | ✅ |

---

## Tradeoffs

| Aspect | Detail |
|--------|--------|
| About me page break | Uses `.section` class (page-break-before on subsequent sections) — About me is second section, header is first, so no page break triggered |
| Preview mode lifecycle | `await new Promise(() => {})` — process stays alive until Ctrl+C or browser window closed |
| Bio length | ~2 lines in English, ~2-3 lines in Vietnamese — fits comfortably on page 1 after header |
| CSS specificity | `.about-summary` is standalone class, no conflict with existing styles |
| Font change | Source Sans 3 ~900KB (4 weights) vs Inter ~800KB — slight size increase (~100KB) |

---

## Files Changed

| File | Action | Lines |
| `public/fonts/` | Replace | 4 files: Inter → Source Sans 3 (Regular, Medium, Semibold, Bold) |
| `public/resume-template.html` | Edit | +9 lines (CSS), +5 lines (HTML body), ~12 lines (section reorder) |
| `scripts/generate-resume.ts` | Edit | +3 lines (preview flag), +15 lines (labels ABOUT_ME), +15 lines (conditional generation), +3 lines (ABOUT_ME replace), -1 line (dead TAGLINE) |
| `package.json` | Edit | +1 line (new script) |

---

## Bugs Fixed

| # | Issue | Fix |
|---|-------|-----|
| 1 | `@font-face` font-family was `'Inter'` but body uses `'Source Sans 3'` — PDF would fallback to system font | Changed `scripts/generate-resume.ts:55` to `font-family: 'Source Sans 3'` |
| 2 | `${exp.achievements?.map(...).join('')}` printed the literal text `undefined` in every PDF as soon as an entry had no `achievements` — optional chaining short-circuits the whole chain and the template literal stringifies the `undefined` result (found 2026-10-16, after `achievements` was dropped from `src/data/experience.ts`) | `scripts/generate-resume.ts:100` — now `(exp.achievements ?? []).map(...).join('')` |

---

## Progress

- [x] Font: Replace Inter with Source Sans 3 (4 weights) in `public/fonts/`, script, and template
- [x] Step 1: CSS for About me section
- [x] Step 2: About me section in template
- [x] Step 3: Reorder sections (Projects → Skills)
- [x] Step 4: Add --preview flag, labels ABOUT_ME, and ABOUT_ME_LABEL replace
- [x] Step 5: Add build:resume-preview script
- [x] Step 6: Remove dead {{TAGLINE}} replace
- [x] Verify: `pnpm build:resume` generates correct PDF
- [x] Verify: `pnpm build:resume-preview` opens browser
- [x] Verify: `pnpm build:resume-all` generates both languages
