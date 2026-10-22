// JsonPanel (spec-v4 §5.4): the structural editor of edit mode. One tab per
// draft document, plus read-only tabs for the two UI dictionaries. The whole
// document is shown as JSON; a valid change applies to the draft immediately
// (the live page re-renders), an invalid one is rejected and reported with
// exact document paths. Templates create records with every required field
// present; delete removes the record from the structure document AND its text
// in both language documents in one validated step, so no orphan is possible
// (§3.4). A conflicted document shows the live master side by side for a
// hand-merge.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { UI } from '@/i18n';
import { DRAFT_DOCS } from '@/i18n/draft';
import type { DraftDocId, DraftStore } from '@/i18n/draft';
import type { ContentIssue } from '@/i18n/validate';

export type PanelTab = DraftDocId | 'ui.vi' | 'ui.en';

const PANEL_TABS: PanelTab[] = [...DRAFT_DOCS.map((d) => d.id), 'ui.vi', 'ui.en'];

// The shape of each document, shown above the editor so the format is
// discoverable without reading the spec (§5.4).
const SHAPES: Record<PanelTab, string> = {
  profile:
    'profile.json — { firstName, lastName, email, githubUrl, linkedinUrl, githubHandle, linkedinHandle, telegramUrl, telegramHandle, philosophy: [{ id }] }',
  skills: 'skills.json — [{ id, skills: [string] }]',
  experience:
    'experience.json — [{ id, location?, variant?: "current" | "gap", logo? }]',
  projects:
    'projects.json — [{ id, category, technologies: [string], featured, sections: [{ id, type: "text" | "diagram" | "metrics" | "code" }] }]',
  'content.vi':
    'content.vi.json — { profile: { name, title, tagline: [{ text, emphasis? }], bio, subtitle, tldr, currentInterests: [string], roles: [string], philosophyQuotes: [{ title, details: [string] }], philosophy: { <id>: { title, description, keywords: [string] } } }, skills: { <id>: { title } }, experience: { <id>: { title, company, duration, responsibilities: [string] } }, projects: { <id>: { title, summary, role, metrics?: [string], sections: { <id>: { title, content } } } } }',
  'content.en':
    'content.en.json — same tree; every field optional, a missing field renders the Vietnamese value',
  'ui.vi': 'locales/vi/ui.json — chrome strings; read-only in edit mode (Phase 4)',
  'ui.en': 'locales/en/ui.json — chrome strings; read-only in edit mode (Phase 4)',
};

type RecordRow = { kind: 'project' | 'experience' | 'skill-group' | 'philosophy' | 'section'; id: string; projectId?: string };

type JsonPanelProps = {
  store: DraftStore;
  tab: PanelTab;
  revision: number;
  conflicts: DraftDocId[];
  onClose: () => void;
  onTab: (tab: PanelTab) => void;
  onChanged: () => void;
  onConflictResolved: (id: DraftDocId) => void;
};

export function JsonPanel({
  store,
  tab,
  revision,
  conflicts,
  onClose,
  onTab,
  onChanged,
  onConflictResolved,
}: JsonPanelProps) {
  const { ui } = useI18n();
  const s = ui.edit.panel;
  const isUi = tab === 'ui.vi' || tab === 'ui.en';
  const conflicted = !isUi && conflicts.includes(tab as DraftDocId);
  const [text, setText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [docIssues, setDocIssues] = useState<ContentIssue[]>([]);
  const [sectionProject, setSectionProject] = useState('');
  const textRef = useRef(text);
  textRef.current = text;

  const documentOf = (target: PanelTab): unknown =>
    target === 'ui.vi' ? UI.vi : target === 'ui.en' ? UI.en : store.dataOf(target);

  // Load the tab's document as pretty JSON. A textarea that already holds the
  // same data is left alone — otherwise the store update our own keystroke
  // caused would re-serialize the text out from under the caret.
  useEffect(() => {
    const canonical = JSON.stringify(documentOf(tab), null, 2);
    try {
      if (JSON.stringify(JSON.parse(textRef.current), null, 2) === canonical) return;
    } catch {
      // textarea currently invalid — reload the last good document
    }
    setText(canonical);
    setParseError(null);
    setDocIssues([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, revision]);

  const applyCandidate = (candidate: unknown) => {
    const rejected = store.setDocument(tab as DraftDocId, candidate);
    setDocIssues(rejected ?? []);
    if (!rejected) onChanged();
  };

  const handleChange = (next: string) => {
    setText(next);
    if (isUi) return;
    let candidate: unknown;
    try {
      candidate = JSON.parse(next);
      setParseError(null);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : String(error));
      return;
    }
    applyCandidate(candidate);
  };

  const runTemplate = (
    kind: 'project' | 'experience' | 'skill-group' | 'philosophy' | 'section',
    options: { projectId?: string } = {},
  ) => {
    const rejected = store.addRecord(kind, options);
    setDocIssues(rejected ?? []);
    if (!rejected) onChanged();
  };

  const runDelete = (kind: RecordRow['kind'], ids: { id: string; projectId?: string }) => {
    if (!window.confirm(s.deleteConfirm)) return;
    const rejected = store.deleteRecord(kind, ids);
    setDocIssues(rejected ?? []);
    if (!rejected) onChanged();
  };

  // The record list mirrors the document currently in the draft — the same
  // data the textarea shows.
  const records = useMemo<RecordRow[]>(() => {
    if (isUi) return [];
    const list = (value: unknown): { id: string }[] =>
      Array.isArray(value) ? (value as { id: string }[]) : [];
    if (tab === 'profile') {
      const data = store.dataOf('profile') as { philosophy?: { id: string }[] };
      return list(data.philosophy).map((r) => ({ kind: 'philosophy', id: r.id }));
    }
    if (tab === 'skills') {
      return list(store.dataOf('skills')).map((r) => ({ kind: 'skill-group', id: r.id }));
    }
    if (tab === 'experience') {
      return list(store.dataOf('experience')).map((r) => ({ kind: 'experience', id: r.id }));
    }
    const projects = list(store.dataOf('projects')) as { id: string; sections?: { id: string }[] }[];
    return projects.flatMap((p) => [
      { kind: 'project' as const, id: p.id },
      ...list(p.sections).map((sec) => ({ kind: 'section' as const, id: sec.id, projectId: p.id })),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, revision, isUi]);

  const projectIds = useMemo(
    () => (Array.isArray(store.dataOf('projects')) ? (store.dataOf('projects') as { id: string }[]).map((p) => p.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revision],
  );

  const applyMerge = () => {
    let candidate: unknown;
    try {
      candidate = JSON.parse(text);
    } catch {
      return; // the draft column must be valid JSON before merging
    }
    const rejected = store.setDocument(tab as DraftDocId, candidate);
    setDocIssues(rejected ?? []);
    if (!rejected) {
      onConflictResolved(tab as DraftDocId);
      onChanged();
    }
  };

  const templateFor: Partial<Record<PanelTab, { label: string; run: () => void }>> = {
    profile: { label: s.addPhilosophy, run: () => runTemplate('philosophy') },
    skills: { label: s.addSkillGroup, run: () => runTemplate('skill-group') },
    experience: { label: s.addExperience, run: () => runTemplate('experience') },
    projects: { label: s.addProject, run: () => runTemplate('project') },
  };

  return (
    <aside className="json-panel" aria-label={s.title}>
      <div className="json-panel-head">
        <strong>{s.title}</strong>
        <button type="button" className="edit-btn" onClick={onClose}>
          {ui.edit.closePanel}
        </button>
      </div>

      <nav className="json-panel-tabs" aria-label={s.title}>
        {PANEL_TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`json-panel-tab${t === tab ? ' is-active' : ''}`}
            aria-selected={t === tab}
            role="tab"
            onClick={() => onTab(t)}
          >
            <code>{t === 'ui.vi' || t === 'ui.en' ? `locales/${t.slice(3)}/ui.json` : DRAFT_DOCS.find((d) => d.id === t)!.file}</code>
            {conflicts.includes(t as DraftDocId) && <span className="json-panel-conflict-flag">●</span>}
          </button>
        ))}
      </nav>

      <pre className="json-panel-shape">{SHAPES[tab]}</pre>

      <div className="json-panel-tools">
        {templateFor[tab] && (
          <button type="button" className="edit-btn" onClick={templateFor[tab]!.run}>
            {templateFor[tab]!.label}
          </button>
        )}
        {(tab === 'content.vi' || tab === 'content.en') && (
          <span className="json-panel-section-add">
            <label>
              {s.addSection}{' '}
              <select value={sectionProject} onChange={(e) => setSectionProject(e.target.value)}>
                <option value="">{s.projectLabel}</option>
                {projectIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="edit-btn"
              disabled={!sectionProject}
              onClick={() => runTemplate('section', { projectId: sectionProject })}
            >
              {s.addSection}
            </button>
          </span>
        )}
        {isUi && <span className="json-panel-readonly">{s.readOnly}</span>}
      </div>

      {records.length > 0 && (
        <div className="json-panel-records">
          {records.map((r) => (
            <span key={`${r.kind}:${r.projectId ?? ''}:${r.id}`} className="json-panel-record">
              <code>{r.projectId ? `${r.projectId} / ${r.id}` : r.id}</code>
              <button
                type="button"
                className="edit-btn"
                onClick={() => runDelete(r.kind, { id: r.id, projectId: r.projectId })}
              >
                {s.deleteRecord}
              </button>
            </span>
          ))}
        </div>
      )}

      {conflicted && (
        <div className="json-panel-merge">
          <label>{s.baseLabel}</label>
          <textarea value={JSON.stringify(store.baseDataOf(tab as DraftDocId), null, 2)} readOnly spellCheck={false} />
          <label>{s.draftLabel}</label>
          <button type="button" className="edit-btn edit-btn-primary" onClick={applyMerge}>
            {s.applyMerge}
          </button>
        </div>
      )}

      <textarea
        className="json-panel-editor"
        value={text}
        readOnly={isUi}
        spellCheck={false}
        aria-label={tab}
        onChange={(e) => handleChange(e.target.value)}
      />

      {(parseError || docIssues.length > 0) && (
        <ul className="json-panel-issues">
          {parseError && <li>{s.parseError}: {parseError}</li>}
          {docIssues.map((issue) => (
            <li key={`${issue.path}:${issue.message}`}>
              <code>{issue.path}</code>: {issue.message}
            </li>
          ))}
        </ul>
      )}
      <span className="json-panel-status" role="status">
        {parseError ? s.parseError : docIssues.length > 0 ? s.invalid : isUi ? s.readOnly : s.valid}
      </span>
    </aside>
  );
}
