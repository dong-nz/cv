// Typed loader for the page manifests (spec-v4-data-organization §5): which
// joined records and which page-owned UI groups each page consumes.
// Manifests are language-neutral, part of validation, and read-only in the
// app — they exist for provenance (EditBar grouping, orphan-field rule) and
// for the edit-mode fetch scope (spec-v4-live-edit §5.1), never for rendering.
// A manifest describes the whole page, chrome included: the footer renders
// `profile.name` on every route, so every manifest claims it.
import aboutJson from './pages/about.json';
import contactJson from './pages/contact.json';
import experienceJson from './pages/experience.json';
import homeJson from './pages/home.json';
import philosophyJson from './pages/philosophy.json';
import projectDetailJson from './pages/project-detail.json';
import projectsJson from './pages/projects.json';
import resumeJson from './pages/resume.json';
import type { ContentEntityId, PageManifest, PageManifestClaim } from '../types/index';

export const pageManifests: PageManifest[] = [
  homeJson,
  aboutJson,
  experienceJson,
  projectsJson,
  projectDetailJson,
  contactJson,
  philosophyJson,
  resumeJson,
] as PageManifest[];

// Record-keyed text documents (and array structure documents) carry the
// record as their first path segment; a claim names the record-relative
// field ("summary", "sections.*"). The profile documents name fields
// directly.
function claimMatches(claim: string, relPath: string): boolean {
  if (claim === '*') return true;
  if (claim.endsWith('.*')) return relPath.startsWith(claim.slice(0, -2) + '.');
  return (
    relPath === claim || relPath.startsWith(claim + '.') || relPath.startsWith(claim + '[')
  );
}

// Does this manifest claim this document-relative path?
export function manifestClaimsPath(
  manifest: PageManifest,
  entity: ContentEntityId,
  relPath: string,
): boolean {
  const candidate =
    entity === 'profile'
      ? relPath
      : relPath.includes('.')
        ? relPath.slice(relPath.indexOf('.') + 1)
        : '';
  return manifest.content.some(
    (claim: PageManifestClaim) =>
      claim.entity === entity && claim.fields.some((field) => claimMatches(field, candidate)),
  );
}

// The manifests that claim a path — EditBar's "appears on" annotation
// (§6.3), computed from the manifests, never from component code.
export function manifestsClaiming(
  entity: ContentEntityId,
  relPath: string,
): PageManifest[] {
  return pageManifests.filter((m) => manifestClaimsPath(m, entity, relPath));
}

// Draft path prefixes (`skills`, `experience`) name the text file; the §3
// entity ids name the joined record (`skillGroups`, `experiences`). Manifest
// claims and EditBar grouping work on the record ids.
export function recordEntity(
  textEntity: 'profile' | 'skills' | 'experience' | 'projects',
): ContentEntityId {
  if (textEntity === 'skills') return 'skillGroups';
  if (textEntity === 'experience') return 'experiences';
  return textEntity;
}
