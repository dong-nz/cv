// Which draft documents a route needs (spec-v4-live-edit §5.1). The answer
// comes from the page manifests, never from component code: a manifest names
// the joined records its page renders, and an entity owns its structure
// document plus its per-language text documents. Those are fetched as one unit
// — a half-loaded entity would make the cross-document validator compare a live
// document against a bundled one.
import { pageManifests, recordEntity } from '../data/pages';
import { DRAFT_DOCS, TEXT_ENTITIES, entityOfDoc } from './draft';
import type { DraftDocId, DraftDocMeta, TextEntity } from './draft';
import type { ContentEntityId, PageManifest } from '../types/index';

// Manifest entity names are the joined-record names (`skillGroups`); the
// document registry names files (`skills`). pages.ts owns one direction, this
// inverts it rather than stating a second mapping.
const DOC_ENTITY = Object.fromEntries(
  TEXT_ENTITIES.map((textEntity) => [recordEntity(textEntity), textEntity]),
) as Record<ContentEntityId, TextEntity>;

// Manifest routes are the router's own strings. `/projects/:id` is the only
// pattern; the synthetic `resume` consumer has no route and never matches a
// location. A trailing slash is the same page to the router, so it is removed
// before matching (`/` stays `/`).
export function manifestForPath(pathname: string): PageManifest | null {
  const path = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
  for (const manifest of pageManifests) {
    const route = manifest.route;
    if (!route) continue;
    if (route.endsWith('/:id')) {
      const prefix = route.slice(0, -'/:id'.length);
      if (path.startsWith(`${prefix}/`) && path.length > prefix.length + 1) return manifest;
    } else if (path === route) {
      return manifest;
    }
  }
  return null;
}

export type EditScope = {
  // Registry order, so a caller can zip it against DRAFT_DOCS.
  docs: DraftDocId[];
  // Rule 7 (a project's category against the branch's labels) is only reachable
  // where a project renders, so the two label documents follow the projects
  // scope instead of riding along on every route.
  needsLabels: boolean;
};

// A route no manifest describes renders nothing editable — an empty scope is
// the honest answer, and a later navigation to a real route fetches what it
// needs.
export function scopeForPath(pathname: string): EditScope {
  const manifest = manifestForPath(pathname);
  const entities = new Set<TextEntity>();
  if (manifest) {
    for (const claim of manifest.content) entities.add(DOC_ENTITY[claim.entity]);
  }
  const docs = DRAFT_DOCS.filter((meta) => {
    const entity = entityOfDoc(meta.id);
    return entity !== null && entities.has(entity);
  });
  return {
    docs: docs.map((meta) => meta.id),
    needsLabels: entities.has('projects'),
  };
}

// The registry entries for a scope, in registry order.
export function metasForDocs(ids: readonly DraftDocId[]): DraftDocMeta[] {
  const wanted = new Set(ids);
  return DRAFT_DOCS.filter((meta) => wanted.has(meta.id));
}
