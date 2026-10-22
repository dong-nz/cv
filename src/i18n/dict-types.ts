// Document types for the content and UI JSON (spec-v4 §3.2–§3.3).
// Structure documents are language-neutral; text documents are per language.
// Authoring invariants that JSON cannot carry as comments live here and in the
// loaders.
import type {
  ExperienceId,
  PhilosophyId,
  ProjectCategory,
  ProjectId,
  SkillGroupId,
} from '../types/index';
import uiViJson from './locales/vi/ui.json';

// --- structure (src/data/*.json) ---

export type ProjectSectionStructure = {
  id: string;
  type: 'text' | 'diagram' | 'metrics' | 'code';
};

export type ProjectStructure = {
  id: ProjectId;
  category: ProjectCategory;
  technologies: string[];
  featured: boolean;
  sections: ProjectSectionStructure[];
};

// Only language-neutral fields stay: location is a proper noun, `variant` and
// `logo` are decoration switches. Company and duration are display strings and
// therefore text (row 19) — the timeline renders them per language.
export type ExperienceStructure = {
  id: ExperienceId;
  location?: string;
  variant?: 'current' | 'gap';
  logo?: string;
};

export type SkillGroupStructure = { id: SkillGroupId; skills: string[] };

export type ProfileStructure = {
  firstName: string;
  lastName: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  githubHandle: string;
  linkedinHandle: string;
  telegramUrl: string;
  telegramHandle: string;
  // The display name is localized (D6) and therefore lives in the text
  // documents, never here; only the language-neutral name parts stay.
  // Philosophy keeps only the ordered ids — keywords are display text (row 19).
  philosophy: Array<{ id: PhilosophyId }>;
};

// --- text (src/i18n/locales/{vi,en}/content.json) ---

// Plain-text segments; markup is a rendering concern (D9), never content.
export type TaglineSegment = { text: string; emphasis?: boolean };

export type SectionText = { title: string; content: string };

// Section keys are validated against each project's structure array by the
// validator (§3.6) — section ids collide across projects, so there is no
// global SectionId union (§3.1).
export type ProjectText = {
  title: string;
  summary: string;
  role: string;
  metrics?: string[];
  sections: Record<string, SectionText>;
};

export type ExperienceText = {
  title: string;
  company: string;
  duration: string;
  responsibilities: string[];
};

export type SkillGroupText = { title: string };

export type ProfileText = {
  name: string;
  title: string;
  bio: string;
  // Row 18: the /about heading subtitle, the timeline TL;DR line, and the
  // philosophy essays are person text, not chrome — they moved out of ui.json
  // so edit mode can edit them like any other content.
  subtitle: string;
  tldr: string;
  tagline: TaglineSegment[];
  // Row 19: tag lists are display text. Term lists (interests, roles) follow
  // the technologies/skills convention — EN-only until the owner translates
  // them in the text document; the field is now localizable per language.
  currentInterests: string[];
  roles: string[];
  philosophyQuotes: Array<{ title: string; details: string[] }>;
  philosophy: Record<
    PhilosophyId,
    { title: string; description: string; keywords: string[] }
  >;
};

export type ContentVi = {
  profile: ProfileText;
  skills: Record<SkillGroupId, SkillGroupText>;
  experience: Record<ExperienceId, ExperienceText>;
  projects: Record<ProjectId, ProjectText>;
};

// Defined here — PartialDeep is NOT a TypeScript builtin.
// Objects: every key optional + recursed. Arrays: atomic (whole-array
// fallback, never per-item).
type PartialDeep<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: PartialDeep<T[K]> }
    : T;

export type ContentEn = { [K in keyof ContentVi]?: PartialDeep<ContentVi[K]> };

// --- UI (src/i18n/locales/{vi,en}/ui.json) ---

// Derived from the complete Vietnamese tree; the en import is checked against
// this type in index.ts — both files are complete by construction (§3.3).
export type UIDict = typeof uiViJson;
