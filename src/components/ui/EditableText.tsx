// EditableText (spec-v4 §5.3, spec-v4-inline-editing E6/E7): a text node
// bound to a document path. Outside edit mode it renders exactly the element
// the site renders today — same tag, same attributes, text as children, zero
// DOM/CSS/motion difference. In edit mode the element stays text: editing is
// entered through the pencil on its corner, never by clicking the text, so a
// reader can still select and copy in edit mode.
//
// Hard rules implemented here:
// - the pencil starts editing; the element is contentEditable only while
//   editing (E6);
// - while editing, the element carries a provenance chip — the file and path
//   the value lives in (E7), clickable to copy; the pencil's title names the
//   same target for hover;
// - commit on blur only, never per keystroke — Vietnamese IME composition is
//   never truncated because no keystroke ever reaches the draft;
// - Esc cancels the current edit and restores the last committed value;
// - Enter commits + blurs single-line fields, inserts \n in multi-line ones;
// - paste is sanitized to plain text;
// - an empty required value is rejected at commit (validator rule 6), the
//   reason is shown on the field, and the field keeps focus;
// - a structure-document path (doc prop) writes through the same draft store —
//   text and structure are one editing surface for the user (E1/E4);
// - motion keeps transform ownership: this component edits only the text node
//   inside already-animated elements.
import { useContext, useEffect, useRef, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { EditContext } from '@/hooks/useEdit';
import type { EditApi } from '@/hooks/useEdit';
import { useI18n } from '@/i18n/provider';
import { parsePath, setPath } from '@/i18n/draft';
import type { DraftDocId } from '@/i18n/draft';
import { PencilIcon } from '@/components/ui/icons';

type EditableTextProps = {
  // The element this site renders today — tag or motion component.
  as?: ElementType;
  // Path inside the target document, e.g. `projects.iot-dws-integration.summary`.
  path: string;
  // Target document; defaults to the text document of the edited language (E1).
  doc?: DraftDocId;
  // Human-readable field name for the accessibility label (§5.3).
  label: string;
  multiline?: boolean;
  // Extra non-text controls rendered inside the element as chrome islands —
  // the per-item buttons a tag list attaches (spec-v4-inline-editing E5).
  fieldControls?: ReactNode;
  children: ReactNode;
  className?: string;
  [prop: string]: unknown;
};

export function EditableText({
  as,
  path,
  doc,
  label,
  multiline = false,
  fieldControls,
  children,
  className,
  ...rest
}: EditableTextProps) {
  const edit = useContext(EditContext);
  const Comp = (as ?? 'p') as ElementType;

  // Without a provider the element is byte-identical to the plain one.
  if (!edit) {
    return (
      <Comp {...rest} className={className}>
        {children}
      </Comp>
    );
  }

  return (
    <EditableField
      edit={edit}
      Comp={Comp}
      docId={doc ?? edit.textDoc}
      path={path}
      label={label}
      multiline={multiline}
      fieldControls={fieldControls}
      className={className}
      rest={rest}
    >
      {children}
    </EditableField>
  );
}

// The chrome islands EditableText renders inside the element — excluded from
// the value and from a cancel-restore, never from the element's own text.
const CHROME_CLASSES = ['edit-pencil', 'edit-provenance', 'edit-field-error', 'edit-field-controls'];
const isChrome = (node: Node): boolean =>
  node.nodeType === Node.ELEMENT_NODE &&
  CHROME_CLASSES.some((c) => (node as HTMLElement).classList.contains(c));

// Read only the element's own text: chrome subtrees are rejected, and <br>
// plus block boxes become \n the way innerText would (§5.3 — multi-line text
// is stored as plain text with newlines, rendering unchanged).
function readElementText(el: HTMLElement): string {
  const walker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => (isChrome(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    },
  );
  let value = '';
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      value += node.textContent ?? '';
      continue;
    }
    const tag = (node as HTMLElement).tagName;
    if (tag === 'BR') {
      value += '\n';
    } else if ((tag === 'DIV' || tag === 'P') && value && !value.endsWith('\n')) {
      value += '\n';
    }
  }
  return value.replace(/\n+$/, '');
}

// The editing element — all hooks live here so the provider decision above
// stays a plain branch (react/rules-of-hooks).
function EditableField({
  edit,
  Comp,
  docId,
  path,
  label,
  multiline,
  fieldControls,
  className,
  rest,
  children,
}: {
  edit: EditApi;
  Comp: ElementType;
  docId: DraftDocId;
  path: string;
  label: string;
  multiline: boolean;
  fieldControls?: ReactNode;
  className?: string;
  rest: Record<string, unknown>;
  children: ReactNode;
}) {
  const { ui: s } = useI18n();
  const ref = useRef<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const info = edit.describe(docId, path);
  const pointer = `${info.doc} → ${info.pointer}`;
  const dirty = edit.isPathDirtyIn(docId, path);
  const cls = [className, 'editable-text', dirty && 'edit-dirty', error && 'edit-invalid']
    .filter(Boolean)
    .join(' ');

  // Entering edit mode: focus the element and put the caret at the end of
  // its text — the browser clamps the caret out of a chrome island.
  useEffect(() => {
    if (!editing) return;
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [editing]);

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    const value = readElementText(el);
    if (value.trim() === '') {
      setError(s.edit.emptyRequired);
      el.focus(); // empty-required: the field keeps focus
      return;
    }
    const issues =
      docId === edit.textDoc
        ? edit.commit(path, value)
        : edit.apply(docId, setPath(edit.dataOf(docId), parsePath(path), value));
    if (issues) {
      setError(issues[0]?.message ?? 'invalid');
      el.focus();
      return;
    }
    setError(null);
    setEditing(false);
  };

  // Esc: drop everything the user typed, keep the chrome, restore the last
  // committed text. React owns no text-node diff here (the children string is
  // unchanged), so the restored node survives the next render.
  const cancel = () => {
    const el = ref.current;
    if (el && typeof children === 'string') {
      for (const node of Array.from(el.childNodes)) {
        if (!isChrome(node)) el.removeChild(node);
      }
      const pencil = el.querySelector('.edit-pencil');
      el.insertBefore(document.createTextNode(children), pencil ?? null);
    }
    setEditing(false);
    setError(null);
  };

  const copyPath = () => {
    void navigator.clipboard.writeText(`${info.repoPath} → ${info.pointer}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Comp
      {...rest}
      ref={ref}
      className={cls}
      contentEditable={editing || undefined}
      suppressContentEditableWarning
      role={editing ? 'textbox' : undefined}
      aria-multiline={editing && multiline ? true : undefined}
      aria-label={editing ? label : undefined}
      data-edit-path={path}
      // Editing text must not follow the card link it sits inside; in idle
      // edit mode the click is inert, text stays selectable.
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onBlur={editing ? commit : undefined}
      onKeyDown={
        editing
          ? (event: React.KeyboardEvent) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                cancel();
              } else if (event.key === 'Enter' && !multiline) {
                event.preventDefault();
                ref.current?.blur(); // blur performs the commit (§5.3)
              }
            }
          : undefined
      }
      onPaste={
        editing
          ? (event: React.ClipboardEvent) => {
              event.preventDefault();
              document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
            }
          : undefined
      }
    >
      {children}
      {fieldControls && (
        <span className="edit-field-controls" contentEditable={false}>
          {fieldControls}
        </span>
      )}
      {/* Editing chrome sits inside the element but outside the editable text
          (contentEditable={false}), so it never reaches the value. mousedown
          is prevented to keep the caret out of the chrome. */}
      <button
        type="button"
        className="edit-pencil"
        contentEditable={false}
        aria-label={`${s.edit.editField} — ${label}`}
        title={pointer}
        onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
        onClick={() => setEditing(true)}
      >
        <PencilIcon size={14} />
      </button>
      {editing && (
        <button
          type="button"
          className="edit-provenance"
          contentEditable={false}
          title={s.edit.copyPath}
          onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
          onClick={copyPath}
        >
          {copied ? s.edit.pathCopied : pointer}
        </button>
      )}
      {error && (
        <span className="edit-field-error" contentEditable={false}>
          {error}
        </span>
      )}
    </Comp>
  );
}
