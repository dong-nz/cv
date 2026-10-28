# Intro video — `video/`

Standalone [Remotion](https://remotion.dev) project that renders the
`/how-it-works` explainer. It is a pnpm workspace member but the SPA never
imports it; its only output is the committed media in `public/media/`.
Spec: `docs/design/specs/v7/spec-v7-intro-video.md`.

## Render

```sh
pnpm --dir video render        # → public/media/how-it-works.mp4 (captions burned in, no footage needed)
pnpm --dir video poster        # → public/media/how-it-works-poster.jpg (title-card frame)
pnpm --dir video studio        # interactive preview while tuning timings
```

## Captured variant (screen footage)

The composition has a `captured` input prop. With `--propsFile=captured.json`
the two animated mock-browser stages (scenes 02 and 04) are replaced by real
screen recordings — the intended final polish, recorded with Screenity or any
screen recorder:

| File (drop into `video/inputs/`) | Beat | Minimum length |
|---|---|---|
| `take-edit.mp4` | open the live site → append `?edit` → Basic-auth sign-in → edit one heading inline → Save | 24 s |
| `take-pipeline.mp4` | GitHub Actions run: build → generate-resume → deploy, then the updated live page | 17 s |

Record at 1920×1080, browser zoom 100%, dark theme. Trim so each take starts
clean (no cursor scrubbing). Then:

```sh
pnpm --dir video render-captured
```

Raw takes are gitignored — the rendered MP4 is the committed artifact.

## Timeline (source of truth: `src/timeline.ts`)

30 fps · 2425 frames · 81 s. Scene durations include ≥5 s of hold time after
the last callout so every on-screen explanation is readable before the cut.
Scene boundaries drive the chapter list and the `.vtt` caption tracks in
`public/media/` — if the timeline changes, those and the `howItWorks` UI
group's chapters (EN + VI) must change with it.
