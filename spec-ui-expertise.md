# UI Spec — Expertise Section

## Overview

Hiển thị các nhóm kỹ năng/chuyên môn thành các card nhóm.

---

## Structure

```
ExpertiseSection
├── SectionHeading ("Core Expertise")
└── SkillGroupsGrid
    ├── SkillGroup (×5–6)
    │   ├── GroupTitle (H3)
    │   └── SkillsList
    │       └── Skill items (×5–8 mỗi group)
```

---

## Content

| Group | Skills |
|---|---|
| **Software Engineering** | Java, Go, TypeScript, Distributed Systems, REST APIs, Microservices |
| **System Architecture** | System Design, Integration Architecture, Event-driven Architecture, Message Queues, API Design |
| **Logistics Technology** | Sortation, Warehouse/Facility Operations, Package Flow, Operational Intelligence, Facility Modeling |
| **AI / ML** | Computer Vision, Object Detection, OCR, Model Deployment, LLM, AI-assisted Engineering |
| **Infrastructure** | Docker, Linux, CI/CD, Networking, Middleware |
| **Engineering Practices** | Agile/Scrum, Technical Documentation, System Maintenance, Performance Optimization, Technical Research |

---

## Layout

### Desktop

- Grid: 3 columns (2x3)
- Mỗi card: border, padding, subtle background
- Group title: accent color, H3
- Skills: bullet list hoặc tag pills
- Row gap: 24px, column gap: 24px

### Mobile

- Single column stack
- Mỗi card full-width
- Skills: 2-column tag pills
- Padding card: 16px

### Tablet

- Grid: 2 columns (3x2)

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Section heading (H2) | 40px / 32px mobile | 600 |
| Group title (H3) | 20px | 500 |
| Skill item | 14px | 400 |

---

## SkillGroup Card

| Variant | Style |
|---|---|
| Default | Border, transparent bg |
| Hover | Border accent color, subtle shadow |

---

## Accessibility

- H2 section, H3 group titles
- Semantic `<ul>` cho skill lists
- Contrast >= 4.5:1
- Group titles có `id` cho anchor link (optional)

---

## Animation

- Cards fade-in khi scroll vào viewport
- Stagger: 80ms delay per card
- Hover: border color transition 200ms

---

## State

| State | Description |
|---|---|
| Default | Normal render |
| Hover | Border accent, subtle shadow |
| Scroll reveal | Fade-in + slide-up |
| Reduced motion | Disable animations |

---

## Constraints

- Data-driven từ `skills.ts`
- Số lượng groups và skills có thể thay đổi
- Group không có skill nào → không render card đó
