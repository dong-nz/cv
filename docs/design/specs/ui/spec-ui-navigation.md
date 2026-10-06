# UI Spec — Navigation

## Overview

Sticky navigation bar xuất hiện ở top mọi trang. Chứa logo, menu links, theme toggle.

---

## Structure

```
Navigation
├── Container (max-width, centered, padding)
│   ├── Logo (link → /)
│   ├── Menu (desktop)
│   │   ├── Home
│   │   ├── About
│   │   ├── Experience
│   │   ├── Projects
│   │   ├── Engineering
│   │   ├── Blog
│   │   └── Contact
│   ├── ThemeToggle (dark/light/system)
│   └── MobileMenuButton (hamburger)
└── MobileMenu (overlay, slide-in từ phải)
    ├── Menu links (vertical stack)
    └── ThemeToggle
```

---

## Props

```ts
interface NavigationProps {
  currentPage: string;
}
```

---

## Desktop Behavior

- Sticky top, z-index cao nhất (trừ modal)
- Background: surface color, backdrop-blur khi scroll
- Logo bên trái, menu giữa, theme toggle bên phải
- Menu links: text color muted, active state accent color, hover underline nhẹ
- Spacer giữa menu và theme toggle

---

## Mobile Behavior

- Logo bên trái, hamburger bên phải
- Menu button: icon 3 lines, toggle thành X khi mở
- Mobile menu: full-screen overlay, slide-in từ phải
- Menu links: vertical stack, font-size lớn, padding rộng
- Click ngoài overlay → đóng menu
- Click link → đóng menu + navigate
- Body scroll lock khi menu mở

---

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | < 768px | Hamburger menu |
| Tablet | 768–1023px | Full menu |
| Desktop | >= 1024px | Full menu |

---

## Accessibility

- `role="navigation"` trên container
- `aria-label="Main navigation"`
- Mobile menu: `aria-expanded`, `aria-controls`
- Focus trap khi menu mở
- Escape → đóng menu
- Focus return về hamburger button khi đóng
- Semantic `<nav>` element
- Skip link (first focusable element) → "Skip to content"

---

## State

- `isOpen` (mobile menu)
- `currentPage` (active link highlighting)
- `scrolled` (background blur trigger)

---

## Variants

| Variant | Context |
|---|---|
| Default | All pages |
| Scrolled | When page scroll Y > 0 |

---

## Constraints

- Không hard-code links — derive từ routes
- Logo clickable → /
- Theme toggle không trigger re-render toàn bộ app (context-based)
