# UI Spec - Hero Photo Background + Open to Work Badge

## Overview

Thay thế hero-visual (SVG diagram) bằng profile photo background, fill toàn bộ vùng bên phải hero section. Badge "Open to Work" overlay ở góc dưới ảnh.

---

## Structure

```
Hero (section)
├── hero-photo-bg (div, ảnh nền)
│   └── profile-photo.webp (img, object-fit: cover)
├── hero-content (div, text bên trái)
│   ├── hero-name (h1)
│   ├── hero-title (p)
│   ├── hero-tagline (p)
│   ├── hero-cta (div, buttons)
│   └── SocialLinks
└── OpenToWorkBadge (component, góc dưới-right)
    ├── icon (checkmark)
    ├── "Open to Work" (text chính)
    └── "Software Engineer" (subtitle)
```

---

## Hero Photo Background

### Desktop

- Position: absolute, fill `hero-visual` area
- `object-fit: cover` — fill hết khung, cắt phần thừa
- `object-position: center top` — giữ khuôn mặt ở trên
- Border-radius: 0 (khung vuông/tròn?)
- Z-index: 0 (nằm dưới text)

### Mobile

- Position: absolute, fill TOÀN BỘ hero section
- `object-fit: cover`
- Overlay gradient để text readable

---

## Text Overlay

### Desktop

- Text nằm bên trái, không đè lên ảnh
- Giữ layout 2 cột hiện tại
- Không cần overlay

### Mobile

- Overlay gradient từ trái qua (transparent → dark)
- Hoặc overlay bán trong suốt toàn bộ hero
- Đảm bảo text contrast ratio ≥ 4.5:1

---

## Open to Work Badge

### Design

- Shape: bo góc 12px
- Background: accent color (hoặc gradient accent)
- Size: 200x200 (max-width: 200px)
- Padding: 20px
- Shadow: subtle drop shadow

### Content

```
┌──────────────────┐
│  ✓  Open to Work │
│  Software        │
│  Engineer        │
└──────────────────┘
```

- Icon: checkmark (SVG inline)
- Title: "Open to Work" — bold, 18px
- Subtitle: "Software Engineer" — regular, 14px, muted
- Icon + Title: cùng dòng
- Subtitle: dòng dưới

### Position

- Desktop: góc dưới-right của `hero-visual`
- Mobile: góc dưới-right của hero section
- Margin: 20px từ cạnh

---

## Responsive

### Desktop (>768px)

```
┌──────────────────────────────────────┐
│  Text Content    │  Photo BG         │
│  (left 50%)      │  (right 50%)      │
│                  │                   │
│                  │       [OTW]       │
└──────────────────────────────────────┘
```

### Mobile (≤768px)

```
┌──────────────────────────────┐
│  Photo BG (full)             │
│  ┌────────────────────────┐  │
│  │ Text Content + Overlay │  │
│  └────────────────────────┘  │
│                  [OTW]       │
└──────────────────────────────┘
```

---

## Constraints

- Không hard-code nội dung trong JSX — data-driven từ `profile.ts`
- Ảnh fallback: placeholder gray nếu thiếu asset
- Giảm motion: không animation khi scroll
- Accessibility: alt text cho ảnh, aria-label cho badge
- Không thay đổi layout text content bên trái
