// EditModeShell (spec-v4 §5.1, §5.2): the lazy edit-mode wrapper around the
// real site. It authenticates through the protected proxy, fetches the live
// master documents, holds the draft, and re-wraps the tree in an
// I18nProvider override — the seven routes ARE the preview. Visitors never
// mount this component; its code is never in the entry chunk (§7 P3.4).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLanguage } from '@/hooks/useLanguage';
import { I18nProvider } from '@/i18n/provider';
import { UI, resolveContent } from '@/i18n';
import type { ResolvedContent } from '@/i18n';
import {
  DRAFT_DOCS,
  DraftStore,
  TYPES_FILE,
  bundledBase,
  fetchDoc,
  fetchTextFile,
  saveDraft,
  saveIdUnions,
  recordForTitlePath,
} from '@/i18n/draft';
import type { DocBase, DocSaveResult, DraftDocId } from '@/i18n/draft';
import {
  DEFAULT_BRANCH,
  DRAFT_STORAGE,
  clearDraftStorage,
  ensureEditorAuth,
  getEditBranch,
  requestedBranch,
  setEditBranch,
  setEditFlag,
} from '@/i18n/edit-mode';
import { EditContext } from '@/hooks/useEdit';
import type { EditApi } from '@/hooks/useEdit';
import type { ContentIssue } from '@/i18n/validate';
import { EditBar } from './EditBar';

type Phase = 'authenticating' | 'loading' | 'ready' | 'offline';

export default function EditModeShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();

  // The store object itself is stable once created; `store` state exists so
  // render reads it legally, and `revision` is the invalidation counter that
  // re-derives everything the draft feeds to the UI.
  const [store, setStore] = useState<DraftStore | null>(null);
  const typesRef = useRef<{ source: string; sha: string } | null>(null);
  const [phase, setPhase] = useState<Phase>('authenticating');
  const [branch, setBranch] = useState<string>(DEFAULT_BRANCH);
  const [resolved, setResolved] = useState<Record<'vi' | 'en', ResolvedContent> | null>(null);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const [conflicts, setConflicts] = useState<DraftDocId[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);
  const [saveResults, setSaveResults] = useState<DocSaveResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveStopped, setSaveStopped] = useState(false);
  const [unionNote, setUnionNote] = useState<'ok' | 'failed' | null>(null);

  const stripEditQuery = useCallback(() => {
    const params = new URLSearchParams(location.search);
    params.delete('edit');
    const query = params.toString();
    navigate(`${location.pathname}${query ? `?${query}` : ''}${location.hash}`, { replace: true });
  }, [navigate, location.pathname, location.search, location.hash]);

  // Every accepted edit re-derives the resolved content from the draft
  // documents (same join, same fallback rules as the bundled loader) and
  // copies the draft to sessionStorage — an accidental reload restores it
  // (§5.2).
  const refresh = useCallback((active: DraftStore) => {
    const texts = active.draftTexts();
    setResolved(resolveContent(active.draftStructures(), texts.vi, texts.en));
    setRevision((r) => r + 1);
    const isDirty = active.isDirty();
    setDirty(isDirty);
    if (isDirty) sessionStorage.setItem(DRAFT_STORAGE, JSON.stringify(active.snapshot()));
    else clearDraftStorage();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      // `?edit=<branch>` targets that branch; a bare `?edit` resumes the
      // session's branch or the default. An illegal name exits edit mode the
      // same way a failed auth does.
      const requested = requestedBranch(location.search);
      if (requested === null) {
        setEditFlag(false);
        clearDraftStorage();
        stripEditQuery();
        return;
      }
      const branch = requested ?? getEditBranch();
      setBranch(branch);
      const authed = await ensureEditorAuth(branch);
      if (cancelled) return;
      if (!authed) {
        // 401 or a cancelled prompt → normal visitor site, zero affordances.
        setEditFlag(false);
        clearDraftStorage();
        stripEditQuery();
        return;
      }
      setEditFlag(true);
      setEditBranch(branch);
      setPhase('loading');

      // Draft initialization is the live repository files, never the bundle
      // (§5.1); the bundle is only the offline fallback, flagged stale.
      let offline = false;
      let bases: Record<DraftDocId, DocBase> | null = null;
      try {
        bases = {} as Record<DraftDocId, DocBase>;
        for (const meta of DRAFT_DOCS) bases[meta.id] = await fetchDoc(meta.file, branch);
      } catch {
        offline = true;
      }
      if (!bases) bases = bundledBase();

      const created = new DraftStore(bases);

      const stored = sessionStorage.getItem(DRAFT_STORAGE);
      if (stored) {
        try {
          const drifted = created.applySaved(JSON.parse(stored));
          if (drifted.length > 0) setConflicts(drifted);
          setDraftRestored(true);
        } catch {
          clearDraftStorage();
        }
      }

      try {
        const file = await fetchTextFile(TYPES_FILE, branch);
        typesRef.current = { source: file.text, sha: file.sha };
      } catch {
        typesRef.current = null;
      }

      if (cancelled) return;
      setStore(created);
      setPhase(offline ? 'offline' : 'ready');
      refresh(created);
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [refresh, stripEditQuery, location.search]);

  // Mid-edit navigation guard (§5.2).
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // The EditApi v2 surface (spec-v4-inline-editing E4): text writes keep the
  // v1 helpers; everything else — structure fields, tags, records, order,
  // provenance — goes through the generic draft methods. A committed record
  // title re-sluges its draft-only id (E3); a saved record's id never moves.
  const editApi = useMemo<EditApi | null>(
    () =>
      store && (phase === 'ready' || phase === 'offline')
        ? {
            commit: (path, value) => {
              const rejected = store.setValue(lang, path, value);
              setIssues(rejected ?? []);
              if (rejected) return rejected;
              const record = recordForTitlePath(path);
              if (record) store.renameRecord(record.kind, record.ids, value);
              refresh(store);
              return null;
            },
            describeText: (path) => store.describeText(lang, path),
            isTextDirty: (path) => store.isTextDirty(lang, path),
            setText: (path, value) => {
              const rejected = store.setText(lang, path, value);
              setIssues(rejected ?? []);
              if (!rejected) refresh(store);
              return rejected;
            },
            deleteText: (path) => {
              const rejected = store.deleteText(lang, path);
              setIssues(rejected ?? []);
              if (!rejected) refresh(store);
              return rejected;
            },
            moveText: (path, from, to) => {
              const rejected = store.moveText(lang, path, from, to);
              if (rejected) setIssues(rejected);
              else refresh(store);
              return rejected;
            },
            describe: (doc, path) => store.describeField(doc, path),
            apply: (doc, next) => {
              const rejected = store.apply(doc, next);
              setIssues(rejected ?? []);
              if (!rejected) refresh(store);
              return rejected;
            },
            dataOf: (doc) => store.dataOf(doc),
            setStructured: (doc, path, value) => {
              const rejected = store.setStructured(doc, path, value);
              setIssues(rejected ?? []);
              if (!rejected) refresh(store);
              return rejected;
            },
            deleteStructured: (doc, path) => {
              const rejected = store.deleteStructured(doc, path);
              setIssues(rejected ?? []);
              if (!rejected) refresh(store);
              return rejected;
            },
            isPathDirtyIn: (doc, path) => store.changedPaths(doc).includes(path),
            moveItem: (doc, path, from, to) => {
              const rejected = store.moveItem(doc, path, from, to);
              if (rejected) setIssues(rejected);
              else refresh(store);
              return rejected;
            },
            addRecord: (kind, options) => {
              const rejected = store.addRecord(kind, options);
              setIssues(rejected ?? []);
              if (!rejected) refresh(store);
              return rejected;
            },
            deleteRecord: (kind, ids) => {
              const rejected = store.deleteRecord(kind, ids);
              setIssues(rejected ?? []);
              if (!rejected) refresh(store);
              return rejected;
            },
            isCreated: (kind, ids) => store.isCreated(kind, ids),
            renameRecord: (kind, ids, rawId) => {
              const rejected = store.renameRecord(kind, ids, rawId);
              if (!rejected) refresh(store);
              return rejected;
            },
            conflictFields: (doc) => store.conflictFields(doc),
            resolveConflictField: (doc, path, side) => {
              const rejected = store.resolveConflictField(doc, path, side);
              setIssues(rejected ?? []);
              if (!rejected) setConflicts((prev) => prev.filter((x) => x !== doc));
              refresh(store);
              return rejected;
            },
          }
        : null,
    [store, phase, lang, refresh],
  );

  const runSave = useCallback(async () => {
    if (!store || phase === 'offline') return;
    // The full-draft validator runs before any PUT (§5.6); an invalid draft
    // never reaches the repository.
    const invalid = store.validate();
    if (invalid.length > 0) {
      setIssues(invalid);
      return;
    }
    setSaving(true);
    setSaveStopped(false);
    setUnionNote(null);
    setSaveResults([]);
    const { results, stoppedEarly } = await saveDraft(store, (result) => {
      setSaveResults((prev) => [...prev, result]);
    }, branch);
    setSaveStopped(stoppedEarly);
    const written = new Set(results.filter((r) => r.status === 'written').map((r) => r.id));
    const conflicted = results.filter((r) => r.status === 'conflict').map((r) => r.id);
    setConflicts((prev) => [...new Set([...prev.filter((id) => !written.has(id)), ...conflicted])]);

    // The third leg of §3.1: append ids whose documents landed to their unions.
    const types = typesRef.current;
    if (types) {
      const union = await saveIdUnions(store, types, branch);
      if (union) {
        if (union.failed !== undefined) setUnionNote('failed');
        else {
          typesRef.current = { source: union.source!, sha: union.sha! };
          setUnionNote('ok');
        }
      }
    }
    setSaving(false);
    refresh(store);
  }, [store, phase, refresh, branch]);

  const resolveRebase = useCallback(
    async (id: DraftDocId) => {
      if (!store) return;
      const meta = DRAFT_DOCS.find((d) => d.id === id)!;
      try {
        store.resetBase(id, await fetchDoc(meta.file, branch));
      } catch {
        // unreachable proxy — the conflict UI stays, take-theirs still works
      }
      const rejected = store.rebase(id);
      setIssues(rejected ?? []);
      if (!rejected) setConflicts((prev) => prev.filter((x) => x !== id));
      refresh(store);
    },
    [store, refresh, branch],
  );

  const resolveTakeTheirs = useCallback(
    (id: DraftDocId) => {
      store?.discardDocument(id);
      setConflicts((prev) => prev.filter((x) => x !== id));
      if (store) refresh(store);
    },
    [store, refresh],
  );

  // One field, one side (E8): refresh that document's base first so the
  // branch values shown are current, then keep 'mine' or 'theirs' at that
  // path and retry the rebase. The document leaves the conflict list only
  // when the rebase completes with no remaining clash.
  const resolveConflictField = useCallback(
    async (id: DraftDocId, path: string, side: 'mine' | 'theirs') => {
      if (!store) return;
      const meta = DRAFT_DOCS.find((d) => d.id === id)!;
      try {
        store.resetBase(id, await fetchDoc(meta.file, branch));
      } catch {
        // unreachable proxy — the field UI stays, take-theirs still works
      }
      const rejected = store.resolveConflictField(id, path, side);
      setIssues(rejected ?? []);
      if (!rejected) setConflicts((prev) => prev.filter((x) => x !== id));
      refresh(store);
    },
    [store, refresh, branch],
  );


  const discardDoc = useCallback(
    (id: DraftDocId) => {
      store?.discardDocument(id);
      setConflicts((prev) => prev.filter((x) => x !== id));
      if (store) refresh(store);
    },
    [store, refresh],
  );

  const revertField = useCallback(
    (id: DraftDocId, path: string) => {
      if (!store) return;
      const rejected = store.revertIn(id, path);
      setIssues(rejected ?? []);
      if (!rejected) refresh(store);
    },
    [store, refresh],
  );

  const exit = useCallback(() => {
    setEditFlag(false);
    clearDraftStorage();
    stripEditQuery();
  }, [stripEditQuery]);


  // `revision` is the draft's invalidation counter — the store mutates in
  // place, so it is the only signal that a recomputation is due.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changedDocs = useMemo(() => store?.changedDocs() ?? [], [store, revision]);

  const override = resolved ? { ui: UI[lang], content: resolved[lang] } : undefined;

  return (
    <I18nProvider override={override}>
      <EditContext.Provider value={editApi}>
        {children}
        {store && (
          <>
            <EditBar
              offline={phase === 'offline'}
              dirty={dirty}
              changedDocs={changedDocs}
              conflicts={conflicts}
              issues={issues}
              saving={saving}
              saveStopped={saveStopped}
              saveResults={saveResults}
              unionNote={unionNote}
              draftRestored={draftRestored}
              branch={branch}
              getConflictFields={(id) => store.conflictFields(id)}
              onSave={() => void runSave()}
              onExit={exit}
              onRebase={(id) => void resolveRebase(id)}
              onTakeTheirs={resolveTakeTheirs}
              onResolveField={(id, path, side) => void resolveConflictField(id, path, side)}
              onDiscardDoc={discardDoc}
              onRevertPath={revertField}
            />
          </>
        )}
      </EditContext.Provider>
    </I18nProvider>
  );
}
