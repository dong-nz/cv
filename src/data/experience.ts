// Typed loader for the experience structure document (spec-v4 D2) — see the
// note in profile.ts. Titles, company, duration, and responsibilities are
// localized text in the content dictionaries (row 19); location, variant, and
// logo are language-neutral structure.
import experienceJson from './experience.json';
import type { ExperienceStructure } from '../i18n/dict-types';

export const experiences = experienceJson as ExperienceStructure[];
