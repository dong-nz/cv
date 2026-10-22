// Typed loader for the profile structure document (spec-v4 D2). Localized text
// — including interests, roles, and philosophy keywords/quotes (row 19) —
// lives in src/i18n/locales and is joined in src/i18n/index.ts; this module
// exports the language-neutral structure under today's name, for the i18n
// loader and for scripts/generate-sitemap.ts.
// JSON imports widen string literals to `string`, so id membership is guarded
// by the text dictionaries (tsc) and by src/i18n/validate.ts (cross-document
// coverage) — the cast still fails on gross shape errors.
import profileJson from './profile.json';
import type { ProfileStructure } from '../i18n/dict-types';

export const profile = profileJson as ProfileStructure;
