export type Language = 'en' | 'vi';

export type Palette = 'red' | 'blue';

export type SocialId = 'github' | 'linkedin' | 'email' | 'telegram';

export type ProjectCategory =
  | "software-engineering"
  | "logistics"
  | "ai-ml"
  | "computer-vision"
  | "architecture"
  | "experiment";

// Stable id unions (spec-v4 §3.1). Text dictionaries are type-safe only against
// closed unions: adding a content item means adding a union member, a structure
// record, and its Vietnamese text — tsc catches a missing text entry, the
// validator (src/i18n/validate.ts) catches id mismatches across documents.
// SkillGroupId and PhilosophyId are internal keys and never appear in URLs.
export type ProjectId =
  | 'iot-dws-integration'
  | 'awb-detection'
  | 'facility-management'
  | 'local-llm-experiments';

export type ExperienceId =
  | 'open-to-work'
  | 'relax-gap'
  | 'lazada-senior-swe'
  | 'nexts-founder'
  | 'sap-senior-swe';

export type SkillGroupId =
  | 'software-engineering'
  | 'system-architecture'
  | 'ai-ml'
  | 'infrastructure'
  | 'engineering-practices';

export type PhilosophyId =
  | 'build-for-the-real-problem'
  | 'think-in-systems'
  | 'measure-impact'
  | 'keep-learning'
  | 'business-domain-knowledge-is-a-key-of-success';

// Page manifests (spec-v4-data-organization §5): one per route plus the
// synthetic resume consumer. A manifest claims which joined records a page
// reads — provenance for EditBar grouping and the orphan-field rule.
export type PageId =
  | 'home'
  | 'about'
  | 'experience'
  | 'projects'
  | 'project-detail'
  | 'contact'
  | 'philosophy';

export type ManifestId = PageId | 'resume';

// Entity ids join the structure document, the text documents, and the
// manifest claims (§3 table).
export type ContentEntityId = 'profile' | 'skillGroups' | 'experiences' | 'projects';

export type PageManifestClaim = {
  entity: ContentEntityId;
  // Paths into the joined records; "*" claims the whole entity. Record-level
  // fields are named record-relative ("summary"); "sections.*" claims every
  // sub-field of the sections record.
  fields: string[];
};

export type PageManifest = {
  id: ManifestId;
  // null for the synthetic resume consumer — it has no route.
  route: string | null;
  content: PageManifestClaim[];
  // Page-owned UI groups only; component-owned groups are never repeated
  // (§4 ownership table).
  ui: string[];
};
