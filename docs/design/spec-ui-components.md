# UI Spec — Reusable Components

## Overview

Common UI components used across the portfolio.

---

## Button

### Structure

```
Button
├── Icon (optional)
├── Text
└── Loading spinner (optional)
```

### Variants

| Variant | Background | Text | Border | Use case |
|---|---|---|---|---|
| Primary | Accent | White | None | CTA |
| Secondary | Transparent | Accent | 1px accent | Secondary action |
| Ghost | Transparent | Muted | None | Tertiary action |
| Icon | Transparent | None | None | Icon-only button |

### Sizes

| Size | Padding | Font size |
|---|---|---|
| Small | 8px 12px | 12px |
| Medium | 12px 24px | 16px |
| Large | 16px 32px | 18px |

### States

| State | Style |
|---|---|
| Default | Variant style |
| Hover | Lighter/darker shade |
| Active | Darker shade |
| Disabled | Muted bg/text, no pointer, opacity 0.5 |
| Focus | Visible outline (2px accent) |
| Loading | Spinner, disabled text |

---

## Badge

### Structure

```
Badge
└── Text
```

### Variants

| Variant | Background | Text | Border |
|---|---|---|---|
| Default | Accent | White | None |
| Outline | Transparent | Accent | 1px accent |
| Muted | Muted bg | Muted text | None |

### Sizes

| Size | Padding | Font size |
|---|---|---|
| Small | 4px 8px | 11px |
| Medium | 6px 12px | 12px |

### Use cases

- Category tags
- Status indicators
- Project categories

---

## Card

### Structure

```
Card
├── Header (optional)
│   ├── Title
│   └── Meta
├── Body
│   └── Content
└── Footer (optional)
    ├── Actions
    └── Meta
```

### Variants

| Variant | Border | Background | Shadow |
|---|---|---|---|
| Default | 1px border | Surface | None |
| Elevated | None | Elevated | Subtle shadow |
| Featured | 4px accent top | Surface | Subtle shadow |

### States

| State | Style |
|---|---|
| Default | Variant style |
| Hover | Shadow + lift 2px |
| Clickable | Cursor pointer |
| Focus | Visible outline |

---

## Tag

### Structure

```
Tag
└── Text
```

### Variants

| Variant | Background | Text |
|---|---|---|
| Default | Muted bg | Muted text |
| Accent | Accent bg | White |

### Use cases

- Technology labels
- Skill tags
- Filter pills
- Category labels

---

## SectionHeading

### Structure

```
SectionHeading
├── Number (optional, "01", "02")
├── Title (H2 or H3)
└── Subtitle (optional)
```

### Variants

| Variant | Size |
|---|---|
| Large | 40px desktop / 32px mobile |
| Medium | 24px |
| Small | 20px |

---

## CodeBlock

### Structure

```
CodeBlock
├── Header (optional)
│   ├── Language label
│   └── Copy button
├── Code (pre > code)
│   ├── Line numbers (optional)
│   └── Syntax highlighted content
└── Footer (optional)
```

### Styles

| Property | Value |
|---|---|
| Background | Dark bg (#1a1a1a) |
| Font | Monospace, 14px |
| Padding | 16px |
| Border-radius | 6px |
| Border | 1px border |
| Overflow | Auto (scroll) |

### Features

- Syntax highlighting (shiki)
- Copy to clipboard button
- Line numbers (optional)
- Language label in header

---

## ImageGallery

### Structure

```
ImageGallery
├── Main image
├── Thumbnails (optional)
└── Navigation arrows (optional)
```

### Variants

| Variant | Description |
|---|---|
| Single | Single image, lazy loaded |
| Grid | Multiple images in grid |
| Carousel | Slidable with arrows |

### States

| State | Style |
|---|---|
| Loading | Skeleton placeholder |
| Error | Fallback icon + alt text |
| Hover | Zoom (subtle) |

---

## Tooltip

### Structure

```
Tooltip
└── Text
```

### Variants

| Variant | Position |
|---|---|
| Default | Above element |
| Below | Below element |
| Left | Left of element |
| Right | Right of element |

### Behavior

- Appears on hover
- Appears on focus
- Disappears on hover out / blur
- Max-width: 250px
- Word wrap

---

## Container

### Structure

```
Container
└── Children
```

### Variants

| Variant | Max-width | Padding |
|---|---|---|
| Wide | 1200px | 0 24px |
| Content | 800px | 0 24px |
| Full | None | 0 24px |

---

## TimelineMarker

### Structure

```
TimelineMarker
└── Dot
```

### Variants

| Variant | Style |
|---|---|
| Default | Circle, accent outline, 12px |
| Active | Circle, accent fill, 14px |
| Completed | Circle, muted outline, 12px |
