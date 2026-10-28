# Spec v7 — Intro video & `/how-it-works` page

Status: **implemented 2026-10-28** — repo side complete (video rendered, page integrated, checks green); owner-side open items: browser walkthrough (per project rules the owner verifies in a real browser) and the optional captured-footage variant (§6).

## 1. Goal

A short introduction video that shows how this portfolio works — with emphasis on the two differentiators: **git as the content storage behind live editing** and **automatic deployment through GitHub Actions** — shown on a dedicated `/how-it-works` page.

Decisions (owner-approved 2026-10-28):

|Decision|Choice|
|---|---|
|Production|Remotion hybrid — Remotion-authored diagram/title scenes; real screen footage as an optional `captured` variant|
|Placement|Dedicated `/how-it-works` page (route + manifest + nav entry), not a homepage section|
|Audio|Captions only — burned-in on-screen text + EN/VI `.vtt` tracks; no voiceover|

## 2. The video

`video/` is a standalone pnpm workspace member (Remotion 4 + React 19 + zod 4). The SPA never imports it; its only output is the committed media in `public/media/`.

- 1920×1080 @ 30 fps, 1860 frames = **62 s**, H.264 CRF 23 → 1.5 MB, `+faststart` via Remotion defaults.
- Visual language mirrors the site's dark palette (`src/index.css` `:root` values copied into `video/src/theme.ts` — the project cannot import site CSS).
- Timeline source of truth: `video/src/timeline.ts` (`SCENES`). The chapter list in the `howItWorks` UI group and both `.vtt` tracks mirror these boundaries; changing the timeline means updating all four.

|Scene|Frames|Seconds|Content|
|---|---|---|---|
|Title|0–165|0–5.5|"This site's CMS is a git repository."|
|DataLayer|165–420|5.5–14|Structure documents + per-language dictionaries + manifests → joined once at build time → bilingual rendered page|
|LiveEdit|420–960|14–32|`?edit` typed into the URL → Basic-auth dialog → inline heading edit → save bar: PUT contents/projects.json, commit on branch, 409 → three-way rebase|
|GitStorage|960–1290|32–43|Repository file tree with the edited JSON highlighted, commit diff card, master/preview-branch graph, `?edit=preview`, merge = publish|
|Pipeline|1290–1650|43–55|push → master → build · resume · deploy job cards lighting in sequence, infra guard card (deploy-infra.yml), updated live page|
|Outro|1650–1860|55–62|"Edit on the live site. Stored in git. Live on merge to master."|

**Scene composition** (reviewed 2026-10-28 from rendered stills; the first render hugged every diagram to the right edge): each scene's visual group is centered on x=960 inside a strict band — title row y 80–175 (left), visual band y ~200–760 (centered), bullet row y 790+ (left). The four groups span x 420–1500 (DataLayer), 580–1340 (LiveEdit stage), 480–1410 (GitStorage), 465–1455 (Pipeline). Same review fixed: absolute stage anchors in LiveEdit wrapped by a positioned div, never by `Fade` (Fade's `transform` becomes the containing block and anchors them after the skeleton); repository tree rows at 14px so no line wraps or overflows the panel; the "merge = publish" badge moved clear of the merge curve; the infra card widened to 440px.

## 3. Render commands

```sh
pnpm --dir video render        # public/media/how-it-works.mp4
pnpm --dir video poster        # public/media/how-it-works-poster.jpg (title-card frame)
pnpm --dir video studio        # interactive preview
pnpm --dir video render-captured  # with video/inputs/take-*.mp4 present (§6)
```

`pnpm-workspace.yaml` gained `packages: [video]` so `pnpm install` inside `video/` resolves against this lockfile instead of walking up and ignoring the member. CI install behavior is unchanged (the deploy jobs install the workspace root's own dependencies; `video/` adds only dev-time weight locally).

## 4. Page and data plumbing

- Route `/how-it-works`, lazy like the other non-LCP pages (`App.tsx`), page `src/pages/HowItWorksPage.tsx` (named export, default-mapped factory).
- Manifest `src/data/pages/how-it-works.json`: claims `profile.name` (the footer renders it on every route) and owns the `howItWorks` UI group. Added to `pages.ts`, `MANIFEST_IDS` (validate.ts), `PageId`/`ManifestId` (types).
- UI group 15: `howItWorks` — `heading`, `intro`, `videoAria`, `stepsTitle`, `steps[3]`, `chaptersTitle`, `chapters[6]` — in `src/i18n/locales/{vi,en}/ui/how-it-works.json`; registered in `i18n/index.ts` and `dict-types.ts` (`typeof` the VI file).
- Nav: `/how-it-works` appended to `navPaths`; label key `how-it-works` in both `navigation.json` files. Sitemap picks the route up automatically from `navPaths`.
- Bar width: seven links now share the bar above 1024px; `@media (max-width: 1240px)` drops the link gap 32→22px so the row never overflows near the breakpoint edge. Below 1024px the sheet owns navigation as before.
- Player: `<video controls playsInline preload="none" poster>` + `<track kind="captions">` chosen by the active language (`useLanguage().lang`); chapter chips seek the player. `preload="none"` keeps the video out of the page's LCP path — only the 16:9 box and poster paint with the page.
- CSS: `.how-it-works-video`, `.how-it-works-grid` (3→2→1 columns like the other card grids), `.how-it-works-card`, `.chapter-chip` in `src/App.css`; card text follows the typography tokens (`--text-meta` body, chrome-only 13px mono time).
- `.gitignore`: `video/inputs/*.mp4` — raw Screenity takes are local; the rendered MP4 is the committed artifact.

## 5. Acceptance criteria

- [x] `pnpm build` green: `tsc -b`, vite (HowItWorksPage is its own 2.08 kB chunk), sitemap 9 URLs including `/how-it-works`
- [x] `pnpm validate:content` green (manifest rules cover the new manifest and group)
- [x] `pnpm lint` adds no new warnings (video project type-checks with its own tsconfig and lints clean)
- [x] `pnpm --dir video render` produces `public/media/how-it-works.mp4` (1.5 MB) + poster; poster frame visually verified
- [ ] Browser walkthrough — owner verifies in a real browser (project rule 5)

## 6. Captured variant (open, owner-side)

`video/captured.json` + `--propsFile` flips the LiveEdit and Pipeline stages from animated mocks to real screen recordings (`video/inputs/take-edit.mp4` ≥18 s, `take-pipeline.mp4` ≥12 s; recording instructions in `video/README.md`). The composition is complete; only the two takes are owner-supplied raw material. Re-render afterwards and commit the new MP4.

## 7. Known limits

- The MP4 (1.5 MB) is committed like the resume assets; it deploys with `dist/` through the existing pipeline — no pipeline change was needed.
- On-screen video text is English; the VI experience is the `.vtt` track. A fully VI-typed video would mean a second composition or a language prop — not built.
