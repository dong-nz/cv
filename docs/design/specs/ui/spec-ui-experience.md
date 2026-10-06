# UI Spec — Experience Section

## Overview

Timeline hiển thị kinh nghiệm làm việc, tập trung vào achievements và impact.

---

## Structure

```
ExperienceSection
├── SectionHeading ("Experience")
└── ExperienceTimeline
    └── ExperienceEntry (×N)
        ├── TimelineMarker
        ├── Company/RoleHeader
        │   ├── Title
        │   ├── Company
        │   └── Duration
        ├── Responsibilities
        │   └── List items
        ├── FeaturedAchievement (optional)
        │   ├── AchievementTitle
        │   ├── Context
        │   ├── TechnicalWork
        │   ├── Impact (with metrics)
        │   └── Tags (technologies)
        └── ExpandableDetails (optional)
```

---

## Content Model

```ts
interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  duration: string; // e.g. "2021 – Present"
  location?: string;
  responsibilities: string[];
  achievements?: FeaturedAchievement[];
}

interface FeaturedAchievement {
  id: string;
  title: string;
  context: string;
  technicalWork: string[];
  impact: string;
  metrics?: string[];
  technologies: string[];
  featured: boolean;
}
```

---

## Layout

### Desktop

- Timeline line bên trái
- Entries bên phải timeline
- Mỗi entry: full-width card
- Featured achievement: nested card với accent border
- Metrics: highlight box (accent background, white text)
- Tags: row of pills

### Mobile

- Timeline line ẩn
- Entries: stacked cards
- Featured achievement: full-width nested card
- Metrics: inline highlight
- Tags: wrap pills

---

## Timeline Marker

| Variant | Style |
|---|---|
| Default | Circle, accent color, 12px diameter |
| Active (current role) | Circle, accent fill, 14px diameter |
| Completed | Circle, accent outline, 12px diameter |

---

## Featured Achievement

| Variant | Style |
|---|---|
| Default | Accent left border (4px), padding, subtle bg |
| Metrics | Accent bg, white text, bold |
| Tags | Pill style, muted bg, muted text |

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Section heading (H2) | 40px / 32px mobile | 600 |
| Role title | 20px | 600 |
| Company | 16px | 400 |
| Duration | 14px | 400 |
| Responsibility | 14px | 400 |
| Achievement title | 18px | 500 |
| Impact metric | 16px | 600 |

---

## Accessibility

- H2 section, H3 entry titles
- Semantic `<time>` cho duration
- `aria-label` cho timeline
- Metrics: semantic highlight, không chỉ màu
- Keyboard navigate giữa entries

---

## Animation

- Timeline line draw từ trên xuống khi scroll vào viewport
- Entries fade-in stagger (150ms delay)
- Featured achievement: accent border appear

---

## State

| State | Description |
|---|---|
| Default | Normal render |
| Hover | Entry subtle lift (shadow) |
| Scroll reveal | Fade-in + slide-up |
| Reduced motion | Disable animations |

---

## Constraints

- Data-driven từ `experience.ts`
- Entries có thể 0 → render empty state
- Featured achievements là optional trong entry
- Không hard-code entry count
