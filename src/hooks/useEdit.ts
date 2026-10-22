// The edit-mode context (spec-v4 §5.3): the API EditModeShell hands to
// EditableText consumers. Lives on its own so component files stay pure
// components (react/only-export-components).
import { createContext } from 'react';
import type { ContentIssue } from '@/i18n/validate';

// commit/revert return the validator issues when the candidate draft is
// invalid (the edit was NOT applied), or null when it was accepted.
export type EditApi = {
  commit: (path: string, value: string) => ContentIssue[] | null;
  revert: (path: string) => ContentIssue[] | null;
  isPathDirty: (path: string) => boolean;
};

// Without a provider (every visitor request, every page outside edit mode)
// the context is null and EditableText is transparent.
export const EditContext = createContext<EditApi | null>(null);
