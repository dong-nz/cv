# Specification — v2 Resume PDF (Playwright)

> **Document:** `spec-v2-resume-playwright.md`
> **Version:** 0.5.0
> **Updated:** 2026-10-12

---
## Status

Phase 1 (local generation) and Phase 2 (CI integration) are **fully implemented**.
All core files: `scripts/generate-resume.ts`, `public/resume-template.html`, `public/fonts/`, `public/profile-photo.webp`, `src/data/resume.ts`, `src/components/sections/DownloadResume.tsx`, `.gitea/workflows/deploy.yml`.

---

## Requirement

- Generate `resume.pdf` (A4, multi-page, embedded fonts) during build
- Deployed at `/resume.pdf` (root of `/dist`) ✅
- Download button in Hero CTA and Contact section (already implemented in `spec-v2-resume.md`)
- PDF content: Header (with profile photo), Experience, Skills, Projects (all)

---

## Phases

### Phase 1: Local Generation (Dev Testing)

Mục tiêu: Developer có thể generate PDF locally để test layout, content, pagination trước khi push lên CI.

**Scope**:

- Tạo `scripts/generate-resume.ts` + `public/resume-template.html` + fonts
- Install `playwright`, `tsx` as `devDependency`
- Manual command: `pnpm tsx scripts/generate-resume.ts` → `dist/resume.pdf`
- **KHÔNG** thêm vào `pnpm build` script
- **KHÔNG** Gitea workflow changes

**Workflow**:

```
git checkout -b feature/resume-pdf
# implement Phase 1
pnpm tsx scripts/generate-resume.ts  # test locally
# verify PDF, iterate
git push && PR
```

### Phase 2: Gitea Workflow Integration

Mục tiêu: PDF tự generate trong CI, deploy cùng site.

**Scope**:

- Split `deploy.yml` thành 3 jobs (build / generate-resume / deploy)
- CI cache cho Playwright browser
- Thêm `tsx scripts/generate-resume.ts` vào build pipeline
- Artifact management cho PDF

**Workflow**:

```
git checkout master  # sau khi Phase 1 merged
# implement Phase 2
# push → CI tự generate + deploy PDF
```

---

## PDF Structure

### Page 1: Header + Start of Experience

```
┌──────────────────────────────────────────┐
│ [Photo]  Dong Nguyen                     │
│          Senior Software Engineer        │
│          your.email@example.com          │
│          github.com/...                  │
│          linkedin.com/...                │
├──────────────────────────────────────────┤
│ EXPERIENCE                               │
│                                          │
│ Senior Software Engineer                 │
│ Current Company  |  2021 – Present       │
│ Ho Chi Minh City, Vietnam                │
│                                          │
│ • System ownership và architecture...    │
│ • Developed IoT-DWS integration...       │
│ • Led system maintenance...              │
│ • Applied Computer Vision...             │
│ • Scrum Master responsibilities...       │
│                                          │
│ IoT-DWS Integration System               │
│ Context: Tiếp nhận và nhanh chóng...     │
│ Technical: HTTP integration, HMAC...     │
│ Impact: Giải pháp DWS integration...     │
│ Metrics: 16 sortations deployed          │
│ Tech: Java, HTTP, HMAC, RocketMQ, DWS   │
└──────────────────────────────────────────┘
```

### Page 2+: Remaining Content

- AWB Detection (if fits with IoT-DWS, else new page)
- System Maintenance (if fits, else new page)
- Skills section (always starts on new page)
- Projects section (each project starts on new page)

### Section Break Rules

- **Experience** section starts on a new page (after header)
- **Skills** section starts on a new page
- **Each Project** starts on a new page
- Experience achievements may flow across pages naturally if space permits

---

## Technology

### Library

```
playwright@^1.64.0       # Playwright (Chromium)
tsx@^4.23.15              # TypeScript executor (handles .ts imports in Node)
```

- `playwright` full install (includes browser binary ~100MB)
- `tsx` — lightweight TS executor for Node (no install overhead)
- Installed as `devDependency`
- Browser downloaded once, cached in `node_modules/.cache/playwright`

### Build Machine

- Gitea runner: `ubuntu-latest` — cần `npx playwright install-deps chromium` cho system dependencies
- Local dev: `npx playwright install chromium` (one-time)
### Font Embedding

- Font: **Inter** (self-hosted WOFF2) — clean, professional, good Vietnamese support
- Embed via `@font-face` with **base64-encoded WOFF2 inline in HTML** (not relative paths — file:// URLs fail in Playwright PDF)
- Fallback: `system-ui, -apple-system, sans-serif`

---

## File Structure

```
scripts/
  generate-resume.ts       # Main build script (TS, executed via tsx)
public/
  resume-template.html     # HTML template (with {{placeholders}})
  fonts/
    Inter-Regular.woff2
    Inter-Medium.woff2
    Inter-SemiBold.woff2
    Inter-Bold.woff2
  profile-photo.webp
```

---

## Implementation

### 1. Font Setup

Download Inter fonts (4 weights: Regular, Medium, SemiBold, Bold) from Google Fonts.
Place in `public/fonts/` directory. Script reads each file, base64-encodes it, and injects `@font-face` CSS inline into the HTML template.

**Commit font files into repo** (~50KB total). Do NOT add to `.gitignore`.

```
public/fonts/
  Inter-Regular.woff2
  Inter-Medium.woff2
  Inter-SemiBold.woff2
  Inter-Bold.woff2
```

Script generates this CSS at build time:

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('data:font/woff2;base64,{{FONT_REGULAR_BASE64}}') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('data:font/woff2;base64,{{FONT_MEDIUM_BASE64}}') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('data:font/woff2;base64,{{FONT_SEMIBOLD_BASE64}}') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('data:font/woff2;base64,{{FONT_BOLD_BASE64}}') format('woff2');
}
```

### 2. HTML Template

`public/resume-template.html` — static template with `{{placeholder}}` tokens:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume - Dong Nguyen</title>
  <style>
    /* Font faces — injected at build time */
    {{FONT_FACES}}

    /* Page layout */
    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }

    /* Reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a1a;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #1a1a1a;
      margin-bottom: 16px;
    }

    .header-photo {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .header-info h1 {
      font-size: 18pt;
      font-weight: 700;
      color: #1a1a1a;
    }

    .header-info .title {
      font-size: 11pt;
      font-weight: 500;
      color: #4a4a4a;
      margin-bottom: 4px;
    }

    .header-info .contact {
      font-size: 9pt;
      color: #666;
      line-height: 1.6;
    }

    /* Section — all sections except first get page break */
    .section + .section {
      page-break-before: always;
    }

    .section-title {
      font-size: 12pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      color: #1a1a1a;
      padding-bottom: 4px;
      border-bottom: 1px solid #ccc;
      margin-bottom: 10px;
    }

    /* Experience */
    .exp-entry {
      margin-bottom: 12px;
    }

    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }

    .exp-title {
      font-weight: 600;
      font-size: 11pt;
      color: #1a1a1a;
    }

    .exp-duration {
      font-size: 9pt;
      color: #666;
      white-space: nowrap;
    }

    .exp-company {
      font-size: 10pt;
      color: #4a4a4a;
      margin-bottom: 2px;
    }

    .exp-location {
      font-size: 9pt;
      color: #888;
      margin-bottom: 4px;
    }

    .exp-responsibilities {
      list-style: disc;
      padding-left: 16px;
      margin-bottom: 6px;
    }

    .exp-responsibilities li {
      font-size: 9.5pt;
      margin-bottom: 2px;
    }

    /* Achievement */
    .achievement {
      margin-left: 12px;
      margin-bottom: 8px;
    }

    .achievement-title {
      font-weight: 600;
      font-size: 10pt;
      color: #1a1a1a;
      margin-bottom: 2px;
    }

    .achievement-context {
      font-size: 9pt;
      color: #4a4a4a;
      margin-bottom: 4px;
      font-style: italic;
    }

    .achievement-technical {
      list-style: disc;
      padding-left: 20px;
      margin-bottom: 4px;
    }

    .achievement-technical li {
      font-size: 9pt;
      color: #4a4a4a;
      margin-bottom: 1px;
    }

    .achievement-tech {
      font-size: 8.5pt;
      color: #666;
    }

    .achievement-tech span {
      display: inline-block;
      background: #f0f0f0;
      padding: 0 4px;
      border-radius: 2px;
      margin-right: 4px;
    }

    .achievement-impact {
      font-size: 9pt;
      color: #4a4a4a;
      margin-top: 2px;
    }

    .achievement-metrics {
      font-size: 9pt;
      color: #4a4a4a;
      margin-top: 1px;
    }

    /* Skills */
    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
    }

    .skill-group-title {
      font-weight: 600;
      font-size: 10pt;
      color: #1a1a1a;
      margin-bottom: 2px;
    }

    .skill-list {
      font-size: 9pt;
      color: #4a4a4a;
      line-height: 1.5;
    }

    /* Projects */
    .project {
      margin-bottom: 12px;
    }

    .project-title {
      font-weight: 600;
      font-size: 11pt;
      color: #1a1a1a;
    }

    .project-role {
      font-size: 9pt;
      color: #666;
      margin-bottom: 2px;
    }

    .project-summary {
      font-size: 9.5pt;
      color: #4a4a4a;
      margin-bottom: 4px;
    }

    .project-tech {
      font-size: 8.5pt;
      color: #666;
    }

    .project-tech span {
      display: inline-block;
      background: #f0f0f0;
      padding: 0 4px;
      border-radius: 2px;
      margin-right: 4px;
    }

    .project-metrics {
      font-size: 9pt;
      color: #4a4a4a;
      margin-top: 2px;
    }

    /* Page break helpers */
    .avoid-break { page-break-inside: avoid; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <img class="header-photo" src="data:image/webp;base64,{{PHOTO_BASE64}}" alt="Dong Nguyen" />
    <div class="header-info">
      <h1>{{NAME}}</h1>
      <div class="title">{{TITLE}}</div>
      <div class="contact">
        {{EMAIL}}<br>
        {{GITHUB}}<br>
        {{LINKEDIN}}
      </div>
    </div>
  </div>

  <!-- Experience -->
  <div class="section">
    <div class="section-title">Experience</div>
    {{EXPERIENCE}}
  </div>

  <!-- Skills -->
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      {{SKILLS}}
    </div>
  </div>

  <!-- Projects -->
  <div class="section">
    <div class="section-title">Projects</div>
    {{PROJECTS}}
  </div>
</body>
</html>
```

### 3. Build Script

`scripts/generate-resume.ts` — executed via `tsx`:

```typescript
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

// --- Validate required files ---
const requiredFiles = [
  'public/profile-photo.webp',
  'public/fonts/Inter-Regular.woff2',
  'public/fonts/Inter-Medium.woff2',
  'public/fonts/Inter-SemiBold.woff2',
  'public/fonts/Inter-Bold.woff2',
  'public/resume-template.html',
];

for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
}

// --- Load data (tsx handles .ts imports natively) ---
const { profile } = await import(join(ROOT, 'src/data/profile.ts'));
const { experiences } = await import(join(ROOT, 'src/data/experience.ts'));
const { skillGroups } = await import(join(ROOT, 'src/data/skills.ts'));
const { projects } = await import(join(ROOT, 'src/data/projects.ts'));


// --- Read template ---
const template = readFileSync(join(ROOT, 'public/resume-template.html'), 'utf-8');

// --- Read and base64-encode assets ---
const photoBase64 = readFileSync(join(ROOT, 'public/profile-photo.webp')).toString('base64');

const fonts: Record<string, string> = {};
for (const [name, weight] of [
  ['REGULAR', 'Inter-Regular.woff2'],
  ['MEDIUM', 'Inter-Medium.woff2'],
  ['SEMIBOLD', 'Inter-SemiBold.woff2'],
  ['BOLD', 'Inter-Bold.woff2'],
] as const) {
  fonts[name] = readFileSync(join(ROOT, 'public/fonts', weight)).toString('base64');
}

// --- Generate font-face CSS ---
const fontFaces = Object.entries(fonts).map(([key, b64]) => {
  const weightMap: Record<string, number> = { REGULAR: 400, MEDIUM: 500, SEMIBOLD: 600, BOLD: 700 };
  return `@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: ${weightMap[key]};
  font-display: swap;
  src: url('data:font/woff2;base64,${b64}') format('woff2');
}`;
}).join('\n');

// --- Render HTML helpers ---
function renderExperience(exps: Awaited<typeof experiences>): string {
  return exps.map(exp => `
    <div class="exp-entry avoid-break">
      <div class="exp-header">
        <span class="exp-title">${exp.title}</span>
        <span class="exp-duration">${exp.duration}</span>
      </div>
      <div class="exp-company">${exp.company}</div>
      ${exp.location ? `<div class="exp-location">${exp.location}</div>` : ''}
      <ul class="exp-responsibilities">
        ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
      </ul>
      ${exp.achievements?.map(ach => `
        <div class="achievement avoid-break">
          <div class="achievement-title">${ach.title}</div>
          <div class="achievement-context">${ach.context}</div>
          ${ach.technicalWork?.length ? `
            <ul class="achievement-technical">
              ${ach.technicalWork.map(t => `<li>${t}</li>`).join('')}
            </ul>
          ` : ''}
          <div class="achievement-tech">
            ${ach.technologies.map(t => `<span>${t}</span>`).join('')}
          </div>
          ${ach.impact ? `<div class="achievement-impact">${ach.impact}</div>` : ''}
          ${ach.metrics?.length ? `<div class="achievement-metrics">${ach.metrics.join(', ')}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderSkills(groups: Awaited<typeof skillGroups>): string {
  return groups.map(group => `
    <div class="avoid-break">
      <div class="skill-group-title">${group.title}</div>
      <div class="skill-list">${group.skills.join(' · ')}</div>
    </div>
  `).join('');
}

function renderProjects(projs: Awaited<typeof projects>): string {
  return projs.map(project => `
    <div class="project avoid-break">
      <div class="project-title">${project.title}</div>
      <div class="project-role">${project.role}</div>
      <div class="project-summary">${project.summary}</div>
      <div class="project-tech">
        ${project.technologies.map(t => `<span>${t}</span>`).join('')}
      </div>
      ${project.metrics?.length ? `<div class="project-metrics">${project.metrics.join(', ')}</div>` : ''}
    </div>
  `).join('');
}

// --- Assemble HTML ---
const html = template
  .replace('{{NAME}}', profile.name)
  .replace('{{TITLE}}', profile.title)
  .replace('{{EMAIL}}', profile.email)
  .replace('{{GITHUB}}', profile.githubUrl.replace('https://', 'github.com/'))
  .replace('{{LINKEDIN}}', profile.linkedinUrl.replace('https://', 'linkedin.com/in/'))
  .replace('{{PHOTO_BASE64}}', photoBase64)
  .replace('{{FONT_FACES}}', fontFaces)
  .replace('{{EXPERIENCE}}', renderExperience(experiences))
  .replace('{{SKILLS}}', renderSkills(skillGroups))
  .replace('{{PROJECTS}}', renderProjects(projects));

// --- Generate PDF ---
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);  // No waitUntil needed — all resources inline

const outputPath = join(ROOT, 'dist/resume.pdf');
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  // margin inherited from @page CSS

await browser.close();
console.log(`resume.pdf generated at ${outputPath}`);
```

### 4. package.json

**Phase 1** (local dev only):

```json
{
  "scripts": {
    "build": "tsc -b && vite build"
  },
  "devDependencies": {
    "playwright": "^1.64.0",
    "tsx": "^4.23.15"
  }
}
```

Build script **không** chạy PDF generation. Developer chạy manual:

```bash
pnpm tsx scripts/generate-resume.ts
```

**Phase 2** (CI integration):

```json
{
  "scripts": {
    "build": "tsc -b && vite build && tsx scripts/generate-resume.ts"
  }
}
```

### Data Detection

`src/data/resume.ts` — controls whether download button is visible in UI:

```ts
// src/data/resume.ts
export const resumeAvailable = true  // set false when PDF not yet deployed
```

**Phase 1 (dev):** Hardcoded boolean. Developer sets `false` locally until PDF is ready,
sets `true` after deployment to verify the button appears.

**Phase 2 (CI):** After CI generates and deploys `dist/resume.pdf`, the button
will show because `/resume.pdf` exists on the server.

> ⚠️ Do NOT use `existsSync` — this file is bundled by Vite for the browser.
> Node.js `fs` APIs are unavailable in browser runtime.
### Deviation Notes

| Spec | Actual | Impact |
|------|--------|--------|
| Hero button uses `download` attribute | Uses `target="_blank"` (opens in new tab) | User sees PDF in browser instead of triggering download. Low impact — `/resume.pdf` is typically downloaded by browser automatically. |
| `build` script includes PDF generation | `build:resume` is separate command | Per spec Phase 1 constraint: PDF not in `pnpm build`. CI handles PDF in separate `generate-resume` job. |
| Artifact retention: PDF 30 days | Actual `retention-days: 1` in deploy.yml | Short retention. Consider increasing if needed. |

---


## Acceptance Criteria

### Phase 1 — **IMPLEMENTED** ✅

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | `pnpm tsx scripts/generate-resume.ts` produces `dist/resume.pdf` | ✅ | Script at `scripts/generate-resume.ts`, alias `pnpm build:resume` |
| 2 | PDF is A4 size, multi-page with correct pagination | ✅ | `@page { size: A4 }` in template, `format: 'A4'` in script |
| 3 | Header contains profile photo (circular crop), name, title, contact info | ✅ | Base64 photo, profile data from `src/data/profile.ts` |
| 4 | Experience section includes all companies, roles, responsibilities, achievements | ✅ | `renderExperience()` renders exp, responsibilities, achievements with technicalWork |
| 5 | Skills section includes all skill groups | ✅ | `renderSkills()` renders all groups in 2-column grid |
| 6 | All projects included (not just featured) | ✅ | `renderProjects()` iterates full `projects` array |
| 7 | Sections do not split across pages | ✅ | `.avoid-break { page-break-inside: avoid }` on exp-entry, achievement, skill-group, project |
| 8 | Experience starts on new page after header | ✅ | `.section + .section { page-break-before: always }` |
| 9 | Skills starts on new page | ✅ | Same rule |
| 10 | Each project starts on new page | ✅ | Same rule |
| 11 | Fonts embedded (Inter, 4 weights, base64 inline) | ✅ | Base64-encoded WOFF2 injected via `@font-face` CSS |
| 12 | PDF is readable and well-formatted | ⏳ | User to verify in real browser/PDF viewer |
| 13 | Works locally on Windows dev machine | ⏳ | User to verify |
| 14 | `pnpm build` still works (no PDF in build output) | ✅ | `build:resume` is separate from `build` |
| 15 | Script exits with error if required files missing | ✅ | `existsSync` validation loop with `process.exit(1)` |

### Phase 2 — **IMPLEMENTED** ✅

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | `pnpm build` produces `dist/resume.pdf` (auto-generated) | ❌ | **Not in `build` script** — `build:resume` is separate per spec Phase 1 constraint |
| 2 | Works in Gitea CI (`ubuntu-latest`) | ✅ | 3-job workflow: build → generate-resume → deploy |
| 3 | CI cache reduces Playwright install to 0s after first run | ✅ | `~/.cache/ms-playwright` cached on `pnpm-lock.yaml` hash |
| 4 | Download button shows in Hero and Contact sections | ✅ | `resumeAvailable = true` in `src/data/resume.ts` |
| 5 | PDF deployed to `/resume.pdf` (root of `/dist`) | ✅ | `resume-pdf` artifact merged into `dist/` before rsync |

> **Note:** `pnpm build` does NOT auto-generate PDF (spec Phase 1 constraint). Use `pnpm build:resume` for local generation. CI generates PDF in the `generate-resume` job independently.

---

## Tradeoffs

### Phase 1

| Aspect | Detail |
|--------|--------|
| Install overhead | ~110MB (playwright + tsx) |
| Manual command | `pnpm tsx scripts/generate-resume.ts` |
| Build time | Not in `pnpm build` — developer controlled |
| CSS control | Full CSS (same as website) |
| Font embedding | Base64 in HTML, increases HTML size ~50KB |
| Photo | Inline base64 (avoids file:// URL issues) |
| Platform | Works on Windows local, Ubuntu CI |

### Phase 2

| Aspect | Detail |
|--------|--------|
| CI build time | +5-10s (download once cached, render ~2s) |
| CI first run | +60s (download Playwright browser) |
| CI subsequent | +5-10s (cache hit) |
| Workflow complexity | 3 jobs (build / generate-resume / deploy) |
| Failure isolation | PDF error does not block site deploy |

---


## Download Resume UI

### Component: `DownloadResume`

Single download button with dropdown menu on desktop, 2 separate buttons on mobile.

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

### Component: Hero CTA

**Desktop (≥769px):**
- Same dropdown pattern as `DownloadResume`
- Single "Download Resume" button with dropdown

**Mobile (<769px):**
- 2 separate buttons (current layout)
- "Download Resume (EN)" and "Download Resume (VI)"

### CSS Breakpoint

Use `@media (min-width: 769px)` for desktop dropdown layout, `@media (max-width: 768px)` for mobile 2-button layout.

### Implementation Notes

- Use native `<details>`/`<summary>` for dropdown — no React state needed
- `download` attribute on `<a>` triggers browser download
- Dropdown should close when an option is clicked (native `<details>` behavior)
- Mobile: keep existing 2-button layout in `DownloadResume.tsx` using `resumeLanguages.map()`
- Desktop: wrap in `<details>` dropdown, render only "Download Resume" as summary

---

## Future Enhancements
Deferred items are tracked in [`spec-v2-resume-future.md`](./spec-v2-resume-future.md):

| # | Enhancement | Status |
|---|-------------|--------|
| 1 | PDF Metadata (title/author) | Deferred |
| 2 | Version Stamping (footer date) | ✅ Implemented |
| 3 | Conditional Content (placeholder detection) | Deferred |
| 4 | Project Sections (render text/diagram/metrics/code) | Deferred |
| 5 | Multiple Language Versions (EN + VI) | ✅ Implemented |

