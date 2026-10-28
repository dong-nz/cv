// The i18n loader (spec-v4 §3.4): load + validate + join ONCE at module load.
// Components and scripts consume the exported UI / CONTENT and never join
// structure and text by id themselves.
import { experiences } from '../data/experience';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { skillGroups } from '../data/skills';
import profileViJson from './locales/vi/content/profile.json';
import skillsViJson from './locales/vi/content/skills.json';
import experienceViJson from './locales/vi/content/experience.json';
import projectsViJson from './locales/vi/content/projects.json';
import profileEnJson from './locales/en/content/profile.json';
import skillsEnJson from './locales/en/content/skills.json';
import experienceEnJson from './locales/en/content/experience.json';
import projectsEnJson from './locales/en/content/projects.json';
import uiNavViJson from './locales/vi/ui/navigation.json';
import uiSocialViJson from './locales/vi/ui/social.json';
import uiFooterViJson from './locales/vi/ui/footer.json';
import uiHeroViJson from './locales/vi/ui/hero.json';
import uiAboutViJson from './locales/vi/ui/about.json';
import uiExpertiseViJson from './locales/vi/ui/expertise.json';
import uiExperienceViJson from './locales/vi/ui/experience.json';
import uiProjectsViJson from './locales/vi/ui/projects.json';
import uiContactViJson from './locales/vi/ui/contact.json';
import uiProjectDetailViJson from './locales/vi/ui/project-detail.json';
import uiPhilosophyViJson from './locales/vi/ui/philosophy.json';
import uiHowItWorksViJson from './locales/vi/ui/how-it-works.json';
import uiCommonViJson from './locales/vi/ui/common.json';
import uiResumeViJson from './locales/vi/ui/resume.json';
import uiEditViJson from './locales/vi/ui/edit.json';
import uiNavEnJson from './locales/en/ui/navigation.json';
import uiSocialEnJson from './locales/en/ui/social.json';
import uiFooterEnJson from './locales/en/ui/footer.json';
import uiHeroEnJson from './locales/en/ui/hero.json';
import uiAboutEnJson from './locales/en/ui/about.json';
import uiExpertiseEnJson from './locales/en/ui/expertise.json';
import uiExperienceEnJson from './locales/en/ui/experience.json';
import uiProjectsEnJson from './locales/en/ui/projects.json';
import uiContactEnJson from './locales/en/ui/contact.json';
import uiProjectDetailEnJson from './locales/en/ui/project-detail.json';
import uiPhilosophyEnJson from './locales/en/ui/philosophy.json';
import uiHowItWorksEnJson from './locales/en/ui/how-it-works.json';
import uiCommonEnJson from './locales/en/ui/common.json';
import uiResumeEnJson from './locales/en/ui/resume.json';
import uiEditEnJson from './locales/en/ui/edit.json';
import type {
  ContentEn,
  ContentVi,
  ExperienceStructure,
  ExperienceText,
  ProfileStructure,
  ProfileText,
  ProjectSectionStructure,
  ProjectStructure,
  ProjectText,
  SectionText,
  SkillGroupStructure,
  SkillGroupText,
  UIDict,
} from './dict-types';
import type { Language, PhilosophyId } from '../types/index';
import { validateContent, validateManifests } from './validate';
import type { ContentStructures } from './validate';

// The per-entity text files merge back into the same ContentVi/ContentEn
// records every consumer reads (spec-v4-data-organization §3); key order is
// the record shape, unchanged from the single-file layout. Each file is
// checked against its slice type by these annotations.
const contentVi: ContentVi = {
  profile: profileViJson,
  skills: skillsViJson,
  experience: experienceViJson,
  projects: projectsViJson,
};
const contentEn: ContentEn = {
  profile: profileEnJson,
  skills: skillsEnJson,
  experience: experienceEnJson,
  projects: projectsEnJson,
};

// Feature-group UI files merge into the same UIDict record (§4); the key
// order matches the old ui.json namespaces exactly.
const uiVi: UIDict = {
  nav: uiNavViJson,
  social: uiSocialViJson,
  footer: uiFooterViJson,
  hero: uiHeroViJson,
  about: uiAboutViJson,
  expertise: uiExpertiseViJson,
  experience: uiExperienceViJson,
  projects: uiProjectsViJson,
  contact: uiContactViJson,
  projectDetail: uiProjectDetailViJson,
  philosophy: uiPhilosophyViJson,
  howItWorks: uiHowItWorksViJson,
  common: uiCommonViJson,
  resume: uiResumeViJson,
  edit: uiEditViJson,
};
// tsc enforces en completeness against the Vietnamese tree (§3.3).
const uiEn: UIDict = {
  nav: uiNavEnJson,
  social: uiSocialEnJson,
  footer: uiFooterEnJson,
  hero: uiHeroEnJson,
  about: uiAboutEnJson,
  expertise: uiExpertiseEnJson,
  experience: uiExperienceEnJson,
  projects: uiProjectsEnJson,
  contact: uiContactEnJson,
  projectDetail: uiProjectDetailEnJson,
  philosophy: uiPhilosophyEnJson,
  howItWorks: uiHowItWorksEnJson,
  common: uiCommonEnJson,
  resume: uiResumeEnJson,
  edit: uiEditEnJson,
};

const structures = {
  profile,
  skills: skillGroups,
  experience: experiences,
  projects,
};

// Cross-document rules run at module load: a malformed content document fails
// the build here, in CI, and in the browser — never silently half-renders.
// Rule 7 reads the category labels straight out of the UI tree built above.
validateContent(structures, contentVi, contentEn, {
  vi: uiVi.projects.categories,
  en: uiEn.projects.categories,
});

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
export type ResolvedProject = Omit<ProjectStructure, 'sections'> &
  Pick<ProjectText, 'title' | 'summary' | 'role' | 'metrics'> & {
    sections: ResolvedProjectSection[];
  };
export type ResolvedExperienceEntry = ExperienceStructure & ExperienceText;
export type ResolvedSkillGroup = SkillGroupStructure & SkillGroupText;
// Structure carries philosophy as the ordered id array, text as a Record
// keyed by id — the join merges them back into one ordered array.
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
        role: text_.role,
        metrics: text_.metrics,
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

// The manifest rules (spec-v4-data-organization §5.1) run at the same point
// as the content rules: a manifest that claims a field no page renders, or
// a text field no manifest claims, fails the build — not a silent hole in
// EditBar's provenance.
validateManifests(structures, contentVi, contentEn, Object.keys(uiVi));
