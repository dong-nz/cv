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
  | 'logistics-technology'
  | 'ai-ml'
  | 'infrastructure'
  | 'engineering-practices';

export type PhilosophyId =
  | 'build-for-the-real-problem'
  | 'think-in-systems'
  | 'measure-impact'
  | 'keep-learning'
  | 'business-domain-knowledge-is-a-key-of-success';
