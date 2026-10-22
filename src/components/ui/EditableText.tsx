// EditableText (spec-v4 §5.3): a text node bound to a text-document path.
// Outside edit mode it renders exactly the element the site renders today —
// same tag, same attributes, text as children, zero DOM/CSS/motion difference.
// In edit mode the same element becomes the inline editor.
//
// Hard rules implemented here:
// - commit on blur only, never per keystroke — Vietnamese IME composition is
//   never truncated because no keystroke ever reaches the draft;
// - Esc cancels the current edit and restores the last committed value;
// - Enter commits + blurs single-line fields, inserts \n in multi-line ones;
// - paste is sanitized to plain text;
// - an empty required value is rejected at commit (validator rule 6) and the
//   field keeps focus;
// - motion keeps transform ownership: this component edits only the text node
//   inside already-animated elements.
import { useContext, useRef, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { EditContext } from '@/hooks/useEdit';

type EditableTextProps = {
  // The element this site renders today — tag or motion component.
  as?: ElementType;
  // Text-document path, e.g. `projects.iot-dws-integration.summary`.
  path: string;
  // Human-readable field name for the accessibility label (§5.3).
  label: string;
  multiline?: boolean;
  children: ReactNode;
  className?: string;
  [prop: string]: unknown;
};

export function EditableText({
  as,
  path,
  label,
  multiline = false,
  children,
  className,
  ...rest
}: EditableTextProps) {
  const edit = useContext(EditContext);
  const ref = useRef<HTMLElement | null>(null);
  const [invalid, setInvalid] = useState(false);
  const Comp = (as ?? 'p') as ElementType;

  if (!edit) {
    return (
      <Comp {...rest} className={className}>
        {children}
      </Comp>
    );
  }

  const dirty = edit.isPathDirty(path);
  const cls = [className, 'editable-text', dirty && 'edit-dirty', invalid && 'edit-invalid']
    .filter(Boolean)
    .join(' ');

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    // innerText normalizes <br>/<div> line boxes into \n — multi-line text
    // is stored as plain text with newlines, rendering unchanged (§5.3).
    const value = (el.innerText ?? '').replace(/\n+$/, '');
    const issues = edit.commit(path, value);
    setInvalid(issues !== null);
    if (issues) el.focus(); // empty-required: the field keeps focus
  };

  return (
    <Comp
      {...rest}
      ref={ref}
      className={cls}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline || undefined}
      aria-label={label}
      data-edit-path={path}
      // Editing text must not follow the card link it sits inside.
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onBlur={commit}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          const el = ref.current;
          if (el && typeof children === 'string') el.innerText = children;
          el?.blur(); // blurring commits the restored value — a no-op change
          setInvalid(false);
        } else if (event.key === 'Enter' && !multiline) {
          event.preventDefault();
          ref.current?.blur(); // blur performs the commit (§5.3)
        }
      }}
      onPaste={(event: React.ClipboardEvent) => {
        event.preventDefault();
        document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
      }}
    >
      {children}
    </Comp>
  );
}
