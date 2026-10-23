// Record controls (spec-v4-inline-editing E2): the settings / move / delete
// cluster of one record, plus the ghost affordance that creates a new one.
// Rendered only in edit mode; the caller places them inside the record's own
// element, or beside it for cards whose body is a link.
import { useI18n } from '@/i18n/provider';
import { ChevronDownIcon, ChevronUpIcon, GearIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';

type RecordControlsProps = {
  // Human-readable name of the record, carried into every aria-label.
  label: string;
  canUp?: boolean;
  canDown?: boolean;
  // The move pair renders only when the caller provides it — a filtered
  // subset view (home featured grid) has no document-order move to offer.
  onUp?: () => void;
  onDown?: () => void;
  onDelete: () => void;
  onSettings?: () => void;
};

export function RecordControls({
  label,
  canUp,
  canDown,
  onUp,
  onDown,
  onDelete,
  onSettings,
}: RecordControlsProps) {
  const { ui: s } = useI18n();
  return (
    <span className="edit-record-controls">
      {onSettings && (
        <button
          type="button"
          className="edit-record-btn"
          aria-label={`${s.edit.settings} — ${label}`}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={onSettings}
        >
          <GearIcon size={14} />
        </button>
      )}
      {onUp && onDown && (
        <>
          <button
            type="button"
            className="edit-record-btn"
            aria-label={`${s.edit.moveUp} — ${label}`}
            disabled={!canUp}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={onUp}
          >
            <ChevronUpIcon size={14} />
          </button>
          <button
            type="button"
            className="edit-record-btn"
            aria-label={`${s.edit.moveDown} — ${label}`}
            disabled={!canDown}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={onDown}
          >
            <ChevronDownIcon size={14} />
          </button>
        </>
      )}
      <button
        type="button"
        className="edit-record-btn edit-record-remove"
        aria-label={`${s.edit.remove} — ${label}`}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => {
          if (window.confirm(s.edit.removeConfirm)) onDelete();
        }}
      >
        <TrashIcon size={14} />
      </button>
    </span>
  );
}

type AddGhostProps = {
  label: string;
  onClick: () => void;
  // 'inline' sits at the end of a list; 'card' fills a grid cell like the
  // cards beside it, so the new record appears as the next one.
  variant?: 'inline' | 'card';
};

export function AddGhost({ label, onClick, variant = 'inline' }: AddGhostProps) {
  return (
    <button
      type="button"
      className={variant === 'card' ? 'edit-add-ghost edit-add-ghost-card' : 'edit-add-ghost'}
      onClick={onClick}
    >
      <PlusIcon size={16} />
      <span>{label}</span>
    </button>
  );
}
