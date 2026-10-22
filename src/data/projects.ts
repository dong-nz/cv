// Typed loader for the projects structure document (spec-v4 D2) — see the note
// in profile.ts. Titles, summaries, and section prose are localized text in the
// content dictionaries; ids, categories, roles, technologies, metrics,
// featured, and section {id, type} are language-neutral structure. Project ids
// already appear in URLs and the sitemap, so they are the stable join keys.
import projectsJson from './projects.json';
import type { ProjectStructure } from '../i18n/dict-types';

export const projects = projectsJson as ProjectStructure[];
