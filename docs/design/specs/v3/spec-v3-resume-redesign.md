# Specification — v3 Resume PDF Redesign

> **Document:** `spec-v3-resume-redesign.md`
> **Version:** 1.6.0 (owner follow-up 6: website icon sync DONE; resume QR block wired, awaiting owner's QR images)
> **Parent:** `spec-v3-resume-improvements.md`
> **Priority:** P1
> **Status:** DONE (visual verification by owner pending)

---

## Problem

Review of `scripts/generate-resume.ts` + `public/resume-template.html` (2026-10-19) found:

| # | Issue | Evidence |
|---|-------|----------|
| 1 | PDF margins were **0mm** — `@page { margin: 20mm 18mm }` never applied: Playwright `page.pdf` defaults `preferCSSPageSize = false`, margins default to 0 (`playwright-core@1.64` `crPdf.ts`: `marginTop = convert(margin.top) \|\| 0`) | verified in `node_modules/.pnpm/playwright-core@1.64.0/.../coreBundle.js` |
| 2 | `.avoid-break` emitted by every renderer but **no CSS rule defined**; no `orphans`/`widows`, no `page-break-*` anywhere in the template | grep: 0 matches |
| 3 | ~56 lines of dead CSS `.achievement*` — `achievements` dropped from `experience.ts` 2026-10-16 | old template lines 127-182 |
| 4 | `{{ABOUT_ME_LABEL}}` replaced by the script but absent from the template — dead placeholder | old template body |
| 5 | `page.pdf` `title`/`author` options **do not exist in Playwright's API** — silently ignored dead options; PDF metadata was never set | `tsc` excess-property check against `PDFPageOptions` |
| 6 | Contact printed full URLs (`https://github.com/dong-nz`); `githubHandle`/`linkedinHandle` unused; no clickable links in the PDF | old template lines 264-268 |
| 7 | `variant: 'current' \| 'gap'` unused by the resume — career break rendered identically to a real job | `types/index.ts` |
| 8 | No brand identity: resume palette was generic warm-gray; site accent (light mode) is `#b04138` | `src/index.css` |
| 9 | `siteUrl` (`cv.vugado.com`) never linked from the PDF | `src/data/site.ts` |
| 10 | `build:resume-all` launched Chromium twice | `package.json` |

## Goal

Modern, elegant, brand-consistent A4 resume: correct print geometry, timeline experience, accent system mirroring the site's light-mode red palette, clickable contact links, single-launch bilingual generation. Open-to-work is excluded from the PDF (owner decision 2026-10-19).

## Implementation

### `public/resume-template.html` — full rewrite

- Brand tokens in `:root`: `--ink #151914`, `--muted #4b4f4a`, `--meta #756b62`, `--accent #b04138`, `--accent-soft rgba(176,65,56,.35)`, `--hairline #d9d6d0`, `--paper #ffffff` — mirrors `src/index.css` light-mode red palette.
- `@page { size: A4; margin: 16mm 15mm 14mm 15mm }` — now actually applied (see script).
- Print hygiene: `p, li { orphans: 2; widows: 2 }`, `.avoid-break { break-inside: avoid }`, `.section-title { break-after: avoid }`.
- Header: 72px circular photo with 2px accent ring, `object-position: center top` — the 3:4 portrait is anchored to the frame top so the head is never cropped (overflow cropped from the bottom, i.e. shoulders); `.header-info` offset 12px from the photo; name 20pt/700/`-0.01em`; title 11pt accent; contact as a two-column grid (`12px 1fr`, 8px column gap) — lucide stroke icons (mail, globe, github, linkedin, `currentColor`, 2px round joins, matching the site's line-art language icons) in the left column, full clickable addresses left-aligned in the right column, order email → website → github → linkedin. Text labels removed. Right end of the header: `.header-qr` block (`margin-left: auto`, 18px gap) — up to two 18mm QR images from `public/resume-qr/` (Telegram, Zalo) with 7pt uppercase `--meta` captions; assets are owner-exported from the apps, private (not committed); a missing file warns and skips (build never blocks).
- Summary: bio directly under header, no section title (modern convention; the dead `ABOUT_ME_LABEL` placeholder removed from the script).
- Experience: `.timeline` 2px hairline + node dots — filled ink for jobs, hollow `--meta` ring + italic for `variant: 'gap'`; duration pill inline right after the title (`flex-wrap`, 8px gap — no right-margin column); company line is a flex row — official company logo (`<img>` 12px, from `ExperienceEntry.logo`) + `Company · Location`; `::marker` accent bullets.
- Timeline TL;DR: final panel on the spine — accent diamond node, `TL;DR` chip (8pt uppercase letterspaced accent) + lede text on `#f5f3ef` surface with hairline border; text imported from `src/i18n/strings.ts` (`strings.experience.tldr` / `tldrText`), the same content as the site timeline.
- Projects: outline tech chips (accent text + `--accent-soft` border, radius 999px); metrics removed from the resume (owner decision 2026-10-19; data and site cards unchanged).
- Skills: 2-column grid, hairline `border-top` per group, accent group titles.
- Footer: `{{UPDATED_LABEL}}: {{UPDATED_DATE}}` only — the website link moved up into the header contact block.

### `scripts/generate-resume.ts` — full rewrite

- `--lang=all` → `['en','vi']` in **one** Chromium launch, one page, loop `page.pdf`; rejected with `--preview`.
- `escapeHtml()` applied to every data-derived string before template injection.
- Placeholder fill via literal `split/join` (avoids regex + `$` pitfalls of `String.replace`); **placeholder guard**: any unresolved `{{KEY}}` after fill → `console.error` + `exit(1)` before browser launch (prevents the dead-placeholder bug class recorded in `spec-v3-resume-improvements.md`).
- `renderExperience` filters `variant === 'current'` — the open-to-work entry is excluded from the resume PDF entirely (owner decision 2026-10-19; site timeline untouched). The earlier status-pill design was removed: `renderStatus`, `OPEN_TO_WORK` labels, and the `{{STATUS}}` placeholder no longer exist. `renderTldr` reads the shared `strings` module — no duplicated TL;DR copy.
- `resolveField(en, vi, lang)` now takes the language explicitly (script handles multiple languages per run).
- `page.pdf`: added `preferCSSPageSize: true` (activates `@page`) and `tagged: true` (tagged/accessibility PDF); removed the non-existent `title`/`author` options — PDF Title metadata now comes from the HTML `<title>` (`Resume - {NAME}` per language).
- `mkdirSync(dirname(outputPath), { recursive: true })` before writing.

### `package.json`

- `build:resume-all` → `pnpm tsx scripts/generate-resume.ts --lang=all` (single launch).

## Affected Files

| File | Action |
|---|---|
| `public/resume-template.html` | Rewritten (302 → ~300 lines, all placeholders re-keyed) |
| `scripts/generate-resume.ts` | Rewritten (~240 lines) |
| `package.json` | 1 line (`build:resume-all`) |
| `AGENTS.md` | Design Specs table: + "resume redesign" |
| `docs/design/specs/v3/spec-v3-resume-redesign.md` | New (this file) |
| `src/data/*`, site components | **Unchanged** — resume only reads existing data (`variant`, handles, `siteUrl`) |

## Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 1 | `pnpm build:resume-all` generates `dist/resume.pdf` + `dist/resume-vi.pdf` in one Chromium launch | ✅ (1.5s, both files written) |
| 2 | `@page` margin applied via `preferCSSPageSize: true` | ✅ option set; visual ✅ pending owner check |
| 3 | No unresolved `{{PLACEHOLDER}}` reaches the renderer | ✅ guard exits 1 on leftover; run passed |
| 4 | Contact rows render as icon + full clickable address, icons and values column-aligned, order email → website → github → linkedin | ✅ grid `12px 1fr`, lucide inline SVGs |
| 5 | Open-to-work fully excluded from the resume — no pill, no experience entry | ✅ filter verified; pill removed 2026-10-19 |
| 6 | Gap entry renders hollow node + italic | ✅ `.gap` variant class emitted from data |
| 7 | Company logos render inline for entries with `logo`; entries without logo render unchanged; missing asset file fails the build with a clear error | ✅ logo loader validates, alt="" decorative |
| 8 | `pnpm lint` introduces no new warnings | ✅ (only pre-existing warnings in unrelated files) |
| 9 | Script type-checks clean | ✅ via throwaway tsconfig (bundler resolution + `@/*` paths); `scripts/` is **not** covered by `tsc -b` — known gap, see Tradeoffs |
| 10 | Tagged PDF enabled | ✅ `tagged: true` accepted by Playwright 1.64 types |

## Tradeoffs

| Aspect | Detail |
|---|---|
| PDF author metadata | `printToPDF` has no author parameter; Playwright has no `author` option — author metadata is not set. Title comes from HTML `<title>`. |
| Open-to-work | The `variant: 'current'` entry is excluded from the PDF entirely (owner decision); full text remains on the site timeline. |
| ATS | Single-column, real bullets, text-first markup kept — chips/pills are visual only, extraction-safe. |
| `scripts/` type coverage | `tsconfig.node.json` includes only `vite.config.ts`; the resume script is type-checked only ad hoc. Left as-is (config change out of scope). |
| Palette | Resume is locked to the light-mode red palette (print default); no `--palette=` flag. |

## Progress

- [x] Template rewrite (tokens, header, timeline, chips, skills grid, footer, print hygiene)
- [x] Script rewrite (renderers, escapeHtml, split/join fill, placeholder guard, `--lang=all`, `preferCSSPageSize`, `tagged`, mkdir)
- [x] `package.json` `build:resume-all` → `--lang=all`
- [x] `pnpm lint` — no new warnings
- [x] `pnpm build:resume-all` — both PDFs generated, guard passed
- [x] Owner follow-up (2026-10-19): open-to-work pill removed end-to-end; photo `object-position: center top`; both PDFs regenerated
- [x] Owner follow-up 2 (2026-10-19): contact stacked one full URL per line + website line added; duration pill inline after title; footer reduced to date only; both PDFs regenerated
- [x] Owner follow-up 3 (2026-10-19): contact labelled + reordered (email, website, github, linkedin); TL;DR panel added to resume timeline (shared strings); project metrics removed from resume
- [x] Owner follow-up 4 (2026-10-19): text labels replaced with lucide mail/globe/github/linkedin line icons; contact re-aligned as a two-column grid; label plumbing removed from script
- [x] Owner follow-up 5 (2026-10-19): company logos in resume timeline — `public/resume-logos/lazada.svg` (Commons "Lazada (2019)", wordmark + heart) + `sap.svg` (Commons "SAP-Logo", blue box wordmark), data-driven via new `ExperienceEntry.logo?: string` (`"lazada"`, `"sap"`); site components NOT touched — owner reviews resume first, site sync is a separate follow-up
- [x] Owner follow-up 6a (2026-10-19): website icon sync — new shared `src/components/ui/icons.tsx` (lucide stroke mail/github/linkedin, `currentColor`, 2px round joins — same set as the resume header); `SocialLinks.tsx` tiles (20px) + `Contact.tsx` cards (24px) now import it; filled github octocat / linkedin square marks removed. Resume QR (telegram/zalo) = follow-up 6b, pending owner inputs; website QR gated on owner review
- [x] Owner follow-up 6b (2026-10-19): resume QR block wired end-to-end — `resumeQr` descriptors in `src/data/resume.ts`, loader + `renderQr` in the script, `{{QR_CODES}}` placeholder + `.header-qr` CSS in the template; dummy-PNG pipeline test then real assets landed: owner supplied `public/resume-qr/telegram.jpg` + `zalo.jpg` (owner also flipped the data to `.jpg`); payloads decoded locally (pyzbar): `https://t.me/dongdn`, `https://zaloapp.com/qr/p/14ic4cmkuegf`. Both `resume.pdf` and `resume-vi.pdf` now rebuilt with the QR block embedded (verified: 630×630 + 512×512 JPEG XObjects in both). Website QR display gated on owner review
- [x] Owner follow-up 7 (2026-10-19): (a) **contact page icons missed in 6a** — `src/pages/ContactPage.tsx` is a third copy of the contact cards with its own inline fill SVGs; now imports the shared `icons.tsx` set too (bundle chunk 3.52 → 2.04 kB proves the inline paths are gone); (b) resume photo 64 → 72px; (c) `.header-info` `margin-left: 12px`; (d) QR gap 10 → 18px. `resume.pdf` rebuilt with all four; `resume-vi.pdf` blocked by owner's locked viewer (EBUSY ×2) — re-run `pnpm build:resume-all` after closing it. NOTE: while a `dist/resume*.pdf` is open in a viewer, `pnpm build` also fails (vite `emptyDir` EPERM on the locked PDF)
- [x] Owner follow-up 8 (2026-10-19): Telegram + Zalo added to website social links — `SocialId` extended (`telegram`, `zalo`), `Profile.telegramUrl` (`https://t.me/dongdn`) + `Profile.zaloUrl` (`https://zaloapp.com/qr/p/14ic4cmkuegf`, same target as the resume QR), two entries appended in `social.ts`, aria labels en/vi in `strings.social.aria`; new `TelegramIcon` + `ZaloIcon` in `icons.tsx` as **simple-icons brand glyphs** (monochrome `currentColor`; lucide dropped brand icons — `lucide:telegram` 404s) — so the tiles are stroke lucide (mail/github/linkedin) + filled brand glyphs (telegram/zalo). Hero, footer, and the mobile sheet pick up all 5 tiles automatically via `SocialLinks`. Verified: `tsc -b` pass, bundle contains both hrefs + both aria labels exactly once, lint unchanged
- [x] Throwaway strict typecheck of `scripts/generate-resume.ts` — clean (temp config removed)
- [x] Owner follow-up 9 (2026-10-19): Telegram + Zalo cards added to contact — new shared `src/components/ui/ContactLinks.tsx` renders all 5 cards (email, github, linkedin, telegram, zalo) from `profile` + `strings.contact` (new labels `telegram`/`zalo`, new `Profile.telegramHandle`); **`Contact.tsx` (98→34 lines) and `ContactPage.tsx` (83→29 lines) deduplicated** — the two hand-copied card lists (root cause of the follow-up 7 miss) are gone, both consumers render `<ContactLinks />`; Zalo card sub is `zaloapp.com/qr/p/14ic4cmkuegf` (URL minus protocol; swap to `zalo.me/<phone>` if owner supplies the number). Proof: throwaway SSR render → exactly 5 `contact-link` anchors with correct href/target/rel (mailto has none) incl. `t.me/dongdn` + `@dongdn`; `pnpm build` + sitemap clean (ContactPage chunk 2.04 → 0.53 kB), lint unchanged. Also unblocked: viewer closed → both resume PDFs rebuilt (14:34)
- [x] Owner follow-up 10 (2026-10-19): **Zalo removed from the site** — `SocialId` drops `'zalo'`; `Profile.zaloUrl` removed from `src/data/profile.ts` and from the `Profile` interface in `src/types/index.ts`; the zalo entries are gone from `social.ts` and `ContactLinks.tsx` (its `labelKey` union narrows to email/github/linkedin/telegram); `strings.social.aria.zalo` and `strings.contact.zalo` + `zaloSub` deleted; `ZaloIcon` deleted from `icons.tsx`, so the tiles are stroke lucide (mail/github/linkedin) + the filled telegram glyph. Hero, footer and the mobile sheet follow automatically through `SocialLinks`. **Resume QR block unchanged by owner decision** — `resumeQr` keeps `{id: 'zalo', file: 'zalo.jpg'}` and `public/resume-qr/zalo.jpg` stays on disk; only the website drops Zalo. Proof: `pnpm lint` no new warnings, `tsc -b` + `vite build` clean (545 modules, ContactPage chunk 0.53 kB), grep over `src/` finds `zalo` only in `resume.ts`
- [x] Owner follow-up 11 (2026-10-19): **header photo + QR gap** — `.header-photo` 72 → 96px; `.header-info` `margin-left` 12 → 24px (clear space for the bigger photo); `.header-qr` keeps `margin-left: auto` and its `gap` goes 18 → **50px**, so the pair stays pinned to the right edge while the Telegram code sits 50px left of Zalo — each code gets its own quiet zone and a scanner cannot land on the wrong one. Measured at the real print content width (180mm = 680px): photo 96×96 at x=0, info x=138, Telegram QR 493.9–562, Zalo QR 612–680 (flush with the right edge), **QR separation 18 → 50.0 px**, 137px clear between the contact info and the Telegram code, all four contact URLs still one line each, nothing overflows the 680px content box. Header height is unchanged (150.8px — the info block, not the photo, is the tallest child), so pagination does not move. QR payloads re-decoded before the move: `telegram.jpg` → `https://t.me/dongdn`, `zalo.jpg` → `https://zaloapp.com/qr/p/14ic4cmkuegf` (assets correctly labelled). Both `resume.pdf` and `resume-vi.pdf` rebuilt (21:25)
- [x] Owner follow-up 12 (2026-10-19): **download-resume button removed from the site contact surfaces** — `<DownloadResume />` deleted from `src/components/sections/Contact.tsx` and `src/pages/ContactPage.tsx` (each now ends at `<ContactLinks />`); `DownloadResume()` and its single-language `DownloadButton()` fallback deleted from `src/components/sections/DownloadResume.tsx` (104 → 71 lines, the file exports only `DownloadResumeDropdown`, which is what Hero uses — hero CTA untouched), so the `resumeAvailable` and `Language` imports that only those two components used are gone; the dead `.download-resume-button` rule and its comment deleted from `src/App.css`. `resumeAvailable` stays in `src/data/resume.ts` because Hero gates its CTA on it. Proof: `pnpm lint` unchanged (4 pre-existing warnings), `tsc -b` + `vite build` clean, built CSS 33.69 → 33.60 kB with zero `download-resume-button` hits, ContactPage chunk 0.53 → 0.51 kB, hero CTA classes (`hero-download-dropdown`, `hero-download-summary`, `hero-download-mobile-btn`, `download-resume-option`) and the `/resume.pdf` href still in the bundle
- [ ] Owner visual check of `dist/resume.pdf` / `dist/resume-vi.pdf` in a real browser/PDF viewer
