// Draft store (spec-v4 §5.1, §5.5, §5.6, §6.1): the live branch documents
// fetched through the proxy, a copy-on-write draft over them, changed-path
// tracking, cross-document validation on every accepted edit, sessionStorage
// durability, and the sequential-PUT save pipeline with last_commit_sha
// optimistic concurrency. Pure logic — the React glue lives in EditModeShell.
import contentEnJson from './locales/en/content.json';
import contentViJson from './locales/vi/content.json';
import experienceJson from '../data/experience.json';
import profileJson from '../data/profile.json';
import projectsJson from '../data/projects.json';
import skillsJson from '../data/skills.json';
import { collectContentIssues } from './validate';
import type { ContentIssue, ContentStructures } from './validate';
import type { ContentEn, ContentVi } from './dict-types';
import type { Language } from '../types/index';

export type DraftDocId =
  | 'profile'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'content.vi'
  | 'content.en';

export type DraftDocMeta = {
  id: DraftDocId;
  file: string;
  kind: 'structure' | 'text';
  lang?: Language;
};

// The six documents an edit session may write. `ui.{vi,en}.json` are shown
// read-only in the panel (§5.1) and never enter a draft.
export const DRAFT_DOCS: readonly DraftDocMeta[] = [
  { id: 'profile', file: 'src/data/profile.json', kind: 'structure' },
  { id: 'skills', file: 'src/data/skills.json', kind: 'structure' },
  { id: 'experience', file: 'src/data/experience.json', kind: 'structure' },
  { id: 'projects', file: 'src/data/projects.json', kind: 'structure' },
  { id: 'content.vi', file: 'src/i18n/locales/vi/content.json', kind: 'text', lang: 'vi' },
  { id: 'content.en', file: 'src/i18n/locales/en/content.json', kind: 'text', lang: 'en' },
];

export const PROXY_BASE = '/api/content/';
export const TYPES_FILE = 'src/types/index.ts';

export function proxyUrl(file: string, ref: string): string {
  return `${PROXY_BASE}${file}?ref=${encodeURIComponent(ref)}`;
}

// --- JSON paths -----------------------------------------------------------------
// A path is a dot-separated chain of object keys and [n] array indices, e.g.
// `projects.iot-dws-integration.sections.tldr.content` or
// `profile.tagline[2].text` — the same shape the EditBar and validator print.

export type PathSeg = string | number;

export function parsePath(path: string): PathSeg[] {
  const out: PathSeg[] = [];
  for (const m of path.matchAll(/([^.[\]]+)|\[(\d+)\]/g)) {
    out.push(m[2] !== undefined ? Number(m[2]) : m[1]);
  }
  return out;
}

export function getPath(root: unknown, segs: PathSeg[]): unknown {
  let cur: unknown = root;
  for (const seg of segs) {
    if (cur === undefined || cur === null) return undefined;
    cur = (cur as Record<PathSeg, unknown>)[seg];
  }
  return cur;
}

export function setPath(root: unknown, segs: PathSeg[], value: unknown): unknown {
  if (segs.length === 0) return value;
  const [head, ...rest] = segs;
  // A missing container under a numeric segment is an array. A text document
  // that does not hold the field yet (an older target branch, e.g.
  // `profile.currentInterests` still living in the old structure document)
  // must not gain an object-keyed pseudo-array — that shape crashed every
  // consumer doing items.map on the re-render after the first commit.
  const copy = (
    Array.isArray(root)
      ? [...(root as unknown[])]
      : root === undefined && typeof head === 'number'
        ? []
        : { ...(root as Record<PathSeg, unknown>) }
  ) as Record<PathSeg, unknown>;
  copy[head] = rest.length === 0 ? value : setPath(copy[head], rest, value);
  return copy;
}

export function deletePath(root: unknown, segs: PathSeg[]): unknown {
  if (segs.length === 0) return undefined;
  const [head, ...rest] = segs;
  if (rest.length === 0) {
    if (Array.isArray(root)) {
      const copy = [...root];
      copy.splice(Number(head), 1);
      return copy;
    }
    const copy = { ...(root as Record<PathSeg, unknown>) };
    delete copy[head as string];
    return copy;
  }
  const copy = (
    Array.isArray(root) ? [...(root as unknown[])] : { ...(root as Record<PathSeg, unknown>) }
  ) as Record<PathSeg, unknown>;
  copy[head] = deletePath(copy[head], rest);
  return copy;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// Leaf-level diff between a baseline document and its draft copy: object keys
// added or removed report the key itself, arrays whose length changed report
// the array path, everything else recurses to the differing leaf.
export function diffPaths(a: unknown, b: unknown, prefix = ''): string[] {
  if (isPlainObject(a) && isPlainObject(b)) {
    const out: string[] = [];
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const child = prefix ? `${prefix}.${key}` : key;
      if (a[key] === undefined || b[key] === undefined) {
        out.push(child);
        continue;
      }
      out.push(...diffPaths(a[key], b[key], child));
    }
    return out;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return prefix ? [prefix] : [];
    const out: string[] = [];
    for (let i = 0; i < a.length; i++) {
      out.push(...diffPaths(a[i], b[i], `${prefix}[${i}]`));
    }
    return out;
  }
  if (a === b) return [];
  return prefix ? [prefix] : [];
}

// --- proxy transport -------------------------------------------------------------

export type DocBase = { data: unknown; sha: string };

function decodeBase64(b64: string): string {
  const bin = atob(b64.replace(/\s+/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export async function fetchDoc(file: string, branch: string): Promise<DocBase> {
  const res = await fetch(proxyUrl(file, branch));
  if (!res.ok) throw new Error(`GET ${file}: ${res.status}`);
  const json = (await res.json()) as { content?: string; last_commit_sha?: string };
  return {
    data: JSON.parse(decodeBase64(json.content ?? '')),
    sha: String(json.last_commit_sha ?? ''),
  };
}

export async function fetchTextFile(file: string, branch: string): Promise<{ text: string; sha: string }> {
  const res = await fetch(proxyUrl(file, branch));
  if (!res.ok) throw new Error(`GET ${file}: ${res.status}`);
  const json = (await res.json()) as { content?: string; last_commit_sha?: string };
  return { text: decodeBase64(json.content ?? ''), sha: String(json.last_commit_sha ?? '') };
}

export type PutResult = { ok: true; sha: string } | { ok: false; status: number };

async function putBase64(
  file: string,
  encoded: string,
  message: string,
  lastCommitSha: string,
  branch: string,
): Promise<PutResult> {
  const res = await fetch(proxyUrl(file, branch), {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      content: encoded,
      message,
      branch,
      last_commit_sha: lastCommitSha,
    }),
  });
  if (!res.ok) return { ok: false, status: res.status };
  const json = (await res.json()) as { last_commit_sha?: string };
  return { ok: true, sha: String(json.last_commit_sha ?? '') };
}

// Serialize exactly as the repository file is formatted (2-space indent, key
// order preserved from the parsed document) so Gitea diffs stay reviewable
// (§6.1).
export function putDoc(
  file: string,
  data: unknown,
  message: string,
  lastCommitSha: string,
  branch: string,
): Promise<PutResult> {
  return putBase64(file, encodeBase64(`${JSON.stringify(data, null, 2)}\n`), message, lastCommitSha, branch);
}

export function putTextFile(
  file: string,
  text: string,
  message: string,
  lastCommitSha: string,
  branch: string,
): Promise<PutResult> {
  return putBase64(file, encodeBase64(text), message, lastCommitSha, branch);
}

// Offline fallback (§5.1): the bundled build-time documents, flagged stale in
// the UI, save disabled — the draft is never initialized from a bundle that
// might be older than master when the proxy is reachable.
export function bundledBase(): Record<DraftDocId, DocBase> {
  return {
    profile: { data: structuredClone(profileJson), sha: '' },
    skills: { data: structuredClone(skillsJson), sha: '' },
    experience: { data: structuredClone(experienceJson), sha: '' },
    projects: { data: structuredClone(projectsJson), sha: '' },
    'content.vi': { data: structuredClone(contentViJson), sha: '' },
    'content.en': { data: structuredClone(contentEnJson), sha: '' },
  };
}

// --- id unions (§3.1) ------------------------------------------------------------
// Adding a content item is three edits: a union member, a structure record,
// its Vietnamese text. The editor does all three: after the content documents
// land, saveIdUnions appends the new ids to src/types/index.ts.

const UNION_SPECS: ReadonlyArray<{ union: string; ids: (s: ContentStructures) => string[] }> = [
  { union: 'ProjectId', ids: (s) => s.projects.map((p) => p.id) },
  { union: 'ExperienceId', ids: (s) => s.experience.map((e) => e.id) },
  { union: 'SkillGroupId', ids: (s) => s.skills.map((g) => g.id) },
  { union: 'PhilosophyId', ids: (s) => s.profile.philosophy.map((p) => p.id) },
];

export function newIdsInCommitted(store: DraftStore, typesSource: string): { union: string; id: string }[] {
  const structures = store.committedStructures();
  const out: { union: string; id: string }[] = [];
  for (const spec of UNION_SPECS) {
    for (const id of spec.ids(structures)) {
      if (!typesSource.includes(`'${id}'`)) out.push({ union: spec.union, id });
    }
  }
  return out;
}

export function patchUnionSource(source: string, union: string, id: string): string | null {
  const marker = `export type ${union} =\n`;
  const at = source.indexOf(marker);
  if (at < 0) return null;
  const insertAt = at + marker.length;
  return `${source.slice(0, insertAt)}  | '${id}'\n${source.slice(insertAt)}`;
}

// --- the store ---------------------------------------------------------------------

export type SavedDraft = {
  docs: Record<string, unknown>;
  baseShas: Record<string, string>;
  // Record ids created inside this draft session — their ids follow the title
  // until the record is saved (spec-v4-inline-editing E3). Optional so a
  // persisted draft from before this existed still restores.
  created?: string[];
};

export type RecordKind = 'project' | 'experience' | 'skill-group' | 'philosophy' | 'section';
export type RecordIds = { id: string; projectId?: string };

// Where a field physically lives (spec-v4-inline-editing E7): `doc` is the
// short form a developer searches, `pointer` the path inside it, `repoPath`
// the full project path — what the provenance chip copies to the clipboard.
export type FieldInfo = { doc: string; pointer: string; repoPath: string };

// One field where my draft and the moved branch both changed, to different
// values (E8) — the store never resolves it by itself.
export type ConflictField = { path: string; mine: unknown; theirs: unknown };

function uniqueId(base: string, taken: readonly string[]): string {
  let id = base;
  let n = 2;
  while (taken.includes(id)) id = `${base}-${n++}`;
  return id;
}

// Ids are born from titles (spec-v4-inline-editing E3): lowercase, hyphen-
// joined ASCII. Vietnamese diacritics fold through NFD; đ folds separately.
export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const recordKey = (kind: RecordKind, ids: RecordIds): string =>
  ids.projectId ? `${kind}:${ids.projectId}:${ids.id}` : `${kind}:${ids.id}`;

// A committed text path naming a record title — the trigger for id re-sluging
// while the record is still draft-only (E3).
export function recordForTitlePath(
  path: string,
): { kind: RecordKind; ids: RecordIds } | null {
  const section = /^projects\.([^.[\]]+)\.sections\.([^.[\]]+)\.title$/.exec(path);
  if (section) return { kind: 'section', ids: { id: section[2], projectId: section[1] } };
  const project = /^projects\.([^.[\]]+)\.title$/.exec(path);
  if (project) return { kind: 'project', ids: { id: project[1] } };
  const experience = /^experience\.([^.[\]]+)\.title$/.exec(path);
  if (experience) return { kind: 'experience', ids: { id: experience[1] } };
  const group = /^skills\.([^.[\]]+)\.title$/.exec(path);
  if (group) return { kind: 'skill-group', ids: { id: group[1] } };
  const point = /^profile\.philosophy\.([^.[\]]+)\.title$/.exec(path);
  if (point) return { kind: 'philosophy', ids: { id: point[1] } };
  return null;
}

export class DraftStore {
  private base = new Map<DraftDocId, DocBase>();
  // The baseline the draft was taken against. `base` may be refreshed by a
  // 412 conflict; `origin` never moves until a document lands, so a rebase
  // can always tell my changes from theirs (§5.6).
  private origin = new Map<DraftDocId, unknown>();
  private working = new Map<DraftDocId, unknown>();
  private changes = new Map<DraftDocId, string[]>;
  // Ids of records created in this draft session (recordKey form). A created
  // id follows its title while the record is draft-only; after a save the id
  // is published and fixed (E3).
  private created = new Set<string>();

  constructor(bases: Record<DraftDocId, DocBase>) {
    for (const meta of DRAFT_DOCS) {
      this.base.set(meta.id, bases[meta.id]);
      this.origin.set(meta.id, bases[meta.id].data);
    }
  }

  dataOf(id: DraftDocId): unknown {
    return this.working.has(id) ? this.working.get(id) : this.base.get(id)!.data;
  }

  shaOf(id: DraftDocId): string {
    return this.base.get(id)!.sha;
  }

  touched(): DraftDocId[] {
    return [...this.working.keys()];
  }

  changedPaths(id: DraftDocId): string[] {
    return this.changes.get(id) ?? [];
  }

  isDirty(): boolean {
    return this.working.size > 0;
  }

  isPathDirty(path: string): boolean {
    return this.touched().some((id) => this.changedPaths(id).includes(path));
  }

  changedDocs(): { id: DraftDocId; paths: { path: string; before: unknown; after: unknown }[] }[] {
    return this.touched().map((id) => ({
      id,
      paths: this.changedPaths(id).map((p) => ({
        path: p,
        before: getPath(this.base.get(id)!.data, parsePath(p)),
        after: getPath(this.dataOf(id), parsePath(p)),
      })),
    }));
  }

  draftStructures(): ContentStructures {
    return {
      profile: this.dataOf('profile'),
      skills: this.dataOf('skills'),
      experience: this.dataOf('experience'),
      projects: this.dataOf('projects'),
    } as unknown as ContentStructures;
  }

  baseDataOf(id: DraftDocId): unknown {
    return this.base.get(id)!.data;
  }

  // Structures as they would exist in master after the already-written PUTs —
  // the union patch only covers ids whose documents actually landed.
  committedStructures(): ContentStructures {
    const baseData = (id: DraftDocId) => this.base.get(id)!.data;
    return {
      profile: baseData('profile'),
      skills: baseData('skills'),
      experience: baseData('experience'),
      projects: baseData('projects'),
    } as unknown as ContentStructures;
  }

  draftTexts(): { vi: ContentVi; en: ContentEn } {
    return {
      vi: this.dataOf('content.vi') as ContentVi,
      en: this.dataOf('content.en') as ContentEn,
    };
  }

  validate(): ContentIssue[] {
    const texts = this.draftTexts();
    return collectContentIssues(this.draftStructures(), texts.vi, texts.en);
  }

  // Inline text edit (§5.3): the value lands in the text document of the
  // language being edited; missing en entries are created, vi paths always
  // exist. Returns the validator issues when the candidate draft is invalid,
  // leaving the store untouched.
  setValue(lang: Language, path: string, value: string): ContentIssue[] | null {
    const id: DraftDocId = lang === 'vi' ? 'content.vi' : 'content.en';
    return this.tryApply(new Map([[id, setPath(this.dataOf(id), parsePath(path), value)]]));
  }

  // Whole-document replacement from the JSON panel (§5.4).
  setDocument(id: DraftDocId, data: unknown): ContentIssue[] | null {
    return this.tryApply(new Map([[id, data]]));
  }

  // Per-field revert (§5.3): restore the baseline value at this path in every
  // touched text document; a path that was newly created is removed instead.
  revertPath(path: string): ContentIssue[] | null {
    const segs = parsePath(path);
    let lastIssues: ContentIssue[] | null = null;
    for (const id of ['content.vi', 'content.en'] as const) {
      if (!this.changedPaths(id).includes(path)) continue;
      const original = getPath(this.base.get(id)!.data, segs);
      const current = this.dataOf(id);
      const next =
        original === undefined
          ? deletePath(current, segs)
          : setPath(current, segs, original);
      lastIssues = this.tryApply(new Map([[id, next]]));
    }
    return lastIssues;
  }

  discardDocument(id: DraftDocId): void {
    this.working.delete(id);
    this.changes.delete(id);
  }

  // Templates and record deletes (§5.4): structure record and text entries
  // are created or removed in one action — orphan text is never produced.
  addRecord(kind: RecordKind, options: { projectId?: string } = {}): ContentIssue[] | null {
    const candidates = new Map<DraftDocId, unknown>();
    const vi = structuredClone(this.dataOf('content.vi')) as Record<string, any>;
    const en = structuredClone(this.dataOf('content.en')) as Record<string, any>;
    let createdIds: RecordIds | null = null;

    if (kind === 'project') {
      const projects = structuredClone(this.dataOf('projects')) as Record<string, any>[];
      const id = uniqueId('new-project', projects.map((p) => p.id));
      createdIds = { id };
      projects.push({ id, category: 'experiment', technologies: [], featured: false, sections: [] });
      candidates.set('projects', projects);
      const stub = { title: 'New project', summary: 'Write the summary here.', role: 'Owner', sections: {} };
      vi.projects = { ...vi.projects, [id]: structuredClone(stub) };
      en.projects = { ...en.projects, [id]: structuredClone(stub) };
    } else if (kind === 'experience') {
      const experiences = structuredClone(this.dataOf('experience')) as Record<string, any>[];
      const id = uniqueId('new-experience', experiences.map((e) => e.id));
      createdIds = { id };
      experiences.push({ id });
      candidates.set('experience', experiences);
      const stub = { title: 'New role', company: 'New company', duration: 'present', responsibilities: ['Write a responsibility here.'] };
      vi.experience = { ...vi.experience, [id]: structuredClone(stub) };
      en.experience = { ...en.experience, [id]: structuredClone(stub) };
    } else if (kind === 'skill-group') {
      const groups = structuredClone(this.dataOf('skills')) as Record<string, any>[];
      const id = uniqueId('new-skill-group', groups.map((g) => g.id));
      createdIds = { id };
      groups.push({ id, skills: ['New skill'] });
      candidates.set('skills', groups);
      vi.skills = { ...vi.skills, [id]: { title: 'New skill group' } };
      en.skills = { ...en.skills, [id]: { title: 'New skill group' } };
    } else if (kind === 'philosophy') {
      const profile = structuredClone(this.dataOf('profile')) as Record<string, any>;
      const points = profile.philosophy as Record<string, any>[];
      const id = uniqueId('new-philosophy-point', points.map((p) => p.id));
      createdIds = { id };
      points.push({ id });
      candidates.set('profile', profile);
      const stub = { title: 'New principle', description: 'Write the principle here.', keywords: ['new-keyword'] };
      vi.profile = { ...vi.profile, philosophy: { ...vi.profile.philosophy, [id]: structuredClone(stub) } };
      en.profile = { ...en.profile, philosophy: { ...en.profile.philosophy, [id]: structuredClone(stub) } };
    } else {
      const projectId = options.projectId;
      if (!projectId) return [{ path: 'projects.json', message: 'pick a project first' }];
      const projects = structuredClone(this.dataOf('projects')) as Record<string, any>[];
      const project = projects.find((p) => p.id === projectId);
      if (!project) return [{ path: 'projects.json', message: `no project ${projectId}` }];
      const sectionId = uniqueId('new-section', (project.sections as Record<string, any>[]).map((s) => s.id));
      createdIds = { id: sectionId, projectId };
      project.sections = [...project.sections, { id: sectionId, type: 'text' }];
      candidates.set('projects', projects);
      const stub = { title: 'New section', content: 'Write the section here.' };
      for (const texts of [vi, en]) {
        const text = texts.projects[projectId] as Record<string, any>;
        texts.projects = {
          ...texts.projects,
          [projectId]: { ...text, sections: { ...text.sections, [sectionId]: structuredClone(stub) } },
        };
      }
    }
    candidates.set('content.vi', vi);
    candidates.set('content.en', en);
    const issues = this.tryApply(candidates);
    if (issues === null && createdIds) this.created.add(recordKey(kind, createdIds));
    return issues;
  }

  // Delete removes the record's text entries from both language documents in
  // the same action — the validator can never see orphan text (§5.4).
  deleteRecord(kind: RecordKind, ids: RecordIds): ContentIssue[] | null {
    const candidates = new Map<DraftDocId, unknown>();

    const dropFromTexts = (mutate: (doc: Record<string, any>) => void) => {
      for (const id of ['content.vi', 'content.en'] as const) {
        const doc = structuredClone(this.dataOf(id)) as Record<string, any>;
        mutate(doc);
        candidates.set(id, doc);
      }
    };

    if (kind === 'project') {
      const projects = (this.dataOf('projects') as Record<string, any>[]).filter((p) => p.id !== ids.id);
      candidates.set('projects', projects);
      dropFromTexts((doc) => {
        delete doc.projects[ids.id];
      });
    } else if (kind === 'experience') {
      candidates.set('experience', (this.dataOf('experience') as Record<string, any>[]).filter((e) => e.id !== ids.id));
      dropFromTexts((doc) => {
        delete doc.experience[ids.id];
      });
    } else if (kind === 'skill-group') {
      candidates.set('skills', (this.dataOf('skills') as Record<string, any>[]).filter((g) => g.id !== ids.id));
      dropFromTexts((doc) => {
        delete doc.skills[ids.id];
      });
    } else if (kind === 'philosophy') {
      const profile = structuredClone(this.dataOf('profile')) as Record<string, any>;
      profile.philosophy = (profile.philosophy as Record<string, any>[]).filter((p) => p.id !== ids.id);
      candidates.set('profile', profile);
      dropFromTexts((doc) => {
        delete doc.profile.philosophy[ids.id];
      });
    } else {
      const projectId = ids.projectId;
      if (!projectId || !ids.id) return [{ path: 'projects.json', message: 'pick a project and section first' }];
      const projects = structuredClone(this.dataOf('projects')) as Record<string, any>[];
      const project = projects.find((p) => p.id === projectId);
      if (!project) return [{ path: 'projects.json', message: `no project ${projectId}` }];
      project.sections = (project.sections as Record<string, any>[]).filter((s) => s.id !== ids.id);
      candidates.set('projects', projects);
      dropFromTexts((doc) => {
        const text = doc.projects[projectId];
        if (text) text.sections = { ...text.sections };
        delete text?.sections[ids.id];
      });
    }
    const issues = this.tryApply(candidates);
    if (issues === null) this.created.delete(recordKey(kind, ids));
    return issues;
  }

  // --- provenance (spec-v4-inline-editing E7) ---------------------------------

  describeField(id: DraftDocId, path: string): FieldInfo {
    const file = DRAFT_DOCS.find((d) => d.id === id)?.file ?? id;
    return { doc: file.replace(/^src\//, ''), pointer: path, repoPath: file };
  }

  // --- generic document writes (E4/E5): structure fields and text arrays ----

  apply(id: DraftDocId, next: unknown): ContentIssue[] | null {
    return this.tryApply(new Map([[id, next]]));
  }

  setStructured(id: DraftDocId, path: string, value: unknown): ContentIssue[] | null {
    return this.apply(id, setPath(this.dataOf(id), parsePath(path), value));
  }

  deleteStructured(id: DraftDocId, path: string): ContentIssue[] | null {
    return this.apply(id, deletePath(this.dataOf(id), parsePath(path)));
  }

  // Move one element inside an array the path names (a document root array
  // included) — record order and tag order share this single primitive.
  moveItem(id: DraftDocId, path: string, from: number, to: number): ContentIssue[] | null {
    const segs = parsePath(path);
    const arr = getPath(this.dataOf(id), segs);
    if (!Array.isArray(arr) || from < 0 || to < 0 || from >= arr.length || to >= arr.length) {
      return null;
    }
    const next = [...arr];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return this.apply(id, setPath(this.dataOf(id), segs, next));
  }

  isCreated(kind: RecordKind, ids: RecordIds): boolean {
    return this.created.has(recordKey(kind, ids));
  }

  // E3: a draft-only id follows its title. Once the record has been saved the
  // id is published — it is the URL — and never changes again.
  renameRecord(kind: RecordKind, ids: RecordIds, rawId: string): ContentIssue[] | null {
    if (!this.isCreated(kind, ids)) return null;
    const slug = slugify(rawId);
    if (!slug) return null;

    const candidates = new Map<DraftDocId, unknown>();
    let newId = slug;

    const renameInTexts = (mutate: (doc: Record<string, any>) => void) => {
      for (const id of ['content.vi', 'content.en'] as const) {
        const doc = structuredClone(this.dataOf(id)) as Record<string, any>;
        mutate(doc);
        candidates.set(id, doc);
      }
    };

    if (kind === 'project') {
      const projects = structuredClone(this.dataOf('projects')) as Record<string, any>[];
      newId = uniqueId(slug, projects.map((p) => p.id));
      if (newId === ids.id) return null;
      projects.forEach((p, i) => {
        if (p.id === ids.id) projects[i] = { ...p, id: newId };
      });
      candidates.set('projects', projects);
      renameInTexts((doc) => {
        const rec = doc.projects[ids.id];
        if (rec === undefined) return;
        const rest = { ...doc.projects };
        delete rest[ids.id];
        doc.projects = { ...rest, [newId]: rec };
      });
    } else if (kind === 'experience') {
      const experiences = structuredClone(this.dataOf('experience')) as Record<string, any>[];
      newId = uniqueId(slug, experiences.map((e) => e.id));
      if (newId === ids.id) return null;
      experiences.forEach((e, i) => {
        if (e.id === ids.id) experiences[i] = { ...e, id: newId };
      });
      candidates.set('experience', experiences);
      renameInTexts((doc) => {
        const rec = doc.experience[ids.id];
        if (rec === undefined) return;
        const rest = { ...doc.experience };
        delete rest[ids.id];
        doc.experience = { ...rest, [newId]: rec };
      });
    } else if (kind === 'skill-group') {
      const groups = structuredClone(this.dataOf('skills')) as Record<string, any>[];
      newId = uniqueId(slug, groups.map((g) => g.id));
      if (newId === ids.id) return null;
      groups.forEach((g, i) => {
        if (g.id === ids.id) groups[i] = { ...g, id: newId };
      });
      candidates.set('skills', groups);
      renameInTexts((doc) => {
        const rec = doc.skills[ids.id];
        if (rec === undefined) return;
        const rest = { ...doc.skills };
        delete rest[ids.id];
        doc.skills = { ...rest, [newId]: rec };
      });
    } else if (kind === 'philosophy') {
      const profile = structuredClone(this.dataOf('profile')) as Record<string, any>;
      const points = profile.philosophy as Record<string, any>[];
      newId = uniqueId(slug, points.map((p) => p.id));
      if (newId === ids.id) return null;
      points.forEach((p, i) => {
        if (p.id === ids.id) points[i] = { ...p, id: newId };
      });
      candidates.set('profile', profile);
      renameInTexts((doc) => {
        const rec = doc.profile.philosophy[ids.id];
        if (rec === undefined) return;
        const rest = { ...doc.profile.philosophy };
        delete rest[ids.id];
        doc.profile.philosophy = { ...rest, [newId]: rec };
      });
    } else {
      const projectId = ids.projectId;
      if (!projectId) return null;
      const projects = structuredClone(this.dataOf('projects')) as Record<string, any>[];
      const project = projects.find((p) => p.id === projectId);
      if (!project) return null;
      const sections = project.sections as Record<string, any>[];
      newId = uniqueId(slug, sections.map((s) => s.id));
      if (newId === ids.id) return null;
      sections.forEach((s, i) => {
        if (s.id === ids.id) sections[i] = { ...s, id: newId };
      });
      candidates.set('projects', projects);
      renameInTexts((doc) => {
        const text = doc.projects[projectId];
        const rec = text?.sections?.[ids.id];
        if (rec === undefined) return;
        const rest = { ...text.sections };
        delete rest[ids.id];
        doc.projects = {
          ...doc.projects,
          [projectId]: { ...text, sections: { ...rest, [newId]: rec } },
        };
      });
    }

    const issues = this.tryApply(candidates);
    if (issues === null) {
      this.created.delete(recordKey(kind, ids));
      this.created.add(recordKey(kind, { ...ids, id: newId }));
    }
    return issues;
  }

  // --- conflicts, field by field (E8) -------------------------------------------

  conflictFields(id: DraftDocId): ConflictField[] {
    const origin = this.origin.get(id);
    const theirs = this.base.get(id)?.data;
    if (origin === undefined || theirs === undefined) return [];
    const mine = this.dataOf(id);
    const theirPaths = new Set(diffPaths(origin, theirs));
    const out: ConflictField[] = [];
    for (const path of diffPaths(origin, mine)) {
      if (!theirPaths.has(path)) continue;
      const segs = parsePath(path);
      const myValue = getPath(mine, segs);
      const theirValue = getPath(theirs, segs);
      if (JSON.stringify(myValue) === JSON.stringify(theirValue)) continue;
      out.push({ path, mine: myValue, theirs: theirValue });
    }
    return out;
  }

  // Keep one side for one field, then retry the rebase. 'theirs': the working
  // copy adopts the branch value, so my edit at that path is dropped. 'mine':
  // the origin snapshot adopts the branch value, so the rebase replays my
  // value over theirs — my edit wins at that path, every other replay is
  // untouched.
  resolveConflictField(
    id: DraftDocId,
    path: string,
    side: 'mine' | 'theirs',
  ): ContentIssue[] | null {
    const origin = this.origin.get(id);
    const theirs = this.base.get(id)?.data;
    if (origin === undefined || theirs === undefined) return null;
    const segs = parsePath(path);
    if (side === 'mine') {
      this.origin.set(id, setPath(origin, segs, getPath(theirs, segs)));
    } else {
      const issues = this.apply(id, setPath(this.dataOf(id), segs, getPath(theirs, segs)));
      if (issues) return issues;
    }
    return this.rebase(id);
  }

  // Apply candidate documents atomically: replace, recompute changed paths,
  // run the full cross-document validator, roll every document back when the
  // candidate draft is invalid (§5.4 — an invalid draft never reaches the
  // preview). A document that ends up equal to its baseline stops being
  // touched, so save only ever PUTs documents that actually differ.
  private tryApply(candidates: Map<DraftDocId, unknown>): ContentIssue[] | null {
    const undo: [DraftDocId, boolean, unknown, string[] | undefined][] = [];
    for (const [id, data] of candidates) {
      undo.push([id, this.working.has(id), this.working.get(id), this.changes.get(id)]);
      this.working.set(id, data);
      this.refreshChanges(id);
    }
    const issues = this.validate();
    if (issues.length > 0) {
      for (const [id, had, prev, prevChanges] of undo) {
        if (had) {
          this.working.set(id, prev);
          if (prevChanges) this.changes.set(id, prevChanges);
        } else {
          this.working.delete(id);
          this.changes.delete(id);
        }
      }
      return issues;
    }
    for (const id of candidates.keys()) {
      if (JSON.stringify(this.dataOf(id)) === JSON.stringify(this.base.get(id)!.data)) {
        this.working.delete(id);
        this.changes.delete(id);
      }
    }
    return null;
  }

  private refreshChanges(id: DraftDocId): void {
    const diff = diffPaths(this.base.get(id)!.data, this.working.get(id));
    if (diff.length > 0) this.changes.set(id, diff);
    else this.changes.delete(id);
  }

  // --- persistence (§5.2) ---

  snapshot(): SavedDraft {
    const docs: Record<string, unknown> = {};
    for (const [id, data] of this.working) docs[id] = data;
    const baseShas: Record<string, string> = {};
    for (const [id, meta] of this.base) baseShas[id] = meta.sha;
    return { docs, baseShas, created: [...this.created] };
  }

  // Re-apply a persisted draft onto freshly fetched baselines. A document
  // whose last_commit_sha moved since the draft was taken is returned as
  // drifted → the conflict flow (§5.6) owns it from here.
  applySaved(saved: SavedDraft): DraftDocId[] {
    this.created = new Set(saved.created ?? []);
    const drifted: DraftDocId[] = [];
    for (const [idStr, data] of Object.entries(saved.docs)) {
      const id = idStr as DraftDocId;
      if (!DRAFT_DOCS.some((d) => d.id === id)) continue;
      const savedSha = saved.baseShas[id] ?? '';
      const liveSha = this.shaOf(id);
      if (savedSha && savedSha !== liveSha) drifted.push(id);
      this.working.set(id, data);
      this.refreshChanges(id);
    }
    return drifted;
  }

  // --- save pipeline (§5.6, §6.1) ---

  markWritten(id: DraftDocId, newSha: string): void {
    const data = this.dataOf(id);
    this.base.set(id, { data, sha: newSha });
    this.origin.set(id, data);
    this.working.delete(id);
    this.changes.delete(id);
  }

  resetBase(id: DraftDocId, fresh: DocBase): void {
    this.base.set(id, fresh);
  }

  // Rebase (§5.6): a real three-way merge of origin → mine against origin →
  // theirs. Paths only I touched replay onto the refreshed base; a path both
  // sides changed differently is a conflict the store refuses to resolve —
  // resolveConflictField (spec-v4-inline-editing E8) settles it field by
  // field, take-theirs still owns the whole document.
  rebase(id: DraftDocId): ContentIssue[] | null {
    const origin = this.origin.get(id)!;
    const theirs = this.base.get(id)!.data;
    const mine = this.dataOf(id);
    const myPaths = diffPaths(origin, mine);
    const theirPaths = new Set(diffPaths(origin, theirs));
    const clashes = myPaths.filter(
      (p) =>
        theirPaths.has(p) &&
        JSON.stringify(getPath(mine, parsePath(p))) !== JSON.stringify(getPath(theirs, parsePath(p))),
    );
    if (clashes.length > 0) {
      return clashes.map((p) => ({
        path: p,
        message: 'changed both locally and in the branch — resolve the field or take theirs',
      }));
    }
    let data = theirs;
    for (const p of myPaths) {
      const value = getPath(mine, parsePath(p));
      if (value !== undefined) data = setPath(data, parsePath(p), value);
    }
    const issues = this.tryApply(new Map([[id, data]]));
    if (issues === null) this.origin.set(id, theirs);
    return issues;
  }
}

// --- save pipeline -----------------------------------------------------------------

export type DocSaveResult = {
  id: DraftDocId;
  status: 'written' | 'conflict' | 'failed';
  http?: number;
};

// Sequential PUTs, one commit per touched document (§6.1). A 412 refreshes
// that document's base and reports a conflict without stopping the sequence;
// any other failure stops so a retry resumes from the first unwritten
// document — landed documents are never rewritten (§5.6).
export async function saveDraft(
  store: DraftStore,
  onResult: (result: DocSaveResult) => void,
  branch: string,
): Promise<{ results: DocSaveResult[]; stoppedEarly: boolean }> {
  const results: DocSaveResult[] = [];
  for (const id of store.touched()) {
    const meta = DRAFT_DOCS.find((d) => d.id === id)!;
    const paths = store.changedPaths(id);
    const message = `content: ${paths[0] ?? meta.file} (${paths.length} path${paths.length === 1 ? '' : 's'})`;
    const res = await putDoc(meta.file, store.dataOf(id), message, store.shaOf(id), branch);
    if (res.ok) {
      store.markWritten(id, res.sha);
      const result: DocSaveResult = { id, status: 'written' };
      results.push(result);
      onResult(result);
      continue;
    }
    if (res.status === 412) {
      try {
        store.resetBase(id, await fetchDoc(meta.file, branch));
      } catch {
        // keep the old base; the conflict UI still offers take-theirs
      }
      const result: DocSaveResult = { id, status: 'conflict', http: 412 };
      results.push(result);
      onResult(result);
      continue;
    }
    const result: DocSaveResult = { id, status: 'failed', http: res.status };
    results.push(result);
    onResult(result);
    return { results, stoppedEarly: true };
  }
  return { results, stoppedEarly: false };
}

// The third leg of §3.1: once the documents that introduce new ids have
// landed, append those ids to their unions in src/types/index.ts so the next
// CI build compiles. Returns the updated source/sha, or null when the patch
// could not be written (the EditBar reports it and the owner finishes the
// edit in Gitea).
export async function saveIdUnions(
  store: DraftStore,
  types: { source: string; sha: string },
  branch: string,
): Promise<{ added: { union: string; id: string }[]; source?: string; sha?: string; failed?: number } | null> {
  const added = newIdsInCommitted(store, types.source);
  if (added.length === 0) return null;
  let source = types.source;
  for (const { union, id } of added) {
    const patched = patchUnionSource(source, union, id);
    if (!patched) return { added, failed: 0 };
    source = patched;
  }
  const message = `content: add id union members (${added.map((a) => a.id).join(', ')})`;
  const res = await putTextFile(TYPES_FILE, source, message, types.sha, branch);
  if (!res.ok) return { added, failed: res.status };
  return { added, source, sha: res.sha };
}
