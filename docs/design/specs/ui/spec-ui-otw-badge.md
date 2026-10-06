# UI Spec - Open to Work Badge (Redesign)

## Overview

Thay thế badge "Open to Work" hiện tại bằng badge dạng hashtag `#OpenToWork` với spring coil SVG phía sau và swaying animation, sử dụng motion library.

---

## Structure

```
otw-container (motion.div, position absolute, góc trên-trái)
├── otw-spring (SVG, spring coil, phía sau)
│   └── path (motion.path, swaying)
└── otw-badge (motion.div, hashtag text, phía trước)
    └── #OpenToWork (span)
```

---

## Spring Coil SVG

### Design
- Shape: lò xo xoắn 1.5 vòng (3 vòng bán) + tail
- Stroke: `var(--accent)`, strokeWidth: 2, strokeLinecap: round
- ViewBox: `0 0 60 120` (dọc)
- Position: phía sau badge, offset một chút
- Width: 40px, Height: 80px

### Path data

```
M 30 0
C 50 5, 50 15, 30 20
C 10 25, 10 35, 30 40
C 50 45, 50 55, 30 60
C 10 65, 10 75, 30 80
C 50 85, 50 95, 30 100
C 10 105, 10 115, 30 120
L 30 125
```

### Animation (motion)

```tsx
<motion.path
  d="M 30 0 C 50 5, 50 15, 30 20 C 10 25, 10 35, 30 40
     C 50 45, 50 55, 30 60 C 10 65, 10 75, 30 80
     C 50 85, 50 95, 30 100 C 10 105, 10 115, 30 120 L 30 125"
  stroke="var(--accent)"
  fill="none"
  strokeWidth="2"
  strokeLinecap="round"
  animate={{ rotate: [-8, 8, -8] }}
  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
/>
```

---

## Badge

### Content
- `#OpenToWork` (text duy nhất)
- Font: monospace, bold, 20px
- Color: `var(--accent)` (theme-aware, light/dark)
- Background: transparent
- Padding: 8px 16px
- Border-radius: 8px

### Position
- Góc trên-trái của `hero-visual`
- Offset: top: 20px, left: 20px
- Z-index: cao hơn spring

### Animation (motion)

```tsx
<motion.div
  className="otw-badge"
  animate={{ rotate: [-8, 8, -8] }}
  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
/>
```

### Container animation (motion)

```tsx
<motion.div
  className="otw-container"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3, duration: 0.5 }}
/>
```

---

## Swaying Animation

### Rotation oscillate
- Range: `-8° → +8° → -8°`
- Duration: 3s
- Easing: ease-in-out
- Repeat: Infinity
- Transform-origin: top center (motion default)

### Reduced motion
- `prefers-reduced-motion: reduce` → motion library auto-handles
- Không cần CSS media query

---

## Responsive

### Desktop (>768px)
- Badge: góc trên-trái hero-visual
- Spring: phía sau badge
- Font-size: 20px
- Rotation: `-8° → +8°`

### Mobile (≤768px)
- Badge: góc trên-trái hero section
- Spring: phía sau badge
- Font-size: 16px
- Rotation: `-4° → +4°` (nhẹ hơn)
- Position: top: 16px, left: 16px

---

## Component Implementation

### `src/components/ui/OpenToWorkBadge.tsx`

```tsx
import { motion } from "motion/react"

export function OpenToWorkBadge() {
  return (
    <motion.div
      className="otw-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <svg className="otw-spring" viewBox="0 0 60 120">
        <motion.path
          d="M 30 0 C 50 5, 50 15, 30 20 C 10 25, 10 35, 30 40
             C 50 45, 50 55, 30 60 C 10 65, 10 75, 30 80
             C 50 85, 50 95, 30 100 C 10 105, 10 115, 30 120 L 30 125"
          stroke="var(--accent)"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <motion.div
        className="otw-badge"
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>#OpenToWork</span>
      </motion.div>
    </motion.div>
  )
}
```

---

## CSS Changes

### Removed (from current):
- `.otw-badge` current styles (bg, padding, shadow, etc.)
- `.otw-icon` styles

### New CSS:

```css
.otw-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}

.otw-spring {
  width: 40px;
  height: 80px;
  flex-shrink: 0;
}

.otw-badge {
  font-family: monospace;
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
  padding: 8px 16px;
  border-radius: 8px;
  white-space: nowrap;
}

/* Mobile */
@media (max-width: 768px) {
  .otw-container {
    top: 16px;
    left: 16px;
  }
  .otw-badge {
    font-size: 16px;
  }
}
```

---

## Constraints

- Không hard-code màu — dùng CSS `var(--accent)`
- Không che profile photo
- SVG inline trong component (không file ngoài)
- Accessibility: aria-label cho badge
- Animation respects `prefers-reduced-motion` (motion library auto-handled)
- Tất cả animations dùng motion library, không CSS keyframes
