// The edit-mode context (spec-v4 §5.3, spec-v4-inline-editing E4): the API
// EditModeShell hands to every editing consumer. Lives on its own so
// component files stay pure components (react/only-export-components).
import { createContext, useContext } from 'react';
import type { ContentIssue } from '@/i18n/validate';
import type {
  ConflictField,
  DraftDocId,
  FieldInfo,
  RecordIds,
  RecordKind,
} from '@/i18n/draft';

// commit/apply/revert return the validator issues when the candidate draft is
// invalid (the change was NOT applied), or null when it was accepted.
//
// Two path conventions (spec-v4-data-organization §3): a TEXT path carries
// its entity as the first segment (`projects.lazada.summary`) and the store
// resolves the entity document of the language being edited; a STRUCTURE path
// is always given together with the structure document id and is relative to
// that document (`summary` inside 'projects').
export type EditApi = {
  // Text fields: the target document is derived from the path + language.
  commit: (path: string, value: string) => ContentIssue[] | null;
  describeText: (path: string) => FieldInfo;
  isTextDirty: (path: string) => boolean;
  // Write any value at a text path — a leaf, a tag array, a segment object
  // (E1/E5). deleteText/moveText cover removal and order.
  setText: (path: string, value: unknown) => ContentIssue[] | null;
  deleteText: (path: string) => ContentIssue[] | null;
  moveText: (path: string, from: number, to: number) => ContentIssue[] | null;
  // Structure documents: explicit doc id, document-relative paths.
  describe: (doc: DraftDocId, path: string) => FieldInfo;
  apply: (doc: DraftDocId, next: unknown) => ContentIssue[] | null;
  dataOf: (doc: DraftDocId) => unknown;
  // Structure fields (E4): set or delete one value at a concrete path.
  setStructured: (doc: DraftDocId, path: string, value: unknown) => ContentIssue[] | null;
  deleteStructured: (doc: DraftDocId, path: string) => ContentIssue[] | null;
  isPathDirtyIn: (doc: DraftDocId, path: string) => boolean;
  // One primitive for every structure order question (E5): record order
  // (document root array) and tag order (array field) are the same move.
  moveItem: (doc: DraftDocId, path: string, from: number, to: number) => ContentIssue[] | null;
  // Records (E2/E3): structure record + text entries move as one action.
  addRecord: (kind: RecordKind, options?: { projectId?: string }) => ContentIssue[] | null;
  deleteRecord: (kind: RecordKind, ids: RecordIds) => ContentIssue[] | null;
  // A draft-only record's id follows its title; a saved record's id is fixed.
  isCreated: (kind: RecordKind, ids: RecordIds) => boolean;
  renameRecord: (kind: RecordKind, ids: RecordIds, rawId: string) => ContentIssue[] | null;
  // Conflicts, field by field (E8).
  conflictFields: (doc: DraftDocId) => ConflictField[];
  resolveConflictField: (doc: DraftDocId, path: string, side: 'mine' | 'theirs') => ContentIssue[] | null;
};

// Without a provider (every visitor request, every page outside edit mode)
// the context is null and every editing affordance is absent.
export const EditContext = createContext<EditApi | null>(null);

export function useEdit(): EditApi | null {
  return useContext(EditContext);
}
