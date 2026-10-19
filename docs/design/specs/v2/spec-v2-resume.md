# Specification — v2 Resume Download

> **Document:** `spec-v2-resume.md`
> **Version:** 0.4.0
> **Parent:** `spec-v2.md`
> **Priority:** P1
> **Estimate:** ~15 minutes

---

## Requirement

- Nút **"Download Resume"** hiển thị ở **2 vị trí**:
  1. **Hero section** — CTA row (bên cạnh "View Projects" / "Contact Me")
  2. **Contact section / Contact page** — riêng biệt, sau `contact-links` grid
- Link trực tiếp đến file PDF (`/resume.pdf`) với attribute `download`
- Khi chưa có PDF → ẩn hoàn toàn ở cả 2 vị trí
- PDF upload vào `public/resume.pdf`
- (Optional) Nav link `/resume` để xem resume dạng HTML (Phase 2+)

---

## Implementation

### DownloadResume Component

```tsx
// src/components/sections/DownloadResume.tsx
import { resumeAvailable } from '@/data/resume'

export function DownloadResume() {
  if (!resumeAvailable) return null
  return (
    <div style={{ marginTop: '32px' }}>
      <a href="/resume.pdf" download className="contact-link" style={...}>
        <svg>...</svg>
        <div>Download Resume</div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>PDF</div>
      </a>
    </div>
  )
}
```

### Hero Section (primary CTA)

```tsx
// Hero.tsx
import { Button } from '@/components/ui/Button'
import { resumeAvailable } from '@/data/resume'

export function Hero() {
  return (
    <div className="hero-cta">
      <Button href="/projects" variant="primary">View Projects</Button>
      {resumeAvailable && (
        <Button href="/resume.pdf" variant="secondary" download>Download Resume</Button>
      )}
      <Button href="/contact" variant="secondary">Contact Me</Button>
    </div>
  )
}
```

### Contact Section (home page)

```tsx
// Contact.tsx
import { DownloadResume } from '@/components/sections/DownloadResume'

export function Contact() {
  return (
    <section>
      <SectionHeading title="Contact" />
      <div className="contact-links">
        {/* Email, GitHub, LinkedIn */}
      </div>
      <DownloadResume />
    </section>
  )
}
```

### ContactPage (standalone page)

```tsx
// ContactPage.tsx
import { DownloadResume } from '@/components/sections/DownloadResume'

export function ContactPage() {
  return (
    <section>
      <h2>Contact</h2>
      <div className="contact-links">...</div>
      <DownloadResume />
    </section>
  )
}
```

### Data Detection

```ts
// src/data/resume.ts
export const resumeAvailable = true // set false khi chưa có PDF
```

### Nav (optional — Phase 2)

Nút Resume trong nav chỉ hiện khi có `/resume` route (HTML resume page).

---

## Acceptance

- [x] Nút "Download Resume" hiển thị trong Hero CTA row
- [x] ~~DownloadResume component riêng, dùng lại trong Contact section và ContactPage~~ — superseded 2026-10-19: the button was removed from both contact surfaces (follow-up 12 in `specs/v3/spec-v3-resume-redesign.md`); Hero keeps the CTA
- [x] Click → download PDF từ `/resume.pdf`
- [x] Khi chưa có PDF → ẩn hoàn toàn ở cả 2 vị trí
- [x] Responsive trên mobile
- [x] Nav không có nút Resume (Phase 2)
