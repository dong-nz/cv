# Specification — v4 Inline Editing (edit everything on the page; no JSON panel)

Status: **Design agreed 2026-10-23; implemented 2026-10-23** (see §7). The remaining gate is the owner's browser walkthrough of §6. Supersedes the JSON-panel parts of `spec-v4-live-edit.md` §5.1 ("Structural editing") and `spec-v4-data-organization.md` §6.4. The save pipeline (§5.4/§6 of live-edit), DraftStore semantics, conflict handling, branch targeting (D10), and the EditBar all stay as specified. Order decided 2026-10-23: this spec lands **before** `spec-v4-data-organization.md` — both have now landed, in that order.

## 1. Decisions

| # | Decision | Rationale |
|---|---|---|
| E1 | **No JSON editing in the app.** `JsonPanel.tsx` is deleted; every editable thing gets an affordance on the page where it renders. | Owner requirement. The panel was a workaround for data types without a natural UI control; this spec builds those controls instead. |
| E2 | Rare structural fields (`featured`, `variant`, `logo`) are edited in a **per-record settings popover** — form controls (toggle, select, text input), never JSON text. | These fields have no inline text to wrap; a small form attached to the record is the minimal honest control. |
| E3 | Record ids are **generated from the title slug and never editable** in the UI. | Ids are published in URLs and in the `src/types/index.ts` id unions; renaming them is rare and breaks external links. Slug generation: lowercase, ASCII-folded (diacritics stripped), non-alphanumeric → `-`, collision → `-2`, `-3`… The existing union-append pipeline in `draft.ts` continues to run after a document lands. |
| E4 | Social links: documents store **handles only**; all three profile URLs are derived in the loader (`profile.ts`): `github.com/{githubHandle}`, `linkedin.com/in/{linkedinHandle}`, `t.me/{telegramHandle}`. Editing happens on the contact card itself. | `profile.json` today holds `githubUrl` + `githubHandle` — two sources for one fact; the current `telegramUrl` literal is exactly `https://t.me/dongdn`, so deriving it loses nothing. The resolved record (`c.profile.githubUrl` …) keeps the same shape, so every consumer (Contact cards, Footer, resume generator, `social.ts`) is unchanged. |
| E5 | Reorder ships in this pass: **↑/↓ controls** on tag chips and on records (timeline entries, project cards, skill groups, philosophy points, project sections). | Removing the panel would otherwise leave no reorder path at all. Array order remains the display order; the move mutates the owning document (structure for `technologies`/record order, text for `metrics`/`interests`/`roles`/`keywords`). |
| E6 | Editing is triggered **only by the small icon**, never by clicking the text. | Text stays selectable and copyable; no accidental edit mode. |
| E7 | Every edit control shows the **field's storage location** on demand: tooltip on the pencil (`document → pointer`), and a monospace chip on the active editor (`locales/vi/content.json → profile.bio`); clicking the chip copies the full repo path + pointer to the clipboard. | The owner learns which field each text lives in, so a path seen in the app is exactly what to open in the editor/Gitea or search for in an EditBar diff. The info already exists in the draft registry (`documentId`, `path`) — this only renders it. |

## 2. Interaction model, by data type

### 2.1 Text fields (upgrade of `EditableText`)

- In edit mode each editable text renders inside a subtle wrapper zone (dashed 1px `--border` outline; hover/focus → `--accent`) with a pencil `<button>` at the zone's end corner, `aria-label` from `ui.edit.fields` (already complete). The glyph is 16px; the button's hit area is ≥28px at desktop and a 44px target on touch — same target-size discipline as the nav controls.
- Click the pencil → the element becomes the inline editor (input for single-line: titles, company, duration, role; auto-grow textarea for prose: bio, summary, section content, responsibilities item, quote). Clicking the text does nothing.
- Commit rules unchanged (live-edit §5.3): blur for multi-line (Vietnamese IME safe), Enter for single-line, Esc cancels, empty required values rejected at commit.
- Validation errors surface **inline**: red ring + message under the field. No panel status line.
- Mobile: the pencil is always visible in edit mode (low opacity), because hover does not exist.

### 2.2 Tag arrays — `technologies`, `metrics`, `currentInterests`, `roles`, `keywords`, tagline segments

Each chip is an edit unit: pencil per chip (inline text edit), `×` on hover to delete, a ghost `+` chip at the list end to add, ↑/↓ to move. Tagline segments additionally carry an emphasis toggle button (`emphasis: true` renders the bold/italic treatment Hero already applies). Empty tags are rejected at commit; tag add never requires a dialog.

### 2.3 Collections — add and delete records

- Add: a ghost affordance at the end of each collection, on the page where the collection renders — "＋ Dự án mới" (end of the projects grid), "＋ Kinh nghiệm mới" (end of the timeline), "＋ Nhóm kỹ năng mới" (expertise grid), "＋ Luận điểm mới" on /about + the home About section (where philosophy cards actually render), "＋ Đoạn mới" on /philosophy (appends to the fixed `profile.philosophyQuotes` array — a title + paragraphs, not a philosophy card), "＋ Section" in project detail with a mini type picker (text / diagram / metrics / code). Creation runs the existing `draft.ts` templates (structure + both text documents in one validated step; quotes need no structure leg); the new record appears in the live preview immediately.
- Delete: trash icon on the card/entry, confirm-gated, using the existing orphan-free delete (structure + text documents in one step).
- ids per E3 — project section ids included, slugged from the section title at creation.

### 2.4 Record settings popover (E2)

Gear icon on cards/entries opens a small popover anchored to the record:
- project card: `featured` toggle, `category` select (added 2026-10-24: the options are the label map of `ui/projects.json`, i.e. the vocabulary rule 7 checks a project against — a category with no label in both languages cannot be chosen, and a brand-new one needs its labels added in the repository first, since UI documents stay read-only in v4), sections list (type picker, move, delete — add lives inline at §2.3);
- timeline entry: `variant` select (none / current / gap), `logo` path text input;
- nothing else needs a popover — every other field has an inline home.

The popover edits the draft through the same validated path as inline text; invalid values never reach the preview.

### 2.5 Social links (E4)

Contact cards (home + /contact) show handle text as editable (pencil per §2.1 rules) and the URL as derived, read-only. `profile.json` keeps `githubHandle`, `linkedinHandle`, `telegramHandle`, `email`; `githubUrl`/`linkedinUrl`/`telegramUrl` are produced by `profile.ts` from the handles. `email` stays a plain editable field.

### 2.6 Reorder (E5)

↑/↓ buttons appear beside the pencil on chips and on record cards/entries in edit mode. Up/down swap the array element in the owning document; first/last disable the respective button. Semantics identical to a JSON array move.

### 2.7 Field provenance (E7)

Every edit control knows its storage location — `draft.ts` keys every accepted edit by `(documentId, path)`. E7 renders it:

- **Before editing**: the pencil's `title` (and `aria-describedby` tooltip) shows `<document> → <pointer>`, the document named by its real repo path in short form: `locales/vi/content.json → profile.bio`, `data/projects.json → iot-dws-integration.featured` (structure documents carry no language suffix — they are language-neutral).
- **While editing**: a monospace chip (12–14px chrome size per the typography rules) attached to the editor's top edge shows the same `document → pointer`. Clicking the chip copies the full repo path plus pointer (`src/i18n/locales/vi/content.json` + `profile.bio`) to the clipboard, with a brief "copied" confirmation.
- **Where it appears**: the active text editor (§2.1), every tag chip incl. its array index (`locales/vi/content.json → profile.currentInterests[3]` — the index also teaches that array order is display order), every settings-popover control next to its label, and inline validation errors (the same descriptor the `validate:content` CLI prints, so app errors and CLI errors name the same location).
- **Layout-agnostic**: the descriptor is computed from the draft document registry (document id → repo path). When `spec-v4-data-organization.md` lands, the same code renders `locales/vi/content/profile.json → bio` with no change here.
- The language shown is the document of the language being edited — editing the VI page writes `locales/vi/content.json`, the EN page writes `locales/en/content.json`. After `spec-v4-data-organization.md` lands these become `locales/vi/content/profile.json` etc. automatically (line 61).

Implementation: a `describeField(documentId, path)` helper in `draft.ts` (registry lookup + JSON-pointer formatting) consumed by `EditableText`, `TagListEditor`, `RecordSettings`, and the move controls. No new state, no new validation.

## 3. EditBar, save, conflicts — unchanged

The EditBar keeps its role: per-path diff with revert, conflict resolution, per-document save status, resume-after-partial-failure, exit confirm. With E1 the panel disappears from it (`openPanel`/`closePanel` labels drop from `ui.edit`); **hand-merge becomes per-field**: on a 412 conflict the EditBar lists the conflicting paths, each showing the working value beside the remote value with a keep-mine / keep-theirs choice per field — finer granularity than the document-level JSON merge it replaces, and raw JSON never appears. Save remains sequential-PUT per touched document. The cross-document validator still runs on every accepted edit and before save — its feedback now arrives inline at the field (and in the EditBar as a blocked-save reason), never as a JSON status line.

Page manifests (`spec-v4-data-organization.md` §5) are **read-only in the app**: they are developer documents; the orphan-field validation rule is the enforcement. Wildcard claims (`"*"`, `sections.*`) mean adding records or sections never requires a manifest edit.

## 4. Component inventory

| Work | Component | Nature |
|---|---|---|
| Upgrade | `EditableText.tsx` | wrapper zone + pencil trigger (icon-only editing), inline error display, provenance tooltip + chip (E7) |
| New | `TagListEditor.tsx` | per-chip edit/delete/move + ghost add; emphasis toggle for tagline |
| New | `RecordSettings.tsx` | popover form: featured, variant, logo, section list — plus the project `category` select (follow-up 11) |
| New | `AddRecord.tsx` | ghost affordance + template trigger + (sections) type picker |
| New | move controls | ↑/↓ buttons shared by `TagListEditor` and record cards |
| Delete | `JsonPanel.tsx` | removed outright — no fallback drawer, no advanced mode |
| Keep + extend | `EditBar.tsx`, `edit-mode.ts`, validator | unchanged except panel references |
| Extend | `draft.ts` | id-slug helper (E3) + `describeField()` provenance helper (E7) |
| Data | `profile.json` + `profile.ts` | drop `githubUrl`/`linkedinUrl`/`telegramUrl`; derive all three in the loader |

`ui.edit` loses `panel`/`openPanel`/`closePanel`/`handMerge`; gains labels for the new controls (`addProject`, `addExperience`, `addSkillGroup`, `addPhilosophyPoint`, `addQuote`, `addSection`, `settings`, `moveUp`, `moveDown`, `remove`, `emphasis`, `editField` if not already present), for provenance (`copyPath` tooltip on the chip, `pathCopied` confirmation), and for per-field conflicts (`keepMine`, `keepTheirs`).

## 5. Implementation order

1. `EditableText` upgrade (zone + pencil + inline errors); remove text-click editing.
2. Provenance: `describeField()` in `draft.ts` (registry lookup + pointer formatting), tooltip + chip in `EditableText`, clipboard copy + `ui.edit` labels; reused by every later control.
3. `profile.json` handle-only + URL derivation in `profile.ts` (resolved record shape unchanged — verify consumers byte-identical).
4. `TagListEditor` for all six tag arrays incl. tagline emphasis, chips carrying indexed provenance.
5. Add/delete/move for records (`AddRecord`, trash, ↑/↓) over the existing templates and orphan-free delete.
6. `RecordSettings` popover (featured, variant, logo, section list with type picker), pointer shown beside each control.
7. id-slug generator + collision suffixes in `draft.ts` record creation.
8. Remove `JsonPanel.tsx` + its EditBar hooks + `ui.edit` panel labels.
9. Docs: live-edit §5.1 superseded note, data-organization §6.4 superseded note, AGENTS.md Live Edit Mode section.

## 6. Acceptance criteria

- [ ] Every field previously editable in the JSON panel is editable on a page: text, tags (incl. tagline emphasis), featured, variant, logo, technologies, record add/delete, section add with type, record order.
- [ ] Clicking editable text never opens an editor; the pencil always does; keyboard path Tab→Enter works for every control.
- [ ] Hovering any pencil shows `document → pointer`; the active editor carries the chip; clicking the chip copies the full repo path; the descriptor matches the EditBar diff line and the `validate:content` error for the same field.
- [ ] `profile.json` without URL fields renders identical Contact/Footer/resume output (derived URLs match the previous literals, `t.me/dongdn` included).
- [ ] Save flow: edit text + add a chip + move a tag → EditBar lists the touched files → save commits land on the target branch; a 412 conflict resolves without raw JSON: rebase / take-theirs / per-field keep-mine–keep-theirs in the EditBar.
- [ ] `pnpm build`, `pnpm validate:content`, `pnpm lint` (no new warnings), `pnpm tsx scripts/smoke-draft.ts`, `pnpm build:resume-all` pass.
- [ ] Visitor rendering unchanged on all 7 routes, both languages.

## 7. Progress Tracking

| # | Task | Status |
|---|---|---|
| 0 | Design agreed (E1–E7) | ✅ Done 2026-10-23 |
| 1–7 | Implementation §5 | ✅ Done 2026-10-23 — EditableText zone/pencil/provenance, TagListEditor over all tag arrays, tagline emphasis, `RecordControls` + `AddGhost` on every record surface (About, AboutPage, Expertise, Experience, ExperiencePage, Projects, ProjectsListPage, ProjectDetailPage incl. sections, PhilosophyPage), `RecordSettings` (featured, section list + type picker, variant, location, logo), id-slug rename on title commit, per-field conflict UI in EditBar; chrome CSS in `App.css`, labels in both `ui.json` |
| 8 | Remove `JsonPanel` + panel labels | ✅ Done 2026-10-23 — `JsonPanel.tsx` deleted (already orphaned by the inline wiring; no imports remained); panel labels removed from both UI documents: `openPanel`, `closePanel`, `handMerge`, the whole `edit.panel.*` namespace |
| 9 | Docs superseded notes | ✅ Done 2026-10-23 — superseded notes at live-edit §5.1 (panel shape) and §12 row 14; AGENTS.md "Live Edit Mode" + "Component Structure" rewritten for the inline surface |
| — | Acceptance §6 | 🟡 Partial — `pnpm build`, `pnpm validate:content`, `pnpm lint` (no new warnings), `pnpm tsx scripts/smoke-draft.ts`, `pnpm build:resume-all` pass 2026-10-23; browser verification of the edit surfaces pending (user verifies in a real browser) |
| 10 | Fix (owner-reported 2026-10-24): clicking "add technology" on a project card opened the project instead of adding a tag | ✅ Done 2026-10-24 (automated) — root cause: the card body IS a link (`MotionLink` at `Projects.tsx:49`, `ProjectsListPage.tsx:39`), and the add chip was the one edit control inside it without a guard. The chips themselves are safe because they render through `EditableText`, whose edit-mode `onClick` does `preventDefault + stopPropagation` (`EditableText.tsx:239-242`) — that is why ↑/↓/🗑 worked — and the pencil suppresses its own mousedown. `TagListEditor`'s add button now carries both guards (`TagListEditor.tsx:126-138`): mousedown stopped, then `preventDefault + stopPropagation` on click before `write([...items, s.edit.newTag])`. Covers the technologies *and* the metrics add on both card surfaces; the same control in `Hero.tsx` (tagline), `Expertise.tsx`, `AboutPage`, `ExperiencePage`, `PhilosophyPage`, `ProjectDetailPage` and the settings popovers sits outside any anchor and is untouched. Verified: `pnpm build` ✓, `pnpm lint` (only the five pre-existing warnings). ⬜ Browser: `?edit` → add a technology on a card → a new chip appears, no navigation |
| 11 | Fix (owner-reported 2026-10-24): a project's `category` had no edit control at all — the settings popover covered `featured` + sections only, the badge is display-only, and a new project silently gets `category: 'experiment'` (`draft.ts:546`) | ✅ Done 2026-10-24 (automated) — `ProjectSettingsPanel` now renders a `category` `<select>` (`RecordSettings.tsx:59-90`): options = the label map of `ui/projects.json` (`new Map(Object.entries(s.projects.categories))`) with the current value appended, so the panel never rewrites a project whose label is missing; the write is `edit.setStructured('projects', '[i].category', value)` — the exact call `smoke-draft.ts` check 11 already gates (a labeled value is accepted, a label-less one is rejected naming both `ui/projects.json` files). `ui.edit.category` label added to both languages (`ui/edit.json:15`). CSS: `.record-settings-field select` joins the field-control rule (`App.css:2487-2488`) — the timeline `variant` select, which had no rule of its own, is now styled too. Vocabulary measured from the shipped dictionaries: 6 labeled categories (`software-engineering, logistics, ai-ml, computer-vision, architecture, experiment`), 2 in use, 4 assignable that were unreachable before, none used-but-unlabeled, en/vi key sets identical. Verified: `pnpm build`, `pnpm validate:content`, `pnpm lint` (the 5 pre-existing warnings only), `pnpm tsx scripts/smoke-draft.ts` 11/11. Out of scope by design: creating a category with no labels — UI documents stay read-only in v4, so its labels are a repository edit. ⬜ Browser: ⚙ on a project card → the select shows the current category, switching it updates the badge and the EditBar diff |
