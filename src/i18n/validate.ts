// Cross-document consistency rules (spec-v4 §3.6, spec-v4-data-organization
// §5.1) — what types cannot express across JSON files. Runs at load (dev),
// in CI (`scripts/validate-content.ts`), and in the browser before save
// (edit mode).
//
// tsc already guarantees each document individually satisfies its declared
// type and that every Vietnamese text file covers its union ids; this module
// enforces the relationships BETWEEN documents and reports exact file paths
// so a content edit can be fixed in the right file.
import type {
  ContentEn,
  ContentVi,
  ExperienceStructure,
  ProfileStructure,
  ProjectStructure,
  SkillGroupStructure,
} from './dict-types';
import { manifestsClaiming, pageManifests } from '../data/pages';
import type { ContentEntityId } from '../types/index';

export type ContentIssue = { path: string; message: string };

export type ContentStructures = {
  profile: ProfileStructure;
  skills: SkillGroupStructure[];
  experience: ExperienceStructure[];
  projects: ProjectStructure[];
};

const hasHtml = (value: string) => value.includes('<') || value.includes('>');

// Walks every string value of a text document, collecting the document paths
// of empty strings — an empty required value is a half-finished edit, never
// content (rule 6). Mirrors the walk in findHtmlStrings.
function findEmptyStrings(value: unknown, docPath: string): string[] {
  if (typeof value === 'string') return value.trim() === '' ? [docPath] : [];
  if (Array.isArray(value))
    return value.flatMap((item, i) => findEmptyStrings(item, `${docPath}[${i}]`));
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, item]) =>
      findEmptyStrings(item, `${docPath}.${key}`),
    );
  return [];
}

// Walks every string value of a text document, collecting its document path.
function findHtmlStrings(value: unknown, docPath: string): string[] {
  if (typeof value === 'string') return hasHtml(value) ? [docPath] : [];
  if (Array.isArray(value))
    return value.flatMap((item, i) => findHtmlStrings(item, `${docPath}[${i}]`));
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, item]) =>
      findHtmlStrings(item, `${docPath}.${key}`),
    );
  return [];
}

// The per-entity text file a namespace lives in (spec-v4-data-organization
// §3) — issue paths name the file a fix belongs in.
const TEXT_FILE: Record<'profile' | 'skills' | 'experience' | 'projects', string> = {
  profile: 'profile.json',
  skills: 'skills.json',
  experience: 'experience.json',
  projects: 'projects.json',
};
const textFile = (lang: 'vi' | 'en', ns: keyof typeof TEXT_FILE) =>
  `src/i18n/locales/${lang}/content/${TEXT_FILE[ns]}`;

export function collectContentIssues(
  structures: ContentStructures,
  vi: ContentVi,
  en: ContentEn,
): ContentIssue[] {
  const issues: ContentIssue[] = [];

  // Rule 1: every structure id — and every section id inside a project —
  // has Vietnamese text. (Section ids collide across projects, so coverage is
  // enforced per project, not by a global union.)
  for (const group of structures.skills) {
    if (!vi.skills[group.id])
      issues.push({ path: `${textFile('vi', 'skills')}: ${group.id}`, message: 'missing Vietnamese text' });
  }
  for (const entry of structures.experience) {
    if (!vi.experience[entry.id])
      issues.push({ path: `${textFile('vi', 'experience')}: ${entry.id}`, message: 'missing Vietnamese text' });
  }
  for (const project of structures.projects) {
    const text = vi.projects[project.id];
    if (!text) {
      issues.push({ path: `${textFile('vi', 'projects')}: ${project.id}`, message: 'missing Vietnamese text' });
      continue;
    }
    for (const section of project.sections) {
      if (!text.sections[section.id])
        issues.push({
          path: `${textFile('vi', 'projects')}: ${project.id}.sections.${section.id}`,
          message: 'missing Vietnamese text for section',
        });
    }
  }
  for (const point of structures.profile.philosophy) {
    if (!vi.profile.philosophy[point.id])
      issues.push({
        path: `${textFile('vi', 'profile')}: philosophy.${point.id}`,
        message: 'missing Vietnamese text',
      });
  }

  // Rules 2–3: no orphan text keys — every key in either language must
  // correspond to an id present in structure (partial en coverage is allowed).
  const skillIds = new Set(structures.skills.map((g) => g.id));
  const experienceIds = new Set(structures.experience.map((e) => e.id));
  const projectIds = new Set(structures.projects.map((p) => p.id));
  const sectionIds = new Map(
    structures.projects.map((p) => [p.id, new Set(p.sections.map((s) => s.id))]),
  );
  const philosophyIds = new Set(structures.profile.philosophy.map((p) => p.id));

  const checkTextDoc = (doc: Partial<ContentVi> | ContentEn, lang: 'vi' | 'en') => {
    for (const id of Object.keys(doc.skills ?? {})) {
      if (!skillIds.has(id as never))
        issues.push({ path: `${textFile(lang, 'skills')}: ${id}`, message: 'orphan text key — no such skill group in structure' });
    }
    for (const id of Object.keys(doc.experience ?? {})) {
      if (!experienceIds.has(id as never))
        issues.push({ path: `${textFile(lang, 'experience')}: ${id}`, message: 'orphan text key — no such experience in structure' });
    }
    for (const [id, text] of Object.entries(doc.projects ?? {})) {
      if (!projectIds.has(id as never)) {
        issues.push({ path: `${textFile(lang, 'projects')}: ${id}`, message: 'orphan text key — no such project in structure' });
        continue;
      }
      const known = sectionIds.get(id as never)!;
      for (const sectionId of Object.keys(text.sections ?? {})) {
        if (!known.has(sectionId))
          issues.push({
            path: `${textFile(lang, 'projects')}: ${id}.sections.${sectionId}`,
            message: "orphan section text key — not in the project's structure",
          });
      }
    }
    for (const id of Object.keys(doc.profile?.philosophy ?? {})) {
      if (!philosophyIds.has(id as never))
        issues.push({ path: `${textFile(lang, 'profile')}: philosophy.${id}`, message: 'orphan text key — no such philosophy point' });
    }
  };
  checkTextDoc(vi, 'vi');
  checkTextDoc(en, 'en');

  // Rule 5: text values are plain text — no HTML markup in any content
  // document (after D9 nothing needs markup; §3.2 keeps rendering separate).
  // Rule 6: no empty text values in either language document. Every string
  // in a text document is a required field; the editor rejects an empty
  // commit with exactly this rule, and CI keeps an emptied field out of
  // master.
  for (const [lang, doc] of [['vi', vi], ['en', en]] as const) {
    for (const ns of ['profile', 'skills', 'experience', 'projects'] as const) {
      for (const path of findHtmlStrings(doc[ns], textFile(lang, ns))) {
        issues.push({ path, message: 'text value contains HTML markup' });
      }
      for (const path of findEmptyStrings(doc[ns], textFile(lang, ns))) {
        issues.push({ path, message: 'empty text value' });
      }
    }
  }

  return issues;
}

export function validateContent(
  structures: ContentStructures,
  vi: ContentVi,
  en: ContentEn,
): void {
  const issues = collectContentIssues(structures, vi, en);
  if (issues.length > 0) {
    const detail = issues.map((i) => `  ${i.path}: ${i.message}`).join('\n');
    throw new Error(`content validation failed (${issues.length} issue(s)):\n${detail}`);
  }
}

// --- page manifest rules (spec-v4-data-organization §5.1) ---------------------
// Manifests are developer-owned, language-neutral documents; these rules run
// at load and in CI, not per draft — an edit session never rewrites them.

const MANIFEST_IDS = [
  'home',
  'about',
  'experience',
  'projects',
  'project-detail',
  'contact',
  'philosophy',
  'resume',
] as const;

const TEXT_NAMESPACES: {
  ns: 'profile' | 'skills' | 'experience' | 'projects';
  entity: ContentEntityId;
}[] = [
  { ns: 'profile', entity: 'profile' },
  { ns: 'skills', entity: 'skillGroups' },
  { ns: 'experience', entity: 'experiences' },
  { ns: 'projects', entity: 'projects' },
];

function keyUnion(...objects: unknown[]): Set<string> {
  const keys = new Set<string>();
  for (const object of objects) {
    if (object && typeof object === 'object')
      for (const key of Object.keys(object)) keys.add(key);
  }
  return keys;
}

// The joined record keys of a record-keyed entity: structure row fields plus
// its text fields in either language.
function joinedRecordKeys(
  structureRows: { id: string }[],
  viText: unknown,
  enText: unknown,
): Set<string> {
  const viDoc = (viText ?? {}) as Record<string, Record<string, unknown>>;
  const enDoc = (enText ?? {}) as Record<string, Record<string, unknown>>;
  const all = new Set<string>();
  for (const row of structureRows) {
    const text = { ...(viDoc[row.id] ?? {}), ...(enDoc[row.id] ?? {}) };
    for (const key of keyUnion(row, text)) all.add(key);
  }
  return all;
}

// Walks every string leaf of a text document, returning document-relative
// paths — the same walk as findHtmlStrings, without the HTML filter.
function textLeafPaths(value: unknown, prefix: string): string[] {
  if (typeof value === 'string') return [prefix];
  if (Array.isArray(value))
    return value.flatMap((item, i) => textLeafPaths(item, `${prefix}[${i}]`));
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, item]) =>
      textLeafPaths(item, prefix ? `${prefix}.${key}` : key),
    );
  return [];
}

export function collectManifestIssues(
  structures: ContentStructures,
  vi: ContentVi,
  en: ContentEn,
  uiGroups: readonly string[],
): ContentIssue[] {
  const issues: ContentIssue[] = [];

  // Rule 1: exactly the seven route manifests plus the synthetic resume
  // consumer — no orphan or missing manifest.
  const ids: string[] = pageManifests.map((m) => m.id);
  for (const id of MANIFEST_IDS) {
    if (!ids.includes(id))
      issues.push({ path: 'src/data/pages/', message: `missing manifest for ${id}` });
  }
  for (const id of ids) {
    if (!(MANIFEST_IDS as readonly string[]).includes(id))
      issues.push({ path: `src/data/pages/${id}.json`, message: 'unknown manifest id' });
  }

  // Rule 2: every claimed entity is known and every field path resolves in
  // the joined records ("*" is always valid; "x.*" checks the parent key).
  const entityKeys: Record<ContentEntityId, Set<string>> = {
    profile: keyUnion(structures.profile, vi.profile, en.profile),
    skillGroups: joinedRecordKeys(structures.skills, vi.skills, en.skills),
    experiences: joinedRecordKeys(structures.experience, vi.experience, en.experience),
    projects: joinedRecordKeys(structures.projects, vi.projects, en.projects),
  };
  for (const manifest of pageManifests) {
    const file = `src/data/pages/${manifest.id}.json`;
    for (const claim of manifest.content) {
      const keys = entityKeys[claim.entity as ContentEntityId];
      if (!keys) {
        issues.push({ path: `${file}: ${claim.entity}`, message: 'unknown content entity' });
        continue;
      }
      for (const field of claim.fields) {
        if (field === '*') continue;
        const key = field.endsWith('.*') ? field.slice(0, -2) : field;
        if (!keys.has(key))
          issues.push({
            path: `${file}: ${claim.entity}.${field}`,
            message: 'field path does not resolve in the joined records',
          });
      }
    }
    // Rule 3: page-owned ui groups exist in the UI documents.
    for (const group of manifest.ui) {
      if (!uiGroups.includes(group))
        issues.push({ path: `${file}: ui.${group}`, message: 'unknown ui group' });
    }
  }

  // Rule 4 (no orphan fields): every text leaf in either language document
  // must be claimed by at least one manifest — adding a field without saying
  // where it appears fails the build, in the dangerous direction only.
  for (const [lang, doc] of [['vi', vi], ['en', en]] as const) {
    for (const { ns, entity } of TEXT_NAMESPACES) {
      for (const leaf of textLeafPaths(doc[ns], '')) {
        if (manifestsClaiming(entity, leaf).length === 0) {
          issues.push({
            path: `${textFile(lang, ns)}: ${leaf}`,
            message: 'text field claimed by no page manifest',
          });
        }
      }
    }
  }

  return issues;
}

export function validateManifests(
  structures: ContentStructures,
  vi: ContentVi,
  en: ContentEn,
  uiGroups: readonly string[],
): void {
  const issues = collectManifestIssues(structures, vi, en, uiGroups);
  if (issues.length > 0) {
    const detail = issues.map((i) => `  ${i.path}: ${i.message}`).join('\n');
    throw new Error(`manifest validation failed (${issues.length} issue(s)):\n${detail}`);
  }
}
