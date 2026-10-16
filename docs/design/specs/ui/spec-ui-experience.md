# UI Spec — Experience Section

## Overview

Timeline hiển thị kinh nghiệm làm việc: role, company, duration/location và responsibilities. Achievements **không còn render trong SPA** (2026-10-16) — dữ liệu vẫn được `scripts/generate-resume.ts` dùng cho resume PDF.

---

## Structure

```
ExperienceSection
├── SectionHeading ("Experience")
└── ExperienceTimeline (.timeline)
    ├── ExperienceEntry (×N, newest-first) — entry có `current: true` nhận thêm class `.timeline-entry-current`
    │   ├── TimelineMarker (.timeline-marker)
    │   ├── TimelineHeader (.timeline-header)
    │   │   ├── Title (.timeline-title)
    │   │   ├── Company (.timeline-company)
    │   │   └── Meta (.timeline-meta)
    │   │       ├── Duration (.timeline-duration)
    │   │       └── Location (.timeline-location)
    │   └── Responsibilities (.timeline-responsibilities → li)
    └── TldrNode (.timeline-tldr) — node chốt, luôn render sau entry cuối
        ├── Diamond marker (.timeline-tldr-marker)
        ├── Chip (.timeline-tldr-chip)
        └── Text (.timeline-tldr-text)
```

`FeaturedAchievement` và `ExpandableDetails` không còn trong markup SPA — xem §Featured Achievement. Node TLDR là node cuối của timeline — xem §TLDR Terminal Node. Entry mới nhất là một *status*, không phải vai trò đã qua — xem §Current Status Node.

---

## Content Model

```ts
interface ExperienceEntry {
  id: string;
  title: string;
  titleEn?: string;
  company: string;
  duration: string; // e.g. "Jan 2020 – Aug 2026"
  location?: string;
  responsibilities: string[];
  responsibilitiesEn?: string[];
  achievements?: FeaturedAchievement[];  // không còn trong data; resume vẫn render nếu có
  variant?: 'current' | 'gap';           // 'current' = node đang sống, 'gap' = nghỉ giữa hai vai trò
}

interface FeaturedAchievement {
  id: string;
  title: string;
  context: string;
  technicalWork: string[];
  impact: string;
  metrics?: string[];
  technologies: string[];
  featured: boolean;
}
```

Text của node TLDR **không** nằm trong `experience.ts`: nó là dẫn xuất của cả timeline chứ không phải một sự kiện, nên ở `src/i18n/strings.ts` — `experience.tldr` (nhãn chip) và `experience.tldrText` (câu tóm tắt).

---

## Layout

### Desktop

- Spine vẽ **theo từng node** (`.timeline-entry::before`, `left: -31px`, `bottom: -32px` bắc qua margin 32px) — không còn một đường liên tục trên `.timeline`, nên nó kết thúc đúng tại diamond của node TLDR thay vì chạy dài xuống dưới
- Gutter 36px (`padding-left`); marker 12px có tâm (x=6) nằm đúng trên tâm spine (5 + 1)
- Entry rhythm: 32px padding-bottom + 32px margin-bottom + 1px divider; node `gap` bỏ divider
- Bullet responsibilities: dot 5px (ring `--accent`, nhân `--accent-soft`), đặt tại `0.66em` để thẳng hàng x-height của dòng đầu

### Mobile

- ≤768px: spine và marker **được giữ** (trước đây bị ẩn) — gutter giảm còn 28px, marker `left: -28px`
- Entry rhythm giảm còn 24px

---

## Timeline Marker

| Variant | Style |
|---|---|
| Current node (`variant: 'current'`) | 12px, `--accent` fill + `--accent` ring + pulse `timeline-status-pulse` (spread 0 → 10px `--accent-glow`) |
| Gap node (`variant: 'gap'`) | **10px**, `--border-strong` ring, `--bg-primary` fill — nhỏ hơn một bậc, không accent |
| Other entries | 12px, `--border-strong` ring, `--bg-primary` fill |
| Hover | Ring chuyển sang `--accent` |

---

## Current Status Node

Entry có `variant: 'current'` trong `experience.ts`: node "bây giờ". Nó dùng **cùng họ panel với node TLDR** — flat surface, hairline border, radius, whisper shadow — và khác đúng hai chỗ: cạnh trái accent và marker pulse.

| Phần | Style |
|---|---|
| Marker | fill `--accent`, border `--accent`, `animation: timeline-status-pulse 2.4s ease-out infinite` (spread 0 → 10px `--accent-glow`, cùng idiom `.greeting-dot` của hero). Mobile đổi `animation-name` sang `timeline-status-pulse-sm` (spread 0 → 6px) |
| Panel | Entry có padding thật `16px 18px 20px` (desktop) / `14px 16px 18px` (mobile) và **bỏ divider riêng** (`border-bottom: none`); `.timeline-entry-current::after` inset `-10px -10px -10px -8px` (desktop) / `-8px -8px -8px -4px` (mobile), `--bg-surface`, `1px solid --border` + `border-left: 2px solid --accent`, radius `--radius-lg`, shadow `inset 0 1px 0 --inset-highlight, 0 8px 20px -18px --shadow`, `z-index: -1` |
| Stacking | `isolation: isolate` trên entry — panel nằm **sau** text, bullet và đoạn spine của chính entry nhưng **trước** background của section |
| Trigger | `variant?: 'current' \| 'gap'` trong `ExperienceEntry`, class ghép `timeline-entry-${variant}` trong JSX — không hard-code `exp.id` |

Không có va chạm marker–panel và không có chữ sát viền:

| | Gutter | Border trái panel | Vòng pulse ngoài cùng | Chữ bắt đầu | Hở pulse | Hở chữ |
|---|---|---|---|---|---|---|
| Desktop | 36 | 36 − 8 = **28–30** | marker 0–12 + spread 10 = 22 | 36 + 18 = **54** | 6px | 24px |
| Mobile | 28 | 28 − 4 = **24–26** | marker 0–12 + spread 6 = 18 | 28 + 16 = **44** | 6px | 18px |

Spine ở x 5–7 nằm ngoài panel. `prefers-reduced-motion` toàn cục (`index.css:275`) flatten pulse về static, marker vẫn giữ halo của rule `:first-child`.

---

## Gap Node (Career Break)

Entry có `variant: 'gap'` — khoảng nghỉ giữa hai vai trò. Mục tiêu hình ảnh: **đọc ra là một khoảng trống**, không phải một công việc.

| Phần | Style |
|---|---|
| Spine | `.timeline-entry-gap::before` đổi sang `repeating-linear-gradient` — gạch 4px, hở 5px, màu `--border-strong`; chạy suốt chiều cao node rồi bắc qua margin 32px sang node kế tiếp |
| Marker | 10px ring `--border-strong`, nhân `--bg-primary`; `left: -35px` desktop (tâm = 36 − 35 + 5 = 6, vẫn đúng trên spine), `-27px` mobile (28 − 27 + 5 = 6) |
| Divider | bỏ (`border-bottom: none`) — đường gạch nối thẳng sang node kế |
| Title | `--text-muted` + `font-style: italic` |
| Company | `--text-muted` |

Không có accent, không có bed, không có pulse: node gap nhỏ hơn và mờ hơn mọi node việc. `:first-child` fill vẫn tồn tại trong CSS nhưng `.timeline-entry-gap .timeline-marker` đứng sau trong nguồn và có cùng specificity → gap thắng nếu một ngày node gap là node đầu.

---

## TLDR Terminal Node

Node cuối, luôn có, không đến từ `experiences`: toàn bộ timeline được gói lại trong một câu.

Intent: tĩnh và lặng. Không gradient, không viền accent đậm, không quầng mạnh. Accent chỉ nằm ở ba chỗ: diamond trên spine, link hairline và chip.

| Phần | Style |
|---|---|
| Marker | 12px square `rotate(45deg)` → diamond **ruột rỗng**: border 2px `--accent`, nhân `--bg-primary` (che luôn đoạn stub spine đi sau), halo `0 0 0 3px --accent-soft`; tâm vẫn nằm đúng trên spine (x=6) |
| Stub | `.timeline-tldr::before` 2px × 22px nối đoạn spine cuối xuống tâm diamond |
| Link | `.timeline-tldr::after` **1px** accent ngang 24px, từ diamond vào border panel; vẽ đè lên diamond nên khớp nối liền một màu |
| Panel | `--bg-surface` phẳng (không gradient), border 1px `--border`, radius `--radius-lg`, `inset 0 1px 0 --inset-highlight` + `0 8px 20px -18px --shadow` |
| Chip | mono 12px, `letter-spacing: 2px`, uppercase, `--accent`, **không** nền, không khung — cùng giọng với `.section-tag` |
| Text | `var(--text-lede)` 20px / 1.55; không khai báo màu → kế thừa `p` toàn cục (`--text-secondary`), giống mọi lede khác trong site |

Cột text: 636px (homepage: `.page-body` 680 − gutter 36 − padding 2×24) → ~74 ký tự/dòng; 668px trên `/experience` (752 − 36 − 48) → ~78 ký tự/dòng. Cả hai trong band 45–80.

---

## Featured Achievement

| Scope | Status |
|---|---|
| SPA (`/experience` + homepage Experience) | **Removed 2026-10-16.** `.achievement`, `.achievement-title`, `.achievement-context`, `.achievement-impact`, `.achievement-metrics`, `.achievement-techs` deleted from `src/App.css`. |
| Resume PDF | Unchanged — `scripts/generate-resume.ts:100-115` and `public/resume-template.html:127-181` still render achievements. |
| Data / types | `achievements` in `src/data/experience.ts` and `FeaturedAchievement` in `src/types/index.ts` kept: the resume generator consumes them. |
| `.achievement-metric` | Kept — still used by `Projects.tsx:75` and `ProjectDetailPage.tsx:47`. |

---

## Typography

| Element | Size | Weight |
|---|---|---|
| Section heading (H2) | `clamp(24px, 4vw, 40px)` | 600 |
| Role title | 20px | 600 |
| Company | 16px | 400 |
| Duration / Location | 14px (chrome) | 400 |
| Responsibility | `var(--text-meta)` 15px / `var(--leading-body)` 1.65 | 400 |

Achievement title 18px and metric 14px/600 no longer appear on this section; `.achievement-metric` is chrome on the projects pages.

---

## Accessibility

- H2 section; entry titles hiện render bằng `div`, chưa phải `h3`
- Semantic `<time>` cho duration
- `aria-label` cho timeline
- Metrics: semantic highlight, không chỉ màu
- Keyboard navigate giữa entries

---

## Animation

- Mỗi entry reveal độc lập: `initial {opacity: 0, y: 24}` → `whileInView {opacity: 1, y: 0}`, `viewport {once: true, amount: 0.2}`, `duration 0.45s`, `ease easeOut`, `delay i * 0.08`
- `staggerChildren` trên section bị bỏ: nó cộng hưởng với `delay: i * 0.15` của từng child, khiến entry ở giữa trang xuất hiện muộn không cần thiết
- Hover **không còn transform nào**. `scale: 1.02` làm text re-raster hoá trong lúc animation chạy; `y: -4` cũng bị bỏ — spine là `::before` của chính entry, nâng entry sẽ nâng cả đoạn spine và làm lệch khớp nối. Phản hồi hover chuyển hết sang CSS: marker ring → `--accent`, divider → `--border-strong`
- Spine không "draw" khi scroll: mỗi node tự vẽ đoạn của mình; node TLDR kết thúc chuỗi bằng stub 22px dừng đúng tại tâm diamond
- Reduced motion: `main.tsx` đặt `motion.config.reducedMotion = 'user'`, cùng `@media (prefers-reduced-motion: reduce)` trong `src/index.css`

---

## State

| State | Description |
|---|---|
| Default | Marker ring `--border-strong`, divider `--border` |
| Hover | Marker ring → `--accent`, divider → `--border-strong` (không còn transform) |
| Scroll reveal | Fade-in + slide-up, một lần (`once: true`) |
| Reduced motion | Animation tắt theo user preference |
| Current status node | Marker pulse 2.4s + bed `--accent-soft` với border-left accent |

---

## Constraints

- Data-driven từ `experience.ts`
- Entries có thể 0 → render empty state
- `achievements` đã bị xoá khỏi `experience.ts`; field vẫn optional trong type, và `scripts/generate-resume.ts:100` vẫn render nó nếu có (optional chaining → resume PDF hiện không còn phần achievement)
- Không hard-code entry count

---

## Implementation record (2026-10-16)

- Achievements removed from `src/pages/ExperiencePage.tsx` and `src/components/sections/Experience.tsx`; the `.achievement*` rules that lost their only consumers were deleted. `.achievement-metric` stays (projects pages).
- Timeline restyled: spine vẽ theo node (`.timeline-entry::before`), marker/spine centres aligned exactly (36px gutter desktop, 28px mobile), 32px / 24px entry rhythm, filled current-role marker with `--accent-soft` halo, hover states on marker and divider, `.timeline-meta` single row (duration · location), 5px accent bullets at `0.66em`.
- Motion: per-entry `whileInView` reveal; mọi hover transform đã bỏ (spine là `::before` của entry, lift làm lệch khớp nối).
- TLDR terminal node: text tại `src/i18n/strings.ts:42-46` — `tldr` = `TL;DR` cho cả hai ngôn ngữ, `tldrText` = "15 years of experience, more than 5 companies along the way. Too long to tell." / "15 năm kinh nghiệm, hơn 5 công ty đã đi qua. Quá dài để kể hết."; markup tại `src/pages/ExperiencePage.tsx:39-43` và `src/components/sections/Experience.tsx:56-60`; CSS tại `src/App.css` (`.timeline-tldr`, `::before`, `::after`, `-marker`, `-chip`, `-text`).
- Current status node: `current?: boolean` thêm vào `ExperienceEntry` (`src/types/index.ts:50`); entry `open-to-work` tại `src/data/experience.ts:4-21` ("Nov 2026 – Present", `current: true`); class ghép tại `src/pages/ExperiencePage.tsx:17` và `src/components/sections/Experience.tsx:30`; CSS `.timeline-entry-current` + `@keyframes timeline-status-pulse` trong `src/App.css`.
- `experience.ts` giờ có 4 entry (open-to-work, Lazada 01/2020–08/2026, Nexts 06/2019–12/2019, SAP 2017–12/2019), newest-first ✓. Ba entry cũ trùng nhau `id: "senior-swe"` → trùng React key; đã đổi thành `lazada-senior-swe`, `nexts-founder`, `sap-senior-swe`, và sửa `Nexts Limted` → `Nexts Limited`.
- Bốn điểm dữ liệu chủ sở hữu cần tự xác nhận — tôi không tự sửa vì không có nguồn trong repo: (1) `sap-senior-swe` có `responsibilitiesEn` **5 bullet copy nguyên từ entry Lazada** (IoT-DWS 16 sortations, Scrum Level L3) trong khi bản VI chỉ 2 bullet, nên switch ngôn ngữ đổi cả nội dung lẫn độ dài; (2) `nexts-founder`: VI 1 bullet chung chung, EN 1 bullet cụ thể về autonomous vehicles — cũng lệch nhau; (3) TLDR nói *15 năm / hơn 5 công ty* còn dữ liệu là 2017→2026 (~9–10 năm) với 3 nhà tuyển dụng + 1 công ty tự lập; (4) `open-to-work` ghi "Nov 2026 – Present" trong khi hôm nay là 2026-10-16, và Lazada kết thúc 08/2026 → còn trống 09–10/2026.
- Verified: `tsc -b` exit 0; `vite build` green. Built CSS contains `.timeline-entry:before{…bottom:-32px;left:-31px}` (mobile `bottom:-24px;left:-23px`), `.timeline-entry:first-child:before{top:12px}`, `.timeline-entry:last-child:before{bottom:0}`, the whole `.timeline-tldr` set (`:before` stub, `:after` link, `-marker` diamond, `-chip`, `-text`) and **no** global `.timeline:before`. oxlint 11 errors / 9 warnings — identical to before this change; the HEAD baseline was 15/9 and the four that disappeared were `useField`-in-callback findings removed together with the achievements markup.
- Still open from this spec (intent not implemented): semantic `<time>` for duration, `aria-label` on the timeline, entry titles as `h3` (they render as `div`), spine draw-on-scroll, keyboard navigation between entries.
- Gap node `relax-gap` ("Nghỉ ngơi" / "Relax", `Aug 2026 – Oct 2026`, `Career break`) tại `src/data/experience.ts:20-35`, chèn đúng giữa `open-to-work` (Nov 2026 – Present) và `lazada-senior-swe` (Jan 2020 – Aug 2026) → hết khoảng trống 09–10/2026 đã nêu ở mục trên. `current?: boolean` được thay bằng `variant?: 'current' \| 'gap'` (`src/types/index.ts:50`), class ghép trong JSX; CSS `.timeline-entry-gap` + `::before` dashed + marker 10px trong `src/App.css`. Đã sửa thêm `duration` của Lazada: `"Jan 2020 –  Aug 2026"` (hai khoảng trắng) → một khoảng trắng.
- Resume PDF **có** render node gap (dòng "Relax — Career break" trong `dist/resume.pdf`). Đó là quyết định của chủ sở hữu: nếu muốn timeline SPA có nghỉ còn resume thì không, chỉ cần đổi `renderExperience(experiences)` thành `renderExperience(experiences.filter(e => e.variant !== 'gap'))` tại `scripts/generate-resume.ts:159`.
- Verified lần cuối (sau khi thêm gap node): `tsc -b` exit 0; `vite build` xanh. Built CSS có `.timeline-entry-gap:before{background:repeating-linear-gradient(to bottom,var(--border-strong) 0px,var(--border-strong) 4px,transparent 4px,transparent 9px)}`, `.timeline-entry-gap{border-bottom:none}`, `.timeline-entry-gap .timeline-marker{width:10px;height:10px;left:-35px}` + bản mobile `left:-27px`, và title/company muted với `font-style:italic`. oxlint vẫn 11 errors / 9 warnings. `pnpm build:resume-all` chạy thành công; text của `dist/resume.pdf` và `dist/resume-vi.pdf` không chứa chuỗi `undefined`.
- Va chạm hình ảnh do chủ sở hữu báo cáo: **border trái của bed chồng lên vòng pulse của marker**. Trước đây desktop `left: -14px` → border tại x 22, đúng bằng peak pulse (marker 12px + spread 10px); mobile còn tệ hơn — border tại x 14, nằm trong vùng marker 0–12 cộng halo 4px (tới 16). Nay desktop `left: -10px`, mobile `left: -2px` → border nằm tại x 26–28 ở cả hai breakpoint, hở 4px so với pulse. Built CSS xác nhận: `.timeline-entry-current:after{…inset:-12px -14px 20px -10px}` và bản mobile `left:-2px`.
- Báo cáo của chủ sở hữu: trên mobile, chữ của node đầu **sát mép trái** của decoration (gutter 28 nên border accent ở 26–28 chạm đúng chỗ chữ bắt đầu). Cách sửa: node `current` giờ được trang trí **cùng họ với node TLDR** — panel `--bg-surface` + `1px solid --border` + radius `--radius-lg` + whisper shadow, cạnh trái vẫn là accent 2px — và entry có padding thật (desktop `16px 18px 20px`, mobile `14px 16px 18px`) nên chữ nằm *trong* panel (24px desktop / 18px mobile tính từ border). Divider riêng của node bị bỏ; border của panel đóng khung. Pulse mobile giảm spread 10 → 6px (`timeline-status-pulse-sm`) để vòng pulse dừng ở x 18, panel border ở 24–26. Built CSS: `.timeline-entry-current{…padding:16px 18px 20px;border-bottom:none}` + `:after{…inset:-10px -10px -10px -8px}` và hai override mobile `padding:14px 16px 18px`, `inset:-8px -8px -8px -4px`.
