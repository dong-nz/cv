// EditBar (spec-v4 §5.5, spec-v4-inline-editing E8): the fixed status bar of
// edit mode. It lists every changed path grouped by document with before →
// after and a per-path revert, reports save progress (written / conflict /
// failed), partial-save resume, validation issues, and guards Exit with a
// confirm when changes are unsaved. Conflicts are resolved field by field:
// keep mine / keep theirs per clashing path, with rebase and take-theirs as
// the whole-document operations.
import { useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { DRAFT_DOCS, entityOfDoc } from '@/i18n/draft';
import { manifestsClaiming, recordEntity } from '@/data/pages';
import { DEFAULT_BRANCH } from '@/i18n/edit-mode';
import type { ConflictField, DocSaveResult, DraftDocId } from '@/i18n/draft';
import type { ContentIssue } from '@/i18n/validate';

type ChangedDoc = { id: DraftDocId; paths: { path: string; before: unknown; after: unknown }[] };

type EditBarProps = {
  offline: boolean;
  dirty: boolean;
  changedDocs: ChangedDoc[];
  conflicts: DraftDocId[];
  issues: ContentIssue[];
  saving: boolean;
  saveStopped: boolean;
  saveResults: DocSaveResult[];
  unionNote: 'ok' | 'failed' | null;
  draftRestored: boolean;
  branch: string;
  getConflictFields: (id: DraftDocId) => ConflictField[];
  onSave: () => void;
  onExit: () => void;
  onRebase: (id: DraftDocId) => void;
  onTakeTheirs: (id: DraftDocId) => void;
  onResolveField: (id: DraftDocId, path: string, side: 'mine' | 'theirs') => void;
  onDiscardDoc: (id: DraftDocId) => void;
  onRevertPath: (id: DraftDocId, path: string) => void;
};

function fileOf(id: DraftDocId): string {
  return DRAFT_DOCS.find((d) => d.id === id)!.file;
}

// Diff values are shown truncated; the full value stays in the document.
function truncate(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value) ?? '';
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

export function EditBar({
  offline,
  dirty,
  changedDocs,
  conflicts,
  issues,
  saving,
  saveStopped,
  saveResults,
  unionNote,
  draftRestored,
  branch,
  getConflictFields,
  onSave,
  onExit,
  onRebase,
  onTakeTheirs,
  onResolveField,
  onDiscardDoc,
  onRevertPath,
}: EditBarProps) {
  const { ui } = useI18n();
  const s = ui.edit;
  const [showDiff, setShowDiff] = useState(false);
  const [openFields, setOpenFields] = useState<Set<DraftDocId>>(new Set());

  const allWritten =
    saveResults.length > 0 && !saveStopped && saveResults.every((r) => r.status === 'written');
  const statusLabel = (result: DocSaveResult) =>
    result.status === 'written'
      ? s.written
      : result.status === 'conflict'
        ? s.conflictStatus
        : `${s.failed} (${result.http ?? 0})`;

  // "appears on" annotation (spec-v4-data-organization §6.3): the pages whose
  // manifest claims this document-relative path — grouping is computed from
  // the manifests, never from component code.
  const appearsOn = (docId: DraftDocId, path: string): string | null => {
    const entity = entityOfDoc(docId);
    if (!entity) return null;
    const pages = manifestsClaiming(recordEntity(entity), path);
    if (pages.length === 0) return null;
    return pages
      .map((m) => (m.id === 'resume' ? s.appearsResume : m.id === 'home' ? s.appearsHome : m.route))
      .join(', ');
  };

  return (
    <footer className="edit-bar" aria-label={s.title}>
      <div className="edit-bar-row">
        <strong className="edit-bar-title">{s.title}</strong>
        <span className="edit-bar-count" role="status">
          {dirty ? `${changedDocs.reduce((n, d) => n + d.paths.length, 0)} ${s.changes}` : s.noChanges}
        </span>
        <span className="edit-bar-branch">
          {s.branchLabel} <code>{branch}</code>
        </span>
        {offline && <span className="edit-bar-warn">{s.offline}</span>}
        {draftRestored && !dirty && <span className="edit-bar-warn">{s.draftRestored}</span>}
        <div className="edit-bar-actions">
          <button
            type="button"
            className="edit-btn"
            aria-expanded={showDiff}
            onClick={() => setShowDiff((v) => !v)}
          >
            {s.changesTitle}
          </button>
          <button
            type="button"
            className="edit-btn edit-btn-primary"
            disabled={!dirty || saving || offline}
            onClick={onSave}
          >
            {saving ? s.saving : s.save}
          </button>
          {saveStopped && (
            <button type="button" className="edit-btn edit-btn-primary" disabled={saving} onClick={onSave}>
              {s.resume}
            </button>
          )}
          <button
            type="button"
            className="edit-btn"
            onClick={() => {
              if (!dirty || window.confirm(s.exitConfirm)) onExit();
            }}
          >
            {s.exit}
          </button>
        </div>
      </div>

      {showDiff && changedDocs.length > 0 && (
        <div className="edit-bar-diff">
          {changedDocs.map((doc) => (
            <div key={doc.id} className="edit-bar-doc">
              <div className="edit-bar-doc-head">
                <code>{fileOf(doc.id)}</code>
                <button type="button" className="edit-btn" onClick={() => onDiscardDoc(doc.id)}>
                  {s.discardDoc}
                </button>
              </div>
              <ul>
                {doc.paths.map((p) => {
                  const appears = appearsOn(doc.id, p.path);
                  return (
                    <li key={p.path}>
                      <code className="edit-bar-path">{p.path}</code>
                      <span className="edit-bar-value">{truncate(p.before)}</span>
                      <span aria-hidden="true">→</span>
                      <span className="edit-bar-value">{truncate(p.after)}</span>
                      {appears && (
                        <span className="edit-bar-appears">
                          {s.appearsOn}: {appears}
                        </span>
                      )}
                      <button type="button" className="edit-btn" onClick={() => onRevertPath(doc.id, p.path)}>
                        {s.revert}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="edit-bar-conflicts">
          <strong>{s.conflicts}</strong>
          {conflicts.map((id) => (
            <div key={id} className="edit-bar-conflict">
              <code>{fileOf(id)}</code> {s.conflictDetail}{' '}
              <button type="button" className="edit-btn" onClick={() => onRebase(id)}>
                {s.rebase}
              </button>
              <button type="button" className="edit-btn" onClick={() => onTakeTheirs(id)}>
                {s.takeTheirs}
              </button>
              <button
                type="button"
                className="edit-btn"
                aria-expanded={openFields.has(id)}
                onClick={() =>
                  setOpenFields((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
              >
                {s.conflictFields}
              </button>
              {openFields.has(id) && (
                <ul className="edit-bar-conflict-fields">
                  {getConflictFields(id).map((f) => (
                    <li key={f.path}>
                      <code className="edit-bar-path">{f.path}</code>
                      <span className="edit-bar-conflict-side">{s.yours}</span>
                      <span className="edit-bar-value">{truncate(f.mine)}</span>
                      <span className="edit-bar-conflict-side">{s.theirs}</span>
                      <span className="edit-bar-value">{truncate(f.theirs)}</span>
                      <button type="button" className="edit-btn" onClick={() => onResolveField(id, f.path, 'mine')}>
                        {s.keepMine}
                      </button>
                      <button type="button" className="edit-btn" onClick={() => onResolveField(id, f.path, 'theirs')}>
                        {s.keepTheirs}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {issues.length > 0 && (
        <ul className="edit-bar-issues">
          {issues.map((issue) => (
            <li key={`${issue.path}:${issue.message}`}>
              <code>{issue.path}</code>: {issue.message}
            </li>
          ))}
        </ul>
      )}

      {saveResults.length > 0 && (
        <ul className="edit-bar-save">
          {saveResults.map((r) => (
            <li key={r.id}>
              <code>{fileOf(r.id)}</code>: {statusLabel(r)}
            </li>
          ))}
        </ul>
      )}

      {unionNote && (
        <p className="edit-bar-note">{unionNote === 'ok' ? s.unionNote : s.unionFailed}</p>
      )}
      {allWritten && !dirty && (
        <p className="edit-bar-note">
          {branch === DEFAULT_BRANCH ? s.deployQueued : s.mergeHint}
        </p>
      )}
    </footer>
  );
}
