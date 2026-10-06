# Specification — v2 Analytics

> **Document:** `spec-v2-analytics.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2.md`
> **Priority:** P2
> **Estimate:** ~30 minutes

---

## Requirement

Privacy-friendly analytics — không dùng Google Analytics.

---

## Options

**Option A: Plausible Analytics** (recommended)
- Lightweight, privacy-first
- No cookie banner needed
- Simple script integration

**Option B: Umami**
- Self-hosted option
- Open source
- Similar to Plausible

**Option C: Custom minimal tracking**
- Track page views only
- Store in localStorage
- Batch send to endpoint (optional)

---

## Implementation (Plausible)

```tsx
// main.tsx — add script tag
<script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.outbound-links.js"
/>
```

Hoặc dùng `react-use-plausible`:

```tsx
import { usePlausible } from 'react-use-plausible'

const plausible = usePlausible()
// Auto pageview tracking
```

Configurable via env var: `ENABLE_ANALYTICS`

---

## Acceptance

- [ ] Page view tracking hoạt động
- [ ] Không cookie banner
- [ ] Không ảnh hưởng performance
- [ ] Configurable via env var (ENABLE_ANALYTICS)
