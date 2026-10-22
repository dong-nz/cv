// I18nProvider / useI18n (spec-v4 §3.5, D3): content and UI strings flow
// through one context whose default value is the build-time documents.
// Phase 3 overrides this value with draft state; the real components then
// render the draft — preview is the production app.
import { createContext, useContext } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { CONTENT, UI } from './index';
import type { ResolvedContent } from './index';
import type { UIDict } from './dict-types';
import type { Language } from '../types/index';

export type ResolvedI18n = { ui: UIDict; content: ResolvedContent };

// Module-level constants: the context value for a given language is the same
// object on every render. A value rebuilt per render would re-render every
// consumer in the tree on any provider state change.
const DEFAULTS: Record<Language, ResolvedI18n> = {
  en: { ui: UI.en, content: CONTENT.en },
  vi: { ui: UI.vi, content: CONTENT.vi },
};

const I18nContext = createContext<ResolvedI18n | null>(null);

export function I18nProvider({
  children,
  override,
}: {
  children: React.ReactNode;
  override?: ResolvedI18n;
}) {
  const { lang } = useLanguage();
  return (
    <I18nContext.Provider value={override ?? DEFAULTS[lang]}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): ResolvedI18n {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
