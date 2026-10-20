# Specification - v3 i18n (Multi-language)

> **Parent:** `spec-v2.md`
> **Status:** Phase 1 Complete — awaiting Phase 2

---

## Overview

Add full English/Vietnamese bilingual support to the portfolio. Users can toggle between languages; the choice persists via localStorage. All user-facing text switches dynamically without page reload.

## Architecture Philosophy

**Content lives in data, not in layout.** Every user-facing string must be defined in a centralized module — never hardcoded in JSX. This ensures:

1. **Phase 1 (frontend):** All strings in `src/i18n/strings.ts`, consumed via `useLanguage()` hook
2. **Phase 2 (backend):** Replace `src/i18n/strings.ts` with API calls — zero component changes
3. **Future-proof:** Adding a new language requires only updating the strings module and data layer, not touching components


## Implementation Progress

| # | Task | Phase | Status |
|---|------|-------|--------|
| 1 | Create `src/i18n/strings.ts` (centralized UI strings) | 1 | ✅ Completed |
| 2 | Create `src/hooks/useLanguage.ts` (context + hook) | 1 | ✅ Completed |
| 3 | Create `src/i18n/useField.ts` (bilingual data helpers) | 1 | ✅ Completed |
| 4 | Wrap App with `LanguageProvider` | 1 | ✅ Completed |
| 5 | Update `Navigation.tsx` (nav items + toggle button) | 1 | ✅ Completed |
| 6 | Update `Footer.tsx` (labels + copyright) | 1 | ✅ Completed |
| 7 | Update `Hero.tsx` (greeting, CTA, scroll, tagline) | 1 | ✅ Completed |
| 8 | Update `About.tsx` (headings, bio) | 1 | ✅ Completed |
| 9 | Update `Expertise.tsx` (section heading) | 1 | ✅ Completed |
| 10 | Update `Experience.tsx` (heading, responsibilities, achievements) | 1 | ✅ Completed |
| 11 | Update `Projects.tsx` (headings, categories, summary) | 1 | ✅ Completed |
| 12 | Update `Contact.tsx` (section heading) | 1 | ✅ Completed |
| 13 | Update `AboutPage.tsx` (headings, subtitle, expertise) | 1 | ✅ Completed |
| 14 | Update `ExperiencePage.tsx` (heading, responsibilities, achievements) | 1 | ✅ Completed |
| 15 | Update `ProjectsListPage.tsx` (heading, categories, view details) | 1 | ✅ Completed |
| 16 | Update `ProjectDetailPage.tsx` (categories, back link, headers) | 1 | ✅ Completed |
| 17 | Update `PhilosophyPage.tsx` (heading, categories, coming soon) | 1 | ✅ Completed |
| 18 | Update `ContactPage.tsx` (heading, labels) | 1 | ✅ Completed |
| 19 | Update `profile.ts` (fix tagline to VI) | 1 | ✅ Completed |
| 20 | Update `skills.ts` (add `titleEn` to skillGroups) | 1 | ✅ Completed |
| 21 | Add `.lang-toggle` CSS styles | 1 | ✅ Completed — superseded 2026-10-17 by row 28 |
| 22 | **Phase 1 Complete** | | ✅ Completed |
| 23 | Create `src/i18n/useLocaleData.ts` (API fetch + fallback) | 2 | ⬜ Pending |
| 24 | Update all components to use `useLocaleData()` | 2 | ⬜ Pending |
| 25 | Remove `src/i18n/strings.ts` | 2 | ⬜ Pending |
| 26 | Remove `src/i18n/useField.ts` | 2 | ⬜ Pending |
| 27 | **Phase 2 Complete** | | ⬜ Pending |
| 28 | Language control → icon-only wireframe (globe / flag outline), `.lang-toggle` CSS deleted — 2026-10-17 | 1 | ✅ Completed |

## Current State Analysis

### Data Layer — `src/data/`

| File | Bilingual Fields | Status |
|------|-----------------|--------|
| `profile.ts` | `bio`, `bioEn`, `tagline`, `taglineEn`, `philosophy[].title`, `titleEn`, `description`, `descriptionEn` | ✅ Ready |
| `skills.ts` | `skillGroups[].title`, `titleEn` (added) | ✅ Ready |
| `experience.ts` | `title`, `titleEn`, `responsibilities`, `responsibilitiesEn` | ✅ Ready — 2026-10-16: `achievements` dropped from the data (the type keeps it for the resume generator); new `relax-gap` career-break entry; optional `variant: 'current' \| 'gap'` |
| `projects.ts` | `title`, `titleEn`, `summary`, `summaryEn`, `sections[].title`, `titleEn`, `content`, `contentEn` | ✅ Ready |
| `resume.ts` | `resumeLanguages: ['en', 'vi']` | ✅ Already working |

**Data pattern:** Primary fields = Vietnamese, `*En` fields = English. Some `*En` fields are redundant (identical to primary).

### Layout Layer — Hardcoded Strings (✅ Resolved)

All previously hardcoded strings have been migrated to `src/i18n/strings.ts`:

| Component | Strings Migrated |
|-----------|-----------------|
| `Navigation.tsx` | Nav items + toggle button |
| `Footer.tsx` | Footer links + copyright |
| `Hero.tsx` | greeting, CTA, scroll, resume download |
| `About.tsx` | headings, bio |
| `AboutPage.tsx` | headings, subtitle, expertise |
| `Expertise.tsx` | section heading |
| `Experience.tsx` | heading, responsibilities; 2026-10-16: `experience.tldr` + `experience.tldrText` added for the TLDR terminal node (achievements strings no longer rendered in the SPA) |
| `ExperiencePage.tsx` | heading, responsibilities; 2026-10-16: same TLDR strings (achievements strings no longer rendered in the SPA) |
| `Projects.tsx` | headings, categories, summary |
| `ProjectsListPage.tsx` | heading, categories, view details |
| `ProjectDetailPage.tsx` | categories, back link, headers |
| `PhilosophyPage.tsx` | heading, categories, coming soon |
| `Contact.tsx` | heading, social labels |
| `ContactPage.tsx` | heading, labels |
| `Layout.tsx` | skip link |
| `DownloadResume.tsx` | download button text |

### Remaining — Non-UI Fields (No Translation Needed)

The following data fields are technical terms or professional titles that should remain in English only:

| Field | Reason |
|-------|--------|
| `skills.ts` → `skillGroups[].skills` | Technical terms (Java, Docker, CI/CD) |
| `profile.ts` → `keywords` | Technical terms |
| `profile.ts` → `currentInterests` | Technical terms |
| `profile.ts` → `roles` | Professional titles |
| `experience.ts` → `company`, `duration`, `location`, `technologies` | Metadata |
| `projects.ts` → `role`, `technologies`, `metrics` | Technical metadata |

### Accessibility Labels (No Translation Needed)

| Label | Reason |
|-------|--------|
| `aria-label` on nav, sections | Structural identifiers, not user-facing |
| `skipLink` | ✅ Translated via `strings.common.skipLink` |
| Social link aria-labels | ✅ Translated via `strings.common.socialAriaLabels` |

## Bilingual Data Pattern

Data layer uses a consistent pattern: **primary fields = Vietnamese, `*En` fields = English**. Components use `useLanguage()` hook to select the right field.

### Pattern: `getField(lang, value, valueEn)`

```ts
// In components:
const { lang } = useLanguage()
// Instead of: profile.bio
// Use: getField(lang, profile.bio, profile.bioEn!)

// Or via hook:
const { field } = useLanguage()
const bio = field(profile.bio, profile.bioEn)
```

### Field Mapping by Module

| Module | Field | Vietnamese | English | Status |
|--------|-------|-----------|---------|--------|
| `profile.ts` | `bio` | ✅ | `bioEn` ✅ | Ready |
| `profile.ts` | `tagline` | ✅ (updated) | `taglineEn` ✅ | Ready |
| `profile.ts` | `philosophy[].title` | ✅ | `titleEn` ✅ | Ready |
| `profile.ts` | `philosophy[].description` | ✅ | `descriptionEn` ✅ | Ready |
| `profile.ts` | `philosophy[].keywords` | — | — | English only (no translation) |
| `profile.ts` | `currentInterests` | — | — | English only (technical terms) |
| `profile.ts` | `roles` | — | — | English only (professional titles) |
| `skills.ts` | `skillGroups[].title` | ✅ | `titleEn` ✅ | ✅ Ready |
| `skills.ts` | `skillGroups[].skills` | — | — | English only (technical terms) |
| `experience.ts` | `title` | ✅ | `titleEn` ✅ | Ready |
| `experience.ts` | `responsibilities` | ✅ | `responsibilitiesEn` ✅ | Ready |
| `experience.ts` | `context` | ✅ | `contextEn` ✅ | Ready |
| `experience.ts` | `impact` | ✅ | `impactEn` ✅ | Ready |
| `experience.ts` | `technicalWork` | — | — | English only |
| `experience.ts` | `company` | — | — | English only |
| `experience.ts` | `duration` | — | — | English only |
| `experience.ts` | `location` | — | — | English only |
| `experience.ts` | `metrics` | — | — | English only |
| `experience.ts` | `technologies` | — | — | English only |
| `projects.ts` | `title` | ✅ | `titleEn` ✅ | Ready |
| `projects.ts` | `summary` | ✅ | `summaryEn` ✅ | Ready |
| `projects.ts` | `sections[].title` | ✅ | `titleEn` ✅ | Ready |
| `projects.ts` | `sections[].content` | ✅ | `contentEn` ✅ | Ready |
| `projects.ts` | `role` | — | — | English only |
| `projects.ts` | `technologies` | — | — | English only |
| `projects.ts` | `metrics` | — | — | English only |

### Fields That Don't Need Translation

These fields are already in English or are technical terms that don't change by language:

- **Professional titles:** `roles`, `title` (same in both languages)
- **Technical terms:** `skills`, `technologies`, `metrics`, `keywords`, `technicalWork`
- **Metadata:** `company`, `duration`, `location`
- **Names:** `firstName`, `lastName`, `name`

### Implementation: `src/i18n/useField.ts`

A helper hook to select the right field based on language:

```ts
// src/i18n/useField.ts
import { useLanguage } from './useLanguage'

export function useField<T>(value: T, valueEn: T | undefined): T {
  const { lang } = useLanguage()
  return lang === 'vi' ? value : (valueEn ?? value)
}

// Array support (e.g., responsibilities, technicalWork):
export function useFieldArray<T>(value: T[], valueEn: T[] | undefined): T[] {
  const { lang } = useLanguage()
  return lang === 'vi' ? value : (valueEn ?? value)
}

// Usage in components:
const bio = useField(profile.bio, profile.bioEn)
const title = useField(experience.title, experience.titleEn)
const summary = useField(project.summary, project.summaryEn)
const responsibilities = useFieldArray(exp.responsibilities, exp.responsibilitiesEn)
const context = useField(achievement.context, achievement.contextEn)
```

---

## Solution: Centralized Strings Module

### Phase 1: `src/i18n/strings.ts` — Frontend i18n

All UI strings collected in one typed module:

```ts
// src/i18n/strings.ts
export const strings = {
  nav: {
    home: { en: 'Home', vi: 'Trang chủ' },
    about: { en: 'About', vi: 'Giới thiệu' },
    experience: { en: 'Experience', vi: 'Kinh nghiệm' },
    projects: { en: 'Projects', vi: 'Dự án' },
    engineering: { en: 'Engineering', vi: 'Kỹ sư' },
    contact: { en: 'Contact', vi: 'Liên hệ' },
  },
  footer: {
    copyright: { en: 'All rights reserved', vi: 'Bảo lưu mọi quyền' },
    links: {
      home: { en: 'Home', vi: 'Trang chủ' },
      about: { en: 'About', vi: 'Giới thiệu' },
      projects: { en: 'Projects', vi: 'Dự án' },
      contact: { en: 'Contact', vi: 'Liên hệ' },
    },
  },
  hero: {
    greeting: { en: "Hi, I'm", vi: 'Xin chào, tôi là' },
    ctaProjects: { en: 'View Projects', vi: 'Xem dự án' },
    ctaContact: { en: 'Contact Me', vi: 'Liên hệ' },
    downloadResume: { en: 'Download Resume', vi: 'Tải CV' },
    scroll: { en: 'Scroll', vi: 'Cuộn' },
  },
  about: {
    heading: { en: 'About Me', vi: 'Giới thiệu' },
    subtitle: { en: 'Senior Software Engineer with deep expertise in distributed systems, logistics technology, and practical AI applications.', vi: 'Kỹ sư phần mềm cao cấp với chuyên môn sâu về hệ thống phân tán, công nghệ logistics và ứng dụng AI thực tiễn.' },
    engineeringTitle: { en: 'How I Think About Engineering', vi: 'Cách tôi tư duy về kỹ thuật' },
    exploringTitle: { en: "What I'm Exploring", vi: 'Những điều tôi đang tìm hiểu' },
    exploringTitlePage: { en: "What I'm Currently Exploring", vi: 'Những điều tôi đang tìm hiểu' },
    expertise: { en: 'Core Expertise', vi: 'Chuyên môn' },
  },
  expertise: {
    heading: { en: 'Core Expertise', vi: 'Chuyên môn' },
  },
  experience: {
    heading: { en: 'Experience', vi: 'Kinh nghiệm' },
  },
  projects: {
    featured: { en: 'Featured Projects', vi: 'Dự án nổi bật' },
    all: { en: 'Projects', vi: 'Dự án' },
    viewAll: { en: 'View All', vi: 'Xem tất cả' },
    viewDetails: { en: 'View Details', vi: 'Xem chi tiết' },
    categories: {
      'software-engineering': { en: 'Software Engineering', vi: 'Kỹ thuật phần mềm' },
      logistics: { en: 'Logistics', vi: 'Logistics' },
      'ai-ml': { en: 'AI / ML', vi: 'AI / ML' },
      'computer-vision': { en: 'Computer Vision', vi: 'Computer Vision' },
      architecture: { en: 'Architecture', vi: 'Kiến trúc' },
      experiment: { en: 'Experiment', vi: 'Thử nghiệm' },
    },
  },
  contact: {
    heading: { en: 'Contact', vi: 'Liên hệ' },
    email: { en: 'Email', vi: 'Email' },
    github: { en: 'GitHub', vi: 'GitHub' },
    linkedin: { en: 'LinkedIn', vi: 'LinkedIn' },
  },
  projectDetail: {
    notFound: { en: 'Project Not Found', vi: 'Không tìm thấy dự án' },
    backToProjects: { en: 'Back to Projects', vi: 'Quay lại dự án' },
    impact: { en: 'Impact', vi: 'Tác động' },
    role: { en: 'Role', vi: 'Vai trò' },
    technologies: { en: 'Technologies', vi: 'Công nghệ' },
    experiments: { en: 'Engineering Experiments', vi: 'Thí nghiệm kỹ thuật' },
  },
  engineering: {
    heading: { en: 'Engineering', vi: 'Kỹ sư' },
    categories: {
      architecture: { en: 'Architecture', vi: 'Kiến trúc' },
      ai_ml: { en: 'AI / ML', vi: 'AI / ML' },
      experiments: { en: 'Experiments', vi: 'Thử nghiệm' },
    },
    comingSoon: { en: 'Content coming soon. This section will showcase deep technical exploration in %s.', vi: 'Nội dung sắp ra mắt. Phần này sẽ giới thiệu các khám phá kỹ thuật chuyên sâu về %s.' },
  },
  common: {
    backTo: { en: 'Back to %s', vi: 'Quay lại %s' },
    skipLink: { en: 'Skip to content', vi: 'Bỏ qua nội dung' },
    resumeDownload: { en: 'Download Resume', vi: 'Tải CV' },
    socialAriaLabels: {
      github: { en: 'View GitHub profile', vi: 'Xem hồ sơ GitHub' },
      linkedin: { en: 'View LinkedIn profile', vi: 'Xem hồ sơ LinkedIn' },
      email: { en: 'Send email', vi: 'Gửi email' },
    },
    contactTag: { en: 'Contact', vi: 'Liên hệ' },
    experienceTag: { en: 'Experience', vi: 'Kinh nghiệm' },
  },
} as const
```

**Usage pattern:**

```tsx
const { lang } = useLanguage()
// Access: strings.nav.home[lang] → 'Home' or 'Trang chủ'
```

### Arrow Convention

Text strings MUST NOT contain arrow characters (←, →). Arrows are rendered as SVG icons in components, not translated.

```tsx
// Component code (NOT in strings.ts):
<Link to="/projects">
  <ArrowLeftIcon />
  <span>{strings.projectDetail.backToProjects[lang]}</span>
</Link>

// View Details with right arrow icon:
<span>
  {strings.projects.viewDetails[lang]}
  <ArrowRightIcon />
</span>
```

**Rationale:** Arrow direction is language-independent. Text-only translations keep strings clean and translatable.

### Social Links Aria-Labels (Accessibility)

Social link `aria-label` attributes in `Footer.tsx` and `Contact.tsx` should use `strings.common.socialAriaLabels`:

```tsx
// Footer.tsx / Contact.tsx:
<a href={profile.githubUrl} aria-label={strings.common.socialAriaLabels.github[lang]}>
  <svg>...</svg>
</a>
```

### Skip Link (Accessibility)

The "Skip to content" link in `Layout.tsx` should use `strings.common.skipLink`:

```tsx
// Layout.tsx:
<a href="#main-content" className="skip-link">
  {strings.common.skipLink[lang]}
</a>
```

### Section Tags (Accessibility)

Section `tag` props in `SectionHeading` should use `strings.common.contactTag` and `strings.common.experienceTag`:

```tsx
// Contact.tsx / ContactPage.tsx:
<SectionHeading title={strings.contact.heading[lang]} tag={`06 - ${strings.common.contactTag[lang]}`} />

// ExperiencePage.tsx:
<SectionHeading title={strings.experience.heading[lang]} tag={`03 - ${strings.common.experienceTag[lang]}`} />
```

### Download Resume Button

The "Download Resume" text in `Hero.tsx`'s `HeroDownloadDropdown` and `DownloadResume.tsx` should use `strings.common.resumeDownload`:

```tsx
// Hero.tsx / DownloadResume.tsx:
<span>{strings.common.resumeDownload[lang]}</span>
```

---

## Phase 2: Backend i18n

### `src/i18n/useLocaleData.ts` — API Integration

Replace static `strings.ts` with dynamic API calls:

```ts
// src/i18n/useLocaleData.ts
import { useLanguage } from './useLanguage'

// Fetch locale data from API
async function fetchLocaleData(lang: Language): Promise<LocaleData> {
  const response = await fetch(`/api/locales/${lang}`)
  return response.json()
}

// Hook that manages locale data loading
export function useLocaleData() {
  const { lang } = useLanguage()
  const [data, setData] = useState<LocaleData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchLocaleData(lang)
      .then(setData)
      .catch(() => {
        // Fallback to static strings
        import('./strings')
          .then(module => setData(module.default))
          .finally(() => setLoading(false))
      })
  }, [lang])

  return { data, loading }
}
```

### Migration Strategy

1. Create `useLocaleData.ts` with API fetch + `strings.ts` fallback
2. Update all components to use `useLocaleData()` instead of `strings`
3. Remove `strings.ts` (no more static strings)
4. Remove `useField.ts` (API returns properly structured data)

---

## Language Control — icon rendering (2026-10-17)

Supersedes the text-glyph design this spec first specified — `{lang === 'en' ? 'VI' : 'EN'}` in
`nav-control lang-toggle`, plus the `.lang-toggle` block that moved to `src/App.css` and is now
deleted. Both renderings are icon-only.

Both icons are line drawings. The filled first pass (red `#da251d` field, `#ff0` star, scaled from
the Wikimedia flag SVG) was redrawn as a wireframe the same day on the owner's request, then re-cut
twice more the same day: band 21×14 → 21×16 → 21×17.5 to follow the globe's footprint, mullet r=4.2
at 2px → r=3.6 at 1.5px.

`src/components/ui/LanguageIcon.tsx` draws one 20×20 icon per language:

| Language | Drawing | Stroke |
|---|---|---|
| `en` | globe: circle r=10, equator `M2 12h20`, meridian ellipse rx=4 ry=10 | `currentColor`, 2px, round joins — follows `.nav-control:hover`'s accent, like the mode toggle |
| `vi` | flag outline: 21×17.5 band (`rx=2`) at 1.5/3.25 — drawn 23×19.5 against the globe's 22×22; the width is already at the limit (the globe's own stroke spans 1..23), so every further size step has to come from height, and height drags the constitutional 2:3 to 1.2; the mullet centred at (12, 12) stays under the flag's own 0.6 × band-height construction — radius 3.6, drawn ≈ 8.3 units ≈ 36% × 41% of the band — traced as its concave decagon rather than a self-crossing pentagram | `currentColor`, no fills: band 2px round joins; star 1.5px round joins. 2px ink at r=3.6 closes the inner pentagon into a blob (the gap is 2(0.309·R − strokeWidth/2)), and miter joins throw a spike 3.24 × strokeWidth/2 past each 36° tip, drawing the star larger than its own radius |

**Bar** (`src/components/layout/Navigation.tsx`): `nav-control lang-toggle` shows the language it
switches TO — the same contract the old glyph had.

| Attribute | Source |
|---|---|
| `aria-label` | `strings.nav.langSwitch[lang]` — `Switch language` / `Đổi ngôn ngữ` |
| `title` | `strings.nav.switchTo[lang]` + the target's `langEn` / `langVi` — `Switch to Tiếng Việt` / `Chuyển sang English` |
| Content | `<LanguageIcon lang={targetLang} />`, `aria-hidden="true"` + `focusable="false"` |
| CSS | `.nav-control` chrome only; `.lang-toggle` carries no rules of its own — it marks the button in the DOM |

**Sheet** (`src/components/layout/MobileMenu.tsx`): the Language row's two options are
`.mobile-menu-icon-option` — the 44px icon-only square the Theme color and Mode rows use as
well (the Mode row's word options and `.mobile-menu-segment-option` were retired 2026-10-20,
see `spec-v3-mobile-navigation.md` Q18). Each option carries `aria-pressed` and
its own-language name in `aria-label` and `title`: an icon alone cannot say which language it is.

`langEn` / `langVi` stay flat `{en, vi}` records. A nested `langName: { en: …, vi: … }` record inside
`strings.nav` was tried and rejected: `strings.nav[navKey][lang]`, the lookup both components use for
nav labels, would then carry an object in its value union and `tsc` rejects it as a `ReactNode`.

---

## Checklist

- [x] Phase 1: Frontend i18n complete
- [ ] Phase 2: Backend i18n with API
- [ ] Testing: Verify all strings render correctly in both languages
- [ ] Testing: Verify language toggle persists across page navigation
- [ ] Testing: Verify language preference persists across sessions (localStorage)
- [x] Testing: 2026-10-17 icon swap — throwaway SSR render of `Navigation` + `MobileMenu` at `lang=en` and `lang=vi`: bar icon equals the target language's icon, `aria-label`/`title` translated, sheet options icon-only with `aria-pressed`, Mode row still word-based — 24/24 PASS, script deleted after the run. Visual pass left to the owner's browser (repo rule §5).

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language selection | `localStorage` key `portfolio-lang` | Consistent with existing `portfolio-theme` |
| Default language | Browser language (`navigator.language`) | No server-side detection needed |
| Fallback language | English (`en`) | Portfolio content is English-first |
| Data pattern | Primary = Vietnamese, `*En` = English | Matches existing profile/experience structure |
| Arrow characters | ❌ Not in strings | SVG icons for arrows, not translated |
| Section tags | Structural IDs, not translated | `01 - About` → `01 - Gioi thieu` (keep numbering) |
| Technical terms | English only | Skills, tools, frameworks don't need translation |
| Professional titles | English only | Industry-standard terms |
| Social link labels | ✅ Translated | Accessibility labels are user-facing |
| Skip link | ✅ Translated | Accessibility label is user-facing |

---

## Appendix: Complete Strings Inventory

### Navigation

| Key | English | Vietnamese |
|-----|---------|-----------|
| `nav.home` | Home | Trang chủ |
| `nav.about` | About | Giới thiệu |
| `nav.experience` | Experience | Kinh nghiệm |
| `nav.projects` | Projects | Dự án |
| `nav.engineering` | Engineering | Kỹ sư |
| `nav.contact` | Contact | Liên hệ |

### Footer

| Key | English | Vietnamese |
|-----|---------|-----------|
| `footer.copyright` | All rights reserved | Bảo lưu mọi quyền |
| `footer.links.home` | Home | Trang chủ |
| `footer.links.about` | About | Giới thiệu |
| `footer.links.projects` | Projects | Dự án |
| `footer.links.contact` | Contact | Liên hệ |

### Hero

| Key | English | Vietnamese |
|-----|---------|-----------|
| `hero.greeting` | Hi, I'm | Xin chào, tôi là |
| `hero.ctaProjects` | View Projects | Xem dự án |
| `hero.ctaContact` | Contact Me | Liên hệ |
| `hero.downloadResume` | Download Resume | Tải CV |
| `hero.scroll` | Scroll | Cuộn |

### About

| Key | English | Vietnamese |
|-----|---------|-----------|
| `about.heading` | About Me | Giới thiệu |
| `about.subtitle` | Senior Software Engineer with deep expertise... | Kỹ sư phần mềm cao cấp với chuyên môn sâu... |
| `about.engineeringTitle` | How I Think About Engineering | Cách tôi tư duy về kỹ thuật |
| `about.exploringTitle` | What I'm Exploring | Những điều tôi đang tìm hiểu |
| `about.exploringTitlePage` | What I'm Currently Exploring | Những điều tôi đang tìm hiểu |
| `about.expertise` | Core Expertise | Chuyên môn |

### Expertise

| Key | English | Vietnamese |
|-----|---------|-----------|
| `expertise.heading` | Core Expertise | Chuyên môn |

### Experience

| Key | English | Vietnamese |
|-----|---------|-----------|
| `experience.heading` | Experience | Kinh nghiệm |

### Projects

| Key | English | Vietnamese |
|-----|---------|-----------|
| `projects.featured` | Featured Projects | Dự án nổi bật |
| `projects.all` | Projects | Dự án |
| `projects.viewAll` | View All | Xem tất cả |
| `projects.viewDetails` | View Details | Xem chi tiết |
| `projects.categories.software-engineering` | Software Engineering | Kỹ thuật phần mềm |
| `projects.categories.logistics` | Logistics | Logistics |
| `projects.categories.ai-ml` | AI / ML | AI / ML |
| `projects.categories.computer-vision` | Computer Vision | Computer Vision |
| `projects.categories.architecture` | Architecture | Kiến trúc |
| `projects.categories.experiment` | Experiment | Thử nghiệm |

### Contact

| Key | English | Vietnamese |
|-----|---------|-----------|
| `contact.heading` | Contact | Liên hệ |
| `contact.email` | Email | Email |
| `contact.github` | GitHub | GitHub |
| `contact.linkedin` | LinkedIn | LinkedIn |

### Project Detail

| Key | English | Vietnamese |
|-----|---------|-----------|
| `projectDetail.notFound` | Project Not Found | Không tìm thấy dự án |
| `projectDetail.backToProjects` | Back to Projects | Quay lại dự án |
| `projectDetail.impact` | Impact | Tác động |
| `projectDetail.role` | Role | Vai trò |
| `projectDetail.technologies` | Technologies | Công nghệ |
| `projectDetail.experiments` | Engineering Experiments | Thí nghiệm kỹ thuật |

### Engineering

| Key | English | Vietnamese |
|-----|---------|-----------|
| `engineering.heading` | Engineering | Kỹ sư |
| `engineering.categories.architecture` | Architecture | Kiến trúc |
| `engineering.categories.ai_ml` | AI / ML | AI / ML |
| `engineering.categories.experiments` | Experiments | Thử nghiệm |
| `engineering.comingSoon` | Content coming soon. This section will showcase deep technical exploration in %s. | Nội dung sắp ra mắt. Phần này sẽ giới thiệu các khám phá kỹ thuật chuyên sâu về %s. |

### Common

| Key | English | Vietnamese |
|-----|---------|-----------|
| `common.backTo` | Back to %s | Quay lại %s |
| `common.skipLink` | Skip to content | Bỏ qua nội dung |
| `common.resumeDownload` | Download Resume | Tải CV |
| `common.socialAriaLabels.github` | View GitHub profile | Xem hồ sơ GitHub |
| `common.socialAriaLabels.linkedin` | View LinkedIn profile | Xem hồ sơ LinkedIn |
| `common.socialAriaLabels.email` | Send email | Gửi email |
| `common.contactTag` | Contact | Liên hệ |
| `common.experienceTag` | Experience | Kinh nghiệm |

---

## Open Questions

None remaining. All decisions made.
