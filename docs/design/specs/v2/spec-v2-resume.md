# Specification — v2 Resume Download

> **Document:** `spec-v2-resume.md`
> **Version:** 0.3.0
> **Parent:** `spec-v2.md`
> **Priority:** P1
> **Estimate:** ~15 minutes

---

## Requirement

- Nút **"Download Resume"** hiển thị ở **2 vị trí**:
  1. **Hero section** — CTA row (bên cạnh "View Projects" / "Contact Me")
  2. **Contact section** — trong `contact-links` grid
- Link trực tiếp đến file PDF (`/resume.pdf`) với attribute `download`
- Khi chưa có PDF → ẩn hoàn toàn ở cả 2 vị trí
- PDF upload vào `public/resume.pdf`
- (Optional) Nav link `/resume` để xem resume dạng HTML (Phase 2+)

---

## Implementation

### Hero Section (primary CTA)

```tsx
// Hero.tsx
import { resumeAvailable } from '@/data/resume'

export function Hero() {
  return (
    <section className="hero container-wide" aria-labelledby="hero-heading">
      <div className="hero-content">
        {/* ... heading, title, tagline ... */}
        <div className="hero-cta">
          <Button href="/projects" variant="primary">
            View Projects
          </Button>
          {resumeAvailable && (
            <Button href="/resume.pdf" variant="secondary" download>
              Download Resume
            </Button>
          )}
          <Button href="/contact" variant="secondary">
            Contact Me
          </Button>
        </div>
        <SocialLinks links={socialLinks} />
      </div>
      {/* ... hero-visual ... */}
    </section>
  )
}
```

### Contact Section (secondary)

```tsx
// Contact.tsx
import { resumeAvailable } from '@/data/resume'

export function Contact() {
  return (
    <section className="section container-content" aria-labelledby="contact-heading">
      <SectionHeading title="Contact" />
      <div className="contact-links">
        {/* ... existing links (Email, GitHub, LinkedIn) ... */}
        {resumeAvailable && (
          <a href="/resume.pdf" download className="contact-link btn-primary">
            <svg>...</svg>
            <div>
              <div>Download Resume</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>PDF</div>
            </div>
          </a>
        )}
      </div>
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
- [x] Nút "Download Resume" hiển thị trong Contact section
- [x] Click → download PDF từ `/resume.pdf`
- [x] Khi chưa có PDF → ẩn hoàn toàn ở cả 2 vị trí
- [x] Responsive trên mobile
- [x] Nav không có nút Resume (Phase 2)

