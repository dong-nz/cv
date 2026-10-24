// RecordSettings (spec-v4-inline-editing E2): the structure-settings dialog of
// one record. Inline editing covers text and tags; the fields that shape a
// record's structure — featured, section list, timeline variant, logo — live
// here, in a small form that writes through the same EditApi.
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useEdit } from '@/hooks/useEdit';
import { useI18n } from '@/i18n/provider';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { ProjectStructure, ExperienceStructure } from '@/i18n/dict-types';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';

type RecordSettingsProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function RecordSettings({ title, onClose, children }: RecordSettingsProps) {
  const { ui: s } = useI18n();
  const ref = useRef<HTMLDivElement | null>(null);
  useClickOutside(ref, onClose);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="record-settings" ref={ref} role="dialog" aria-label={title}>
      <div className="record-settings-header">
        <span className="record-settings-title">{title}</span>
        <button
          type="button"
          className="record-settings-close"
          aria-label={s.edit.closeSettings}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="record-settings-body">{children}</div>
    </div>
  );
}

// A project's structure: featured visibility, its category, and the section
// list — order, type, delete, add (spec-v4-inline-editing §2.4).
export function ProjectSettingsPanel({ project }: { project: ProjectStructure }) {
  const edit = useEdit();
  const { ui: s } = useI18n();
  if (!edit) return null;
  const projects = edit.dataOf('projects') as ProjectStructure[];
  const index = projects.findIndex((p) => p.id === project.id);
  if (index < 0) return null;
  const sections = project.sections;
  const typeLabels = s.edit.sectionTypes;
  // The category vocabulary is the label map the UI documents carry — the same
  // map the badge renders from, and the one rule 7 checks a project against
  // (spec-v5 §5.4). The current value is kept in the list even when its label
  // is missing, so opening this panel never rewrites a project silently.
  const categoryLabels = new Map<string, string>(Object.entries(s.projects.categories));
  const categoryIds = [...new Set([...categoryLabels.keys(), project.category])];

  return (
    <>
      <label className="record-settings-field">
        <input
          type="checkbox"
          checked={project.featured === true}
          onChange={(event) => edit.setStructured('projects', `[${index}].featured`, event.target.checked)}
        />
        {s.edit.featured}
      </label>

      <label className="record-settings-field">
        <span>{s.edit.category}</span>
        <select
          aria-label={`${s.edit.category} — ${project.id}`}
          value={project.category}
          onChange={(event) => edit.setStructured('projects', `[${index}].category`, event.target.value)}
        >
          {categoryIds.map((id) => (
            <option key={id} value={id}>
              {categoryLabels.get(id) ?? id}
            </option>
          ))}
        </select>
      </label>

      <div className="record-settings-group-title">{s.edit.sections}</div>
      <ul className="record-settings-list">
        {sections.map((section, i) => (
          <li key={section.id} className="record-settings-row">
            <code className="record-settings-id">{section.id}</code>
            <select
              aria-label={`${s.edit.sectionType} — ${section.id}`}
              value={section.type}
              onChange={(event) =>
                edit.setStructured('projects', `[${index}].sections[${i}].type`, event.target.value)
              }
            >
              <option value="text">{typeLabels.text}</option>
              <option value="diagram">{typeLabels.diagram}</option>
              <option value="metrics">{typeLabels.metrics}</option>
              <option value="code">{typeLabels.code}</option>
            </select>
            <button
              type="button"
              className="edit-record-btn"
              aria-label={`${s.edit.moveUp} — ${section.id}`}
              disabled={i === 0}
              onClick={() => edit.moveItem('projects', `[${index}].sections`, i, i - 1)}
            >
              <ChevronUpIcon size={14} />
            </button>
            <button
              type="button"
              className="edit-record-btn"
              aria-label={`${s.edit.moveDown} — ${section.id}`}
              disabled={i === sections.length - 1}
              onClick={() => edit.moveItem('projects', `[${index}].sections`, i, i + 1)}
            >
              <ChevronDownIcon size={14} />
            </button>
            <button
              type="button"
              className="edit-record-btn edit-record-remove"
              aria-label={`${s.edit.remove} — ${section.id}`}
              onClick={() => {
                if (window.confirm(s.edit.removeConfirm)) {
                  edit.deleteRecord('section', { id: section.id, projectId: project.id });
                }
              }}
            >
              <TrashIcon size={14} />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="edit-add-inline"
        onClick={() => edit.addRecord('section', { projectId: project.id })}
      >
        <PlusIcon size={12} />
        {s.edit.addSection}
      </button>
    </>
  );
}

// A timeline entry's decoration and metadata: the current/gap variant marker,
// location, logo path — all structure fields of the experience document.
export function ExperienceSettingsPanel({ entry }: { entry: ExperienceStructure }) {
  const edit = useEdit();
  const { ui: s } = useI18n();
  if (!edit) return null;
  const experiences = edit.dataOf('experience') as ExperienceStructure[];
  const index = experiences.findIndex((e) => e.id === entry.id);
  if (index < 0) return null;

  const writeOrDrop = (field: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed === '') {
      edit.deleteStructured('experience', `[${index}].${field}`);
    } else {
      edit.setStructured('experience', `[${index}].${field}`, trimmed);
    }
  };

  return (
    <>
      <label className="record-settings-field">
        <span>{s.edit.variant}</span>
        <select
          value={entry.variant ?? ''}
          onChange={(event) => {
            const next = event.target.value;
            if (next === '') edit.deleteStructured('experience', `[${index}].variant`);
            else edit.setStructured('experience', `[${index}].variant`, next);
          }}
        >
          <option value="">{s.edit.variantNone}</option>
          <option value="current">{s.edit.variantCurrent}</option>
          <option value="gap">{s.edit.variantGap}</option>
        </select>
      </label>
      <label className="record-settings-field">
        <span>{s.edit.fields.location}</span>
        <input
          type="text"
          defaultValue={entry.location ?? ''}
          key={`location-${entry.location ?? ''}-${entry.variant ?? ''}`}
          onBlur={(event) => writeOrDrop('location', event.target.value)}
        />
      </label>
      <label className="record-settings-field">
        <span>{s.edit.fields.logo}</span>
        <input
          type="text"
          defaultValue={entry.logo ?? ''}
          key={`logo-${entry.logo ?? ''}-${entry.variant ?? ''}`}
          onBlur={(event) => writeOrDrop('logo', event.target.value)}
        />
      </label>
    </>
  );
}
