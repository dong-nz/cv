# UI Spec — Contact Section

## Overview

Section trang thông tin liên hệ: email, GitHub, LinkedIn, và optional contact form.

---

## Structure

```
ContactSection
├── SectionHeading ("Contact")
├── ContactInfo
│   ├── Email (link)
│   ├── GitHub (link)
│   └── LinkedIn (link)
└── ContactForm (Phase 2 / optional)
    ├── Name
    ├── Email
    ├── Subject
    ├── Message
    └── Submit button
```

---

## Content

| Element | Value |
|---|---|
| **Email** | _[TBD — email]_ |
| **GitHub** | _[TBD — github URL]_ |
| **LinkedIn** | _[TBD — linkedin URL]_ |
| **Form** | Optional (Phase 2) |

---

## Layout

### Desktop

- Single column, max-width 600px
- Contact info: row of 3 links, icon + text
- Form (if present): stacked inputs, max-width 500px

### Mobile

- Single column
- Contact info: stacked or 2-column grid
- Form: full-width inputs

---

## Contact Links

| Variant | Style |
|---|---|
| Default | Icon + text, muted color |
| Hover | Accent color |
| Focus | Visible outline |

---

## Contact Form (Phase 2)

| Field | Type | Required |
|---|---|---|
| Name | text input | Yes |
| Email | email input | Yes |
| Subject | text input | Yes |
| Message | textarea | Yes |
| Submit | button | — |

| Variant | Style |
|---|---|
| Input default | Border, padding, transparent bg |
| Input focus | Accent border, shadow |
| Input error | Red border, error message below |
| Submit default | Accent bg, white text |
| Submit hover | Lighter accent |
| Submit disabled | Muted bg, no pointer |

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Section heading (H2) | 40px / 32px mobile | 600 |
| Link text | 16px | 400 |
| Form label | 14px | 500 |
| Form input | 16px | 400 |
| Form placeholder | 16px | 400 |
| Submit text | 16px | 500 |
| Error message | 14px | 400 |

---

## Accessibility

- H2 section heading
- Links: `aria-label` with platform name
- Form: `<label>` for each input, `aria-describedby` for errors
- Form validation: aria-invalid on invalid fields
- Submit: `aria-disabled` when disabled
- Focus visible on all form elements
- Error messages: `role="alert"`

---

## Animation

- Links: color transition 150ms
- Form: focus ring 200ms
- Submit: hover/active transitions 150ms

---

## State

| State | Description |
|---|---|
| Default | Normal render |
| Hover | Link color change |
| Focus | Visible outline |
| Form error | Red border + message |
| Form success | Success message |
| Form submitting | Disabled button + loading state |
| Reduced motion | Disable transitions |

---

## Constraints

- Phase 1: links only (mailto: for email)
- Phase 2: form with external service (Formspree, etc.)
- Form validation: client-side + server-side
- Rate limiting on form submit (Phase 2)
- Spam protection (Phase 2)
