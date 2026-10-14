# i18n Phase 1 — Action Items

## P1: Hardcoded Section Heading Tags

**Impact:** Section number tags không được dịch khi chuyển language. Người dùng tiếng Việt vẫn thấy "About", "Expertise", "Experience", "Projects", "Engineering" thay vì bản dịch.

**Pattern cần dùng:**
```tsx
// spec-v3-i18n.md:347-355
<SectionHeading title={strings.XXX.heading[lang]} tag={`01 - ${strings.XXX.heading[lang]}`} />
```

### Files cần fix

| File | Dòng | Current | Fix |
|---|---|---|---|
| `src/components/sections/About.tsx` | 13 | `tag="01 - About"` | `tag={strings.about.heading[lang]}` |
| `src/components/sections/Expertise.tsx` | 26 | `tag="02 - Expertise"` | `tag={strings.expertise.heading[lang]}` |
| `src/components/sections/Experience.tsx` | 26 | `tag="03 - Experience"` | `tag={strings.experience.heading[lang]}` |
| `src/components/sections/Projects.tsx` | 32 | `tag="04 - Projects"` | `tag={strings.projects.featured[lang]}` |
| `src/pages/ProjectsListPage.tsx` | 13 | `tag="04 - Projects"` | `tag={strings.projects.all[lang]}` |
| `src/pages/AboutPage.tsx` | 19 | `tag="About"` | `tag={strings.about.heading[lang]}` |
| `src/pages/EngineeringPage.tsx` | 12 | `tag="Engineering"` | `tag={strings.engineering.heading[lang]}` |

### Đã đúng (reference)

| File | Dòng | Code |
|---|---|---|
| `src/components/sections/Contact.tsx` | 23 | `tag={\`06 - ${strings.common.contactTag[lang]}\`}` |
| `src/pages/ExperiencePage.tsx` | 10 | `tag={strings.common.experienceTag[lang]}` |

---

## P1: Hardcoded Language Checks (`lang === 'vi'`)

**Impact:** 17 occurrences của inline conditional language check — duplicated logic, khó maintain khi thêm language mới, vi phạm DRY.

**Pattern cần dùng:** `useField()` hook (đã tồn tại tại `src/i18n/useField.ts`)
```tsx
import { useField } from '@/i18n/useField'

// Single value:
{useField(value, valueEn)}

// Array value:
{useFieldArray(arr, arrEn).map(item => ...)}
```

### Files cần fix

#### `src/components/sections/Expertise.tsx`

| Dòng | Current | Fix |
|---|---|---|
| 43 | `{lang === 'vi' ? group.title : group.titleEn}` | `{useField(group.title, group.titleEn)}` |

**Note:** Cần thêm `import { useField } from '@/i18n/useField'`.

#### `src/components/sections/Experience.tsx`

| Dòng | Current | Fix |
|---|---|---|
| 46 | `{lang === 'vi' ? exp.title : exp.titleEn}` | `{useField(exp.title, exp.titleEn)}` |
| 54 | `{lang === 'vi' ? exp.responsibilities : exp.responsibilitiesEn ?? []}.map(...)` | `{useFieldArray(exp.responsibilities, exp.responsibilitiesEn).map(...)}` |
| 64 | `{lang === 'vi' ? achievement.context : achievement.contextEn}` | `{useField(achievement.context, achievement.contextEn)}` |
| 73 | `{lang === 'vi' ? achievement.impact : achievement.impactEn}` | `{useField(achievement.impact, achievement.impactEn)}` |

**Note:** Cần thêm `import { useField, useFieldArray } from '@/i18n/useField'`.

#### `src/components/sections/Projects.tsx`

| Dòng | Current | Fix |
|---|---|---|
| 63 | `{lang === 'vi' ? project.summary : project.summaryEn}` | `{useField(project.summary, project.summaryEn)}` |

**Note:** Cần thêm `import { useField } from '@/i18n/useField'`.

#### `src/pages/AboutPage.tsx`

| Dòng | Current | Fix |
|---|---|---|
| 62 | `{lang === 'vi' ? group.title : group.titleEn}` | `{useField(group.title, group.titleEn)}` |

**Note:** File đã có `import { useField }` nhưng chỉ dùng cho bio. Cần thêm cho expertise section.

#### `src/pages/ExperiencePage.tsx`

| Dòng | Current | Fix |
|---|---|---|
| 16 | `{lang === 'vi' ? exp.title : exp.titleEn}` | `{useField(exp.title, exp.titleEn)}` |
| 24 | `{lang === 'vi' ? exp.responsibilities : exp.responsibilitiesEn ?? []}.map(...)` | `{useFieldArray(exp.responsibilities, exp.responsibilitiesEn).map(...)}` |
| 31 | `{lang === 'vi' ? achievement.context : achievement.contextEn}` | `{useField(achievement.context, achievement.contextEn)}` |
| 33 | `{lang === 'vi' ? achievement.impact : achievement.impactEn}` | `{useField(achievement.impact, achievement.impactEn)}` |

**Note:** Cần thêm `import { useField, useFieldArray } from '@/i18n/useField'`.

#### `src/pages/ProjectDetailPage.tsx`

| Dòng | Current | Fix |
|---|---|---|
| 37 | `{lang === 'vi' ? project.summary : project.summaryEn}` | `{useField(project.summary, project.summaryEn)}` |
| 72 | `{lang === 'vi' ? section.title : section.titleEn}` | `{useField(section.title, section.titleEn)}` |
| 73 | `{lang === 'vi' ? section.content : section.contentEn}` | `{useField(section.content, section.contentEn)}` |

**Note:** Cần thêm `import { useField } from '@/i18n/useField'`.

#### `src/pages/ProjectsListPage.tsx`

| Dòng | Current | Fix |
|---|---|---|
| 27 | `{lang === 'vi' ? project.summary : project.summaryEn}` | `{useField(project.summary, project.summaryEn)}` |

**Note:** Cần thêm `import { useField } from '@/i18n/useField'`.

---

## P2: Duplicate DownloadResume Dropdown Logic

**Impact:** ~120 dòng logic duplicate giữa `Hero.tsx` và `DownloadResume.tsx` — diverge risk cao, khó fix bug ở 2 nơi.

### Current state

| Aspect | `Hero.tsx:13-72` | `DownloadResume.tsx:41-99` |
|---|---|---|
| Component name | `HeroDownloadDropdown` | `DownloadDropdown` |
| `langLabels` | Defined locally (line 9-12) | Defined locally (line 7-10) |
| Click-outside | `useEffect` + `document.addEventListener` (line 18-31) | `useEffect` + `document.addEventListener` (line 46-59) |
| Lazer wrapper | Yes (`download-resume-shared-wrapper` → `lazer-wrapper` → `lazer-border` → `lazer-glow` → `lazer-inner`) | Same structure |
| Button content | `resumeDownload[lang]` + chevron SVG | `resumeDownload[lang]` + chevron SVG |
| Options | `resumeLanguages.map(lang => <a href={resumeUrlFor(lang)} download target="_blank">)` | `resumeLanguages.map(lang => <a href={resumeUrlFor(lang)} download>)` |
| Extra | `hero-download-dropdown`, `hero-download-summary` CSS classes | — |
| Export | `HeroDownloadDropdown` (internal to Hero.tsx) | `DownloadResume` (exported, used in Contact.tsx, ContactPage.tsx) |

### Khác biệt duy nhất

1. **Hero variant** có lazer border wrapper + custom CSS classes (`hero-download-dropdown`, `hero-download-summary`)
2. **Hero variant** dùng `target="_blank"` trên download links
3. **DownloadResume variant** có `DownloadButton` fallback component cho single-language case (line 12-39)

### Đề xuất fix

Extract thành shared component `DownloadResumeDropdown` với prop để customize:

```tsx
// src/components/sections/DownloadResume.tsx

interface DownloadResumeDropdownProps {
  className?: string        // Extra class for hero variant
  wrapperClassName?: string // Extra class for lazer wrapper
  targetBlank?: boolean     // Hero uses target="_blank"
}

function DownloadResumeDropdown({ className, wrapperClassName, targetBlank = false }: DownloadResumeDropdownProps) {
  // Shared: langLabels, useLanguage, state, click-outside effect, render logic
}

export function DownloadResume() {
  if (!resumeAvailable) return null
  // Single language → DownloadButton
  // Multiple languages → DownloadResumeDropdown
}

// Hero.tsx imports DownloadResumeDropdown and passes:
// <DownloadResumeDropdown
//   className="hero-download-dropdown"
//   wrapperClassName="hero-download-summary"
//   targetBlank
// />
```

**Files cần sửa:**
- `src/components/sections/DownloadResume.tsx` — extract shared dropdown logic
- `src/components/sections/Hero.tsx` — replace `HeroDownloadDropdown` with shared component
- `src/App.css` — consolidate CSS classes (`.hero-download-dropdown`, `.hero-download-summary`)

---

## P3: Hardcoded `langLabels`

**Impact:** `langLabels: Record<Language, string>` duplicated trong 2 file. Thêm language mới cần edit 2 nơi.

### Locations

| File | Dòng | Content |
|---|---|---|
| `src/components/sections/Hero.tsx` | 9-12 | `{ en: 'English', vi: 'Tiếng Việt' }` |
| `src/components/sections/DownloadResume.tsx` | 7-10 | `{ en: 'English', vi: 'Tiếng Việt' }` |

### Đề xuất fix

Move vào `src/data/resume.ts` hoặc `strings.common.langLabels`:

```tsx
// src/data/resume.ts
export const resumeLanguages: Language[] = ['en', 'vi']
export const resumeLanguageLabels: Record<Language, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
}
```

**Files cần sửa:**
- `src/data/resume.ts` — add `resumeLanguageLabels`
- `src/components/sections/Hero.tsx` — import from `@/data/resume`
- `src/components/sections/DownloadResume.tsx` — import from `@/data/resume`

---

## Already Done (reference only)

Những nơi đã implement đúng i18n patterns — không cần sửa:

| File | Dòng | Pattern |
|---|---|---|
| `src/components/sections/Contact.tsx` | 23 | `tag={\`06 - ${strings.common.contactTag[lang]}\`}` |
| `src/pages/ExperiencePage.tsx` | 10 | `tag={strings.common.experienceTag[lang]}` |
| `src/components/sections/About.tsx` | 16 | `useField(profile.bio, profile.bioEn)` |
| `src/pages/AboutPage.tsx` | 23 | `useField(profile.bio, profile.bioEn)` |
| `src/components/sections/Expertise.tsx` | 26 | `title={strings.expertise.heading[lang]}` |
| `src/components/sections/Experience.tsx` | 26 | `title={strings.experience.heading[lang]}` |
| `src/components/sections/Projects.tsx` | 32 | `title={strings.projects.featured[lang]}` |
| `src/i18n/useField.ts` | 1-17 | `useField` + `useFieldArray` hooks |
| `src/i18n/strings.ts` | 1-88 | All string keys defined |

---

## Summary

| Priority | Issue | Files affected | Effort |
|---|---|---|---|
| P1 | Hardcoded Section Heading Tags | 7 files | ~15 min |
| P1 | Hardcoded `lang === 'vi'` checks | 7 files, 17 occurrences | ~30 min |
| P2 | Duplicate DownloadResume logic | 2 files | ~45 min |
| P3 | Hardcoded `langLabels` | 2 files + 1 data file | ~10 min |

**Total estimated effort:** ~1.5 hours
