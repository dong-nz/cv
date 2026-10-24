// TagListEditor (spec-v4-inline-editing E5): an array field rendered with the
// site's own container and tag elements. Outside edit mode the markup is
// exactly what the section renders today — same container, same tag elements,
// zero chrome. In edit mode every item carries move/delete controls inside its
// own element (EditableText fieldControls islands) and a ghost add button
// follows the list. Text arrays (interests, keywords, metrics, tagline tags)
// and structure arrays (technologies, skills) are the same component — one
// editing surface (E1).
import type { ElementType } from 'react';
import { useEdit } from '@/hooks/useEdit';
import { useI18n } from '@/i18n/provider';
import { EditableText } from '@/components/ui/EditableText';
import { parsePath, setPath } from '@/i18n/draft';
import type { DraftDocId } from '@/i18n/draft';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';

type TagListEditorProps = {
  // Structure document to edit. Without it the array is a text array: the
  // path carries its entity (`profile.currentInterests`,
  // `projects.lazada.metrics`) and the store resolves the entity document of
  // the language being edited (spec-v4-data-organization §3).
  doc?: DraftDocId;
  // Array path inside the target document: `3.technologies` for a structure
  // document (document-relative), the entity-prefixed path for a text one.
  arrayPath: string;
  items: string[];
  // The container and item elements the site renders today.
  containerAs: ElementType;
  containerClassName: string;
  as: ElementType;
  itemClassName?: string;
  // Tag's accent variant, passed through when the site's tag component takes it.
  accent?: boolean;
  // Human-readable names for the accessibility labels and the add button.
  labelPrefix: string;
  addLabel: string;
};

export function TagListEditor({
  doc,
  arrayPath,
  items,
  containerAs,
  containerClassName,
  as,
  itemClassName,
  accent,
  labelPrefix,
  addLabel,
}: TagListEditorProps) {
  const edit = useEdit();
  const { ui: s } = useI18n();
  const Container = containerAs;
  const Comp = as;

  if (!edit) {
    return (
      <Container className={containerClassName}>
        {items.map((item, i) => (
          <Comp key={i} {...(accent ? { accent: true } : {})} className={itemClassName}>
            {item}
          </Comp>
        ))}
      </Container>
    );
  }

  // Whole-array write — one call for a text or a structure document (E1).
  const write = (next: string[]) =>
    doc
      ? edit.apply(doc, setPath(edit.dataOf(doc), parsePath(arrayPath), next))
      : edit.setText(arrayPath, next);

  const controls = (i: number) => (
    <>
      <button
        type="button"
        className="edit-item-control"
        aria-label={`${s.edit.moveUp} — ${labelPrefix} ${i + 1}`}
        disabled={i === 0}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => (doc ? edit.moveItem(doc, arrayPath, i, i - 1) : edit.moveText(arrayPath, i, i - 1))}
      >
        <ChevronUpIcon size={12} />
      </button>
      <button
        type="button"
        className="edit-item-control"
        aria-label={`${s.edit.moveDown} — ${labelPrefix} ${i + 1}`}
        disabled={i === items.length - 1}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => (doc ? edit.moveItem(doc, arrayPath, i, i + 1) : edit.moveText(arrayPath, i, i + 1))}
      >
        <ChevronDownIcon size={12} />
      </button>
      <button
        type="button"
        className="edit-item-control edit-item-remove"
        aria-label={`${s.edit.remove} — ${labelPrefix} ${i + 1}`}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => {
          if (window.confirm(s.edit.removeConfirm)) write(items.filter((_, j) => j !== i));
        }}
      >
        <TrashIcon size={12} />
      </button>
    </>
  );

  return (
    <Container className={containerClassName}>
      {items.map((item, i) => (
        <EditableText
          key={i}
          as={Comp}
          doc={doc}
          path={`${arrayPath}[${i}]`}
          label={`${labelPrefix} ${i + 1}`}
          className={itemClassName}
          {...(accent ? { accent: true } : {})}
          fieldControls={controls(i)}
        >
          {item}
        </EditableText>
      ))}
      <button
        type="button"
        className="edit-add-inline"
        // The project card body is a link (Projects.tsx, ProjectsListPage.tsx).
        // A click here must not reach that anchor — otherwise adding a tag
        // navigates to the project instead. Same guard the item controls use
        // (mousedown stopped) plus the click guard EditableText uses.
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          write([...items, s.edit.newTag]);
        }}
      >
        <PlusIcon size={12} />
        {addLabel}
      </button>
    </Container>
  );
}
