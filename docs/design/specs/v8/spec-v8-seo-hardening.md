# Spec v8 — SEO hardening & security headers (response to the 2026-10-29 site audit)

Status: **implemented 2026-10-29 (repo side)** — Stages 1–3 built and verified locally: route pages + real 404 (nginx 1.31 end-to-end test), security headers in Report-Only form + gzip, heading hierarchy + diagram rendering + og dimensions. Automated checks green (`build`, `validate:content`, `lint`, `nginx -t`). Open: owner browser walkthrough (project rule 5), the CSP console observation before enforcement (D5), and the Stage 4 / D3 decisions (§6).

Source: `docs/feedback/site-audit-2026-10-29-en.md` (audit of https://cv.vugado.com/, 29 Oct 2026). This spec records the audit's findings verified against the repository, the proposed fix for each, and the options for everything the audit leaves to owner judgement.

## 1. Audit findings verified against the repository

Every confirmed finding is real in this codebase. Evidence:

|Audit item|Repo evidence|Confirmed|
|---|---|---|
|4.1 Same title/description on all pages; canonical + og:url → homepage|`index.html` is the only HTML document: one title/description, `canonical` → `%SITE_URL%/` (`index.html:15`), `og:url` → `%SITE_URL%/` (`:24`); no per-route metadata anywhere. `scripts/generate-sitemap.ts` lists 9 URLs — the sitemap contradicts the canonicals|Yes|
|4.2 Unknown URL returns 200 + empty main (soft 404)|`nginx.conf` `location / { try_files $uri $uri/ /index.html; }` → 200 for any unknown path; `src/App.tsx` has no `path="*"` route → Layout with an empty `<main>`|Yes|
|4.3 Missing CSP / HSTS / X-Frame-Options / nosniff / Referrer-Policy / Permissions-Policy|No security header appears in `nginx.conf`|Yes|
|4.4 Content exists only after JavaScript|`index.html:88` — `<div id="root"></div>`; all text is client-rendered|Yes|
|4.5 Language invisible to crawlers; no hreflang; og:locale stays `en_US`|`src/hooks/useLanguage.tsx` — language is localStorage only (`portfolio-lang`), URL never changes; `index.html:25` fixed `og:locale`|Yes|
|4.6 JS/CSS uncompressed while HTML is compressed|`nginx.conf` declares no `gzip_types` → nginx's default compresses `text/html` only|Yes|
|4.7 No H1 on About / Experience / Projects / Contact / Philosophy / How it works|The only H1 is `Hero.tsx:50`; `SectionHeading.tsx:16` renders `<h2>` and is the top heading on every standalone page|Yes|
|4.7 Project detail skips H2 (H1 → H3)|`ProjectDetailPage.tsx:70` h1 → `:105,:125,:137,:152` h3; section titles `:179` h4|Yes|
|4.7 Raw Markdown code fences on IoT-DWS|`src/i18n/locales/vi/content/projects.json:24,:54` — ```` ```text ```` ASCII diagrams in `iot-dws-integration.sections.architecture` and `awb-detection.sections.pipeline`. The EN document lacks these fields → the per-field VI fallback renders the fences in **both** languages. `ProjectDetailPage.tsx:183` renders every section as `<p>` regardless of its type|Yes|
|4.7 "Internal text/diagram labels" on the public page|`ProjectDetailPage.tsx:184` renders `<Tag accent>{section.type}</Tag>` — the internal `text`/`diagram` type chip is printed on every section card in view mode. The structure document already declares `"type": "diagram"` (`src/data/projects.json:28,:62`) but no rendering path exists for it|Yes|
|4.7 og:image declares 1200×1600; file is 500×667|`index.html:28-29`; `public/profile-photo.webp` measures 500×667 (VP8X header, verified 2026-10-29)|Yes|
|§5 sitemap lastmod = build date, not content change date|`scripts/generate-sitemap.ts:26` `new Date()`|Yes|

Also checked against the audit's §4.6 note ("editor code must not inflate the initial download"): already satisfied — pages and `EditModeShell` are lazy chunks (`App.tsx`). No work needed.

Not confirmed as defects (audit §5, general recommendations): content/copy review, device visual testing, accessibility walkthrough, Search Console — owner-side activities, listed in §7.

## 2. Stage 1 — per-route HTML + genuine 404 (fixes 4.1, 4.2; partial 4.4)

One mechanism solves both findings: the build emits a real file per route, each carrying its own metadata.

**Decision D1 (proposed):** build-time route generation from the existing data layer, not SSR and not a client-side meta library. The per-route manifests (`src/data/pages/*.json`) already declare which entity fields and UI groups each page renders — the generator reuses them, so per-route metadata is a JSON concern, never a component concern.

### 2.1 Implementation details

- New `scripts/generate-route-pages.ts` (`pnpm generate:routes`, wired into `pnpm build` after `vite build`, before `pnpm sitemap`):
  - Reads `dist/index.html` as the head template and the site identity the same way `generate-sitemap.ts` does (guard: `SITE_URL` must appear in the built head).
  - For every route in `navPaths` plus every `/projects/{id}` from the project data: writes `dist/<route>/index.html` with —
    - `canonical` + `og:url` + `og:title` + `og:description` + `twitter:*` + `description` specific to that route;
    - localized strings from the dictionaries: static pages read a **new `ui/meta.json` group** keyed by `PageId` (`{ title, description }` per language); project pages reuse the existing content records (`title` + `summary`) — no new keys;
    - the body stays the empty `#root` + `<script type="module">` — the SPA boots from any shell exactly as it does today;
    - optionally a `<noscript>` block generated from the manifest claims (page heading, nav links, claimed content text) — Decision D4 (§6).
  - Writes `dist/404.html`: localized from new `notFound` keys in `ui/common.json` (title, message, links to `/` and `/projects`), linking the build's hashed CSS (the script reads the asset filename from `dist/index.html`) plus a small inline `<style>` for the `.not-found` layout using the site's CSS variables.
  - Registers the `meta` group in `src/i18n/index.ts`, `dict-types.ts`, `validate.ts` group lists; every manifest claims it (the page's own metadata is part of the page — the orphan-text rule then covers it).
- `nginx.conf` — real 404 for unknown URLs:
  ```nginx
  location / {
      try_files $uri/index.html $uri =404;
  }

  error_page 404 /404.html;
  ```
  Known routes hit their generated file → 200 at the exact URL. The first
  parameter is the composite file path: nginx's bare-directory semantics
  301 `/about` → `/about/`, which would break the audit's consistency
  requirement (canonicals, internal links and sitemap URLs are slashless);
  pointing at `/<route>/index.html` directly serves the exact URL with 200.
  Unknown URLs → genuine 404 + the localized 404 page. `error_page` is at
  server level so asset misses are answered with the same 404 page at a 404
  status. The two changes are coupled on purpose: the 404 correctness depends
  on the route files existing, so they ship in one step, and
  `generate-sitemap.ts` fails the build when a sitemap URL has no file.
- `src/App.tsx` — add `<Route path="*" element={<NotFoundPage />} />` (named export, lazy like the other non-LCP pages). Covers client-side navigation to a dead link and `pnpm preview`/dev-server parity (vite preview keeps its SPA fallback and answers 200 — the client page is what a visitor sees there).
- `src/pages/NotFoundPage.tsx` — new page: heading + message from `ui/common.notFound`, links to `/` and `/projects`, standard `InView` + item motion recipe.
- `scripts/generate-sitemap.ts` — `lastmod` per URL from the git history of the documents that back it: the script already knows each route's manifest claims, so lastmod = the newest commit date among the claimed structure/content/UI files (project detail pages: `projects.json` + both `content/projects.json` + both `ui/projects.json`). Fallback to the build date only if git is unavailable.

### 2.2 Affected files

|File|Change|
|---|---|
`scripts/generate-route-pages.ts`|new|
`package.json`|`generate:routes` script; `build` chain extended|
`src/i18n/locales/{en,vi}/ui/meta.json`|new group (9 static pages… 8 PageIds × {title, description})|
`src/i18n/locales/{en,vi}/ui/common.json`|+ `notFound` keys|
`src/i18n/index.ts`, `dict-types.ts`, `validate.ts`|register the `meta` group|
`src/data/pages/*.json`|claim `meta`|
`nginx.conf:12-14`|`try_files … =404` + `error_page 404 /404.html`|
`src/App.tsx`|lazy import + catch-all route|
`src/pages/NotFoundPage.tsx`|new|
`scripts/generate-sitemap.ts:26`|git-derived lastmod|

### 2.3 Acceptance criteria (audit 4.1 + 4.2)

- [x] Each generated page's initial HTML contains its own title, description, og/twitter values and a self-referencing canonical; the homepage is no longer the canonical of any inner page. (Verified from `dist/about/index.html` and `dist/projects/iot-dws-integration/index.html`.)
- [x] `GET /seo-audit-not-found-20261029` → HTTP 404 with the 404 page body; all nine existing URLs still return 200 on direct navigation and refresh. (Verified against a live nginx 1.31 container serving `dist/` with the new config — every route 200 at the exact URL, no trailing-slash 301; unknown URL 404 + localized body.)
- [x] Sitemap URLs, canonicals and internal links are identical strings. (Same source: manifest routes + project ids; the `generate-sitemap.ts` route-file guard fails the build on any divergence.)
- [x] `pnpm build`, `pnpm validate:content`, `pnpm lint` green.

## 3. Stage 2 — security headers + compression (fixes 4.3, 4.6)

`nginx.conf` only; no application code.

### 3.1 Implementation details

- **Compression** (server level):
  ```nginx
  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml text/xml application/xml;
  gzip_min_length 1024;
  gzip_vary on;
  gzip_comp_level 6;
  ```
  The official nginx image carries no brotli module — Brotli would mean a custom image; gzip is the boring choice. The hashed-asset block keeps its `immutable` caching untouched (audit §4.6 requires preserving it).
- **Security headers.** nginx gotcha: `add_header` does not inherit into a block that declares its own `add_header` — `location = /index.html` and the asset block already set `Cache-Control`, so the header set must be written into every block that serves site responses (`location /`, `location = /index.html`, the asset regex). Kept in one file because the deploy pipeline rsyncs `nginx.conf` alone.
  - `Strict-Transport-Security: max-age=31536000` — no `includeSubDomains` (subdomain readiness unverified).
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=()` — the site uses none of them.
  - `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` (the pair the audit asks for).
  - **CSP, Report-Only first** (audit's own instruction):
    ```
    Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'sha256-<hash>';
      style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';
      base-uri 'self'; form-action 'self'
    ```
    `'unsafe-inline'` in `style-src` is required — motion writes inline style attributes. `script-src` needs the exact SHA-256 of the theme-init inline script in `index.html` (the hash is computed once and recorded in the config comment; **coupling: editing that script requires recomputing the hash**). No external origins exist today (no analytics, no embeds); the resume PDFs and QR/media assets are same-origin. Owner verifies the report-only console output in a real browser, then the header name drops `-Report-Only`.
- Config validation before touch already exists: `deploy-infra.yml` runs `nginx -t` with placeholders, then force-recreates and health-probes.

### 3.2 Affected files

`nginx.conf` only. `docs/design/specs/v4/spec-v4-deploy-infra.md` gets a pointer note if the header block is documented there.

### 3.3 Acceptance criteria (audit 4.3 + 4.6)

- [x] `curl -I` on a page, an asset and an error response shows the full header set; JS/CSS transfer compressed (`Content-Encoding: gzip`) when `Accept-Encoding` allows; HTML unchanged. (Verified against the live nginx 1.31 container: all six headers on `/about` and on a 404 response; gzip on JS/CSS only for accepting clients, none for a plain client.)
- [ ] Public pages, edit mode (auth probe iframe, Contents API proxy), resume dialog/PDF downloads and the video page work with CSP enforced. (Report-Only is live; enforcement is the owner's console observation — D5.)
- [x] No regression in the hashed-asset cache headers. (`immutable` caching preserved; verified on the served asset.)
- [x] `nginx -t` green with placeholder values, as `deploy-infra.yml` runs it before touch. (Verified in an nginx 1.31-alpine container 2026-10-29.)

## 4. Stage 3 — headings, diagram rendering, og:image (fixes 4.7)

### 4.1 Implementation details

- **Page H1s:** `SectionHeading` gains `level?: 'h1' | 'h2'` (default `'h2'` — current behaviour unchanged). Each standalone page passes `level="h1"` to its top heading; inner headings and the homepage keep `h2`. `App.css` `.section-heading` selectors audited and mirrored for the new level.
- **Project detail hierarchy:** `ProjectDetailPage.tsx` — the four `h3` block headings (`impact`, `role`, `technologies`, `experiments`) become `h2`; section-title `EditableText as="h4"` becomes `as="h3"`. Matching selectors in `App.css` updated. `ResumeDialog` heading stays as is (dialog internals are not part of the document outline).
- **Diagram sections:**
  - `ProjectDetailPage.tsx`: `section.type === 'diagram'` renders the content in a `<pre className="project-diagram">` (monospace, `overflow-x: auto` for mobile); in edit mode `EditableText as="pre"`. `text` sections unchanged.
  - `src/i18n/locales/vi/content/projects.json:24,:54`: strip the ```` ```text ````/```` ``` ```` fences — the fences are Markdown syntax for a renderer that does not exist here; the diagram text itself stays. EN keeps falling back to VI (unchanged behaviour).
  - `ProjectDetailPage.tsx:184`: the `<Tag accent>{section.type}</Tag>` chip renders **only in edit mode** — it is an internal label, not public content.
  - `RecordSettings` project-section type picker: confirm it offers `diagram` (the structure document already uses it); the generator (`generate-content-types.ts`) derives category values only, section types are free strings in the structure doc — validator unaffected.
- **og:image:** `index.html:28-29` — declare the real `500`×`667`. Optional Decision D3 (§6): generate a real 1200×630 share card.

### 4.2 Affected files

|File|Change|
|---|---|
`src/components/ui/SectionHeading.tsx`|`level` prop|
`src/pages/{AboutPage,ExperiencePage,ProjectsListPage,ContactPage,PhilosophyPage,HowItWorksPage}.tsx`|top heading `level="h1"`|
`src/pages/ProjectDetailPage.tsx:105,125,137,152,179,183-184`|h2/h3 hierarchy, `<pre>` diagram branch, edit-only type tag|
`src/i18n/locales/vi/content/projects.json:24,:54`|strip fences|
`src/App.css`|`.section-heading h1` variants, `.project-diagram`, project-detail selector renames|

### 4.3 Acceptance criteria (audit 4.7)

- [x] Every page has exactly one H1; no level skips (H1→H2→H3) on any page. (Implemented: SectionHeading `level="h1"` on the six standalone pages + the in-app 404 pages; project detail H1 → H2 blocks → H3 section titles; homepage unchanged. Visual walkthrough — owner.)
- [x] IoT-DWS architecture/pipeline diagrams render as formatted monospace blocks in both languages; no ```` ``` ```` visible; no `text`/`diagram` chips in view mode (present in edit mode). (Fences removed; `<pre class="project-diagram">` branch implemented; the type tag renders only in edit mode. Browser confirmation — owner.)
- [x] Declared og:image dimensions equal the actual file dimensions. (`index.html` now declares 500×667, the verified size of `public/profile-photo.webp`.)

## 5. Stage 4 — language versions for search (fixes 4.5) — decision, not yet design

The audit itself permits deprioritizing this. Two coherent options:

**Option A — language stays out of URLs (current model).** VI remains a visitor convenience; crawlers see the EN shells. No hreflang (it would be meaningless without distinct URLs). Zero work.

**Option B — `/vi/` prefix.** Real bilingual indexing:
- `useLanguage` derives the language from the path prefix (`/vi/...`) instead of localStorage alone; the switcher navigates to the same path with the prefix swapped (fixes "always to the homepage").
- The Stage 1 generator emits both language shells per route (`<html lang="vi">`, localized meta, self-canonical per language, `og:locale` per language) and reciprocal `hreflang` pairs + `x-default`.
- Sitemap lists both sets with hreflang; `navPaths`/`MobileMenu`/`Footer` link builders gain the prefix; edit mode is unaffected (it previews the branch's JSON, language is a render concern).
- Cost: a routing change touching every link surface + the generator; the manifests/PageIds stay identical.

Recommendation: adopt the Stage 1–3 work regardless; decide B only if VI search visibility is an actual goal.

## 6. Open decisions (owner review required before implementation)

|ID|Decision|Options|Recommended|
|---|---|---|---|
|D1|Approve Stage 1–3 as the implementation scope|Stage 1 only / 1–2 / 1–3 / 1–4|1–3|
|D2|Initial-HTML content depth (audit 4.4)|a) head shells only — fixes 4.1, not 4.4; b) shells + manifest-generated `<noscript>` body — satisfies the audit criterion with zero hydration risk; c) full `react-dom/server` prerender + `hydrateRoot` — best for no-JS users but needs SSR-safe providers (localStorage reads in `useLanguage`/`useTheme`/`edit-session` need guarded defaults) and carries hydration-mismatch risk|b|
|D3|Open Graph share image|a) declare the real 500×667 only; b) additionally generate a 1200×630 share card via a small Playwright script (dependency already exists) → `public/share-card.png`, og/twitter point at it, test previews incl. Zalo|a now, b as follow-up if link sharing matters|
|D4|Language URLs (§5)|A — keep localStorage model (audit-permitted deprioritization) / B — `/vi/` prefix + hreflang|A unless VI search visibility is a goal|
|D5|CSP rollout|Report-Only first, then enforce after owner console check (audit's instruction)|Report-Only first|

## 7. Out of repository scope (owner-side, from audit §5)

- Google Search Console verification, sitemap submission, URL Inspection after deploy.
- Certificate renewal monitoring.
- Device visual testing, keyboard/screen-reader walkthrough, contrast across palettes.
- Editor API auth review beyond the single HEAD probe; login-attempt limits and failed-auth logging (rate limiting on the server, not in this config today).
- CSRF: low risk as designed — auth is an `Authorization` header at the proxy, not cookie-based; recorded so it is not mistaken for an open finding.
- Copy review EN/VI and case-study structure (content decisions, JSON edits when decided).

## 8. Progress tracking

|Stage|Status|
|---|---|
§1 audit verification|DONE 2026-10-29 (all findings reproduced against the repo)|
Stage 1 — route pages + 404|DONE 2026-10-29 — `scripts/generate-route-pages.ts` in the build chain; 9 route files + 404.html; nginx end-to-end verified in a 1.31 container; in-app catch-all route|
Stage 2 — headers + gzip|DONE 2026-10-29 (repo side) — `nginx -t` green; headers + gzip verified on a live container; CSP is Report-Only: enforcement after the owner's console observation (D5)|
Stage 3 — headings + diagrams + og|DONE 2026-10-29 (repo side) — hierarchy, `<pre>` diagram branch, fences removed, edit-only type tag, og 500×667; browser confirmation owner-side|
Stage 4 — language URLs|NOT PLANNED without an owner decision (D4)|
Post-deploy re-audit|TODO (owner deploys and re-runs the audit checks; acceptance criteria above are directly measurable)|

## 9. Known limits

- Stage 1's real-404 routing depends on the generated route files: a build that skips `generate:routes` would 404 every SPA route. The `build` script chains them together; a missing step is a loud deploy failure, not a silent soft-404.
- The CSP `script-src` hash is coupled to the exact bytes of the theme-init script in `index.html`; the coupling is commented at the header.
- `<noscript>` text (D2b) is a crawler/no-JS affordance; real users still see the app paint after JS. Full prerender (D2c) is the only option that shows content pre-hydration and is scoped separately.
- EN fallback means the IoT-DWS diagram text stays English in both languages until VI section text is authored — a content task, not a code task (matches the existing fallback convention, AGENTS.md gotcha 5).
- The audit's §3 positives (caching, auth 401, UTM canonical, noopener) are already repo behaviour; nothing in this spec changes them.
