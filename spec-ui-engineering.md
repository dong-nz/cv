# UI Spec — Engineering Section

## Overview

Section giới thiệu các lĩnh vực engineering focus: Architecture, AI/ML, Experiments.

---

## Structure

```
EngineeringSection
├── SectionHeading ("Engineering")
├── Tabs or SubSections
│   ├── Architecture
│   ├── AI / ML
│   └── Experiments
└── ContentBlocks (×N)
    ├── Title
    ├── Description
    └── RelatedProjects (links)
```

---

## Content

### Architecture

- System design, distributed systems, integration architecture
- Link to relevant projects

### AI / ML

- Computer Vision, Object Detection, OCR, YOLO, ONNX, LLM
- Link to relevant projects
- Not an AI portfolio — frame as "applying AI to real problems"

### Experiments

- Local LLM, MoE, llama.cpp, GPU optimization
- Performance tracing, benchmarking
- Engineering experiments blog posts

---

## Layout

### Desktop

- Tab navigation hoặc sequential sections
- Each tab/section: max-width 800px
- Content: text + related project cards

### Mobile

- Accordion-style sections (expand/collapse)
- Single column
- Smaller font sizes

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Section heading (H2) | 40px / 32px mobile | 600 |
| Tab/Section title (H3) | 24px | 500 |
| Description | 16px | 400 |
| Related project link | 14px | 500 |

---

## Accessibility

- H2 section, H3 subsections
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Keyboard: arrow keys for tabs, Enter to activate
- Screen reader: active tab announced

---

## Animation

- Tab content fade-in (200ms)
- Accordion: smooth height transition (300ms)

---

## State

| State | Description |
|---|---|
| Default | First tab/section active |
| Tab active | Accent underline, content visible |
| Accordion open | Expanded content |
| Reduced motion | Disable transitions |

---

## Constraints

- Data-driven từ `projects.ts` (filter by category)
- Tab state in URL (`?tab=ai-ml`)
- Shareable URLs
