# Specification — v4 Data Organization (per-entity content, per-page manifests, per-group UI)

Status: **Design agreed 2026-10-23; implementation TODO.** Follow-up to `spec-v4-live-edit.md`; does not change its D1–D10 decisions, only the physical document layout and the edit-mode document registry.

## 1. Decisions from the 2026-10-23 discussion

| # | Decision | Rationale |
|---|---|---|
| D1 | Content text is managed **per entity**, one file per entity per language | Structure documents are already per entity; the text document mirrors its structure document 1:1. Join, validation, and commits become per-pair. |
| D2 | Page data is managed **per page** as a **manifest of references**, not as copied text | Entities legitimately span pages (bio on home + `/about`, experiences on home + `/experience`, projects on three pages). Copying per page re-creates the duplicated-fact problem the row 18–19 cutover just removed. The manifest answers "where does this page's data come from" without duplication. |
| D3 | UI chrome is one file per **feature-group**, not per React component file | Strings shared by sibling components (nav chrome by Navigation + MobileMenu + ThemePaletteMenu + ResumeNavButton; social by Footer + Contact) would duplicate or cross-import under a strict per-component split. A feature-group is "the component plus its variants". |
| D4 | Manifests are **field-level** | The stated goal is provenance per page; entity-level would not say which field renders where. Field-level is also what powers EditBar page grouping (§6.3). |
| D5 | Spec first, implementation in a later pass | This file is the contract; implementation order and acceptance criteria are §7–§8. |

Non-goals:

- Pages do **not** render from manifests. Section layouts are bespoke (hero ≠ timeline ≠ grid); a generic renderer driven by manifests would rewrite all seven pages and lose their design. The manifest is a provenance index and an edit-mode grouping source, not render config.
- No content is duplicated across documents. `CONTENT` and `UI` as consumed by components keep byte-identical shapes; components do not change.

## 2. Target tree

```
src/data/                              # structure, language-neutral (unchanged files)
  profile.json  skills.json  experience.json  projects.json
  pages/                             # NEW: per-page manifests, language-neutral
    home.json  about.json  experience.json  projects.json
    project-detail.json  contact.json  philosophy.json
    resume.json                    # synthetic consumer manifest (no route) — see §5
  pages.ts                           # NEW: loader + PageId typing

src/i18n/locales/vi/
  content/                           # text per entity (replaces content.json)
    profile.json  skills.json  experience.json  projects.json
  ui/                                # chrome per feature-group (replaces ui.json)
    navigation.json  footer.json  social.json  hero.json  about.json
    expertise.json  experience.json  projects.json project-detail.json
    contact.json  philosophy.json  resume.json  common.json edit.json
src/i18n/locales/en/                 # mirror (partial overrides, unchanged semantics)
```

`src/i18n/index.ts` merges every file into the same `CONTENT` / `UI` records it exports today. `dict-types.ts` keeps the document types; each file is validated against its slice type at load, exactly as the current whole-document check. The existing fallback rule (missing EN field → VI value; arrays atomic) is unchanged and now operates per entity file.

## 3. Content split per entity

- `content.json` → four files per language under `locales/<lang>/content/`. Entity id ↔ file ↔ resolved record:

| Entity id (manifest, draft paths) | Structure doc | Text docs | Resolved record |
|---|---|---|---|
| `profile` | `src/data/profile.json` | `content/profile.json` | `c.profile` |
| `skillGroups` | `src/data/skills.json` | `content/skills.json` | `c.skillGroups` |
| `experiences` | `src/data/experience.json` | `content/experience.json` | `c.experiences` |
| `projects` | `src/data/projects.json` | `content/projects.json` | `c.projects` |

- Cross-document validation rules (§3.6 of the live-edit spec) are unchanged in substance; they now run per pair — orphan/missing keys, HTML-in-text, id unions — with a smaller blast radius per rule.
- DraftStore baselines become per file. A save already PUTs one commit per touched document; after the split, touching bio and a project summary produces two commits (`profile.json`, `projects.json`) instead of one fat `content.json` commit. Conflict detection and three-way rebase are per-document and already independent — no semantics change, finer granularity.

## 4. UI feature-groups

The current `ui.json` namespaces map 1:1 onto groups; the split is mechanical. Ownership:

| File (per language) | Namespace today | Owned by (feature-group) |
|---|---|---|
| `ui/navigation.json` | `nav` | Navigation, MobileMenu, ThemePaletteMenu, ResumeNavButton |
| `ui/footer.json` | `footer` | Footer |
| `ui/social.json` | `social` | SocialLinks (footer + contact surfaces) |
| `ui/hero.json` | `hero` | Hero (HeroParticles carries no copy) |
| `ui/about.json` | `about` | About section + AboutPage |
| `ui/expertise.json` | `expertise` | Expertise |
| `ui/experience.json` | `experience` | Experience section + ExperiencePage |
| `ui/projects.json` | `projects` | Projects section + ProjectsListPage |
| `ui/project-detail.json` | `projectDetail` | ProjectDetailPage |
| `ui/contact.json` | `contact` | Contact section + ContactPage |
| `ui/philosophy.json` | `philosophy` | PhilosophyPage |
| `ui/resume.json` | `resume` | resume PDF labels (consumed by `scripts/generate-resume.ts`) |
| `ui/common.json` | `common` | cross-cutting atoms: `backToTop`, `contactTag`, `experienceTag`, `resumeDownload`, resume-modal strings (BackToTop, tags, DownloadResume, ResumeDialog) |
| `ui/edit.json` | `edit` | EditBar, EditModeShell (incl. `edit.fields` labels; new inline-control labels per `spec-v4-inline-editing.md`) |

`ui.json` stays read-only in edit mode (v4 rule, unchanged). `generate-resume.ts` and every component keep consuming the merged `UI` — zero call-site changes.

## 5. Page manifests

`src/data/pages/<page>.json`, one per route, plus a synthetic `resume.json` consumer manifest (id `resume`, no route — the resume PDF is a real consumer of content text and would otherwise be the orphan-rule's blind spot). Schema:

```json
{
  "id": "about",
  "route": "/about",
  "content": [
    { "entity": "profile", "fields": ["name", "bio", "subtitle", "currentInterests", "philosophy"] },
    { "entity": "skillGroups", "fields": ["*"] }
  ],
  "ui": ["about"]
}
```

- `entity` uses the §3 entity ids; `fields` are paths into the joined text/structure records; `"*"` claims the whole entity.
- `ui` lists **page-owned** groups only. Component-owned groups (`navigation`, `footer`, `social`, `common`, `resume`, `edit`) are owned by the component side and provenance for them is the component mapping in §4 — they are not repeated in every manifest.
- Manifests are language-neutral (which data a page shows is not a translation fact). They are structure-side data: part of validation, committed like structure documents, **read-only in the app** (`spec-v4-inline-editing.md` §3) — edited as repo files by the developer.

Initial content mapping — derived from the code scan of every consumer (2026-10-23), to be re-derived exactly at implementation:

| Page | profile | skillGroups | experiences | projects |
|---|---|---|---|---|
| `home` | `name`, `tagline`, `roles`, `bio`, `currentInterests`, `philosophy`, `tldr`, links (`email`, handles) | `*` (Expertise) | `*` (timeline) | featured subset: `title`, `summary`, `metrics` |
| `about` | `name`, `bio`, `subtitle`, `currentInterests`, `philosophy` | `*` | — | — |
| `experience` | `tldr` | — | `*` | — |
| `projects` | — | — | — | `*`: `title`, `summary`, `metrics` |
| `project-detail` | — | — | — | per-id: `title`, `summary`, `role`, `metrics`, `sections.*` |
| `contact` | links (`email`, handles) | — | — | — |
| `philosophy` | `philosophyQuotes` | — | — | — |
| `resume` (synthetic) | `name`, `title`, `bio`, `email`, links | `*` | `*` | `*` |

`home` does **not** claim `title` — the code scan shows Hero renders `name`/`roles`/`tagline` only; `title` is consumed by the resume generator, which the synthetic manifest now covers honestly.

### 5.1 Validation rules (added to `validate.ts`)

1. Manifest ids = the 7 route ids (`PageId` union, matching the router) + the synthetic `resume` consumer; no orphan or missing manifest.
2. Every `content[].entity` is a known entity; every field path resolves in the joined records (`"*"` always valid).
3. Every `ui` group name exists in the UI documents.
4. **No orphan fields:** every editable content text field must be claimed by at least one manifest. This makes drift mechanically caught in the dangerous direction — add a field to a text document without declaring which page shows it → `pnpm build` fails. The reverse drift (a manifest claims a field a page stopped rendering) is not mechanically detectable; it is caught by the review checklist "changing what a page renders includes updating its manifest".

## 6. Edit-pipeline consequences

6.1 **Document registry** (`draft.ts`): writable documents = 4 structure + 8 text. The 7 manifests and the 28 UI files are **read-only in the app** (manifests per `spec-v4-inline-editing.md` §3; UI per the v4 rule) — they are not draft baselines. Baselines, snapshots (sessionStorage `portfolio-draft`), path-diff, and rebase key off the writable registry — same code, data-driven list instead of a hardcoded six.

6.2 **Save:** unchanged sequential-PUT pipeline; commit granularity per touched file. The Gitea repository must contain the new file layout before the proxy answers 200 (same dependency as live-edit row 11).

6.3 **EditBar:** the changed-path diff gains page grouping — each changed path is annotated with the pages whose manifest claims it ("appears on: /about, home"). Grouping is computed from the manifests, not from component code.

Grouping includes the synthetic `resume` manifest ("appears on: resume PDF").

6.4 **JsonPanel:** SUPERSEDED 2026-10-23 by `spec-v4-inline-editing.md` (E1) — the panel is deleted; structural editing moves to on-page controls. Manifests are read-only in the app (developer documents; the orphan-field validation rule is the enforcement). EditBar page grouping (6.3) stands.

6.5 **Unchanged:** nginx `/api/content/` proxy and `vite.config.ts` (paths are already data-driven), the auth/session flow, branch targeting (D10), `scripts/smoke-draft.ts` (fixtures follow the new registry), `generate-resume.ts`, `generate-sitemap.ts`.

## 7. Implementation order

Order decided 2026-10-23: this spec lands **after** `spec-v4-inline-editing.md` — the panel is deleted against the current 6-document layout first, so grouped panel tabs are never built for a panel that is about to die.

1. Split `content.{vi,en}.json` → `content/{entity}.json`; loader merge; per-pair validation. Gate: merged `CONTENT` output byte-identical to pre-split (automated diff before/after).
2. Split `ui.{vi,en}.json` → `ui/{group}.json`; loader merge. Gate: merged `UI` byte-identical.
3. Add `src/data/pages/*.json` + `pages.ts` + `PageId`/manifest types + validator rules 1–4.
4. `draft.ts` registry, snapshot keys, `smoke-draft.ts` fixtures.
5. ~~JsonPanel grouped tabs~~ → inline editing controls per `spec-v4-inline-editing.md` §5; EditBar page annotations stay in scope.
6. Docs: AGENTS.md Data Layer + Component Structure, live-edit spec §12 follow-up row.

## 8. Acceptance criteria

- [ ] Merged `CONTENT` and `UI` byte-identical before/after the split (automated comparison script, throwaway).
- [ ] `pnpm build`, `pnpm validate:content`, `pnpm lint` (no new warnings), `pnpm build:resume-all` pass.
- [ ] `pnpm tsx scripts/smoke-draft.ts` passes against the new registry.
- [ ] Validator rejects: unknown entity, unresolvable field path, orphan content field, unknown ui group, missing manifest.
- [ ] Edit mode end-to-end (browser): edit one bio line + one project summary → EditBar shows two documents with page annotations → save produces two per-file commits on the target branch.
- [ ] Browser walkthrough unchanged for visitors: all 7 routes, both languages, identical rendering.

## 9. Progress Tracking

| # | Task | Status |
|---|---|---|
| 0 | Design agreed (D1–D5) | ✅ Done 2026-10-23 |
| 1–6 | Implementation steps §7 | ⬜ TODO |
| — | Acceptance §8 | ⬜ TODO |
