export type Language = 'en' | 'vi';

export type Palette = 'red' | 'blue';

export type SocialId = 'github' | 'linkedin' | 'email' | 'telegram';

// Content ids and the category values a project uses are generated from the
// structure documents by scripts/generate-content-types.ts (spec-v5): the union
// is exactly the document, so a record delete cannot leave a stale member and a
// text entry for it is a tsc error. Type-only re-export — erased at emit, no
// runtime import.
export type {
  ExperienceId,
  PhilosophyId,
  ProjectCategory,
  ProjectId,
  SkillGroupId,
} from './content-ids';

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
  | 'philosophy'
  | 'how-it-works';

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
