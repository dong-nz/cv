// Cross-document consistency rules (spec-v4 §3.6) — what types cannot express
// across two JSON files. Runs at load (dev), in CI (`scripts/validate-content.ts`),
// and in the browser before save (edit mode, Phase 3).
//
// tsc already guarantees each document individually satisfies its declared type
// and that `content.vi.json` covers every union id; this module enforces the
// relationships BETWEEN documents and reports exact document paths so a content
// edit can be fixed in the JSON panel.
import type {
  ContentEn,
  ContentVi,
  ExperienceStructure,
  ProfileStructure,
  ProjectStructure,
  SkillGroupStructure,
} from './dict-types';

export type ContentIssue = { path: string; message: string };

export type ContentStructures = {
  profile: ProfileStructure;
  skills: SkillGroupStructure[];
  experience: ExperienceStructure[];
  projects: ProjectStructure[];
};

const hasHtml = (value: string) => value.includes('<') || value.includes('>');

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
      issues.push({ path: `content.vi.json: skills.${group.id}`, message: 'missing Vietnamese text' });
  }
  for (const entry of structures.experience) {
    if (!vi.experience[entry.id])
      issues.push({ path: `content.vi.json: experience.${entry.id}`, message: 'missing Vietnamese text' });
  }
  for (const project of structures.projects) {
    const text = vi.projects[project.id];
    if (!text) {
      issues.push({ path: `content.vi.json: projects.${project.id}`, message: 'missing Vietnamese text' });
      continue;
    }
    for (const section of project.sections) {
      if (!text.sections[section.id])
        issues.push({
          path: `content.vi.json: projects.${project.id}.sections.${section.id}`,
          message: 'missing Vietnamese text for section',
        });
    }
  }
  for (const point of structures.profile.philosophy) {
    if (!vi.profile.philosophy[point.id])
      issues.push({
        path: `content.vi.json: profile.philosophy.${point.id}`,
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
    const file = `content.${lang}.json`;
    for (const id of Object.keys(doc.skills ?? {})) {
      if (!skillIds.has(id as never))
        issues.push({ path: `${file}: skills.${id}`, message: 'orphan text key — no such skill group in structure' });
    }
    for (const id of Object.keys(doc.experience ?? {})) {
      if (!experienceIds.has(id as never))
        issues.push({ path: `${file}: experience.${id}`, message: 'orphan text key — no such experience in structure' });
    }
    for (const [id, text] of Object.entries(doc.projects ?? {})) {
      if (!projectIds.has(id as never)) {
        issues.push({ path: `${file}: projects.${id}`, message: 'orphan text key — no such project in structure' });
        continue;
      }
      const known = sectionIds.get(id as never)!;
      for (const sectionId of Object.keys(text.sections ?? {})) {
        if (!known.has(sectionId))
          issues.push({
            path: `${file}: projects.${id}.sections.${sectionId}`,
            message: "orphan section text key — not in the project's structure",
          });
      }
    }
    for (const id of Object.keys(doc.profile?.philosophy ?? {})) {
      if (!philosophyIds.has(id as never))
        issues.push({ path: `${file}: profile.philosophy.${id}`, message: 'orphan text key — no such philosophy point' });
    }
  };
  checkTextDoc(vi, 'vi');
  checkTextDoc(en, 'en');

  // Rule 5: text values are plain text — no HTML markup in any content
  // document (after D9 nothing needs markup; §3.2 keeps rendering separate).
  for (const [lang, doc] of [['vi', vi], ['en', en]] as const) {
    for (const path of findHtmlStrings(doc, `content.${lang}.json`)) {
      issues.push({ path, message: 'text value contains HTML markup' });
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
