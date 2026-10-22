// The i18n loader (spec-v4 §3.4): load + validate + join ONCE at module load.
// Components and scripts consume the exported UI / CONTENT and never join
// structure and text by id themselves.
import { experiences } from '../data/experience';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { skillGroups } from '../data/skills';
import contentEnJson from './locales/en/content.json';
import contentViJson from './locales/vi/content.json';
import uiEnJson from './locales/en/ui.json';
import uiViJson from './locales/vi/ui.json';
import type {
  ContentEn,
  ContentVi,
  ExperienceStructure,
  ExperienceText,
  ProfileStructure,
  ProfileText,
  ProjectSectionStructure,
  ProjectStructure,
  SectionText,
  SkillGroupStructure,
  SkillGroupText,
  UIDict,
} from './dict-types';
import type { Language, PhilosophyId } from '../types/index';
import { validateContent } from './validate';
import type { ContentStructures } from './validate';

const uiVi: UIDict = uiViJson;
// tsc enforces en completeness against the derived Vietnamese tree (§3.3).
const uiEn: UIDict = uiEnJson;

const contentVi: ContentVi = contentViJson;
const contentEn: ContentEn = contentEnJson;

const structures = {
  profile,
  skills: skillGroups,
  experience: experiences,
  projects,
};

// Cross-document rules run at module load: a malformed content document fails
// the build here, in CI, and in the browser — never silently half-renders.
validateContent(structures, contentVi, contentEn);

// Missing en fields fall back to vi per field; arrays are atomic — a whole
// array is replaced or inherited, never merged item by item (§3.2).
function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === undefined) return base;
  if (
    Array.isArray(base) ||
    Array.isArray(patch) ||
    typeof base !== 'object' ||
    base === null ||
    typeof patch !== 'object' ||
    patch === null
  ) {
    return patch as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    out[key] = deepMerge(out[key], value);
  }
  return out as T;
}

export const UI: Record<Language, UIDict> = { vi: uiVi, en: uiEn };

// Resolved records: structure joined with text. These are the shapes every
// component consumes.
export type ResolvedProjectSection = ProjectSectionStructure & SectionText;
export type ResolvedProject = Omit<ProjectStructure, 'sections'> & {
  title: string;
  summary: string;
  sections: ResolvedProjectSection[];
};
export type ResolvedExperienceEntry = ExperienceStructure & ExperienceText;
export type ResolvedSkillGroup = SkillGroupStructure & SkillGroupText;
// Structure carries philosophy as an ordered {id, keywords} array, text as a
// Record keyed by id — the join merges them back into one ordered array.
export type ResolvedPhilosophyPoint = {
  id: PhilosophyId;
  keywords: string[];
  title: string;
  description: string;
};
export type ResolvedProfile = Omit<ProfileStructure, 'philosophy'> &
  Omit<ProfileText, 'philosophy'> & { philosophy: ResolvedPhilosophyPoint[] };

export type ResolvedContent = {
  profile: ResolvedProfile;
  skillGroups: ResolvedSkillGroup[];
  experiences: ResolvedExperienceEntry[];
  projects: ResolvedProject[];
};

function joinContent(structures: ContentStructures, text: ContentVi): ResolvedContent {
  return {
    profile: {
      ...structures.profile,
      ...text.profile,
      philosophy: structures.profile.philosophy.map((point) => ({
        ...point,
        ...text.profile.philosophy[point.id],
      })),
    },
    skillGroups: structures.skills.map((group) => ({
      ...group,
      ...text.skills[group.id],
    })),
    experiences: structures.experience.map((entry) => ({
      ...entry,
      ...text.experience[entry.id],
    })),
    projects: structures.projects.map((project) => {
      const text_ = text.projects[project.id];
      return {
        ...project,
        title: text_.title,
        summary: text_.summary,
        sections: project.sections.map((section) => ({
          ...section,
          ...text_.sections[section.id],
        })),
      };
    }),
  };
}

// Resolve one pair of text documents against one set of structure documents.
// The Phase 1 constant below is the bundled answer; the edit-mode draft store
// (src/i18n/draft.ts) calls this on every accepted edit to rebuild the
// provider override — same join, same fallback rules, draft documents in.
export function resolveContent(
  structures: ContentStructures,
  vi: ContentVi,
  en: ContentEn,
): Record<Language, ResolvedContent> {
  const mergedEn: ContentVi = deepMerge(vi, en);
  return { vi: joinContent(structures, vi), en: joinContent(structures, mergedEn) };
}

export const CONTENT: Record<Language, ResolvedContent> = resolveContent(
  structures,
  contentVi,
  contentEn,
);
