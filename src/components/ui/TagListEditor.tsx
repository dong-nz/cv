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
  // Structure document to edit; defaults to the text document of the edited
  // language (E1) — text arrays need no explicit doc.
  doc?: DraftDocId;
  // Array path inside that document: `profile.currentInterests` for a text
  // document, `[2].technologies` for a structure document.
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
  const docId = doc ?? edit.textDoc;

  const write = (next: string[]) =>
    edit.apply(docId, setPath(edit.dataOf(docId), parsePath(arrayPath), next));

  const controls = (i: number) => (
    <>
      <button
        type="button"
        className="edit-item-control"
        aria-label={`${s.edit.moveUp} — ${labelPrefix} ${i + 1}`}
        disabled={i === 0}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => edit.moveItem(docId, arrayPath, i, i - 1)}
      >
        <ChevronUpIcon size={12} />
      </button>
      <button
        type="button"
        className="edit-item-control"
        aria-label={`${s.edit.moveDown} — ${labelPrefix} ${i + 1}`}
        disabled={i === items.length - 1}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => edit.moveItem(docId, arrayPath, i, i + 1)}
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
          doc={docId}
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
        onClick={() => write([...items, s.edit.newTag])}
      >
        <PlusIcon size={12} />
        {addLabel}
      </button>
    </Container>
  );
}
