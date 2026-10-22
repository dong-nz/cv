// Typed loader for the skills structure document (spec-v4 D2) — see the note
// in profile.ts. Group titles are localized text and live in the content
// dictionaries; only language-neutral ids and skill terms stay here.
import skillsJson from './skills.json';
import type { SkillGroupStructure } from '../i18n/dict-types';

export const skillGroups = skillsJson as SkillGroupStructure[];
