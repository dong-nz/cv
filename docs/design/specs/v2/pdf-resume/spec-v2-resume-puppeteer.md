# Specification — v2 Resume PDF (Puppeteer)

> **Document:** `spec-v2-resume-puppeteer.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2-resume.md`
> **Priority:** P1
> **Estimate:** ~4 hours

---

## Requirement

- Generate `resume.pdf` (A4, multi-page, embedded fonts) during build
- Deployed at `/resume.pdf` (root of `/dist`)
- Download button in Hero CTA and Contact section (already implemented in `spec-v2-resume.md`)
- PDF content: Header (with profile photo), Experience, Skills, Projects (all)

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
puppeteer@^25.13.0    # Puppeteer (bundled Chromium)
```

- `puppeteer` full package (includes Chromium ~100MB)
- Installed as `devDependency`
- Chromium downloaded once, cached in `~/.cache/puppeteer`

### Build Machine

- Gitea runner: `ubuntu-latest`
- Puppeteer auto-installs Chromium on first run, cached in CI

### Font Embedding

- Font: **Inter** (Google Fonts) — clean, professional, good Vietnamese support
- Embed via `@font-face` with base64-encoded WOFF2 in HTML template
- Fallback: `system-ui, -apple-system, sans-serif`

---

## File Structure


```
scripts/
  generate-resume.mjs          # Main build script
public/
  resume-template.html         # HTML template (with {{placeholders}})
  resume.css                   # PDF-specific CSS styles
  fonts/
    Inter-Regular.woff2
    Inter-Medium.woff2
    Inter-SemiBold.woff2
    Inter-Bold.woff2
src/
  data/
    resume.ts                  # Export: resumeAvailable = true
```

---

## Implementation

### 1. Font Setup

Download Inter fonts (4 weights: Regular, Medium, SemiBold, Bold) from Google Fonts.
Place WOFF2 files in `public/fonts/` directory.
CSS `@font-face` rules use relative `url()` paths to serve fonts directly.

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./fonts/Inter-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('./fonts/Inter-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('./fonts/Inter-SemiBold.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('./fonts/Inter-Bold.woff2') format('woff2');
}
```

### 2. CSS File

`public/resume.css` — all PDF-specific styles. Referenced from HTML via `<link>`.

```css
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

/* Header — avoid break inside */
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #1a1a1a;
  margin-bottom: 16px;
  page-break-inside: avoid;
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

/* Section page breaks use explicit .page-break class */
.page-break { page-break-before: always; }

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

/* Experience — avoid break inside */
.exp-entry {
  margin-bottom: 12px;
  page-break-inside: avoid;
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

/* Achievement — avoid break inside */
.achievement {
  margin-left: 12px;
  margin-bottom: 8px;
  page-break-inside: avoid;
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
  margin-bottom: 2px;
  font-style: italic;
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

.achievement-metrics {
  font-size: 9pt;
  color: #4a4a4a;
  margin-top: 2px;
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

/* Skill group — avoid break inside */
.skill-group { page-break-inside: avoid; }

/* Projects — avoid break inside */
.project {
  margin-bottom: 12px;
  page-break-inside: avoid;
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
```

### 3. HTML Template

`public/resume-template.html` — static template with `{{placeholder}}` tokens.
References external `resume.css` and uses explicit `.page-break` classes for pagination.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume - Dong Nguyen</title>
  <link rel="stylesheet" href="resume.css">
</head>
<body>
  <!-- Header -->
  <div class="header">
    <img class="header-photo" src="profile-photo.webp" alt="Dong Nguyen" />
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
  <div class="page-break">
    <div class="section-title">Experience</div>
    {{EXPERIENCE}}
  </div>

  <!-- Skills -->
  <div class="page-break">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      {{SKILLS}}
    </div>
  </div>

  <!-- Projects -->
  <div class="page-break">
    <div class="section-title">Projects</div>
    {{PROJECTS}}
  </div>
</body>
</html>
```

### 3. Build Script

`scripts/generate-resume.mjs`:

```javascript
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Import data modules (ESM)
const { profile } = await import(join(ROOT, 'src/data/profile.ts'));
const { experiences } = await import(join(ROOT, 'src/data/experience.ts'));
const { skillGroups } = await import(join(ROOT, 'src/data/skills.ts'));
const { projects } = await import(join(ROOT, 'src/data/projects.ts'));

// Read template
const template = readFileSync(join(ROOT, 'public/resume-template.html'), 'utf-8');

// Read and encode photo
const photoPath = join(ROOT, 'public/profile-photo.webp');
const photoBase64 = readFileSync(photoPath).toString('base64');

// Render HTML
const html = template
  .replace('{{NAME}}', profile.name)
  .replace('{{TITLE}}', profile.title)
  .replace('{{EMAIL}}', profile.email)
  .replace('{{GITHUB}}', profile.githubUrl.replace('https://', 'github.com/'))
  .replace('{{LINKEDIN}}', profile.linkedinUrl.replace('https://', 'linkedin.com/in/'))
  .replace('{{PHOTO_BASE64}}', photoBase64)
  .replace('{{EXPERIENCE}}', renderExperience(experiences))
  .replace('{{SKILLS}}', renderSkills(skillGroups))
  .replace('{{PROJECTS}}', renderProjects(projects));

// Generate PDF
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });

await page.pdf({
  path: join(ROOT, 'dist/resume.pdf'),
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' },
});

await browser.close();
console.log('resume.pdf generated at dist/resume.pdf');
```

### 4. HTML Render Helpers

Helper functions in `scripts/resume-html.ts`:

```typescript
// Renders experience section HTML string
function renderExperience(experiences: ExperienceEntry[]): string {
  return experiences.map(exp => `
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
          <div class="achievement-tech">
            ${ach.technologies.map(t => `<span>${t}</span>`).join('')}
          </div>
          ${ach.impact ? `<div class="achievement-metrics">${ach.impact}</div>` : ''}
          ${ach.metrics?.length ? `<div class="achievement-metrics">${ach.metrics.join(', ')}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');
}

// Renders skills section HTML string
function renderSkills(skillGroups: SkillGroup[]): string {
  return skillGroups.map(group => `
    <div class="avoid-break">
      <div class="skill-group-title">${group.title}</div>
      <div class="skill-list">${group.skills.join(' · ')}</div>
    </div>
  `).join('');
}

// Renders projects section HTML string
function renderProjects(projects: ProjectDetail[]): string {
  return projects.map(project => `
    <div class="project avoid-break page-break-before">
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
```

### 5. Data Detection

Update `src/data/resume.ts`:

```typescript
export const resumeAvailable = true;
```

### 6. package.json

```json
{
  "scripts": {
    "build": "tsc -b && vite build && node scripts/generate-resume.mjs"
  },
  "devDependencies": {
    "puppeteer": "^24.0.0"
  }
}
```

---

## Acceptance Criteria

- [ ] `pnpm build` produces `dist/resume.pdf`
- [ ] PDF is A4 size, multi-page with correct pagination
- [ ] Header contains profile photo (circular crop), name, title, contact info
- [ ] Experience section includes all companies, roles, responsibilities, achievements
- [ ] Skills section includes all skill groups
- [ ] All projects included (not just featured)
- [ ] Sections do not split across pages (achievements, projects, skill groups use `page-break-inside: avoid`)
- [ ] Fonts are embedded (Inter, 4 weights)
- [ ] PDF is readable and well-formatted (no overflow, text not cut off)
- [ ] Works in Gitea CI (`ubuntu-latest`)
- [ ] Works locally on Windows dev machine
- [ ] Download button shows in Hero and Contact sections

---

## Tradeoffs

| Aspect | Detail |
|--------|--------|
| Bundle size | ~100MB (Puppeteer + Chromium) |
| Build time | +10-20s (download once cached, render ~2s) |
| CSS control | Full CSS (same as website) |
| Font embedding | Base64 in HTML, increases HTML size ~50KB |
| Photo | Inline base64 (avoids file:// URL issues) |
| Platform | Works on Ubuntu CI, Windows local |

---

## Puppeteer vs Playwright Comparison

| Aspect | Puppeteer | Playwright |
|--------|-----------|------------|
| Package | `puppeteer` | `playwright` |
| Size | ~100MB | ~100MB |
| API | `puppeteer.launch()` | `chromium.launch()` |
| PDF API | `page.pdf()` | `page.pdf()` |
| CSS support | Full (Chromium) | Full (Chromium) |
| CI support | Excellent | Excellent |
| Community | Larger, more examples | Growing rapidly |
| TypeScript | Built-in types | Built-in types |
| Headless flags | `--no-sandbox` needed for CI | `--no-sandbox` via config |

Both produce identical PDF output (same Chromium engine). Choice is preference.

---

## Future Enhancements

1. **Gitea workflow**: Move script execution into `deploy.yml` for cleaner separation
2. **CI caching**: Cache Puppeteer Chromium in Gitea workflow
3. **PDF metadata**: Set PDF title, author, creator
4. **Version stamping**: Add "Last updated: YYYY-MM-DD" to footer
5. **Conditional content**: Hide contact info if placeholder values detected
