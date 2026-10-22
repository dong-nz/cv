// CLI over the shared validator (spec-v4 §3.6): the CI build gate and, from
// Phase 3 on, the save gate. A malformed content document fails here with
// exact document paths, so the last good deploy stays live.
import { experiences } from '../src/data/experience';
import { profile } from '../src/data/profile';
import { projects } from '../src/data/projects';
import { skillGroups } from '../src/data/skills';
import contentEnJson from '../src/i18n/locales/en/content.json';
import contentViJson from '../src/i18n/locales/vi/content.json';
import type { ContentEn, ContentVi } from '../src/i18n/dict-types';
import { collectContentIssues } from '../src/i18n/validate';

const contentVi: ContentVi = contentViJson;
const contentEn: ContentEn = contentEnJson;

const issues = collectContentIssues(
  { profile, skills: skillGroups, experience: experiences, projects },
  contentVi,
  contentEn,
);

if (issues.length > 0) {
  console.error(`content validation failed (${issues.length} issue(s)):`);
  for (const issue of issues) {
    console.error(`  ${issue.path}: ${issue.message}`);
  }
  process.exit(1);
}
console.log('content documents valid');
